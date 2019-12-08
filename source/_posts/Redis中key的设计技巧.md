---
title: Redis中key的设计技巧
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2019-01-02 21:34:29
summary: redis中key的设计技巧
---

传统，我们都使用关系型数据库，比如mysql数据库，一般大家都熟悉了关系型数据库的表设计技巧了，这篇来讲解key-value数据库中key的设计技巧。

## redis与关系型数据库的适合场景

现在，我们来考虑一个场景需求，比如豆瓣网站中的书，每本书都有标签，比如西游记，标签：文学等。

### mysql中的设计

在mysql中，我们设计表结构如下：

书签系统设计：

```
#book表
create table book (
bookid int,         # book的id
title char(20)      # book的书名
)engine myisam charset utf8;

insert into book values 
(5 , 'PHP圣经'),
(6 , 'ruby实战'),
(7 , 'mysql运维')
(8, 'ruby服务端编程');

#书签表
create table tags (
tid int,          # 书签的id
bookid int,       # book的id
content char(20)  # 书签的内容
)engine myisam charset utf8;

insert into tags values 
(10 , 5 , 'PHP'),
(11 , 5 , 'WEB'),
(12 , 6 , 'WEB'),
(13 , 6 , 'ruby'),
(14 , 7 , 'database'),
(15 , 8 , 'ruby'),
(16 , 8 , 'server');

```

现在，我想要知道既有"WEB"标签又有"PHP"标签的书名，sql语句该怎么写呢？

```
select b.bookid , b.title from book as b,tags inner join tags as t on tags.bookid=t.bookid
where tags.content='PHP' and t.content='WEB' and b.bookid = tags.bookid;

```

大家可以看到，这是多么麻烦的操作，如果再加一个标签，还包括"ruby"标签呢？ 则 and c.content = 'ruby' 

如果数据库中的数量很大，这样的内连接查询，会很耗时的。

因此，对于这样的需求，可以使用key-value数据库。

### key-value中的设计

```
book使用string来存储
set book:5:title 'PHP圣经'
set book:6:title 'ruby实战'
set book:7:title 'mysql运难'
set book:8:title ‘ruby server’

tag使用set集合来存储
sadd tag:PHP 5
sadd tag:WEB 5 6
sadd tag:database 7
sadd tag:ruby 6 8
sadd tag:SERVER 8

```

查: 既有PHP,又有WEB的书。
```
sinter tag:PHP tag:WEB  #查集合的交集
```
查: 有PHP或有WEB标签的书.
```
sunin tag:PHP tag:WEB  #查集合的并集
```
查: 含有ruby,不含WEB标签的书.
```
sdiff tag:ruby tag:WEB #求差集
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day12/QQ截图20190102222658.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/redis/day12/QQ截图20190102222938.png"/>

我们能很轻松的实现这样的需求，速度快。

---

## redis中key的设计技巧

通过上面的演示，我们知道了，key-value数据库可以实现一些特殊的需求，怎样设计key呢？

一般，分为以下4步：

1：第1段放置表名，作为为key前缀 ，如：`user:`
2：第2段放置用于区分区key的字段--对应mysql中的主键的列名,如：`userid`
3：第3段放置主键值,如 `2,3,4...., a , b ,c`
4：第4段,写要存储的列名。如 `name,passwd,email`

完整的key：`set user:userid:1:name gakki`

---

mysql中的表：
```
user表：
----------------------------------------------------------
userid         username           password      email
1              lisi               123456        a@a.com
2              jack               987656        b@b.com
3              rose               454354        c@c.com
···            ···                ···           ···
----------------------------------------------------------
```
key-value：

```
set user:userid:1:username lisi
set user:userid:1:password 123456
set user:userid:1:email a@a.com

----------------------------------
set user:userid:2:username jack
set user:userid:2:password 987656
set user:userid:2:email b@b.com

----------------------------------
set user:userid:3:username rose
set user:userid:3:password 454354
set user:userid:3:email c@c.com

```

这样设计的好处是，通过设计的key的前缀，比如：`user:userid:1` 通过hash函数，定位到指定的redis服务器，从该服务器中获取所有的id：1的数据。

这样对于分布式存储很有用处，一般id相同的数据都存储在一个数据库中，不可能id：1的name存储在1号redis服务器，id：1的password存储在2号redis服务器中。

**注意：**

在关系型数据库中, 除主键外, 还有可能其他列也会频繁查询。
如上表中, username 也是极频繁查询的,往往这种列会通过加索引来加快查询的速度。

那么，在redis中，要查询username为lisi，该怎么呢？

不会使用：`keys user:userid:*:username lisi`

这样查询的话，redis会从userid为1开始往后依次对比username是否为lisi，这样效率当然很低了。

没有什么其他好的办法了，只能使用**冗余数据来加快username的查询**。

```
set user:username:lisi:userid 1
set user:username:jack:userid 2
set user:username:rose:userid 3
```

注意，这里，我们额外添加了冗余的数据，使用username来作为前缀了，来保存userid的值，但是只保存userid的值，其他的值，可以通过username获取的id，再通过id来获取其他的值。

比如：我想获取 jack 的 email 

首先，**get user:username:<font color="red">jack</font>:userid**     ====> `返回id：2`

然后，**get user:userid:<font color="red">2</font>:email**           ====> `返回email：b@b.com`
