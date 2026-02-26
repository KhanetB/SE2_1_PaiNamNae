<template>
    <div>
        <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">คำขอจองเส้นทางของฉัน</h2>
                <p class="mt-2 text-gray-600">ดูและจัดการคำขอจองจากผู้โดยสารในเส้นทางที่คุณสร้าง</p>
            </div>

            <!-- Tab bar -->
            <div class="p-6 mb-8 bg-white border border-gray-300 rounded-lg shadow-md">
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="tab in tabs"
                        :key="tab.status"
                        @click="activeTab = tab.status"
                        :class="['tab-button px-4 py-2 rounded-md font-medium', { active: activeTab === tab.status }]"
                    >
                        {{ tab.label }} ({{ getTripCount(tab.status) }})
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div class="lg:col-span-2">
                    <div class="bg-white border border-gray-300 rounded-lg shadow-md">
                        <div class="p-6 border-b border-gray-300">
                            <h3 class="text-lg font-semibold text-gray-900">
                                {{ activeTab === 'myRoutes' ? 'เส้นทางของฉัน' : 'รายการคำขอจอง' }}
                            </h3>
                        </div>

                        <div v-if="isLoading" class="p-12 text-center text-gray-500">
                            <p>กำลังโหลดข้อมูล...</p>
                        </div>

                        <!-- ===== แท็บ: เส้นทางของฉัน ===== -->
                        <div v-else-if="activeTab === 'myRoutes'" class="divide-y divide-gray-200">
                            <div v-if="myRoutes.length === 0" class="p-12 text-center text-gray-500">
                                <p>ยังไม่มีเส้นทางที่คุณสร้าง</p>
                            </div>
                            <div
                                v-for="route in myRoutes"
                                :key="route.id"
                                class="p-6 transition-colors duration-200 cursor-pointer trip-card hover:bg-gray-50"
                                @click="toggleTripDetails(route.id)"
                            >
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <h4 class="text-lg font-semibold text-gray-900">
                                                {{ route.origin }} → {{ route.destination }}
                                            </h4>
                                            <TripStatusBadge :status="route.status" context="route" />
                                        </div>
                                        <p class="mt-1 text-sm text-gray-600">
                                            วันที่: {{ route.date }}
                                            <span class="mx-2 text-gray-300">|</span>
                                            เวลา: {{ route.time }}
                                            <span class="mx-2 text-gray-300">|</span>
                                            ระยะเวลา: {{ route.durationText }}
                                            <span class="mx-2 text-gray-300">|</span>
                                            ระยะทาง: {{ route.distanceText }}
                                        </p>
                                        <div class="mt-1 text-sm text-gray-600">
                                            <span class="font-medium">ที่นั่งว่าง:</span>
                                            <span class="ml-1">{{ route.availableSeats }}</span>
                                            <span class="mx-2 text-gray-300">|</span>
                                            <span class="font-medium">ราคาต่อที่นั่ง:</span>
                                            <span class="ml-1">{{ route.pricePerSeat }} บาท</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Route detail expand — with passengers slot -->
                                <TripRouteDetail v-if="selectedTripId === route.id" :trip="route">
                                    <div v-if="route.passengers && route.passengers.length">
                                        <h5 class="mb-2 font-medium text-gray-900">
                                            ผู้โดยสาร ({{ route.passengers.length }} คน)
                                        </h5>
                                        <div class="space-y-3">
                                            <div v-for="p in route.passengers" :key="p.id" class="flex items-center space-x-3">
                                                <img :src="p.image" :alt="p.name" class="object-cover w-12 h-12 rounded-full" />
                                                <div class="flex-1">
                                                    <div class="flex items-center">
                                                        <span class="font-medium text-gray-900">{{ p.name }}</span>
                                                        <div v-if="p.isVerified" class="relative group ml-1.5 flex items-center">
                                                            <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                                                <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12c0 1.357-.6 2.573-1.549 3.397a4.49 4.49 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.07-.01l3.5-4.875z" clip-rule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div class="text-sm text-gray-600">
                                                        ที่นั่ง: {{ p.seats }}
                                                        <span v-if="p.email" class="mx-2 text-gray-300">|</span>
                                                        <a v-if="p.email" :href="`mailto:${p.email}`" class="text-blue-600 hover:underline" @click.stop>{{ p.email }}</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TripRouteDetail>

                                <!-- Action buttons -->
                                <div class="flex justify-end space-x-2" :class="{ 'mt-4': selectedTripId !== route.id }">
                                    <button v-if="route.status === 'available'" @click.stop="confirmTrip(route.id)"
                                        class="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">
                                        ยืนยันการเดินทาง
                                    </button>
                                    <NuxtLink v-if="route.status !== 'in_transit' && route.status !== 'completed'"
                                        :to="`/myRoute/${route.id}/edit`"
                                        class="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700" @click.stop>
                                        แก้ไขเส้นทาง
                                    </NuxtLink>
                                    <button v-if="route.status === 'in_transit'" @click.stop="completedRoute(route.id)"
                                        class="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">
                                        ยืนยันการถึงที่หมาย
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- ===== แท็บ: คำขอจอง ===== -->
                        <div v-else class="divide-y divide-gray-200">
                            <div v-if="filteredTrips.length === 0" class="p-12 text-center text-gray-500">
                                <p>ไม่พบรายการในหมวดหมู่นี้</p>
                            </div>
                            <div
                                v-for="trip in filteredTrips"
                                :key="trip.id"
                                class="p-6 transition-colors duration-200 cursor-pointer trip-card hover:bg-gray-50"
                                @click="toggleTripDetails(trip.id)"
                            >
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <h4 class="text-lg font-semibold text-gray-900">
                                                {{ trip.origin }} → {{ trip.destination }}
                                            </h4>
                                            <div class="flex gap-1 flex-wrap justify-end">
                                                <TripStatusBadge :status="trip.status" context="driver" />
                                                <TripStatusBadge v-if="trip.routeStatus === 'in_transit'" status="in_transit" context="route" />
                                            </div>
                                        </div>
                                        <p class="mt-1 text-sm text-gray-600">จุดนัดพบ: {{ trip.pickupPoint }}</p>
                                        <p class="text-sm text-gray-600">
                                            วันที่: {{ trip.date }}
                                            <span class="mx-2 text-gray-300">|</span>
                                            เวลา: {{ trip.time }}
                                            <span class="mx-2 text-gray-300">|</span>
                                            ระยะเวลา: {{ trip.durationText }}
                                            <span class="mx-2 text-gray-300">|</span>
                                            ระยะทาง: {{ trip.distanceText }}
                                        </p>
                                        <!-- Cancel reason -->
                                        <div v-if="activeTab === 'cancelled' && trip.cancelReason"
                                            class="p-2 mt-2 border border-gray-200 rounded-md bg-gray-50">
                                            <span class="text-sm text-gray-700">
                                                เหตุผลการยกเลิกของผู้โดยสาร:
                                                <span class="font-medium">{{ reasonLabel(trip.cancelReason) }}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Passenger info -->
                                <div class="flex items-center mb-4 space-x-4">
                                    <img :src="trip.passenger.image" :alt="trip.passenger.name" class="object-cover rounded-full w-15 h-15" />
                                    <div class="flex-1">
                                        <div class="flex items-center">
                                            <h5 class="font-medium text-gray-900">{{ trip.passenger.name }}</h5>
                                            <div v-if="trip.passenger.isVerified" class="relative group ml-1.5 flex items-center">
                                                <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12c0 1.357-.6 2.573-1.549 3.397a4.49 4.49 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.07-.01l3.5-4.875z" clip-rule="evenodd" />
                                                </svg>
                                                <span class="absolute px-2 py-1 mb-2 text-xs text-white -translate-x-1/2 bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 w-max group-hover:opacity-100">ผู้โดยสารยืนยันตัวตนแล้ว</span>
                                            </div>
                                        </div>
                                        <div class="flex">
                                            <p v-if="trip.passenger.email" class="text-xs text-gray-500 mt-0.5">
                                                อีเมล: <a :href="`mailto:${trip.passenger.email}`" class="text-blue-600 hover:underline" @click.stop>{{ trip.passenger.email }}</a>
                                            </p>
                                            <button v-if="trip.passenger.email" @click.stop="copyEmail(trip.passenger.email)"
                                                class="inline-flex items-center ml-1 text-gray-500 rounded hover:text-gray-700 focus:outline-none">
                                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7V5a2 2 0 00-2-2H8a2 2 0 00-2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                        <StarRating :rating="trip.passenger.rating" :reviews="trip.passenger.reviews" />
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-blue-600">{{ trip.price }} บาท</div>
                                        <div class="text-sm text-gray-600">จำนวน {{ trip.seats }} ที่นั่ง</div>
                                        <button v-if="trip.status === 'passenger_confirmed_arrival'" @click.stop="confirmDropoff(trip.id)"
                                            class="mt-2 px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">
                                            ยืนยันถึงจุดหมาย
                                        </button>
                                    </div>
                                </div>

                                <!-- Route detail expand -->
                                <TripRouteDetail v-if="selectedTripId === trip.id" :trip="trip" />

                                <!-- Action buttons -->
                                <div class="flex justify-end space-x-3" :class="{ 'mt-4': selectedTripId !== trip.id }">
                                    <template v-if="trip.status === 'pending'">
                                        <button @click.stop="openConfirmModal(trip, 'confirm')"
                                            class="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">ยืนยันคำขอ</button>
                                        <button @click.stop="openConfirmModal(trip, 'reject')"
                                            class="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50">ปฏิเสธ</button>
                                    </template>
                                    <button v-if="trip.status === 'pending_review'" @click.stop="openConfirmModal(trip, 'complete')"
                                        class="px-4 py-2 text-sm text-white bg-green-700 rounded-md hover:bg-green-800">ยืนยันการเดินทางเสร็จสิ้น</button>
                                    <button v-else-if="['rejected','cancelled'].includes(trip.status)" @click.stop="openConfirmModal(trip, 'delete')"
                                        class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">ลบรายการ</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Map panel -->
                <div class="lg:col-span-1">
                    <div class="sticky overflow-hidden bg-white border border-gray-300 rounded-lg shadow-md top-8">
                        <div class="p-3 border-gray-300">
                            <h3 class="text-lg font-semibold text-gray-900">แผนที่เส้นทาง</h3>
                            <p class="mt-1 text-sm text-gray-600">
                                {{ selectedLabel ? selectedLabel : 'คลิกที่รายการเพื่อดูเส้นทาง' }}
                            </p>
                        </div>
                        <div ref="mapContainer" id="map"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Confirm Modal -->
        <ConfirmModal
            :show="isModalVisible"
            :title="modalContent.title"
            :message="modalContent.message"
            :confirmText="modalContent.confirmText"
            :variant="modalContent.variant"
            @confirm="handleConfirmAction"
            @cancel="closeConfirmModal"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ConfirmModal from '~/components/ConfirmModal.vue'
import TripStatusBadge from '~/components/TripStatusBadge.vue'
import StarRating from '~/components/StarRating.vue'
import TripRouteDetail from '~/components/TripRouteDetail.vue'
import { useMyRoutes, reasonLabel } from '~/composables/useMyRoutes'
import { useGoogleMap } from '~/composables/useGoogleMap'
import { useToast } from '~/composables/useToast'

definePageMeta({ middleware: 'auth' })

const { toast } = useToast()
const mapContainer = ref(null)
const googleMap = useGoogleMap(mapContainer)

useHead({
    title: 'คำขอจองเส้นทางของฉัน - ไปนำแหน่',
    script: process.client && !window.google?.maps
        ? [{ key: 'gmaps', src: googleMap.googleMapsScriptSrc(), async: true, defer: true }]
        : [],
})

const {
    allTrips, myRoutes, isLoading, activeTab, tabs,
    filteredTrips, getTripCount,
    fetchMyRoutes, confirmTrip, completedRoute,
    confirmDropoff, updateBookingStatus, deleteBooking, copyEmail,
} = useMyRoutes()

const selectedTripId = ref(null)

const selectedLabel = computed(() => {
    if (activeTab.value === 'myRoutes') {
        const r = myRoutes.value.find((x) => x.id === selectedTripId.value)
        return r ? `${r.origin} → ${r.destination}` : null
    }
    const t = allTrips.value.find((x) => x.id === selectedTripId.value)
    return t ? `${t.origin} → ${t.destination}` : null
})

function toggleTripDetails(id) {
    const item = activeTab.value === 'myRoutes'
        ? myRoutes.value.find((r) => r.id === id)
        : allTrips.value.find((t) => t.id === id)
    if (item) googleMap.updateMap(item)
    selectedTripId.value = selectedTripId.value === id ? null : id
}

watch(activeTab, () => {
    selectedTripId.value = null
    const first = activeTab.value === 'myRoutes'
        ? myRoutes.value[0]
        : filteredTrips.value[0]
    if (first) googleMap.updateMap(first)
})

// Confirm Modal
const isModalVisible = ref(false)
const modalContent = ref({ title: '', message: '', confirmText: '', action: null, variant: 'danger' })
const tripToAction = ref(null)

function openConfirmModal(trip, action) {
    tripToAction.value = trip
    const MAP = {
        confirm: { title: 'ยืนยันคำขอจอง', message: `ยืนยันคำขอของ "${trip.passenger.name}" ใช่หรือไม่?`, confirmText: 'ยืนยันคำขอ', variant: 'primary' },
        reject:  { title: 'ปฏิเสธคำขอจอง', message: `ปฏิเสธคำขอของ "${trip.passenger.name}" ใช่หรือไม่?`, confirmText: 'ปฏิเสธ', variant: 'danger' },
        delete:  { title: 'ยืนยันการลบรายการ', message: 'ต้องการลบคำขอนี้ออกจากรายการใช่หรือไม่?', confirmText: 'ลบรายการ', variant: 'danger' },
        complete:{ title: 'ยืนยันการเดินทางเสร็จสิ้น', message: `ยืนยันว่าส่ง "${trip.passenger.name}" ถึงที่หมายแล้ว?`, confirmText: 'ยืนยันเสร็จสิ้น', variant: 'success' },
    }
    modalContent.value = { ...MAP[action], action }
    isModalVisible.value = true
}
function closeConfirmModal() {
    isModalVisible.value = false
    tripToAction.value = null
}
async function handleConfirmAction() {
    if (!tripToAction.value) return
    const { action } = modalContent.value
    const bookingId = tripToAction.value.id
    try {
        if (action === 'confirm')  await updateBookingStatus(bookingId, 'CONFIRMED', 'ยืนยันคำขอแล้ว')
        else if (action === 'reject')   await updateBookingStatus(bookingId, 'REJECTED', 'ปฏิเสธคำขอแล้ว')
        else if (action === 'complete') await updateBookingStatus(bookingId, 'COMPLETED', 'ยืนยันการเดินทางเสร็จสิ้นแล้ว')
        else if (action === 'delete')   await deleteBooking(bookingId)
        closeConfirmModal()
    } catch (error) {
        toast.error('เกิดข้อผิดพลาด', error?.data?.message || 'ไม่สามารถดำเนินการได้')
        closeConfirmModal()
    }
}

// Reverse-geocode pass-through
async function doReverseGeocode(trips) {
    await googleMap.waitMapReady()
    const jobs = trips.map(async (t, idx) => {
        const [o, d] = await Promise.all([
            googleMap.reverseGeocode(t.coords[0][0], t.coords[0][1]),
            googleMap.reverseGeocode(t.coords[1][0], t.coords[1][1]),
        ])
        const oParts = await googleMap.extractNameParts(o)
        const dParts = await googleMap.extractNameParts(d)
        if (!trips[idx].originHasName && oParts.name) trips[idx].origin = oParts.name
        if (!trips[idx].destinationHasName && dParts.name) trips[idx].destination = dParts.name
    })
    await Promise.allSettled(jobs)
}

onMounted(() => {
    googleMap.loadGoogleMaps(() => {
        fetchMyRoutes(doReverseGeocode).then(() => {
            const first = activeTab.value === 'myRoutes' ? myRoutes.value[0] : filteredTrips.value[0]
            if (first) googleMap.updateMap(first)
        })
    })
})
</script>

<style scoped>
.trip-card { transition: all 0.3s ease; cursor: pointer; }
.trip-card:hover { box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1); }

.tab-button { transition: all 0.3s ease; }
.tab-button.active { background-color: #3b82f6; color: white; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3); }
.tab-button:not(.active) { background-color: white; color: #6b7280; border: 1px solid #d1d5db; }
.tab-button:not(.active):hover { background-color: #f9fafb; color: #374151; }

#map { height: 100%; min-height: 600px; border-radius: 0 0 0.5rem 0.5rem; }
</style>
