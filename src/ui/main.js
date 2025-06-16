import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import ui from './ui.vue'
import '../ui/styles/main.scss'
import router from '../router'
import { useConfigStore } from '../code/configStore'

// load Google Fonts (opsional)
const link = document.createElement('link')
link.href  = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
link.rel   = 'stylesheet'
document.head.appendChild(link)

// setup Pinia & Vue
const pinia = createPinia()
setActivePinia(pinia)
const app = createApp(ui)
app.use(pinia)
app.use(router)
app.mount('#ui')

// dengarkan pesan dari plugin backend
window.onmessage = (event) => {
  const msg = event.data.pluginMessage
  if (!msg) return

  // handle load‐config pertama & config‐saved setelah user simpan
  if (msg.type === 'load-config' || msg.type === 'config-saved') {
    const store = useConfigStore()
    store.setConfig({
      figmaFileKey: msg.figmaFileKey,
      cnnModelUrl:   msg.cnnModelUrl
    })
  }
}
