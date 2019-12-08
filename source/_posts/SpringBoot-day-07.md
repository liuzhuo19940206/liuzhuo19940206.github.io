---
title: SpringBoot_day_07
categories:
  - SpringBoot
  - Spring
tags:
  - SpringBoot
  - Spring
date: 2018-11-09 09:52:33
summary: 简单学习Docker的相关知识，后面会系统讲解
---

今天，学习Docker的相关知识，后续会出Docker的完整讲解教程。

## 简介

**Docker**是一个开源的应用容器引擎；是一个轻量级容器技术；

Docker支持将软件编译成一个镜像；然后在镜像中将各种软件做好配置，将镜像发布出去，其他使用者可以直接使用这个镜像；

运行中的这个镜像称为容器，容器启动是非常快速的。

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109095615.png" style="width:50%;heigth:50%"/>

---
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109095947.png"/>

## 核心概念

docker主机(Host)：安装了Docker程序的机器（Docker直接安装在操作系统之上）；

docker客户端(Client)：连接docker主机进行操作；

docker仓库(Registry)：用来保存各种打包好的软件镜像；

docker镜像(Images)：软件打包好的镜像；放在docker仓库中；

docker容器(Container)：镜像启动后的实例称为一个容器；容器是独立运行的一个或一组应用
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109100109.png"/>

使用Docker的步骤：

1）、安装Docker

2）、去Docker仓库找到这个软件对应的镜像；

3）、使用Docker运行这个镜像，这个镜像就会生成一个Docker容器；

4）、对容器的启动停止就是对软件的启动停止；

## 安装Docker

### 安装linux虚拟机

因为，以后的服务器都是部署在linux上面的，所以我们需要使用linux虚拟机来学习Docker

1）VMWare、VirtualBox（安装）。

VMWare虚拟机：比较重量级，而且是收费的，可以破解。

VirtualBox：轻量级，免费。

大家，如果没有，提供一个软件的百度云给大家。[软件安装](https://pan.baidu.com/s/1K8J6ThB1ecpDoZU5IYRGDQ)，密码：0zeo

下载之后，打开**软件**的目录：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109101823.png"/>

双击VirtualBox-5.1.26-117224-Win.exe.(安装linux虚拟机)

2）导入虚拟机文件centos7-atguigu.ova

打开虚拟机界面，点击管理：导入虚拟电脑。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109102440.png" style="width:50%"/>
**一定要 勾选重新初始化所有的网卡的MAC地址**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109102555.png" style="width:50%"/>
导入成功后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109102748.png" />

3）双击启动linux虚拟机;使用 root/ 123456登陆

会出现未能启动虚拟电脑，由于物理网卡未找到：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109103253.png" style="width:50%"/>

点击更改网络设置：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109103407.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109103712.png"/>

设置完毕后，虚拟机自动启动：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109103900.png"/>

输入用户名：root，密码：123456
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109104044.png"/>

此时，已经登入成功了。

4）使用客户端连接linux服务器进行命令操作

为了操作方便，我们可以使用linux的客户端来远程操作linux虚拟机。

安装软件目录下的：SmarTTY-2.2.msi
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109104240.png"/>

安装完毕后，启动程序：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109104615.png"/>

点击创建新的SSH连接：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109104656.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109104916.png"/>

虚拟机的ip地址：
在虚拟机中输入：
```
ip addr
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109105352.png"/>

查看本地的ip地址：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109105439.png"/>

**发现是在一个网络里面，正确！！！**

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109105639.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109105717.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181109105735.png"/>

到此，linux客户端连接成功，此时注意不要关闭linux的服务器。

### 在linux虚拟机上安装docker

首先启动虚拟机：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110095216.png"/>
输入用户名和密码：root/123456
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110095348.png"/>
查看ip地址：
`ip addr`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110095509.png"/>
ip地址没有变的话，直接使用我们的linux客户端连接：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110095639.png"/>
输入密码：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110095732.png"/>
连接成功：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110095759.png"/>

---

**现在开始在linux上安装docker。**

步骤：

1）检查虚拟机的内核版本，必须是3.10及以上
`uname ‐r`
```
[root@localhost ~]# uname -r
3.10.0-327.el7.x86_64
[root@localhost ~]# 
```
我当前的版本是：3.10.0-327.el7.x86_64

如果你的不是，那就必须升级内核：
`yum update`

2) 安装docker(必须联网)
`yum install docker`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110100256.png"/>

3）输入y确认安装
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110100405.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110101217.png"/>
**出现Complete，表示安装完成！**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110101347.png"/>

4）启动docker
`systemctl start docker`
```
[root@localhost ~]# systemctl start docker
```
查看docker的版本：
`docker -v`
```
[root@localhost ~]# docker -v
Docker version 1.13.1, build 8633870/1.13.1
```

5) linux开机就启动docker
`systemctl enable docker`
```
[root@localhost ~]# systemctl enable docker
Created symlink from /etc/systemd/system/multi-user.target.wants/docker.service to /usr/lib/systemd/system/docker.service.
```

6) 停止docker
`systemctl stop docker`

## Docker常用命令&操作

### 镜像操作
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110102850.png"/>

[官方的docker仓库](https://hub.docker.com/)

<font color="red">**如果在启动的时候，出现问题**</font>
```
[root@localhost ~]# systemctl start docker
Job for docker.service failed because the control process exited with error code. See "systemctl status docker.service" and "journa
lctl -xe" for details.
```
然后根据提示进行systemctl status docker.service，打印出相关的日志：
```

[root@localhost ~]# systemctl status docker.service
● docker.service - Docker Application Container Engine
   Loaded: loaded (/usr/lib/systemd/system/docker.service; enabled; vendor preset: disabled)
   Active: failed (Result: exit-code) since Fri 2018-04-27 21:25:13 EDT; 3min 32s ago
     Docs: http://docs.docker.com
  Process: 2390 ExecStart=/usr/bin/dockerd-current --add-runtime docker-runc=/usr/libexec/docker/docker-runc-current --default-runtime=dock
er-runc --exec-opt native.cgroupdriver=systemd --userland-proxy-path=/usr/libexec/docker/docker-proxy-current --seccomp-profile=/etc/docker
/seccomp.json $OPTIONS $DOCKER_STORAGE_OPTIONS $DOCKER_NETWORK_OPTIONS $ADD_REGISTRY $BLOCK_REGISTRY $INSECURE_REGISTRY $REGISTRIES (code=e
xited, status=1/FAILURE)
 Main PID: 2390 (code=exited, status=1/FAILURE)
 
Apr 27 21:25:12 localhost.localdomain systemd[1]: Starting Docker Application Container Engine...
Apr 27 21:25:12 localhost.localdomain dockerd-current[2390]: time="2018-04-27T21:25:12.286650644-04:00" level=warning msg="could no...ound"
Apr 27 21:25:12 localhost.localdomain dockerd-current[2390]: time="2018-04-27T21:25:12.295209148-04:00" level=info msg="libcontaine...2395"
Apr 27 21:25:13 localhost.localdomain dockerd-current[2390]: time="2018-04-27T21:25:13.310268309-04:00" level=warning msg="overlay2: the...
Apr 27 21:25:13 localhost.localdomain dockerd-current[2390]: Error starting daemon: SELinux is not supported with the overlay2 grap...alse
Apr 27 21:25:13 localhost.localdomain systemd[1]: docker.service: main process exited, code=exited, status=1/FAILURE
Apr 27 21:25:13 localhost.localdomain systemd[1]: Failed to start Docker Application Container Engine.
Apr 27 21:25:13 localhost.localdomain systemd[1]: Unit docker.service entered failed state.
Apr 27 21:25:13 localhost.localdomain systemd[1]: docker.service failed.
Hint: Some lines were ellipsized, use -l to show in full.

```

其中：`Error starting daemon: SELinux is not supported with the overlay2 grap...alse`

这是由于overlay2不支持造成的，所以我们要关闭它。

重新编辑docker配置文件：

`vi /etc/sysconfig/docker`

可以进行以下配置：

OPTIONS='--selinux-enabled**=false**  --log-driver=journald --signature-verification=false'

将--selinux-enabled后面添加 =false 即可。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110112203.png"/>

vi编辑器，使用i进入编辑状态，修改后：Esc，然后冒号：wq，保存退出。

然后进行重启操作：

`systemctl  restart  docker`

自此，Docker启动成功！

---

我们以mysql为例：

1）查询mysql的镜像：`docker search mysql`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110112521.png"/>

INDEX：代表镜像的索引

NAME：镜像的名字

DESCRIPTION：镜像的描述信息

STARS：镜像被采纳的次数

OFFICIAL：是否官方（[OK]：官方，不写：非官方）

AUTOMATED：是否自动配置（[OK]：自动配置，不写：非自动配置）

这里搜索的镜像和官方`https://hub.docker.com/`上面搜索的一样：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110112948.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110113105.png"/>

2）下载mysql镜像：`docker pull mysql`(默认下载最近的版本)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110115418.png"/>


如果下载镜像很慢，可以使用阿里云的镜像加速度：
[登入阿里云](https://cr.console.aliyun.com/cn-hangzhou/mirrors)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110115602.png"/>

将其中的加速器地址，配置到/etc/docker/daemon.json中，然后重启docker

vi /etc/docker/daemon.json
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110115926.png"/>
重启docker：systemctl restart docker
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110120138.png"/>

---

如果后面没有加tag，默认是下载最新的版本：latest。

如果想要下载其他版本，在官网上面查看自己想要下载的版本的tag：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110114140.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110114057.png"/>
比如想要下载5.6版本的mysql：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110114239.png"/>

`docker pull mysql:5.6`

3) 查看本地的镜像：`docker images`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110192115.png"/>
能发现，我们刚刚下载好的两个版本的mysql镜像

4) 删除镜像：`docker rmi image_id`

其中的image_id：镜像的唯一id.

删除mysql：5.6的镜像：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110194611.png"/>
查看剩余的镜像：（只剩下最新版本的mysql镜像）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110194728.png"/>

### 容器操作

软件镜像（QQ安装程序）----运行镜像----产生一个容器（正在运行的软件，运行的QQ）；
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110194920.png"/>
[更多命令](https://docs.docker.com/engine/reference/commandline/docker/)

现在，我们以Tomcat为例来操作演示：

1）搜索镜像
```
[root@localhost ~]# docker search tomcat
```
2) 拉取镜像
```
[root@localhost ~]# docker pull tomcat
```

3) 根据镜像启动容器(第一次启动)

`docker run ‐‐name mytomcat ‐d tomcat:latest`
```
--name:自己定义的容器名字，随便写。
-d:后台运行
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110200332.png"/>

4）查看**运行中**的容器

`docker ps`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110200655.png"/>


5) 停止运行中的容器

`docker stop  容器的id或自定义的名字`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110200858.png"/>

6) 查看所有的容器（运行或者不运行）

`docker ps ‐a`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110201121.png"/>


7) 启动（暂停的）容器

`docker start 容器id`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110201246.png"/>


8）删除一个容器

`docker rm 容器id`

注意删除镜像是 ：rmi

**而且删除容器之前，先要停止容器的运行！！！**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110201454.png"/>

9）启动一个做了端口映射的tomcat

`docker run ‐d ‐p 8888:8080 tomcat:latest`

-d：后台运行
-p：将主机的端口映射到容器中的一个端口　　主机端口：容器内部的端口


为了演示简单关闭了linux的防火墙。

service firewalld status ：查看防火墙状态

service firewalld stop：关闭防火墙

如果不映射端口号的话，启动容器，访问Tomcat的主页，是没有作用的：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110201808.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110202000.png"/>

发现无法访问Tomcat，因为我们只能访问到虚拟机上面的docker，不能直接访问到docker中的Tomcat，所以需要端口号映射。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110202325.png"/>

在浏览器中访问：`http://10.6.11.17:8888/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110202506.png"/>

Tomcat访问成功！！！

我们也可以使用一个Tomcat镜像，开启多个Tomcat容器。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110202657.png"/>
又开启了，8887和8889端口号映射的Tomcat容器。

在浏览器中输入：`http://10.6.11.17:8887/` 和 `http://10.6.11.17:8889/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110202836.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110202848.png"/>

10）查看容器的日志

`docker logs container_name/container_id`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110203052.png"/>

---

## 环境搭建

安装以后学习时，需要的镜像。

### 安装MySQL示例

```
docker pull mysql
```

错误的启动:
```
[root@localhost ~]# docker run ‐‐name mysql01 ‐d mysql
42f09819908bb72dd99ae19e792e0a5d03c48638421fa64cce5f8ba0f40f5846

mysql退出了
[root@localhost ~]# docker ps ‐a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                      PORTS          NAMES
42f09819908b        mysql               "docker‐entrypoint.sh"   34 seconds ago      Exited(1) 33 seconds ago                   mysql01

//错误日志
[root@localhost ~]# docker logs 42f09819908b
error: database is uninitialized and password option is not specified
  You need to specify one of MYSQL_ROOT_PASSWORD, MYSQL_ALLOW_EMPTY_PASSWORD and
MYSQL_RANDOM_ROOT_PASSWORD；这个三个参数必须指定一个

```

查看官网：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110205133.png"/>


正确的启动：
```
[root@localhost ~]# docker run ‐‐name mysql01 ‐e MYSQL_ROOT_PASSWORD=123456 ‐d mysql
b874c56bec49fb43024b3805ab51e9097da779f2f572c22c695305dedd684c5f
[root@localhost ~]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS             PORTS               NAMES
b874c56bec49        mysql               "docker‐entrypoint.sh"   4 seconds ago       Up 3seconds        3306/tcp            mysql01
```

打开mysql的客户端（navicat）：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110205647.png"/>
点击：连接测试：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110205718.png"/>

这是因为，我们没有做端口号映射：(‐p 3306:3306)
```
[root@localhost ~]# docker run ‐p 3306:3306 ‐‐name mysql02 ‐e MYSQL_ROOT_PASSWORD=123456 ‐d mysql
ad10e4bc5c6a0f61cbad43898de71d366117d120e39db651844c0e73863b9434
[root@localhost ~]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS             PORTS                    NAMES
ad10e4bc5c6a        mysql               "docker‐entrypoint.sh"   4 seconds ago       Up 2seconds        0.0.0.0:3306‐>3306/tcp   mysql02
```

这里将虚拟机linux的3306端口映射到docker容器的3306端口。

再次尝试：mysql的客户端打开，连接我们的mysql。

如果你是mysql安装的是8.0以上的版本：会出现2059 - authentication plugin 'caching_sha2_password' -navicat连接异常。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110213957.png"/>

这个错误的原因是由于MySQL8.0之后的加密规则为caching_sha2_password.而在此之前的加密规则为mysql_native_password。

可以将加密规则改成mysql_native_password来。

解决方案：

1）进入mysql容器
```
docker exec -it 容器的id或容器的名字 /bin/bash
```
必须在mysql启动的时候：输入上面的命令。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110214454.png"/>

2）进入mysql：
```
mysql -u用户名 -p密码

比如：
mysql -uroot -p123456
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110214906.png"/>

3）修改密码的加密方式：
```
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'password';

这里的password：写你自己想要定制的密码：

比如：
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110215258.png"/>


4）执行命令flush privileges使权限配置项立即生效
```
flush privileges;
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110215401.png"/>

以上就修改密码的加密方式。

---

再次测试我们的mysql客户端连接：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day07/QQ截图20181110215450.png"/>

现在退出我们的容器：
使用：Ctrl+p+q

---

几个其他的高级操作：(官网上面都有介绍)
```
docker run ‐‐name mysql03 ‐v /conf/mysql:/etc/mysql/conf.d ‐e MYSQL_ROOT_PASSWORD=my‐secret‐pw ‐d mysql:tag

把主机的/conf/mysql文件夹挂载到  mysqldocker容器的/etc/mysql/conf.d文件夹里面
该mysql的配置文件就只需要把mysql配置文件放在自定义的文件夹下（/conf/mysql）

docker run ‐‐name some‐mysql ‐e MYSQL_ROOT_PASSWORD=my‐secret‐pw ‐d mysql:tag ‐‐character‐set‐
server=utf8mb4 ‐‐collation‐server=utf8mb4_unicode_ci
指定mysql的一些配置参数：utf-8的编码
```

### 安装redis

自行完成

### 安装rabbitmq

自行完成

### 安装elasticsearch

自行完成