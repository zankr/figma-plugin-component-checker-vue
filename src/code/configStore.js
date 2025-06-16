import { defineStore } from 'pinia'

export const useConfigStore = defineStore('configStore', {
  state: () => ({
    // sekarang namanya figmaFileKey
    figmaFileKey: 'HIHSBFb6tatYWQYl2LudlV',
    cnnModelUrl:  'https://zankr.github.io/figma-ml-model/model.json'
  }),
  actions: {
    setFigmaFileKey(key) {
      this.figmaFileKey = key
    },
    setCnnModelUrl(url) {
      this.cnnModelUrl = url
    },
    // bulk‐update dari plugin
    setConfig({ figmaFileKey, cnnModelUrl }) {
      if (typeof figmaFileKey === 'string') this.figmaFileKey = figmaFileKey
      if (typeof cnnModelUrl   === 'string') this.cnnModelUrl  = cnnModelUrl
    }
  }
})
