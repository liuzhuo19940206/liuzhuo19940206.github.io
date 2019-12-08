---
title: Docker中的本地镜像发布到阿里云
categories:
  - docker
  - 容器
tags:
  - docker
  - 容器
date: 2019-01-12 16:54:09
summary: 将Docker中的本地镜像发布到阿里云上面
---

这篇主要来学习怎么将Docker中的本地镜像发布到阿里云上面。

## 本地镜像发布到阿里云流程

<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112165829.png"/>

## 镜像的生成方法

### 使用Dockerfile文件生成

`docker build -f Dockerfile路径 -t 镜像名:TAG` 指令来生成，参考Dockerfile文件解析那篇文章。

### 从已有的容器中创建一个新的镜像

`docker commit [OPTIONS] 容器ID [REPOSITORY[:TAG]]`
```
OPTIONS说明：
-a :提交的镜像作者；
-m :提交时的说明文字；
```

这里，我使用mycentos:1.3为例，来生成 mycentos:1.4镜像：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112170636.png"/>

首先启动 mycentos:1.3 容器：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112170847.png"/>

接下来，生成 mycentos:1.4 镜像：

`docker commit -a gakki -m 'gakki commit mycentos:1.4' mycentos:1.3的容器ID mycentos:1.4`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112171218.png"/>

---

## 将本地镜像推送到阿里云

### 本地要推送的镜像素材
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112171359.png"/>

### 进入阿里云开发者平台

`https://dev.aliyun.com/search.html`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112171634.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112171805.png"/>

### 创建仓库镜像
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112172159.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112172330.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112172701.png"/>

### 将本地镜像推送到阿里云
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112172831.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112172921.png"/>
```
$ sudo docker login --username=liuzhuo19940206 registry.cn-hangzhou.aliyuncs.com
$ sudo docker tag [ImageId] registry.cn-hangzhou.aliyuncs.com/gakkij/mycentos:[镜像版本号]
$ sudo docker push registry.cn-hangzhou.aliyuncs.com/gakkij/mycentos:[镜像版本号]

如果你是 root，就不需要加上sudo。

上面是我的账号，如果是你的话，请改成你的账号，即：拷贝阿里云上面的关键步骤
```
第一步：登入
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112173427.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112173632.png"/>

第二步：设置镜像的版本号
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112173913.png"/>

第三步：推送
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112174050.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112174317.png"/>

### 在阿里云的公有云可以查到

<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112174617.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112174741.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112174811.png"/>

### 将阿里云上的镜像下载到本地

<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112175134.png"/>

```
拼接起来如下：

docker pull registry.cn-hangzhou.aliyuncs.com/gakkij/mycentos:1.4.1
```
首先删除本地的mycentos:1.4.1的镜像：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112175450.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112175634.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112175722.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day08/QQ截图20190112175847.png"/>

---

以上，就是今天所有的内容了，相信大家已经学会了，从本地上传镜像到阿里云，也会从阿里云上拉取镜像了。爱生活，爱技术，我是gakkij酱。