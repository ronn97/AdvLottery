import { mount } from 'svelte'
import '@/assets/css/base.scss'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
