<template>
    <div>
        <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <!-- Search Form -->
            <div class="p-6 mb-8 bg-white border border-gray-300 rounded-lg shadow-md">
                <h2 class="mb-6 text-xl font-semibold text-gray-900">ค้นหาการเดินทาง</h2>
                <form @submit.prevent="handleSearch" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <!-- จุดเริ่มต้น -->
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-700">จุดเริ่มต้น</label>
                        <div class="relative">
                            <input ref="originInputEl" v-model="searchForm.origin" type="text"
                                placeholder="เช่น กรุงเทพฯ"
                                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <button type="button" @click="openPlacePicker('origin')"
                                class="absolute inset-y-0 my-auto text-gray-500 right-2 hover:text-blue-600" title="เลือกจากแผนที่">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>
                            </button>
                        </div>
                    </div>
                    <!-- จุดปลายทาง -->
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-700">จุดปลายทาง</label>
                        <div class="relative">
                            <input ref="destinationInputEl" v-model="searchForm.destination" type="text"
                                placeholder="เช่น เชียงใหม่"
                                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <button type="button" @click="openPlacePicker('destination')"
                                class="absolute inset-y-0 my-auto text-gray-500 right-2 hover:text-blue-600" title="เลือกจากแผนที่">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-700">วันที่</label>
                        <input v-model="searchForm.date" type="date"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-700">จำนวนที่นั่ง</label>
                        <select v-model="searchForm.seats"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">ค่าเริ่มต้น</option>
                            <option v-for="n in 5" :key="n" :value="String(n)">{{ n }} ที่นั่ง</option>
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <button type="submit" class="flex-1 px-5 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">ค้นหา</button>
                        <button type="button" @click="resetSearch" class="flex-1 px-5 py-3 font-medium text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300">รีเซ็ต</button>
                    </div>
                </form>
            </div>

            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <!-- Route List -->
                <div class="lg:col-span-2">
                    <div class="bg-white border border-gray-300 rounded-lg shadow-md">
                        <div class="p-6 border-b border-gray-300">
                            <h3 class="text-lg font-semibold text-gray-900">ผลการค้นหา ({{ routes.length }} รายการ)</h3>
                        </div>
                        <div v-if="isLoading" class="p-6 text-center text-gray-500">กำลังค้นหาเส้นทาง...</div>
                        <div v-else class="divide-y divide-gray-200">
                            <div v-if="routes.length === 0" class="p-6 text-center text-gray-500">ไม่พบเส้นทางที่ค้นหา</div>
                            <div v-for="route in routes" :key="route.id"
                                class="p-6 transition-all duration-300 cursor-pointer route-card hover:shadow-lg"
                                @click="toggleDetails(route)">
                                <h1 class="mb-4 font-semibold text-center text-gray-900">
                                    {{ route.originName }} <span class="mx-1 font-semibold">→</span> {{ route.destinationName }}
                                </h1>
                                <div class="flex items-start space-x-4">
                                    <img :src="route.driver.image" :alt="route.driver.name" class="object-cover w-12 h-12 rounded-full">
                                    <div class="flex-1">
                                        <div class="flex items-start justify-between">
                                            <div>
                                                <div class="flex items-center gap-1">
                                                    <h4 class="font-semibold text-gray-900">{{ route.driver.name }}</h4>
                                                    <div v-if="route.driver.isVerified" class="relative group flex items-center">
                                                        <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                                            <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12c0 1.357-.6 2.573-1.549 3.397a4.49 4.49 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.07-.01l3.5-4.875z" clip-rule="evenodd" />
                                                        </svg>
                                                        <span class="absolute px-2 py-1 mb-2 text-xs text-white -translate-x-1/2 bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 w-max group-hover:opacity-100">ผู้ขับขี่ยืนยันตัวตนแล้ว</span>
                                                    </div>
                                                </div>
                                                <StarRating :rating="route.driver.rating" :reviews="route.driver.reviews" />
                                            </div>
                                            <div class="text-right">
                                                <div class="text-lg font-bold text-blue-600">{{ route.price }} บาท</div>
                                                <div class="text-sm text-gray-600">ต่อที่นั่ง</div>
                                            </div>
                                        </div>
                                        <div class="flex flex-wrap items-center mt-3 text-sm text-gray-600 gap-x-2">
                                            <span class="font-medium">{{ route.date }}</span>
                                            <span class="text-gray-300">|</span>
                                            <span>เวลาออก: <span class="font-medium">{{ route.departureTime }}</span></span>
                                            <span class="text-gray-300">|</span>
                                            <span>ระยะเวลา: {{ route.durationText }}</span>
                                            <span class="text-gray-300">|</span>
                                            <span>ระยะทาง: {{ route.distanceText }}</span>
                                        </div>
                                        <div class="mt-2">
                                            <span :class="[
                                                'px-2 py-1 rounded-full text-xs font-medium',
                                                route.availableSeats > 2 ? 'bg-green-100 text-green-800'
                                                : route.availableSeats > 0 ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            ]">
                                                {{ route.availableSeats > 0 ? `เหลือ ${route.availableSeats} ที่นั่ง` : 'เต็มแล้ว' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Expanded Detail -->
                                <div v-if="selectedRoute && selectedRoute.id === route.id"
                                    class="pt-4 mt-4 duration-300 border-t border-gray-300 animate-in slide-in-from-top">
                                    <TripRouteDetail :trip="{ ...route, origin: route.originName, destination: route.destinationName, originAddress: route.originAddress, destinationAddress: route.destinationAddress }" />
                                    <div class="flex justify-end mt-4">
                                        <button @click.stop="openModal(route)" :disabled="route.availableSeats === 0"
                                            class="px-6 py-2 text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                            จองที่นั่ง
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Map -->
                <div class="lg:col-span-1">
                    <div class="sticky overflow-hidden bg-white border border-gray-300 rounded-lg shadow-md top-8">
                        <div class="p-6 border-b border-gray-300">
                            <h3 class="text-lg font-semibold text-gray-900">แผนที่เส้นทาง</h3>
                        </div>
                        <div ref="mapContainer" class="h-96"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Booking Modal -->
        <transition name="modal-fade">
            <div v-if="showModal && bookingRoute" class="modal-overlay" @click.self="closeModal">
                <div class="modal-content">
                    <template v-if="!bookingPickingTarget">
                        <div class="flex items-center justify-between p-6 border-b border-gray-300">
                            <h3 class="text-xl font-semibold text-gray-900">ยืนยันการจอง</h3>
                            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </template>
                    <template v-else>
                        <div class="flex items-center justify-between p-4 border-b border-gray-300">
                            <h3 class="text-lg font-semibold">เลือก{{ bookingPickingTarget === 'pickup' ? 'จุดขึ้นรถ' : 'จุดลงรถ' }}</h3>
                            <button @click="stopBookingPicker" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <div>
                            <div ref="bookingPickerMapEl" class="w-full" style="height: 72vh;"></div>
                            <div class="flex items-center justify-between p-4 border-t border-gray-200">
                                <div class="text-sm text-gray-700 truncate">
                                    <span class="font-medium">ตำแหน่ง: </span>{{ bookingPicked.name || '— ยังไม่เลือก —' }}
                                </div>
                                <button :disabled="!bookingPicked.name" @click="applyBookingPicked"
                                    class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    ใช้ตำแหน่งนี้
                                </button>
                            </div>
                        </div>
                    </template>
                    <div class="p-6">
                        <!-- Driver info -->
                        <div class="mb-6">
                            <h4 class="mb-3 font-semibold text-gray-900">เดินทางกับ</h4>
                            <div class="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                                <img :src="bookingRoute.driver.image" :alt="bookingRoute.driver.name" class="object-cover w-12 h-12 rounded-full">
                                <div>
                                    <div class="flex items-center gap-1">
                                        <div class="font-medium text-gray-900">{{ bookingRoute.driver.name }}</div>
                                        <div v-if="bookingRoute.driver.isVerified" class="relative group flex items-center">
                                            <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                                <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12c0 1.357-.6 2.573-1.549 3.397a4.49 4.49 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.07-.01l3.5-4.875z" clip-rule="evenodd"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <StarRating :rating="bookingRoute.driver.rating" :reviews="bookingRoute.driver.reviews" />
                                </div>
                            </div>
                        </div>
                        <!-- Date/Time -->
                        <div class="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label class="block mb-2 text-sm font-medium text-gray-700">วันที่เดินทาง</label>
                                <div class="p-3 rounded-lg bg-gray-50">{{ bookingRoute.date }}</div>
                            </div>
                            <div>
                                <label class="block mb-2 text-sm font-medium text-gray-700">เวลาออก</label>
                                <div class="p-3 rounded-lg bg-gray-50">{{ bookingRoute.departureTime }}</div>
                            </div>
                        </div>
                        <!-- Route -->
                        <div class="mb-6">
                            <h4 class="mb-3 font-semibold text-gray-900">เส้นทางการเดินทาง</h4>
                            <div class="flex items-center p-3 space-x-4 rounded-lg bg-gray-50">
                                <div class="flex-1">
                                    <div class="font-medium text-gray-900">{{ bookingRoute.originName }}</div>
                                    <div class="text-sm text-gray-600">จุดเริ่มต้น</div>
                                </div>
                                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                <div class="flex-1 text-right">
                                    <div class="font-medium text-gray-900">{{ bookingRoute.destinationName }}</div>
                                    <div class="text-sm text-gray-600">จุดปลายทาง</div>
                                </div>
                            </div>
                        </div>
                        <!-- Booking inputs -->
                        <div class="mb-6 space-y-4">
                            <div>
                                <label class="block mb-2 text-sm font-medium text-gray-700">จำนวนที่นั่ง</label>
                                <select v-model="bookingSeats" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option v-for="seat in bookingRoute.availableSeats" :key="seat" :value="seat">{{ seat }} ที่นั่ง</option>
                                </select>
                            </div>
                            <div>
                                <label class="block mb-2 text-sm font-medium text-gray-700">เลือกจุดขึ้นรถ</label>
                                <div class="relative">
                                    <input ref="pickupInputEl" v-model="pickupPoint" type="text" placeholder="พิมพ์ชื่อสถานที่..."
                                        class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                    <button type="button" @click="startBookingPicker('pickup')"
                                        class="absolute inset-y-0 my-auto text-gray-500 right-2 hover:text-blue-600">
                                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="block mb-2 text-sm font-medium text-gray-700">เลือกจุดลงรถ</label>
                                <div class="relative">
                                    <input ref="dropoffInputEl" v-model="dropoffPoint" type="text" placeholder="พิมพ์ชื่อสถานที่..."
                                        class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                    <button type="button" @click="startBookingPicker('dropoff')"
                                        class="absolute inset-y-0 my-auto text-gray-500 right-2 hover:text-blue-600">
                                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <!-- Price summary -->
                        <div class="p-4 mb-6 rounded-lg bg-blue-50">
                            <div class="flex justify-between mb-2"><span class="text-gray-700">ราคาต่อที่นั่ง</span><span class="font-medium">{{ bookingRoute.price }} บาท</span></div>
                            <div class="flex justify-between mb-2"><span class="text-gray-700">จำนวนที่นั่ง</span><span class="font-medium">{{ bookingSeats }} ที่นั่ง</span></div>
                            <div class="pt-2 mt-2 border-t border-gray-300">
                                <div class="flex justify-between"><span class="font-semibold text-gray-900">ยอดรวม</span><span class="text-lg font-bold text-blue-600">{{ bookingTotalPrice }} บาท</span></div>
                            </div>
                        </div>
                        <div class="flex space-x-4">
                            <button @click="closeModal" class="flex-1 px-4 py-3 font-semibold text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300">ยกเลิก</button>
                            <button @click="confirmBooking" class="flex-1 px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">ยืนยันการจอง</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Map Picker Modal -->
        <transition name="modal-fade">
            <div v-if="showPlacePicker" class="modal-overlay" @click.self="closePlacePicker">
                <div class="modal-content">
                    <div class="flex items-center justify-between p-4 border-b border-gray-300">
                        <h3 class="text-lg font-semibold">เลือก{{ pickingField === 'origin' ? 'จุดเริ่มต้น' : 'จุดปลายทาง' }}</h3>
                        <button @click="closePlacePicker" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-4 space-y-3">
                        <div ref="placePickerMapEl" class="w-full border border-gray-200 rounded-md h-80"></div>
                        <div class="text-sm text-gray-700">
                            <div class="font-medium">ตำแหน่งที่เลือก:</div>
                            <div class="truncate">{{ pickedPlace.name || '— ยังไม่เลือก —' }}</div>
                            <div v-if="pickedPlace.lat && pickedPlace.lng" class="text-gray-500">lat: {{ pickedPlace.lat.toFixed(6) }}, lng: {{ pickedPlace.lng.toFixed(6) }}</div>
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button @click="closePlacePicker" class="flex-1 px-4 py-2 font-semibold text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300">ยกเลิก</button>
                            <button :disabled="!pickedPlace.name" @click="applyPickedPlace" class="flex-1 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">ใช้ตำแหน่งนี้</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { navigateTo } from '#app'
import { useToast } from '~/composables/useToast'
import { useAuth } from '~/composables/useAuth'
import StarRating from '~/components/StarRating.vue'
import TripRouteDetail from '~/components/TripRouteDetail.vue'
import { useGoogleMap } from '~/composables/useGoogleMap'

dayjs.locale('th')
dayjs.extend(buddhistEra)

definePageMeta({ middleware: [] })

const { $api } = useNuxtApp()
const { toast } = useToast()
const { token } = useAuth()
const config = useRuntimeConfig()
const GMAPS_CB = '__gmapsReady__'
const RADIUS_METERS = 500

// ---- Map setup ----
const mapContainer = ref(null)
const googleMap = useGoogleMap(mapContainer)

useHead({
    title: 'ค้นหาเส้นทาง - ไปนำแหน่',
    link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap' }],
    script: process.client && !window.google?.maps
        ? [{ key: 'gmaps', src: googleMap.googleMapsScriptSrc(), async: true, defer: true }]
        : [],
})

// ---- Search form + Autocomplete ----
const originInputEl = ref(null)
const destinationInputEl = ref(null)
let originAutocomplete = null
let destinationAutocomplete = null

const searchForm = ref({ origin: '', destination: '', date: '', seats: '' })
const routes = ref([])
const selectedRoute = ref(null)
const isLoading = ref(false)

// ---- Map Picker (for search form) ----
const showPlacePicker = ref(false)
const pickingField = ref(null)
const placePickerMapEl = ref(null)
let placePickerMap = null
let placePickerMarker = null
const pickedPlace = ref({ name: '', lat: null, lng: null })

// ---- Booking Modal ----
const showModal = ref(false)
const bookingRoute = ref(null)
const bookingSeats = ref(1)
const pickupPoint = ref('')
const dropoffPoint = ref('')
const pickupInputEl = ref(null)
const dropoffInputEl = ref(null)
let pickupAutocomplete = null
let dropoffAutocomplete = null
const pickupData = ref({ lat: null, lng: null, placeId: null, address: null, name: null })
const dropoffData = ref({ lat: null, lng: null, placeId: null, address: null, name: null })

// Booking map picker
const bookingPickingTarget = ref(null)
const bookingPickerMapEl = ref(null)
let bookingPickerMap = null
let bookingPickerMarker = null
const bookingPicked = ref({ name: '', lat: null, lng: null, placeId: null, address: null })

const bookingTotalPrice = computed(() => {
    if (!bookingRoute.value) return 0
    return bookingSeats.value * bookingRoute.value.price
})

// ---- Helpers ----
function cleanAddr(a) {
    return (a || '').replace(/,?\s*(Thailand|ไทย|ประเทศ)\s*$/i, '').replace(/\s{2,}/g, ' ').trim()
}

function formatDistance(input) {
    if (typeof input !== 'string') return input
    const parts = input.split('+')
    if (parts.length <= 1) return input
    let meters = 0
    for (const seg of parts) {
        const n = parseFloat(seg.replace(/[^\d.]/g, ''))
        if (Number.isNaN(n)) continue
        if (/กม/.test(seg)) meters += n * 1000
        else if (/เมตร|ม\./.test(seg)) meters += n
        else meters += n
    }
    if (meters >= 1000) {
        const km = Math.round((meters / 1000) * 10) / 10
        return `${km % 1 === 0 ? km.toFixed(0) : km} กม.`
    }
    return `${Math.round(meters)} ม.`
}

function formatDuration(input) {
    if (typeof input !== 'string') return input
    const parts = input.split('+')
    if (parts.length <= 1) return input
    let minutes = 0
    for (const seg of parts) {
        const n = parseFloat(seg.replace(/[^\d.]/g, ''))
        if (Number.isNaN(n)) continue
        if (/ชม/.test(seg)) minutes += n * 60
        else minutes += n
    }
    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    return h ? (m ? `${h} ชม. ${m} นาที` : `${h} ชม.`) : `${m} นาที`
}

function isPlusCode(text) {
    return /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}/i.test((text || '').trim())
}

function findNearestPoi(lat, lng, radius = 100) {
    return new Promise((resolve) => {
        if (!window.google?.maps?.places) return resolve(null)
        const svc = new google.maps.places.PlacesService(document.createElement('div'))
        svc.nearbySearch({ location: { lat, lng }, radius }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) resolve(results[0])
            else resolve(null)
        })
    })
}

// ---- Map: route display ----
function toggleDetails(route) {
    if (selectedRoute.value && selectedRoute.value.id === route.id) {
        selectedRoute.value = null
    } else {
        selectedRoute.value = route
        // Re-map to useGoogleMap.updateMap expected shape
        googleMap.updateMap({
            coords: [[route.start.lat, route.start.lng], [route.end.lat, route.end.lng]],
            polyline: route.polyline,
            stopsCoords: route.stopsCoords,
        })
    }
}

// ---- Autocomplete inits ----
function initAutocomplete() {
    if (!originInputEl.value || !destinationInputEl.value || !window.google?.maps?.places) return
    const commonOpts = { fields: ['place_id', 'name', 'formatted_address', 'geometry'], types: ['geocode', 'establishment'] }
    originAutocomplete = new google.maps.places.Autocomplete(originInputEl.value, commonOpts)
    originAutocomplete.addListener('place_changed', () => {
        const p = originAutocomplete.getPlace()
        if (!p) return
        searchForm.value.origin = p.name || p.formatted_address || searchForm.value.origin
        searchForm.value._originMeta = { placeId: p.place_id || null, lat: p.geometry?.location?.lat?.() ?? null, lng: p.geometry?.location?.lng?.() ?? null }
    })
    destinationAutocomplete = new google.maps.places.Autocomplete(destinationInputEl.value, commonOpts)
    destinationAutocomplete.addListener('place_changed', () => {
        const p = destinationAutocomplete.getPlace()
        if (!p) return
        searchForm.value.destination = p.name || p.formatted_address || searchForm.value.destination
        searchForm.value._destinationMeta = { placeId: p.place_id || null, lat: p.geometry?.location?.lat?.() ?? null, lng: p.geometry?.location?.lng?.() ?? null }
    })
}

function initBookingAutocomplete() {
    if (!window.google?.maps?.places) return
    const opts = { fields: ['place_id', 'name', 'formatted_address', 'geometry'], types: ['geocode', 'establishment'] }
    if (pickupInputEl.value) {
        pickupAutocomplete?.unbindAll?.()
        pickupAutocomplete = new google.maps.places.Autocomplete(pickupInputEl.value, opts)
        pickupAutocomplete.addListener('place_changed', () => {
            const p = pickupAutocomplete.getPlace()
            if (!p) return
            pickupPoint.value = p.name || p.formatted_address || pickupPoint.value
            pickupData.value = { lat: p.geometry?.location?.lat?.() ?? null, lng: p.geometry?.location?.lng?.() ?? null, placeId: p.place_id || null, address: p.formatted_address || null, name: p.name || null }
        })
    }
    if (dropoffInputEl.value) {
        dropoffAutocomplete?.unbindAll?.()
        dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInputEl.value, opts)
        dropoffAutocomplete.addListener('place_changed', () => {
            const p = dropoffAutocomplete.getPlace()
            if (!p) return
            dropoffPoint.value = p.name || p.formatted_address || dropoffPoint.value
            dropoffData.value = { lat: p.geometry?.location?.lat?.() ?? null, lng: p.geometry?.location?.lng?.() ?? null, placeId: p.place_id || null, address: p.formatted_address || null, name: p.name || null }
        })
    }
}

// ---- Search ----
function geocodeText(text) {
    return new Promise((resolve) => {
        if (!text) return resolve(null)
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address: text }, async (results, status) => {
            if (status !== 'OK' || !results?.length) return resolve(null)
            const r = results[0]
            resolve({
                lat: r.geometry?.location?.lat?.(),
                lng: r.geometry?.location?.lng?.(),
                placeId: r.place_id || null,
                address: cleanAddr(r.formatted_address || ''),
                name: null,
            })
        })
    })
}

async function ensureLatLng(field) {
    const metaKey = field === 'origin' ? '_originMeta' : '_destinationMeta'
    const meta = searchForm.value[metaKey]
    if (meta?.lat && meta?.lng) return { lat: meta.lat, lng: meta.lng }
    const text = searchForm.value[field]
    if (!text) return { lat: null, lng: null }
    const g = await geocodeText(text)
    if (g?.lat && g?.lng) {
        searchForm.value[metaKey] = { ...meta, lat: g.lat, lng: g.lng, placeId: g.placeId || null }
        return { lat: g.lat, lng: g.lng }
    }
    return { lat: null, lng: null }
}

async function handleSearch() {
    isLoading.value = true
    selectedRoute.value = null
    try {
        const q = { page: 1, limit: 20 }
        if (searchForm.value.date) {
            const d = dayjs(searchForm.value.date)
            q.dateFrom = d.startOf('day').toISOString()
            q.dateTo = d.endOf('day').toISOString()
        }
        if (searchForm.value.seats) q.seatsRequired = Number(searchForm.value.seats)
        let usedRadius = false
        if (searchForm.value.origin || searchForm.value._originMeta?.lat) {
            const { lat, lng } = await ensureLatLng('origin')
            if (lat != null) { q.startNearLat = lat; q.startNearLng = lng; usedRadius = true }
        }
        if (searchForm.value.destination || searchForm.value._destinationMeta?.lat) {
            const { lat, lng } = await ensureLatLng('destination')
            if (lat != null) { q.endNearLat = lat; q.endNearLng = lng; usedRadius = true }
        }
        if (usedRadius) q.radiusMeters = RADIUS_METERS
        const apiRes = await $api('/routes', { query: q })
        const raw = (apiRes?.data || apiRes || []).filter((r) => r.status === 'AVAILABLE')
        routes.value = raw.map((r) => {
            const wp = r.waypoints || {}
            const baseList = Array.isArray(wp.used) && wp.used.length ? wp.used : Array.isArray(wp.requested) ? wp.requested : []
            const orderedList = Array.isArray(wp.optimizedOrder) && wp.optimizedOrder.length === baseList.length ? wp.optimizedOrder.map((i) => baseList[i]) : baseList
            const stops = orderedList.map((p) => {
                const name = p?.name || ''
                const address = cleanAddr(p?.address || '')
                const fallback = p?.lat != null && p?.lng != null ? `(${p.lat.toFixed(6)}, ${p.lng.toFixed(6)})` : ''
                const title = name || fallback
                return address ? `${title} — ${address}` : title
            }).filter(Boolean)
            const stopsCoords = orderedList.map((p) =>
                p && typeof p.lat === 'number' ? { lat: p.lat, lng: p.lng, name: p.name || '', address: p.address || '' } : null
            ).filter(Boolean)
            return {
                id: r.id, availableSeats: r.availableSeats, price: r.pricePerSeat,
                departureTime: dayjs(r.departureTime).format('HH:mm น.'),
                date: dayjs(r.departureTime).format('D MMMM BBBB'),
                start: r.startLocation, end: r.endLocation,
                originName: r.startLocation?.name || `(${r.startLocation.lat.toFixed(2)}, ${r.startLocation.lng.toFixed(2)})`,
                destinationName: r.endLocation?.name || `(${r.endLocation.lat.toFixed(2)}, ${r.endLocation.lng.toFixed(2)})`,
                originAddress: r.startLocation?.address ? cleanAddr(r.startLocation.address) : null,
                destinationAddress: r.endLocation?.address ? cleanAddr(r.endLocation.address) : null,
                driver: {
                    name: `${r.driver?.firstName || ''} ${r.driver?.lastName || ''}`.trim() || 'ไม่ระบุชื่อ',
                    image: r.driver?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.driver?.firstName || 'U')}&background=random&size=64`,
                    rating: 4.5, reviews: Math.floor(Math.random() * 50) + 5, isVerified: !!r.driver?.isVerified,
                },
                carDetails: r.vehicle ? [`${r.vehicle.vehicleModel} (${r.vehicle.vehicleType})`, ...(r.vehicle.amenities || [])] : ['ไม่มีข้อมูลรถ'],
                conditions: r.conditions, photos: r.vehicle?.photos || [],
                durationText: formatDuration(r.duration) || r.duration || '-',
                distanceText: formatDistance(r.distance) || r.distance || '-',
                polyline: r.routePolyline || null, stops, stopsCoords,
            }
        })
        // Reverse geocode names
        await googleMap.waitMapReady()
        await Promise.allSettled(routes.value.map(async (r, i) => {
            const [o, d] = await Promise.all([
                googleMap.reverseGeocode(r.start.lat, r.start.lng),
                googleMap.reverseGeocode(r.end.lat, r.end.lng),
            ])
            const oParts = await googleMap.extractNameParts(o)
            const dParts = await googleMap.extractNameParts(d)
            if (!r.start?.name && oParts.name) routes.value[i].originName = oParts.name
            if (!r.end?.name && dParts.name) routes.value[i].destinationName = dParts.name
        }))
    } catch (e) {
        console.error('Failed to fetch routes:', e)
        routes.value = []
    } finally {
        isLoading.value = false
    }
}

function resetSearch() {
    searchForm.value = { origin: '', destination: '', date: '', seats: '' }
    selectedRoute.value = null
    handleSearch()
}

// ---- Map place picker ----
async function resolvePicked(latlng) {
    const lat = latlng.lat(), lng = latlng.lng()
    const geocodeRes = await googleMap.reverseGeocode(lat, lng)
    const parts = geocodeRes ? await googleMap.extractNameParts(geocodeRes) : { name: '' }
    let name = parts.name || ''
    if (!name || isPlusCode(name)) {
        const poi = await findNearestPoi(lat, lng, 120)
        if (poi?.name) name = poi.name
        else if (geocodeRes?.formatted_address) name = cleanAddr(geocodeRes.formatted_address)
    }
    pickedPlace.value = { name, lat, lng }
}

function setPickerMarker(latlng) {
    if (placePickerMarker) { placePickerMarker.setPosition(latlng); return }
    placePickerMarker = new google.maps.Marker({ position: latlng, map: placePickerMap, draggable: true })
    placePickerMarker.addListener('dragend', (e) => resolvePicked(e.latLng))
}

function openPlacePicker(field) {
    pickingField.value = field
    pickedPlace.value = { name: '', lat: null, lng: null }
    showPlacePicker.value = true
    nextTick(() => {
        const meta = field === 'origin' ? searchForm.value._originMeta : searchForm.value._destinationMeta
        const center = meta?.lat ? { lat: meta.lat, lng: meta.lng } : { lat: 13.7563, lng: 100.5018 }
        placePickerMap = new google.maps.Map(placePickerMapEl.value, { center, zoom: meta?.lat ? 14 : 6, mapTypeControl: false, streetViewControl: false, fullscreenControl: false })
        placePickerMap.addListener('click', (e) => { setPickerMarker(e.latLng); resolvePicked(e.latLng) })
    })
}

function applyPickedPlace() {
    if (!pickingField.value || !pickedPlace.value.name) return
    const meta = { placeId: null, fullAddress: null, lat: pickedPlace.value.lat, lng: pickedPlace.value.lng }
    if (pickingField.value === 'origin') { searchForm.value.origin = pickedPlace.value.name; searchForm.value._originMeta = meta }
    else { searchForm.value.destination = pickedPlace.value.name; searchForm.value._destinationMeta = meta }
    closePlacePicker()
}

function closePlacePicker() {
    showPlacePicker.value = false; pickingField.value = null; placePickerMarker = null; placePickerMap = null
}

// ---- Booking modal ----
function openModal(route) {
    if (!token.value) { navigateTo('/login'); return }
    if (!route || route.availableSeats <= 0) return
    bookingRoute.value = route; bookingSeats.value = 1
    pickupPoint.value = ''; dropoffPoint.value = ''
    pickupData.value = { lat: null, lng: null, placeId: null, address: null, name: null }
    dropoffData.value = { lat: null, lng: null, placeId: null, address: null, name: null }
    bookingPickingTarget.value = null; showModal.value = true
    nextTick(() => initBookingAutocomplete())
}

function closeModal() {
    showModal.value = false
    setTimeout(() => { bookingRoute.value = null }, 300)
}

async function confirmBooking() {
    if (!bookingRoute.value) return
    if (pickupPoint.value && !pickupData.value.lat) { const g = await geocodeText(pickupPoint.value); if (g) pickupData.value = g }
    if (dropoffPoint.value && !dropoffData.value.lat) { const g = await geocodeText(dropoffPoint.value); if (g) dropoffData.value = g }
    if (!pickupData.value.lat || !dropoffData.value.lat) {
        toast.warning('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกจุดขึ้นรถและจุดลงรถ'); return
    }
    try {
        await $api('/bookings', { method: 'POST', body: { routeId: bookingRoute.value.id, numberOfSeats: bookingSeats.value, pickupLocation: pickupData.value, dropoffLocation: dropoffData.value } })
        closeModal()
        toast.success('ส่งคำขอจองสำเร็จ!', 'คำขอของคุณถูกส่งไปให้ผู้ขับแล้ว')
        setTimeout(() => navigateTo('/myTrip'), 1500)
    } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการจอง', error.data?.message || 'โปรดลองใหม่อีกครั้ง')
    }
}

// ---- Booking picker ----
async function resolveBookingPicked(latlng) {
    const lat = latlng.lat(), lng = latlng.lng()
    const geocodeRes = await googleMap.reverseGeocode(lat, lng)
    const parts = geocodeRes ? await googleMap.extractNameParts(geocodeRes) : { name: '' }
    let name = parts.name || ''
    let placeId = geocodeRes?.place_id || null
    let address = geocodeRes?.formatted_address ? cleanAddr(geocodeRes.formatted_address) : null
    if (!name) {
        const poi = await findNearestPoi(lat, lng, 120)
        if (poi) { name = poi.name || name; placeId = poi.place_id || placeId }
    }
    bookingPicked.value = { name, lat, lng, placeId, address }
}

function setBookingPickerMarker(latlng) {
    if (bookingPickerMarker) { bookingPickerMarker.setPosition(latlng); return }
    bookingPickerMarker = new google.maps.Marker({ position: latlng, map: bookingPickerMap, draggable: true })
    bookingPickerMarker.addListener('dragend', (e) => resolveBookingPicked(e.latLng))
}

function startBookingPicker(target) {
    bookingPickingTarget.value = target
    bookingPicked.value = { name: '', lat: null, lng: null, placeId: null, address: null }
    nextTick(() => {
        const base = target === 'pickup' ? pickupData.value : dropoffData.value
        const center = base?.lat ? { lat: base.lat, lng: base.lng } : { lat: 13.7563, lng: 100.5018 }
        bookingPickerMap = new google.maps.Map(bookingPickerMapEl.value, { center, zoom: base?.lat ? 15 : 6, mapTypeControl: false, streetViewControl: false, fullscreenControl: false })
        bookingPickerMap.addListener('click', async (e) => { setBookingPickerMarker(e.latLng); await resolveBookingPicked(e.latLng) })
    })
}

function stopBookingPicker() {
    bookingPickingTarget.value = null; bookingPickerMap = null; bookingPickerMarker = null
}

function applyBookingPicked() {
    if (!bookingPickingTarget.value || !bookingPicked.value.name) return
    const data = { ...bookingPicked.value }
    if (bookingPickingTarget.value === 'pickup') { pickupPoint.value = data.name || data.address || ''; pickupData.value = data }
    else { dropoffPoint.value = data.name || data.address || ''; dropoffData.value = data }
    stopBookingPicker()
}

// ---- Lifecycle ----
onMounted(() => {
    googleMap.loadGoogleMaps(() => {
        initAutocomplete()
        handleSearch()
    })
})
</script>

<style scoped>
body, * { font-family: 'Kanit', sans-serif; }
.route-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-2px); }
@keyframes slide-in-from-top { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.animate-in { animation-fill-mode: both; }
.slide-in-from-top { animation-name: slide-in-from-top; }
.duration-300 { animation-duration: 300ms; }
.modal-overlay { position: fixed; z-index: 1000; inset: 0; background-color: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; }
.modal-content { background-color: white; border-radius: 0.75rem; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02); }
.modal-fade-enter-active .modal-content, .modal-fade-leave-active .modal-content { transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-content, .modal-fade-leave-to .modal-content { transform: scale(0.9) translateY(1rem); }
</style>