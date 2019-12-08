---
title: Redis中的sentinel运维工具
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2019-01-02 15:07:08
summary: redis中的sentinel运维工具
---

接着上篇，来学习redis中的sentinel运维工具。

## 场景问题
在使用sentinel运维工具之前，首先来看一个问题：

当我们搭建好一个主从配置后，1个master，2个slave。入下图：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102151649.png" style="width:50%"/>

如果图中的master宕机了？此时，2个slave就成为了孤儿，该怎么解决呢？

应该将其中一台slave变成master，另一台slave成为这台新master的slave。如下图：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102152108.png" style="width:50%"/>

图中就是使用sentinel自动帮我们监控主从复制的原理图，当sentinel检测到与旧的master之间的通信断开了后，就自动帮我们创建一个新的mater，图中是使用slave1来作为新的master，slave2成为slave1的slave。

## 手动解决

再手动解决该问题之前，要先搭建好：这个master-slave的架构。

怎么搭建主从集群，之前的文章有，这里就不详细写了，搭建好后，示意图如下：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102153345.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102153553.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102153815.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102154007.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102154207.png"/>

---

以上主从复制搭建好后的效果。现在断开master，使用：shutdown 指令。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102154412.png"/>

在6380中：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102154523.png"/>

在6381中：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102154646.png"/>

现在开始手动将slave1：即6380变为：master。

使用：`slaveof no one` 命令，将其修改为，不成为其他redis服务器的slave。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102155104.png"/>

修改成master后，还要修改那个：`replica-read-only yes` 只读，改为：no。不然这个master不能写入操作。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102155416.png"/>

接下来，将slave2：即6381，变为6380的slave。

使用：`slaveof ip port` 来变成其他redis服务器的slave。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102155744.png"/>

测试：在6380中，插入数据，在6781中，读取该数据。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102155935.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102160019.png"/>

以上就是手动解决master宕机后的方法。

### 总结

运行时更改master-slave
修改一台slave(设为A)为new master 
1) 命令该服务不作为其他redis服务器的slave 
   **命令: slaveof no one** 
2) 修改其replica-read-only为 no （使用config指令）
   **命令：config set replica-read-only no**

其他的slave再指向new master A
1) 命令该服务为new master A的slave
   **命令： slaveof  ip  port**

---

## 使用sentinel自动解决

手动解决，确实能行，但是，不能让运维工作人员，24小时待命，一有问题，就去手动解决一下吧，凌晨3点爬起来，手动一下？

因此，redis官网出了一个sentinel运维工具来自动解决这个问题。

**首先将之前的三个redis服务器断开。删除持久化文件，避免干扰。**

从redis的src源文件中，拷贝一份sentinel.conf配置文件到当前目录下：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102161000.png"/>

sentinel.conf配置文件的说明：
```
port 26379   # 端口号
daemonize no # 是否后台启动
pidfile /var/run/redis-sentinel.pid #pid文件

sentinel monitor mymaster 127.0.0.1 6379 2 
这一行代表sentinel监控的master的名字叫做mymaster,地址为127.0.0.1:6379，行尾最后的一个2代表什么意思呢？
我们知道，网络是不可靠的，有时候一个sentinel会因为网络堵塞而误以为一个master redis已经死掉了，当sentinel集群式，
解决这个问题的方法就变得很简单，只需要多个sentinel互相沟通来确认某个master是否真的死了，这个2代表，
当集群中有2个sentinel认为master死了时，才能真正认为该master已经不可用了。
（sentinel集群中各个sentinel也有互相通信，通过gossip协议）。

sentinel auth-pass <master-name> <password> # 如果监视的master设置了密码，该处就需要设置

sentinel down-after-milliseconds mymaster 30000 
#30秒之后监视的master还是没有响应，就认为一次监视失败，配合上述的sentinel monitor后的2来用。单位：毫秒。
sentinel会向master发送心跳PING来确认master是否存活，如果master在“一定时间范围”内不回应PONG 或者是回复了一个错误消息，
那么这个sentinel会主观地(单方面地)认为这个master已经不可用了(subjectively down, 也简称为SDOWN)。
而这个down-after-milliseconds就是用来指定这个“一定时间范围”的，单位是毫秒。

sentinel parallel-syncs mymaster 1 
#恢复数据时的同步个数，我们知道只要master与slave断开后，重写连接后，都需要重写rdb、aof，
如果同时间重连太多，会导致master产生大量的IO运行，容易将master搞奔溃的，所以数字尽量要小！！！
在发生failover主备切换时，这个选项指定了最多可以有多少个slave同时对新的master进行同步，这个数字越小，完成failover所需的时间就越长，
但是如果这个数字越大，就意味着越多的slave因为replication而不可用。可以通过将这个值设为 1 来保证每次只有一个slave处于不能处理命令请求的状态。

sentinel can-failover def_master yes 
#当前sentinel实例是否允许实施“failover”(故障转移) ，no表示当前sentinel为“观察者”(只参与"投票".不参与实施failover)，全局中至少有一个为yes。

sentinel failover-timeout mymaster 180000 #sentinel去执行failover的等待时间

```

**Sentinel的"仲裁会"**

前面我们谈到，当一个master被sentinel集群监控时，需要为它指定一个参数，这个参数指定了当需要判决master为不可用，并且进行failover时，所需要的sentinel数量，本文中我们暂时称这个参数为票数.

不过，当failover主备切换真正被触发后，failover并不会马上进行，还需要sentinel中的大多数sentinel授权后才可以进行failover。
当ODOWN时，failover被触发。failover一旦被触发，尝试去进行failover的sentinel会去获得“大多数”sentinel的授权（如果票数比大多数还要大的时候，则询问更多的sentinel)
这个区别看起来很微妙，但是很容易理解和使用。例如，集群中有5个sentinel，票数被设置为2，当2个sentinel认为一个master已经不可用了以后，将会触发failover，但是，进行failover的那个sentinel必须先获得至少3个sentinel的授权才可以实行failover。
如果票数被设置为5，要达到ODOWN状态，必须所有5个sentinel都主观认为master为不可用，要进行failover，那么得获得所有5个sentinel的授权。

**配置版本号**

为什么要先获得大多数sentinel的认可时才能真正去执行failover呢？

当一个sentinel被授权后，它将会获得宕掉的master的一份最新配置版本号，当failover执行结束以后，这个版本号将会被用于最新的配置。因为大多数sentinel都已经知道该版本号已经被要执行failover的sentinel拿走了，所以其他的sentinel都不能再去使用这个版本号。这意味着，每次failover都会附带有一个独一无二的版本号。我们将会看到这样做的重要性。

而且，sentinel集群都遵守一个规则：如果sentinel A推荐sentinel B去执行failover，B会等待一段时间后，自行再次去对同一个master执行failover，这个等待的时间是通过failover-timeout配置项去配置的。从这个规则可以看出，sentinel集群中的sentinel不会再同一时刻并发去failover同一个master，第一个进行failover的sentinel如果失败了，另外一个将会在一定时间内进行重新进行failover，以此类推。

redis sentinel保证了活跃性：如果大多数sentinel能够互相通信，最终将会有一个被授权去进行failover.
redis sentinel也保证了安全性：每个试图去failover同一个master的sentinel都会得到一个独一无二的版本号。

**配置传播**

一旦一个sentinel成功地对一个master进行了failover，它将会把关于master的最新配置通过广播形式通知其它sentinel，其它的sentinel则更新对应master的配置。

一个faiover要想被成功实行，sentinel必须能够向选为master的slave发送**SLAVEOF NO ONE**命令，然后能够通过INFO命令看到新master的配置信息。

当将一个slave选举为master并发送**SLAVEOF NO ONE**后，即使其它的slave还没针对新master重新配置自己，failover也被认为是成功了的，然后所有sentinels将会发布新的配置信息。

新配在集群中相互传播的方式，就是为什么我们需要当一个sentinel进行failover时必须被授权一个版本号的原因。

每个sentinel使用##发布/订阅##的方式持续地传播master的配置版本信息，配置传播的##发布/订阅##管道是：`__sentinel__:hello`。

因为每一个配置都有一个版本号，所以以版本号最大的那个为标准。

举个栗子：假设有一个名为mymaster的地址为192.168.1.50:6379。一开始，集群中所有的sentinel都知道这个地址，于是为mymaster的配置打上版本号1。一段时候后mymaster死了，有一个sentinel被授权用版本号2对其进行failover。如果failover成功了，假设地址改为了192.168.1.50:9000，此时配置的版本号为2，进行failover的sentinel会将新配置广播给其他的sentinel，由于其他sentinel维护的版本号为1，发现新配置的版本号为2时，版本号变大了，说明配置更新了，于是就会采用最新的版本号为2的配置。

这意味着sentinel集群保证了第二种活跃性：一个能够互相通信的sentinel集群最终会采用版本号最高且相同的配置。

---

说了这么多，我们来验证一下sentinel的功能：

就使用默认的sentinel.conf，不需要改变。

依次启动三个redis服务器：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102171724.png"/>

查看三个redis服务器的配置是否正确：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102171853.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102171933.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102172020.png"/>

首先：启动sentinel进程

`redis-sever sentinel --sentinel`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102172230.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102172319.png"/>

现在已经启动sentinel进程了，进程阻塞在那里，一直在帮我们监视着：127.0.0.1：6379 redis服务器。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102172533.png"/>

现在：断开6379：master：redis服务器。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102172635.png"/>

等待一段时间，喝一杯茶，再看sentinel前台的信息：

会发现：输出 +sdown master mymaster 127.0.0.1 6379 之后就不输出了，只是提示我们，6379：master 挂了，但是没有帮我们自动指定新的master等一些列操作。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102173312.png"/>

这是为啥呢？这是因为默认的sentinel.conf配置文件中，`sentinel monitor mymaster 127.0.0.1 6379 2`,最后面为2，意思是需要两个sentinel确认master已经宕机了才会触发faiover操作。sentinel也是支持集群部署的。

所以，我们需要将其的数字改为：1.

退出三个redis服务器，修改sentinel配置文件：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102182328.png"/>

重启三个redis服务器和sentinel进程，然后shutdown：master。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102182704.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102182758.png"/>

这次，真的喝一杯茶，sentinel就会自动帮助我们处理。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102183150.png"/>

在6380中，info Replication：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102183405.png"/>

在6381中，info Replication：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102183541.png"/>

在6380中，随便插入新的数据， 验证在6381中是否能获取到：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102183708.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102183803.png"/>

以上就是，sentinel自动帮助我们处理的情况。

---

这个，sentinel自动帮我们选择了6380作为新的master，但是有时，我们需要自己设置怎么办？不想让sentinel随机帮我们选择新的master。

这样的话，我们需要设置slave的优先级，如果我们想要使用6381作为新的master，修改其redis.conf配置文件，将其slave的优先级数字改小，越小优先级越高。

<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102184259.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102184432.png"/>

**注意：在之前的redis版本中：是slave-priority , 现在是：replica-priority **

接下来重启三个redis服务器和sentinel进程，shutdown：6379。
注意：在此之前，因为此时三个redis服务器已经被sentinel改了，所以，需要恢复到初始状态，6379：作为6380和6381的master。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102185825.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day11/QQ截图20190102190120.png"/>

以上就是今天是所有内容，希望大家喜欢。


参考链接：
[Redis的主从复制(Sentinel)](https://blog.csdn.net/zhanglh046/article/details/78630336)
[Redis中的Sentinel机制与用法](https://www.cnblogs.com/zhoujinyi/p/5569462.html)