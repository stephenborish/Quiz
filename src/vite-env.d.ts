/// <reference types="vite/client" />

interface Window {
    SERVER_DATA?: string; // The raw base64 string injected by GAS
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
