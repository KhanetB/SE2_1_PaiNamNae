<script setup>
const route = useRoute()
</script>

<template>
  <div>
    <h1>Passengers Page</h1>
    <p>Route ID: {{ route.params.id }}</p>
  </div>
</template>