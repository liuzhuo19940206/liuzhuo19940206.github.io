---
title: Redis的String命令操作
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-22 14:08:06
summary: Redis中的字符串类型操作
---

今天来学习Redis中的字符串类型操作

Redis字符串类型的操作

## set命令

```
set key value [ex 秒数] / [px 毫秒数]  [nx不存在] /[xx存在]

如: set a 1 ex 10    , 10秒有效
    set a 1 px 9000  , 9秒有效

注: 如果ex,px同时写 ,以后面的有效期为准
如 set a 1 ex 100 px 9000 , 实际有效期是9000毫秒

nx: 表示key不存在时,执行操作
xx: 表示key存在时,执行操作

=====================================

127.0.0.1:6379> set a 1 ex 10
OK
127.0.0.1:6379> ttl a
(integer) 8
127.0.0.1:6379> ttl a
(integer) 7
127.0.0.1:6379> ttl a
(integer) 6
127.0.0.1:6379> ttl a
(integer) 1
127.0.0.1:6379> ttl a
(integer) 0
127.0.0.1:6379> ttl a
(integer) -2

不能同时设置 ex 和 px
127.0.0.1:6379> set a 1 ex 4 px 9000
(error) ERR syntax error

127.0.0.1:6379> set a 1 px 8000
OK
127.0.0.1:6379> ttl a
(integer) 6
127.0.0.1:6379> ttl a
(integer) 5
127.0.0.1:6379> pttl a
(integer) 2176
127.0.0.1:6379> pttl a
(integer) 960
127.0.0.1:6379> pttl a
(integer) -2

=====================================

127.0.0.1:6379> get a
"1"
127.0.0.1:6379> set a 2 nx
(nil)
127.0.0.1:6379> set a 2 xx
OK
127.0.0.1:6379> get a
"2"

当a存在时，使用nx不会修改a的值，必须使用xx才能修改存在的值。

=====================================

set key value [默认是当key不存在时，创建key，key存在时，修改key的value值]
```

## setex key seconds value

```
设置key的value的同时，并设置过期的时间，单位是秒

等价于
set mykey value
expire mykey seconds

=====================================

redis> SETEX mykey 10 "Hello"
"OK"
redis> TTL mykey
(integer) 10
redis> GET mykey
"Hello"
redis> 
```

## psetex key milliseconds value

```
作用：设置key的同时，设置key的过期时间，单位是毫秒

redis> PSETEX mykey 1000 "Hello"
"OK"
redis> PTTL mykey
(integer) 999
redis> GET mykey
"Hello"
redis> 
```

## setnx key value

```
返回：

key不存时，设置成功，返回1
key存在时，设置失败，返回0

redis> SETNX mykey "Hello"
(integer) 1
redis> SETNX mykey "World"
(integer) 0
redis> GET mykey
"Hello"
redis> 

```

## setrange key offset value

```
作用:把字符串的offset偏移字节,改成value

redis 127.0.0.1:6379> set greet hello
OK
redis 127.0.0.1:6379> setrange greet 2 x
(integer) 5
redis 127.0.0.1:6379> get greet
"hexlo"

注意: 如果偏移量>字符长度, 该字符自动补0x00

redis 127.0.0.1:6379> setrange greet 6 !
(integer) 7
redis 127.0.0.1:6379> get greet
"hexlo\x00!"

```

## strlen key

```
作用：返回key的value值的长度

redis> SET mykey "Hello world"
"OK"
redis> STRLEN mykey
(integer) 11
redis> STRLEN nonexisting
(integer) 0
redis> 

返回的是value值的长度，从1开始计数，不存在的key，返回0。
```

---

## get key

```
作用：返回key的value值

redis> GET nonexisting
(nil)
redis> SET mykey "Hello"
"OK"
redis> GET mykey
"Hello"
redis>

```
## get key start end

```
作用：返回key的起始与结束之间的value值，包括start与end。
序号是从0开始计算的！！！
末尾的序号是-1.

redis> SET mykey "This is a string"
"OK"
redis> GETRANGE mykey 0 3
"This"
redis> GETRANGE mykey -3 -1
"ing"
redis> GETRANGE mykey 0 -1
"This is a string"
redis> GETRANGE mykey 10 100
"string"
redis>

注意: 
1: start >= length , 则返回空字符串
2: end >= length , 则截取至字符串的结尾
3: 如果start 所处位置在 end 右边, 返回空字符串

```

## getset key value

```
作用：返回上次的旧值，并设置新的value值

redis> SET mykey "Hello"
"OK"
redis> GETSET mykey "World"
"Hello"
redis> GET mykey
"World"
redis> 
```

## append key value

```
作用：当key存在时，在value后面追加新的value值。当key不存在时，就相当于set，创建一个新的value

redis> EXISTS mykey
(integer) 0
redis> APPEND mykey "Hello"
(integer) 5
redis> APPEND mykey " World"
(integer) 11
redis> GET mykey
"Hello World"
redis> 
```

---

## incr key

```
作用：将key的value值，增加1，前提是key的value值是数字型的字符串

redis> SET mykey "10"
"OK"
redis> INCR mykey
(integer) 11
redis> GET mykey
"11"
redis>

如果key不存在，incr key，会将key的value赋值为1.
这里fff本身不存在。

127.0.0.1:6379> incr fff
(integer) 1
127.0.0.1:6379> get fff
"1

如果key的value值不是数字型的字符串，就会报错！！！
127.0.0.1:6379> set lll fdfdf
OK
127.0.0.1:6379> get lll
"fdfdf"
127.0.0.1:6379> incr lll
(error) ERR value is not an integer or out of range
127.0.0.1:6379>

注意:
1:不存在的key当成0,再incr操作
2: 范围为64有符号
```

## incrby key number

```
incr key：是将key的value值加1。
incrby key number：是将key的value值加number。

redis> SET mykey "10"
"OK"
redis> INCRBY mykey 5
(integer) 15
redis> 
```

## incrbyfloat key floatnumber

```
incrbyfloat key floatnumber:可以加浮点数

127.0.0.1:6379> set num 5
OK
127.0.0.1:6379> incr num
(integer) 6
127.0.0.1:6379> get num
"6"
127.0.0.1:6379> incrbyfloat num 5.5
"11.5"
127.0.0.1:6379> get num
"11.5"

=====================================

redis> SET mykey 10.50
"OK"
redis> INCRBYFLOAT mykey 0.1
"10.6"
redis> INCRBYFLOAT mykey -5
"5.6"
redis> SET mykey 5.0e3
"OK"
redis> INCRBYFLOAT mykey 2.0e2
"5200"
redis>
```

## decr key

```
作用：将key的value值减一。

redis> SET mykey "10"
"OK"
redis> DECR mykey
(integer) 9
redis> SET mykey "234293482390480948029348230948"
"OK"
redis> DECR mykey
ERR ERR value is not an integer or out of range
redis> 

==============================================

127.0.0.1:6379> exists number
(integer) 0
127.0.0.1:6379> decr number
(integer) -1
127.0.0.1:6379> get number
"-1"
127.0.0.1:6379> 


注意：范围是有符号64位。当key不存在时，derc就是先创建key的value值为0，然后减一为-1。

```

## decrby key decrement

```
作用：将key的value值，减decrement。

redis> SET mykey "10"
"OK"
redis> DECRBY mykey 3
(integer) 7
redis> 
```

## mset key value [key value ...]

```
作用：一次性设置多个key、value值

redis> MSET key1 "Hello" key2 "World"
"OK"
redis> GET key1
"Hello"
redis> GET key2
"World"
redis> 
```

## mget key [key ...]

```
作用：一次性获取多个key的value值

redis> SET key1 "Hello"
"OK"
redis> SET key2 "World"
"OK"
redis> MGET key1 key2 nonexisting
1) "Hello"
2) "World"
3) (nil)
redis> 
```

## msetnx key value [key value ...]

```
作用：一次性设置多个不存在的key的value值，如果有一个key存在就返回0，失败！

127.0.0.1:6379> msetnx a 1 b 2
(integer) 1
127.0.0.1:6379> mget a b
1) "1"
2) "2"
127.0.0.1:6379> msetnx b 3 c 4
(integer) 0
127.0.0.1:6379> mget a b c
1) "1"
2) "2"
3) (nil)
127.0.0.1:6379> 
```

---

## setbit key offset value

```
作用：将key的value中的偏移多少位上的bit值设置为1或0。

A: 0100 0001  65
a：0110 0001  97

偏移量是从0开始。

只需要将A的第二位设置为1，就能将大写的A，变成小写的a

127.0.0.1:6379> set char A
OK
127.0.0.1:6379> get char
"A"
127.0.0.1:6379> setbit char 2 1
(integer) 0
127.0.0.1:6379> get char
"a"
127.0.0.1:6379>

注意: 
1:如果offset过大,则会在中间填充0,
2: offset最大大到多少
3:offset最大2^32-1,可推出最大的的字符串为512M

```

## getbit key offset

```
作用:获取值的二进制表示,对应位上的值(从左,从0编号)

127.0.0.1:6379> set char A
OK
127.0.0.1:6379> get char
"A"
127.0.0.1:6379> getbit char 0
(integer) 0
127.0.0.1:6379> getbit char 1
(integer) 1
127.0.0.1:6379> getbit char 2
(integer) 0
127.0.0.1:6379> getbit char 7
(integer) 1
127.0.0.1:6379> 

```

## bitop operation destkey key1 [key2 ...]

```
对 key1 , key2 ... keyN 作 operation , 并将结果保存到 destkey 上。
operation 可以是 AND 、 OR 、 NOT 、 XOR

redis 127.0.0.1:6379> setbit lower 2 1
(integer) 0

redis 127.0.0.1:6379> set char Q
OK
redis 127.0.0.1:6379> get char
"Q"
redis 127.0.0.1:6379> bitop or char char lower
(integer) 1
redis 127.0.0.1:6379> get char
"q"

注意: 对于NOT操作, key不能多个

```