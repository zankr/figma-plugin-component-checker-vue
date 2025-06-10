import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ui from './ui.vue';
import '../ui/styles/main.scss';
import router from '../router';
import { useConfigStore } from '../code/configStore';


const link = document.createElement('link')
link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
link.rel = 'stylesheet'
document.head.appendChild(link)

const pinia = createPinia()

const app = createApp(ui)
app.use(pinia)
app.use(router)

// Tangkap config yang dikirim core-plugin dan isi Pinia
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (!msg || msg.type !== 'load-config') return;
  const store = useConfigStore();
  store.setConfig({
    figmaFileKey: msg.figmaFileKey,
    cnnModelUrl:   msg.cnnModelUrl
  });
};


app.mount('#ui')