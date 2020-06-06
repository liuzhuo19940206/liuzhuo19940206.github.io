---
title: 初始vue
author: gakkij
categories:
  - vue
tags:
  - vue
img: https://pic.downk.cc/item/5edb6c2cc2a9a83be5af48d0.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5edb6c2cc2a9a83be5af48d0.jpg
toc: true
date: 2020-06-06 18:10:22
summary: 初始vue，大家和我一起开始吧，奥利给~~~
password:
---

### 官网

#### 介绍

vue是尤雨溪创建的，国人。在google工作，由于无聊空闲时间手写的vue，很多时候，你真的会怀疑自己是否配活在这个世界上。

废话不多说，由于是国人写的，因此官网都是中文介绍，有过编程基础的，基本上都能看懂，大家多去看官方文档就能学会，我也是看着学的，因为最近急需上线一个项目，组里没有一个人会前端，我就赶鸭子上架，呜呜呜~~~

#### 地址

[vue](https://cn.vuejs.org/)

### 安装

####  直接引入

现在，我们处于学习阶段就才用直接使用即可，如果你部署项目，真正上线，不要使用改方式；后面，我们在慢慢学吧，我也是刚起步。

步骤：直接下载并用 `<script>` 标签引入，`Vue `会被注册为一个全局变量。

#### CDN

对于制作原型或学习，你可以这样使用最新版本：

```javascript
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
```

对于生产环境，我们推荐链接到一个明确的版本号和构建文件，以避免新版本造成的不可预期的破坏：

```javascript
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.11"></script>
```

如果你使用原生 ES Modules，这里也有一个兼容 ES Module 的构建文件：

```javascript
<script type="module">
  import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.esm.browser.js'
</script>
```

你可以在 [cdn.jsdelivr.net/npm/vue](https://cdn.jsdelivr.net/npm/vue/) 浏览 NPM 包的源代码。

Vue 也可以在 [unpkg](https://unpkg.com/vue@2.6.11/dist/vue.js) 和 [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.11/vue.js) 上获取 (cdnjs 的版本更新可能略滞后)。

请确认了解[不同构建版本](https://cn.vuejs.org/v2/guide/installation.html#对不同构建版本的解释)并在你发布的站点中使用**生产环境版本**，把 `vue.js` 换成 `vue.min.js`。这是一个更小的构建，可以带来比开发环境下更快的速度体验。

---

#### NPM

在用 Vue 构建大型应用时推荐使用 NPM 安装[[1\]](https://cn.vuejs.org/v2/guide/installation.html#footnote-1)。NPM 能很好地和诸如 [webpack](https://webpack.js.org/) 或 [Browserify](http://browserify.org/) 模块打包器配合使用。同时 Vue 也提供配套工具来开发[单文件组件](https://cn.vuejs.org/v2/guide/single-file-components.html)。

```javascript
# 最新稳定版
$ npm install vue
```

#### 命令行工具

Vue 提供了一个[官方的 CLI](https://github.com/vuejs/vue-cli)，为单页面应用 (SPA) 快速搭建繁杂的脚手架。它为现代前端工作流提供了 batteries-included 的构建设置。只需要几分钟的时间就可以运行起来并带有热重载、保存时 lint 校验，以及生产环境可用的构建版本。更多详情可查阅 [Vue CLI 的文档](https://cli.vuejs.org/)。

---

### 初始vue

- 下载vue.js
- 创建项目
- 引入vue.js

---

![](https://pic.downk.cc/item/5edb73bbc2a9a83be5c230f1.jpg)

打开浏览器，进入控制台：

![](https://pic.downk.cc/item/5edb740ac2a9a83be5c2f1f6.jpg)

出现上面的效果，引入成功。

---

现在开始，我们第一个vue实例，验证vue的：mvvm的模式好处。

1）修改html：

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
           {{name}}
           <hr>
           {{msg}}
       </div>
</body>
</html>

<script>
    //console.log(Vue)
</script>
```

此时界面：

![](https://pic.downk.cc/item/5edb74adc2a9a83be5c48bd3.jpg)

2) 修改html

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
           {{name}}
           <hr>
           {{msg}}
       </div>
</body>
</html>

<script>
    //console.log(Vue)

    let app = new Vue({
        el: '#app',
        data: {
            name: 'gakki',
            msg: '谢谢大家，喜欢我，啦啦啦啦~~~'
        }
    })
</script>
```

![](https://pic.downk.cc/item/5edb7529c2a9a83be5c5bc5b.jpg)

3）验证mvvm的效果

在浏览器中，直接修改app实例的data参数，dom模型会实时变化：

![](https://pic.downk.cc/item/5edb75f0c2a9a83be5c7a30e.jpg)

---

### 说明

```javascript
let app = new Vue({
   ...
   ...
})

初始化vue时，会在构造方法中，传递一个对象来进行init。

el：是用来进行，model数据（data） 和 view视图（dom）的绑定的。这里就是将div的id为app的进行榜单，#app进行选择器绑定，这个是js中的基本内容，不懂的话，可以先去了解一下。
data：用来绑定数据的
```





