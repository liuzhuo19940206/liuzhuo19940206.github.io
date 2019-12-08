---
title: Linux基础入门之进程管理
categories:
  - Linux
tags:
  - Linux
date: 2018-11-30 13:04:41
summary: Linux系统的进程管理
---

Linux系统的进程管理（重点！！！）

## 基本介绍

1）在Linux系统中，每个执行的程序（代码）都称为一个进程。每一个进程都分配一个ID号。

2）一个进程，都会对应一个父进程，而这个父进程可以复制多个子进程。例如www服务器。

3）每个进程都可能以两种方式存在的: <font color="red">前台 与 后台</font>，所谓**前台进程**就是用户目前的屏幕上可以进行操作的 ; **后台进程**则是实际在操作，但由于屏幕上无法看到的进程，通常使用后台方式执行 [sshd , crond]。

4）一般系统的服务都是以后台进程的方式存在，而且都会常驻在系统中。直到关机才会结束。

## 显示系统执行的进程

### ps基本介绍

ps命令是用来查看目前系统中，有哪些正在执行，以及它们执行的状况。（可以不加任何参数）

```
ps -a：显示当前终端的所有进程信息
ps -u：以用户的格式显示进程的信息
ps -x：显示后台进程运行的参数

一般使用：
ps -aux
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130132958.png"/>

如果太多，看不过来的话，使用：| more。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130133124.png"/>

### ps详解

1）指令：ps –aux | grep xxx ，比如我要看有没有sshd服务。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130133333.png"/>

2）指令说明
```
System V展示风格

USER：用户名称 
PID： 进程号 
%CPU：进程占用CPU的百分比 
%MEM：进程占用物理内存的百分比 
VSZ： 进程占用的虚拟内存大小（单位：KB） 
RSS： 进程占用的物理内存大小（单位：KB） 
TTY： 终端名称,缩写.

STAT：进程状态。
其中S-睡眠，s-表示该进程是会话的先导进程，N-表示进程拥有比普通优先级更低的优先级
R-正在运行，D-短期等待，Z-僵死进程，T-被跟踪或者被停止等等。

STARTED：进程的启动时间 
TIME：   占用CPU的时间，即进程使用CPU的总时间 
COMMAND：启动进程所用的命令和参数，如果过长会被截断显示

```

### 查看父进程

```
ps -ef：是以全格式显示当前所有的进程

-e：显示所有进程
-f：全格式
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130133917.png"/>

1）查找特定指令的父进程id：`ps -ef | grep xxx`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130134150.png"/>

2) 详细介绍
```
是BSD风格

UID： 用户的名字 
PID： 进程ID 
PPID：父进程ID 
C：   CPU用于计算执行优先级的因子。数值越大，表明进程是CPU密集型运算，执行优先级会降低；数值越小，表明进程是I/O密集型运算，执行优先级会提高 
STIME：进程启动的时间 
TTY：  完整的终端名称 
TIME： CPU时间 
CMD：  启动进程所用的命令和参数

```

## 终止进程kill和killall

### 介绍

若是某个进程执行一半需要停止时，或是已消了很大的系统资源时，此时可以考虑停止该进程。使用kill命令来完成此项任务。

### 基本语法
```
kill  [选项] 进程号（功能描述：通过进程号杀死进程 -9 强制终止）

killall 进程名称	（功能描述：通过进程名称杀死进程，也支持通配符，这在系统因负载过大而变得很慢时很有用）

常用选项：

-9： 表示强迫进程立即停止
-2： 表示结束进程，但不是强制性的。常用的Ctrl+c就是：kill -2 的意思。
-15：表示正常结束进程，是kill的默认选项。
```

### 最佳实践

案例1：踢掉某个非法登录用户

现在使用另一个用户登入我们的linux系统，假装是非法用户，我这里使用的是liuzhuo用户：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130142114.png"/>

现在查看liuzhuo用户的进程id，首先我们要知道进程的服务名字，因为是使用Xshell登入的，所以是sshd服务。

`ps -aux | grep sshd`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130142341.png"/>

`kill 3519` (liuzhuo用户的pid)
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130142618.png"/>


案例2: 终止远程登录服务sshd, 在适当时候再次重启sshd服务。

有些时候，我们的linux系统的管理员需要自己执行一些操作，不让远程用户登入，所以有这样的情况，杀死sshd服务。不再让远程登入用户！

首先找到sshd服务的pid：
`ps -aux | grep sshd`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130142943.png"/>

`kill 1110` （sshd的pid）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130143119.png"/>

现在就只存在root用户了，其他用户想要远程登入linux系统是不能通过的：

我使用liuzhuo用户登入linux系统：失败
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130143309.png"/>

案例3: 终止多个gedit 编辑器。

kill pid：每次只能杀死一个进程，不能杀死多个进程，有些时候，我们需要一次性杀死多个进程，这个时候就需要使用：
killall指令了。

`killall 进程名`（注意是进程名，不是进程id）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130143851.png"/>

现在，我们一次性杀死多个gedit进程。执行：`killall gedit`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130144200.png"/>


案例4：强制杀掉一个终端  (对于:bash)

对于某些重要的进程，直接使用 kill 指令是杀不死的，需要带上参数： -9 ，强制杀死进程。

终端就是一个重要的进程。

打开两个终端，隔一段时间，否则无法区分开来的。

在第二个终端中输入：`ps -aux | grep bash`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130144752.png"/>

杀死第一个终端：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130144934.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130145124.png"/>

## 查看进程树pstree

### 基本语法
```
pstree [选项] (可以更加直观的来看进程信息)

常用选项：
-p :显示进程的PID
-u :显示进程的所属用户
```

### 应用实例

案例1：请用树状的形式显示进程的pid

`pstree -p`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130145605.png"/>

案例2：请用树状的形式显示进程的用户id

`pstree –u`:只显示进程名，并且 合并进程名一样的进程
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130145944.png"/>

`pstree -pu`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130150036.png"/>


## 服务(service)管理

### 介绍

服务(service) 本质就是进程，但是是运行在<font color="red">**后台**</font>的，通常都会监听某个端口，等待其它程序的请求，比如(mysql , sshd , 防火墙等)，因此我们又称为**守护进程**，是Linux中非常重要的知识点。

### service管理指令

service  服务名 [start | stop | restart | reload | status]

在CentOS7.0后 不再使用 service , 而是 systemctl.

systemctl [start | stop | restart | reload | status] 服务名

centOS/RHEL6 系统中 System V init命令 与 centOS/RHEL7 系统中 Systemctl命令的对比:
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130155106.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130155127.png"/>



### 使用案例

1) 查看当前防火墙的状况，关闭防火墙和重启防火墙。

```
centOS6/RHEL6:
service iptables start           # 启动
service iptables stop            # 关闭
service iptables restart         # 重启
service iptables status          # 查看防火墙的状态
chkconfig iptables on            # 开机启动
chkconfig iptables off           # 取消开机启动
--------------------- 
centOS7/RHEL7:
systemctl start firewalld          # 启动
systemctl stop firewalld           # 关闭
systemctl restart firewalld        # 重启
systemctl status firewalld         # 查看防火墙的状态
systemctl enable firewalld         # 开机启动
systemctl disable firewalld        # 取消开机启动

firewall-cmd --list-all            #查看防火墙规则
--------------------- 
```

`service iptables status`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130153438.png"/>

在CentOS7 或 RHEL7 或 Fedora 中 防火墙由** firewalld **来管理.

`systemctl status firewalld`：查看防火墙状态
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130160617.png"/>

`systemctl stop firewalld` : 关闭防火墙
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130161040.png"/>

`systemctl restart firewalld`：重启防火墙
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130161200.png"/>

---

### CentOS切换为iptables防火墙

切换到iptables首先应该关掉默认的firewalld，然后安装iptables服务。

1）关闭firewall

```
systemctl stop firewalld          # 关闭
systemctl disable firewalld       # 取消开机启动
```

2) 安装iptables防火墙

```
yum install iptables-services #安装
```

3) 编辑iptables防火墙配置
```
vi /etc/sysconfig/iptables
```

下边是一个完整的配置文件：
```
Firewall configuration written by system-config-firewall

Manual customization of this file is not recommended.

*filter

:INPUT ACCEPT [0:0]

:FORWARD ACCEPT [0:0]

:OUTPUT ACCEPT [0:0]

-A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

-A INPUT -p icmp -j ACCEPT

-A INPUT -i lo -j ACCEPT

-A INPUT -m state --state NEW -m tcp -p tcp --dport 22 -j ACCEPT

-A INPUT -m state --state NEW -m tcp -p tcp --dport 80 -j ACCEPT

-A INPUT -m state --state NEW -m tcp -p tcp --dport 3306 -j ACCEPT

-A INPUT -j REJECT --reject-with icmp-host-prohibited

-A FORWARD -j REJECT --reject-with icmp-host-prohibited

COMMIT

```

4）:wq! #保存退出

```
service iptables start    #开启防火墙
systemctl enable iptables #设置防火墙开机启动
```

**细节：可以在windows宿主机中，使用 telnet 测试某个端口是否开启。**

### 查看系统中的服务

方式一：使用setup -> 系统服务 就可以看到。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130163538.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130163606.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130163652.png"/>

服务名前面带有*的，就是开机自启动的：使用空格键来切换是否开启启动，Tab键来切换到确定和取消按钮。

方式二:   systemctl list-unit-files --type=service

`systemctl list-unit-files --type=service` : 列出系统有哪些服务
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130164926.png"/>

### 服务的运行级别(runlevel)

**查看或者修改默认级别：  vi /etc/inittab **

```
Linux系统有7种运行级别(runlevel)：常用的是级别3和5

运行级别0：系统停机状态，系统默认运行级别不能设为0，否则不能正常启动
运行级别1：单用户工作状态，root权限，用于系统维护，禁止远程登陆
运行级别2：多用户状态(没有NFS)，不支持网络
运行级别3：完全的多用户状态(有NFS)，登陆后进入控制台命令行模式
运行级别4：系统未使用，保留
运行级别5：X11控制台，登陆后进入图形GUI模式
运行级别6：系统正常关闭并重启，默认运行级别不能设为6，否则不能正常启动

```

CentOS 7 之前的版本是通过 /etc/inittab 文件来定义系统运行级别:

```
# inittab is only used by upstart for the default runlevel.
#
# ADDING OTHER CONFIGURATION HERE WILL HAVE NO EFFECT ON YOUR SYSTEM.
#
# System initialization is started by /etc/init/rcS.conf
#
# Individual runlevels are started by /etc/init/rc.conf
#
# Ctrl-Alt-Delete is handled by /etc/init/control-alt-delete.conf
#
# Terminal gettys are handled by /etc/init/tty.conf and /etc/init/serial.conf,
# with configuration in /etc/sysconfig/init.
#
# For information on how to write upstart event handlers, or how
# upstart works, see init(5), init(8), and initctl(8).
#
# Default runlevel. The runlevels used are:
#   0 - halt (Do NOT set initdefault to this)
#   1 - Single user mode
#   2 - Multiuser, without NFS (The same as 3, if you do not have networking)
#   3 - Full multiuser mode
#   4 - unused
#   5 - X11
#   6 - reboot (Do NOT set initdefault to this)
# 
id:5:initdefault:   #这里的数字：5就代表的是运行级别为5。修改成3后，就是多用户命令行的运行级别了。
```

CentOS 7 版本不再使用该文件定义系统运行级别,相关运行级别设置无效:
```
# inittab is no longer used when using systemd.
#
# ADDING CONFIGURATION HERE WILL HAVE NO EFFECT ON YOUR SYSTEM.
#
# Ctrl-Alt-Delete is handled by /etc/systemd/system/ctrl-alt-del.target
#
# systemd uses 'targets' instead of runlevels. By default, there are two main targets:
#
# multi-user.target: analogous to runlevel 3
# graphical.target: analogous to runlevel 5
#
# To set a default target, run:
#
# ln -sf /lib/systemd/system/<target name>.target /etc/systemd/system/default.target
#
id:3:initdefault:  #无效,不要在这个配置文件中写这行代码！！！
```
新版本的运行级别都定义在 `/lib/systemd/system`下:
```
[root@liuzhuo01 ~]# ls -ltr /lib/systemd/system/runlevel*
lrwxrwxrwx. 1 root root 15 11月 27 16:37 /lib/systemd/system/runlevel0.target -> poweroff.target
lrwxrwxrwx. 1 root root 13 11月 27 16:37 /lib/systemd/system/runlevel1.target -> rescue.target
lrwxrwxrwx. 1 root root 17 11月 27 16:37 /lib/systemd/system/runlevel2.target -> multi-user.target
lrwxrwxrwx. 1 root root 17 11月 27 16:37 /lib/systemd/system/runlevel3.target -> multi-user.target
lrwxrwxrwx. 1 root root 17 11月 27 16:37 /lib/systemd/system/runlevel4.target -> multi-user.target
lrwxrwxrwx. 1 root root 16 11月 27 16:37 /lib/systemd/system/runlevel5.target -> graphical.target
lrwxrwxrwx. 1 root root 13 11月 27 16:37 /lib/systemd/system/runlevel6.target -> reboot.target
```
新版本的默认运行级别定义在：`/etc/systemd/system/default.target`
```
[root@liuzhuo01 ~]# ls -l /etc/systemd/system/default.target
lrwxrwxrwx. 1 root root 36 11月 27 16:50 /etc/systemd/system/default.target -> /lib/systemd/system/graphical.target

```

可以针对不同需要设置不同的运行级别:

如设置命令行级别(init 3)方法:
```
ln -sf /lib/systemd/system/runlevel3.target /etc/systemd/system/default.target
或
ln -sf /lib/systemd/system/multi-user.target /etc/systemd/system/default.target
或
systemctl set-default multi-user.target
```

设置窗口级别(init 5)方法:
```
ln -sf /lib/systemd/system/runlevel5.target /etc/systemd/system/default.target
或
ln -sf /lib/systemd/system/graphical.target /etc/systemd/system/default.target
或
systemctl set-default graphical.target
```

### chkconfig指令

#### 介绍:

通过chkconfig 命令 可以给**每个服务**的**各个运行级别** 设置自启动/关闭 （**centOS7之前的版本使用的指令！！！**）

#### 基本语法:
```
1） chkconfig  --list                         #查看所有的服务
2)  chkconfig  --list | grep 服务名           #查看指定的服务   
3)  chkconfig   服务名   --list               #查看指定的服务
4） chkconfig   服务名   on/off               #在所有级别，开启或关闭，指定的服务
    iptables 彻底关闭  ：chkconfig  iptables off  [不管是哪个级别都关闭]
5)  chkconfig  --level  5   服务名   on/off   #指定某个级别，开启或关闭，指定的服务、
    sshd 服务在 1 运行级别 关闭 ： chkconfig --level 1 sshd off
```

#### 应用实例

1) 案例1： 请显示当前系统所有服务的各个运行级别的运行状态

`chkconfig --list`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130171923.png"/>

2) 案例2 ：请查看sshd服务的运行状态

`chkconfig sshd --list` 或者 `chkconfig --list | grep sshd`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130172752.png"/>


3) 案例3： 将sshd 服务在运行级别5下设置为不自动启动，看看有什么效果？

`chkconfig –level 5 sshd off`

4) 案例4： 当运行级别为5时，关闭防火墙。

`chkconfig –level 5 iptables off`

5) 案例5： 在所有运行级别下，关闭防火墙

`chkconfig iptables off`

6) 案例6： 在所有运行级别下，开启防火墙

`chkconfig  iptables on`

#### 使用细节

chkconfig重新设置服务后自启动或关闭，重启机器才会按设置的状态运行。

## 动态监控进程

### 介绍

top与ps命令很相似。它们都用来显示正在执行的进程。top与ps最大的不同之处，在于top在执行一段时间可以更新正在运行的的进程(默认每3秒变化一次)。

### 基本语法
```
top [选项]

选项说明:
-d 秒数	        ：指定top命令每隔几秒更新。默认是3秒在top命令的交互模式当中可以执行的命令。
-i 		：使用top不显示任何闲置 或者 僵死的进程。
-p		：通过指定监控进程的id来仅仅监控某个进程的状态。
```

### 交互操作说明
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130173701.png"/>

### 应用实例

案例1.如何监视特定用户

top：输入此命令，按回车键，查看执行的进程。（默认3秒刷新一次）

<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130174826.png"/>

```
1）统计信息
top -
17:48:19 :表示当前的系统时间
up 4:20  ：表示系统已经启动的时间（4小时20分钟）
2 user   ：当前登录系统的用户数
load average：表示系统的平均负载，3个数字分别表示1分钟、5分钟、15分钟到现在的系统平均负载值

Tasks：
227 total：表示进程的总数
1 running：正在运行的进程数
226 sleeping：处于休眠状态的进程数
0 stopped：停止的进程数
0 zombie：僵死的进程数

%Cpu(s)：
0.0 us：表示用户进程占用CPU的百分比
0.3 sy：系统进程占用CPU的百分比
0.0 ni：用户进程空间的内改变过优先级的进程占用CPU的百分比
99.7 id：空闲CPU的百分比
0.0 wa：等待输入、输出的进程占用CPU的百分比

KiB Mem：
4046020 total：系统的物理内存大小
1950468 free：目前空余内存大小
882624 userd：已经使用的物理内存大小
1212928 buff/cache：用作内核缓冲区的内存大小

KiB Swap：
8388604 total：交换分区的内存大小
8388604 free：交换分区空闲的内存大小
0 used：交换分区已经使用的内存大小

2）进程信息区
PID：进程的ID
USER：进程所有者的用户名
PR：进程的优先级
NI：nice值。负值表示高优先级，正值表示低优先级
VIRT：进程使用的虚拟内存总量，单位KB
SHR：进程使用的、未被换出的物理内存大小，单位KB
S：进程的状态，D-表示不可中断的睡眠状态，R-表示正在运行的状态，S-表示睡眠的状态，T-表示跟踪/停止，Z-表示僵死进程
%CPU：上次更新到现在的CPU时间占用百分比
%MEM：进程占用物理内存的百分比
TIME+：进程总计使用的CPU时间，单位为1/100秒
COMMAND：正在运行进程的命令名或者命令路径
```

u：然后输入“u”回车，再输入用户名，即可。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130181001.png"/>

案例2：如何终止指定的进程。

top：输入此命令，按回车键，查看执行的进程。
k：然后输入“k”回车，再输入要结束的进程ID号
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130181123.png"/>

案例3:指定系统状态更新的时间(每隔10秒自动更新)：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130181215.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130181233.png"/>

## 监控网络状态

### 基本介绍

查看系统网络情况netstat

### 基本语法
```
netstat [选项]

选项说明 
-an：按一定顺序排列输出
-p ：显示哪个进程在调用
-r ：显示路由表的信息
```

### 应用案例 

1）查看所有服务的监听端口

`netstat -anp | more`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130190225.png"/>


2) 查看服务名为 sshd 的服务的信息。

`netstat -anp | grep sshd`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130190558.png"/>

3) 查看路由表的信息

`netstat -r`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130190707.png"/>
`netstat -rn`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130190838.png"/>

`route -n`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day08/QQ截图20181130190948.png"/>