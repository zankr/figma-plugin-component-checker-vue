<template>
    <div>
        u ii a ii u ii a

        <button @click="goToChecker()"></button>
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
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
}

.check-button {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #4CAF50;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.check-button:hover {
  transform: translateY(-2px);
  background-color: #45a049;
}

.button-arrow {
  color: white;
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.check-button:hover .button-arrow {
  transform: translateX(4px);
}
</style>