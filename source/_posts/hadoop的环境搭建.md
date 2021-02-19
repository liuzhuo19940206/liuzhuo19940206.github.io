---
title: hadoop的环境搭建
author: gakkij
categories:
  - hadoop
tags:
  - hadoop
img: https://img.imgdb.cn/item/602f7e41e7e43a13c67ddf13.jpg
top: false
cover: false
coverImg: https://img.imgdb.cn/item/602f7e41e7e43a13c67ddf13.jpg
toc: true
date: 2021-02-19 16:58:47
summary: hadoop的集群搭建《一》
password:
---

## hadoop的集群搭建

hadoop的集群环境，需要Linux的环境，因此，我们需要构建Linux的环境。

因此，构建至少三台hadoop的Linux环境：hadoop100、hadoop101、hadoop102、hadoop103

## 搭建Linux环境

1）下载VMware软件

这个下载，大家请自行下载。

2）修改VMware的网络配置

点击编辑，再点击虚拟网络编辑器。

![](https://img.imgdb.cn/item/602f80a1e7e43a13c67f5ac6.jpg)

点击更改设置

![](https://img.imgdb.cn/item/602f8102e7e43a13c67f8b45.jpg)

1.选择：VMnet8；2.选择NAT模式；3.取消DHCP；4.点击NAT设置

![](https://img.imgdb.cn/item/602f818fe7e43a13c67fd377.jpg)

记住网关ip

![](https://img.imgdb.cn/item/602f8227e7e43a13c6801b52.jpg)

我这里是：**192.168.233.2**

3）修改windows宿主机的VMware8网络

![](https://img.imgdb.cn/item/602f828de7e43a13c6804d41.jpg)

右键点击属性：

![](https://img.imgdb.cn/item/602f82c8e7e43a13c6806c5d.jpg)

点击：Internet协议版本4

改成静态的设置：

![](https://img.imgdb.cn/item/602f831de7e43a13c6809849.jpg)

ip地址设置成：上面查看的网关ip：192.168.233.1

首先的NDS可以通过：ipconfig /all 来查看

4）创建hadoop100的虚拟机

创建虚拟机的步骤就不详细介绍了，请看之前的文章。

创建成功后，记得生成mac地址。

![](https://img.imgdb.cn/item/602f8eace7e43a13c686662b.jpg)

点击高级：生成新的MAC地址

![](https://img.imgdb.cn/item/602f8ed8e7e43a13c6867a25.jpg)



创建成功后：

`cd /etc/sysconfig/network-scripts`

`vim ifcfg-ens33`

![](https://img.imgdb.cn/item/602f847ae7e43a13c6813dd1.jpg)

修改：

```java
  修改静态，ip地址，网关，DNS
  BOOTPROTO=static
  ONBOOT=yes

  HWADDR=00:50:56:33:9D:D8
  IPADDR=192.168.233.100
  GATEWAY=192.168.233.2
  NETMASK=255.255.255.0
  PREFIX=24
```

![](https://img.imgdb.cn/item/602f85f1e7e43a13c681f680.jpg)

修改：DNS

```
  修改DNS：vim /etc/resolv.conf
  nameserver 192.168.31.1
  nameserver 8.8.8.8 [谷歌的服务器]
  nameserver 8.8.4.4
```

![](https://img.imgdb.cn/item/602f86bfe7e43a13c6828014.jpg)

修改主机名：

```
  vim /etc/sysconfig/network
  NETWORKING=yes
  HOSTNAME=hadoop100
```

修改映射的域名：

```
  vim /etc/hosts
  192.168.233.100 hadoop100
  192.168.233.101 hadoop101
  192.168.233.102 hadoop102
  192.168.233.103 hadoop103
  192.168.233.104 hadoop104
  192.168.233.105 hadoop105
```

重启网络：

```
systemctl restart network.service
```

关闭防火墙

```
systemctl stop firewalld.service
```

查看防火墙的状态

```
systemctl status firewalld.service
```

开机关闭防火墙

```
systemctl disable firewalld.service
```

---

在windows下修改宿主机的hosts

路径：C:\Windows\System32\drivers\etc

修改host文件

```
  192.168.233.100 hadoop100
  192.168.233.101 hadoop101
  192.168.233.102 hadoop102
  192.168.233.103 hadoop103
  192.168.233.104 hadoop104
  192.168.233.105 hadoop105
```

---

windows宿主机和虚拟机中的centos7互相ping：

```
在windows下：
window + R : 输入cmd

ipconfig

ping hadoop100
```

![](https://img.imgdb.cn/item/602f8877e7e43a13c68353bf.jpg)

```
在centos7下：
打开终端：

ping windows的下的ip
```

![](https://img.imgdb.cn/item/602f8911e7e43a13c683a4d9.jpg)

ping www.baidu.com

![](https://img.imgdb.cn/item/602f894ce7e43a13c683bfd8.jpg)

---

到这里，我们的第一台centos7的环境就搭建完成了，主要是宿主机和虚拟机可以相互ping通，而且虚拟机可以联网，ping通百度的ip地址。

## 克隆虚拟机

在我们的hadoop100的虚拟机上面右键 -> 管理 -> 克隆

![](https://img.imgdb.cn/item/602f89efe7e43a13c6841f2c.jpg)

![](https://img.imgdb.cn/item/602f8a4ce7e43a13c6845176.jpg)

![](https://img.imgdb.cn/item/602f8a6ce7e43a13c6846289.jpg)

![](https://img.imgdb.cn/item/602f8aace7e43a13c6848539.jpg)

![](https://img.imgdb.cn/item/602f8b26e7e43a13c684bf54.jpg)

### 修改hadoop101

编辑hadoop101虚拟机，点击网络设配器。

点击高级，生成新的MAC地址，不能和hadoop100一样，否则会有问题！！！

![](https://img.imgdb.cn/item/602f8f44e7e43a13c686b153.jpg)

打开hadoop101虚拟机：

修改mac地址和ip地址：

![](https://img.imgdb.cn/item/602f904ae7e43a13c6871e86.jpg)

修改主机名：改写成 hadoop101

```java
  vim /etc/sysconfig/network
  NETWORKING=yes
  HOSTNAME=hadoop101
```

![](https://img.imgdb.cn/item/602f9191e7e43a13c687b0d9.jpg)

  重启网络：
  `systemctl restart network.service`

验证：宿主机和hadoop101互相ping一下；能互ping即没有问题。

---

再次克隆，创建hadoop102、hadoop103。

