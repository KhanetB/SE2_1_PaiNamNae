/**
 * useGoogleMap — Google Maps init, reverse geocoding, place name lookup, map update
 * ใช้กับ myTrip, myRoute, findTrip
 */
import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

export function useGoogleMap(mapContainerRef) {
    const config = useRuntimeConfig()
    const mapReady = ref(false)

    let gmap = null
    let geocoder = null
    let placesService = null
    let activePolyline = null
    let startMarker = null
    let endMarker = null
    let stopMarkers = []

    const GMAPS_CB = '__gmapsReady__'

    function initializeMap() {
        if (!mapContainerRef.value || gmap) return
        gmap = new google.maps.Map(mapContainerRef.value, {
            center: { lat: 13.7563, lng: 100.5018 },
            zoom: 6,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
        })
        geocoder = new google.maps.Geocoder()
        placesService = new google.maps.places.PlacesService(gmap)
        mapReady.value = true
    }

    function waitMapReady() {
        return new Promise((resolve) => {
            if (mapReady.value) return resolve(true)
            const t = setInterval(() => {
                if (mapReady.value) { clearInterval(t); resolve(true) }
            }, 50)
        })
    }

    /** Load Google Maps script + run callback when ready */
    function loadGoogleMaps(onReady) {
        if (window.google?.maps) {
            initializeMap()
            onReady()
            return
        }
        window[GMAPS_CB] = () => {
            try { delete window[GMAPS_CB] } catch { }
            initializeMap()
            onReady()
        }
    }

    function reverseGeocode(lat, lng) {
        return new Promise((resolve) => {
            if (!geocoder) return resolve(null)
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status !== 'OK' || !results?.length) return resolve(null)
                resolve(results[0])
            })
        })
    }

    function getPlaceName(placeId) {
        return new Promise((resolve) => {
            if (!placesService || !placeId) return resolve(null)
            placesService.getDetails({ placeId, fields: ['name'] }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place?.name)
                    resolve(place.name)
                else resolve(null)
            })
        })
    }

    async function extractNameParts(geocodeResult) {
        if (!geocodeResult) return { name: null, area: null }
        const comps = geocodeResult.address_components || []
        const byType = (t) => comps.find((c) => c.types.includes(t))?.long_name
        const byTypeShort = (t) => comps.find((c) => c.types.includes(t))?.short_name
        const types = geocodeResult.types || []
        const isPoi = types.includes('point_of_interest') || types.includes('establishment') || types.includes('premise')
        let name = null
        if (isPoi && geocodeResult.place_id) {
            const poiName = await getPlaceName(geocodeResult.place_id)
            if (poiName) name = poiName
        }
        if (!name) {
            const streetNumber = byType('street_number')
            const route = byType('route')
            name = streetNumber && route ? `${streetNumber} ${route}` : route || geocodeResult.formatted_address || null
        }
        const sublocality = byType('sublocality') || byType('neighborhood') || byType('locality') || byType('administrative_area_level_2')
        const province = byType('administrative_area_level_1') || byTypeShort('administrative_area_level_1')
        let area = null
        if (sublocality && province) area = `${sublocality}, ${province}`
        else if (province) area = province
        if (name) name = name.replace(/,?\s*(Thailand|ไทย)\s*$/i, '')
        return { name, area }
    }

    async function updateMap(trip) {
        if (!trip) return
        await waitMapReady()
        if (!gmap) return

        // Cleanup
        activePolyline?.setMap(null); activePolyline = null
        startMarker?.setMap(null); startMarker = null
        endMarker?.setMap(null); endMarker = null
        stopMarkers.forEach((m) => m.setMap(null)); stopMarkers = []

        const start = { lat: Number(trip.coords[0][0]), lng: Number(trip.coords[0][1]) }
        const end = { lat: Number(trip.coords[1][0]), lng: Number(trip.coords[1][1]) }

        startMarker = new google.maps.Marker({ position: start, map: gmap, label: 'A' })
        endMarker = new google.maps.Marker({ position: end, map: gmap, label: 'B' })

        if (Array.isArray(trip.stopsCoords) && trip.stopsCoords.length) {
            stopMarkers = trip.stopsCoords.map((s, idx) =>
                new google.maps.Marker({
                    position: { lat: s.lat, lng: s.lng },
                    map: gmap,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    title: s.name || s.address || `จุดแวะ ${idx + 1}`,
                })
            )
        }

        const bounds = new google.maps.LatLngBounds()
        if (trip.polyline && google.maps.geometry?.encoding) {
            const path = google.maps.geometry.encoding.decodePath(trip.polyline)
            activePolyline = new google.maps.Polyline({
                path, map: gmap,
                strokeColor: '#2563eb', strokeOpacity: 0.9, strokeWeight: 5,
            })
            path.forEach((p) => bounds.extend(p))
        } else {
            bounds.extend(start)
            bounds.extend(end)
        }
        trip.stopsCoords?.forEach((s) => bounds.extend(new google.maps.LatLng(s.lat, s.lng)))
        gmap.fitBounds(bounds)
    }

    return {
        mapReady,
        loadGoogleMaps,
        initializeMap,
        waitMapReady,
        reverseGeocode,
        extractNameParts,
        updateMap,
        gmapsCbKey: GMAPS_CB,
        googleMapsScriptSrc: () =>
            `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsApiKey}&libraries=places,geometry&callback=${GMAPS_CB}`,
    }
}
