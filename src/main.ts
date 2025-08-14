import { createApp } from "vue"
import "./style.css"
import App from "./App.vue"

const app = createApp(App)

// Mount the app
app.mount("#app")

// Hide loading screen after Vue has mounted and DOM is ready
setTimeout(() => {
    const loadingScreen = document.getElementById("loading-screen")
    if (loadingScreen) {
        loadingScreen.classList.add("fade-out")
        setTimeout(() => {
            loadingScreen.remove()
        }, 500)
    }
}, 800) // Give enough time for Vue to render and iOS to process
