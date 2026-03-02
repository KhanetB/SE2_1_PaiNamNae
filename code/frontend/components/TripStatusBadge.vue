<template>
    <span v-if="label" :class="['status-badge', badgeClass]">{{ label }}</span>
</template>

<script setup>
const props = defineProps({
    status: { type: String, required: true },
    /** 'passenger' | 'driver' | 'route' */
    context: { type: String, default: 'passenger' },
})

const PASSENGER_MAP = {
    pending: { label: 'รอดำเนินการ', cls: 'status-pending' },
    confirmed: { label: 'ยืนยันแล้ว', cls: 'status-confirmed' },
    in_transit: { label: 'กำลังเดินทาง', cls: 'status-confirmed' },
    passenger_confirmed_arrival: { label: 'รอการยืนยันจากคนขับ', cls: 'status-confirmed' },
    rejected: { label: 'ปฏิเสธ', cls: 'status-rejected' },
    cancelled: { label: 'ยกเลิก', cls: 'status-cancelled' },
    mytrip: { label: 'เส้นทางของฉัน', cls: 'status-mytrip' },
    completed: { label: 'เสร็จสิ้น', cls: 'status-completed' },
}

const DRIVER_MAP = {
    pending: { label: 'รอดำเนินการ', cls: 'status-pending' },
    confirmed: { label: 'ยืนยันแล้ว', cls: 'status-confirmed' },
    completed: { label: 'ผู้โดยสารถึงที่หมาย', cls: 'status-confirmed' },
    in_transit: { label: 'กำลังเดินทาง', cls: 'status-pending' },
    rejected: { label: 'ปฏิเสธ', cls: 'status-rejected' },
    cancelled: { label: 'ยกเลิก', cls: 'status-cancelled' },
    passenger_confirmed_arrival: { label: 'คำขอถึงที่หมาย', cls: 'status-transit' },
}

const ROUTE_MAP = {
    available: { label: 'เปิดรับผู้โดยสาร', cls: 'status-confirmed' },
    full: { label: 'เต็ม', cls: 'status-pending' },
    completed: { label: 'เสร็จสิ้น', cls: 'status-completed' },
    cancelled: { label: 'ยกเลิก', cls: 'status-cancelled' },
    in_transit: { label: 'กำลังเดินทาง', cls: 'status-transit' },
}

const MAP = props.context === 'driver' ? DRIVER_MAP
    : props.context === 'route' ? ROUTE_MAP
    : PASSENGER_MAP

const entry = computed(() => MAP[props.status] ?? null)
const label = computed(() => entry.value?.label ?? null)
const badgeClass = computed(() => entry.value?.cls ?? '')

import { computed } from 'vue'
</script>

<style scoped>
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
}
.status-pending    { background-color: #fef3c7; color: #d97706; }
.status-confirmed  { background-color: #d1fae5; color: #065f46; }
.status-rejected   { background-color: #fee2e2; color: #dc2626; }
.status-cancelled  { background-color: #f3f4f6; color: #6b7280; }
.status-mytrip     { background-color: #e0e7ff; color: #3730a3; }
.status-completed  { background-color: #d1fae5; color: #065f46; }
.status-transit    { background-color: #dbeafe; color: #1d4ed8; }
</style>
