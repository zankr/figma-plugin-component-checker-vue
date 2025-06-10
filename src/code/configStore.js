import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => ({
    figmaFileKey: 'HIHSBFb6tatYWQYl2LudlV',
    cnnModelUrl: 'https://zankr.github.io/figma-ml-model/model.json',
  }),
  actions: {
    setConfig({ figmaFileKey, cnnModelUrl }) {
      this.figmaFileKey = figmaFileKey;
      this.cnnModelUrl  = cnnModelUrl;
    }
  }
});
