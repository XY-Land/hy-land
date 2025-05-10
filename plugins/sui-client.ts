export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.provide(suiClientSymbol, createSuiClient())
})