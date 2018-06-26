/* @flow */

/**
 * Check if a string starts with $ or _
 */
export function isReserved (str: string): boolean {
  const c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
 //使用Object.defineProperty设置obj的key为val
export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * Parse simple path.
 */
 //匹配一个路径.^在中括号中使用指的是非,否则指的是以字符串开头;\w指的是单词包括a-zA-Z0-9_;.指任意字符
const bailRE = /[^\w.$]/
export function parsePath (path: string): any {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  //这个return 的function很奇怪,没看懂这个obj是什么意
  //应该匹配的是obj.param.func这种吧，找到要执行的方法入口并返回？
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
