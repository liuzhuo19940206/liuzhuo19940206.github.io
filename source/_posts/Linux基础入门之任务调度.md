---
title: Linux基础入门之任务调度与磁盘分区
categories:
  - Linux
tags:
  - Linux
date: 2018-11-28 10:49:33
summary: 定时任务调度、磁盘分区
---

定时任务调度、磁盘分区

## Linux的crond任务调度

crontab 进行 定时任务的设置。

### 概述

任务调度：是指系统在某个时间执行的特定的命令或程序。 

任务调度分类：

1.系统工作：有些重要的工作必须周而复始地执行，比如病毒扫描等。
2.个别用户工作：个别用户可能希望执行某些程序，比如对mysql数据库的备份。

### 简单说明
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128131351.png"/>

如果，我们需要备份mysql数据，而且是在晚上凌晨两点的时候执行效率才会高，我们不可能每天凌晨两点去执行备份mysql数据的命令，所以可以使用crontab任务调用机制，帮助我们每天凌晨两点自动执行备份mysql数据的命令。

使用步骤：

1）编写我们特殊的脚本（shell编程）

2）使用crontab任务调用我们的脚本执行。

**注意：简单的脚本，可以不用写，直接使用crontab就可以帮助我们执行了。**

### 基本语法
```
crontab [选项]

常用选项
-e：编辑crontab定时任务
-l：查询crontab任务
-r：删除当前用户所有的crontab任务
```

### 快速入门

设置任务调度文件：/etc/crontab
设置个人任务调度: 执行 crontab –e 命令。
接着输入任务到调度文件：
```
如：*/1 * * * * ls –l  /home/ >> /home/tmp/to.txt
```
意思是说：当前时间每隔一分钟就执行 ls –l /home/ >> /home/tmp/to.txt命令.

步骤如下：

1）crontab -e

2）输入：`*/1 * * * * ls –l  /home/ >> /home/tmp/to.txt`

3) 当保存退出后就执行定时任务。

4）在每一分钟都会自动的调用：ls –l  /home/ >> /home/tmp/to.txt

---
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128133356.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128133518.png"/>

保存退出：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128133600.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128133720.png"/>

之后每隔一分钟都会往 /home/tmp/to.txt 文件中，追加：ls -l /home/ 的信息。

### 参数细节说明

1）5个占位符的说明
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128134026.png"/>

2）特殊符号的说明
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128134119.png"/>

3）特定时间执行任务案例
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128134542.png"/>


### 应用实例

案例1：每隔1分钟，就将当前的日期信息，追加到 /home/tmp/mydate.log 文件中

1) 在/home下：编写一个文件（shell）mytask1.sh

`date >> /home/tmp/mydate.log`

2) 给mytask1.sh分配一个可执行的权限

`chmod 744 /home/mytask1.sh`

3）crontab -e

`*/1 * * * *  /home/mytask1.sh`

4）保存退出即可。

---
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128138836.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128140946.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128141112.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128141317.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128141248.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128141507.png"/>


案例2：每隔1分钟， 将当前日期和日历都追加到 /home/mycal.log 文件中

`*/1 * * * *  date >> /home/mycal.log`
`*/1 * * * *  cal >> /home/mycal.log`

案例3: 每天凌晨2:00 将mysql数据库 testdb ，备份到文件中。
```
步骤：1， 首先编写一个 脚本 backupdb.sh

#!/bin/bash   
#备份路径
BACKUP=/data/backup/sql/dy
#当前时间
DATETIME=$(date +%Y-%m-%d_%H%M%S)
echo "===备份开始==="
echo "备份文件存放于${BACKUP}/$DATETIME.tar.gz"
#数据库地址
HOST=localhost
#数据库用户名
DB_USER=root
#数据库密码
DB_PW=Ces123456
#创建备份目录
[ ! -d "${BACKUP}/$DATETIME" ] && mkdir -p "${BACKUP}/$DATETIME"
 
#后台系统数据库
DATABASE=dy_backgroundms
mysqldump -u${DB_USER} -p${DB_PW} --host=$HOST -q -R --databases $DATABASE | gzip > ${BACKUP}/$DATETIME/$DATABASE.sql.gz

#投入品监管数据库
DATABASE=dy_firip
mysqldump -u${DB_USER} -p${DB_PW} --host=$HOST -q -R --databases $DATABASE | gzip > ${BACKUP}/$DATETIME/$DATABASE.sql.gz
 
#压缩成tar.gz包
cd $BACKUP
tar -zcvf $DATETIME.tar.gz $DATETIME
#删除备份目录
rm -rf ${BACKUP}/$DATETIME
 
#删除30天前备份的数据
find $BACKUP -mtime +30 -name "*.tar.gz" -exec rm -rf {} \;
echo "===备份成功==="


```

### crond 相关指令:
```
1) crontab -e：创建任务调度。
2) crontab –l：列出当前有那些任务调度。
3) conrtab –r：终止任务调度。
4) service crond restart ： [重启任务调度]   <=====> systemctl restart crond
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128135000.png"/>

## Linux的磁盘分区、挂载

### 分区基础知识

#### 分区的方式(知道即可)

1) mbr分区:

1.最多支持四个主分区
2.系统只能安装在主分区
3.扩展分区要占一个主分区
4.MBR最大只支持2TB，但拥有最好的兼容性

2) gtp分区:

1.支持无限多个主分区（但操作系统可能会限制，比如 windows下最多128个分区）
2.最大支持18EB的大容量（1EB=1024 PB，1PB=1024 TB ）
3.windows7 64位以后支持gtp

#### windows下的磁盘分区

<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128144519.png"/>

#### Linux分区

原理介绍：

1）对Linux来说无论有几个分区，分给哪一个目录使用，它归根结底就只有一个根目录，一个独立且唯一的文件结构 , Linux中每个分区都是用来组成整个文件系统的一部分。

2）Linux采用了一种叫“载入”的处理方法，它的整个文件系统中包含了一整套的文件和目录，且将一个分区和一个目录联系起来。这时要载入的一个分区将使它的存储空间在一个目录下获得。

3）示意图【分区和文件目录】
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128145010.png"/>

#### Linux硬盘说明

1）Linux硬盘分IDE硬盘和SCSI硬盘，目前基本上是**SCSI硬盘**。

2）对于IDE硬盘，驱动器标识符为“hdx~”,其中“hd”表明分区所在设备的类型，这里是指IDE硬盘了。“x”为盘号（a为基本盘，b为基本从属盘，c为辅助主盘，d为辅助从属盘）,“~”代表分区，前四个分区用数字1到4表示，它们是主分区或扩展分区，从5开始就是逻辑分区。

例如，hda3表示为第一个IDE硬盘上的第三个主分区或扩展分区 , hdb2表示为第二个IDE硬盘上的第二个主分区或扩展分区。 

3）对于SCSI硬盘则标识为“sdx~”，SCSI硬盘是用“sd”来表示分区所在设备的类型的，其余则和IDE硬盘的表示方法一样。
sdb1 [表示第2块scsi 硬盘的第1个分区]

#### 查看所有设备挂载情况

命令：`lsblk` 或者 `lsblk -f`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128150000.png"/>

### 挂载的经典案例

说明：

下面我们以增加一块硬盘 2G 为例来熟悉下磁盘的相关指令和深入理解：磁盘分区、挂载、卸载的概念。

如何增加一块硬盘：
```
步骤：

1）虚拟机添加硬盘
2）分区
3）格式化
4）挂载
5）设置可以自动挂载 。

```

#### 增加硬盘
1）虚拟机增加硬盘

在虚拟机关闭的情况的下，点击设置，找到存储，点击控制器：SATA右边的第二个加号！
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128165053.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128165215.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128165251.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128165510.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128165619.png"/>

#### 分区
2）使用fdisk命令分区

重启我们的linux系统：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128170120.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128170250.png"/>

使用：`fdisk /dev/sdb`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128170533.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128170702.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128170851.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128171009.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128171209.png"/>

#### 格式化
3) 使用 `mkfs -t xfs /dev/sdb1` [把sdb1格式化为：xfs格式的文件系统]
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128171435.png"/>

4）创建挂载点：/home/newdisk
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128171637.png"/>

#### 挂载
5) 使用 `mount /dev/sdb1 /home/newdisk` [将sdb1分区，挂载到/home/newdisk中]
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128172131.png"/>

此时，就已经完成了，磁盘的分区、格式化、挂载了，就可以使用/home/newdisk来操作硬盘了。但是这种挂载是临时的，当我们重启之后，挂载点就会消失。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128172245.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128172634.png"/>

#### 自动挂载
6）永久性的挂载成功

通过修改/etc/fstab实现永久性挂载。添加完后，需要执行：`mount -a`即刻生效！
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128172906.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128173000.png"/>

**技巧：在正常模式下，yy+p会复制粘贴当前行！！！**

保存修改后，执行：`mount -a`,即刻生效！
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128173503.png"/>

现在，你重启后，也会自动挂载成功！！！

### 磁盘情况查询

#### 查询系统整体磁盘使用情况

基本语法：
```
df -h
```
应用实例：

查询系统整体磁盘使用情况
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128175623.png"/>

#### 查询指定目录的磁盘占用情况

基本语法
```
du -h  /目录

查询指定目录的磁盘占用情况，默认为当前目录
-s 指定目录占用大小汇总
-h 带计量单位
-a 含文件
--max-depth=1  子目录深度
-c 列出明细的同时，增加汇总值
```

应用实例：

查询 /usr目录的磁盘占用情况，深度为1。

`du  -ach  --max-depth=1  /usr`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128180112.png"/>

#### 磁盘情况-工作实用指令

1) 统计 /home 文件夹下**文件**的个数

`ls –l /home/ | grep "^-" | wc -l`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128193317.png"/>

2) 统计 /home 文件夹下**目录**的个数。

`ls –l /home/ | grep "^d" | wc -l`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128193601.png"/>

3) 统计 /home文件夹下文件的个数，包括**子文件夹**里的。

`ls –lR /home/ | grep "^-" | wc -l`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128193831.png"/>
4) 统计 /home文件夹下目录的个数，包括子文件夹里的。

`ls –lR /home/ | grep "^d" | wc -l`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128193922.png"/>

5) 以树状显示：home目录结构。[没有tree指令咋办, 使用yum 来安装]
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128194037.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day06/QQ截图20181128194147.png"/>