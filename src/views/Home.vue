<template>
  <div class="login-container">
    <div class="login-form">
      <h1 class="h1">Design System Component Checker</h1>
      <h7 class="h7 text-light-dark">Please enter your figma design system link</h7>

      <div style="gap: 4px;">
        <label class="body">Design System</label>
        <input class="body" v-model="store.figmaFileKey" type="text" placeholder="" />
        <label class="body-small text-light-dark">input figma design system link</label>  
      </div>
      
      <!-- <div style="gap: 4px;">
        <label class="body">CNN Model</label>   
        <input class="body" v-model="store.cnnModelUrl" type="text" placeholder="" />
        <label class="body-small text-light-dark">input cnn model url</label>
      </div> -->
      
      <Button block="true" :disabled="!isFormValid" @click="saveConfig()">Save</Button>

      <p class="body">
        Need help? Please read this <span class="link tutorial-link" @click="goToHelp()">Tutorial</span>
      </p>
    </div>

    <div class="image-container"></div>
  </div>
</template>


<script setup>

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../ui/components/Button.vue';
import { useConfigStore } from '../code/configStore.js';

const router = useRouter();
const store  = useConfigStore();

// computed untuk mengecek form valid: kedua field tidak kosong (trimmed)
const isFormValid = computed(() => {
  return (
    store.figmaFileKey.trim().length > 0 &&
    store.cnnModelUrl.trim().length > 0
  )
})

function saveConfig() {

  
  console.log(
    `[Home.vue] Saving config → Figma File Key: "${store.figmaFileKey}", CNN Model URL: "${store.cnnModelUrl}"`
  )

  parent.postMessage(
    {
      pluginMessage: {
        type: 'save-config',
        figmaFileKey: store.figmaFileKey,
        cnnModelUrl:   store.cnnModelUrl
      }
    },
    '*'
  );
  router.push('/checker');
}

function goToHelp (){
  router.push('/help');
}




</script>

<style scoped>
.login-container {
    
  display: flex;
  /* border: 2px solid #0ea045;   /* tebal 2px, warna hijau */
  /* border-radius: 8px;   */ 
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  /* height: 100vh; */
  /* padding: 2rem 4rem; */
  /* padding-right: 24px;
  padding-left: 24px; */
  background-color: #fff;
  /* overflow: hidden;   */
}

.login-form {
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: max-content;
  padding-right: 24px;
  padding-left: 64px;
  /* gap: 16px; */
}
/* 
.login-form h1 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #333;
}

.login-form p {
  color: #7a7a7a;
  margin-bottom: 20px;
}

.login-form label {
  display: block;
  color: #555;
  margin-top: 15px;
} */

.login-form input {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  margin-top: 4px;
  margin-bottom: 4px;
  border-radius: 5px;
  border: 1px solid #E8ECF5;
  outline: none;
  box-sizing: border-box;
}

.save-button {
  background-color: #0ea045;
  color: white;
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.save-button:hover {
  background-color: #098634;
}

.help-text {
  /* margin-top: 15px; */
  font-size: 14px;
  color: #555;
}

.tutorial-link {
  color: #08A94C;
  cursor: pointer;
  font-weight: bold;
}

.image-container {
  width: 80%;
  height: 100vh;
  background-image: url('../ui/assets/img-home-background.png');
  background-size: cover;
  background-position: left center;
  /* border-radius: 20px; */
  /* clip-path: polygon(0% 0%, 100% 0%, 80% 50%, 100% 100%, 0% 100%); */
}
</style>
