<template>
    <div class="pt-4 mt-4 mb-5 duration-300 border-t border-gray-300 animate-in slide-in-from-top">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- เส้นทาง -->
            <div>
                <h5 class="mb-2 font-medium text-gray-900">รายละเอียดเส้นทาง</h5>
                <ul class="space-y-1 text-sm text-gray-600">
                    <li>
                        • จุดเริ่มต้น:
                        <span class="font-medium text-gray-900">{{ trip.origin }}</span>
                        <span v-if="trip.originAddress"> — {{ trip.originAddress }}</span>
                    </li>

                    <template v-if="trip.stops && trip.stops.length">
                        <li class="mt-2 text-gray-700">
                            • จุดแวะระหว่างทาง ({{ trip.stops.length }} จุด):
                        </li>
                        <li v-for="(stop, idx) in trip.stops" :key="idx">
                            &nbsp;&nbsp;- จุดแวะ {{ idx + 1 }}: {{ stop }}
                        </li>
                    </template>

                    <li class="mt-1">
                        • จุดปลายทาง:
                        <span class="font-medium text-gray-900">{{ trip.destination }}</span>
                        <span v-if="trip.destinationAddress"> — {{ trip.destinationAddress }}</span>
                    </li>
                </ul>
            </div>

            <!-- รายละเอียดรถ -->
            <div>
                <h5 class="mb-2 font-medium text-gray-900">รายละเอียดรถ</h5>
                <ul class="space-y-1 text-sm text-gray-600">
                    <li v-for="detail in trip.carDetails" :key="detail">• {{ detail }}</li>
                </ul>
            </div>
        </div>

        <!-- ข้อมูลเพิ่มเติม -->
        <div class="mt-4 space-y-4">
            <!-- เงื่อนไข -->
            <div v-if="trip.conditions">
                <h5 class="mb-2 font-medium text-gray-900">เงื่อนไขการเดินทาง</h5>
                <p class="p-3 text-sm text-gray-700 border border-gray-300 rounded-md bg-gray-50">
                    {{ trip.conditions }}
                </p>
            </div>

            <!-- รูปภาพ -->
            <div v-if="trip.photos && trip.photos.length > 0">
                <h5 class="mb-2 font-medium text-gray-900">รูปภาพรถยนต์</h5>
                <div class="grid grid-cols-3 gap-2 mt-2">
                    <div v-for="(photo, index) in trip.photos.slice(0, 3)" :key="index">
                        <img
                            :src="photo"
                            alt="Vehicle photo"
                            class="object-cover w-full transition-opacity rounded-lg shadow-sm cursor-pointer aspect-video hover:opacity-90"
                        />
                    </div>
                </div>
            </div>

            <!-- slot สำหรับ content เพิ่มเติม (เช่น ผู้โดยสารใน myRoute) -->
            <slot />
        </div>
    </div>
</template>

<script setup>
defineProps({
    trip: { type: Object, required: true },
})
</script>

<style scoped>
@keyframes slide-in-from-top {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
}
.animate-in { animation-fill-mode: both; }
.slide-in-from-top { animation-name: slide-in-from-top; }
.duration-300 { animation-duration: 300ms; }
</style>
