export function onlyClientSide<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
        if (!import.meta.client) {
            throw new Error('This function can only be called on the client side')
        }
        return fn(...args)
    }) as T
}