---
title: 利用Redis实现分布式锁
categories:
  - redis
  - 分布式锁
tags:
  - redis
  - 分布式锁
date: 2019-01-08 21:38:23
summary: 利用Redis实现分布式锁
---

我在之前总结幂等性的时候，写过一种分布式锁的实现，可惜当时没有真正应用过，着实的心虚啊。正好这段时间对这部分实践了一下，也算是对之前填坑了。

分布式锁按照网上的结论，大致分为三种：1、数据库乐观锁； 2、基于Redis的分布式锁；3、基于ZooKeeper的分布式锁。

关于数据库的乐观锁实现网上已经有很多了，如果有必要的话，留言一下，我以后会出相关的mysql乐观锁。

今天先简单总结下redis的实现方法，后面详细研究过ZooKeeper的实现原理后再具体说说ZooKeeper的实现。

## 为什么需要分布式锁

在传统单体应用单机部署的情况下，可以使用Java并发相关的锁，如**ReentrantLcok**或**synchronized**进行互斥控制。但是，随着业务发展的需要，原单体单机部署的系统，渐渐的被部署在多机器多JVM上同时提供服务，这使得原单机部署情况下的并发控制锁策略失效了，为了解决这个问题就需要一种跨JVM的互斥机制来控制共享资源的访问，这就是分布式锁要解决的问题。

## 分布式锁的实现条件

1、互斥性，和单体应用一样，要保证任意时刻，只能有一个客户端持有锁

2、可靠性，要保证系统的稳定性，不能产生死锁

3、一致性，要保证锁只能由加锁人解锁，不能出现A用户产生的锁被B用户解锁的情况

## Redis分布式锁的实现

Redis实现分布式锁，不同的人可能有不同的实现逻辑，但是核心就是下面三个方法。

### SETNX

SETNX key val
当且仅当key不存在时，set一个key为val的字符串，返回1；若key存在，则什么都不做，返回0。

### Expire
expire key timeout
为key设置一个超时时间，单位为second（秒），超过这个时间锁会自动释放，避免死锁。

### Delete
delete key
删除key。

## 获取锁

首先讲一个目前网上应用最多的一种实现:

<img src="https://gakkil.gitee.io/gakkil-image/redis/day14/QQ截图20190108214911.png"/>

实现思路：

1.获取锁的时候，使用setnx加锁，并使用expire命令为锁添加一个超时时间，超过该时间则自动释放锁以免产生死锁，锁的value值为一个随机生成的UUID，通过此在释放锁的时候进行判断。

2.获取锁的时候还设置一个获取的超时时间，若超过这个时间则放弃获取锁。

3.释放锁的时候，通过UUID判断是不是该锁，若是该锁，则执行delete进行锁释放。

```
public String getRedisLock(Jedis jedis, String lockKey, Long acquireTimeout, Long timeOut) {
    try {
        // 定义 redis 对应key 的value值(uuid) 作用 释放锁 随机生成value,根据项目情况修改
        String identifierValue = UUID.randomUUID().toString();
        // 定义在获取锁之后的超时时间
        int expireLock = (int) (timeOut / 1000);// 以秒为单位，timeOut：传入的是毫秒值。
        // 定义在获取锁之前的超时时间
        // 使用循环机制 如果没有获取到锁，要在规定acquireTimeout时间 保证重复进行尝试获取锁
        // 使用循环方式重试的获取锁
        Long endTime = System.currentTimeMillis() + acquireTimeout;
        while (System.currentTimeMillis() < endTime) {
            // 获取锁
            // 使用setnx命令插入对应的redislockKey ，如果返回为1 成功获取锁
            if (jedis.setnx(lockKey, identifierValue) == 1) {
                // 设置对应key的有效期
                jedis.expire(lockKey, expireLock);
                return identifierValue;
            }
        }

    } catch (Exception e) {
        e.printStackTrace();
    } 
    return null;
    }
```

这种实现方法也是目前应用最多的实现，我一直以为这确实是正确的。**然而由于这是两条Redis命令，不具有原子性**，如果程序在执行完setnx()之后突然崩溃，导致锁没有设置过期时间。那么还是会发生死锁的情况。**网上之所以有人这样实现，是因为低版本的 jedis 并不支持多参数的set()方法。**

当然这种情况 jedis 的设计者也显然想到了，新版的 jedis 可以**同时set多个参数**，具体实现如下：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day14/QQ截图20190108215608.png"/>

实现思路：

基本上和原来的逻辑类似，**只是将 setnx 和 expire 的操作合并为一步**，改为使用新的set多参的方法。

set(final String key, final String value, final String nxxx, final String expx , final long time)

key和value自然不用多说。nxxx参数只可以传String 类型的NX（仅在不存在的情况下设置）和 XX（和普通的set操作一样会做更新操作）两种。

expx是指到期时间单位，可传参数为EX （秒）和 PX （毫秒）, time就是具体的过期时间了，单位为前面expx所指定的。

```
public String getRedisLock(Jedis jedis, String lockKey, Long acquireTimeout, Long timeOut) {
    try {
        // 定义 redis 对应key 的value值(uuid) 作用 释放锁 随机生成value,根据项目情况修改
        String identifierValue = UUID.randomUUID().toString();
        // 定义在获取锁之前的超时时间
        // 使用循环机制 如果没有获取到锁，要在规定acquireTimeout时间 保证重复进行尝试获取锁
        // 使用循环方式重试的获取锁
        Long endTime = System.currentTimeMillis() + acquireTimeout;
        while (System.currentTimeMillis() < endTime) {
            // 获取锁
            // set使用NX参数的方式就等同于 setnx()方法，成功返回OK。PX以毫秒为单位
            if ("OK".equals(jedis.set(lockKey, identifierValue, "NX", "PX", timeOut))) {
                return identifierValue;
            }
        }

    } catch (Exception e) {
        e.printStackTrace();
    } 
    return null;
    }
```

好了，获取锁的操作基本上就上面这些，有同学可能要问，为什么不直接返回一个Boolean型的true或false呢？

正如我前面所说的，要保证解锁的一致性，所以就需要通过value值来保证解锁人就是加锁人，而不能直接返回true或false了。

## 释放锁

还是先举一个错误的例子：

<img src="https://gakkil.gitee.io/gakkil-image/redis/day14/QQ截图20190108220325.png"/>

实现思路：

释放锁的时候，通过传入key和加锁时返回的value值，判断传入的value是否和key从redis中取出的相等。相等则证明解锁人就是加锁人，执行delete释放锁的操作。

```
// 释放redis锁
public void unRedisLock(Jedis jedis, String lockKey, String identifierValue) {
    try {
        // 如果该锁的id 等于identifierValue 是同一把锁情况才可以删除
        if (jedis.get(lockKey).equals(identifierValue)) {
            jedis.del(lockKey);
        }
    } catch (Exception e){
        e.printStackTrace();
    }
}
```
看着好像没啥问题哈。然而仔细想想又总感觉哪里不对。

如果在执行jedis.del(lockKey)操作之前，刚好锁的过期时间到了，而这个时候又有别的客户端取到了锁，我们在此时执行删除操作，不是又不符合一致性的要求了嘛？

然后我们修改为下述方案：

<img src="https://gakkil.gitee.io/gakkil-image/redis/day14/QQ截图20190108220645.png"/>

修改后的代码为：
```
  public void unRedisLock(Jedis jedis, String lockKey, String identifierValue) {
    try {
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
        Long result = (Long) jedis.eval(script, Collections.singletonList(lockKey), Collections.singletonList(identifierValue));
        //0释放锁失败。1释放成功
        if (1 == result) {
            //如果你想返回删除成功还是失败，可以在这里返回
            System.out.println(result+"释放锁成功");
        } 
        if (0 == result){
            System.out.println(result+"释放锁失败");
        }
    } catch (Exception e){
        e.printStackTrace();
    }
 }
```

实现思路：

我们将 **Lua代码** 传到 **jedis.eval()** 方法里，并使参数KEYS[1]赋值为lockKey，ARGV[1]赋值为identifierValue。eval()方法是将Lua代码交给Redis服务端执行。

那么这段Lua代码的功能是什么呢？其实很简单，首先获取锁对应的value值，检查是否与identifierValue相等，如果相等则删除锁（解锁）。那么为什么要使用Lua语言来实现呢？**因为要确保上述操作是原子性的。**

那么为什么执行eval()方法可以确保原子性？源于Redis的特性，因为Redis是单线程，在eval命令执行Lua代码的时候，Lua代码将被当成一个命令去执行，并且直到eval命令执行完成，Redis才会执行其他命令。