<template>
  <div class="plugin-wrapper">
    <!-- SIDEBAR KIRI -->
    <aside class="sidebar">
      <ul class="sidebar-icons">
        <li :class="{ 'is-active': $route.path === '/checker' }" @click="goTo('/checker')">
          <img src="../ui/assets/icon-checker-default.png" alt="Checker" />
        </li>
        <li :class="{ 'is-active': $route.path === '/component' }" @click="goTo('/component')">
          <img src="../ui/assets/icon-component-default.png" alt="Component" />
        </li>
        <li :class="{ 'is-active': $route.path === '/help' }" @click="goTo('/help')">
          <img src="../ui/assets/icon-help-default.png" alt="Help" />
        </li>
      </ul>
      <div class="sidebar-bottom">
        <button :class="{ 'is-active': $route.path === '/settings' }" @click="goTo('/settings')">
          <img src="../ui/assets/icon-settings-active.png" alt="Settings" />
        </button>
      </div>
    </aside>

    <!-- ISIAN HOME.VUE -->
    <div class="plugin-container">
      <div class="login-container">
        <div class="login-form">
          <h1 class="h1">Plugin Configuration</h1>
          <h7 class="h7 text-light-dark">Please enter your figma design system link</h7>

          <div style="gap: 4px;">
            <label class="body">Design System</label>
            <input
              class="body"
              v-model="store.figmaFileKey"
              type="text"
              placeholder="" 
            />
            <label class="body-small text-light-dark">
              input figma design system link
            </label>
          </div>

          <!-- <div style="gap: 4px;">
            <label class="body">CNN Model</label>
            <input
              class="body"
              v-model="store.cnnModelUrl"
              type="text"
              placeholder=""
            />
            <label class="body-small text-light-dark">
              input cnn model url
            </label>
          </div> -->

          <Button block :disabled="!isFormValid" @click="saveConfig()">
            Save
          </Button>

          <p class="body">
            Need help? Please read this
            <span class="link tutorial-link" @click="goToHelp()">Tutorial</span>
          </p>
        </div>
        <div class="image-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from "../ui/components/Button.vue"
import { useConfigStore } from "../code/configStore.js"

const router = useRouter()
const store = useConfigStore()

// Form valid hanya jika kedua field terisi
const isFormValid = computed(() =>
  store.figmaFileKey.trim().length > 0 &&
  store.cnnModelUrl.trim().length > 0
)

function saveConfig() {
  console.log(
    `[setting.vue] Saving config → Figma File Key: "${store.figmaFileKey}", CNN Model URL: "${store.cnnModelUrl}"`
  )
  parent.postMessage(
    {
      pluginMessage: {
        type: 'save-config',
        figmaFileKey: store.figmaFileKey,
        cnnModelUrl: store.cnnModelUrl
      }
    },
    '*'
  )
  // router.push('/checker')
}

function goToHelp() {
  router.push('/help')
}

function goTo(path) {
  router.push(path)
}
</script>

<style scoped>
/* WRAPPER */
.plugin-wrapper {
  display: flex;
  height: 100vh;
  overflow: visible;
}

/* SIDEBAR */
.sidebar {
  position: relative;   /* buat stacking context */
  z-index: 1;  
  width: 64px;
  background: var(--clr-secondary);
  display: flex;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.15);
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}
.sidebar-icons {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sidebar-icons li,
.sidebar-bottom button {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  background-color: var(--clr-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}
.sidebar img {
  width: 24px;
  height: 24px;
}
.sidebar-icons li.is-active,
.sidebar-bottom button.is-active {
  background-color: #08A94C;
}

/* PLUGIN CONTENT */
.plugin-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  gap: 16px;
}

/* ISIAN HOME.VUE */
.login-container {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
}
.login-form {
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: max-content;
  padding: 0 24px 0 64px;
}

.login-form input {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 5px;
  border: 1px solid #E8ECF5;
  outline: none;
  box-sizing: border-box;
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
}
</style>
