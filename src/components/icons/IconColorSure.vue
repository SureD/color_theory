<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" :fill="wavelengthToColor" />
  </svg>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

const props = defineProps<{
  wavelength: number
}>()

const wavelengthToColor = computed(() => {
  // Ensure wavelength is within valid range
  const clampedWavelength = Math.max(380, Math.min(780, props.wavelength))

  const normalizedWavelength = (clampedWavelength - 380) / (780 - 380)

  const red = Math.round(255 * (1 - normalizedWavelength))
  const blue = Math.round(255 * normalizedWavelength)

  return `rgb(${red}, 0, ${blue})`
})
</script>
