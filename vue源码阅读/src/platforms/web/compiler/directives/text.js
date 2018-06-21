/* @flow */

import { addProp } from 'compiler/helpers'
//v-text,使用textContent设置text内容
export default function text (el: ASTElement, dir: ASTDirective) {
  if (dir.value) {
  // textContent 属性设置或返回指定节点的文本内容，以及它的所有后代。
  // 如果设置了 textContent 属性，会删除所有子节点，并被替换为包含指定字符串的一个单独的文本节点。
    //此属性同时会返回所有子节点的文本。
    addProp(el, 'textContent', `_s(${dir.value})`)
  }
}
