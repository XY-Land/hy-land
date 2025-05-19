/**
 * 将 bigint/number/string 类型的代币数量按照精度转换为显示字符串
 * @param value 代币数量
 * @param decimals 代币精度
 * @param precision 显示精度，默认为3位小数
 * @returns 格式化后的字符串
 * @example
 * formatFromDecimals("1234567", 6) => "1.234"
 * formatFromDecimals(1234567n, 6) => "1.234"
 * formatFromDecimals("1234567", 6, 4) => "1.2345"
 */
export default function formatFromDecimals(
    value: string | number | bigint,
    decimals: number,
    precision: number = 3
): string {

    // 统一转换为 BigInt
    let bigIntValue: bigint
    if (typeof value === 'string') {
        bigIntValue = BigInt(value)
    } else if (typeof value === 'number') {
        bigIntValue = BigInt(value)
    } else if (typeof value === 'bigint') {
        bigIntValue = value
    } else {
        throw new Error('Invalid value type')
    }

    // 如果值为 0，直接返回
    if (bigIntValue === 0n) {
        return '0'
    }

    // 转换为字符串并补齐位数
    let numStr = bigIntValue.toString()
    while (numStr.length <= decimals) {
        numStr = '0' + numStr
    }

    // 分割整数和小数部分
    const integerPart = numStr.slice(0, -decimals) || '0'
    let decimalPart = numStr.slice(-decimals)

    // 处理精度
    if (precision > 0) {
        // 截取指定精度
        decimalPart = decimalPart.slice(0, precision)
        // 去除末尾的0
        while (decimalPart.endsWith('0')) {
            decimalPart = decimalPart.slice(0, -1)
        }
        // 如果有小数部分则添加小数点
        return decimalPart ? `${integerPart}.${decimalPart}` : integerPart
    }

    return integerPart
}