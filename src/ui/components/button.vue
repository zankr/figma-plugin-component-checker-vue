<!-- BaseButton.vue -->
<template>
  <button :class="buttonClasses">
    <slot>Button</slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

// Define props with validation
const props = defineProps({
  /** 
   * Which color variant to use. 
   * Accepts "primary", "secondary" or "tertiary".
   */
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'tertiary'].includes(v)
  }
})

// Compute the CSS classes based on variant
const buttonClasses = computed(() => ['btn', `btn--${props.variant}`])
</script>

<style scoped>
/* Base styles shared by all variants */
.btn {
  border: none;
  padding: 0.5em 1em;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color .2s ease, color .2s ease;
}

/* Primary (green) */
.btn--primary {
  background-color: #28a745;
  color: #ffffff;
}
.btn--primary:hover {
  background-color: #218838;
}

/* Secondary (blue) */
.btn--secondary {
  background-color: #007bff;
  color: #ffffff;
}
.btn--secondary:hover {
  background-color: #0069d9;
}

/* Tertiary (light gray background, dark text, outlined) */
.btn--tertiary {
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #ced4da;
}
.btn--tertiary:hover {
  background-color: #e2e6ea;
}
</style>
