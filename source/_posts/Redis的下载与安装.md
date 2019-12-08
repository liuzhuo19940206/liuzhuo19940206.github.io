---
title: Redis的下载与安装
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-21 20:07:52
summary: 今天来学习Redis缓存，完成redis的下载与安装
---

今天来学习Redis缓存，完成redis的下载与安装。

## Redis的特点

Redis is an open source, BSD licensed, advanced key-value store. It is often referred to as a data structure server since keys can contain strings, hashes, lists, sets and sorted sets.

redis是开源,BSD许可,高级的key-value存储系统. 可以用来存储字符串,哈希结构,链表,集合,因此,常用来提供数据结构服务.

### redis和memcached的对比

1.  redis可以用来做存储(storge), 而memcached是用来做缓存(cache)。这个特点主要因为其有**”持久化”**的功能.

2. 存储的数据有”结构”,对于memcached来说,存储的数据,只有1种类型--”字符串”,而redis则可以存储字符串,链表,哈希结构,集合,有序集合.

## Redis的安装

### 打开官网：redis.io
1.打开官网：redis.io。下载最新版本或者最新的稳定版本。

<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221201926.png"/>

点击查看更多的安装版本：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221202252.png"/>

往下能看到，官方提供的安装步骤：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221202341.png"/>

### 打开虚拟机
2.打开虚拟机

如果不会使用虚拟机（linux），那么请看我之前的linux教程即可。

使用Xshell来远程操作linux即可。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221203308.png"/>

### 下载redis的压缩包
3.下载redis的压缩包

`wget http://download.redis.io/releases/redis-5.0.3.tar.gz`

先切换目录到：usr/local/src/下，这个目录一般是用来安装下载的软件的。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221203739.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221203856.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221204116.png"/>

### 解压redis压缩包
4.解压redis压缩包

`tar zxvf redis-5.0.3.tar.gz`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221204603.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221204719.png"/>

### 不用configure
5.**不用configure**

因为下载好的redis压缩包，官方已经帮我们configure过了。

### 使用make编译redis
6.直接make（编译redis）

`make`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221204852.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221205123.png"/>


**注意问题：** make的过程中可能出现的问题，因为官方的redis源码是configure过的，但官方的configure时，生成的文件有时间戳的信息。

Make只能发生在configure之后，如果你的虚拟机的时间在configure之前，那么就会出现问题，比如，官方configure的时间是2018年12月10号，但是你的虚拟机的时间是2018年12月1号，在10号之前，那么就会出现问题。

解决：修改虚拟机的时间即可。

### 测试编译情况
7.可选步骤：make test 测试编译情况

（可能出现：xxx 的版本过低的问题，直接 yum install xxx）

### 安装redis到指定的目录中
8.安装redis到指定的目录中，比如：/usr/local/redis

`make PREFIX=/usr/loacl/redis install`

注意：PREFIX是大写。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221210034.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221210129.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221210210.png"/>

安装后，发现只有bin目录，是正确的。

会得到以下几个文件：
```
redis-benchmark    性能测试工具
redis-check-aof    日志文件检测工(比如断电造成日志损坏,可以检测并修复)
redis-check-dump   快照文件检测工具,效果类上。
redis-cli          客户端
redis-server       服务端

```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221210353.png"/>

### 复制redis的配置文件到bin目录下
9.复制redis的配置文件到bin目录下

`cp /usr/local/src/redis-5.0.1/redis.conf ./`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221210857.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221211030.png"/>

### 启动redis服务器
10.启动redis服务器

`./bin/redis-server ./redis.conf`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221211225.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221211350.png"/>

不要：ctrl+c退出redis服务器端。

重新开启一个新的linux连接端，启动redis的客户端：

`./bin/redis-cli`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221212336.png"/>

### 简单测试redis功能
11.简单测试redis功能

往name字符串中存入张三，然后获取张三。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221212541.png"/>

### 让redis以后台进程的形式运行
12.让redis以后台进程的形式运行

实际生产中，不能一直开启redis的服务端而不断开，应该是开启一个后台进程运行redis服务器。

打开redis.conf配置文件。

将daemonize 改为：yes
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221212956.png"/>

再次启动redis的服务端：

`./bin/redis-server ./redis.conf`

此时不会再出现那个很大的logo图标了。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221213130.png"/>

检测redis服务端是否成功启动了呢？查找redis相关的进程

`ps aux |grep redis`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221213435.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day01/QQ截图20181221213537.png"/>

**注意：**这里的name是上次保存到redis缓存中的，但是这次居然获取成功了，因为新版本的redis，默认配置了持久化操作，上次ctrl+c退出redis服务器后，会自动帮我们持久化数据，在redis目录下面，会发现多了一个**dump.rdb**文件，就是持久化数据后的文件。如果是以前的版本就不会帮我们持久化数据！！！
