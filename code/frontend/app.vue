<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
        <ToastWrapper />
    </div>
</template>

<script setup>
import ToastWrapper from '~/components/ToastWrapper.vue';
useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    }
  ]
})
</script>