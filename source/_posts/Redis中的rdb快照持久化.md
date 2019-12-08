---
title: Redis中的rdb快照持久化
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-31 11:33:50
summary: redis中的rdb持久化操作
---

今天来学习redis中的持久化操作，这是redis缓存一大优势。

## rdb的工作原理

每隔 <font color="red">**N分钟 或 N次写**</font> 操作后, 从内存dump数据形成rdb文件 , <font color="red">**压缩**</font> 放在 <font color="red">备份**目录**</font>


注: <font color="red">**红色部分**</font>可通过参数来配置。

## rdb的配置文件

打开redis.conf文件。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231114006.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231114858.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231115310.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231115344.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231115423.png"/>

接下来详细说明：
```
save 900 1    #刷新快照到硬盘中，必须满足两者要求才会触发，即900秒之内至少有1个key发生变化。
save 300 10   #必须是300秒之内至少有10个key发生变化。
save 60 10000 #必须是60秒之内至少有10000个key发生变化。
stop-writes-on-bgsave-error yes    #后台存储rdb文件发生错误时停止写入。
rdbcompression yes    #使用LZF压缩rdb文件。
rdbchecksum yes       #存储和加载rdb文件时校验。
dbfilename dump.rdb   #设置rdb文件名。
dir ./                #设置工作目录，rdb文件会写入该目录。

```

主要说一下：stop-writes-on-bgsave-error的配置。在之前的redis版本中，redis是单进程的，因此在redis在持久化的过程中，如果有其他的客户端发送请求，此时redis服务器是不会响应客户端的请求的，后来redis改版后，可以通过主进程来进行持久化的工作，子进程来响应客户端的请求。此时就会出现一个问题，当主进程进行持久化的过程中，客户端同时在向服务器端发送写的操作，如果突然断电等特殊情况，导致主进程的持久化出现了错误，在这个过程中的客户端的写入是否保存呢？就是该参数来配置的，stop-writes-on-bgsave-error **yes**,那就是此阶段客户端的写操作不写入。

---

## rdb的缺陷

在2个保存点之间 , 断电 , 将会丢失（1到N）分钟的数据。

出于对持久化的更精细要求 , redis增添了aof方式 （append only file）。

### 演示案例

1）设置保存rdb文件的目录
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231122100.png"/>

修改rdb持久化保存目录。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231124756.png"/>


2）删除当前目下的dump.rdb文件（防止干扰）
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231122214.png"/>

3）开启redis服务器
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231122636.png"/>

4）使用redis的工具，一秒钟中set一万条数据
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231122956.png"/>

上面的参数写错了，应该是 `./bin/redis-benchmark -n 10000`. 注意是 **-n**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231123119.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231123547.png"/>

5）再次插入一个不相干的数据
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231123710.png"/>

6）模拟断电，不正常的情况
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231123844.png"/>

7）再次启动redis服务器
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231124112.png"/>

8）测试数据是否存在
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231124242.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231124416.png"/>

想必，大家应该知道为啥最后的 address没有保存下来了吧，因为是刚刚插入那条数据，就模拟突然断电了，不符合那三个save的要求，所以没有保存。

这就是redis使用rdb持久化的缺陷，会存在数据丢失的情况。

查看redis的持久化文件dump.rdb
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231125002.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day06/QQ截图20181231125053.png"/>

### 注意事项

如果不想使用rdb来持久化操作，直接注释掉那三个save配置信息即可。

想要进行更加精细的持久化，请使用aop日志来持久化。一般，我使用两者来进行持久化。