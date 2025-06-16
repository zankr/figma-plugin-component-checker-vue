<template>
  <div class="plugin-wrapper">
    <!-- SIDEBAR KIRI -->
    <aside class="sidebar">
      <ul class="sidebar-icons">
        <li
          class="tooltip-container"
          @click="goToChecker"
          :class="{ 'is-active': $route.path === '/checker' }"
        >
          <img src="../ui/assets/icon-checker-default.png" alt="Checker" />
          <span class="tooltip-text">Component Checker</span>
        </li>
        <li
          class="tooltip-container"
          @click="goToComponentPage"
          :class="{ 'is-active': $route.path === '/component' }"
        >
          <img src="../ui/assets/icon-component-active.png" alt="Component" />
          <span class="tooltip-text">Component Library</span>
        </li>
        <li
          class="tooltip-container"
          @click="goToHelp"
          :class="{ 'is-active': $route.path === '/help' }"
        >
          <img src="../ui/assets/icon-help-default.png" alt="Help" />
          <span class="tooltip-text">Help</span>
        </li>
      </ul>
      <div class="sidebar-bottom">
        <button
          class="tooltip-container"
          @click="goToSettings"
          :class="{ 'is-active': $route.path === '/settings' }"
        >
          <img src="../ui/assets/icon-settings-default.png" alt="Settings" />
          <span class="tooltip-text">Settings</span>
        </button>
      </div>
    </aside>

    <!-- ISI UTAMA -->
    <div class="plugin-container">
      <div class="plugin-header">
        <div class="header-text">
          <h4 class="h4 bold">Design System Components</h4>
          <p class="h7 text-light-dark">
            Showcases all components available in the design system
          </p>
          <div class="search-box">
            <input
              v-model="store.searchTerm"
              @input="onSearch"
              type="text"
              placeholder="Search component"
              class="body-small"
            />
          </div>
        </div>
        <div class="header-illustration">
          <img src="../ui/assets/img-background-ds.png" alt="Illustration" />
        </div>
      </div>

      <div ref="container" class="component-container" @scroll="onScroll">
        <div v-if="store.loading && !store.isLoadingMore" class="loading-spinner"></div>

        <div v-for="c in filteredComponents" :key="c.key" class="component-card">
          <p class="h7">{{ c.name.replace(/^Component\//, '') }}</p>
          <div class="img-container">
            <img
              v-if="c.thumbnail_url"
              :src="c.thumbnail_url"
              :alt="c.name"
              class="component-thumbnail"
            />
          </div>
          <Button block @click="insertComponent(c.key)">
            Insert Component
          </Button>
        </div>

        <div v-if="store.isLoadingMore" class="loading-spinner"></div>
        <p v-if="!store.loading && !filteredComponents.length" class="no-results">
          No components found.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Button from '../ui/components/Button.vue'
import { useComponentStore } from '../code/componentStore'
import { useConfigStore } from '../code/configStore'
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'

export default {
  name: 'ComponentPage',
  components: { Button },

  setup() {
    const config    = useConfigStore()
    const store     = useComponentStore()
    const container = ref(null)

    // 1) Watch: hanya reset & reload jika figmaFileKey benar-benar berubah
    watch(
      () => config.figmaFileKey,
      (newKey, oldKey) => {
        if (newKey && newKey !== oldKey) {
          store.resetStore()
          store.setCurrentFileKey(newKey)
          parent.postMessage({
            pluginMessage: {
              type: 'load-components',
              figmaFileKey: newKey
            }
          }, '*')
        }
      }
    )

    const filteredComponents = computed(() =>
      store.components.filter(c =>
        c.name.toLowerCase().includes(store.searchTerm.toLowerCase())
      )
    )

    const onScroll = () => {
      const c = container.value
      if (
        !store.isLoadingMore &&
        !store.isFullyLoaded &&
        c.scrollTop + c.clientHeight >= c.scrollHeight - 20
      ) {
        store.setFlags({
          loading: false,
          isLoadingMore: true,
          isFullyLoaded: false
        })
        parent.postMessage({
          pluginMessage: {
            type: 'load-more-components',
            currentLength: store.components.length
          }
        }, '*')
      }
    }

    const handleMessage = (event) => {
      const msg = event.data.pluginMessage
      if (!msg) return

      if (msg.type === 'components-loaded') {
        store.appendComponents(msg.components)
        store.setFlags({
          loading: false,
          isLoadingMore: false,
          isFullyLoaded: msg.isFullyLoaded
        })
      }
      if (msg.type === 'load-failed') {
        alert('Failed to load components: ' + msg.message)
        store.setFlags({
          loading: false,
          isLoadingMore: false,
          isFullyLoaded: false
        })
      }
    }

    const onSearch = () => {}
    const insertComponent = (key) =>
      parent.postMessage({ pluginMessage: { type: 'insert-component', key } }, '*')
    const goToChecker = () => {
      store.setScrollY(window.scrollY)
      window.scrollTo(0, 0)
      window.removeEventListener('message', handleMessage)
      location.href = '#/checker'
    }
    const goToHelp = () => {
      store.setScrollY(window.scrollY)
      location.href = '#/help'
    }
    const goToSettings = () => {
      store.setScrollY(window.scrollY)
      location.href = '#/settings'
    }
    const goToComponentPage = () => {}

    onMounted(() => {
      window.scrollTo(0, store.scrollY)
      window.addEventListener('message', handleMessage)

      // 2) Pada mount: compare currentFileKey vs config.figmaFileKey
      const key = config.figmaFileKey
      if (store.currentFileKey !== key) {
        store.resetStore()
        store.setCurrentFileKey(key)
        parent.postMessage({
          pluginMessage: {
            type: 'load-components',
            figmaFileKey: key
          }
        }, '*')
      }
    })

    onBeforeUnmount(() => {
      store.setScrollY(window.scrollY)
      window.removeEventListener('message', handleMessage)
    })

    return {
      store,
      container,
      filteredComponents,
      onScroll,
      onSearch,
      insertComponent,
      goToChecker,
      goToHelp,
      goToSettings,
      goToComponentPage
    }
  }
}
</script>



<style scoped>
/* WRAPPER */
.plugin-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* SIDEBAR */


.tooltip-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tooltip-text {
  position: absolute;
  left: 48px; /* Jarak ke kanan dari ikon */
  top: 50%;
  transform: translateY(-50%);
  background-color: #333F47;
  color: #F5F5F5;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.tooltip-container:hover .tooltip-text {
  opacity: 1;
}

/* Arrow segitiga di kiri */
.tooltip-text::before {
  content: "";
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #2D2F36;
}

.sidebar {
  width: 64px;
  background: var(--clr-secondary);
  display: flex;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.15);
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  overflow: visible;
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
  padding: 0;
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

/* MAIN CONTENT */
.plugin-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  gap: 16px;
}

/* HEADER */
.plugin-header {
  display: flex;
  justify-content: space-between;
  background: #F5F8FA;
  padding: 24px 16px;
  padding-right: 40px;
  height: 144px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-illustration img {
  max-width: 200px;
  height: auto;
}

.component-container {
  height: calc(100vh - 120px);
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
}
.component-card {
  display: flex;
  width: 221px;
  height: 272px;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border: 1px solid #E8ECF5;
  border-radius: 10px;
  background: #fff;
}

.img-container {
  
  display: flex;
  justify-content: center;
  align-items: center;
  width: 189px;
  height: 152px;
  background-color: #F5F8FA;
  border-radius: 10px;
  padding: 8px;
  /* overflow: hidden; */
}

.component-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 10px;
}
.thumbnail-placeholder {
  width: 100px;
  height: 100px;
  background: #F5F8FA;
  border-radius: 10px;
  margin-bottom: 10px;
}
.component-name {
  font-size: 12px;
  text-align: center;
}
.loading-spinner {
  grid-column: 1 / -1;
  justify-self: center;
  border: 4px solid rgba(0,0,0,0.1);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px; height: 30px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg) }
}
.no-results {
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
}
.search-box {
  height: 40px;
  width: 215px;
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #E8ECF5;
  border-radius: 5px;
  background: #fff;
  
}
.search-box input {
  border: none;
  outline: none;
  width: 100%;
}
</style>