---
title: hadoop的环境搭建<三>
author: gakkij
categories:
  - hadoop
tags:
  - hadoop
img: https://img.imgdb.cn/item/6039ef5b5f4313ce25f25ba1.jpg
top: false
cover: false
coverImg: https://img.imgdb.cn/item/6039ef5b5f4313ce25f25ba1.jpg
toc: true
date: 2021-02-27 15:04:06
summary: hadoop的完全分布式环境搭建
password:
---

上一篇博客中，我们了解了hadoop的单机运行、伪分布运行模式，今天来学习完全分布式运行模式。

## 分析

1)准备 3 台客户机(关闭防火墙、静态 IP、主机名称)

​		上一篇博客中，我们已经准备了三台：hadoop101、hadoop102、hadoop103；并且在hadoop101中，

​		安装了java8和hadoop的环境。

 2)安装 JDK

 3)配置环境变量

 4)安装 Hadoop

 5)配置环境变量

 **6)配置集群**

**7)单点启动**

**8)配置 ssh** 

**9)群起并测试集群**

## 编写集群分发脚本xsync

### scp安全拷贝

目前，hadoop101上面，有java8和hadoop的解压缩的包，和配置好的环境变量，现在我们不想在hadoop102和hadoop103上面再次安装java8、hadoop的压缩包和配置环境变量，比较繁琐。

使用scp，可以直接将安装好的软件包和配置文件拷贝过来即可。

scp的语法命令：

```java
(1)scp 定义
scp 可以实现服务器与服务器之间的数据拷贝。(from server1 to server2) 

(2)基本语法
scp -r $pdir/$fname $user@$host:$pdir/$fname
命令 递归 要拷贝的文件路径/名称 目的地用户@主机:目的地路径/名称
```

目前的环境：

Hadoop101：

![](https://img.imgdb.cn/item/6039f8ac5f4313ce25fa92bb.jpg)

Hadoop102：

![](https://img.imgdb.cn/item/6039f8f25f4313ce25facb6f.jpg)

Hadoop103：

![](https://img.imgdb.cn/item/6039f9205f4313ce25faf38b.jpg)

---

1）在hadoop101上，将**java环境**，传输到hadoop102上面。

`scp -r jdk1.8.0_211/ hadoop@hadoop102/opt/modules/`

![](https://img.imgdb.cn/item/6039fa2c5f4313ce25fbf143.jpg)

传输完毕后，查看hadoop102的 /opt/modules目录：

![](https://img.imgdb.cn/item/6039fade5f4313ce25fc9a1b.jpg)

2）在hadoop102上面，将hadoop101的**hadoop环境**，传输到hadoop102上面。

`scp -r hadoop@hadoop101:/opt/modules/hadoop-3.2.2/ ./`

![](https://img.imgdb.cn/item/6039fbb25f4313ce25fd57f7.jpg)

传输完成：

![](https://img.imgdb.cn/item/6039fed25f4313ce250217d7.jpg)

3) 在hadoop103服务器上，将hadoop101的环境变量配置文件传输到hadoop102。

`scp -r hadoop@hadoop101/etc/profile hadoop@hadoop102/etc/profile`

![](https://img.imgdb.cn/item/603a00125f4313ce2503c1b0.jpg)

失败，没有权限：

![](https://img.imgdb.cn/item/603a00ae5f4313ce25049f46.jpg)

在hadoop102上面，查看：/etc/profile是否修改：

![](https://img.imgdb.cn/item/603a01955f4313ce2505d5e9.jpg)

### **rsync** 远程同步工具

rsync 主要用于**备份和镜像**。具有**速度快、避免复制相同内容**和支持符号链接的优点。 rsync 和 scp 区别: 用 rsync 做文件的复制要比 scp 的速度快，rsync 只对差异文件做更新。

scp 是把所有文件都复制过去。

1）rsync的使用

```java
基本语法:

rsync -av $pdir/$fname $user@$host:$pdir/$fname
命令 选项参数 要拷贝的文件路径/名称 目的地用户@主机:目的地路径/名称 选项参数说明

选项 功能
-a 归档拷贝
-v 显示复制过程
```

2）案例

在hadoop102上面，删除：wcinput和wcoutput，然后从hadoop101上面同步过来。

![](https://img.imgdb.cn/item/603a04c25f4313ce2509b2da.jpg)

`rsync -av hadoop@hadoop101:/opt/modules/hadoop-3.3.2/ ./`

![](https://img.imgdb.cn/item/603a055a5f4313ce250a752e.jpg)

### **xsync** 集群分发脚本

1）需求:循环复制文件到所有节点的相同目录下

2）需求分析:

1. rsync 命令原始拷贝:
   	 `rsync -av /opt/module atguigu@hadoop103:/opt/ `

2. 期望脚本:

   **xsync** 要同步的文件名称

3. 期望脚本在任何路径都能使用(脚本放在声明了全局环境变量的路径)

   ```
   [hadoop@hadoop101 ~]$ echo $PATH 
   /usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/home/hadoop/.local/bin:/home/hadoop/bin:/opt/module/jdk1.8.0_221/bin
   ```

   ![](https://img.imgdb.cn/item/603a601f5f4313ce25473d1b.jpg)

   因此：我们编写自定义脚本后，放到hadoop的家目录下的bin目录下，就可以在任意的路径下使用该脚本了。

3）脚本实现

1. 在/home/atguigu/bin 目录下创建 xsync 文件

```shell
[hadoop@hadoop101 opt]$ cd /home/hadoop
[hadoop@hadoop101 ~]$ mkdir bin
[hadoop@hadoop101 ~]$ cd bin 
[hadoop@hadoop101 bin]$ vim xsync
```

![](https://img.imgdb.cn/item/603a654e5f4313ce2549da1d.jpg)

在该文件中编写如下代码:

```shell
#!/bin/bash

#1. 判断参数个数 
if [ $# -lt 1 ] 
then
   echo Not Enough Arguement!
   exit; 
fi

#2. 遍历集群所有机器
for host in hadoop101 hadoop102 hadoop103 
do
    echo ==================== $host ====================
    #3. 遍历所有目录，挨个发送
    for file in $@
    do
       #4. 判断文件是否存在 
       if [ -e $file ]
          then
               #5. 获取父目录
               pdir=$(cd -P $(dirname $file); pwd)
               #6. 获取当前文件的名称 fname=$(basename $file)
               ssh $host "mkdir -p $pdir"
               rsync -av $pdir/$fname $host:$pdir
          else
               echo $file does not exists!
        fi 
     done
done
```

2. 修改脚本 xsync 具有执行权限

   `chmod +x xsync`

3. 测试脚本

   `xsync /home/hadoop/bin/`

   ![](https://img.imgdb.cn/item/603a67ca5f4313ce254b1cfa.jpg)

4. 将脚本复制到/bin中，以便全局调用

   `sudo cp xsync /bin/`

5. 同步环境变量配置(root 所有者)

   `sudo ./bin/xsync /etc/profile`

注意：如果需要使用 sudo，那么xsync一定要给它的路径补全：/bin/xsync

## SSH无密码登录配置

### 配置ssh

1）基本语法

ssh 另一台电脑的 IP 地址

2）ssh 连接时出现 Host key verification failed 的解决方法 ：

​     ` ssh hadoop103`
 ➢ 如果出现如下内容
 Are you sure you want to continue connecting (yes/no)?

➢ 输入yes，并回车

3）退回到 hadoop101

 `exit`

![](https://img.imgdb.cn/item/603b200f5f4313ce258ce08a.jpg)

### 无密码登入

能够看到：ssh ip地址 后，我们都需要输入密码，很麻烦！

1）免密登录原理

![](https://img.imgdb.cn/item/603b20825f4313ce258d0f71.jpg)

2）生成公钥和私钥

```java
查看家目录下是否有：.ssh目录

cd /home/hadoop/.ssh
```

![](https://img.imgdb.cn/item/603b21205f4313ce258d58c1.jpg)

```java
1）进入 .ssh 目录下：

cd /home/hadoop/.ssh

2）输入：
ssh-keygen -t rsa

回车：三次，就会生成两个文件 id_rsa(私钥)、id_rsa.pub(公钥)

```

![](https://img.imgdb.cn/item/603b22a85f4313ce258e100d.jpg)

![](https://img.imgdb.cn/item/603b22e95f4313ce258e2dae.jpg)

3）将公钥拷贝到要免密登录的目标机器上

```java
ssh-copy-id hadoop101
ssh-copy-id hadoop102
ssh-copy-id hadoop103

注意：三台服务器上面，都要这样执行！
```

![](https://img.imgdb.cn/item/603b235f5f4313ce258e60e3.jpg)

注意:

还需要在 hadoop101 上采用 root 账号，配置一下无密登录到 hadoop101、hadoop102、 hadoop103;

还需要在 hadoop102 上采用 hadoop 账号配置一下无密登录到 hadoop101、hadoop102、 hadoop103 服务器上。

还需要在 hadoop103 上采用 hadoop 账号配置一下无密登录到 hadoop101、hadoop102、 hadoop103 服务器上。

---

三天服务器都执行完毕后：

![](https://img.imgdb.cn/item/603b24db5f4313ce258f111d.jpg)

此时，再次执行：`ssh ip地址`就不会在要求输入密码了。

3）.ssh 文件夹下(**~/.ssh**)的文件功能解释

| known_hosts     | 记录 ssh 访问过计算机的公钥(public key) |
| :-------------- | --------------------------------------- |
| id_rsa          | 生成的私钥                              |
| id_rsa.pub      | 生成的公钥                              |
| authorized_keys | 存放授权过的无密登录服务器公钥          |

## 集群配置

**1）集群部署规划**

注意：

 ➢ NameNode和SecondaryNameNode不要安装在同一台服务器
 ➢ ResourceManager也很消耗内存，不要和NameNode、SecondaryNameNode配置在同一台机器上。

|      | Hadoop101                  | Hadoop102                            | Hadoop103                           |
| ---- | -------------------------- | ------------------------------------ | ----------------------------------- |
| HDFS | **NameNode**<br />DateNode | DataNode                             | **SecondaryNameNode**<br />DataNode |
| YARN | NodeManager                | **ResourceManager**<br />NodeManager | NodeManager                         |

**2）配置文件说明**

Hadoop 配置文件分两类:默认配置文件和自定义配置文件，只有用户想修改某一默认

配置值时，才需要修改自定义配置文件，更改相应属性值。

1. 默认配置文件:

   ```
   要获取的默认文件             文件存放在 Hadoop 的 jar 包中的位置
   [core-default.xml]        hadoop-common-3.2.2.jar/core-default.xml
   [hdfs-default.xml]        hadoop-hdfs-3.2.2.jar/hdfs-default.xml
   [yarn-default.xml]        hadoop-yarn-common-3.2.2.jar/yarn-default.xml
   [mapred-default.xml]      hadoop-mapreduce-client-core-3.2.2.jar/mapred-default.xml
   ```

2. 自定义配置文件:

   **core-site.xml**、**hdfs-site.xml**、**yarn-site.xml**、**mapred-site.xml** 四个配置文件存放在 **$HADOOP_HOME/etc/hadoop** 这个路径上，用户可以根据项目需求重新进行修改配置。

**3）配置集群**

1. 核心配置

   配置 core-site.xml

   ```xml
   cd $HADOOP_HOME/etc/hadoop
   
   vim core-site.xml
   
   <configuration>
   	<!-- 指定 NameNode 的地址 --> 
   	<property>
   		<name>fs.defaultFS</name>
   		<value>hdfs://hadoop101:9000</value> 
   	</property>
   	<!-- 指定 hadoop 数据的存储目录 -->
   	<property>
   		<name>hadoop.tmp.dir</name> 
   		<value>/opt/modules/hadoop-3.2.2/data</value>
   	</property>
   	<!-- 配置 HDFS 网页登录使用的静态用户为 hadoop --> 
   	<property>
   		<name>hadoop.http.staticuser.user</name>
   		<value>hadoop</value>
   	</property>
   </configuration>
   
   ```

2. HDFS 配置文件

   配置 hdfs-site.xml

   ```xml
   vim hdfs-site.xml
   
   <configuration>
     <!-- hdfs的副本数：默认为3，可以不配置--> 
   	<property>
   		<name>dfs.replication</name>
   		<value>3</value> 
   	</property>
   	<!-- nn web端访问地址--> 
   	<property>
   		<name>dfs.namenode.http-address</name>
   		<value>hadoop101:9870</value> 
   	</property>
   	<!-- 2nn web 端访问地址--> 
   	<property>
   		<name>dfs.namenode.secondary.http-address</name>
   		<value>hadoop103:9868</value>
     </property>
   </configuration>
   ```

3. YARN 配置文件

   配置 yarn-site.xml

   ```xml
   vim yarn-site.xml
   
   <configuration>
   	<!-- 指定 MR 走 shuffle --> 
   	<property>
   		<name>yarn.nodemanager.aux-services</name>
   		<value>mapreduce_shuffle</value> 
   	</property>
   	<!-- 指定 ResourceManager 的地址--> 
   	<property>
   		<name>yarn.resourcemanager.hostname</name>
   		<value>hadoop102</value>
     </property>
     <!-- 是否开启yarn日志的聚集--> 
     <property>
   		<name>yarn.log-aggregation-enable</name>
   		<value>true</value>
     </property>
     <!-- yarn日志聚集的时长--> 
     <property>
		<name>yarn.log-aggregation.retain-seconds</name>
   		<value>604800</value>
     </property>
   </configuration>
   ```
   
4. MapReduce 配置文件

   配置 mapred-site.xml

   ```xml
   vim mapred-site.xml
   
   <configuration>
   	<!-- 指定 MapReduce 程序运行在 Yarn 上 -->
   	<property>
   		<name>mapreduce.framework.name</name>
       <value>yarn</value>
     </property>
     <!-- 指定mr的历史日记 -->
     <property>
   		<name>mapreduce.jobhistory.address</name>
       <value>hadoop101:10020</value>
     </property>
     <!-- 指定mr的历史日记的web端口号 -->
     <property>
   		<name>mapreduce.jobhistory.webapp.https.address</name>
       <value>hadoop101:19888</value>
     </property>
   </configuration>
   ```

**4**）在集群上分发配置好的 **Hadoop** 配置文件

```shell
xsync /opt/modules/hadoop-3.2.2/etc/hadoop/
```

![](https://img.imgdb.cn/item/603b30c35f4313ce2594ea76.jpg)

**5**）去 **103** 和 **104** 上查看文件分发情况

```shell
cat /opt/modules/hadoop-3.2.2/etc/hadoop/core-site.xml
```

## 群起集群

**1）配置workers**

```
vim /opt/module/hadoop-3.2.2/etc/hadoop/workers

在该文件中增加如下内容:
hadoop101
hadoop102
hadoop103
 
注意:该文件中添加的内容结尾不允许有空格，文件中不允许有空行。

同步所有节点配置文件:
xsync /opt/modules/hadoop-3.2.2/etc/hadoop/workers
```

**2**）启动集群

1. 如果集群是第一次启动，需要在 hadoop101 节点格式化 NameNode

   (注意: 格式化 NameNode，会产生**新的集群 id**，导致 NameNode 和 DataNode 的集群 id 不一致，集群找不到已往数据。如果集群在运行过程中报错，需要重新格式化 NameNode 的话，一定要先停 止 namenode 和 datanode 进程，并且要删除所有机器的 data 和 logs 目录，然后再进行格式化。)

   `hdfs namenode -format`

2. 启动 HDFS（hadoop101上）

   `sbin/start-dfs.sh`

3. 在配置了 **ResourceManager** 的节点(**hadoop102**)启动 YARN

   `sbin/start-yarn.sh`

4. 启动历史服务器（hadoop101上）

   `bin/mapred --daemon start historyserver`

   hadoop101：

   ![](https://img.imgdb.cn/item/603b40925f4313ce259b45e4.jpg)

   hadoop102：

   ![](https://img.imgdb.cn/item/603b40c35f4313ce259b5a23.jpg)

   hadoop103：

   ![](https://img.imgdb.cn/item/603b40f05f4313ce259b6d2b.jpg)

5. Web 端查看 HDFS 的 NameNode

   浏览器中输入:http://hadoop101:9870

   查看 HDFS 上存储的数据信息

6. Web 端查看 YARN 的 ResourceManager

   浏览器中输入:http://hadoop102:8088

   查看 YARN 上运行的 Job 信息

**3**）集群基本测试

1. 上传文件到集群

   ➢ 上传小文件

   ```shell
   hdfs dfs -mkdir /input
   
   hdfs dfs -put $HADOOP_HOME/wcinput/word.txt /input
   ```

   ➢ 上传大文件

   ```shell
   hdfs dfs -put /opt/sofes/jdk-8u212-linux-x64.tar.gz /
   ```

   ![](https://img.imgdb.cn/item/603b53245f4313ce25a46f84.jpg)

   ![](https://img.imgdb.cn/item/603b537f5f4313ce25a4aecf.jpg)

2. 上传文件后查看文件存放在什么位置

   ➢ 查看HDFS文件存储路径

   ```
   [hadoop@hadoop101 subdir0]$ pwd
   /opt/module/hadoop-3.1.3/data/dfs/data/current/BP-1436128598- 192.168.10.102-1610603650062/current/finalized/subdir0/subdir0
   ```

   ➢ 查看HDFS在磁盘存储文件内容

   ```
   [hadoop@hadoop101 subdir0]$ cat blk_1073741825 
   hadoop java
   hadoop mapreduce
   yarn c++
   flink spark
   ```

3. 拼接

   ```shell
   [hadoop@hadoop101 subdir0]$ cat blk_1073741836 >> tmp.tar.gz
   [hadoop@hadoop101 subdir0]$ cat blk_1073741837 >> tmp.tar.gz 
   [hadoop@hadoop101 subdir0]$ tar -zxvf tmp.tar.gz
   
   发现就是我们上传的 java的安装包
   ```

   因为：上传到hdfs中的文件，是以块来存储的，128M为一个块，java的安装包大于128M，因此会有两块文件，合在一起就是完整的数据。

4. 下载

   ```shell
   [hadoop@hadoop103 sofes]$ hdfs dfs -get /jdk-8u212-linux-x64.tar.gz ./
   ```

5. 执行 wordcount 程序

   ```shell
   [hadoop@hadoop101 hadoop-3.2.2]$ hadoop jar share/hadoop/mapreduce/hadoop-mapreduce-examples-3.2.2.jar wordcount /input /output
    
   ```

![](https://img.imgdb.cn/item/603b54cb5f4313ce25a59615.jpg)

## 集群启动**/**停止方式总结

**1**）各个模块分开启动**/**停止(配置 **ssh** 是前提)常用

1. 整体启动/停止 HDFS

   ```
   start-dfs.sh/stop-dfs.sh
   ```

2. 整体启动/停止 YARN

   ```
   start-yarn.sh/stop-yarn.sh
   ```

**2**）各个服务组件逐一启动**/**停止

1. 分别启动/停止 HDFS 组件

   ```
   hdfs --daemon start/stop namenode/datanode/secondarynamenode
   ```

2. 启动/停止 YARN

   ```
   yarn --daemon start/stop resourcemanager/nodemanager
   ```

3. 启动历史服务

   ```
   mapred --daemon start/stop historyserver 
   ```

## 编写 **Hadoop** 集群常用脚本

**1**）**Hadoop** 集群启停脚本(包含 **HDFS**，**Yarn**，**Historyserver**):**myhadoop.sh**

创建：myhadoop.sh 文件

```shell
cd /home/hadoop/bin
vim myhadoop.sh
```

输入输入如下内容:

```shell
#!/bin/bash
if [ $# -lt 1 ]
then
   echo "No Args Input..."
   exit; 
fi

case $1 in
"start")
				echo " =================== 启动 hadoop 集群 ==================="
				echo " ------------------- 启动 hdfs ---------------"
				ssh hadoop101 "/opt/module/hadoop-3.1.3/sbin/start-dfs.sh" 
				echo " ------------------- 启动 yarn ---------------"
				ssh hadoop102 "/opt/module/hadoop-3.1.3/sbin/start-yarn.sh"
				echo " ------------------- 启动 historyserver ---------------"
				ssh hadoop101 "/opt/module/hadoop-3.1.3/bin/mapred --daemon start historyserver"
;;
"stop")
				echo " =================== 关闭 hadoop 集群 ==================="
				echo " ------------------- 关闭 historyserver ---------------"
				ssh hadoop101 "/opt/module/hadoop-3.1.3/bin/mapred --daemon stop historyserver"
				echo " ------------------- 关闭 yarn ---------------"
				ssh hadoop102 "/opt/module/hadoop-3.1.3/sbin/stop-yarn.sh" 
				echo " ------------------- 关闭 hdfs ---------------"
				ssh hadoop101 "/opt/module/hadoop-3.1.3/sbin/stop-dfs.sh"
;;
*)
        echo "Input Args Error..."
;;
esac
```

赋予脚本执行权限：

```shell
chmod +x myhadoop.sh
```

**2**）查看三台服务器 **Java** 进程脚本:**jpsall**

创建：jpsall 文件

```shell
cd /home/hadoop/bin
vim jpsall
```

输入以下内容：

```shell
#!/bin/bash

for host in hadoop101 hadoop102 hadoop103 
do
       echo "=============== $host ==============="
       ssh $host "source /etc/profile;jps"
done
```

保存后退出，然后赋予脚本执行权限:

```shell
chmod +x jpsall
```

**3**）分发**/home/atguigu/bin** 目录，保证自定义脚本在三台机器上都可以使用

```shell
xsync /home/hadoop/bin/
```

## 常用端口号说明

| 端口名称                   | Hadoop2.x   | Hadoop3.x        |
| -------------------------- | ----------- | ---------------- |
| NameNode 内部通信端口      | 8020 / 9000 | 8020 / 9000/9820 |
| NameNode HTTP UI           | 50070       | 9870             |
| MapReduce 查看执行任务端口 | 8088        | 8088             |
| 历史服务器通信端口         | 19888       | 19888            |



