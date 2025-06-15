import { defineStore } from 'pinia'

export const useCheckerStore = defineStore('checker', {
  state: () => ({
    summary: { total: null, valid: null, invalid: null },
    images: [],
    noInvalid: false,
    dataReceived: false,
    isModelReady: false,
    scrollY: 0
  }),
  actions: {
    setSummary(data) {
      this.summary = data
    },
    setImages(list) {
      this.images = list
    },
    addImage(item) {
      this.images.push(item)
    },
    setModelReady(val) {
      this.isModelReady = val
    },
    setFlags({ dataReceived, noInvalid }) {
      this.dataReceived = dataReceived
      this.noInvalid = noInvalid
    },
    setScrollY(y) {
      this.scrollY = y
    }
  }
})
