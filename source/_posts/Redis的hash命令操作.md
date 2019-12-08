---
title: Redis的hash命令操作
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-25 15:00:47
summary: redis中的hash操作
---

今天来学习redis中的最后一个数据结构hash结构。

redis中的hash的key-value，我一般称为field-value：域和值。主要是为了区别设置时候的key。

## hset key field value

```
设置 key 指定的哈希集中指定字段的值。

如果 key 指定的哈希集不存在，会创建一个新的哈希集并与 key 关联。

如果字段在哈希集中存在，它将被重写。

返回值
integer-reply：含义如下

1如果field是一个新的字段
0如果field原来在map里面已经存在

redis> HSET myhash field1 "Hello"
(integer) 1
redis> HGET myhash field1
"Hello"
redis> 
```

## hsetnx key field value

```
只在 key 指定的哈希集中不存在指定的字段时，设置字段的值。
如果 key 指定的哈希集不存在，会创建一个新的哈希集并与 key 关联。
如果字段已存在，该操作无效果。

redis> HSETNX myhash field "Hello"
(integer) 1
redis> HSETNX myhash field "World"
(integer) 0
redis> HGET myhash field
"Hello"
redis> 
```

## hmset key field value [field value ...]

```
hset：只能为key设置一组field-value，不能设置多组。
hmset：能够设置多组field-value。

设置 key 指定的哈希集中指定字段的值。
该命令将重写所有在哈希集中存在的字段。
如果 key 指定的哈希集不存在，会创建一个新的哈希集并与 key 关联。

redis> HMSET myhash field1 "Hello" field2 "World"
OK
redis> HGET myhash field1
"Hello"
redis> HGET myhash field2
"World"
redis>
```

## hget key field

```
返回 key 指定的哈希集中该字段所关联的值。

redis> HSET myhash field1 "foo"
(integer) 1
redis> HGET myhash field1
"foo"
redis> HGET myhash field2
(nil)
redis>
```

## hmget key field [field ...]

```
返回 key 指定的哈希集中指定字段的值。
对于哈希集中不存在的每个字段，返回 nil 值。
因为不存在的keys被认为是一个空的哈希集，对一个不存在的 key 执行 HMGET 将返回一个只含有 nil 值的列表。

redis> HSET myhash field1 "Hello"
(integer) 1
redis> HSET myhash field2 "World"
(integer) 1
redis> HMGET myhash field1 field2 nofield
1) "Hello"
2) "World"
3) (nil)
redis> 
```

## hgetall key

```
返回 key 指定的哈希集中所有的字段和值。
返回值中，每个字段名的下一个是它的值，所以返回值的长度是哈希集大小的两倍。

redis> HSET myhash field1 "Hello"
(integer) 1
redis> HSET myhash field2 "World"
(integer) 1
redis> HGETALL myhash
1) "field1"
2) "Hello"
3) "field2"
4) "World"
redis> 
```

## hdel key field [field ...]

```
从 key 指定的哈希集中移除指定的域。在哈希集中不存在的域将被忽略。

如果 key 指定的哈希集不存在，它将被认为是一个空的哈希集，该命令将返回0。

redis> HSET myhash field1 "foo"
(integer) 1
redis> HDEL myhash field1
(integer) 1
redis> HDEL myhash field2
(integer) 0
redis> 
```

## hexists key field

```
返回hash里面field是否存在。

integer-reply, 含义如下：

1 hash里面包含该field。
0 hash里面不包含该field或者key不存在。

redis> HSET myhash field1 "foo"
(integer) 1
redis> HEXISTS myhash field1
(integer) 1
redis> HEXISTS myhash field2
(integer) 0
redis> 
```

## hincrby key field increment

```
增加 key 指定的哈希集中指定字段的数值。
如果 key 不存在，会创建一个新的哈希集并与 key 关联。
如果字段不存在，则字段的值在该操作执行前被设置为 0。

HINCRBY 支持的值的范围限定在 64位 有符号整数。

redis> HSET myhash field 5
(integer) 1
redis> HINCRBY myhash field 1
(integer) 6
redis> HINCRBY myhash field -1
(integer) 5
redis> HINCRBY myhash field -10
(integer) -5
redis> 
```

## hincrbyfloat key field increment

```
为指定key的hash的field字段值执行float类型的increment加。
如果field不存在，则在执行该操作前设置为0.如果出现下列情况之一，则返回错误：

field的值包含的类型错误(不是字符串)。
当前field或者increment不能解析为一个float类型。

redis> HSET mykey field 10.50
(integer) 1
redis> HINCRBYFLOAT mykey field 0.1
"10.6"
redis> HSET mykey field 5.0e3
(integer) 1
redis> HINCRBYFLOAT mykey field 2.0e2
"5200"
redis> 
```

## hlen key

```
返回 key 指定的哈希集包含的字段的数量。

redis> HSET myhash field1 "Hello"
(integer) 1
redis> HSET myhash field2 "World"
(integer) 1
redis> HLEN myhash
(integer) 2
redis>
```

## hstrlen key field

```
返回hash指定field的value的字符串长度，如果hash或者field不存在，返回0。

redis> HMSET myhash f1 HelloWorld f2 99 f3 -256
OK
redis> HSTRLEN myhash f1
(integer) 10
redis> HSTRLEN myhash f2
(integer) 2
redis> HSTRLEN myhash f3
(integer) 4
redis>
```

---

## hkeys key

```
返回 key 指定的哈希集中所有字段的名字。

redis> HSET myhash field1 "Hello"
(integer) 1
redis> HSET myhash field2 "World"
(integer) 1
redis> HKEYS myhash
1) "field1"
2) "field2"
redis> 
```

## hvals key

```
返回 key 指定的哈希集中所有字段的值。

redis> HSET myhash field1 "Hello"
(integer) 1
redis> HSET myhash field2 "World"
(integer) 1
redis> HVALS myhash
1) "Hello"
2) "World"
redis> 
```