import Vue3Storage, { StorageType } from 'vue3-storage';
import { createApp } from 'vue';
import './index.css';
import App from './App/app.vue';

createApp(App).use(Vue3Storage, {
  namespace: 'vs_', storage: StorageType.Session,
}).mount('#app');
