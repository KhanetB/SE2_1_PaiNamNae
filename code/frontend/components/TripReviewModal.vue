<template>
    <!-- MAIN MODAL -->
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="$emit('close')">
        <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <!-- HEADER -->
            <div class="mb-4 pb-3 ">
                <h3 class="text-2xl font-semibold text-gray-900">
                    ให้คะแนนการเดินทาง
                </h3>

                <p class="text-sm text-gray-500 mt-1">
                    {{ trip?.origin }} → {{ trip?.destination }}
                    <span class="mx-2">•</span>
                    {{ trip?.date }} {{ trip?.time }}
                </p>
            </div>

            <!-- DRIVER HERO + REQUIRED RATING -->
            <div class="flex flex-col items-center py-2">
                <img :src="trip?.driver?.image" :alt="trip?.driver?.name"
                    class="w-20 h-20 rounded-full object-cover border" />

                <p class="mt-3 text-lg font-medium text-gray-900">
                    {{ trip?.driver?.name }}
                </p>

                <p class="text-xs text-gray-400 mt-1">
                    ให้คะแนน <span class="text-red-500">*</span>
                </p>

                <!-- STAR -->
                <div class="flex gap-2 text-4xl mt-2 select-none">
                    <button v-for="star in 5" :key="star" type="button" @click="setRating(star)"
                        class="cursor-pointer transition hover:scale-110" :aria-label="`ให้ ${star} ดาว`">
                        <span :class="localRating >= star
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            ">
                            ★
                        </span>
                    </button>
                </div>

                <p class="text-sm text-gray-500 mt-2">
                    {{ localRating || 0 }} จาก 5 ดาว
                </p>
            </div>

            <!-- TAGS OPTIONAL -->
            <div class="mt-6">
                <p class="text-sm font-medium text-gray-800 mb-2">
                    ความประทับใจ
                    <span class="text-gray-400">(ไม่บังคับ)</span>
                </p>

                <div class="flex flex-wrap gap-2">
                    <button v-for="tag in REVIEW_TAGS" :key="tag" @click="toggleTag(tag)" type="button"
                        class="cursor-pointer px-3 py-1.5 text-sm rounded-full border transition" :class="localSelectedTags.includes(tag)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            ">
                        {{ tag }}
                    </button>
                </div>
            </div>

            <!-- COMMENT OPTIONAL -->
            <div class="mt-6">
                <label class="text-sm font-medium text-gray-800">
                    เขียนรีวิวเพิ่มเติม
                    <span class="text-gray-400">(ไม่บังคับ)</span>
                </label>

                <textarea v-model="localComment" rows="4"
                    placeholder="เล่าประสบการณ์ เช่น ความตรงต่อเวลา ความสะอาด การขับขี่"
                    class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <!-- UPLOAD OPTIONAL -->
            <div class="mt-6">
                <p class="text-sm font-medium text-gray-800 mb-2">
                    เพิ่มรูปหรือวิดีโอประกอบ
                    <span class="text-gray-400">(ไม่บังคับ, ขนาดไม่เกิน 10 MB , สูงสุด 3 ไฟล์)</span>
                </p>

                <div class="flex gap-3 flex-wrap">
                    <div v-for="(url, index) in localPreviewImages" :key="index" class="relative w-32 h-32">
                        <template v-if="localImages[index]?.type?.startsWith('video/')">
                            <video :src="url" class="w-full h-full object-cover rounded-lg border" controls />
                        </template>

                        <template v-else>
                            <img :src="url" class="w-full h-full object-cover rounded-lg border" />
                        </template>

                        <button @click="removeImage(index)"
                            class="cursor-pointer absolute -top-2 -right-2 w-5 h-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                            ✕
                        </button>
                    </div>

                    <!-- ADD -->
                    <div v-if="localPreviewImages.length < 3" @click="triggerFileInput"
                        class="cursor-pointer w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-blue-400">
                        <span class="text-2xl text-gray-500">+</span>
                    </div>

                    <input type="file" ref="fileInput" class="hidden" accept="image/*,video/*" multiple
                        @change="handleFileChange" />
                </div>
            </div>

            <!-- FOOTER CTA -->
            <div class="mt-8 pt-4 flex justify-end gap-3">
                <button @click="$emit('close')"
                    class="cursor-pointer px-5 py-2.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                    ยกเลิก
                </button>

                <button @click="submit" :disabled="isSubmitting || !localRating"
                    class="cursor-pointer px-6 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40">
                    {{ isSubmitting ? "กำลังส่ง..." : "ส่งรีวิว" }}
                </button>
            </div>
        </div>
    </div>

    <!-- confirm -->
    <div v-if="showConfirm" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40"
        @click.self="showConfirm = false">
        <div
            class="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-[400px] overflow-hidden border border-white animate-[modalIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
            <div class="p-8 pb-6">
                <div class="flex flex-col items-center text-center">
                    <h3 class="text-[18px] font-bold text-gray-900 mb-2 cursor-pointer"> ยืนยันการส่งรีวิว </h3>
                    <p class="text-[14px] text-gray-700 leading-relaxed px-4"> รีวิวนี้จะถูกบันทึกเข้าสู่ระบบ <br /> <span
                            class="text-gray-700 font-semibold">และไม่สามารถแก้ไขหรือลบภายหลังได้</span> </p>
                </div>
                <div class="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                    <div class="space-y-1">
                        <p class="text-[11px] font-medium text-slate-400 uppercase tracking-widest">คะแนนที่ให้</p>
                        <div class="flex items-center gap-1.5">
                            <div class="flex gap-0.5"> <template v-for="n in 5" :key="n"> <span
                                        :class="n <= localRating ? 'text-amber-400' : 'text-slate-200'"
                                        class="text-[16px]">★</span> </template>
                            </div> <span class="text-[14px] font-medium text-slate-700 ml-1">{{ localRating }}
                                ดาว</span>
                        </div>
                    </div>
                    <div class="text-right space-y-1">
                        <p class="text-[11px] font-medium text-slate-400 uppercase tracking-widest">คนขับ</p>
                        <p class="text-[14px] font-medium text-slate-800 tracking-tight"> {{ trip?.driver?.name ||
                            'ไม่ระบุชื่อ' }} </p>
                    </div>
                </div>
            </div>
            <div class="px-8 pb-8 flex gap-3"> <!-- cancel LEFT --> <button @click="showConfirm = false"
                    class="flex-1 h-12 text-[14px] font-medium rounded-xl border bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-700 cursor-pointer">
                    กลับไปแก้ไข </button> <!-- confirm RIGHT --> <button @click="confirmSubmit"
                    class="flex-[1.3] h-12 text-[15px] font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                    ยืนยันและส่งรีวิว </button> </div>
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

const emit = defineEmits(["submit", "close", "toast"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Local state
const localRating = ref(0);
const localComment = ref("");
const localSelectedTags = ref([]);
const localImages = ref([]); // File objects
const localPreviewImages = ref([]);
const existingImages = ref([]);
const fileInput = ref(null);

// confirmation modal state
const showConfirm = ref(false);

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

function handleToast(payload) {
    toast[payload.type](payload.title, payload.message)
}

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

function setRating(star) {
    localRating.value = star;
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
            alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกินกำหนด (10MB)`);
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

// function submit() {
//     emit("submit", {
//         rating: localRating.value,
//         comment: localComment.value,
//         labels: localSelectedTags.value.map((t) => REVIEW_TAG_MAP[t]).join(","),
//         files: localImages.value,
//         existingImages: existingImages.value,
//         reviewId: props.existingReview?.id ?? null,
//     });
// }

function submit() {
    if (localRating.value === 0) {

        emit("toast", {
            type: "warning",
            title: "ยังไม่ได้ให้คะแนน",
            message: "กรุณาเลือกจำนวนดาวก่อนส่งรีวิว"
        })

        return
    }

    showConfirm.value = true
}

function confirmSubmit() {
    showConfirm.value = false;

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
