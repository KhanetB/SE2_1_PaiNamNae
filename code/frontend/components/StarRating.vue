<template>
    <div class="flex items-center">
        <div class="flex text-sm text-yellow-400">
            <span>
                {{ '★'.repeat(Math.round(rating)) }}{{ '☆'.repeat(5 - Math.round(rating)) }}
            </span>
        </div>
        <span v-if="showCount" class="ml-2 text-sm text-gray-600">
            {{ rating }} ({{ reviews }} รีวิว)
        </span>
    </div>
</template>

<script setup>
defineProps({
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    showCount: { type: Boolean, default: true },
})
</script>
