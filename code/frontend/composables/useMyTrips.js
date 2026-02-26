/**
 * useMyTrips — fetch, map, and manage booking trips for passengers
 */
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { useToast } from '~/composables/useToast'
import { useAuth } from '~/composables/useAuth'
import { cleanAddr, formatDistance, formatDuration } from '~/utils/format'
import { within7Days } from '~/utils/date'

dayjs.locale('th')
dayjs.extend(buddhistEra)

export function useMyTrips() {
    const { token } = useAuth()
    const { toast } = useToast()
    const { $api } = useNuxtApp()
    const config = useRuntimeConfig()

    const allTrips = ref([])
    const isLoading = ref(false)
    const activeTab = ref('pending')

    const tabs = [
        { status: 'pending', label: 'รอดำเนินการ' },
        { status: 'confirmed', label: 'ยืนยันแล้ว' },
        { status: 'rejected', label: 'ปฏิเสธ' },
        { status: 'cancelled', label: 'ยกเลิก' },
        { status: 'mytrip', label: 'เส้นทางของฉัน' },
        { status: 'all', label: 'ทั้งหมด' },
    ]

    const filteredTrips = computed(() => {
        if (activeTab.value === 'all') return allTrips.value
        return allTrips.value.filter((t) => t.status === activeTab.value)
    })

    const getTripCount = (status) => {
        if (status === 'all') return allTrips.value.length
        return allTrips.value.filter((t) => t.status === status).length
    }

    function mapBooking(b) {
        const driverData = {
            name: `${b.route.driver.firstName} ${b.route.driver.lastName}`.trim(),
            image: b.route.driver.profilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(b.route.driver.firstName || 'U')}&background=random&size=64`,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 50) + 5,
        }
        const carDetails = []
        if (b.route.vehicle) {
            carDetails.push(`${b.route.vehicle.vehicleModel} (${b.route.vehicle.vehicleType})`)
            if (Array.isArray(b.route.vehicle.amenities) && b.route.vehicle.amenities.length)
                carDetails.push(...b.route.vehicle.amenities)
        } else {
            carDetails.push('ไม่มีข้อมูลรถ')
        }
        const start = b.route.startLocation
        const end = b.route.endLocation
        const wp = b.route.waypoints || {}
        const baseList = (Array.isArray(wp.used) && wp.used.length ? wp.used
            : Array.isArray(wp.requested) ? wp.requested : []) || []
        const orderedList = Array.isArray(wp.optimizedOrder) && wp.optimizedOrder.length === baseList.length
            ? wp.optimizedOrder.map((i) => baseList[i]) : baseList
        const stops = orderedList.map((p) => {
            const name = p?.name || ''
            const address = cleanAddr(p?.address || '')
            const fallback = p?.lat != null && p?.lng != null ? `(${Number(p.lat).toFixed(6)}, ${Number(p.lng).toFixed(6)})` : ''
            const title = name || fallback
            return address ? `${title} — ${address}` : title
        }).filter(Boolean)
        const stopsCoords = orderedList.map((p) =>
            p && typeof p.lat === 'number' && typeof p.lng === 'number'
                ? { lat: Number(p.lat), lng: Number(p.lng), name: p.name || '', address: p.address || '' }
                : null
        ).filter(Boolean)
        return {
            hasReview: false, reviewId: '',
            id: b.id,
            status: String(b.status || '').toLowerCase(),
            routeStatus: String(b.route?.status || '').toLowerCase(),
            origin: start?.name || `(${Number(start.lat).toFixed(2)}, ${Number(start.lng).toFixed(2)})`,
            destination: end?.name || `(${Number(end.lat).toFixed(2)}, ${Number(end.lng).toFixed(2)})`,
            originAddress: start?.address ? cleanAddr(start.address) : null,
            destinationAddress: end?.address ? cleanAddr(end.address) : null,
            originHasName: !!start?.name,
            destinationHasName: !!end?.name,
            pickupPoint: b.pickupLocation?.name || '-',
            date: dayjs(b.route.departureTime).format('D MMMM BBBB'),
            time: dayjs(b.route.departureTime).format('HH:mm น.'),
            price: (b.route.pricePerSeat || 0) * (b.numberOfSeats || 1),
            seats: b.numberOfSeats || 1,
            driver: driverData,
            coords: [[start.lat, start.lng], [end.lat, end.lng]],
            polyline: b.route.routePolyline || null,
            stops, stopsCoords, carDetails,
            conditions: b.route.conditions,
            photos: b.route.vehicle?.photos || [],
            durationText: (typeof b.route.duration === 'string' ? formatDuration(b.route.duration) : b.route.duration)
                || (typeof b.route.durationSeconds === 'number' ? `${Math.round(b.route.durationSeconds / 60)} นาที` : '-'),
            distanceText: (typeof b.route.distance === 'string' ? formatDistance(b.route.distance) : b.route.distance)
                || (typeof b.route.distanceMeters === 'number' ? `${(b.route.distanceMeters / 1000).toFixed(1)} กม.` : '-'),
            completedAt: b.completedAt,
        }
    }

    async function fetchReviewStatus(bookingId) {
        try {
            const res = await $fetch(`/reviews/booking/${bookingId}`, {
                method: 'GET',
                baseURL: config.public.apiBase,
                headers: { Authorization: `Bearer ${token.value}` },
            })
            console.log("Res:", res);
            return { hasReview: res.hasReview, reviewId: res.review?.id ?? '' }
        } catch {
            return { hasReview: false, reviewId: '' }
        }
    }

    async function fetchMyTrips(reverseGeocodeCallback) {
        isLoading.value = true
        try {
            const bookings = await $api('/bookings/me')
            allTrips.value = bookings.map(mapBooking)
            await Promise.all(allTrips.value.map(async (trip) => {

                console.log("Trip:", trip);
                const { hasReview, reviewId } = await fetchReviewStatus(trip.id)
                trip.hasReview = hasReview
                trip.reviewId = reviewId
            }))
            if (reverseGeocodeCallback) await reverseGeocodeCallback(allTrips.value)
        } catch (error) {
            console.error('Failed to fetch my trips:', error)
            allTrips.value = []
        } finally {
            isLoading.value = false
        }
    }

    async function confirmDropoff(tripId) {
        try {
            await $fetch(`/bookings/${tripId}/passenger-confirm-dropoff`, {
                method: 'PATCH',
                baseURL: config.public.apiBase,
                headers: { Accept: 'application/json', Authorization: `Bearer ${token.value}` },
            })
            toast.success('สำเร็จ', 'รอการยืนยันจากคนขับ')
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด', `${error}`)
        }
    }

    async function cancelBooking(tripId, reason) {
        await $api(`/bookings/${tripId}/cancel`, { method: 'PATCH', body: { reason } })
        toast.success('ยกเลิกการจองสำเร็จ', 'ระบบบันทึกเหตุผลแล้ว')
        await fetchMyTrips()
    }

    async function deleteBooking(tripId) {
        await $api(`/bookings/${tripId}`, { method: 'DELETE' })
        toast.success('ลบรายการสำเร็จ', 'รายการได้ถูกลบออกจากประวัติแล้ว')
        await fetchMyTrips()
    }

    async function deleteReview(reviewId) {
        await $api(`/reviews/${reviewId}`, { method: 'DELETE' })
        toast.success('ลบรีวิวสำเร็จ', 'รีวิวของคุณได้ถูกลบแล้ว')
        await fetchMyTrips()
    }

    async function submitReview(bookingId, reviewData) {
        const formData = new FormData()
        formData.append('rating', reviewData.rating)
        formData.append('comment', reviewData.comment)
        formData.append('labels', reviewData.labels)
        reviewData.files.forEach((f) => formData.append('files', f))
        if (reviewData.reviewId) {
            await $fetch(`/reviews/${reviewData.reviewId}`, {
                method: 'PUT', baseURL: config.public.apiBase, body: formData,
                headers: { Authorization: `Bearer ${token.value}` },
            })
            toast.success('แก้ไขรีวิวสำเร็จ', 'ข้อมูลของคุณถูกบันทึกแล้ว')
        } else {
            formData.append('bookingId', bookingId)
            await $fetch('/reviews', {
                method: 'POST', baseURL: config.public.apiBase, body: formData,
                headers: { Authorization: `Bearer ${token.value}` },
            })
            toast.success('บันทึกรีวิวสำเร็จ', 'ข้อมูลของคุณถูกบันทึกแล้ว')
        }
        await fetchMyTrips()
    }

    async function getExistingReview(bookingId) {
        const res = await $fetch(`/reviews/booking/${bookingId}`, {
            method: 'GET', baseURL: config.public.apiBase,
            headers: { Authorization: `Bearer ${token.value}` },
        })
        return res.review ?? null
    }

    return {
        allTrips, isLoading, activeTab, tabs,
        filteredTrips, getTripCount,
        fetchMyTrips, confirmDropoff,
        cancelBooking, deleteBooking, deleteReview,
        submitReview, getExistingReview,
        within7Days,
    }
}
