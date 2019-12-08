---
title: Redis中运维相关的指令
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2019-01-01 21:25:19
summary: redis中与运维相关的指令
---

这篇文章，将讲述redis中与运维相关的指令。

上篇，我们讲解了redis中的集群搭建过程。现在来学习redis中的运维相关的知识。

## 准备工作

现在redis的目录结构如下：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101213016.png"/>

redis.conf配置文件中主要的配置：
```
port 6379
daemonize yes
pidfile /var/run/redis_6379.pid
save 900 1
save 300 10
save 60 10000
dbfilename dump6379.rdb
dir /var/rdb
appendonly yes
appendfilename "appendonly6379.aof"
```

首先，删除：/var/rdb/下的所有持久化文件，为了防止干扰。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101214056.png"/>

使用这个配置文件，启动redis服务器：

<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101213740.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101214242.png"/>

启动redis的客户端：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101214441.png"/>

---

## 运维常用指令

### time
```
显示redis 服务器端命令。
第一行：时间戳(秒)
第二行：微秒数
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101214755.png"/>

### dbsize
```
显示当前数据库的key是数量
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101214927.png"/>

### select
```
select N: 切换到N数据库下，默认16个数据库
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101215137.png"/>

### bgrewriteaof
```
后台进程重写aof文件
```

我们知道，开启aof持久化后，必须满足一定的条件，才会执行aof重写操作，但是直接使用该命令，会立即重写aof文件。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101215852.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101215950.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101220120.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101220220.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101220359.png"/>

### save
```
save: 保存rdb快照

之前，都是当系统满足那三个save条件后，自动帮我们保存rdb快照
现在直接执行这个命令，就可以帮我们保存rdb快照了。
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101220829.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101220924.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101221014.png"/>

### bgsave
```
bgsave: 后台保存rdb快照。

save是直接使用主进程来执行rdb保存操作，这样会阻塞当前进程。
bgsave是后台进程执行，就不会阻塞当前进程。
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101221140.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101221451.png"/>

### lastsave
```
上次保存快照的时间戳
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101221647.png"/>

### flushdb
```
清空当前数据库中的所有数据

实际生产中，轻易不要用这个命令！！！
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101221927.png"/>

### flushall
```
清空所有数据库中的数据
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101222419.png"/>

### shutdown
```
showdown [save/nosave] ：关闭服务器

如果不小心执行了flushall，立即 shutdown nosave ， 关闭服务器
然后，手动编辑aof文件，去掉文件中的"flushall"相关的行，然后开启服务器，就可以导入回原来的数据了。

如果flushall之后 , 系统恰好bgrewriteaof了 , 那么aof就清空了 , 数据丢失.（无力回天）
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101222802.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101222957.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101223216.png"/>

### slowlog
```
slowlog: 显示慢查询

怎样才算是一个慢执行过程呢？这是由redis.conf配置中的：slowlog-log-slower-than 10000（默认值） 来指定的
单位是：微秒。

最多能存储多少条慢查询信息呢？这是由redis.conf配置中的：slowlog-max-len 128 （默认值）, 来做限制

slowlog get N ：获取N条慢查询的信息
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101223813.png"/>

### config 
```
用来修改redis.conf配置文件中的值，是在redis运行的期间。
config get 配置项  
config set 配置项 值 (特殊的选项,不允许用此命令设置,如slave-of, 需要用单独的slaveof命令来设置)

注意：
如果调用config set **** 之后，没有使用config rewrite命令的话，是不会将更改保存到redis.conf中的
只对当前允许的redis实例生效，进程结束之后就失效里。
所以如果想保存到配置文件的话，别忘了在使用config set ****之后，调用config rewrite
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101224601.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101224740.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101225054.png"/>

### info
```
查看redis服务器信息的。

1: 内存
# Memory
used_memory:859192      数据结构的空间
used_memory_rss:7634944 实占空间
mem_fragmentation_ratio:8.89 
前2者的比例,1.N为佳,如果此值过大,说明redis的内存的碎片化严重,可以导出再导入一次.

2: 主从复制
# Replication
role:slave
master_host:192.168.1.128
master_port:6379
master_link_status:up

3:持久化
# Persistence
rdb_changes_since_last_save:0
rdb_last_save_time:1375224063

4: fork耗时
#Status
latest_fork_usec:936  上次导出rdb快照,持久化花费微秒
注意: 如果某实例有10G内容,导出需要2分钟,
每分钟写入10000次,导致不断的rdb导出,磁盘始处于高IO状态.

```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101225516.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190101225740.png"/>

从上图可以看出，slaves：0，没有slave服务器，所以，现在配置一个。

将当前目录下的redis.conf 复制一份为：redis6380.conf.

`cp redis.conf redis6380.conf`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190102095059.png"/>

redis.conf中的配置信息
```
bind 127.0.0.1   # 实际生产中，添加自己的ip地址。
port 6379
daemonize yes
pidfile /var/run/redis_6379.pid
save 900 1
save 300 10
save 60 10000
dbfilename dump6379.rdb
dir /var/rdb
appendonly yes
appendfilename "appendonly6379.aof"
```

redis6380.conf中的配置信息
```
bind 127.0.0.1   # 实际生产中，添加自己的ip地址。
port 6380
daemonize yes
pidfile /var/run/redis_6380.pid
#save 900 1       # 不要rdb，因为6379：master已经配置了。
#save 300 10
#save 60 10000
dbfilename dump6380.rdb
dir /var/rdb
appendonly no     # 不要配置aof，6379：master已经配置了。
appendfilename "appendonly6380.aof"

#配置主从复制
replicaof 127.0.0.1 6379  # 配置master的ip地址和端口号。注意这里不能写localhost！！！
replica-read-only yes     # slave只读。
```

分别启动这两个redis服务器。

`./bin/redis-server ./redis.conf`

`./bin/redis-server ./redis6380.conf`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190102100807.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190102100930.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190102101103.png"/>

以上主从复制配置成功，在使用info来查看信息。

在6379：redis客户端中：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190102101446.png"/>

在6380：redis客户端中：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day09/QQ截图20190102101638.png"/>