---
title: Linux基础入门之网络设置
categories:
  - Linux
tags:
  - Linux
date: 2018-11-28 19:55:38
summary: Linux系统的网络设置
---

Linux系统的网络设置

## 桥接的方式

之前，我们都是使用桥接的模式来连接虚拟机与宿主机的，桥接模式的缺点，之前我们也讲过了，会占用ip地址，引发ip地址冲突！！！

好处是，内网中的**其他用户**，也可以直接访问我的虚拟机，与我们的虚拟机通信。

比如：我宿主机的ip地址是：10.6.11.123。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129100530.png"/>

使用桥接模式下的linux系统会自动帮我们，生成一个同网段下的ip地址：10.6.11.81
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129100614.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129100853.png"/>

然后，现在不管是你的宿主机ping虚拟机的ip地址，还是虚拟机ping你的宿主机的ip地址，都能成功。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129101126.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129101401.png"/>

**注意：你的同事、同学也能ping通你的虚拟机，因为你的宿主机、虚拟机、你的同事都在一个网段里面。**

下面，我使用我同学的Mac机远程登录我的虚拟机，成功：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129101910.png"/>

**坏处：如果每个人，都在虚拟机中使用桥接模式的话，那么该网段下的ip地址就会用光，某一天，当你开启你的虚拟机的linux系统时，你会听到你的同事说，又是哪个王八羔子抢了我本机的ip地址！！！**

## Nat模式

介绍：NAT网络主要作用是用于虚拟机与外网互通，它是宿主机内部的local网络，只有本主机内部可见，不能跨宿主机。

好处：虚拟机不占用其他的ip,所以不会ip冲突。

坏处：内网的其他人宿主机不能和虚拟机通讯。

### 单独使用NAT网络

1）创建NAT网络

在创建虚拟机并为其指定NAT网络时，会弹出如下图所示的界面，其中包含**网络地址转换（NAT）**与**NAT网络**两个选项，这两个选项有什么区别呢？可以这样理解，网络地址转换（NAT）为VirtualBox内置的已经创建好的NAT网络，其网段为10.0.2.0/24，**这个网络不允许用户管理**，为了直观起见，在本例中创建自己的NAT网络。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129103000.png"/>

点击菜单中的管理按键，选择全局设定，再从对话框中选择网络，然后点击界面上的加号图标，弹出NAT网络明细对话框。其中网络名称随意，网络CIDR一栏的地址不能与宿主机所属的任何一个物理网络冲突，也不能与宿主机中已经存在的其它虚拟网络冲突。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129103626.png"/>

现在，新增NAT网络：点击界面上的加号图标。

下图中，CIDR为10.6.28.0/24，VirtualBox会将10.6.28.1这个IP设置成网关，并且选中支持DHCP选择。这样就创建了网络号为10.6.28、具备DHCP功能、默认网关为10.6.28.1的NAT网络，这些功能都是Virtualbox通过一个服务进程实现的。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129104140.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129104230.png"/>

现在，将我们的centOS_7.5系统的网络模式，改为我们刚刚设置的NAT网络：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129104722.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129104802.png"/>

设置完毕后，启动我们的centOS_7.5系统。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129105404.png"/>

测试是否能上网 和 与我们的宿主机是否连通：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129105550.png"/>

**注意：前提是你的宿主机本身能联网。**

虚拟机ping宿主机成功：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129105825.png"/>

宿主机ping虚拟机超时：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129161346.png"/>

**为啥，在使用NAT的模式下，虚拟机能够访问宿主机，能够通过宿主机上网成功，而宿主机却不能连通虚拟机呢？**

在NAT模式下，virtualBox帮我们创建的一个虚拟的内部网络，使用同一个NAT网络的内部虚拟机之间可以互相访问。

测试：使用virtualBox打开另一台Linux系统并且使用相同的NAT网络。


第二台的虚拟机的ip地址是：10.6.28.7
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129162644.png"/>

第一台的虚拟机的ip应该是10.6.28.4的，但是我重启了系统，现在变成了：10.6.28.6
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129162815.png"/>

现在互相ping。

第二台虚拟机ping第一台虚拟机：（成功）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129163024.png"/>

第一台虚拟机ping第二台虚拟机：（成功）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129163353.png"/>

**说明：使用相同的NAT网络，内部的虚拟机之间是可以互相访问的！！！**

到现在还是没有解释，我们的虚拟机能够联网呢？请看下图：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129164646.png"/>

首先，VirtualBox为我们创建了一个虚拟的二层交换机，两台虚拟机中的网卡都联接在这台交换机上。同时，此交换机具备DHCP功能，管理10.6.28.0/24的地址池，它的网关地址是10.6.28.1。另外DHCP还负责管理DNS地址，这里的DNS地址的来源是宿主机，VirtualBox从宿主机拿到后设置在这里。当虚拟机启动时，DHCP服务会为它分配IP地址，设置网关，设置DNS服务器地址。

我们来查看，我们的虚拟机的DNS服务器地址与我们的宿主机的DNS服务器地址是否一致：

虚拟机的DNS服务的地址：
`cat /etc/resolv.conf ` 
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129164958.png"/>

宿主机的DNS服务器的地址：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129165117.png"/>

发现是一样的，验证了我们的理论正确！！！

其次，VirtualBox为创建了一个三层的虚拟路由器，路由器中的路由表来源于宿主机，其实是与宿主机共享路由表。同时，因为创建的是NAT网络，这个路由器除了一般的路由功能，还是一个配置了NAT功能的路由器，实现宿主机IP地址+端口号与虚拟机IP地址+端口号之间的映射，最终实现与外部网络的通信。

可以看出，已经实现了一个完整的内部网络，包括带DHCP功能的二层交换机与带NAT功能的三层路由器。

所以，我们的虚拟机能够通过宿主机来访问外网。

但是，我们的宿主机是不知道虚拟机的存在的，所以宿主机ping不通我们的虚拟机。

### NAT + Host-only 的模式

单独使用NAT网络的时候，是能很方便的连接外网的，但是宿主机与虚拟机是不能互通的，如果，我们想要互通怎么呢？

1）增加一个网卡，使用桥接的模式，宿主机与虚拟机通过桥接生成的ip地址互通。

不知道的话，请看桥接模式即可。

2）增加一个网卡，使用Host-only网络。

当你增加Host-only网络时，发现界面名称是：未指定时，需要我们自己来创建一个Host-only网卡。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129170122.png"/>

一般，我们下载完VirtualBox后，会自动生成一个Host-only网卡。默认的ip地址是：192.168.56.1

点击virtualBox的管理，然后点击主机网络管理器，新增一个网卡。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129170734.png"/>

此时，我们的宿主机上面，就会多出一个网络：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129170933.png"/>

修改我们的centOS网络，添加新的网卡（Host-only）：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129171051.png"/>

重新启动我们的centOS系统：

`ifconfig 一下：`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129171407.png"/>

此时会多出一个网卡：enp0s8：就是我们刚刚设置的Host-only网卡。

来测试是否能上网：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129171617.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129171645.png"/>

来测试，宿主机与虚拟机是否能互通：

虚拟机ping宿主机：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129171846.png"/>

宿主机ping虚拟机：

**注意：这里宿主机是ping那个Host-only生成的ip地址！！！**
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129172312.png"/>

接下来，我们使用Xshell来连接我们的虚拟机试试：

新建连接，主机写：虚拟机中的host-only生成的ip地址。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129172946.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129173102.png"/>


**总结：使用 NAT + Host-only的模式，虚拟机通过NAT来连通外网，通过Host-only来与宿主机互通。**

### 最佳方案

上面，我们已经学习了，NAT + Host-only的模式来连通外网，并且宿主机与虚拟机互通。

但是，上面的方案是DHCP的方式，即自动生成ip地址，这样的话，我们的ip会随时变动的，作为服务器的是不行的，我们需要设置静态的ip地址来作为服务器。

编辑我们的网卡配置文件：

`/etc/sysconfig/network-scripts/`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129174545.png"/>

在该目录下，应该有两个配置文件：ifcfg-enp0s3 和 ifcfg-enp0s8

**ifcfg-enp0s3：**就是NAT网络生成的ip地址

```
vim ifcfg-enp0s3
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129175402.png"/>

ifcfg-enp0s3:动态生成ip地址就行，我们主要设置ifcfg-enp0s8，改为静态分配ip地址。

```
vim ifcfg-enp0s8
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129180212.png"/>

注意上面的网关地址写错了，应该是：**192.168.69.1**！！！,不然重启网络会失败的。

保存并退出。

`systemctl restart network` : 重启我们的网络！！！

<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129191233.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129192721.png"/>

IP地址修改成功了，改成了静态配置，而且ip地址是我们自己输入的：**192.168.69.200**

如果你重启网络的时候，出现异常，请查看你的Mac地址，网关是否配置有问题！！！

现在，重新修改我们的Xshell连接的主机ip地址：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129193012.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129193144.png"/>

以后，不管我们去哪里连接虚拟机都会成功了，因为现在是静态分配的ip了，不会变了。

---

如果，我们是带有图形化界面的linux系统的话，其实可以直接图形化的方式修改ip地址。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129193541.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129193821.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129194101.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129194309.png"/>

修改完后，点击应用后，退出到网络设置页面，重新启动一下，就会更新我们的设置了！！！
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129194506.png"/>

**PS：不建议使用图形化的方式修改ip设置，我们学习，当然是以命令行为基准，图形化只是为了验证我们的配置是否正确而存在的！！！**

** NAT + Host-only的方式，是只能我们的宿主机与虚拟网络中的虚拟机互通，在该宿主机网络中的其他同事、同学是不能访问我们的虚拟机的，而桥接模式是可以的，注意两者之间的区别！！！**

## 网络设置的几个重要配置文件

### 网卡的配置文件

```
/etc/sysconfig/network-scripts/
```

有几个网卡，就应该有几个：ifcfg-enp0s3、ifcfg-enp0s8等配置文件，有几个网卡就有几个配置文件，否则重启网络会出现异常！！！

配置文件的大概内容：
```
DEVICE=enp0s3                  #接口名（设备,网卡的唯一标识，不能乱写的！！！）
HWADDR=00:0C:2x:6x:0x:xx       #MAC地址 
TYPE=Ethernet                  #网络类型（通常是Ethemet）
UUID=926a57ba-92c6-4231-bacb-f27e5e6a9f44  #网卡的唯一标识。（自动生成的，要唯一！！！）
ONBOOT=yes                     #系统启动的时候网络接口是否有效（yes/no）
# IP的配置方法[none|static|bootp|dhcp]（引导时不使用协议|静态分配IP|BOOTP协议|DHCP协议）
BOOTPROTO=static      
IPADDR=192.168.69.200          #IP地址
PREFIX=24                      #设置子网掩码
GATEWAY=192.168.69.1           #网关 
DNS1=192.168.69.1              #域名解析器
```

**PS：在centOS7之后的版本，可以在配置文件中设置多个ip地址，IPADDR0=xxx.xxx.xxx.xxx，IPADDR1=xxx.xxx.xxx.xxx，依次类推。**

**PREFIX：子网掩码也是一样的，PREFIX0，PREFIX1，与上面的ip地址对应；24：代表255.255.255.0 , 26：代表255.255.255.192**

GATEWAY:网关，可以在这里配置，也可以在 /etc/sysconfig/network中配置，如果没有在网卡配置文件中设置网关，那么/etc/sysconfig/network中的网关地址会生效。默认情况下，网卡配置文件中的网关配置会覆盖/etc/sysconfig/network中的网关设置。

### 网关的配置文件

```
/etc/sysconfig/network
```

配置文件中的内容：
```
GATEWAY=192.168.69.1
```

### 主机名的配置文件

```
/etc/hostname
```

配合文件中的内容：
```
liuzhuo01    #主机名
```

查看主机名：直接使用 hostname指令即可。

### ip和主机映射的文件

```
/etc/hosts
```

配置文件中的内容：
```
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
```

### 应用

有些时候，我们想直接ping主机名来访问，不想ping我们虚拟机的ip地址，不好记。

现在，我们尝试直接ping主机名：

<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129203255.png"/>

现在添加新的 ip 与 主机名的映射信息：
```
vim /etc/hosts
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129213529.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129213635.png"/>

这里，虚拟机自己ping自己的域名没有什么意义，我们想要在windows宿主机也能ping通虚拟机的主机名，该怎么呢？
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129214028.png"/>

修改windows下的：
```
C:\Windows\System32\drivers\etc\hosts
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129214230.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129214441.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129214543.png"/>

现在，使用Xshell的时候，创建一个新的连接，主机：填写你的虚拟机的主机名也可以连接成功。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129214732.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day07/QQ截图20181129214802.png"/>

