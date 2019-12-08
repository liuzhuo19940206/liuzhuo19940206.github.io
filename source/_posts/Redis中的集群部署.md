---
title: Redis中的集群部署
categories:
  - redis
  - 缓存
tags:
  - redis
  - 缓存
date: 2018-12-31 17:52:33
summary: redis中的集群部署
---

今天来学习redis中的集群部署，防止一台master宕机后，就全盘皆输的局面。

## 集群的作用

1:  主从备份 防止主机宕机
2:  读写分离,分担master的任务（master写，slave读）
3:  任务分离,如从服务器分担备份工作与计算工作

## redis中的集群

通常有两种集群的搭建方式：

1）星型
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231175911.png" style="width:50%"/>

2) 链式
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231180020.png" style="width:50%"/>

第2种方式的好处:

master宕机后 , 可以直接切换到 slave1 。

## redis中主从的通信过程
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231180204.png" style="width:50%"/>

首先，slave向master发出同步的命令，master会将dump文件发给slave，在dump的过程中向master发出的命令再使用aof文件来同步到slave中。之后就使用replicationFeedSlaves来同步。

## redis集群的配置

Master配置:
1:关闭rdb快照(备份工作交给slave)
2:可以开启aof

slave配置:
1: **声明slave-of**
2: 配置密码[如果master有密码]
3: [某1个] slave 打开 rdb快照功能
4: **配置是否只读[slave-read-only]**

---

下面开始，真正的操作过程。

### redis中简单的主从复制配置
准备搭 ：1个master + 2个slave的redis集群。

这里是模拟集群，可以使用多个配置文件来模拟多个redis服务器。启动一个配置文件，就是一个redis服务器。

master的配置文件：关闭rdb，开启aof。

第一个slave服务器：开启rdb，关闭aof，开启slave只读。

第二个slave服务器：rdb、aof都不关闭，开启slave只读。

---

将当前目录下的redis.conf文件，复制两份，改个名字。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231202510.png"/>

**修改master的redis.conf配置文件：**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231202701.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231203232.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231203341.png"/>

**修改第一个slave的redis6780.conf的配置文件**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231203939.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231204258.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231204410.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231204626.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231205035.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231205144.png"/>

**修改第二个slave的redis6781.conf的配置文件**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231205323.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231205428.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231205538.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231205726.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231205849.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231205940.png"/>

---

分别启动这个三个redis服务器：

启动之前先删除之前的rdb与aof文件，避免形成干扰。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231211210.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231210422.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231210638.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231214510.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20181231214713.png"/>

发现，我们往master中插入name数据后，在两个slave服务器中，根本就没有name数据。

<font color="red">**这是为啥呢？这是因为redis版本更新后，在slave中配置master的ip时候，不能使用localhost ！！！必须是ip地址，即要写成127.0.0.1**</font>

将两个slave中的：`replicaof 127.0.0.1 6379` 这样写就可以了。

下面是三个redis配置文件中的详细信息：

master：redis.conf
```
bind 127.0.0.1   # 实际生产中，添加自己的ip地址。
port 6379
daemonize yes
pidfile /var/run/redis_6379.pid
#save 900 1                     # master:关闭rdb，留给slave来完成
#save 300 10
#save 60 10000
dbfilename dump6379.rdb
dir /var/rdb
appendonly yes                  # master：开启aof。
appendfilename "appendonly6379.aof"
```

slave：redis6780.conf
```
bind 127.0.0.1   # 实际生产中，添加自己的ip地址。
port 6780
daemonize yes
pidfile /var/run/redis_6780.pid
save 900 1                     # 6780的slave开启：rdb
save 300 10
save 60 10000
dbfilename dump6780.rdb
dir /var/rdb
appendonly no                  # 关闭aof功能，因为master已经开启了
appendfilename "appendonly6780.aof"

#配置主从复制
replicaof 127.0.0.1 6379  # 配置master的ip地址和端口号。注意这里不能写localhost！！！
replica-read-only yes     # slave只读。
```
slave：redis6781.conf
```
bind 127.0.0.1   # 实际生产中，添加自己的ip地址。
port 6781
daemonize yes
pidfile /var/run/redis_6781.pid
#save 900 1                     # 关闭rdb功能
#save 300 10
#save 60 10000
dbfilename dump6781.rdb
dir /var/rdb
appendonly no                  # 关闭aof功能
appendfilename "appendonly6781.aof"

#配置主从复制
replicaof 127.0.0.1 6379  # 配置master的ip地址和端口号。注意这里不能写localhost！！！
replica-read-only yes     # slave只读。
```

这样：分别启动三个redis客户端来验证，数据就一致了。

**注意：高版本的redis主从复制中配置文件中，是：replicaof 、replica-read-only；低版本中是：slaveof、slave-read-only。**

---

下面，来演示redis-2版本之上的版本集群搭建方式：

### redis中的集群搭建

上面，我们演示了redis中的，简单主从复制的搭建，比较简单。其实slave就是将master中的数据拷贝了一份。
而redis中的集群的话，就不是那么简单了，当我们访问其中一个redis服务器时，首先会使用hash算法，定位到具体要使用哪个redis服务器，详细理论知识请看官网。

下面开始redis的搭建过程。

Redis的集群部署需要在每台集群部署的机器上安装Redis，然后修改配置以集群的方式启动。

这里演示的话，就是使用多个redis.conf配置文件来模拟redis集群。

#### 搭建redis集群
1）现在搭建redis集群，**最小集群模式需要三个master实例**，一般建议起六个实例，即三主三从。因此我们创建6个以端口号命名的目录存放实例的配置文件和其他信息。

```
mkdir redis-cluster
cd redis-cluster
mkdir 7000 7001 7002 7003 7004 7005
```

在对应端口号的目录中复制一份redis.conf的文件。每个配置文件中的端口号port参数改为对应目录的端口号。

目录结构可参考：
```
redis-cluster/
├── 7000
│   ├── appendonly.aof
│   ├── dump.rdb
│   ├── nodes-7000.conf
│   └── redis.conf
├── 7001
│   ├── appendonly.aof
│   ├── dump.rdb
│   ├── nodes-7001.conf
│   └── redis.conf
├── 7002
│   ├── appendonly.aof
│   ├── dump.rdb
│   ├── nodes-7002.conf
│   └── redis.conf
├── 7003
│   ├── appendonly.aof
│   ├── dump.rdb
│   ├── nodes-7003.conf
│   └── redis.conf
├── 7004
│   ├── appendonly.aof
│   ├── dump.rdb
│   ├── nodes-7004.conf
│   └── redis.conf
├── 7005
│   ├── appendonly.aof
│   ├── dump.rdb
│   ├── nodes-7005.conf
│   └── redis.conf

```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101112544.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101113222.png"/>

每个redis.conf配置文件的大致需要配置的内容：
```
#可选操作，该项设置后台方式运行，
daemonize yes                       # 开启后台运行

bind 127.0.0.1                      # 如果是实际中，填写每个机器的ip地址
port 7000                           # 对应每个文件夹的名字，设置不同的端口号
pidfile /var/run/redis_7000.pid     # 设置pid文件，对应每个端口号
cluster-enabled yes                 # 开启redis的集群
cluster-config-file nodes-7000.conf # redis集群节点信息文件
cluster-node-timeout 5000           # redis集群节点连接超时的设置
appendonly yes                      # 开启aof持久化
```

以7000为例：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101114057.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101114230.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101114311.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101114349.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101114436.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101114551.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101123950.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101115015.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101115120.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101120216.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101115259.png"/>

7003：
只是开启rdb持久化。7000-7002：master，关闭rdb；7003-7005：slaver，开启rdb。
其他的配置类似于7000。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101114700.png"/>

#### 启动redis服务器
2）启动六个redis服务器
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101121530.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101124528.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101124720.png"/>

如果是使用前台的方式启动redis服务器的话，会出现：
```
[82462] 26 Nov 11:56:55.329 * No cluster configuration found, I'm 97a3a64667477371c4479320d683e4c8db5858b1
```
每个实例都会生成一个Node ID，类似97a3a64667477371c4479320d683e4c8db5858b1，用来作为Redis实例在集群中的唯一标识，而不是通过IP和Port，IP和Port可能会改变，该Node ID不会改变。

#### 使用redis-trib创建集群
3）使用redis-trib创建集群

redis的实例全部运行之后，还需要redis-trib.rb工具来完成集群的创建，redis-trib.rb二进制文件在Redis包主目录下的src目录中，运行该工具依赖 **ruby环境 和 gem**，因此需要提前安装。

##### 安装：ruby
安装：ruby

`yum -y install ruby rubygems`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101125702.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101125829.png"/>

查看ruby的版本：
`ruby --version`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101130020.png"/>

**由于centos系统默认支持Ruby版本为2.0.0，因此执行 gem install redis 命令时会报以下错误。**

`gem install redis`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101130250.png"/>

**解决方法是先安装 rvm，再升级ruby版本。**

##### 安装：rvm

安装rvm

`curl -L get.rvm.io | bash -s stable`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101130536.png"/>

如果出现以下错误：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101130655.png"/>

则执行报错中的：`gpg2 --keyserver ·····` 命令。

```
gpg2 --keyserver hkp://pool.sks-keyservers.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101131331.png"/>

再次执行命令curl -L get.rvm.io | bash -s stable。例如：

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101131715.png"/>

以上表示执行成功，然后执行以下命令。

`source /usr/local/rvm/scripts/rvm`


查看rvm库中已知的ruby版本

`rvm list known`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101131922.png"/>

##### 升级：ruby

升级Ruby:

```
#安装ruby
rvm install 2.5.0
#使用新版本
rvm use  2.5.0
#移除旧版本
rvm remove 2.0.0
#查看当前版本
ruby --version
```

例如：
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101134937.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101135058.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101135223.png"/>

##### 安装：gem

安装：gem

`gem install redis`
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101135356.png"/>

---

##### redis-trib.rb

以上前提工具终于安装好了，可以开始执行：redis-trib.rb 命令

在redis的src源码下，存在：redis-trib.rb 命令。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101135937.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101140009.png"/>

在src目录下：执行
`./redis-trib.rb create --replicas 1 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005`
```
参数create表示创建一个新的集群，--replicas 1 :表示为每个master创建一个slave。
```

如果创建成功会显示以下信息
```
[OK] All 16384 slots covered
```

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101140758.png"/>


`./redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 --cluster-replicas 1`

执行成功后会停止在：

Can I set the above configuration? (type 'yes' to accept):

输入：yes 即可。

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101141229.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101141342.png"/>

---

#### 部署结果验证

4) 部署结果验证

1、客户端验证

使用客户端redis-cli二进制访问某个实例，执行set和get的测试。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101142210.png"/>

**注意：** -h：填写实际中的ip地址，-p：端口号，**-c：代表连接的是redis集群**（一定要带上-c）
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101142637.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101142956.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101143006.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101143225.png"/>

2、集群状态

使用 cluster info 命令查看集群状态。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101143436.png"/>

3、节点状态

使用cluster nodes命令查看节点状态。
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101143720.png"/>

## 配置master密码

一般，我们搭建redis集群是在内网中，所以，不需要设置master密码，也不许要配置防火墙，这样会加快redis的访问速度。

如果，你一定要为了安全性，要配置master的密码的话。

首先退出redis集群，杀死六个redis服务器进程。

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101145033.png"/>

### 方法一
**修改所有redis集群中的redis.conf文件 **

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101145328.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101145614.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101150746.png"/>

**注意所有节点的密码都必须一致，masterauth也要加的。**

### 方法二
**通过指令找到安装的redis在ruby环境中的配置client.rb**
```
find / -name "client.rb"
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101151416.png"/>

编辑该文件:
```
vim /usr/local/rvm/gems/ruby-2.5.0/gems/redis-4.1.0/lib/redis/client.rb
```
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101151542.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101151614.png"/>

修改其中的密码配置：pass

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101151753.png"/>

之后重启Redis，即可。

---

<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101152529.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101152635.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101152738.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101152836.png"/>

**现在，必须使用带密码的参数来连接redis服务器才有权限**
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101153331.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101153455.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/redis/day08/QQ截图20190101153612.png"/>