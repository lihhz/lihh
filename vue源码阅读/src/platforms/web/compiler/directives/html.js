/* @flow */

import { addProp } from 'compiler/helpers'

export default function html (el: ASTElement, dir: ASTDirective) {
  if (dir.value) {
    //这里的'_s'是做什么用的？
    addProp(el, 'innerHTML', `_s(${dir.value})`)
  }
}
