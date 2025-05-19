/**
输入代币的数量和精度，返回正确的数量
*/
export default function formatFromDecimals(value: string | number | BigInt, decimals: number) {
    if (typeof value === 'string') {
        value = BigInt(value)
    }

    if (typeof value === 'number') {
        value = BigInt(value)
    }

    if (typeof value !== 'bigint') {
        throw new Error('Invalid value type')
    }

    const divisor = BigInt(10) ** BigInt(decimals)
    const quotient = value / divisor
    const remainder = value % divisor
    
    let result = quotient.toString()
    if (remainder > 0n) {
        const decimal = remainder.toString().padStart(decimals, '0')
        result = `${result}.${decimal}`
    }
    
    return result
}