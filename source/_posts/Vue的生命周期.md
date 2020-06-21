---
title: Vue的生命周期
author: gakkij
categories:
  - vue
tags:
  - vue
  - 前端
img: https://pic.downk.cc/item/5eeeb43e14195aa594c0bbb1.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5eeeb43e14195aa594c0bbb1.jpg
toc: true
date: 2020-06-21 09:09:55
summary: Vue的生命周期和组件的基本用法
password:
---

### 生命周期图示

![](https://pic.downk.cc/item/5eeeb4d414195aa594c1dade.jpg)

大家，只需要知道红色矩形框中的内容就行，即：所谓的钩子函数，其他部分是vue内部帮我们完成的，我们不能控制，而钩子函数就是vue给开发人员提供的口子来在整个生命周期中局部控制vue的某些行为。

#### beforeCreate

该钩子函数是在实例化vue的data数据和methods方法之前调用的，此时在该钩子函数中，不能获取到vue实例中的data和methods。

#### created

此时，vue已经实例化了data和methods

#### beforeMount

挂载vm之前，此时，不能获取到dom中的class对象等。

#### mounted

已经挂载vm，可以通过dom来获取class对象等。

#### beforeUpdate

更新data数据，dom对象之前

#### updated

更新data数据，dom对象之后

#### beforeDestroy

销毁vue实例之前，一般用于组件的销毁

#### destroyed

销毁vue实例之后

---

### 生命周期的演示

#### 验证钩子函数的执行顺序

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="js/vue.js"></script>
</head>
<body>

<div id="app">
    <span>{{msg}}</span>
</div>
</body>
</html>

<script>

    let app = new Vue({
        el: '#app',
        data: {
            msg: 'hello Vue!'
        },
        beforeCreate: function () {
            console.log('beforeCreate')
        },
        created:function(){
            console.log('created')
        },
        beforeMount:function(){
            console.log('beforeMount')
        },
        mounted:function(){
            console.log('mounted')
        },
        beforeUpdate:function(){
            console.log('beforeUpdate')
        },
        updated:function(){
            console.log('updated')
        },
        beforeDestroy:function(){
            console.log('updated')
        },
        destroyed:function(){
            console.log('updated')
        },
        methods: {
            checkTest() {
            }
        }
    })
</script>
```

![](https://pic.downk.cc/item/5eeeb95714195aa594cb51ea.jpg)

说明：从图中可以观察到，控制台输出的顺序就是我们理解的生命周期的顺序，从beforeCreate开始的哈~~~

---

现在，在控制台，修改msg的值看看：

![](https://pic.downk.cc/item/5eeeba0c14195aa594cd1e1c.jpg)





#### 验证钩子函数的功能

修改钩子函数的输出语句：

```javascript
        beforeCreate: function () {
            console.log('beforeCreate')
            console.log('beforeCreate:'+this)
            console.log('beforeCreate:'+this.msg)
            console.log('beforeCreate:'+this.checkTest)
        }
```

![](https://pic.downk.cc/item/5eeebb9f14195aa594d134b7.jpg)

```javascript
        created:function(){
            console.log('created')
            console.log(this)
            console.log('created:'+this.msg)
            console.log('created:'+this.checkTest)
        }
```

![](https://pic.downk.cc/item/5eeebc5914195aa594d3205b.jpg)

```javascript
        beforeMount:function(){
            console.log('beforeMount')
            let msgClass = document.querySelector('.msgClass')
            console.log(msgClass)
        },
        mounted:function(){
            console.log('mounted')
            let msgClass = document.querySelector('.msgClass')
            console.log(msgClass)
        }
```

![](https://pic.downk.cc/item/5eeebd1c14195aa594d52437.jpg)

可以看到，beforeMount中，data中的数据是没有被渲染出来的，而mounted中已经成功讲vue中的data数据渲染出来了。

---

### 组件的基本用法

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="js/vue.js"></script>
</head>
<body>

<div id="app">
    <hello-com></hello-com>
</div>
</body>
</html>

<script>

    //Vue中全局注册：组件，即：注册后，在Vue的实例中都能使用
    Vue.component('hello-com', {
        template: '<h1>{{comMsg}}</h1>',
        data: function () {
            return {
                comMsg: '组件的信息'
            }
        }
    })

    let app = new Vue({
        el: '#app',
        data: {
            msg: 'hello Vue!'
        }
    })
</script>
```

![](https://pic.downk.cc/item/5eeebe9914195aa594d91d32.jpg)

组件渲染成功啦~~~

**说明：大家这里，应该看到了，在组件中，定义data时，我这里使用了函数来返回data数据，因为组件是可以反复复用的，如果不返回一个新的对象的话，大家共用一个data对象就会出现数据问题了**

---

#### 使用组件来验证销毁钩子函数

```java
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="js/vue.js"></script>
</head>
<body>

<div id="app">
    <hello-com v-if="isIf" ></hello-com>
    <button @click="isIf = !isIf">isIF</button>
    <hello-com v-show="isShow" ></hello-com>
    <button @click="isShow = !isShow">isShow</button>
</div>
</body>
</html>

<script>

    //Vue中全局注册：组件，即：注册后，在Vue的实例中都能使用
    Vue.component('hello-com', {
        template: '<h1>{{comMsg}}</h1>',
        data: function () {
            return {
                comMsg: '组件的信息'
            }
        }
    })
    let app = new Vue({
        el: '#app',
        data: {
            msg: 'hello Vue!',
            isIf: true,
            isShow: true
        },
        beforeCreate: function () {
            console.log('beforeCreate')
        },
        created:function(){
            console.log('created')
        },
        beforeMount:function(){
            console.log('beforeMount')
        },
        mounted:function(){
            console.log('mounted')
        },
        beforeUpdate:function(){
            console.log('beforeUpdate')
        },
        updated:function(){
            console.log('updated')
        },
        beforeDestroy:function(){
            console.log('beforeDestroy')
        },
        destroyed:function(){
            console.log('destroyed')
        }
    })
</script>
```

在页面点击，两个button来验证销毁钩子函数：

在vue2.0之前，点击isIf按钮后，会在销毁组件时，调用beforeDestroy 和 destroyed函数，再次点击isIF按钮时，会调用：beforeCreate、created、beforeMount、mounted。

现在，我测试，v-if 和 v-show已经是相同的效果了，都只是出现：beforeUpdate 和 updated 函数。不知道是vue已经优化这块功能，还是我姿势不对，么有弄出来~~~