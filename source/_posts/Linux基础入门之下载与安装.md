---
title: Linux基础入门之软件的下载与安装
categories:
  - Linux
tags:
  - Linux
date: 2018-11-30 20:16:22
summary: Linux系统下软件的安装方式
---

本篇讲解Linux系统下软件的安装方式：RPM 与 YUM。

## rpm包管理

### 介绍

一种用于互联网下载包的**打包**及**安装工具**，它包含在某些Linux分发版中。它生成具有`.RPM扩展名`的文件。RPM是RedHat Package Manager（RedHat软件包管理工具）的缩写，类似于windows的setup.exe，这一文件格式名称虽然打上了RedHat的标志，但理念是通用的。

Linux的分发版本都有采用（suse,redhat, centos 等等），可以算是公认的行业标准了。

rpm包管理的缺点：不能处理依赖关系，如你要安装A软件，但是A软件依赖于B、C软件的支持，因此，你必须先安装B和C软件，然后才能安装A软件。

### rpm包的简单查询指令

```
查询已安装的rpm列表 :
rpm  -qa                #查询所有的rpm软件包
rpm  –qa | grep xx      #查询指定的rpm软件包
rpm  -qa | grep firefox
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130203440.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130203539.png"/>

### rpm包名基本格式

```
一个rpm包名：firefox-52.7.0-1.el7.centos.x86_64.rpm
名称:firefox
版本号：52.7.0
更新发行的次数：1 
适用操作系统: el7.centos.x86_64
表示centos7.x的64位系统
如果是i686、i386表示32位系统，x86_64表示64位的系统，noarch表示通用。
```

### rpm包的其它查询指令

```
rpm -qa : 查询所安装的所有rpm软件包  
rpm -qa | more    
rpm -qa | grep X [rpm -qa | grep firefox ]

rpm -q 软件包名 : 查询软件包是否安装
rpm -q firefox

rpm -qi 软件包名 ：查询软件包信息
rpm -qi firefox

rpm -ql 软件包名 : 查询软件包中的文件
rpm -ql firefox

rpm -qf 文件全路径名 查询文件所属的软件包
rpm -qf /etc/passwd
rpm -qf /root/install.log
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130204147.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130204408.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130204547.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130204655.png"/>

### 卸载rpm包

#### 基本语法
```
rpm -e RPM包的名称
```

#### 应用案例

删除 firefox  软件包

`rpm -e firefox` 
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130211112.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130211228.png"/>


**细节讨论:**

1) 如果其它软件包依赖于您要卸载的软件包，卸载时则会产生错误信息。

如：  `rpm -e  foo` 

removing these packages would break dependencies: **foo is needed by bar-1.0-1**

2) 如果我们就是要删除 foo这个rpm包，可以增加参数 `--nodeps` , 就可以强制删除，但是一般不推荐这样做，因为依赖于该软件包的程序可能无法运行。

如： `rpm -e --nodeps foo` 	 [小心使用]

### 安装rpm包

#### 基本语法

```
rpm -ivh  RPM包全路径名称

参数说明
i = install 安装
v = verbose 提示
h = hash    进度条
```

#### 应用案例

安装firefox浏览器

**提示：很多的rpm软件包，就在我们的centos安装的镜像文件中**

步骤：

1）首先要有Firefox的rpm软件包，才能安装。

一个小知识点，我们的centOS.iso镜像文件中，就有Firefox的rpm软件包。

挂载我们的centOS.ios镜像光驱。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130210825.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130210930.png"/>

光驱一般会在：/media文件夹中：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130211656.png"/>

那么就到 /run/media/root/ 中查找：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130211917.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130212025.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130212226.png"/>

将找到的Firefox软件包，拷贝到我们制定的目录下面，比如：/opt中：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130212416.png"/>

在/opt/中安装，不在光驱中安装。

`rpm -ivh firefox.xxx.rpm`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130212634.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130212809.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130212908.png"/>

输入：`eject`：弹出光驱
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130213349.png"/>

## yum包管理 

### 介绍

Yum 是一个Shell 软件包管理器。基于RPM包管理，能够从指定的服务器自动下载RPM包并且安装，可以**自动处理依赖性关系**，并且一次安装所有依赖的软件包。

通过yum工具配合互联网即可实现软件的安装和自动升级。

### yum的安装

1）查询yum是否已经安装了。

`rpm -qa | grep yum`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130214443.png"/>

2) 如果没有找到，可以到CentOS镜像中找到，并安装yum软件。

`rpm -ivh yum-*.xxx.noarch.rpm`

### yum的基本指令

```
查询yum服务器是否有需要安装的软件
yum  list | grep xxx软件  #查询xxx软件

安装指定的yum包
yum  install  xxx  #下载安装xxx软件
```

### yum应用实例

案例：请使用yum的方式来安装firefox指令 (前提是：你能联网！！！)

1) 查询yum服务器上面是否有Firefox

`yum list | grep firefox`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130215425.png"/>

`yum install firefox`  //会自动的下载适合你系统的最新版本，并且下载所有的依赖软件。

原来我们的机器上就有Firefox，所以先卸载：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130215537.png"/>

安装Firefox：（速度会慢一些，因为是联网下载）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130215801.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130215940.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130220008.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day09/QQ截图20181130220108.png"/>