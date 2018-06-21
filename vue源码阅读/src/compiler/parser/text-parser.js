/* @flow */

import { cached } from 'shared/util'
import { parseFilters } from './filter-parser'

//参考：[表达式全集](http://tool.oschina.net/uploads/apidocs/jquery/regexp.html)
//? 匹配前面的子表达式零次或一次，或指明一个非贪婪限定符
//.匹配除“\n”之外的任何单个字符。要匹配包括“\n”在内的任何字符，请使用像“(.|\n)”的模式。
//(?:pattern)匹配pattern但不获取匹配结果，也就是说这是一个非获取匹配，不进行存储供以后使用
//匹配的是{{}}
//console.log(console.log('abcd-ef{{dfsdfafd}}g.hij*'.match(defaultTagRE)))
//["{{dfsdfafd}}"]
const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g

//匹配在正则表达式中，有特殊意义的字符
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
  //$&	与 regexp 相匹配的子串。
  //console.log('abcd-efg.hij*'.replace(regexEscapeRE, '\\$&'))
  //abcd\-efg\.hij\*
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})

type TextParseResult = {
  expression: string,
  tokens: Array<string | { '@binding': string }>
}

export function parseText (
  text: string,
  delimiters?: [string, string]
): TextParseResult | void {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  if (!tagRE.test(text)) {
    return
  }
  const tokens = []
  const rawTokens = []
  /*
  RegExp.lastIndex

  只有正则表达式使用了表示全局检索的 "g" 标志时，该属性才会起作用。此时应用下面的规则：

    如果 lastIndex 大于字符串的长度，则 regexp.test 和 regexp.exec 将会匹配失败，然后 lastIndex 被设置为 0。
    如果 lastIndex 等于字符串的长度，且该正则表达式匹配空字符串，则该正则表达式匹配从 lastIndex 开始的字符串。（then the regular expression matches input starting at lastIndex.）
    如果 lastIndex 等于字符串的长度，且该正则表达式不匹配空字符串 ，则该正则表达式不匹配字符串，lastIndex 被设置为 0.。
    否则，lastIndex 被设置为紧随最近一次成功匹配的下一个位置。
  示例

    考虑下面的语句：

  var re = /(hi)?/g;

    匹配空字符串

    console.log(re.exec("hi"));
    console.log(re.lastIndex);

    返回 ["hi", "hi"] ，lastIndex 等于 2。

  console.log(re.exec("hi"));
    console.log(re.lastIndex);

    返回 ["", undefined]，即一个数组，其第 0 个元素为匹配的字符串。此种情况下为空字符串，是因为 lastIndex 为 2（且一直是 2），"hi" 长度为 2。
    */
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }
    // tag token
    const exp = parseFilters(match[1].trim())
    tokens.push(`_s(${exp})`)
    rawTokens.push({ '@binding': exp })
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}
