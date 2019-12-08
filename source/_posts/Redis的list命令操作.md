---
title: Redis的list命令操作
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-22 19:46:56
summary: redis中的list操作
---

这篇文章来讲述redis中的list：链表的操作，学过数据结构的应该都清楚，链表的结构，这里就不详细描述了，只讲述redis中的链表操作。

## lpush key value [value ...]

```
作用: 把值插入到链接头部[从左边插入]

redis> LPUSH mylist "world"
(integer) 1
redis> LPUSH mylist "hello"
(integer) 2
redis> LRANGE mylist 0 -1
1) "hello"
2) "world"
redis> 
```

## rpush key value [value ...]

```
作用: 把值插入到链接尾部[从右边插入]

redis> RPUSH mylist "hello"
(integer) 1
redis> RPUSH mylist "world"
(integer) 2
redis> LRANGE mylist 0 -1
1) "hello"
2) "world"
redis> 
```

## lpop key

```
作用: 把链接头部的元素弹出[从左边弹出]

redis> RPUSH mylist "one"
(integer) 1
redis> RPUSH mylist "two"
(integer) 2
redis> RPUSH mylist "three"
(integer) 3
redis> LPOP mylist
"one"
redis> LRANGE mylist 0 -1
1) "two"
2) "three"
redis> 
```

## rpop key

```
作用: 把链接尾部的元素弹出[从右边弹出]

redis> RPUSH mylist "one"
(integer) 1
redis> RPUSH mylist "two"
(integer) 2
redis> RPUSH mylist "three"
(integer) 3
redis> RPOP mylist
"three"
redis> LRANGE mylist 0 -1
1) "one"
2) "two"
redis> 
```

## lrange key start  stop

```
作用: 返回链表中[start ,stop]中的元素
规律: 左数从0开始,右数从-1开始

redis> RPUSH mylist "one"
(integer) 1
redis> RPUSH mylist "two"
(integer) 2
redis> RPUSH mylist "three"
(integer) 3
redis> LRANGE mylist 0 0
1) "one"
redis> LRANGE mylist -3 2
1) "one"
2) "two"
3) "three"
redis> LRANGE mylist -100 100
1) "one"
2) "two"
3) "three"
redis> LRANGE mylist 5 10
(empty list or set)
redis> 
```

## lrem key count value

```
作用: 从key链表中删除 value值
注:   删除count的绝对值个value后结束

count>0 从表头删除等于value的值
count<0 从表尾删除等于value的值
count=0 从链表中删除所有等于value的值

127.0.0.1:6379> lrange mylist 0 -1
 1) "a"
 2) "b"
 3) "c"
 4) "a"
 5) "d"
 6) "e"
 7) "f"
 8) "e"
 9) "e"
10) "g"
127.0.0.1:6379> lrem mylist a
(error) ERR wrong number of arguments for 'lrem' command
127.0.0.1:6379> lrem mylist 0 a
(integer) 2
127.0.0.1:6379> lrange mylist 0 -1
1) "b"
2) "c"
3) "d"
4) "e"
5) "f"
6) "e"
7) "e"
8) "g"

127.0.0.1:6379> lrem mylist 1 e
(integer) 1
127.0.0.1:6379> lrange mylist 0 -1
1) "b"
2) "c"
3) "d"
4) "f"
5) "e"
6) "e"
7) "g"


127.0.0.1:6379> rpush mylist d
(integer) 8
127.0.0.1:6379> lrange mylist 0 -1
1) "b"
2) "c"
3) "d"
4) "f"
5) "e"
6) "e"
7) "g"
8) "d"
127.0.0.1:6379> lrem mylist -1 d
(integer) 1
127.0.0.1:6379> lrange mylist 0 -1
1) "b"
2) "c"
3) "d"
4) "f"
5) "e"
6) "e"
7) "g"

```

## ltrim key start stop

```
作用: 剪切key对应的链接,切[start,stop]一段,并把该段重新赋给key

redis> RPUSH mylist "one"
(integer) 1
redis> RPUSH mylist "two"
(integer) 2
redis> RPUSH mylist "three"
(integer) 3
redis> LTRIM mylist 1 -1
"OK"
redis> LRANGE mylist 0 -1
1) "two"
2) "three"
redis> 
```

## lindex key index

```
作用: 返回index索引上的值,
如  lindex key 2

redis> LPUSH mylist "World"
(integer) 1
redis> LPUSH mylist "Hello"
(integer) 2
redis> LINDEX mylist 0
"Hello"
redis> LINDEX mylist -1
"World"
redis> LINDEX mylist 3
(nil)
redis>
```
## lset key index value
```
作用：在指定的index处，修改value值。

redis> RPUSH mylist "one"
(integer) 1
redis> RPUSH mylist "two"
(integer) 2
redis> RPUSH mylist "three"
(integer) 3
redis> LSET mylist 0 "four"
"OK"
redis> LSET mylist -2 "five"
"OK"
redis> LRANGE mylist 0 -1
1) "four"
2) "five"
3) "three"
redis> 
```

## llen key

```
作用:计算链接表的元素个数

redis> LPUSH mylist "World"
(integer) 1
redis> LPUSH mylist "Hello"
(integer) 2
redis> LLEN mylist
(integer) 2
redis>
```

## linsert  key after|before search value

```
作用: 在key链表中寻找’search’ , 并在search值 之后|之前 , 插入value
注: 一旦找到一个search后,命令就结束了,因此不会插入多个value

redis> RPUSH mylist "Hello"
(integer) 1
redis> RPUSH mylist "World"
(integer) 2
redis> LINSERT mylist BEFORE "World" "There"
(integer) 3
redis> LRANGE mylist 0 -1
1) "Hello"
2) "There"
3) "World"
redis> 
```

## rpoplpush source dest

```
作用: 把source的尾部拿出,放在dest的头部,
并返回 该单元值

注意：这是一个原子操作，那么都成功，要么都失败！！！

redis> RPUSH mylist "one"
(integer) 1
redis> RPUSH mylist "two"
(integer) 2
redis> RPUSH mylist "three"
(integer) 3
redis> RPOPLPUSH mylist myotherlist
"three"
redis> LRANGE mylist 0 -1
1) "one"
2) "two"
redis> LRANGE myotherlist 0 -1
1) "three"
redis> 

==================================================

场景: task + bak 双链表完成安全队列

业务逻辑:
1:Rpoplpush task  bak
2:接收返回值, 并做业务处理
3:如果成功 , lpop bak 清除任务。 如不成功 , 下次从bak表里取任务。

```

## brpop,blpop key timeout

```
作用:等待弹出key的尾/头元素, 
Timeout为等待超时时间，单位秒
如果timeout为0,则一直等待

```

使用两个redis客户端来操作。

在一个redis客户端中弹出mylist里面的数据，但是没有数据，设置过期时间为5秒。

如果在5秒内，还没有往mylist中插入数据，那么会退出。

<img src="https://gakkil.gitee.io/gakkil-image/redis/day03/QQ截图20181222202823.png"/>

如果在规定的时间内插入了数据，就会弹出该数据。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day03/QQ截图20181222203213.png"/>

场景: 长轮询Ajax,在线聊天时,能够用到。

## brpoplpush source destination timeout

```
rpoplpush的阻塞版本。
```

---

## lpushx key value

```
作用：和lpush一样，只是当key不存在时，不会操作，而lpush当key不存在时，会创建插入数据。

redis> LPUSH mylist "World"
(integer) 1
redis> LPUSHX mylist "Hello"
(integer) 2
redis> LPUSHX myotherlist "Hello"
(integer) 0
redis> LRANGE mylist 0 -1
1) "Hello"
2) "World"
redis> LRANGE myotherlist 0 -1
(empty list or set)
redis> 
```

## rpushx key value
```
作用：和rpush一样，只是当key不存在时，不会操作，而lpush当key不存在时，会创建插入数据。

redis> RPUSH mylist "Hello"
(integer) 1
redis> RPUSHX mylist "World"
(integer) 2
redis> RPUSHX myotherlist "World"
(integer) 0
redis> LRANGE mylist 0 -1
1) "Hello"
2) "World"
redis> LRANGE myotherlist 0 -1
(empty list or set)
redis> 
```
---

## 面试题：setbit 的实际应用

场景: 1亿个用户 , 每个用户 登陆/做任意操作  , 记为 今天活跃 , 否则记为不活跃。

每周评出: 有奖活跃用户: 连续7天活动
每月评,等等...

思路: 
```
userid   dt             active
1        2013-07-27     1
1        2013-07-26     1
```
如果是放在表中, 1:表急剧增大, 2:要用group , sum运算 , 计算较慢。

用: 位图法 bit-map
```
Log0721 :  ‘011001...............0’

......
log0726 :  ‘011001...............0’
Log0727 :  ‘011000...............1’

```

1: 记录用户登陆:
每天按日期生成一个位图, 用户登陆后,把user_id位上的bit值置为1

2: 把1周的位图  and 计算, 
位上为1的,即是连续登陆的用户

```
redis 127.0.0.1:6379> setbit mon 100000000 0
(integer) 0
redis 127.0.0.1:6379> setbit mon 3 1
(integer) 0
redis 127.0.0.1:6379> setbit mon 5 1
(integer) 0
redis 127.0.0.1:6379> setbit mon 7 1
(integer) 0
redis 127.0.0.1:6379> setbit thur 100000000 0
(integer) 0
redis 127.0.0.1:6379> setbit thur 3 1
(integer) 0
redis 127.0.0.1:6379> setbit thur 5 1
(integer) 0
redis 127.0.0.1:6379> setbit thur 8 1
(integer) 0
redis 127.0.0.1:6379> setbit wen 100000000 0
(integer) 0
redis 127.0.0.1:6379> setbit wen 3 1
(integer) 0
redis 127.0.0.1:6379> setbit wen 4 1
(integer) 0
redis 127.0.0.1:6379> setbit wen 6 1
(integer) 0
redis 127.0.0.1:6379> bitop and  res mon feb wen
(integer) 12500001

```

如上例,优点:

1: 节约空间, 1亿人每天的登陆情况,用1亿bit,约1200WByte,约10M 的字符就能表示
2: 计算方便
