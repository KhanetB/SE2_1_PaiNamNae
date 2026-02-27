<template>
    <div>
        <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">
                    การเดินทางของฉัน
                </h2>
                <p class="mt-2 text-gray-600">
                    จัดการและติดตามการเดินทางทั้งหมดของคุณ
                </p>
            </div>

            <!-- Tab bar -->
            <div
                class="p-6 mb-8 bg-white border border-gray-300 rounded-lg shadow-md"
            >
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="tab in tabs"
                        :key="tab.status"
                        @click="activeTab = tab.status"
                        :class="[
                            'tab-button px-4 py-2 rounded-md font-medium',
                            { active: activeTab === tab.status },
                        ]"
                    >
                        {{ tab.label }} ({{ getTripCount(tab.status) }})
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <!-- Trip List -->
                <div class="lg:col-span-2">
                    <div
                        class="bg-white border border-gray-300 rounded-lg shadow-md"
                    >
                        <div class="p-6 border-b border-gray-300">
                            <h3 class="text-lg font-semibold text-gray-900">
                                รายการการเดินทาง
                            </h3>
                        </div>

                        <div
                            v-if="isLoading"
                            class="p-12 text-center text-gray-500"
                        >
                            <p>กำลังโหลดข้อมูลการเดินทาง...</p>
                        </div>

                        <div v-else class="divide-y divide-gray-200">
                            <div
                                v-if="filteredTrips.length === 0"
                                class="p-12 text-center text-gray-500"
                            >
                                <p>ไม่พบรายการเดินทางในหมวดหมู่นี้</p>
                            </div>

                            <div
                                v-for="trip in filteredTrips"
                                :key="trip.id"
                                class="p-6 transition-colors duration-200 cursor-pointer trip-card hover:bg-gray-50"
                                @click="toggleTripDetails(trip.id)"
                            >
                                <!-- Trip header row -->
                                <div
                                    class="flex items-start justify-between mb-4"
                                >
                                    <div class="flex-1">
                                        <div
                                            class="flex items-center justify-between"
                                        >
                                            <h4
                                                class="text-lg font-semibold text-gray-900"
                                            >
                                                {{ trip.origin }} →
                                                {{ trip.destination }}
                                            </h4>
                                            <TripStatusBadge
                                                :status="trip.status"
                                                context="passenger"
                                            />
                                        </div>
                                        <p class="mt-1 text-sm text-gray-600">
                                            จุดนัดพบ: {{ trip.pickupPoint }}
                                        </p>
                                        <p class="text-sm text-gray-600">
                                            วันที่: {{ trip.date }}
                                            <span class="mx-2 text-gray-300"
                                                >|</span
                                            >
                                            เวลา: {{ trip.time }}
                                            <span class="mx-2 text-gray-300"
                                                >|</span
                                            >
                                            ระยะเวลา: {{ trip.durationText }}
                                            <span class="mx-2 text-gray-300"
                                                >|</span
                                            >
                                            ระยะทาง: {{ trip.distanceText }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Driver info row -->
                                <div class="flex items-center mb-4 space-x-4">
                                    <img
                                        :src="trip.driver.image"
                                        :alt="trip.driver.name"
                                        class="object-cover w-12 h-12 rounded-full"
                                    />
                                    <div class="flex-1">
                                        <h5 class="font-medium text-gray-900">
                                            {{ trip.driver.name }}
                                        </h5>
                                        <StarRating
                                            :rating="trip.driver.rating"
                                            :reviews="trip.driver.reviews"
                                        />
                                    </div>
                                    <div class="text-right">
                                        <div
                                            class="text-lg font-bold text-blue-600"
                                        >
                                            {{ trip.price }} บาท
                                        </div>
                                        <div class="text-sm text-gray-600">
                                            จำนวน {{ trip.seats }} ที่นั่ง
                                        </div>
                                        <button
                                            v-if="trip.status === 'in_transit'"
                                            @click.stop="
                                                handleConfirmDropoff(trip.id)
                                            "
                                            class="mt-2 px-4 py-2 text-sm text-white transition duration-200 bg-green-600 rounded-md hover:bg-green-700"
                                        >
                                            ยืนยันถึงจุดหมาย
                                        </button>
                                    </div>
                                </div>

                                <!-- Detail panel (expand) -->
                                <TripRouteDetail
                                    v-if="selectedTripId === trip.id"
                                    :trip="trip"
                                />

                                <!-- Action buttons -->
                                <div
                                    class="flex justify-end space-x-3"
                                    :class="{
                                        'mt-4': selectedTripId !== trip.id,
                                    }"
                                >
                                    <button
                                        v-if="trip.status === 'pending'"
                                        @click.stop="openCancelModal(trip)"
                                        class="px-4 py-2 text-sm text-red-600 transition duration-200 border border-red-300 rounded-md hover:bg-red-50"
                                    >
                                        ยกเลิกการจอง
                                    </button>
                                    <button
                                        v-if="
                                            trip.status === 'completed' &&
                                            !trip.hasReview &&
                                            new Date() -
                                                new Date(trip.completedAt) <=
                                                7 * 24 * 60 * 60 * 1000
                                        "
                                        @click.stop="openReviewModal(trip)"
                                        class="px-4 py-2 text-sm text-green-600 transition duration-200 border border-green-300 rounded-md hover:bg-green-50"
                                    >
                                        เขียนรีวิว
                                    </button>

                                    <span
                                        v-if="
                                            trip.status === 'completed' &&
                                            trip.hasReview
                                        "
                                        class="px-4 py-2 text-sm text-green-600 transition duration-200 border border-green-300 rounded-md hover:bg-green-50"
                                    >
                                        คุณได้เขียนรีวิวนี้ไปแล้ว
                                    </span>
                                    <span
                                        v-if="
                                            trip.status === 'completed' &&
                                            !trip.hasReview &&
                                            new Date() -
                                                new Date(trip.completedAt) >
                                                7 * 24 * 60 * 60 * 1000
                                        "
                                        class="px-4 py-2 text-sm text-gray-500 transition duration-200 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        หมดเขตการรีวิวแล้ว (เกิน 7 วัน)
                                    </span>

                                    <!-- <button
                                        v-if="trip.status === 'completed' && trip.hasReview"
                                        @click.stop="openDeleteReviewModal(trip)"
                                        class="px-4 py-2 text-sm text-red-600 transition duration-200 border border-red-300 rounded-md hover:bg-red-50"
                                    >ลบรีวิว</button> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Map panel -->
                <div class="lg:col-span-1">
                    <div
                        class="sticky overflow-hidden bg-white border border-gray-300 rounded-lg shadow-md top-8"
                    >
                        <div class="p-6 border-b border-gray-300">
                            <h3 class="text-lg font-semibold text-gray-900">
                                แผนที่เส้นทาง
                            </h3>
                        </div>
                        <div ref="mapContainer" id="map" class="h-96"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cancel Modal -->
        <TripCancelModal
            :show="isCancelModalVisible"
            :is-submitting="isSubmittingCancel"
            @confirm="submitCancel"
            @close="closeCancelModal"
        />

        <!-- Confirm Modal (delete review etc.) -->
        <ConfirmModal
            :show="isModalVisible"
            :title="modalContent.title"
            :message="modalContent.message"
            :confirmText="modalContent.confirmText"
            :variant="modalContent.variant"
            @confirm="handleConfirmAction"
            @cancel="closeConfirmModal"
        />

        <!-- Review Modal -->
        <TripReviewModal
            :show="isReviewModalVisible"
            :trip="tripToReview"
            :existing-review="existingReviewData"
            :is-submitting="isSubmittingReview"
            @submit="handleReviewSubmit"
            @close="closeReviewModal"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ConfirmModal from "~/components/ConfirmModal.vue";
import TripStatusBadge from "~/components/TripStatusBadge.vue";
import StarRating from "~/components/StarRating.vue";
import TripRouteDetail from "~/components/TripRouteDetail.vue";
import TripCancelModal from "~/components/TripCancelModal.vue";
import TripReviewModal from "~/components/TripReviewModal.vue";
import { useMyTrips } from "~/composables/useMyTrips";
import { useGoogleMap } from "~/composables/useGoogleMap";
import { useToast } from "~/composables/useToast";

definePageMeta({ middleware: "auth" });

const { toast } = useToast();
const mapContainer = ref(null);
const googleMap = useGoogleMap(mapContainer);

useHead({
    title: "การเดินทางของฉัน - ไปนำแหน่",
    link: [
        {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap",
        },
    ],
    script:
        process.client && !window.google?.maps
            ? [
                  {
                      key: "gmaps",
                      src: googleMap.googleMapsScriptSrc(),
                      async: true,
                      defer: true,
                  },
              ]
            : [],
});
const {
    allTrips,
    isLoading,
    activeTab,
    tabs,
    filteredTrips,
    getTripCount,
    fetchMyTrips,
    confirmDropoff,
    cancelBooking,
    deleteReview,
    submitReview,
    getExistingReview,
} = useMyTrips();

// ---- UI state ----
const selectedTripId = ref(null);

// --- Cancel ---
const isCancelModalVisible = ref(false);
const isSubmittingCancel = ref(false);
const tripToCancel = ref(null);

function openCancelModal(trip) {
    tripToCancel.value = trip;
    isCancelModalVisible.value = true;
}
function closeCancelModal() {
    isCancelModalVisible.value = false;
    tripToCancel.value = null;
}
async function submitCancel(reason) {
    if (!tripToCancel.value) return;
    isSubmittingCancel.value = true;
    try {
        await cancelBooking(tripToCancel.value.id, reason);
        closeCancelModal();
    } catch (err) {
        toast.error(
            "เกิดข้อผิดพลาด",
            err?.data?.message || "ไม่สามารถยกเลิกได้",
        );
    } finally {
        isSubmittingCancel.value = false;
    }
}

// --- Confirm Modal (delete) ---
const isModalVisible = ref(false);
const modalContent = ref({
    title: "",
    message: "",
    confirmText: "",
    action: null,
    variant: "danger",
});
const tripToAction = ref(null);

function openDeleteReviewModal(trip) {
    tripToAction.value = trip;
    modalContent.value = {
        title: "ยืนยันการลบรีวิว",
        message: `คุณต้องการลบรีวิวที่คุณเขียนให้ "${trip.driver.name}" ใช่หรือไม่`,
        confirmText: "ลบรีวิว",
        action: "deleteReview",
        variant: "danger",
    };
    isModalVisible.value = true;
}
function closeConfirmModal() {
    isModalVisible.value = false;
    tripToAction.value = null;
}
async function handleConfirmAction() {
    if (!tripToAction.value) return;
    try {
        if (modalContent.value.action === "deleteReview") {
            await deleteReview(tripToAction.value.reviewId);
        }
        closeConfirmModal();
    } catch (error) {
        toast.error(
            "เกิดข้อผิดพลาด",
            error.data?.message || "ไม่สามารถดำเนินการได้",
        );
        closeConfirmModal();
    }
}

// --- Review ---
const isReviewModalVisible = ref(false);
const isSubmittingReview = ref(false);
const tripToReview = ref(null);
const existingReviewData = ref(null);

function openReviewModal(trip) {
    tripToReview.value = trip;
    existingReviewData.value = null;
    isReviewModalVisible.value = true;
}
async function openEditReviewModal(trip) {
    try {
        const review = await getExistingReview(trip.id);
        if (!review) {
            toast.error("ไม่พบข้อมูลรีวิว");
            return;
        }
        tripToReview.value = trip;
        existingReviewData.value = review;
        isReviewModalVisible.value = true;
    } catch {
        toast.error("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลรีวิวได้");
    }
}
function closeReviewModal() {
    isReviewModalVisible.value = false;
    tripToReview.value = null;
    existingReviewData.value = null;
}
async function handleReviewSubmit(reviewData) {
    if (!tripToReview.value) return;
    isSubmittingReview.value = true;
    try {
        await submitReview(tripToReview.value.id, reviewData);
        closeReviewModal();
    } catch (error) {
        toast.error(
            "บันทึกไม่สำเร็จ",
            error?.response?._data?.message || "เกิดข้อผิดพลาด",
        );
    } finally {
        isSubmittingReview.value = false;
    }
}

// --- Map & Trip selection ---
async function toggleTripDetails(tripId) {
    const trip = allTrips.value.find((t) => t.id === tripId);
    if (!trip) return;

    if (!trip.originHasName) {
        const geo = await googleMap.reverseGeocode(
            trip.cooreds[0][0],
            trip.coords[0][1],
        );
        const parts = await googleMap.extractNameParts(geo);
        if (parts.name) trip.origin = parts.name;
    }
    // if (trip)
    googleMap.updateMap(trip);
    selectedTripId.value = selectedTripId.value === tripId ? null : tripId;
}

async function handleConfirmDropoff(tripId) {
    await confirmDropoff(tripId);
}

// Reverse-geocode pass-through after fetch
async function doReverseGeocode(trips) {
    await googleMap.waitMapReady();
    const jobs = trips.map(async (t, idx) => {
        const [o, d] = await Promise.all([
            googleMap.reverseGeocode(t.coords[0][0], t.coords[0][1]),
            googleMap.reverseGeocode(t.coords[1][0], t.coords[1][1]),
        ]);
        const oParts = await googleMap.extractNameParts(o);
        const dParts = await googleMap.extractNameParts(d);
        if (!trips[idx].originHasName && oParts.name)
            trips[idx].origin = oParts.name;
        if (!trips[idx].destinationHasName && dParts.name)
            trips[idx].destination = dParts.name;
    });
    await Promise.allSettled(jobs);
}

onMounted(() => {
    googleMap.loadGoogleMaps(() => {
        fetchMyTrips(doReverseGeocode).then(() => {
            if (filteredTrips.value.length)
                googleMap.updateMap(filteredTrips.value[0]);
        });
    });
});
</script>

<style scoped>
.trip-card {
    transition: all 0.3s ease;
    cursor: pointer;
}
.trip-card:hover {
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
}

.tab-button {
    transition: all 0.3s ease;
}
.tab-button.active {
    background-color: #3b82f6;
    color: white;
    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}
.tab-button:not(.active) {
    background-color: white;
    color: #6b7280;
    border: 1px solid #d1d5db;
}
.tab-button:not(.active):hover {
    background-color: #f9fafb;
    color: #374151;
}

#map {
    height: 100%;
    min-height: 600px;
    border-radius: 0 0 0.5rem 0.5rem;
}
</style>
