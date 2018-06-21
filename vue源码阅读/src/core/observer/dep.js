/* @flow */
 //依赖收集,通知订阅者
import type Watcher from './watcher'
import { remove } from '../util/index'

let uid = 0
//注意：在Dep中target是static的
//在Dep中，我们也可以看到对target的调用不是dep而是Dep

//target和subs的作用什么呢？
//看上去，target存储的是dep，而subs则存储的是Watcher
//subs是dep实例拥有的属性
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
	//这是个static? js什么时候开始支持static了？
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;//存储订阅者的队列

  constructor () {
    this.id = uid++
    this.subs = []
  }

  /**
   * 添加订阅者
   * 这个方法的调用者是dep（即Dep实例）
   */
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  //删除订阅者
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  //依赖搜集，调用这个方法的是Observer中的dep
  //所以说这里的this指的是Dep实例了？
  //为什么要在target中添加dep呢？
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  //通知订阅者
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
//将搜集到的依赖置为空值,防止重复添加?
Dep.target = null
const targetStack = []

export function pushTarget (_target: ?Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

export function popTarget () {
  Dep.target = targetStack.pop()
}
