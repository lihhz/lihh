/* @flow */

import { addProp } from 'compiler/helpers'
//v-html,使用innerHTML设置html
export default function html (el: ASTElement, dir: ASTDirective) {
  if (dir.value) {
    //'_s'参见src\core\instance\render-helpers\index.js
    addProp(el, 'innerHTML', `_s(${dir.value})`)
  }
}
