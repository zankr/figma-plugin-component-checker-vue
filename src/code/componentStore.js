import { defineStore } from 'pinia'

export const useComponentStore = defineStore('componentStore', {
  state: () => ({
    components: [],
    loading: true,
    isLoadingMore: false,
    isFullyLoaded: false,
    searchTerm: '',
    scrollY: 0
  }),
  actions: {
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
      this.loading = loading
      this.isLoadingMore = isLoadingMore
      this.isFullyLoaded = isFullyLoaded
    },
    setSearchTerm(term) {
      this.searchTerm = term
    }
  }
}) 
