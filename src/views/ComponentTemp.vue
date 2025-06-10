<template>
  <div class="plugin-wrapper">
    <!-- … SIDEBAR & HEADER tetap sama … -->

    <!-- Search bar (opsional, kalau kamu mau) -->
    <div class="search-box">
      <span class="material-icons">search</span>
      <input
        v-model="searchTerm"
        @input="onSearch"
        type="text"
        placeholder="Search components..."
        class="search-input"
      />
    </div>

    <!-- Grid container dengan infinite scroll -->
    <div
      ref="container"
      class="component-container"
      @scroll="onScroll"
    >
      <!-- Spinner loading pertama kali -->
      <div v-if="loading && !isLoadingMore" class="loading-spinner"></div>

      <!-- Card komponen -->
      <div
        v-for="c in filteredComponents"
        :key="c.key"
        class="component-card"
        draggable="true"
        @dragstart="onDragStart"
        @dragend="onDragEnd(c.key)"
      >
        <!-- Thumbnail -->
        <img
          v-if="c.thumbnail_url"
          :src="c.thumbnail_url"
          :alt="c.name"
          class="component-thumbnail"
        />
        <div v-else class="thumbnail-placeholder">…</div>

        <!-- Nama -->
        <p class="component-name">{{ c.name.replace(/^Component\//, '') }}</p>
      </div>

      <!-- Spinner load-more di bawah -->
      <div v-if="isLoadingMore" class="loading-spinner"></div>

      <!-- Bila tidak ada hasil sama sekali -->
      <p v-if="!loading && !filteredComponents.length" class="no-results">
        No components found.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentPage',
  data() {
    return {
      components: [],        // semua batch yang sudah di-fetch
      loading: true,         // true saat batch pertama
      isLoadingMore: false,  // true saat scroll load-more
      isFullyLoaded: false,  // jadi true kalau semua batch sudah diambil
      searchTerm: '',        // filter text
      cursorPos: { x: 0, y: 0 },
      allComponents: [],      // metadata lengkap: { key, name, nodeId }
      searchResults: [],      // hasil search berdasarkan allComponents
      isSearching: false      // apakah sedang menampilkan hasil search?
    }
  },
  computed: {
  displayedComponents() {
    return this.isSearching
      ? this.searchResults
      : this.components
  },
  filteredComponents() {
      // filter by name
      return this.components.filter(c =>
        c.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    }
  },
  created() {
    window.addEventListener('message', this.handleMessage)
  },
  mounted() {
    // minta batch pertama
    parent.postMessage({ pluginMessage: { type: 'load-components' } }, '*')
  },
  beforeUnmount() {
    window.removeEventListener('message', this.handleMessage)
  },
  methods: {
    goToChecker(){
        this.$router.push('/checker');
    },

    goToHelp(){
      this.$router.push('/help');
    },

    goToSettings(){
      this.$router.push('/settings');

    },

    goToComponentPage() {
          this.$router.push('/component');

    },

    handleMessage(event) {
      const msg = event.data.pluginMessage
      if (!msg) return

      // batch pertama atau selanjutnya
      if (msg.type === 'components-loaded') {
        this.components = this.components.concat(msg.components)
        this.isFullyLoaded  = msg.isFullyLoaded
        this.loading        = false
        this.isLoadingMore  = false
      }

      if (msg.type === 'load-failed') {
        alert('Failed to load components: ' + msg.message)
        this.loading       = false
        this.isLoadingMore = false
      }
    },

    onScroll() {
      const c = this.$refs.container
      // ketika scroll hampir di bawah, dan masih ada batch tersisa
      if (
        !this.isLoadingMore &&
        !this.isFullyLoaded &&
        c.scrollTop + c.clientHeight >= c.scrollHeight - 20
      ) {
        this.isLoadingMore = true
        parent.postMessage({
          pluginMessage: {
            type: 'load-more-components',
            currentLength: this.components.length
          }
        }, '*')
      }
    },

    onSearch() {
      // nothing extra—filteredComponents akan otomatis update
    },

    onDragStart(e) {
      // sembunyikan default drag image
      e.dataTransfer.setDragImage(new Image(), 0, 0)
    },

    onDragEnd(key) {
      return e => {
        // simpan posisi kursor untuk insert
        this.cursorPos = { x: e.clientX, y: e.clientY }
        parent.postMessage({
          pluginMessage: {
            type: 'insert-component',
            key,
            cursorPosition: this.cursorPos
          }
        }, '*')
      }
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
.sidebar {
  width: 64px;
  background: var(--clr-secondary);
  display: flex;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.15);
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 16px;
}
.component-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid #E8ECF5;
  border-radius: 20px;
  cursor: pointer;
  background: #fff;
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
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e8ecf5;
  border-radius: 5px;
  background: #fff;
  margin: 16px;
}
.search-box input {
  border: none;
  outline: none;
  width: 100%;
}
</style>
