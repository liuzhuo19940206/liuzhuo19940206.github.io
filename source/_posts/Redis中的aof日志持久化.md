---
title: Redis中的aof日志持久化
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-31 14:36:19
summary: redis中的aof日志持久化操作
---

接着上篇的内容，来讲述redis中的aof日志持久化操作

通过上篇，我们知道了redis中的rdb快照持久化操作，但是由于其存在丢失数据的现象，所以提出了aof持久化的操作。

rdb恢复数据的速度是比aof快的，aof是通过将每次执行的操作命令，写入到一个文件中保存起来，当作持久化的。

## aof的原理

<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231154133.png"/>

现在提出两个问题：

1:每次执行一次命令都要写入到aof文件中吗?
2:某key操作100次,产生100行记录,aof文件会很大,怎么解决?

首先先思考，在后面的学习中，会依次解决这两个问题。

## aof的配置选项

打开redis.conf文件
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231154509.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231154616.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231154717.png"/>

主要关注aof中几个重点配置选项
```
appendonly no        # 是否仅要日志,就是是否开启aof日志

appendfsync always   # 系统不缓冲,每次执行一次命令，就写入一次，慢,丢失数据少
appendfsync everysec # 折中,每秒写如一次
appendfsync no       # 系统缓冲,统一写,由操作系统来决定，速度快

no-appendfsync-on-rewrite no     # 当重写aof文件时是否同步最新数据，no同步更新，yes不同步更新
auto-AOF-rewrite-percentage 100  # 当前aof文件比上次重写时文件大N%时重写
auto-AOF-rewrite-min-size 64mb   # aof重写至少要达到的大小

```

## 演示

1）开启aof日志，并设置aof文件的保存目录以及名字
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231155858.png"/>

2）开启redis服务器

如果已经开启了，就杀死：`pkill -9 redis`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231160138.png"/>

重新开启redis服务器，使用刚刚修改后的redis.conf配置文件
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231160423.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231160619.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231160709.png"/>

3）开启redis的客户端
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231161005.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231161144.png"/>

---

如果aof是每执行一次命令，就向aof文件插入一条数据的话，那就不能体现redis快速缓存的优势了，因为每次都是写入到磁盘上面，和mysql一样了。

为了平衡 快速读取数据与持久化 ，aof所以出现了：appendfsync 配置。

根据你的实际需求，设置appendfsync的值，如果数据很重要，不能丢失一丁点，那就always。一般使用：everysec。

---

我们也注意到了，每次对同一个key执行操作，都会写入到aof文件中。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231161921.png"/>

如果num想加到100，那么aof文件中就会出现很多incr指令，这样不是很浪费空间吗？aof文件会瞬间增涨很多，怎么解决呢？

redis中，就出现了aof重写的方法。我们知道num最后的状态是100，那么直接存指令set num 100就好了，就不用存在那么多的incr指令，节约空间。

使用：`auto-AOF-rewrite-percentage 和 auto-AOF-rewrite-min-size`

如果不使用：auto-AOF-rewrite-min-size的话，前期aof文件很小，每次写入一个命令，都是之前文件的100%倍，那样的话，每次都会重写，因此出现了设置aof文件最小重写的大小，当到达最小要求时，才会重写。

现在我们来验证这个配置。

修改aof的最小重写大小，这里是为了方便演示，所以设置成了20mb。

<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231162751.png"/>

重启redis服务器
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231162920.png"/>

使用测试redis性能的执行，来随机执行20000条指令
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231163103.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231163337.png"/>

接着再执行20000条数据。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231163530.png"/>

在右边的客户端执行redis命令时，左边的一直测试aof文件的大小，发现aof文件一开始是从13M开始增加，当超过20M后，就会突然变小成4.3M了，这是因为触发了aof的重写命令。

也可以直接执行aof重写的命令来重写：`bgrewriteaof`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231164124.png"/>

## 问题

注: 1）在dump rdb过程中 , aof如果停止同步 , 会不会丢失?
答: 不会 , 所有的操作缓存在内存的队列里, dump完成后,统一操作.

注: 2）aof重写是指什么?
答: aof重写是指把内存中的数据,逆化成命令,写入到.aof日志里.
以解决 aof日志过大的问题.

**问: 3）如果rdb文件,和aof文件都存在,优先用谁来恢复数据?**
答: <font color="red">**aof**</font>

问: 4）2种是否可以同时用?
答: 可以,而且推荐这么做

问: 5）恢复时rdb和aof哪个恢复的快
答: rdb快,因为其是数据的内存映射,直接载入到内存,而aof是命令,需要逐条执行.

---

演示第三个问题。

当rdb文件和aof文件同时存在时，会使用aof来恢复数据！！！

1）首先查看是否存在rdb文件。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231164640.png"/>

2）删除aof文件，避免干扰
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231164851.png"/>

3）查看现在redis缓存中存在哪些数据
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231164942.png"/>

存在site数据。

4）杀死redis服务器，重启redis服务器
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231165054.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231165310.png"/>

为啥site不存了呢？这是因为，我们开启了aof日志，但是，目前aof文件中还没有保存任何数据，所以恢复数据的时候，啥也没有！

查看aof文件的保存目录：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231165538.png"/>

现在删除aof文件，并关闭aof日志。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231165659.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231165801.png"/>

重启redis服务器
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231170047.png"/>

此时site数据又存在了，这是因为，我们关闭了aof日志，此时是依靠rdb文件来恢复数据的。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day07/QQ截图20181231170228.png"/>