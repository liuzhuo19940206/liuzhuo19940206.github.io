---
title: Vue的组件传值
author: gakkij
categories:
  - vue
tags:
  - vue
img: https://pic.downk.cc/item/5ef55ec614195aa59486b56a.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5ef55ec614195aa59486b56a.jpg
toc: true
date: 2020-06-26 10:23:13
summary: Vue中的父子组件之间的传值
password:
---

上篇文章，了解到了vue的生命周期和vue的组件的使用，今天来学习一下，vue组件之间的传值。

### 父向子组件传值

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
    <ul>
        <product v-for="(item,index) in products"></product>
    </ul>
</div>
</body>
</html>

<script>

    //Vue中全局注册：组件，即：注册后，在Vue的实例中都能使用
    Vue.component('product', {
        template: `
            <li>
                <h3>文具盒</h3>
                <p>超级好用</p>
                <p>5</p>
            </li>`,
    })
    let app = new Vue({
        el: '#app',
        data: {
            products: [
                {
                    title: '产品1',
                    description: '非常好用的产品',
                    price: 12.5
                },
                {
                    title: '产品2',
                    description: '非常好用的产品',
                    price: 13.5
                },
                {
                    title: '产品3',
                    description: '非常好用的产品',
                    price: 14.5
                },
                {
                    title: '产品4',
                    description: '非常好用的产品',
                    price: 15.5
                }
            ]
        }
    })
</script>
```

![](https://pic.downk.cc/item/5ef5619914195aa5948779a2.jpg)

这里：能看到渲染出来了四个product的组件，其实都是复用一个组件，这就是组件的好处，定义组件后，可以多次使用，不过这里，我们也看到了，每个组件中的data数据都是相同的，我们想使用父组件传递给子组件的值，怎么使用呢？意思就是怎么使用app这个父组件中的data中的products，给子组件school使用呐？

----

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
    <ul>
        <product v-for="(item,index) in products" :product="item"></product>
    </ul>
</div>
</body>
</html>

<script>

    //Vue中全局注册：组件，即：注册后，在Vue的实例中都能使用
    Vue.component('product', {
        props: ['product'],
        template: `
            <li>
                <h3>{{product.title}}</h3>
                <p>{{product.description}}</p>
                <p>{{product.price}}</p>
            </li>`,
    })
    let app = new Vue({
        el: '#app',
        data: {
            products: [
                {
                    title: '产品1',
                    description: '非常好用的产品',
                    price: 12.5
                },
                {
                    title: '产品2',
                    description: '非常好用的产品',
                    price: 13.5
                },
                {
                    title: '产品3',
                    description: '非常好用的产品',
                    price: 14.5
                },
                {
                    title: '产品4',
                    description: '非常好用的产品',
                    price: 15.5
                }
            ]
        }
    })
</script>
```

这里，在子组件中，定义了一个新的属性：**props**，该属性值就是用来接受父组件传递给来的值的。

在product中使用中，定义了一个product的属性接受item的值。

![](https://pic.downk.cc/item/5ef5634c14195aa59487ff3c.jpg)

现在，子组件就讲父组件中的数据给渲染出来了。

**说明：定义props时，属性命不要使用驼峰命名法，否则会出错的，必须使用小写，或者中划线。**

---

### 子向父组件传值

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
    <ul>
        <school v-for="(item,index) in schools" :school-name="item"></school>
    </ul>
    <hr/>
    选择的学校：<p>{{chooseSchoolName}}</p>
</div>
</body>
</html>

<script>

    //Vue中全局注册：组件，即：注册后，在Vue的实例中都能使用
    Vue.component('school', {
        props: ['schoolName'],
        template: `
            <li>
                <span>{{schoolName}}</span>
                <button @click="chooseSchool(schoolName)">选择</button>
            </li>
        `,
        methods: {
            chooseSchool: function (schoolName) {
                console.log(schoolName)
            }
        }
    })
    let app = new Vue({
        el: '#app',
        data: {
            schools: ['清华', '北大', '复旦', '上交'],
            chooseSchoolName:''
        }
    })
</script>
```

![](https://pic.downk.cc/item/5ef565c714195aa59488b433.jpg)

这里，想实现，当点击子组件的button按钮时，在父组件中的选择学校那里出现我们选择的学校的名字。

目前，我们只是在子组件中，获取到了点击的学校名，还没有传递给父组件，怎么实现呢？

**这里需要使用：this.$emit 发射事件！**

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
    <ul>
        <school v-for="(item,index) in schools" :school-name="item" @choose-name="cSchool"></school>
    </ul>
    <hr/>
    选择的学校：<p>{{chooseSchoolName}}</p>
</div>
</body>
</html>

<script>

    //Vue中全局注册：组件，即：注册后，在Vue的实例中都能使用
    Vue.component('school', {
        props: ['schoolName'],
        template: `
            <li>
                <span>{{schoolName}}</span>
                <button @click="chooseSchool(schoolName)">选择</button>
            </li>
        `,
        methods: {
            chooseSchool: function (schoolName) {
                console.log(schoolName)

                //1）发射事件
                this.$emit('choose-name',schoolName)

            }
        }
    })
    let app = new Vue({
        el: '#app',
        data: {
            schools: ['清华', '北大', '复旦', '上交'],
            chooseSchoolName:''
        },
        methods: {
            cSchool:function (data) {
                console.log("data:"+data)
                this.chooseSchoolName = data
            }
        }
    })
</script>
```

![](https://pic.downk.cc/item/5ef567ec14195aa59489ad2b.jpg)

说明：

1）使用 `this.$emit('choose-name',schoolName)`发射了一个名叫`choose-name`的事件

2）在school子组件中的使用中，监听`choose-name`事件：`<school v-for="(item,index) in schools" :school-name="item" @choose-name="cSchool">`

3）监听`choose-name`事件后，在父组件中定义一个处理监听到该事件的处理函数：`cSchool`

```        javascript
cSchool:function (data) {
	console.log("data:"+data)
	this.chooseSchoolName = data
}
```

