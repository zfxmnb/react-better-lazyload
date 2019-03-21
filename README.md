# react-better-lazyload
```js
/**
 * 懒加载（适用多scrollview）
 * 在指定 scrollView 增加属性 lazyscrollview，该scrollView将被监听, 增加属性  disablelazyinit ,该scrollView初始化不会显示懒加载内容
 * @param {*} width 宽
 * @param {*} height 高
 * @param {*} offset 缓冲长度 默认200
 * @param {*} performance 模式 0、经典懒加载；1、不在可见区域内自动display:none; 2、不在可见区域内自动移除内容
 * @param {*} disableupdate 是否禁用自定更新
 * @param {*} stamp 修改该属性组件将进行重新初始化
 * @param {*} loaded 第一次懒加载成功回调 callback: params0: status, params1: {offsetTop, offsetBottom, scrollView}
 * @param {*} update 组件更新组件回调 callback: params0: status, params1: {offsetTop, offsetBottom, scrollView}
 */
import Lazyload from 'react-better-lazyload'
Lazyload.updateTime //节流控制时间（默认：100）
LazyLoad.forceCheck(e, id) //强制刷新scrollView，e: {currentTarget}|lazyscrollview, id：lazyscrollview，隐藏对应id的scrollView内的所有懒加载组件内容
LazyLoad.hide(id) // id：lazyscrollview，隐藏对应id的scrollView内的所有懒加载组件内容
LazyLoad.show(id) // id：lazyscrollview，刷新对应id的scrollView内的所有懒加载组件内容
```