---
title: Redis的set命令操作
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-23 10:35:28
summary: redis中的集合操作命令。
---

今天来学习redis中的集合操作命令。

集合的性质: 唯一性,无序性,确定性

注: 在string 和 list的命令中,可以通过 range 来访问 string 中的某几个字符或某几个元素

但,因为集合的无序性,无法通过下标或范围来访问部分元素.


## sadd key member [member ...]

```
作用: 往集合key中增加元素。

Redis Sadd 命令将一个或多个成员元素加入到集合中，已经存在于集合的成员元素将被忽略。

假如集合 key 不存在，则创建一个只包含添加的元素作成员的集合。

当集合 key 不是集合类型时，返回一个错误。

注意：在Redis2.4版本以前， SADD 只接受单个成员值。

redis> SADD myset "Hello"
(integer) 1
redis> SADD myset "World"
(integer) 1
redis> SADD myset "World"
(integer) 0
redis> SMEMBERS myset
1) "World"
2) "Hello"
redis> 
```

## smembers key

```
Redis Smembers 命令返回集合中的所有的成员。 不存在的集合 key 被视为空集合。

redis 127.0.0.1:6379> SADD myset1 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "world"
(integer) 1
redis 127.0.0.1:6379> SMEMBERS myset1
1) "World"
2) "Hello"
```

## srem value [value...]

```
作用: 删除集合中集为 value1 value2的元素
返回值: 忽略不存在的元素后,真正删除掉的元素的个数

127.0.0.1:6379> sadd gender male famale yao
(integer) 3
127.0.0.1:6379> 
127.0.0.1:6379> smembers gender
1) "yao"
2) "famale"
3) "male"
127.0.0.1:6379> srem gender yao
(integer) 1
127.0.0.1:6379> smembers gender
1) "famale"
2) "male"

```

## spop key

```
作用: 返回并删除集合中key中1个随机元素.
随机--体现了无序性.

redis 127.0.0.1:6379> SADD myset1 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "world"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "bar"
(integer) 1
redis 127.0.0.1:6379> SPOP myset1
"bar"
redis 127.0.0.1:6379> SMEMBERS myset1
1) "Hello"
2) "world"

不是删除第一个或最后一个插入集合的元素，而是随机删除的！！！
```

## srandmember key

```
作用: 返回集合key中,随机的1个元素。
只是返回，不删除！！！

127.0.0.1:6379> srandmember gender
"famale"
127.0.0.1:6379> srandmember gender
"famale"
127.0.0.1:6379> srandmember gender
"famale"
127.0.0.1:6379> srandmember gender
"famale"
127.0.0.1:6379> srandmember gender
"male"

这里不是说famale的概率大啊，是随机的，只是测试次数少，所以看起来好像famale的概率大。
```

## sismember key value

```
作用: 判断value是否在key集合中
是返回1,否返回0

redis 127.0.0.1:6379> SADD myset1 "hello"
(integer) 1
redis 127.0.0.1:6379> SISMEMBER myset1 "hello"
(integer) 1
redis 127.0.0.1:6379> SISMEMBER myset1 "world"
(integer) 0
```

## scard key

```
作用: 返回集合中元素的个数

redis 127.0.0.1:6379> SADD myset "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset "foo"
(integer) 1
redis 127.0.0.1:6379> SADD myset "hello"
(integer) 0
redis 127.0.0.1:6379> SCARD myset
(integer) 2
```

## smove source dest member

```
作用:把source中的 member 删除 , 并添加到dest集合中。

SMOVE 是原子性操作。

如果 source 集合不存在或不包含指定的 member 元素，则 SMOVE 命令不执行任何操作，仅返回 0 。

否则， member 元素从 source 集合中被移除，并添加到 dest 集合中去。

当 dest 集合已经包含 member 元素时， SMOVE 命令只是简单地将 source 集合中的 member 元素删除。

当 source 或 dest 不是集合类型时，返回一个错误。

redis 127.0.0.1:6379> SADD myset1 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "world"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "bar"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "foo"
(integer) 1
redis 127.0.0.1:6379> SMOVE myset1 myset2 "bar"
(integer) 1
redis 127.0.0.1:6379> SMEMBERS myset1
1) "World"
2) "Hello"
redis 127.0.0.1:6379> SMEMBERS myset2
1) "foo"
2) "bar"
```

## sinter  key [key ...]

```
Redis Sinter 命令返回给定所有给定集合的交集。 不存在的集合 key 被视为空集。 

当给定集合当中有一个空集时，结果也为空集(根据集合运算定律)。

redis 127.0.0.1:6379> SADD myset "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset "foo"
(integer) 1
redis 127.0.0.1:6379> SADD myset "bar"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "world"
(integer) 1
redis 127.0.0.1:6379> SINTER myset myset2
1) "hello"
```

## sinterstore destination key [key ...]

```
Redis Sinterstore 命令将给定集合之间的交集存储在指定的集合中。如果指定的集合已经存在，则将其覆盖。

redis 127.0.0.1:6379> SADD myset1 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "foo"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "bar"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "world"
(integer) 1
redis 127.0.0.1:6379> SINTERSTORE myset myset1 myset2
(integer) 1
redis 127.0.0.1:6379> SMEMBERS myset
1) "hello"
```

## sunion key [key ...]

```
Redis Sunion 命令返回给定集合的并集。不存在的集合 key 被视为空集。

redis 127.0.0.1:6379> SADD myset1 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "world"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "bar"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "foo"
(integer) 1
redis 127.0.0.1:6379> SUNION myset1 myset2
1) "bar"
2) "world"
3) "hello"
4) "foo"
```

## sunionstore destination key [key ...]

```
Redis Sunionstore 命令将给定集合的并集存储在指定的集合 destination 中。

redis 127.0.0.1:6379> SADD myset1 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "world"
(integer) 1
redis 127.0.0.1:6379> SADD myset1 "bar"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "foo"
(integer) 1
redis 127.0.0.1:6379> SUNIONSTORE myset myset1 myset2
(integer) 1
redis 127.0.0.1:6379> SMEMBERS myset
1) "bar"
2) "world"
3) "hello"
4) "foo"
```

## sdiff key [key ...]

```
Redis Sdiff 命令返回给定集合之间的差集。不存在的集合 key 将视为空集。

redis 127.0.0.1:6379> SADD myset "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset "foo"
(integer) 1
redis 127.0.0.1:6379> SADD myset "bar"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "world"
(integer) 1
redis 127.0.0.1:6379> SDIFF myset myset2
1) "foo"
2) "bar"
```

## sdiffstore destination key [key ...]

```
Redis Sdiffstore 命令将给定集合之间的差集存储在指定的集合中。如果指定的集合 key 已存在，则会被覆盖。

redis 127.0.0.1:6379> SADD myset "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset "foo"
(integer) 1
redis 127.0.0.1:6379> SADD myset "bar"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "hello"
(integer) 1
redis 127.0.0.1:6379> SADD myset2 "world"
(integer) 1
redis 127.0.0.1:6379> SDIFFSTORE destset myset myset2
(integer) 2
redis 127.0.0.1:6379> SMEMBERS destset
1) "foo"
2) "bar"
```

