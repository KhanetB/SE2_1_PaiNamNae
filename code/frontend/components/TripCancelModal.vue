<template>
    <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="$emit('close')"
    >
        <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 class="text-lg font-semibold text-gray-900">เลือกเหตุผลการยกเลิก</h3>
            <p class="mt-1 text-sm text-gray-600">โปรดเลือกเหตุผลตามตัวเลือกที่กำหนด</p>

            <div class="mt-4">
                <label class="block mb-1 text-sm text-gray-700">เหตุผล</label>
                <select
                    v-model="selectedReason"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="" disabled>-- เลือกเหตุผล --</option>
                    <option v-for="r in CANCEL_REASONS" :key="r.value" :value="r.value">
                        {{ r.label }}
                    </option>
                </select>
                <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
            </div>

            <div class="flex justify-end gap-2 mt-6">
                <button
                    @click="$emit('close')"
                    class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    ปิด
                </button>
                <button
                    @click="submit"
                    :disabled="!selectedReason || isSubmitting"
                    class="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                    {{ isSubmitting ? 'กำลังส่ง...' : 'ยืนยันการยกเลิก' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    show: { type: Boolean, default: false },
    isSubmitting: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'close'])

const selectedReason = ref('')
const error = ref('')

const CANCEL_REASONS = [
    { value: 'CHANGE_OF_PLAN', label: 'เปลี่ยนแผน/มีธุระกะทันหัน' },
    { value: 'FOUND_ALTERNATIVE', label: 'พบวิธีเดินทางอื่นแล้ว' },
    { value: 'DRIVER_DELAY', label: 'คนขับล่าช้าหรือเลื่อนเวลา' },
    { value: 'PRICE_ISSUE', label: 'ราคาหรือค่าใช้จ่ายไม่เหมาะสม' },
    { value: 'WRONG_LOCATION', label: 'เลือกจุดรับ–ส่งผิด' },
    { value: 'DUPLICATE_OR_WRONG_DATE', label: 'จองซ้ำหรือจองผิดวัน' },
    { value: 'SAFETY_CONCERN', label: 'กังวลด้านความปลอดภัย' },
    { value: 'WEATHER_OR_FORCE_MAJEURE', label: 'สภาพอากาศ/เหตุสุดวิสัย' },
    { value: 'COMMUNICATION_ISSUE', label: 'สื่อสารไม่สะดวก/ติดต่อไม่ได้' },
]

function submit() {
    if (!selectedReason.value) {
        error.value = 'กรุณาเลือกเหตุผล'
        return
    }
    error.value = ''
    emit('confirm', selectedReason.value)
}

function reset() {
    selectedReason.value = ''
    error.value = ''
}

defineExpose({ reset })
</script>
