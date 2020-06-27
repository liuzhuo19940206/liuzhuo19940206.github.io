---
title: Vue中组件的v-model使用
author: gakkij
categories:
  - vue
tags:
  - vue
img: https://pic.downk.cc/item/5ef6ace814195aa5941bb420.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5ef6ace814195aa5941bb420.jpg
toc: true
date: 2020-06-27 10:14:58
summary: vue中的组件的v-model的使用原理
password: 123456
---

v-model是vue使用比较频繁的特性，在表单中使用的最多，像input输入框、select下拉框、radio单选框等。

今天，我们来将vue中的v-model的原理来捋一下吧~

---

### 使用原生js来实现v-model

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
    <input type="text" id="username" name="username" value="">
    <hr/>
    username：<span id="showname"></span>
</div>
</body>
</html>

<script>
          let username = document.querySelector("#username")
          username.oninput = function () {
                  document.querySelector("#showname").innerHTML = username.value
          }
</script>
```

![](https://pic.downk.cc/item/5ef6aed814195aa5941c9ae5.jpg)

这就是v-model的原理，通过监听输入框的 `oninput`输入事件来将数据进行联动起来。

### v-model的原理

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
    <input type="text" id="username" @input="username = $event.target.value" :value="username">
    <hr/>
    username：<span>{{username}}</span>
</div>
</body>
</html>

<script>
    let app = new Vue({
        el: '#app',
        data: {
            username: ''
        }
    })
</script>
```

![](https://pic.downk.cc/item/5ef6b0d514195aa5941d8a8a.jpg)

![](https://pic.downk.cc/item/5ef6b11a14195aa5941daad1.jpg)

这里：

1）首先将 input的value属性 和 vue的data中的属性username进行判断，实现username到value之间的绑定

2）监听输入框的input监听事件，将输入框中的value值与username进行榜单起来

---

### 组件中实现v-model的功能

#### 1)  实现username到输入框的绑定

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
    <input-my :username="username"></input-my>
    <hr/>
    username：<span>{{username}}</span>
</div>
</body>
</html>

<script>

    Vue.component('input-my', {
        props: ['username'],
        template: `
            <input type="text" :value="username">
        `
    })
    let app = new Vue({
        el: '#app',
        data: {
            username: ''
        }
    })
</script>
```

![](https://pic.downk.cc/item/5ef6b30714195aa5941e8ed2.jpg)

#### 2）实现输入款到username的绑定

##### 方法一：

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
    <input-my :username="username" @child-input="binding"></input-my>
    <hr/>
    username：<span>{{username}}</span>
</div>
</body>
</html>

<script>

    Vue.component('input-my', {
        props: ['username'],
        template: `
            <input type="text" @input="changeName($event)" :value="username">
        `,
        methods: {
            changeName: function (event) {
                console.log(event)
                let value = event.target.value
                console.log(value)
                this.$emit('child-input', value)
            }
        }
    })
    let app = new Vue({
        el: '#app',
        data: {
            username: ''
        },
        methods: {
            binding: function (data) {
                this.username = data
            }
        }
    })
</script>
```

这里写的有点复杂了，请大家仔细观看代码：

1）changeName 方法来实现，获取输入框中的值， 并发射事件:`child-input`

2）binding方法是监听事件:`child-input`，并将输入框中的值与username进行绑定。

---

##### 方法二：

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
    <input-my :username="username" @child-input="binding"></input-my>
    <hr/>
    username：<span>{{username}}</span>
</div>
</body>
</html>

<script>

    Vue.component('input-my', {
        props: ['username'],
        template: `
            <input type="text" @input="$emit('child-input',$event.target.value)" :value="username">
        `
    })
    let app = new Vue({
        el: '#app',
        data: {
            username: ''
        },
        methods: {
            binding: function (data) {
                this.username = data
            }
        }
    })
</script>
```

再简化点：

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
    <!--这里的$event ，其实就是下来，传入的$event.target.value值-->
    <input-my :username="username" @child-input="username = $event"></input-my>
    <hr/>
    username：<span>{{username}}</span>
</div>
</body>
</html>

<script>

    Vue.component('input-my', {
        props: ['username'],
        template: `
            <input type="text" @input="$emit('child-input',$event.target.value)" :value="username">
        `
    })
    let app = new Vue({
        el: '#app',
        data: {
            username: ''
        }
    })
</script>
```

##### 方法三

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
    <!--这里的$event ，其实就是下来，传入的$event.target.value值-->
    <input-my :username="username" @input="username = $event"></input-my>
    <hr/>
    username：<span>{{username}}</span>
</div>
</body>
</html>

<script>

    Vue.component('input-my', {
        props: ['username'],
        template: `
            <input type="text" @input="$emit('input',$event.target.value)" :value="username">
        `
    })
    let app = new Vue({
        el: '#app',
        data: {
            username: ''
        }
    })
</script>
```

这里，就是将监听事件从`child-input`换成了`input`

为啥要换成input事件呢？因为vue会自动帮我们将input事件与v-model进行绑定：

再次修改代码：

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
    <!--这里的$event ，其实就是下来，传入的$event.target.value值-->
    <input-my :username="username" @input="username = $event"></input-my>
    <!--这里就是完成的形态了-->
    <input-my v-model="username"></input-my>
    <hr/>
    username：<span>{{username}}</span>
</div>
</body>
</html>

<script>

    Vue.component('input-my', {
        props: ['username'],
        template: `
            <input type="text" @input="$emit('input',$event.target.value)" :value="username">
        `
    })
    let app = new Vue({
        el: '#app',
        data: {
            username: ''
        }
    })
</script>
```

![](https://pic.downk.cc/item/5ef6b9d614195aa59421e791.jpg)

看图：成功完成组件的v-model的功能。

