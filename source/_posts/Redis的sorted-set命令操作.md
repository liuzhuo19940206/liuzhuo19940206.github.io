---
title: Redis的sorted set命令操作
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-23 13:35:50
summary: redis中的有序集合,sorted set
---

redis中的有序集合：sorted set。

上一篇文章中，我们学习了redis中的集合set的相关操作，今天来学redis中的有序集合。set集合中，我们知道是无序性的，所以redis就出了一个有序的集合，方便用户操作使用。

有序集合的相关命令对比set集合，就是将s变成了z。

## zadd key [NX|XX] [CH] [INCR] score member [score member ...]

```
Redis Zadd 命令用于将一个或多个成员元素及其分数值加入到有序集当中。

如果某个成员已经是有序集的成员，那么更新这个成员的分数值，并通过重新插入这个成员元素，来保证该成员在正确的位置上。

分数值可以是整数值或双精度浮点数。

如果有序集合 key 不存在，则创建一个空的有序集并执行 ZADD 操作。

当 key 存在但不是有序集类型时，返回一个错误。

XX：仅更新已存在的元素。 永远不要添加元素
NX：不要更新现有元素。   始终添加新元素。
CH：将返回值从添加的新元素数修改为更改的元素总数（CH是已更改的缩写）。 
    更改的元素是添加的新元素和已更新分数的已存在元素。 因此，命令行中指定的元素具有与过去相同的分数，不计算在内。 
    注意：通常ZADD的返回值仅计算添加的新元素的数量。
INCR：指定此选项时，ZADD的作用类似于ZINCRBY。 在此模式下只能指定一个得分元素对。

注意： 在 Redis 2.4 版本以前， ZADD 每次只能添加一个元素。


redis 127.0.0.1:6379> ZADD myset 1 "hello"
(integer) 1
redis 127.0.0.1:6379> ZADD myset 1 "foo"
(integer) 1
redis 127.0.0.1:6379> ZADD myset 2 "world" 3 "bar"
(integer) 2
redis 127.0.0.1:6379> ZRANGE myzset 0 -1 WITHSCORES
1) "hello"
2) "1"
3) "foo"
4) "1"
5) "world"
6) "2"
7) "bar"
8) "3"
```

## zcard key

```
Redis Zcard 命令用于计算集合中元素的数量。

redis 127.0.0.1:6379> ZADD myset 1 "hello"
(integer) 1
redis 127.0.0.1:6379> ZADD myset 1 "foo"
(integer) 1
redis 127.0.0.1:6379> ZADD myset 2 "world" 3 "bar"
(integer) 2
redis 127.0.0.1:6379> ZCARD myzset
(integer) 4
```

## zcount key min max

```
计算在有序集合中指定区间分数的成员数

min和max指的是score分数，不是排名！！！


redis 127.0.0.1:6379> ZADD myzset 1 "hello"
(integer) 1
redis 127.0.0.1:6379> ZADD myzset 1 "foo"
(integer) 1
redis 127.0.0.1:6379> ZADD myzset 2 "world" 3 "bar"
(integer) 2
redis 127.0.0.1:6379> ZCOUNT myzset 1 3
(integer) 4
```

## zincrby key increment member

```
Redis Zincrby 命令对有序集合中指定成员member的分数加上增量 increment

可以通过传递一个负数值 increment ，让分数减去相应的值，比如 ZINCRBY key -5 member ，就是让 member 的 score 值减去 5 。

当 key 不存在，或member不是 key 的成员时， ZINCRBY key increment member 等同于 ZADD key increment member 。

当 key 不是有序集类型时，返回一个错误。

分数值可以是整数值或双精度浮点数。

redis 127.0.0.1:6379> ZADD myzset 1 "hello"
(integer) 1
redis 127.0.0.1:6379> ZADD myzset 1 "foo"
(integer) 1
redis 127.0.0.1:6379> ZINCRBY myzset 2 "hello"
(integer) 3
redis 127.0.0.1:6379> ZRANGE myzset 0 -1 WITHSCORES
1) "foo"
2) "2"
3) "hello"
4) "3"
```

## zrange key start stop [withscores]

```
Redis Zrange 返回有序集中，指定区间内的成员。

其中成员的位置按分数值递增(从小到大)来排序。

具有相同分数值的成员按字典序(lexicographical order )来排列。

如果你需要成员按

值递减(从大到小)来排列，请使用 zrevrange 命令。

下标参数 start 和 stop 都以 0 为底，也就是说，以 0 表示有序集第一个成员，以 1 表示有序集第二个成员，以此类推。

你也可以使用负数下标，以 -1 表示最后一个成员， -2 表示倒数第二个成员，以此类推。

[withscores]:选项用来表示是否输出分数score。

redis 127.0.0.1:6379> ZRANGE salary 0 -1 WITHSCORES             # 显示整个有序集成员
1) "jack"
2) "3500"
3) "tom"
4) "5000"
5) "boss"
6) "10086"
 
redis 127.0.0.1:6379> ZRANGE salary 1 2 WITHSCORES              # 显示有序集下标区间 1 至 2 的成员
1) "tom"
2) "5000"
3) "boss"
4) "10086"
 
redis 127.0.0.1:6379> ZRANGE salary 0 200000 WITHSCORES         # 测试 end 下标超出最大下标时的情况
1) "jack"
2) "3500"
3) "tom"
4) "5000"
5) "boss"
6) "10086"
 
redis > ZRANGE salary 200000 3000000 WITHSCORES                  # 测试当给定区间不存在于有序集时的情况
(empty list or set)
```
## zrangebylex key min max [LIMIT offset count]

```
ZRANGEBYLEX 返回指定成员区间内的成员，按成员字典正序排序, 分数必须相同。 

在某些业务场景中,需要对一个字符串数组按名称的字典顺序进行排序时,

可以使用Redis中SortSet这种数据结构来处理。

min: 字典中排序位置较小的成员,必须以"["开头,或者以"("开头,可使用"-"代替
max: 字典中排序位置较大的成员,必须以"["开头,或者以"("开头,可使用"+"代替
limit: 返回结果是否分页,指令中包含LIMIT后 offset 、count必须输入
offset: 返回结果起始位置
count: 返回结果数量

提示:
分数必须相同! 如果有序集合中的成员分数有不一致的,返回的结果就不准。
成员字符串作为二进制数组的字节数进行比较。
默认是以ASCII字符集的顺序进行排列。如果成员字符串包含utf-8这类字符集的内容,就会影响返回结果,所以建议不要使用。
默认情况下, “max” 和 “min” 参数前必须加 “[” 符号作为开头。”[” 符号与成员之间不能有空格, 返回成员结果集会包含参数 “min” 和 “max” 。
“max” 和 “min” 参数前可以加 “(“ 符号作为开头表示小于, “(“ 符号与成员之间不能有空格。返回成员结果集不会包含 “max” 和 “min” 成员。
可以使用 “-“ 和 “+” 表示得分最小值和最大值
“min” 和 “max” 不能反, “max” 放前面 “min”放后面会导致返回结果为空
与ZRANGEBYLEX获取顺序相反的指令是ZREVRANGEBYLEX。
源码中采用C语言中 memcmp() 函数, 从字符的第0位到最后一位进行排序,如果前面部分相同,那么较长的字符串比较短的字符串排序靠后。

可以使用 “-“ 和 “+” 表示得分最小值和最大值:
redis> zadd zset 0 a 0 aa 0 abc 0 apple 0 b 0 c 0 d 0 d1 0 dd 0 dobble 0 z 0 z1
(integer) 12
redis> ZRANGEBYLEX zset - +
 1) "a"
 2) "aa"
 3) "abc"
 4) "apple"
 5) "b"
 6) "c"
 7) "d"
 8) "d1"
 9) "dd"
10) "dobble"
11) "z"
12) "z1"

获取分页数据:
redis> ZRANGEBYLEX zset - + LIMIT 0 3
1) "a"
2) "aa"
3) "abc"
redis> ZRANGEBYLEX zset - + LIMIT 3 3
1) "apple"
2) "b"
3) "c"

获取成员之间的元素:
默认情况下, “max” 和 “min” 参数前必须加 “[” 符号作为开头。
“[” 符号与成员之间不能有空格, 返回成员结果集会包含参数 “min” 和 “max” 。

redis> ZRANGEBYLEX zset [aa [c
1) "aa"
2) "abc"
3) "apple"
4) "b"
5) "c"

“min” 和 “max” 不能反, “max” 放前面 “min”放后面会导致返回结果为空
redis> ZRANGEBYLEX zset [c [aa
(empty list or set)

使用 “(“ 小于号获取成员之间的元素:
“max” 和 “min” 参数前可以加 “(“ 符号作为开头表示小于, “(“ 符号与成员之间不能有空格。
返回成员结果集不会包含 “max” 和 “min” 成员。

redis> ZRANGEBYLEX zset [aa (c
1) "aa"
2) "abc"
3) "apple"
4) "b"
```

## zrangebyscore key min max [withscores] [limit offset count]

```
返回key的有序集合中的分数在min和max之间的所有元素（包括分数等于max或者min的元素）。

元素被认为是从低分到高分排序的。

具有相同分数的元素按字典序排列（这个根据redis对有序集合实现的情况而定，并不需要进一步计算）。

可选的LIMIT参数指定返回结果的数量及区间（类似SQL中SELECT LIMIT offset, count）。注意，如果offset太大，定位offset就可能遍历整个有序集合，这会增加O(N)的复杂度。

可选参数WITHSCORES会返回元素和其分数，而不只是元素。这个选项在redis2.0之后的版本都可用。

##区间及无限

min和max可以是-inf和+inf，这样一来，你就可以在不知道有序集的最低和最高score值的情况下，使用ZRANGEBYSCORE这类命令。

默认情况下，区间的取值使用闭区间(小于等于或大于等于)，你也可以通过给参数前增加(符号来使用可选的开区间(小于或大于)。

ZRANGEBYSCORE zset (1 5     返回所有符合条件 1 < score <= 5的成员。

ZRANGEBYSCORE zset (5 (10   返回所有符合条件 5 < score <  10的成员。

例子：
redis> ZADD myzset 1 "one"
(integer) 1
redis> ZADD myzset 2 "two"
(integer) 1
redis> ZADD myzset 3 "three"
(integer) 1
redis> ZRANGEBYSCORE myzset -inf +inf
1) "one"
2) "two"
3) "three"
redis> ZRANGEBYSCORE myzset 1 2
1) "one"
2) "two"
redis> ZRANGEBYSCORE myzset (1 2
1) "two"
redis> ZRANGEBYSCORE myzset (1 (2
(empty list or set)
redis> 
```

## zrank key member

```
返回有序集key中成员member的排名。其中有序集成员按score值递增(从小到大)顺序排列。

排名以0为底，也就是说，score值最小的成员排名为0。

使用ZREVRANK命令可以获得成员按score值递减(从大到小)排列的排名。

redis> ZADD myzset 1 "one"
(integer) 1
redis> ZADD myzset 2 "two"
(integer) 1
redis> ZADD myzset 3 "three"
(integer) 1
redis> ZRANK myzset "three"
(integer) 2
redis> ZRANK myzset "four"
(nil)
redis> 
```

## zrem key member [member ...]

```
删除有序集合key中的member。

当key存在，但是其不是有序集合类型，就返回一个错误。

返回的是从有序集合中删除的成员个数，不包括不存在的成员。

redis> ZADD myzset 1 "one"
(integer) 1
redis> ZADD myzset 2 "two"
(integer) 1
redis> ZADD myzset 3 "three"
(integer) 1
redis> ZREM myzset "two"
(integer) 1
redis> ZRANGE myzset 0 -1 WITHSCORES
1) "one"
2) "1"
3) "three"
4) "3"
redis> 
```

## zremrangebylex key min max

```
ZREMRANGEBYLEX 删除名称按字典由低到高排序成员之间所有成员。
不要在成员分数不同的有序集合中使用此命令, 因为它是基于分数一致的有序集合设计的,如果使用,会导致删除的结果不正确。
待删除的有序集合中,分数最好相同,否则删除结果会不正常。

min：字典中排序位置较小的成员,必须以"["开头,或者以"("开头,可使用"-"代替

max：字典中排序位置较大的成员,必须以"["开头,或者以"("开头,可使用"+"代替

删除所有元素：
可以使用 “-“ 和 “+” 表示最小值和最大值

redis> zadd zset 0 a 0 aa 0 abc 0 apple 0 b 0 c 0 d 0 d1 0 dd 0 dobble 0 z 0 z1
(integer) 12
redis> zrangebylex zset - +
 1) "a"
 2) "aa"
 3) "abc"
 4) "apple"
 5) "b"
 6) "c"
 7) "d"
 8) "d1"
 9) "dd"
10) "dobble"
11) "z"
12) "z1"
redis> zremrangebylex zset - +
(integer) 7
redis> zrangebylex zset - +
(empty list or set)

按名称删除某个元素：
下面是删除d1这个元素

redis> zadd zset 0 a 0 aa 0 abc 0 apple 0 b 0 c 0 d 0 d1 0 dd 0 dobble 0 z 0 z1
(integer) 12
redis> zrangebylex  zset - +
 1) "a"
 2) "aa"
 3) "abc"
 4) "apple"
 5) "b"
 6) "c"
 7) "d"
 8) "d1"
 9) "dd"
10) "dobble"
11) "z"
12) "z1"
redis> zremrangebylex zset [d1 (dd
(integer) 1
redis> zrangebylex  zset - +
 1) "a"
 2) "aa"
 3) "abc"
 4) "apple"
 5) "b"
 6) "c"
 7) "d"
 8) "dd"
 9) "dobble"
10) "z"
11) "z1"

按名称删除成员之间的元素,包含”max” 和 “min”成员：

redis> ZRANGEBYLEX zset - +
 1) "a"
 2) "aa"
 3) "abc"
 4) "apple"
 5) "b"
 6) "c"
 7) "d"
 8) "dd"
 9) "dobble"
10) "z"
11) "z1"
redis> ZREMRANGEBYLEX zset [a [apple
(integer) 4
redis> ZRANGEBYLEX zset - +
1) "b"
2) "c"
3) "d"
4) "dd"
5) "dobble"
6) "z"
7) "z1"

按名称删除成员之间的元素,不包含”max” 和 “min”成员：

redis> ZRANGEBYLEX zset - +
1) "b"
2) "c"
3) "d"
4) "dd"
5) "dobble"
6) "z"
7) "z1"     
redis> ZREMRANGEBYLEX zset (d (dobble
(integer) 1
redis> ZRANGEBYLEX zset - +
1) "b"
2) "c"
3) "d"
4) "dobble"
5) "z"
6) "z1"
```

## zremrangebyrank key start stop

```
移除有序集key中，指定排名(rank)区间内的所有成员。
下标参数start和stop都以0为底，0处是分数最小的那个元素。
这些索引也可是负数，表示位移从最高分处开始数。
例如，-1是分数最高的元素，-2是分数第二高的，依次类推。

redis> ZADD myzset 1 "one"
(integer) 1
redis> ZADD myzset 2 "two"
(integer) 1
redis> ZADD myzset 3 "three"
(integer) 1
redis> ZREMRANGEBYRANK myzset 0 1
(integer) 2
redis> ZRANGE myzset 0 -1 WITHSCORES
1) "three"
2) "3"
redis> 
```

## zremrangebyscore key min max

```
移除有序集key中，所有score值介于min和max之间(包括等于min或max)的成员。 
自版本2.1.6开始，score值等于min或max的成员也可以不包括在内，语法请参见ZRANGEBYSCORE命令。

redis> ZADD myzset 1 "one"
(integer) 1
redis> ZADD myzset 2 "two"
(integer) 1
redis> ZADD myzset 3 "three"
(integer) 1
redis> ZREMRANGEBYSCORE myzset -inf (2
(integer) 1
redis> ZRANGE myzset 0 -1 WITHSCORES
1) "two"
2) "2"
3) "three"
4) "3"
redis> 
```

---

## zrevrank key member

```
返回有序集key中成员member的排名，其中有序集成员按score值从大到小排列。排名以0为底，也就是说，score值最大的成员排名为0。

使用ZRANK命令可以获得成员按score值递增(从小到大)排列的排名。

redis> ZADD myzset 1 "one"
(integer) 1
redis> ZADD myzset 2 "two"
(integer) 1
redis> ZADD myzset 3 "three"
(integer) 1
redis> ZREVRANK myzset "one"
(integer) 2
redis> ZREVRANK myzset "four"
(nil)
redis> 
```

## zrevrange key start stop [withscores]

```
返回有序集key中，指定区间内的成员。其中成员的位置按score值递减(从大到小)来排列。
具有相同score值的成员按字典序的反序排列。 
除了成员按score值递减的次序排列这一点外，ZREVRANGE命令的其他方面和ZRANGE命令一样

redis> ZADD myzset 1 "one"
(integer) 1
redis> ZADD myzset 2 "two"
(integer) 1
redis> ZADD myzset 3 "three"
(integer) 1
redis> ZREVRANGE myzset 0 -1
1) "three"
2) "two"
3) "one"
redis> ZREVRANGE myzset 2 3
1) "one"
redis> ZREVRANGE myzset -2 -1
1) "two"
2) "one"
redis> 
```

## zrevrangebylex key max min [limit offset count]

```
zrevrangebylex 返回指定成员区间内的成员，按成员字典倒序排序, 分数必须相同。
在某些业务场景中,需要对一个字符串数组按名称的字典顺序进行倒序排列时,可以使用Redis中SortSet这种数据结构来处理。

```

## zrevrangebyscore key max min [withscores] [limit offset count]

```
zrevrangebyscore 返回有序集合中指定分数区间内的成员，分数由高到低排序。
```

## zscore key member

```
返回有序集key中，成员member的score值。

如果member元素不是有序集key的成员，或key不存在，返回nil。

redis> ZADD myzset 1 "one"
(integer) 1
redis> ZSCORE myzset "one"
"1"
redis> 
```

## zpopmax key [count]

```
删除并返回有序集合key中的最多count个具有最高得分的成员。

如未指定，count的默认值为1。指定一个大于有序集合的基数的count不会产生错误。 

当返回多个元素时候，得分最高的元素将是第一个元素，然后是分数较低的元素。

redis> ZADD myzset 1 "one"
(integer) 1
redis> ZADD myzset 2 "two"
(integer) 1
redis> ZADD myzset 3 "three"
(integer) 1
redis> ZPOPMAX myzset
1) "3"
2) "three"
redis> 
```

## zpopmin key [count]

```
删除并返回有序集合key中的最多count个具有最低得分的成员。

如未指定，count的默认值为1。指定一个大于有序集合的基数的count不会产生错误。 

当返回多个元素时候，得分最低的元素将是第一个元素，然后是分数较高的元素。

redis> ZADD myzset 1 "one"
(integer) 1
redis> ZADD myzset 2 "two"
(integer) 1
redis> ZADD myzset 3 "three"
(integer) 1
redis> ZPOPMIN myzset
1) "1"
2) "one"
redis> 
```

## zinterstore destination numkeys key [key ...] [weights weight] [aggregate sum|min|max]

```
计算给定的numkeys个有序集合的交集，并且把结果放到destination中。 

在给定要计算的key和其它参数之前，必须先给定key个数(numberkeys)。

默认情况下，结果中一个元素的分数是有序集合中该元素分数之和，前提是该元素在这些有序集合中都存在。

因为交集要求其成员必须是给定的每个有序集合中的成员，结果集中的每个元素的分数和输入的有序集合个数相等。

numkeys: 有序集合key的个数。

weights：后面加上的是每个key的权重，就是后面的数字乘以每个key的score。

aggregate：计算方式，默认是sum：求和。min：numkeys个key中score最小的，max：最大的。

如果destination存在，就把它覆盖。

127.0.0.1:6379> zadd liu 3 cat 5 dog 7 horse 
(integer) 3
127.0.0.1:6379> zadd deng 4 cat 6 dog 8 horse 1 monkey
(integer) 4

127.0.0.1:6379> zinterstore result 2 liu deng
(integer) 3

127.0.0.1:6379> zrange result 0 -1 withscores
1) "cat"
2) "7"
3) "dog"
4) "11"
5) "horse"
6) "15"

通过上述的结果看出，默认是求和。

127.0.0.1:6379> zinterstore result 2 liu deng weights 2 1
(integer) 3
127.0.0.1:6379> zrange result 0 -1 withscores
1) "cat"
2) "10"
3) "dog"
4) "16"
5) "horse"
6) "22"

liu的权重就是2了，就是liu中的每个score乘以2，deng乘以1；然后求和。

127.0.0.1:6379> zinterstore result 2 liu deng aggregate max
(integer) 3
127.0.0.1:6379> zrange result 0 -1 withscores
1) "cat"
2) "4"
3) "dog"
4) "6"
5) "horse"
6) "8"
127.0.0.1:6379> 

改变了计算方式：为max了，就是求keys中每个score分数最大的了，不是求和了。
```

## zunionstore destination numkeys key [key ...] [weights weight] [sum|min|max]

```
和zinterstore一样，只是求并集而已。

redis> ZADD zset1 1 "one"
(integer) 1
redis> ZADD zset1 2 "two"
(integer) 1
redis> ZADD zset2 1 "one"
(integer) 1
redis> ZADD zset2 2 "two"
(integer) 1
redis> ZADD zset2 3 "three"
(integer) 1
redis> ZUNIONSTORE out 2 zset1 zset2 WEIGHTS 2 3
(integer) 3
redis> ZRANGE out 0 -1 WITHSCORES
1) "one"
2) "5"
3) "three"
4) "9"
5) "two"
6) "10"
redis>
```