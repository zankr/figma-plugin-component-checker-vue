<template>
  <transition name="fade">
    <div v-if="visible" class="alert-overlay">
      <div class="alert-box" style="justify-content: center;">
        
        <div class="header-illustration">
            <img src="../assets/modal-illustration.png"/>
        </div>
        <h3 class="h3">Hooray!</h3>
        <p class="body">{{ message }}</p>
        <div style="justify-content: center;">
          <Button class="alert-button" @click="$emit('close')">Close</Button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps } from 'vue'
import Button from "../components/Button.vue"


const props = defineProps({
  visible: Boolean,
  message: String
})
</script>

<style scoped>
.alert-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.alert-box {
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  max-width: 90%;
  text-align: center;
  gap: 16px;
  height: 320px;
  width: 500;
}
.alert-message {
  margin-bottom: 16px;
  font-size: 16px;
  color: #333;
}
.alert-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #08A94C;
  color: white;
  cursor: pointer;
}
.alert-button:hover {
  opacity: 0.9;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.header-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-illustration img {
  max-width: 140px;
  height: 140px;
}


</style>
