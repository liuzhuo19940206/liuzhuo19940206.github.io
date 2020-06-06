---
title: vue条件渲染
author: gakkij
categories:
  - vue
tags:
  - vue
img: https://pic.downk.cc/item/5edbac60c2a9a83be551a47b.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5edbac60c2a9a83be551a47b.jpg
toc: true
date: 2020-06-06 22:44:39
summary: vue条件渲染
password:
---

通过上篇的vue初始，大家应该有点感觉了，那么：我们开始vue的基础教程吧

我们都知道，dom渲染时，有时，我们需要根据用户的操作来选择性渲染dom，以前都是使用jQuery来控制dom，这样的操作有点费事，现在使用vue的话，vue底层会采用虚拟的dom对象来装我们的修改，一次性来渲染整个dom文档，操作性简单方便，那么，我们开始吧。

### v-if

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
        <span v-if="isVip">我是vip用户</span>
    </div>
</body>
</html>

<script>

    let app =new Vue({
        el: '#app',
        data: {
            isVip:true
        }
    })
</script>
```

![](https://pic.downk.cc/item/5edbaebcc2a9a83be557b3b8.jpg)

修改，isVip的值为：false

![](https://pic.downk.cc/item/5edbaf32c2a9a83be558eea8.jpg)

### v-else

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
        <span v-if="isVip">我是vip用户</span>
        <!--  注意：v-if 和 v-else之间不能有其他Element元素！！！      -->
        <span v-else>我是普通用户</span>
    </div>
</body>
</html>

<script>

    let app =new Vue({
        el: '#app',
        data: {
            isVip:true
        }
    })
</script>
```

![](https://pic.downk.cc/item/5edbaff4c2a9a83be55b007e.jpg)

修改：isVip的值为：false

![](https://pic.downk.cc/item/5edbb029c2a9a83be55b86aa.jpg)

---

**PS: v-if 和 v-else之间是不能有其他的Element元素的！！！**

我们，现在让中间随便写点其他的标签

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
        <span v-if="isVip">我是vip用户</span>
        <!--  注意：v-if 和 v-else之间不能有其他Element元素！！！      -->
        <span> 其他元素 ！！！</span>
        <span v-else>我是普通用户</span>
    </div>
</body>
</html>

<script>

    let app =new Vue({
        el: '#app',
        data: {
            isVip:true
        }
    })
</script>
```

![](https://pic.downk.cc/item/5edbb0afc2a9a83be55cf6ba.jpg)

### v-if-else

v-if-else是2.1.0 新增的

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
    <span v-if="age > 18"> 我已经是成年人</span>
    <span v-else-if="age > 14"> 我已经是青少年</span>
    <span v-else>我是未成年</span>
</div>
</body>
</html>

<script>

    let app =new Vue({
        el: '#app',
        data: {
            age: 20
        }
    })
</script>
```

类似于 `v-else`，`v-else-if` 也必须紧跟在带 `v-if` 或者 `v-else-if` 的元素之后。

大家自行修改age的值来看dom渲染情况吧~~~

---

### v-show

v-show也是用来显示文档的，但是后面不接v-else的条件.

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
    <span v-show="isShow"> 我是显示内容</span>
</div>
</body>
</html>

<script>

    let app =new Vue({
        el: '#app',
        data: {
            isShow: true
        }
    })
</script>
```

![](https://pic.downk.cc/item/5edbb2a7c2a9a83be5622a3f.jpg)

修改：isShow的值为：false

![](https://pic.downk.cc/item/5edbb306c2a9a83be5633151.jpg)

---

区别：

v-if：false，是直接删除元素

V-show：false，是display: none ，是隐藏元素。

使用：

如果你的元素只是判断一次，或者很少修改的话，请使用：v-if

如果你的元素频繁修改的话，请使用：v-show，这样会减少性能。

---

例子：

通过按钮的点击事件来频繁修改，某个区域是否显示：

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="js/vue.js"></script>
    <style>
        .show{
            width: 500px;
            height: 500px;
            background: aqua;
        }
    </style>
</head>
<body>

<div id="app">
    <div class="show" v-show="isShow">
         我是显示的内容
    </div>
    <span @click="isShow = !isShow">切换</span>
</div>
</body>
</html>

<script>

    let app =new Vue({
        el: '#app',
        data: {
            isShow: true
        }
    })
</script>
```

![](https://pic.downk.cc/item/5edbb475c2a9a83be566ce9d.jpg)

大家，尝试疯狂点击：切换，就会看到蓝色的区域在显示和隐藏之间来回切换：

![](https://pic.downk.cc/item/5edbb4c5c2a9a83be5678f8c.jpg)

---

### 例子

尝试完成，一般APP下面的切换tag的功能，点击不同的tag切换不同的页面主题：

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="js/vue.js"></script>
    <style>
        .home {
            width: 300px;
            height: 300px;
            background: aqua;
        }

        .subject {
            width: 400px;
            height: 400px;
            background: blueviolet;
        }

        .person {
            width: 300px;
            height: 300px;
            background: chartreuse;
        }
    </style>
</head>
<body>

<div id="app">
    <div v-bind:class="activeClass" v-show="tag == 1">
        首页
    </div>
    <div v-bind:class="activeClass" v-show="tag == 2">
        主题
    </div>
    <div v-bind:class="activeClass" v-show="tag == 3">
        个人中心
    </div>
    <button @click="changeTag" data-id="1" data-className="home">首页</button>
    <button @click="changeTag" data-id="2" data-className="subject">主题</button>
    <button @click="changeTag" data-id="3" data-className="person">个人中心</button>
</div>
</body>
</html>

<script>

    let app = new Vue({
        el: '#app',
        data: {
            activeClass: 'show',
            tag: 1
        },
        methods: {
            changeTag(e) {
                //e: 就是点击的事件
                console.log(e)
                //获取：data-id的值
                let id = e.target.dataset.id
                let className = e.target.dataset.classname
                console.log('id:' + id)
                console.log('className:' + className)
                //app.tag = id 和下面是等价的！！
                this.tag = id
                this.activeClass = className
            }
        }
    })
</script>
```

![](https://pic.downk.cc/item/5edbb9efc2a9a83be575278c.jpg)

![](https://pic.downk.cc/item/5edbba0ec2a9a83be57582e7.jpg)

---

这个例子：

请大家仔细看呀：

首先因为，是需要频繁切换tag，所以，我这里选择了使用v-show，使用v-if也能完成该需求，大家可以自行尝试。

然后，这里，使用了vue中的methods方法属性，定义了点击事件的方法，并且看到，默认所有的方法都会默认传入一个e的参数，如果你自行传入了其他参数的话，该e事件参数就不会被传了，如果你还需要的话，请将e参数放入到你自定义方法的第一个参数。

接着，我们需要两个参数，tag的id 和 tag显示的className，这里使用了自定义标签的：data-xxx，注意自定义标签只能是：**data-** 开头，而且**自定义标签的名字是不区分大小写的**！！！我们从e参数中获取:`data-id="1" data-className="home"` 时，使用的名字都是小写：`let id = e.target.dataset.id ,let className = e.target.dataset.classname `. 主要从e中获取classname就是全部是小写

---

**ps：vue中的方法中的this 和 我们之间js中和jQuery中的方法中的this的含义不一样，vue中的this指的是：vue本身的实例，这里就是创建的app实例，因此：app.tag  和 this.tag 是等价的作用。**





