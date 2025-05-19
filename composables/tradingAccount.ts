export function useTradingAccount() {

    if (!import.meta.client) {
        return
    }

    return useLocalStorage('tradingAccount', {
        address: null as string | null,
        balanceContainerId: null as string | null,
    })
}