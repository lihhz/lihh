/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
//这个arrayMethods中的部分方法（methodsToPatch）在下边的methodsToPatch.forEach中被重新定义了
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',//向数组的末尾添加一个或多个元素,并返回新的长度
  'pop',//删除并返回数组的最后一个元素
  'shift',//把数组的第一个元素从其中删除,并返回第一个元素的值
  'unshift',//向数组的开头添加一个或更多元素,并返回新的长度
  'splice',//向/从数组中添加/删除项目,然后返回被删除的项目。 注释:该方法会改变原始数组
  'sort',//对数组的元素进行排序。，数组在原数组上进行排序，不生成副本。
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
//拦截变异方法并触发事件
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  //使用Object.defineProperty设置arrayMethods的method为mutator
  //注意三个点的写法
  //spread(展开语法)：将一个数组转为用逗号分隔的参数序列
  //https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  /*可以在函数调用/数组构造时, 将数组表达式或者string在语法层面展开；还可以在构造字面量对象时, 将对象表达式按key-value的方式展开。(译者注: 字面量一般指 [1, 2, 3] 或者 {name: "mdn"} 这种简洁的构造方式)
  function sum(x, y, z) {
    return x + y + z;
  }

  const numbers = [1, 2, 3];

  console.log(sum(...numbers));
  // expected output: 6

  console.log(sum.apply(null, numbers));
  // expected output: 6
   */
  def(arrayMethods, method, function mutator (...args) {
    //先执行原始方法，但是却是最后才返回结果
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
        //unshift() 方法可向数组的开头添加一个或更多元素，并返回新的长度。
        //arrayObject.unshift(newelement1,newelement2,....,newelementX)
      case 'unshift':
        inserted = args
        break
      //
      //arrayObject.splice(index,howmany,item1,.....,itemX)
      //ndex	必需。整数，规定添加/删除项目的位置，使用负数可从数组结尾处规定位置。
      // howmany	必需。要删除的项目数量。如果设置为 0，则不会删除项目。
      //item1, ..., itemX	可选。向数组添加的新项目。
      case 'splice':
        //slice() 方法可从已有的数组中返回选定的元素。
        //arrayObject.slice(start,end)
        //start	必需。规定从何处开始选取。如果是负数，那么它规定从数组尾部开始算起的位置。也就是说，-1 指最后一个元素，-2 指倒数第二个元素，以此类推。
        //end	可选。规定从何处结束选取。该参数是数组片断结束处的数组下标。如果没有指定该参数，那么切分的数组包含从 start 到数组结束的所有元素。如果这个参数是负数，那么它规定的是从数组尾部开始算起的元素。
        inserted = args.slice(2)
        break
    }
    //将要新增的元素转为Observer
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    //为什么计算result要在开始的时候进行而不再这里进行呢？
    return result
  })
})
