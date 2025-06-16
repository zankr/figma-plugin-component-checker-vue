import { defineStore } from 'pinia'

export const useComponentStore = defineStore('componentStore', {
  state: () => ({
    components: [],
    loading:     true,
    isLoadingMore: false,
    isFullyLoaded: false,
    searchTerm:  '',
    scrollY:     0,
    // 1) Tambahkan ini:
    currentFileKey: ''
  }),
  actions: {
    // 2) Tambahkan ini:
    resetStore() {
      this.components       = []
      this.loading          = true
      this.isLoadingMore    = false
      this.isFullyLoaded    = false
      this.searchTerm       = ''
      this.scrollY          = 0
      this.currentFileKey   = ''
    },
    // 3) Tambahkan ini:
    setCurrentFileKey(key) {
      this.currentFileKey = key
    },

    setComponents(list) {
      this.components = list
    },
    appendComponents(newList) {
      this.components = [...this.components, ...newList]
    },
    setScrollY(y) {
      this.scrollY = y
    },
    setFlags({ loading, isLoadingMore, isFullyLoaded }) {
      this.loading       = loading
      this.isLoadingMore = isLoadingMore
      this.isFullyLoaded = isFullyLoaded
    },
    setSearchTerm(term) {
      this.searchTerm = term
    }
  }
})
