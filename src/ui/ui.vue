<script lang="ts" setup>
import SampleComponent from "./components/sample-component.vue";
import ButtonOzan from "./components/button.vue"
</script>

<template>
  <div style="display: flex; flex-direction: horizontal; gap: 24px;">
    <ButtonOzan id="check-components">Primary</ButtonOzan>
    <ButtonOzan variant="secondary" id="check-components">Secondary</ButtonOzan>
  </div>
</template>

<style lang="css">
body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f7;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

h1 {
  font-size: 24px;
  color: #007aff;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #08A94C;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #005bb5;
}

#summary {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
}

#image-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: 400px;
}

.image-card {
  padding: 16px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.image-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-card img {
  max-width: 100%;
  border-radius: 4px;
  margin-top: 8px;
}

.cnn-result {
  margin-top: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #ff3b30;
}

.master-preview {
  margin-top: 10px;
  font-size: 14px;
  color: #007aff;
}

.variant-choice {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.variant-card {
  width: 48%;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border 0.3s;
}

.variant-card:hover {
  border: 2px solid #007aff;
}

.variant-card img {
  width: 100%;
  display: block;
}

.variant-name {
  text-align: center;
  font-size: 12px;
  margin: 4px 0;
}
</style>
