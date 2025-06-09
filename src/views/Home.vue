<template>
  <div class="login-container">
    <div class="login-form">
      <h1 class="h1">Design System Component Checker</h1>
      <p class="body">Please enter your design system link and CNN Model</p>

      <label class="h6">Design System Link</label>
      <input type="text" placeholder="email@bukitmakmur.com" />

      <label class="h6">CNN Model</label>   
      <input type="password" placeholder="*****************" />

      <button class="save-button" @click="goToChecker()">Save</button>

      <p class="body help-text">
        Need help? Please read this <span class="link tutorial-link">Tutorial</span>
      </p>
    </div>

    <div class="image-container"></div>
  </div>
</template>


<script setup>

import { useRouter } from 'vue-router'
const router = useRouter();


const goToChecker = () => {
  router.push('/checker');


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
  padding: 12px;
  margin-top: 4px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
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
  margin-top: 15px;
  font-size: 14px;
  color: #555;
}

.tutorial-link {
  color: #0ea045;
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
