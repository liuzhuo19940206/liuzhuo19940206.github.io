---
title: Redis的常用配置选项
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2019-01-08 20:41:04
summary: 列举redis中的常用配置选项
---

列举redis中的常用配置选项


```
==配置文件全解===

===基本配置=======

bind 127.0.0.1    #绑定的主机地址

port 6379         #指定Redis监听端口，默认端口为6379

daemonize no      #是否以后台进程启动,no：不是，yes：是

pidfile /var/run/redis.pid  #当Redis以守护进程方式运行时，Redis默认会把pid写入/var/run/redis.pid文件，可以通过pidfile指定

timeout 300       #当客户端闲置多长时间后关闭连接，如果指定为0，表示关闭该功能。

databases 16      #创建database的数量(默认选中的是database 0)

loglevel verbose  #指定日志记录级别，Redis总共支持四个级别：debug、verbose、notice、warning，默认为verbose

logfile stdout    #日志记录方式，默认为标准输出,如果配置Redis为守护进程方式运行，而这里又配置为日志记录方式为标准输出，则日志将会发送给/dev/null

----------------------------------------------------------
save <seconds> <changes>
Redis默认配置文件中提供了三个条件：(or)

save 900 1        #刷新快照到硬盘中，必须满足两者要求才会触发，即900秒之后至少1个关键字发生变化。

save 300 10       #必须是300秒之后至少10个关键字发生变化。

save 60 10000     #必须是60秒之后至少10000个关键字发生变化。
-----------------------------------------------------------

stop-writes-on-bgsave-error yes    #后台存储错误停止写。

rdbcompression yes         #使用LZF压缩rdb文件。

rdbchecksum yes            #存储和加载rdb文件时校验。

dbfilename dump.rdb        #设置rdb文件名。

dir ./                     #设置工作目录，rdb文件会写入该目录。


=====主从配置======

slaveof <masterip> <masterport>   #设为某台机器的从服务器,新版本是：replicaof <masterip> <masterport>

masterauth <master-password>      #连接主服务器的密码

slave-server-stale-data yes       #当主从断开或slave正在复制中 , slave从服务器是否应答。yes：slave会仍然响应客户端请求,此时可能会有问题，no: slave会返回"SYNC with master in progress"这样的错误信息

slave-read-only yes               #从服务器只读,不能执行set等写入命令

repl-ping-slave-period 10         #从服务器ping主服务器的时间间隔 , 秒为单位

repl-timeout 60                   #主从超时时间(超时认为断线了) , 要比repl-ping-slave-period大.

slave-priority 100                #如果master不能再正常工作，那么会在多个slave中，选择优先值最小的一个slave提升为master，优先值为0表示不能提升为master。

repl-disable-tcp-nodelay no       #主服务器端是否合并数据,大块发送给slave。

=====安全配置======

requirepass foobared              # 需要密码

#命令重命名
rename-command CONFIG b840fc02d524045429941cc15f59e41cb7be6c52 #如果公共环境,可以重命名部分敏感命令 如config


=====限制配置=======

maxclients 10000                  #最大客户端连接数

maxmemory <bytes>                 #最大使用内存,如果你想把Redis视为一个真正的DB的话，那不要设置<maxmemory>,只有你只想把Redis作为cache.

-------------------------------------------------------
maxmemory-policy volatile-lru     #内存到极限后的处理

volatile-lru     -> LRU算法删除过期key
allkeys-lru      -> LRU算法删除key(不区分过不过期)
volatile-random  -> 随机删除过期key，
allkeys-random   -> 随机删除key(不区分过不过期)，
volatile-ttl     -> 删除快过期的key，
noeviction       -> 不删除,返回错误信息。

-------------------------------------------------------

#解释LRU ttl 都是近似算法,可以选N个,再比较最适宜T踢出的数据。默认的样本数是3，你可以修改它。
maxmemory-samples 3


====日志模式配置=====

appendonly  no                     #是否开启aof日志持久化

appendfilename appendonly.aof      # append only 文件名 (默认: "appendonly.aof")

--------------------------------------------------------------------------------
# Redis支持3中模式:

appendfsync no                     #系统缓冲 , 统一写,速度快

appendfsync always                 #系统不缓冲,直接写,慢,丢失数据少。

appendfsync everysec               #折衷 , 每秒写1次
--------------------------------------------------------------------------------

no-appendfsync-on-rewrite no       #为yes,则其他线程的数据放内存里,合并写入(速度快,容易丢失的多)。

# append only 文件的自动重写
auto-aof-rewrite-percentage 100    #当前aof文件比上次重写文件大N%时，重写。auto-aof-rewrite-percentage 设置为 0 ，可以关闭AOF重写功能。

auto-aof-rewrite-min-size 64mb     #aof重写至少要达到的大小。



====慢查询配置=======

slowlog-log-slower-than 10000       #记录响应时间大于10000微秒的慢查询，负数则关闭slow log，0则会导致每个命令都被记录。单位：微秒！！！

slowlog-max-len 128                 #最多记录慢查询128条


====高级配置=======

hash-max-zipmap-entries 512        #存储hash的键，当hash的键值对的数量超过指定的数字时，底层使用字典来存储hash键，否则使用压缩列表。

hash-max-zipmap-value 64           #存储hash的键，当hash的键值对的大小超过指定的数字时，底层使用字典来存储hash键，否则使用压缩列表。

activerehashing yes                #指定是否激活重置hash，默认开启。

list-max-ziplist-entries 512       #类似，list的底层结构也有很多种。

list-max-ziplist-value 64

set-max-intset-entries 512

zset-max-ziplist-entries 128

zset-max-ziplist-value 64

include /path/to/local.conf       #指定包含其他配置文件，可以在同一主机上多个redis实例之间使用同一份配置文件，而同时各个实例又拥有自己的特定配置文件 

--------------------------------------------------------------------------------------------------------------------------------------------


=============服务端命令===============（是指令，不是配置在配置文件中）

time                               #返回时间戳+微秒

dbsize                             #返回key的数量

bgrewriteaof                       #重写aof

bgsave                             #后台开启子进程，进行dump数据

save                               #阻塞进程，进行dump数据

lastsave                           #上次进行dump数据的时间

slaveof host port                  #做host port的从服务器(数据清空,复制新主内容)

slaveof no one                     #变成主服务器(原数据不丢失,一般用于主服失败后)

flushdb                            #清空当前数据库的所有数据

flushall                           #清空所有数据库的所有数据(误用了怎么办?)

shutdown [save/nosave]             #关闭服务器,保存数据,修改AOF(如果设置)

slowlog get N                      #获取N条慢查询日志

slowlog len                        #获取慢查询日志条数

slowlog reset                      #清空慢查询

info []                            #查看很多服务器端的信息

config get   选项(支持*通配)       #查看配置文件中的信息

config set   选项值                #修改配置文件中的信息（临时的）

config rewrite                     #把值写到配置文件（永久的）

config restart                     #更新info命令的信息。

debug object key                   #调试选项 , 看一个key的情况。

debug segfault                     #模拟段错误,让服务器崩溃。

object key (refcount|encoding|idletime)

monitor                            #打开控制台,观察命令(调试用)

client list                        #列出所有客户端的连接

client kill                        #杀死某个客户端连接 ，CLIENT KILL 127.0.0.1:43501

client getname                     #获取连接的名称 默认是nil

client setname "名称"              #设置连接名称,便于调试



====连接命令=====

auth 密码                          #密码登陆(如果有密码)

ping                               #测试服务器是否可用

echo "some content"                #测试服务器是否正常交互

select 0/1/2...                    #选择数据库

quit                               #退出连接

```