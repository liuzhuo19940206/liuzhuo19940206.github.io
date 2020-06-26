---
title: Vue的组件传值技巧
author: gakkij
categories:
  - vue
tags:
  - vue
img: https://pic.downk.cc/item/5ef5d52b14195aa594c3ca9c.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5ef5d52b14195aa594c3ca9c.jpg
toc: true
date: 2020-06-26 18:58:40
summary: Vue中的组件传值的奇淫巧技
password: 123456
---

接着上篇文章，我们来讲解一下，Vue组件传值的奇淫巧技。

### Vue中父直接传递方法给子组件

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
        <!--定义一个c-school的属性，并将父组件中的方法传递给它-->
        <school v-for="(item,index) in schools" :school-name="item" :c-school="cSchool"></school>
    </ul>
    <hr/>
    选择的学校：<p>{{chooseSchoolName}}</p>
</div>
</body>
</html>

<script>

    //Vue中全局注册：组件，即：注册后，在Vue的实例中都能使用
    Vue.component('school', {
        props: ['schoolName','cSchool'],
        template: `
            <li>
                <span>{{schoolName}}</span>
                <button @click="chooseSchool(schoolName)">选择</button>
            </li>
        `,
        methods: {
            chooseSchool: function (schoolName) {
                console.log(schoolName)
                //this.$emit('choose-name',schoolName)

                console.log(this.cSchool)
                // 直接调用父组件中的方法
                this.cSchool(schoolName)
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

![](https://pic.downk.cc/item/5ef5db8a14195aa594c701ac.jpg)

大家，仔细琢磨即可，父组件直接传递给组件自己的方法，然后子组件调用该方法修改了父组件中的data值。

---

### this.$parent

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
        props: ['schoolName','cSchool'],
        template: `
            <li>
                <span>{{schoolName}}</span>
                <button @click="chooseSchool(schoolName)">选择</button>
            </li>
        `,
        methods: {
            chooseSchool: function (schoolName) {
                console.log(schoolName)
                //this.$emit('choose-name',schoolName)

                console.log(this)
                console.log(this.$parent)
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

![](https://pic.downk.cc/item/5ef5dc8114195aa594c77d2c.jpg)



在子组件中的this中，我们看到了可以获取到一个特殊的对象，$parent，该对象指代的就是该子组件的直接父组件，即这里的app组件。

因此，我们可以使用这个对象来调用父组件中的方法：

#### 方法一

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
        props: ['schoolName','cSchool'],
        template: `
            <li>
                <span>{{schoolName}}</span>
                <button @click="chooseSchool(schoolName)">选择</button>
            </li>
        `,
        methods: {
            chooseSchool: function (schoolName) {
                console.log(schoolName)
                //this.$emit('choose-name',schoolName)

                console.log(this)
                console.log(this.$parent)

                //直接调用父组件的方法
                this.$parent.cSchool(schoolName)
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

#### 方法二

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
        props: ['schoolName','cSchool'],
        template: `
            <li>
                <span>{{schoolName}}</span>
                <button @click="$parent.cSchool(schoolName)">选择</button>
            </li>
        `,
        methods: {
            chooseSchool: function (schoolName) {
                // console.log(schoolName)
                // //this.$emit('choose-name',schoolName)
                //
                // console.log(this)
                // console.log(this.$parent)
                //
                // //直接调用父组件的方法
                // this.$parent.cSchool(schoolName)
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

### this.$root

组件是可以嵌套多层的，如果想要调用父组件的父组件的父组件就会写很长的表达式：`this.$parent.$parent.$parent`

因此，vue提供了一个`this.$root`对象，可以直接获取到根对象，在我们这里根对象就是：app。

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
        props: ['schoolName','cSchool'],
        template: `
            <li>
                <span>{{schoolName}}</span>
                <button @click="$root.cSchool(schoolName)">选择</button>
            </li>
        `,
        methods: {
            chooseSchool: function (schoolName) {
                // console.log(schoolName)
                // //this.$emit('choose-name',schoolName)
                //
                // console.log(this)
                // console.log(this.$parent)
                //
                // //直接调用父组件的方法
                // this.$parent.cSchool(schoolName)
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

![](https://pic.downk.cc/item/5ef5de2414195aa594c84ba6.jpg)通过上图，使用`this.$root`对象来调用方法也能成功。

### this.$children

父组件可以直接修改`this.$children`来控制子组件中的数据。

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
        props: ['schoolName','cSchool'],
        template: `
            <li>
                <span>{{schoolName}}</span>
                <button @click="$root.cSchool(schoolName)">选择</button>
            </li>
        `,
        methods: {
            chooseSchool: function (schoolName) {
                // console.log(schoolName)
                // //this.$emit('choose-name',schoolName)
                //
                // console.log(this)
                // console.log(this.$parent)
                //
                // //直接调用父组件的方法
                // this.$parent.cSchool(schoolName)
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

                console.log(this)
                console.log(this.$children)
            }
        }
    })
</script>
```

![](https://pic.downk.cc/item/5ef5def514195aa594c8b538.jpg)

### 说明

一般，我们不使用这样的方法来控制父子组件之间的传值，因为这样不利于维护，大家都直接调用方法控制数据，强耦合，最好还是使用上一节介绍的方法，也是官方提供的方法。

