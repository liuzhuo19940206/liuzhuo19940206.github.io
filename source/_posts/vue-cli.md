---
title: vue-cli
author: gakkij
categories:
  - vue
tags:
  - vue
img: https://pic.downk.cc/item/5f005dc014195aa5948f6eb0.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5f005dc014195aa5948f6eb0.jpg
toc: true
date: 2020-07-04 18:41:24
summary: 使用vue-cli来创建vue项目
password:
---

之前博客的学习都是vue中的核心基础篇，并不是真正在实际项目中的编写方式，今天就带大家来学习vue-cli来创建vue的项目，那我们开始吧~

### vue-cli的介绍

官方介绍文档：https://cli.vuejs.org/zh/

大家跟着教程一步一步的走就行，毕竟vue是国人开发的，中文文档齐全呀。

#### 安装vue-cli

```java
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

我使用的mac，已经安装了npm，大家可以自行去安装，可以配置cnpm，国内的镜像，加快下载速度。

![](https://pic.downk.cc/item/5f005ffe14195aa5949058d6.jpg)

下载vue-cli

![](https://pic.downk.cc/item/5f0060d514195aa59490b88d.jpg)

执行：`cnpm install -g @vue/cli`可能会出现没有权限的问题，请切换成管理员的身份，或者加上：sudo。

windows系统，请选择使用管理员的身份打开终端即可。

#### 创建vue项目

1）选择一个你喜欢的文件夹下面

2）执行：`vue create my-project`

---

步骤：

1）终端输入：`vue create testapp`

![](https://pic.downk.cc/item/5f0062f214195aa594918ef7.jpg)

选择：Manually select features，我们自己来控制创建vue项目时的模块。

下标移动到到：`Manually select features`上面，回车即可。

![](https://pic.downk.cc/item/5f0063b214195aa59491d886.jpg)

Babel：编译

TypeScript：如果你不是使用js，想使用TypeScript语言，就选上

Progressive Web App：渐进式web app，一般不用，还不成熟

Router：vue中的路由功能

Vuex：是一种集中式状态管理模式，它按照一定的规则管理状态，保证状态的变化是可预测的。

Css：css的预编译的功能

Linter / Formatter：编写代码时的格式化的提示功能，帮助编写优雅的格式

Unit Testing：单元测试

E2E Testing：点对点测试

---

这里，简单的vue项目创建，只需要编译功能即可：就选择 Babel即可。

![](https://pic.downk.cc/item/5f0065ec14195aa59492c829.jpg)

dedicated config files：单独的文件配置

package.json：所有配置在一个文件中。

---

![](https://pic.downk.cc/item/5f00664e14195aa59492f069.jpg)

![](https://pic.downk.cc/item/5f0066ab14195aa594931412.jpg)

---

到此时，回车后，就开始下载安装vue项目了。

![](https://pic.downk.cc/item/5f00670314195aa5949336f8.jpg)

进行testapp项目中：

![](https://pic.downk.cc/item/5f0067ba14195aa59493845d.jpg)

说明：

node_modules：就是vue-cli帮助我们安装的模块

package.json：编译打包配置文件

src：我们编写源代码的地方，放置 .vue文件，vue的编译工具会帮我们将 .vue文件编译成html给浏览器能够识别

public：存放我们的页面地方，index.html

#### 运行vue项目

执行：`npm run server`命令

![](https://pic.downk.cc/item/5f00690214195aa59493ff53.jpg)

打开浏览器输入：http://localhost:8080/

![](https://pic.downk.cc/item/5f00693c14195aa594941474.jpg)

---

#### 编译vue项目

执行：`npm run build`

![](https://pic.downk.cc/item/5f006a1714195aa5949464ec.jpg)

在testapp下会生成一个：dist文件夹，里面就是编译好的项目。

![](https://pic.downk.cc/item/5f006a9014195aa59494917a.jpg)

### vue-cli的可视化操作

执行：`vue ui`

回到根目录，执行：vue ui，为了创建项目和testapp在同级目录好看而已。

![](https://pic.downk.cc/item/5f007b3914195aa5949ba389.jpg)

![](https://pic.downk.cc/item/5f007beb14195aa5949bf549.jpg)

执行后，会在我们默认的浏览器中弹出创建vue的界面：http://localhost:8000/project/select

![](https://pic.downk.cc/item/5f007b9514195aa5949bcf41.jpg)

---

点击创建

![](https://pic.downk.cc/item/5f007c6214195aa5949c2f45.jpg)

点击：在此创建新的项目

![](https://pic.downk.cc/item/5f007dc614195aa5949cd0cb.jpg)

---

![image-20200704210306975](/Users/liuzhuo/Library/Application Support/typora-user-images/image-20200704210306975.png)

---

这里，我们还是选择：手动，再来过一遍流程：

![](https://pic.downk.cc/item/5f007e7b14195aa5949d237e.jpg)

和命令行模式一样，只是变成了图形化界面。

---

![](https://pic.downk.cc/item/5f007ed414195aa5949d4bc0.jpg)

---

![](https://pic.downk.cc/item/5f007eef14195aa5949d579d.jpg)

创建项目成功后：

![](https://pic.downk.cc/item/5f007f1b14195aa5949d6b39.jpg)

![](https://pic.downk.cc/item/5f0080ab14195aa5949e24b2.jpg)

编译vue项目：

![](https://pic.downk.cc/item/5f0080e814195aa5949e410f.jpg)

---

![](https://pic.downk.cc/item/5f00811214195aa5949e566b.jpg)

![](https://pic.downk.cc/item/5f00816114195aa5949e7f5e.jpg)

---

![](https://pic.downk.cc/item/5f00818f14195aa5949e9654.jpg)

运行：

![](https://pic.downk.cc/item/5f0081e714195aa5949ec06c.jpg)

![](https://pic.downk.cc/item/5f00820814195aa5949ed155.jpg)

