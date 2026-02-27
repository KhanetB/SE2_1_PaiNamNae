<template>
    <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="$emit('close')"
    >
        <div
            class="w-4xl p-6 bg-white rounded-lg shadow-xl overflow-y-auto max-h-[90vh]"
        >
            <h3 class="text-3xl font-semibold text-gray-900">
                รีวิวการเดินทาง
            </h3>
            <p class="mt-1 text-2xl font-semibold text-gray-700">
                {{ trip?.origin }} → {{ trip?.destination }}
            </p>
            <p class="mt-1 text-md text-gray-600">
                จุดนัดพบ: {{ trip?.pickupPoint }}
            </p>
            <p class="text-sm text-gray-600">
                วันที่: {{ trip?.date }}
                <span class="mx-2 text-gray-300">|</span>
                เวลา: {{ trip?.time }}
                <span class="mx-2 text-gray-300">|</span>
                ระยะเวลา: {{ trip?.durationText }}
                <span class="mx-2 text-gray-300">|</span>
                ระยะทาง: {{ trip?.distanceText }}
            </p>

            <div class="mt-8 justify-center content-center place-items-center">
                <img
                    :src="trip?.driver?.image"
                    :alt="trip?.driver?.name"
                    class="object-cover w-24 h-24 rounded-full"
                />
                <h5 class="font-medium text-xl text-gray-900 mt-3">
                    {{ trip?.driver?.name }}
                </h5>

                <!-- Star Rating Interactive -->
                <div class="flex text-3xl cursor-pointer select-none">
                    <span
                        v-for="star in 5"
                        :key="star"
                        class="relative"
                        @mousemove="setRating($event, star)"
                        @click="setRating($event, star)"
                    >
                        <span class="text-gray-300">★</span>
                        <span
                            class="absolute left-0 top-0 overflow-hidden text-yellow-400"
                            :style="{ width: getStarFill(star) }"
                            >★</span
                        >
                    </span>
                </div>
                <p class="mt-2 text-sm text-gray-600">{{ localRating }} ดาว</p>

                <!-- Tags -->
                <div class="m-3 flex flex-wrap gap-2">
                    <button
                        v-for="tag in REVIEW_TAGS"
                        :key="tag"
                        @click="toggleTag(tag)"
                        type="button"
                        :class="[
                            'px-3 py-1 text-sm rounded-full border transition',
                            localSelectedTags.includes(tag)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50',
                        ]"
                    >
                        {{ tag }}
                    </button>
                </div>
            </div>

            <!-- Comment -->
            <div class="mt-4">
                <label class="block mb-1 text-md">ความคิดเห็น</label>
                <textarea
                    v-model="localComment"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="เขียนรีวิวที่นี่"
                />
            </div>

            <!-- Photo Upload -->
            <div class="mt-4">
                <label class="block mb-1 text-md"
                    >เพิ่มรูปภาพ (สูงสุด 3 รูป)</label
                >
                <div class="flex gap-3">
                    <div
                        v-for="(url, index) in localPreviewImages"
                        :key="index"
                        class="relative w-48 h-48"
                    >
                        <!-- <img
                            :src="url"
                            class="object-cover w-full h-full rounded-lg border"
                        /> -->
                        <template
                            v-if="
                                localImages[index]?.type?.startsWith('video/')
                            "
                        >
                            <video
                                :src="url"
                                class="object-cover w-full h-full rounded-lg border"
                                controls
                            />
                        </template v-else>

                        <template> <img :src="url" class="object-cover w-full h-full rounded-lg border" /></template>
                        <button
                            @click="removeImage(index)"
                            class="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-2 -right-2"
                        >
                            ✕
                        </button>
                    </div>
                    <div
                        v-if="localPreviewImages.length < 3"
                        @click="triggerFileInput"
                        class="flex items-center justify-center w-48 h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400"
                    >
                        <p class="text-3xl text-gray-600">+</p>
                    </div>
                    <input
                        type="file"
                        ref="fileInput"
                        class="hidden"
                        accept="image/*, video/*"
                        multiple
                        @change="handleFileChange"
                    />
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
                <button
                    @click="$emit('close')"
                    class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    ยกเลิก
                </button>
                <button
                    @click="submit"
                    :disabled="isSubmitting"
                    class="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {{ isSubmitting ? "กำลังส่ง..." : "ส่งรีวิว" }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    show: { type: Boolean, default: false },
    trip: { type: Object, default: null },
    existingReview: { type: Object, default: null }, // { rating, comment, labels, images, id }
    isSubmitting: { type: Boolean, default: false },
});

const emit = defineEmits(["submit", "close"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Local state
const localRating = ref(0);
const localComment = ref("");
const localSelectedTags = ref([]);
const localImages = ref([]); // File objects
const localPreviewImages = ref([]);
const existingImages = ref([]);
const fileInput = ref(null);

const REVIEW_TAGS = [
    "ขับขี่ปลอดภัย",
    "รถสะอาดน่านั่ง",
    "คนขับอัธยาศัยดี",
    "ชอบเพลงที่เปิด",
];
const REVIEW_TAG_MAP = {
    ขับขี่ปลอดภัย: "SAFE_DRIVING",
    รถสะอาดน่านั่ง: "CLEAN_CAR",
    คนขับอัธยาศัยดี: "FRIENDLY_DRIVER",
    ชอบเพลงที่เปิด: "GOOD_MUSIC",
};
const REVIEW_TAG_MAP_REVERSE = {
    SAFE_DRIVING: "ขับขี่ปลอดภัย",
    CLEAN_CAR: "รถสะอาดน่านั่ง",
    FRIENDLY_DRIVER: "คนขับอัธยาศัยดี",
    GOOD_MUSIC: "ชอบเพลงที่เปิด",
};

// When show changes / existingReview changes — populate or reset
watch(
    () => props.show,
    (val) => {
        if (!val) return;
        if (props.existingReview) {
            localRating.value = props.existingReview.rating ?? 0;
            localComment.value = props.existingReview.comment ?? "";
            localSelectedTags.value = (props.existingReview.labels ?? [])
                .map((l) => REVIEW_TAG_MAP_REVERSE[l])
                .filter(Boolean);
            existingImages.value = props.existingReview.images ?? [];
            localImages.value = [];
            localPreviewImages.value = [...existingImages.value];
        } else {
            localRating.value = 0;
            localComment.value = "";
            localSelectedTags.value = [];
            localImages.value = [];
            localPreviewImages.value = [];
            existingImages.value = [];
        }
    },
);

function setRating(event, star) {
    const { left, width } = event.target.getBoundingClientRect();
    localRating.value = event.clientX - left < width / 2 ? star - 0.5 : star;
}
function getStarFill(star) {
    if (localRating.value >= star) return "100%";
    if (localRating.value >= star - 0.5) return "50%";
    return "0%";
}
function toggleTag(tag) {
    const idx = localSelectedTags.value.indexOf(tag);
    if (idx >= 0) localSelectedTags.value.splice(idx, 1);
    else localSelectedTags.value.push(tag);
}
function triggerFileInput() {
    fileInput.value?.click();
}
function handleFileChange(event) {
    const files = Array.from(event.target.files);
    for (const file of files) {
        const isValidType =
            file.type.startsWith("image/") || file.type.startsWith("video/");
        if (!isValidType) {
            alert(
                `ไฟล์ ${file.name} ไม่รองรับ (อนุญาตเฉพาะรูปภาพหรือวิดีโอเท่านั้น)`,
            );
            continue;
        }

        if (file.size > MAX_FILE_SIZE) {
            alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกินกำหนด (25MB)`);
            continue;
        }

        if (localPreviewImages.value.length >= 3) {
            alert("อัปโหลดได้สูงสุด 3 ไฟล์");
            break;
        }

        localImages.value.push(file);
        localPreviewImages.value.push(URL.createObjectURL(file));
        // if (!file.type.sta  rtsWith("image/")) continue;
        //     if (localImages.value.length >= 3) break;
        //     localImages.value.push(file);
        //     localPreviewImages.value.push(URL.createObjectURL(file));
    }
    event.target.value = "";
}
function removeImage(index) {
    if (index < existingImages.value.length) {
        existingImages.value.splice(index, 1);
    } else {
        localImages.value.splice(index - existingImages.value.length, 1);
    }
    localPreviewImages.value.splice(index, 1);
}

function submit() {
    emit("submit", {
        rating: localRating.value,
        comment: localComment.value,
        labels: localSelectedTags.value.map((t) => REVIEW_TAG_MAP[t]).join(","),
        files: localImages.value,
        existingImages: existingImages.value,
        reviewId: props.existingReview?.id ?? null,
    });
}
</script>
