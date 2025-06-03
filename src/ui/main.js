import { createApp } from 'vue';
import ui from './ui.vue';
import '../ui/styles/main.scss';

const link = document.createElement('link')
link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
link.rel = 'stylesheet'
document.head.appendChild(link)

createApp(ui).mount('#ui');
