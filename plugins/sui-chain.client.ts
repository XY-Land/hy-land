import { chainAccountSymbol, ChainAccount } from "~/composables/chainAccount"

export default defineNuxtPlugin(({ vueApp }) => {
    const client = createSuiClient()
    vueApp.provide(suiClientSymbol, client)

    if (import.meta.client) {
        vueApp.provide(chainAccountSymbol, new ChainAccount({ client }))
    }
})
