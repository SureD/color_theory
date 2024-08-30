<template>
  <div class="ColorTheory">
    <h1>Color Theory</h1>
    <HumanSensitivity />
  </div>
</template>

<script>
import HumanSensitivity from '@/components/HumanSensitivity.vue'

export default {
  name: 'ColorTheory',
  components: {
    HumanSensitivity
  }
}
</script>

<style scoped>
.color-theory {
  background-color: #0a0a0a;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 20px;
  border: 1px solid #00ff00;
  box-shadow: 0 0 10px #00ff00;
}

h1 {
  text-transform: uppercase;
  letter-spacing: 2px;
  border-bottom: 2px solid #00ff00;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

/* Add a glowing effect on hover */
.color-theory:hover {
  box-shadow: 0 0 20px #00ff00;
}

/* Optional: Add a scanline effect */
.color-theory::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 255, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 50%);
  background-size: 100% 4px;
  pointer-events: none;
}
</style>
