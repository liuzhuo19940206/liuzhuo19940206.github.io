---
title: 搭建Kafka环境
author: gakkij
categories:
  - kafka
tags:
  - kafka
img: https://pic.downk.cc/item/5f9e78661cd1bbb86b08128f.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5f9e78661cd1bbb86b08128f.jpg
toc: true
date: 2020-11-01 16:46:29
summary: 今天来学习kafka的搭建
password:
---

FLink的使用的过程，需要使用到Kafka这个日志消息中间件，今天，我们来学习搭建环境。

### 什么是Kafka

`Kafka` 是一个分布式流式平台，它有三个关键能力

1. 订阅发布记录流，它类似于企业中的`消息队列` 或 `企业消息传递系统`
2. 以容错的方式存储记录流
3. 实时记录流

#### Kafka的应用

1. 作为消息系统
2. 作为存储系统
3. 作为流处理器

Kafka 可以建立流数据管道，可靠性的在系统或应用之间获取数据；建立流式应用传输和响应数据。

#### Kafka 作为消息系统

Kafka 作为消息系统，它有三个基本组件

-  Producer : 发布消息的客户端

-  Broker：一个从生产者接受并存储消息的客户端
- Consumer : 消费者从 Broker 中读取消息

在大型系统中，会需要和很多子系统做交互，也需要消息传递，在诸如此类系统中，你会找到源系统（消息发送方）和 目的系统（消息接收方）。为了在这样的消息系统中传输数据，你需要有合适的数据管道

![](https://pic.downk.cc/item/5f9e7b0f1cd1bbb86b08d386.jpg)

这种数据的交互看起来就很混乱，如果我们使用消息传递系统，那么系统就会变得更加简单和整洁。

![](https://pic.downk.cc/item/5f9e7b381cd1bbb86b08da8d.jpg)

Kafka 运行在一个或多个数据中心的服务器上作为集群运行

- Kafka 集群存储消息记录的目录被称为 `topics`
- 每一条消息记录包含三个要素：**键（key）、值（value）、时间戳（Timestamp）**

#### 核心 API

Kafka 有四个核心API，它们分别是

- Producer API，它允许应用程序向一个或多个 topics 上发送消息记录
- Consumer API，允许应用程序订阅一个或多个 topics 并处理为其生成的记录流
- Streams API，它允许应用程序作为流处理器，从一个或多个主题中消费输入流并为其生成输出流，有效的将输入流转换为输出流。
- Connector API，它允许构建和运行将 Kafka 主题连接到现有应用程序或数据系统的可用生产者和消费者。例如，关系数据库的连接器可能会捕获对表的所有更改

![](https://pic.downk.cc/item/5f9e7b901cd1bbb86b08ec97.jpg)

### Kafka 基本概念

Kafka 作为一个高度可扩展可容错的消息系统，它有很多基本概念，下面就来认识一下这些 Kafka 专属的概念

#### topic

Topic 被称为主题，在 kafka 中，使用一个类别属性来划分消息的所属类，划分消息的这个类称为 topic。topic 相当于消息的分配标签，是一个逻辑概念。主题好比是数据库的表，或者文件系统中的文件夹。

#### partition

partition 译为分区，topic 中的消息被分割为一个或多个的 partition，它是一个物理概念，对应到系统上的就是一个或若干个目录，一个分区就是一个 `提交日志`。消息以追加的形式写入分区，先后以顺序的方式读取。

![](https://pic.downk.cc/item/5f9e7c251cd1bbb86b090a47.jpg)

**注意：由于一个主题包含无数个分区，因此无法保证在整个 topic 中有序，但是单个 Partition 分区可以保证有序。消息被迫加写入每个分区的尾部。Kafka 通过分区来实现数据冗余和伸缩性**

分区可以分布在不同的服务器上，也就是说，一个主题可以跨越多个服务器，以此来提供比单个服务器更强大的性能。

#### segment

Segment 被译为段，将 Partition 进一步细分为**若干个 segment**，每个 segment 文件的大小相等。

#### broker

Kafka 集群包含一个或多个服务器，每个 Kafka 中服务器被称为 broker。broker 接收来自生产者的消息，为消息设置偏移量，并提交消息到磁盘保存。broker 为消费者提供服务，对读取分区的请求作出响应，返回已经提交到磁盘上的消息。

broker 是集群的组成部分，每个集群中都会有一个 broker 同时充当了 `集群控制器(Leader)`的角色，它是由集群中的活跃成员选举出来的。每个集群中的成员都有可能充当 Leader，Leader 负责管理工作，包括将分区分配给 broker 和监控 broker。集群中，一个分区从属于一个 Leader，但是一个分区可以分配给多个 broker（非Leader），这时候会发生分区复制。这种复制的机制为分区提供了消息冗余，如果一个 broker 失效，那么其他活跃用户会重新选举一个 Leader 接管。

![](https://pic.downk.cc/item/5f9e7d031cd1bbb86b0939f8.jpg)

#### producer

生产者，即消息的发布者，其会将某 topic 的消息发布到相应的 partition 中。生产者在默认情况下把**消息均衡**地分布到主题的所有分区上，而并不关心特定消息会被写到哪个分区。不过，``在某些情况下，生产者会把消息直接写到指定的分区。``

#### consumer

消费者，即消息的使用者，一个消费者可以消费多个 topic 的消息，对于某一个 topic 的消息，其只会消费同一个 partition 中的消息。

![](https://pic.downk.cc/item/5f9e7e351cd1bbb86b0978bf.jpg)

在了解完 Kafka 的基本概念之后，我们通过搭建 Kafka 集群来进一步深刻认识一下 Kafka。

### 确保安装环境

#### 安装 Java 环境

在安装 Kafka 之前，先确保本机环境上是否有 Java 环境，使用 `java -version` 命令查看 Java 版本，推荐使用Jdk 1.8 。

#### 安装 Zookeeper 环境

Kafka 的底层使用 Zookeeper 储存元数据，确保一致性，所以安装 Kafka 前需要先安装 Zookeeper，Kafka 的发行版自带了 Zookeeper ，可以直接使用脚本来启动，不过安装一个 Zookeeper 也不费劲。

#### ZK单机环境

Zookeeper 单机搭建比较简单，直接从 https://www.apache.org/dyn/closer.cgi/zookeeper/ 官网下载一个稳定版本的 Zookeeper ，这里我使用的是 `3.6.2`，下载完成后，在 自己系统中随便一个目录下创建 zookeeper 文件夹，将下载好的 zookeeper 压缩包放到该目录下。

如果下载的是一个 tar.gz 包的话，直接使用 `tar -zxvf zookeeper-3.6.2.tar.gz`解压即可

解压完成后，cd 到 目录/zookeeper/zookeeper-3.6.2` ，创建一个 data 文件夹，然后进入到 conf 文件夹下，使用 `mv zoo_sample.cfg zoo.cfg` 进行重命名操作

然后使用 vi 打开 zoo.cfg ，更改一下`dataDir = 目录/zookeeper/zookeeper-3.6.2/data` ，保存。

![](https://pic.downk.cc/item/5f9e81801cd1bbb86b0a21c3.jpg)

进入bin目录，启动服务输入命令`./zkServer.sh start` 输出下面内容表示搭建成功。

![](https://pic.downk.cc/item/5f9e81381cd1bbb86b0a1307.jpg)

关闭服务输入命令，`./zkServer.sh stop`

![](https://pic.downk.cc/item/5f9e82191cd1bbb86b0a3f69.jpg)

使用 `./zkServer.sh status` 可以查看状态信息。

![](https://pic.downk.cc/item/5f9e82531cd1bbb86b0a4ae2.jpg)

#### ZK 集群搭建

##### 准备条件

准备条件：需要三个服务器，这里我使用了CentOS7 并安装了三个虚拟机，并为各自的虚拟机分配了`1GB`的内存，在每个 `/usr/local/` 下面新建 zookeeper 文件夹，把 zookeeper 的压缩包挪过来，解压，完成后会有 zookeeper-3.6.2 文件夹，进入到文件夹，新建两个文件夹，分别是 `data` 和`log`文件夹。

##### 设置集群

新建完成后，需要编辑 conf/zoo.cfg 文件，三个文件的内容如下

```shell
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/usr/local/zookeeper/zookeeper-3.6.2/data
dataLogDir=/usr/local/zookeeper/zookeeper-3.6.2/log
clientPort=12181
server.1=192.168.1.7:12888:13888
server.2=192.168.1.8:12888:13888
server.3=192.168.1.9:12888:13888
```

server.1 中的这个 1 表示的是服务器的标识也可以是其他数字，表示这是第几号服务器，这个标识要和下面我们配置的 `myid` 的标识一致可以。

`192.168.1.7:12888:13888` 为集群中的 ip 地址，第一个端口表示的是 master 与 slave 之间的通信接口，**默认是 2888**，第二个端口是leader选举的端口，集群刚启动的时候选举或者leader挂掉之后进行新的选举的端口，**默认是 3888**。

**现在对上面的配置文件进行解释**

`tickTime`: 这个时间是作为 Zookeeper 服务器之间或客户端与服务器之间`维持心跳`的时间间隔，也就是每个 tickTime 时间就会发送一个心跳。

`initLimit`：这个配置项是用来配置 Zookeeper 接受客户端（这里所说的客户端不是用户连接 Zookeeper 服务器的客户端，而是 Zookeeper 服务器集群中连接到 Leader 的 Follower 服务器）初始化连接时最长能忍受多少个心跳时间间隔数。当已经超过 5个心跳的时间（也就是 tickTime）长度后 Zookeeper 服务器还没有收到客户端的返回信息，那么表明这个客户端连接失败。总的时间长度就是 5*2000=10 秒

`syncLimit`: 这个配置项标识 Leader 与Follower 之间发送消息，请求和应答时间长度，最长不能超过多少个 tickTime 的时间长度，总的时间长度就是5*2000=10秒

`dataDir`: 快照日志的存储路径

`dataLogDir`: 事务日志的存储路径，如果不配置这个那么事务日志会默认存储到dataDir指定的目录，这样会严重影响zk的性能，当zk吞吐量较大的时候，产生的事务日志、快照日志太多

`clientPort`: 这个端口就是客户端连接 Zookeeper 服务器的端口，Zookeeper 会监听这个端口，接受客户端的访问请求。

##### 创建 myid 文件

在了解完其配置文件后，现在来创建每个集群节点的 myid ，我们上面说过，这个 myid 就是 `server.1` 的这个 1 ，类似的，需要为集群中的每个服务都指定标识，使用 `echo` 命令进行创建

```shell
# server.1
echo "1" > /usr/local/zookeeper/zookeeper-3.6.2/data/myid
# server.2
echo "2" > /usr/local/zookeeper/zookeeper-3.6.2/data/myid
# server.3
echo "3" > /usr/local/zookeeper/zookeeper-3.6.2/data/myid
```

##### 启动服务并测试

配置完成，为每个 zk 服务启动并测试，启动服务（每台都需要执行)

```
cd /usr/local/zookeeper/zookeeper-3.6.2/bin
./zkServer.sh start
```

**检查服务状态**

使用 `./zkServer.sh status` 命令检查服务状态。

-----

zk集群一般只有一个leader，多个follower，主一般是相应客户端的读写请求，而从主同步数据，当主挂掉之后就会从follower里投票选举一个leader出来。

### Kafka 集群搭建

#### 准备条件

- 搭建好的 Zookeeper 集群
- Kafka 压缩包 （https://www.apache.org/dyn/closer.cgi?path=/kafka/2.6.0/kafka_2.13-2.6.0.tgz）

在 `/usr/local` 下新建 `kafka` 文件夹，然后把下载完成的 tar.gz 包移到 /usr/local/kafka 目录下，使用 `tar -zxvf 压缩包` 进行解压，解压完成后，进入到 kafka_2.13-2.6.0 目录下，新建 log 文件夹，进入到 config 目录下。

我们可以看到有很多 properties 配置文件，这里主要关注 `server.properties` 这个文件即可。

![](https://pic.downk.cc/item/5f9e86371cd1bbb86b0b1429.jpg)

kafka 启动方式有两种，一种是使用 kafka 自带的 zookeeper 配置文件来启动（可以按照官网来进行启动，并使用单个服务多个节点来模拟集群http://kafka.apache.org/quickstart#quickstart_multibroker），一种是通过使用独立的zk集群来启动，这里推荐使用第二种方式，使用 zk 集群来启动

#### 修改配置项

需要为`每个服务`都修改一下配置项，也就是`server.properties`， 需要更新和添加的内容有

```shell
broker.id=0 //初始是0，每个 server 的broker.id 都应该设置为不一样的，就和 myid 一样 我的三个服务分别设置的是 1,2,3
log.dirs=/Users/liuzhuo/sofe/kafka/kafka_2.13-2.6.0/log

#在log.retention.hours=168 下面新增下面三项
message.max.byte=5242880
default.replication.factor=2
replica.fetch.max.bytes=5242880

#设置zookeeper的连接端口
zookeeper.connect=localhost:2181  #192.168.1.7:2181,192.168.1.8:2181,192.168.1.9:2181
```

配置项的含义

```shell
broker.id=0  #当前机器在集群中的唯一标识，和zookeeper的myid性质一样
port=9092 #当前kafka对外提供服务的端口默认是9092
num.network.threads=3 #这个是borker进行网络处理的线程数
num.io.threads=8 #这个是borker进行I/O处理的线程数
log.dirs=/Users/liuzhuo/sofe/kafka/kafka_2.13-2.6.0/log #消息存放的目录，这个目录可以配置为“，”逗号分割的表达式，上面的num.io.threads要大于这个目录的个数这个目录，如果配置多个目录，新创建的topic他把消息持久化的地方是，当前以逗号分割的目录中，那个分区数最少就放那一个
socket.send.buffer.bytes=102400 #发送缓冲区buffer大小，数据不是一下子就发送的，先回存储到缓冲区了到达一定的大小后在发送，能提高性能
socket.receive.buffer.bytes=102400 #kafka接收缓冲区大小，当数据到达一定大小后在序列化到磁盘
socket.request.max.bytes=104857600 #这个参数是向kafka请求消息或者向kafka发送消息的请请求的最大数，这个值不能超过java的堆栈大小
num.partitions=1 #默认的分区数，一个topic默认1个分区数
log.retention.hours=168 #默认消息的最大持久化时间，168小时，7天
message.max.byte=5242880  #消息保存的最大值5M
default.replication.factor=2  #kafka保存消息的副本数，如果一个副本失效了，另一个还可以继续提供服务
replica.fetch.max.bytes=5242880  #取消息的最大直接数
log.segment.bytes=1073741824 #这个参数是：因为kafka的消息是以追加的形式落地到文件，当超过这个值的时候，kafka会新起一个文件
log.retention.check.interval.ms=300000 #每隔300000毫秒去检查上面配置的log失效时间（log.retention.hours=168 ），到目录查看是否有过期的消息如果有，删除
log.cleaner.enable=false #是否启用log压缩，一般不用启用，启用的话可以提高性能
zookeeper.connect=localhost:2181  #192.168.1.7:2181,192.168.1.8:2181,192.168.1.9:2181 #设置zookeeper的连接端口
```

#### 启动 Kafka 集群并测试

##### 启动服务

进入到 `/Users/liuzhuo/sofe/kafka/kafka_2.13-2.6.0//bin` 目录下

```shell
# 启动后台进程
./kafka-server-start.sh ../config/server.properties
```

![](https://pic.downk.cc/item/5f9e89321cd1bbb86b0c094c.jpg)

**PS：说明，我本地的zk没有启动起来，因此，我们需要首先把zk启动起来。**

![](https://pic.downk.cc/item/5f9e89d31cd1bbb86b0c332d.jpg)

![](https://pic.downk.cc/item/5f9e89fe1cd1bbb86b0c3db7.jpg)

![](https://pic.downk.cc/item/5f9e8a871cd1bbb86b0c6096.jpg)

##### **检查服务是否启动**

```shell
# 执行命令 jps
liuzhuoMacBook-Pro:kafka_2.13-2.6.0 liuzhuo$ jps
29526 Launcher
278
73895 Jps
72968 QuorumPeerMain
73336 Kafka
```

![](https://pic.downk.cc/item/5f9e8ac41cd1bbb86b0c6d36.jpg)

kafka后台运行：

```shell
./kafka-server-start.sh -daemon ../config/server.properties
```

##### 创建 Topic 

```shell
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic gakki
```

![](https://pic.downk.cc/item/5f9e8c5e1cd1bbb86b0cc75b.jpg)

对上面的解释：

```shell
--replication-factor 1   复制1份

--partitions 1 创建1个分区

--topic 创建主题
```

##### 查看我们的主题是否出创建成功

```shell
./bin/kafka-topics.sh --list --zookeeper localhost:2181
```

![](https://pic.downk.cc/item/5f9e8d401cd1bbb86b0cfbc4.jpg)

##### **在一台机器上创建一个发布者**

```shell
# 创建一个broker，发布者
./kafka-console-producer.sh --broker-list localhost:9092 --topic gakki
```

![](https://pic.downk.cc/item/5f9e8e3b1cd1bbb86b0d3126.jpg)

##### **在一台服务器上创建一个订阅者**

```shell
# 创建一个consumer， 消费者
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic gakki --from-beginning
```

![](https://pic.downk.cc/item/5f9e8f291cd1bbb86b0d62c7.jpg)

##### **测试结果**

发布消息：

![](https://pic.downk.cc/item/5f9e8f6a1cd1bbb86b0d7056.jpg)

消费数据：

![](https://pic.downk.cc/item/5f9e8f971cd1bbb86b0d79fc.jpg)

#### 其他命令 

##### 显示 topic

```shell

bin/kafka-topics.sh --list --zookeeper localhost:2181

# 显示
gakki
```

##### 查看 topic 状态

```shell
bin/kafka-topics.sh --describe --zookeeper localhost:2181 --topic gakki

# 下面是显示的详细信息
Topic: gakki	PartitionCount: 1	ReplicationFactor: 1	Configs:
Topic: gakki	Partition: 0	Leader: 0	Replicas: 0	Isr: 0

# 分区为为1  复制因子为1   主题 gakki 的分区为0 
# Replicas: 0   复制的为0
```

`Leader` 负责给定分区的所有读取和写入的节点，每个节点都会通过随机选择成为 leader。

`Replicas` 是为该分区复制日志的节点列表，无论它们是 Leader 还是当前处于活动状态。

`Isr` 是同步副本的集合。它是副本列表的子集，当前仍处于活动状态并追随Leader。

至此，kafka 集群搭建完毕。