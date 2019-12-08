---
title: Redis中的aof恢复与rdb的迁移
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2019-01-02 11:20:39
summary: redis中的aof恢复与rdb服务器之间的迁移
---

今天来学习redis中的aof恢复与rdb服务器之间的迁移。

基于上篇的知识，当我们在redis的开发中，一不小心，手贱 运行了 flushall，数据都被清空了，该怎么恢复呢？

今天的话题，就由此展开。

## aof的恢复

目前redis下的目录结构如下：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102112932.png"/>

```
bin :            与redis相关的命令目录
redis.conf :     6379的redis配置文件（默认的）
redis6380.conf : 6380的redis配置文件（拷贝的6379）
```

我们知道，redis持久化的目录在：/var/rdb下。（配置文件中配置的）
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102113401.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102113617.png"/>

启动，redis:6379的服务器
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102113805.png"/>

先向redis中，随便存点数据。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102113957.png"/>

现在一不小心，执行了：flushall 。

赶紧：执行 shutdown nosave ，抢救一下。 （后面的参数，加上save的话，就是将shutdown指令也保存到aof文件中，nosave就是不保存）
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102114233.png"/>

查看持久化目录：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102114435.png"/>

查看aof文件中的内容：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102114435.png"/>
`more /var/rdb/appendonly6379.aof`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102114705.png"/>

再次启动，redis服务器：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102114916.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102115022.png"/>

删除aof文件中 与flushall相关的指令即可恢复之前的数据。

`vim /var/rdb/appendonly6379.aof`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102115338.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102115550.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102115654.png"/>

---

再次启动redis服务器，验证数据是否恢复
启动之前，首先检查一下，我们修改后的aof是否有效：（防止格式不对，启动redis服务器失败）
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102120357.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102115806.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102120532.png"/>

**注意：当你执行flushall之后，如果恰好aof进行了重写，那么就真的完蛋了，准备写辞职信吧！**

进行aof重写后，aof文件就会清空了，因为里面是有flushall指令了，redis就会在重写的时候，认为数据库该清空，aof文件就会清空了。

## rdb在服务器之间的迁移

现在，我们想要进行数据的迁移怎么办呢？我们想将一台redis服务器中数据迁移到另一台redis服务器中。

这里，我们演示将6379：redis服务器中的数据迁移到6380：redis服务器中。

查看持久化目录，此时6380还没有rdb文件。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102125758.png"/>

修改6380配置文件，关闭aof持久化功能，避免干扰，因为如果rdb与aof同时存在的话，是会使用aof来恢复数据的。
（注意rdb功能是开启的。）
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102130035.png"/>

启动6380的redis服务器，验证该服务器中是否有数据：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102130806.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102130922.png"/>

关闭6380的redis服务器，并且删除：/var/rdb/下的dump6380.rdb文件（如果有的话）。

**在持久化目录下：拷贝一份dump6379.rdb 文件，名字为dump6380.rdb（与redis6380.conf配置文件配置的一样）**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102131149.png"/>


分别开启：6379与6380的redis服务器。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102130324.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102131317.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102131445.png"/>

**注意：6379的redis服务器是通过aof文件来恢复内存中的数据的，所以如果在拷贝dump文件之前，需要执行save命令，强行执行rdb保存，这样aof持久化的数据就与rdb一致了，否则，有可能现在出现6380服务器中数据与6379不一致问题。**

---

**要点：**

将要迁移的redis服务器的rdb文件，拷贝一份放到需要该数据的redis服务器的**持久化目录下**,而且名字必须与配置文件中**一致**。

比如：我这里，持久化的目录为：`/var/rdb`。rdb的名字为：`dump6380.rdb`。

因为：6380的redis.conf配置文件中：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day10/QQ截图20190102132109.png"/>