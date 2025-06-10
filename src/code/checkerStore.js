import { defineStore } from 'pinia'

export const useCheckerStore = defineStore('checker', {
  state: () => ({
    images: [],
    summary: { total: null, valid: null, invalid: null },
    noInvalid: false,
    dataReceived: false,
  }),
  actions: {
    clearAll() {
      this.images = []
      this.summary = { total: null, valid: null, invalid: null }
      this.noInvalid = false
      this.dataReceived = false
    },
    setSummary({ total, valid, invalid }) {
      this.summary = { total, valid, invalid }
      this.noInvalid = invalid === 0
      this.dataReceived = true
    },
    addImage(item) {
      this.images.push(item)
    },
    updateImage(id, payload) {
      const i = this.images.findIndex(x => x.id === id)
      if (i !== -1) Object.assign(this.images[i], payload)
    },
    setVariants(originalId, variants) {
      const i = this.images.findIndex(x => x.id === originalId)
      if (i !== -1) this.images[i].variants = variants
    },
  },
})
