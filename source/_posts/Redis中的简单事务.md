---
title: Redis中的简单事务
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-30 17:05:00
summary: redis中的简单事务
---

今天来学习redis中的简单事务。

在Redis中只支持简单的事务。

## redis与mysql事务的对比

<img src="https://gakkil.gitee.io/gakkil-image/redis/day04/QQ截图20181230170926.png"/>

注: rollback与discard 的区别.

如果已经成功执行了2条语句, 第3条语句出错.

在mysql中，rollback后 , 前2条的语句影响消失.
在redis中，<font color="red">**discard只是结束本次事务 , 前2条语句造成的影响仍然还在**</font>

---

**注意:**

在mutil后面的语句中, 语句出错可能有2种情况

1: 书写的**指令语法**本身就有问题
这种 , 执行exec命令时就会报错, 所有语句得不到执行。

2: 语法本身没错 , 但像那种命令的操作对象有问题时. 比如 zadd 操作list对象。
这种，执行exec命令之后 , **会执行正确的语句 , 并跳过有不适当的语句**.

(如果zadd操作list这种事怎么避免? 这一点,由程序员负责)

---

## 演示操作


现在通过演示转账的案例，来讲解redis中的事务。

首先flushdb，清空redis中的数据库。

1）设置 wang 和 zhao 的初始化金额
```
127.0.0.1:6379> set wang 200
OK
127.0.0.1:6379> set zhao 700
OK
127.0.0.1:6379> mget wang zhao
1) "200"
2) "700"
127.0.0.1:6379> 

```

现在，wang：200元 ，zhao：700元。

2）zhao 向 wang 转入100元。
```
127.0.0.1:6379> multi
OK
127.0.0.1:6379> incrby wang 100
QUEUED
127.0.0.1:6379> decrby zhao 100
QUEUED
127.0.0.1:6379> exec
1) (integer) 300
2) (integer) 600
127.0.0.1:6379> mget wang zhao
1) "300"
2) "600"
127.0.0.1:6379> 
```

首先使用 **multi命令** 开启redis的事务，之后的所有操作命令都会放到一个队列中（从返回的QUEUED可以看出来），当执行exec命令后，redis会将队列中的所有操作命令一次性执行完毕，即符合原子性。

最终的结果，wang：300 ，zhao：600 正确。

3）当操作的语法出现问题时
```
127.0.0.1:6379> flushdb
OK
127.0.0.1:6379> set wang 200
OK
127.0.0.1:6379> set zhao 700
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379> incrby wang 100
QUEUED
127.0.0.1:6379> xxxx zhao 100
(error) ERR unknown command `xxxx`, with args beginning with: `zhao`, `100`, 
127.0.0.1:6379> exec
(error) EXECABORT Transaction discarded because of previous errors.
127.0.0.1:6379> mget wang zhao
1) "200"
2) "700"
127.0.0.1:6379> 
```
从上演示的操作过程中可以看出，当在multi中执行错误的语法时，会提前退出事务环境，之前所有的操作都不会执行，其实就是放弃了队列中的任务。

4）当操作没有语法错误，但有操作命令对象不适合时
```
127.0.0.1:6379> flushdb
OK
127.0.0.1:6379> set wang 200
OK
127.0.0.1:6379> set zhao 700
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379> incrby wang 100
QUEUED
127.0.0.1:6379> sadd zhao pig
QUEUED
127.0.0.1:6379> exec
1) (integer) 300
2) (error) WRONGTYPE Operation against a key holding the wrong kind of value
127.0.0.1:6379> mget wang zhao
1) "300"
2) "700"
127.0.0.1:6379> 
```

上面的操作过程中，故意使用了sadd集合命令来操作字符串对象，但是语法是对的，由于操作对象的不符，当执行exec时，就会发现操作对象的错误提示信息，**但是我们会发现对wang的incrby指令居然执行了！！！，wang增加了100元，变成了300元。因此，redis的事务和mysql的事务不一样，请注意这个细节！！！**

出现类似sadd操作string的这种事时怎么避免呢？<font color="red">**这种事情只能是程序员来避免。**</font>

5) 自主回退的情况
程序员自己觉得不想执行之前的操作了，想要撤回之前的操作，使用discard。
```
127.0.0.1:6379> flushdb
OK
127.0.0.1:6379> set wang 200
OK
127.0.0.1:6379> set zhao 700
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379> incrby wang 100
QUEUED
127.0.0.1:6379> decrby zhao 100
QUEUED
127.0.0.1:6379> discard
OK
127.0.0.1:6379> mget wang zhao
1) "200"
2) "700"
127.0.0.1:6379> 
```

当不想执行之前的命令时，使用discard命令即可，redis就会把队列里的命令都丢掉，不执行。

---

## 思考题

我正在买票：ticket -1 , money -100 。
而票只有1张, 如果在我multi之后 , 和exec之前, 票被别人买了`---即ticket变成0了.`
我该如何观察这种情景,并不再提交呢？

1）首先开启两个redis客户端。

<img src="https://gakkil.gitee.io/gakkil-image/redis/day04/QQ截图20181230202305.png"/>

2）在一个客户端中，设置ticket票数为1，lisi：300元，wangwu：300元，票价为200。

<img src="https://gakkil.gitee.io/gakkil-image/redis/day04/QQ截图20181230202426.png"/>

3）在一个客户端中，执行multi，将票数减一，lisi减200元，但是不执行exec；在另一个客户端中，执行
multi，将票数减一，wangwu减200元，执行exec；在执行exec完成后，在第一个客户端中执行exec。

**第一个客户端中：**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day04/QQ截图20181230203003.png"/>

**第二个客户端中：**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day04/QQ截图20181230203230.png"/>

**第一个客户端中：**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day04/QQ截图20181230203517.png"/>

解决这种问题，通常有两种解决办法：

悲观的想法：

世界是充满危险的，肯定有人同时和我抢票，给ticket上锁，只有我能操作。[悲观锁]

乐观的想法：

没有那么多人和我抢,因此,我只需要注意,有没有人更改ticket的值就可以了。[乐观锁]

<font color="blue">**Redis的事务中,启用的是乐观锁,只负责监测key没有被改动.**</font>

具体是使用watch命令。

**第一个客户端中：**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day04/QQ截图20181230204011.png"/>

**第二个客户端中：**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day04/QQ截图20181230204339.png"/>

**第一个客户端中：**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day04/QQ截图20181230204536.png"/>

---

watch命令
```
WATCH key [key ...]

监视多个key的值的变化
```

unwatch命令
```
解除掉所有的被watch命令监视的key值
```