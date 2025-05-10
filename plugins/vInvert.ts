/*
    颜色反转指令
    使用方法：
    <UIcon v-color-invert name="token-branded:okx" />
    在 dark 模式下，会添加 invert 类
*/
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('color-invert', (el) => {
        const colorMode = useColorMode()
        if (colorMode.value === 'dark') {
            el.classList.add('invert')
        }
    })
})