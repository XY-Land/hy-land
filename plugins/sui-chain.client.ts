import { chainAccountSymbol, ChainAccount} from "~/composables/chainAccount"

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.provide(chainAccountSymbol, new ChainAccount())
})
