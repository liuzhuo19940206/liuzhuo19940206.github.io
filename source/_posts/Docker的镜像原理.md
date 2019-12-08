---
title: Docker的镜像原理
categories:
  - docker
  - 容器
tags:
  - docker
  - 容器
date: 2019-01-10 15:23:28
summary: docker中镜像原理
---

今天来学习docker中镜像原理，以及相关的commit命令。

## 镜像是什么

镜像是一种轻量级、可执行的独立软件包，<font color="red">用来打包软件运行环境和基于运行环境开发的软件</font>，它包含运行某个软件所需的所有内容，包括代码、运行时、库、环境变量和配置文件。

### UnionFS（联合文件系统）

UnionFS（联合文件系统）：Union文件系统（UnionFS）是一种分层、轻量级并且高性能的文件系统，它支持对文件系统的修改作为一次提交来一层层的叠加，同时可以将不同目录挂载到同一个虚拟文件系统下(unite several directories into a single virtual filesystem)。Union 文件系统是 Docker 镜像的基础。**镜像可以通过分层来进行继承，基于基础镜像（没有父镜像），可以制作各种具体的应用镜像。**

**特性**：一次同时加载多个文件系统，但从外面看起来，只能看到一个文件系统，联合加载会把各层文件系统叠加起来，这样最终的文件系统会包含所有底层的文件和目录。

### Docker镜像加载原理

<font color="red">Docker镜像加载原理：</font>

docker的镜像实际上由一层一层的文件系统组成，这种层级的文件系统UnionFS。

bootfs(boot file system)主要包含bootloader和kernel, bootloader主要是引导加载kernel, Linux刚启动时会加载bootfs文件系统，在docker镜像的最底层是bootfs。这一层与我们典型的Linux/Unix系统是一样的，包含boot加载器和内核。当boot加载完成之后整个内核就都在内存中了，此时内存的使用权已由bootfs转交给内核，此时系统也会卸载bootfs。

rootfs (root file system) ，在bootfs之上。包含的就是典型 Linux 系统中的 /dev, /proc, /bin, /etc 等标准目录和文件。rootfs就是各种不同的操作系统发行版，比如Ubuntu，Centos等等。

<font color="blue">平时我们安装进虚拟机的CentOS都是好几个G，为什么docker这里才200M？？</font>

对于一个精简的OS，rootfs可以很小，只需要包括最基本的命令、工具和程序库就可以了，因为底层直接用Host的kernel，自己只需要提供 rootfs 就行了。由此可见对于不同的linux发行版, bootfs基本是一致的, rootfs会有差别, 因此不同的发行版可以公用bootfs。

### 分层的镜像

以我们的pull为例，在下载的过程中我们可以看到docker的镜像好像是在一层一层的在下载
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110160603.png"/>

### 为什么Docker镜像要采用这种分层结构呢

最大的一个好处就是 - 共享资源

比如：有多个镜像都从相同的 base 镜像构建而来，那么宿主机只需在磁盘上保存一份base镜像

同时内存中也只需加载一份 base 镜像，就可以为所有容器服务了。而且镜像的每一层都可以被共享。

## 镜像的特点

* docker镜像都是**只读的**。

* 当容器启动时，一个新的**可写层**被加载到镜像的**顶部**。

* 这一层通常被称作“容器层”，“容器层”之下的都叫“镜像层”。


## 镜像的提交

我们能不能提交自己的镜像呢？ 然后根据自己的镜像生成相应的容器呢？

答案：当然是可以的撒，不然的话，docker将无法适应开发者多变的需要。

### docker commit

`docker commit`: 提交容器副本使之成为一个新的镜像。
```
docker commit -m="提交的描述信息" -a="作者"  容器ID  命名空间/要创建的目标镜像名:[标签名]
```

### 案例演示

这里，我们来使用tomcat镜像来演示。

**1.从Hub上下载tomcat镜像到本地并成功运行**

`docker pull tomcat`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110155847.png"/>

**2.运行tomcat容器**

`docker run -it -p 8080:8080 tomcat`

```
启动容器后面的参数，之前应该讲过了，这里再重复一遍

-it：以后台交互的方式启动容器。

-p：dockerPort:containerPort     docker的端口号映射到docker容器的端口号。（小写的p）

-P：docker会随机帮我们分配端口号 (大写的P)

解释：我们的docker是运行在宿主机上面的，而宿主机只能访问到docker的端口号，如果想要访问到docker内部容器的端口号，就需要映射。    
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110161525.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110161629.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110161827.png"/>

验证tomcat容器是否启动成功：

1.在虚拟机验证
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110162108.png"/>

2.在本机中验证
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110162230.png"/>

**3.删除tomcat的文档说明文件**

现在，我们故意删除tomcat的文档说明文件，然后提交生成新的镜像来说明问题。

怎么删除tomcat中是文档说明文件呢？

在window系统中，我们知道下载好的tomcat的目录下的webapp下有一个doc目录，就是文档说明文件。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110162737.png"/>

在linux中，下载好的tomcat也有相关的文档说明文件，但是使用docker镜像生成的tomcat容器，怎么进入里面呢？

我们知道，docker镜像文件，就相当于一个微小型linux系统，因此进入里面的方法，就是相当于进入centos的交互方法一样。

 `docker exec -it tomcat容器id /bin/bash`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110163823.png"/>

在浏览器中输入：`localhost:8888` , 然后点击Documentation
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110164641.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110164727.png"/>

如果，没有出现404，刷新一下，因为有缓存。注意：以上都是一气呵成的，中途tomcat容器不能停止运行呀。

**4.将已经删除文档的tomcat容器生成新的镜像**

`docker commit -a='liuzhuo' -m='del tomcat docs' tomcat容器的ID gakki/mytomcat:1.1`
```
说明：

-a：  提交的作者
-m：  提交的信息

gakki/mytomcat:1.1         命名空间/新的镜像名:标签

命令空间：只是为了区分而已。
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110165701.png"/>

**5.启动我们的新的镜像并与原来的镜像进行对比**

启动gakki/mytomcat:1.1
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110170937.png"/>

启动原来的tomcat
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110170958.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110171048.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110171205.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110171314.png"/>


以上就是演示，怎么提交新的镜像，根据新的镜像，启动新的容器的过程。

---

演示，使用`-P`（大写的P）
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110171629.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110171718.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110171842.png"/>

演示，使用 `-d` 后台运行tomcat容器

<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110172200.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day04/QQ截图20190110172250.png"/>

**注意：**

之前不是说，后台运行的容器，只是运行一下下就退出的嘛？怎么这里不是呢？

因为，tomcat后台启动后，会挂起，如果不是挂起的后台启动，都只是会启动一下就停止运行。