<template>
  <button
    v-bind="$attrs"
    class="custom-button"
    :class="[ variantClass, 'body', textColorClass, { 'custom-button--block': block } ]"
    :disabled="disabled"
  >
    <slot>Button</slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  inheritAttrs: true, // biarkan Vue meneruskan listener & attrs ke elemen <button>
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: val => ['primary', 'secondary-light'].includes(val)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false // true = fill container, false = hug content
    }
  },
  computed: {
    variantClass() {
      return `custom-button--${this.variant}`;
    },
    textColorClass() {
      return this.variant === 'primary' ? 'text-white' : 'text-dark';
    }
  }
};
</script>

<style scoped>
.custom-button {
  border: none;
  padding: 12px 16px;
  border-radius: 5px;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  width: fit-content; /* hug content secara default */
}

.custom-button--block {
  width: 100%; /* fill container jika block = true */
}

/* VARIANT STYLES */
.custom-button--primary {
  background-color: #08A94C;
}
.custom-button--primary:hover {
  background-color: #079344;
}
.custom-button--secondary-light {
  background-color: #f5f8fa;
  border: 1px solid #e8ecf5;
}
.custom-button--secondary-light:hover {
  background-color: #e4eaf0;
}

/* DISABLED */
.custom-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
