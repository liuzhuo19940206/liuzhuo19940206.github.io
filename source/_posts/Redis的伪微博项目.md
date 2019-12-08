---
title: Redis的伪微博项目
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2019-01-04 21:10:05
summary: 使用redis来设计与实现一个伪微博项目
---

之前的篇章，介绍了redis中的大多数用法，今天使用redis来设计与实现一个伪微博项目。

具体使用什么客户端语言（java、python等），这里就不详细写了，主要是讲解该项目怎么使用redis这个key-value数据库来设计。

我一直觉得，一个程序猿，思想很重要，语言只是一种工具！！！

## 微博项目的key设计

### 全局key的设计

```
-----------------------------------------------------------
表名                  global
列名                  操作                  备注
global:userid         incr                 产生全局的userid
global:postid         incr                 产生全局的postid
-----------------------------------------------------------

说明：
在以前，我们使用mysql等关系型数据库时，一般会使用数据库自带的自增主键，
在redis中，我们可以设置一个全局的key，然后通过incr指令来实现mysql中的自增主键。

userid：代表用户的id
postid：代表微博的id
```

### 用户相关的key的设计
```
用户相关的表设计(mysql中)
------------------------------------------------------------------------
表名                  user
userid               username             password            authsecret
1                    test1                11111111            #Ujkdjf#o4&
2                    test2                22222222            zzuWNM#$jkf
···                  ···                  ···                 ···
------------------------------------------------------------------------

在redis中,变成以下几个key
-----------------------------------------------------------------------------------------------------
key的前缀             user
user:userid:*        user:userid:*:username      user:userid:*:password      user:userid:*:authsecret
user:userid:1        user:userid:1:username      user:userid:1:password      user:userid:1:authsecret
-----------------------------------------------------------------------------------------------------

get global:userid  ====> 返回一个userid
假设返回：1
set user:userid:1:username test1
set user:userid:1:password 11111111
set user:userid:1:authsecret #Ujkdjf#o4&

说明：authsecret是为了防止，客户端修改cookie中的userid和username来切换用户的身份，为了安全性，所以设置了authsecret。
每次用户登入，都会随机设置新的authsecret值。
```

### 微博相关的key设计
```
微博相关的表设计
-------------------------------------------------------------
表名              post
postid            userid            time             content
4                 2                 13792238923      测试内容
-------------------------------------------------------------

微博在redis中, 与表设计对应的key设计
--------------------------------------------------------------------------------------------------------------------
key的前缀           post
post:postid:*       post:postid:*:userid       post:postid:*:username     post:postid:*:time   post:postid:*:content
post:postid:4       post:postid:4:userid       post:postid:4:username     post:postid:4:time   post:postid:4:content
--------------------------------------------------------------------------------------------------------------------

注意：在这里，可以看到，我们在redis中，多设置了username的属性，这是为啥？username不是存在user:userid:*:username里面嘛，这样
不是数据冗余了嘛，有时候，为了提高查询的速度，适当的增加一些冗余数据是可以的，我们使用redis，不就是因为它的执行速度快嘛。

这里，使用的是string结构来存储的，但是可以改成hash更棒哦，大家可以自己设计一个hash结构。
```

### 关注表和粉丝表的设计

在伪微博的项目中，一定会有关注者，被关注者的功能，即：你的粉丝，和你关注的人。

**关注表：**
我们使用redis中的集合结构来存储：

following:$userid --->  set

即：sadd following:1 2 3 4
表示：用户1，关注了用户id为2、3、4的用户。

**粉丝表：**
我们使用redis中的集合结构来存储：

follower:$userid ----->  set

即：sadd follower:2 6 7 8
表示：用户id为2的粉丝有：6、7、8。

### 微博推送的设计

在该项目中，一个用户发表了一条微博，那么他的粉丝应该也会收到微博的推送信息。即：在用户的首页，可以看到自己发的微博和你们关注的博主的微博。

这个功能是该项目的难点，也是最重要的部分。

**方法一：采用推送的方式**

推送表: revicepost
使用list结构：

recivepost:$userid   ----> list(3,4,7)

即当一个用户发布一条微博的时候，他会自己主动的向他的粉丝发送该条微博。

即：lpush recivepost:$userid   ----> list(3,4,7)
表示的是，当前博主发送了多条微博的话，会向redis数据库中，recivepost列表中加入发布的微博的id。
使用一个for循环，向自己的粉丝，调用:lpush recivepost:$userid  $postid。$userid：粉丝的id，postid：自己发布的微博的id。

然后，在其中一个粉丝登入之后，点击首页的时候，获取到recivepost中的所有微博id，再通过post来获取微博的信息。

**方法二：采用拉取的方式**

推送的方式，有一个致命的缺点，那就是当一个粉丝有可能会很久不登入微博来了，那么那些博主自己主动推的意义也不大，会浪费内存，因为该粉丝短时间不登入微博。某一天，粉丝突然登入微博的话，会接受到大量的博主的推送信息，会造成大量的数据发送，而且该粉丝只想看到最近的博主发送的微博，这个方式会发送所有的微博，意义不大。

采用拉取方式，是粉丝登入后，自己主动拉取博主的微博信息，不是被动的接受信息，而且，我们可以设置只拉取关注的每个博主的最近的20条数据，不需要很久之前的微博信息。

该怎么实现呢？这是一个难点。

拉取表
pull:$userid:  -----> list(3,4,7)

问: 上次我拉取了 A -> 5,6,7, 三条微博, 下次刷新首页 , 需要从postid大于7的微博开始拉取。
解决: 拉取时, 设定一个lastpull时间点, 下次拉取时, 取>lastpull的微博


问: 有很多关注人,如何取?
解决: 循环自己的关注列表 , 逐个取他们的新微博

问:  取出来之后放在哪儿?
答:  pull:$userid的链接里面


问: 如果个人中心 , 只有前1000条
答: ltrim,只取前1000条

问: 如果我关注 A,B两人, 从2人中,各取3条最新信息, 这3+3条信息, 从时间上,是交错的, 如何按时间排序?
答: 我们发布时, 是发布的hash结构 , 不能按时间来排序.

解决: 同步时, 取微博后, 记录本次取的微博的最大id,下次同步时, 只取比最大id更大的微博。

---

思路：
（1）当博主发送微博后，会pull:$userid $postid。 $userid：博主的userid，博主发送的postid。因为postid的自增的，所以postid越大表示该微博是最近发布的，这样就可以根据postid的大小来决定获取最近的1000条数据了。

（2）当粉丝登入到首页后，使用for循环来获取到博主的userid，然后通过userid来获取到每个博主发送的postid，该postid > lastpull (lastpull初始化为0，后来就赋值为上次访问后的最大的postid)

（3）然后将第二步获取到的所有postid，取其中的最近的1000条数据。

### 将redis中的数据写入到mysql中

前面的操作，都是在redis中操作的，现在，我们需要将每个用户的不经常访问的微博放到mysql中，redis中只保存最新的1000条数据即可。

思路：

每个用户发微博的时候，将自己的微博构新建成一个链表，然后还有添加一个全局的链表

即：mypost:userid:* -----> postid  和 global:storge -----> postid

当mypost:userid中的postid的数量，大于1000后，就将mypost链表最后的一条postid，插入到global:storge的最左端。

当global:storge中的postid的数量大于1000后，一致性将global:storge中的最右端的1000条数据，批量插入到mysql中。

示意图如下：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day13/QQ截图20190105112749.png"/>