<template>
    <label class="inline-flex items-center cursor-pointer select-none switch">
        <input type="checkbox" class="switch-input" :checked="modelValue" :disabled="disabled"
            @change="$emit('update:modelValue', $event.target.checked)" />
        <span class="switch-slider"></span>
    </label>
</template>

<script setup>
defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.switch {
    position: relative;
    width: 42px;
    height: 24px;
}

.switch-input {
    appearance: none;
    -webkit-appearance: none;
    width: 42px;
    height: 24px;
    margin: 0;
    outline: none;
    position: relative;
    cursor: pointer;
}

.switch-slider {
    pointer-events: none;
    position: absolute;
    inset: 0;
    background: #e5e7eb;
    border-radius: 9999px;
    transition: background 0.2s ease;
}

.switch-input:checked+.switch-slider {
    background: #22c55e;
}

.switch-slider::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 9999px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .2);
    transition: transform 0.2s ease;
}

.switch-input:checked+.switch-slider::after {
    transform: translateX(18px);
}

.switch-input:disabled+.switch-slider {
    filter: grayscale(0.4);
    opacity: .6;
}
</style>
