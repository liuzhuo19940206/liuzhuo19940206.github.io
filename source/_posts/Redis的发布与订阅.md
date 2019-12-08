---
title: Redis的发布与订阅
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-30 21:09:18
summary: redis中的发布与订阅
---

这篇介绍redis中的发布与订阅的简单操作。

## 命令介绍

### subscribe

```
subscribe channel [channel ...]
订阅给指定频道的信息。

一旦客户端进入订阅状态，客户端就只可接受订阅相关的命令。
如SUBSCRIBE、PSUBSCRIBE、UNSUBSCRIBE和PUNSUBSCRIBE命令，除了这些命令，其他命令一律失效。

```

### publish
```
publish channel message
将信息 message 发送到指定的频道 channel

返回值
收到消息的客户端数量。
```

### unsubscribe
```
unsubscribe channel [channel ...]
指示客户端退订给定的频道，若没有指定频道，则退订所有频道.

如果没有频道被指定，即，一个无参数的 unsubscribe 调用被执行，
那么客户端会将使用 SUBSCRIBE 命令订阅的所有频道都会被退订。
在这种情况下，命令会返回一个信息，告知客户端所有被退订的频道。
```

### psubscribe
```
psubscribe channel [channel ...]
订阅给定的模式(patterns)。

支持的模式(patterns)有:

h?llo subscribes to hello, hallo and hxllo
h*llo subscribes to hllo and heeeello
h[ae]llo subscribes to hello and hallo, but not hillo
如果想输入普通的字符，可以在前面添加\
```

## 演示案例

1）开启两个redis客户端

<img src="https://gakkil.gitee.io/gakkil-image/redis/day05/QQ截图20181231100525.png"/>

2）第一个客户端订阅频道news
<img src="https://gakkil.gitee.io/gakkil-image/redis/day05/QQ截图20181231100701.png"/>

3）第二个客户端向news频道发布消息
<img src="https://gakkil.gitee.io/gakkil-image/redis/day05/QQ截图20181231100910.png"/>

4）再开启一个客户端，也订阅news频道
<img src="https://gakkil.gitee.io/gakkil-image/redis/day05/QQ截图20181231101121.png"/>

5）向news频道发送消息
<img src="https://gakkil.gitee.io/gakkil-image/redis/day05/QQ截图20181231101438.png"/>