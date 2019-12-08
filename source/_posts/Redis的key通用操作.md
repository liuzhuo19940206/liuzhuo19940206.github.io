---
title: Redis的key通用操作
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-22 11:39:13
summary: redis的通用操作命名。
---

今天来学习redis的通用操作命名。

## keys pattern 查询相应的key

```
在redis里,允许模糊查询key
有3个通配符 *, ? ,[]
*: 通配任意多个字符 (包括0个)
?: 通配单个字符（不包括0个）
[]: 通配括号内的某1个字符

```

启动redis服务器：

`./bin/redis-server redis.conf`

如果不加后面的配置文件redis.conf,就会找默认的配置文件了。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day02/QQ截图20181222115002.png"/>

启动redis的客户端：

`./bin/redis-cli`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day02/QQ截图20181222115132.png"/>

使用：keys *（查看当前数据库中的所有key）
<img src="https://gakkil.gitee.io/gakkil-image/redis/day02/QQ截图20181222115320.png"/>

使用正则表达式：
```
127.0.0.1:6379> KEYS *
1) "age"
2) "name"
127.0.0.1:6379> set agg 20
OK
127.0.0.1:6379> get agg
"20"
127.0.0.1:6379> keys *
1) "age"
2) "name"
3) "agg"

现在，目前有三个key了。

127.0.0.1:6379> keys age*
1) "age"

说明*能匹配0个字符
 
127.0.0.1:6379> keys ag*   
1) "age"
2) "agg"

说明*能匹配一个字符

127.0.0.1:6379> set aggg 25
OK
127.0.0.1:6379> get aggg 
"25"
127.0.0.1:6379> keys ag*
1) "age"
2) "aggg"
3) "agg"

说明能*能匹配多个字符

=====================================

127.0.0.1:6379> keys age?
(empty list or set)

说明？不能匹配0个字符！！！

127.0.0.1:6379> keys ag?
1) "age"
2) "agg"
127.0.0.1:6379> 

说明？只能匹配一个字符

=====================================

127.0.0.1:6379> keys ag[gjer]
1) "age"
2) "agg"

[]:只能匹配[]中的一个字符

127.0.0.1:6379> keys *
1) "age"
2) "name"
3) "aggg"
4) "agg"
127.0.0.1:6379> keys ag[aekgllgg]
1) "age"
2) "agg"

[]中有两个gg，但是还是只能匹配一个g。

127.0.0.1:6379> keys ag[a-h]
1) "age"
2) "agg"

[a-h]:匹配a到h之间的一个字符

```

## randomkey 返回随机key

```
127.0.0.1:6379> randomkey
"name"
127.0.0.1:6379> randomkey
"agg"
127.0.0.1:6379> randomkey
"age"
127.0.0.1:6379> randomkey
"aggg"
127.0.0.1:6379> randomkey
"name"

```

## exists key [判断key是否存在]

```
127.0.0.1:6379> exists name
(integer) 1
127.0.0.1:6379> exists nafdjkfjd
(integer) 0
127.0.0.1:6379> exists age name
(integer) 2
127.0.0.1:6379> exists age narefdf
(integer) 1

存在返回1，不存在返0，也可以测试多个key，存在几个key的话，就返回数字几。
```

## type key [测试key的类型]

```
返回key存储的值的类型
有string , link , set , order set , hash

127.0.0.1:6379> type name
string

127.0.0.1:6379> type age
string

```

## del key [key,···] 删除key

```
del key ：删除一个key
del key1 key2 ···:删除多个key


127.0.0.1:6379> del aggg
(integer) 1
127.0.0.1:6379> del aggg
(integer) 0

删除成功，返回1；删除失败，返回0.

===========================================

127.0.0.1:6379> set a 1
OK
127.0.0.1:6379> set b 2
OK
127.0.0.1:6379> set c 3
OK
127.0.0.1:6379> keys *
1) "age"
2) "b"
3) "name"
4) "c"
5) "agg"
6) "a"

删除多个key

del a b c

127.0.0.1:6379> del a b c
(integer) 3

127.0.0.1:6379> del a b c
(integer) 0

如果要删除的多个key中，有不存在的key的话，就不会删除这个key。删除几个可以成功，就会返回数字几。

如果 a b 键存在，c不存在，那么就返回2。

127.0.0.1:6379> del a b c
(integer) 2

```

## rename key newkey [修改key的名字]

```
127.0.0.1:6379> keys *
1) "age"
2) "name"
3) "agg"
127.0.0.1:6379> 
127.0.0.1:6379> rename agg jidan
OK
127.0.0.1:6379> keys *
1) "age"
2) "jidan"
3) "name"

127.0.0.1:6379> rename zzz fdfdf
(error) ERR no such key

修改名字成功，返回ok。修改失败，返回：(error) ERR no such key

注意：如果新给的名字存在的话，那么会把已经存在的key的值给覆盖。

例如：如果 a 和 b 都存在的话，rename a b 的话，b里面的值就是a里面的值了。

127.0.0.1:6379> get a
"1"
127.0.0.1:6379> get b
"2"
127.0.0.1:6379> 
127.0.0.1:6379> rename a b
OK
127.0.0.1:6379> get a
(nil)
127.0.0.1:6379> get b
"1"

此时，a不存在了，b里面存在的是a以前的值。
```

## renamenx key newkey [newkey存在的话，不覆盖]

```
renamenx 与 rename 的作用是一样的。

只是当newkey本身已经存在的话，是不会修改成功的。

127.0.0.1:6379> get a
"1"
127.0.0.1:6379> get b
"2"

127.0.0.1:6379> renamenx a b
(integer) 0
127.0.0.1:6379> get a
"1"
127.0.0.1:6379> get b
"2"

b已经存在了，所以不会修改名字成功。

127.0.0.1:6379> get c
(nil)

127.0.0.1:6379> renamenx a c
(integer) 1
127.0.0.1:6379> get a
(nil)
127.0.0.1:6379> get c
"1"

c不存在，所以修改a的名字为c成功。
```

## move key db [移动key到指定的数据库中]

```
前提知识点：redis默认会创建16个数据库。编号是：0~15.

默认打开的是编号为0的数据库。

```
打开redis.conf配置文件：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day02/QQ截图20181222132858.png"/>

```
127.0.0.1:6379> keys *
1) "b"
2) "age"
3) "jidan"
4) "name"
5) "c"

现在将 c 这个key 移动到数据库编号为1的数据中。

move c 1

127.0.0.1:6379> move c 1
(integer) 1
127.0.0.1:6379> get c
(nil)

切换到编号为1的数据库中：

select 1

127.0.0.1:6379> select 1
OK

127.0.0.1:6379[1]> get c
"1"

切换成功后，在端口号后面有一个数字：[1]。
```

**注意：**( 一个redis进程,打开了不止一个数据库, 默认打开16个数据库,从0到15编号, 如果想打开更多数据库,可以从配置文件修改)

## ttl key [查看key的过期时间]

```
ttl:返回的是key过期时间的单位是秒。

127.0.0.1:6379> keys *
1) "b"
2) "age"
3) "jidan"
4) "name"

127.0.0.1:6379> ttl name
(integer) -1

注意：如果key存在的话，-1：代表的是没有过期时间，即永久存在；如果key不存在的话，也会返回-1。所以-1会有歧义！！！
Redis2.8中,对于不存在的key,返回-2。
```

## pttl key

```
pttl 与 ttl一样，都是返回一个key的过期时间，只是单位是毫秒。


```

## expire key 整型值[设置key的过期时间]

```
作用: 设置key的生命周期,以秒为单位

127.0.0.1:6379> expire name 5
(integer) 1
127.0.0.1:6379> get name
"zhangsan"
127.0.0.1:6379> get name
(nil)

设置name的这个key的过期时间是：5秒。5秒过后就会删除name这个key。
```

## pexpire key 毫秒数

```
作用: 设置key的生命周期,以毫秒为单位

127.0.0.1:6379> pexpire age 9000
(integer) 1
127.0.0.1:6379> ttl age
(integer) 6
127.0.0.1:6379> ttl age
(integer) 5
127.0.0.1:6379> ttl age
(integer) 4
127.0.0.1:6379> ttl age
(integer) 3
127.0.0.1:6379> ttl age
(integer) 1
127.0.0.1:6379> ttl age
(integer) -2

设置age的过期时间为：9000毫秒。

```

## persist key[设置key为永久存在]

```
作用: 把指定key置为永久有效

127.0.0.1:6379> expire b 10
(integer) 1
127.0.0.1:6379> ttl b
(integer) 8
127.0.0.1:6379> ttl b
(integer) 6
127.0.0.1:6379> ttl b
(integer) 5
127.0.0.1:6379> ttl b
(integer) 4
127.0.0.1:6379> ttl b
(integer) 3
127.0.0.1:6379> persist b
(integer) 1
127.0.0.1:6379> ttl b
(integer) -1

设置b这个key的过期时间为：10秒，当b这个key快要过期的时候，将其设置为永久有效。

```

还有更多的通用keys的操作，如看redis的官网：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day02/QQ截图20181222134910.png"/>

在图中，可以看到还有：expire**at** key timestamp [设置key的在哪个时间戳过期]、pexpire**at** key milliseconds-timestamp

```
redis> SET mykey "Hello"
"OK"
redis> EXISTS mykey
(integer) 1
redis> EXPIREAT mykey 1293840000
(integer) 1
redis> EXISTS mykey
(integer) 0
redis>

======================================

redis> SET mykey "Hello"
"OK"
redis> PEXPIREAT mykey 1555555555005
(integer) 1
redis> TTL mykey
(integer) 10097634
redis> PTTL mykey
(integer) 10097633581
redis> 
```