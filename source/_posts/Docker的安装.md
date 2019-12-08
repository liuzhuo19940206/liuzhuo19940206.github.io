---
title: Docker的安装
categories:
  - docker
  - 容器
tags:
  - docker
  - 容器
date: 2019-01-09 16:39:46
summary: docker的安装
---

本篇讲解docker的安装

## Docker安装前提说明

<font color="blue">CentOS Docker 安装：</font>

Docker支持以下的CentOS版本：
CentOS 7 (64-bit)
CentOS 6.5 (64-bit) 或更高的版本

**前提条件**

目前，CentOS 仅发行版本中的内核支持 Docker。
Docker 运行在 CentOS 7 上，要求系统为64位、系统内核版本为 3.10 以上。
Docker 运行在 CentOS-6.5 或更高的版本的 CentOS 上，要求系统为64位、系统**内核版本为 2.6.32-431** 或者更高版本。

**查看自己的内核**

uname命令用于打印当前系统相关信息（**内核版本号**、硬件架构、主机名称和操作系统类型等）。

<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109164948.png"/>

查看已安装的CentOS版本信息
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109165254.png"/>

## Docker的基本组成

Docker的架构图：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109165533.png" style="width:50%"/>

### 镜像

Docker 镜像（Image）就是一个只读的模板。**镜像可以用来创建 Docker 容器，一个镜像可以创建很多容器。**
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109165653.png"/>

### 容器

Docker 利用容器（Container）独立运行的一个或一组应用。**`容器是用镜像创建的运行实例。`**

它可以被启动、开始、停止、删除。每个容器都是相互隔离的、保证安全的平台。

<font color="red"><i>**可以把容器看做是一个简易版的 Linux 环境**</i></font>（包括root用户权限、进程空间、用户空间和网络空间等）和运行在其中的应用程序。

容器的定义和镜像几乎一模一样，也是一堆层的统一视角，**唯一区别在于容器的最上面那一层是可读可写的。**

### 仓库

仓库（Repository）是<font color="red"> 集中存放镜像文件的场所</font>。

仓库(Repository)和仓库注册服务器（Registry）是有区别的。仓库注册服务器上往往存放着多个仓库，每个仓库中又包含了多个镜像，每个镜像有不同的标签（tag）。

仓库分为 公开仓库（Public）和 私有仓库（Private）两种形式。

最大的公开仓库是 Docker Hub `(https://hub.docker.com/)` , 存放了数量庞大的镜像供用户下载。

国内的公开仓库包括：**阿里云 、网易云** 等。

### 总结

需要正确的理解：仓储 / 镜像 / 容器 这几个概念:

Docker 本身是一个容器运行载体或称之为**管理引擎**。我们把应用程序和配置依赖打包好形成一个可交付的运行环境，这个打包好的运行环境就似乎 image镜像文件。只有通过这个镜像文件才能生成 Docker 容器。image 文件可以看作是容器的模板。Docker 根据 image 文件生成容器的实例。同一个 image 文件，可以生成多个同时运行的容器实例。

* image 文件生成的容器实例，本身也是一个文件，称为镜像文件。

* 一个容器运行一种服务，当我们需要的时候，就可以通过docker客户端创建一个对应的运行实例，也就是我们的容器

* 至于仓储，就是放了一堆镜像的地方，我们可以把镜像发布到仓储中，需要的时候从仓储中拉下来就可以了。


## Docker的安装步骤

### CentOS6.8安装Docker

1.`yum install -y epel-release`

Docker使用EPEL发布，RHEL系的OS首先要确保已经持有EPEL仓库，否则先检查OS的版本，然后安装相应的EPEL包。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109172137.png"/>

2.`yum install -y docker-io`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109172251.png"/>

3.`检测docker的配置文件`

`/etc/sysconfig/docker`:该文件是否存在
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109172409.png"/>

4.`启动Docker后台服务`

<font color="red">**service docker start**</font>（开机启动docker服务）

5.`docker version验证`

<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109172603.png"/>

以上五个步骤就是：centOS:6.8的安装docker的步骤。

---

### CentOS7安装Docker

1.请看官方手册：https://docs.docker.com/install/linux/docker-ce/centos/

<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109173019.png"/>

看上图，我们能知道，docker有社区版和企业版，社区版是免费的，如果你的公司有钱，那你就下载企业版，这里，我下载的是社区版的docker。

**如果大家英文不好的话，这里有中文版的安装手册：**

https://docs.docker-cn.com/engine/installation/linux/docker-ce/centos/#prerequisites

2.确定你的CentOS的版本是否是7以及以上

`cat /etc/redhat-release`

3.yum安装gcc相关

* CentOS7能上外网

* yum -y install gcc

* yum -y install gcc-c++
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109173704.png"/>

4.卸载旧版本

方法一：`yum -y remove docker docker-common docker-selinux docker-engine`

方法二：查看官网删除

```
$ sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine
```

如果 yum 报告未安装任何这些软件包，这表示情况正常。

将保留 /var/lib/docker/ 的内容，包括镜像、容器、存储卷和网络。Docker CE 软件包现在称为 docker-ce。

5.安装需要的软件包

`yum install -y yum-utils device-mapper-persistent-data lvm2`

6.设置stable镜像仓库

方式一：官网上面：

`yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo`

```
如果出现报错：（请使用方法二）

1   [Errno 14] curl#35 - TCP connection reset by peer
 
2   [Errno 12] curl#35 - Timeout
```

方式二：推荐：

`yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo`

7.更新yum软件包索引

`yum makecache fast`

如果这是自添加 Docker 镜像仓库以来您首次刷新软件包索引，系统将提示您接受 GPG 密钥，并且将显示此密钥的指纹。验证指纹是否正确，并且在正确的情况下接受此密钥。指纹应匹配 060A 61C5 1B55 8A7F 742B 77AA C52F EB6B 621E 9F35。

8.安装DOCKER CE

`yum -y install docker-ce`

该命令是安装最新版本的，在生产系统中，您应该安装特定版本的 Docker CE，而不是始终使用最新版本。列出可用版本。
```
注：此 yum list 命令仅显示二进制软件包。如果还需要显示 源软件包，请从软件包名称中省略 .x86_64。

$ yum list docker-ce.x86_64  --showduplicates | sort -r

docker-ce.x86_64  17.06.0.el7                               docker-ce-stable  

使用下面的命令，安装指定的版本：

$ sudo yum install docker-ce-<VERSION>
```

9.启动docker

`systemctl start docker` (注意CentOS7 与 CentOS6 系列的启动命令不一样了)

10.测试

`docker version`

<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109181449.png"/>

11.配置镜像加速
```
1.  mkdir -p /etc/docker

2.  vim  /etc/docker/daemon.json

#网易云
{"registry-mirrors": ["http://hub-mirror.c.163.com"] }
 
 
#阿里云
{
  "registry-mirrors": ["https://｛自已的编码｝.mirror.aliyuncs.com"]
}

注意上面的配置，不要加上 #网易云 和 #阿里云。在配置文件中，直接写入文字下面的花括号里面的内容即可！！！

配置一个加速器就行，推荐阿里云加速度

阿里云的编码，从阿里云的容器镜像服务里面找即可。

3.  systemctl daemon-reload

4.  systemctl restart docker

```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109183932.png"/>


12.卸载

```
1.   systemctl stop docker 

2.   yum -y remove docker-ce

3.   rm -rf /var/lib/docker
```

---

## 永远的hello-world

在我们实际开发中，如果是使用dicker-hub的话，会很慢，因为是国外的网站，所以为了方便开发，一般会使用国内的镜像加速地址。

国内属于：阿里云 与 网易云 镜像加速比较好，现在来详细说明两者的配置。

### 阿里云镜像加速

1.打开阿里云的官网：https://dev.aliyun.com/search.html
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109194448.png"/>

2.注册一个属于自己的阿里云账户（可复用淘宝账户）

3.获取加速器地址连接

登入阿里云，进入控制台：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109194804.png"/>

找到容器镜像服务：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109195001.png"/>

点击左侧的容器镜像服务：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109195201.png"/>

---
#### CentOS6的系统镜像加速配置
如果你是**CentOS6的系统**，当你安装好docker之后，docker的配置**文件**是在：`/etc/sysconfig/docker`

`vim /etc/sysconfig/docker`

将获得的自己账户下的阿里云加速地址配置进

`other_args="--registry-mirror=https://你自己的账号加速信息.mirror.aliyuncs.com"`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109195423.png"/>

配置成功后，重新启动docker的后台服务：`service docker restart`

检查Linux 系统下配置完加速器需要检查是否生效：

如果从结果中看到了配置的`--registry-mirror`参数说明配置成功，如下所示:

`ps -ef|grep docker`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109195724.png"/>

---
#### CentOS7的系统镜像加速配置
如果你是**CentOS7的系统**，当你安装好docker之后，docker的配置文件**目录**是在：`/etc/docker`

在该目录下，创建一个新的文件：daemon.json文件。

`mkdir -p /etc/docker`

将该文件中，输入：
```
{
  "registry-mirrors": ["https://你的加速编码.mirror.aliyuncs.com"]
}
```

配置成功后，重启加速配置文件：

`systemctl daemon-reload`

重新启动docker后台服务：

`systemctl restart docker`

### 网易云镜像加速

网易云的镜像加速配置 与 阿里云镜像加速配置一样，只是加速地址变了。

只要把其中的加速地址换成：`http://hub-mirror.c.163.com` 即可。

例如：
```
{
 "registry-mirrors": ["http://hub-mirror.c.163.com"]
}
```

**一般推荐：阿里云的镜像加速配置。**

### 不使用国内镜像加速

还可以不使用国内镜像加速的方法，在国内有一个镜像加速下载的网站：https://www.docker-cn.com/registry-mirror
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190110134356.png"/>

按照网站上面的说明，当pull镜像的时候：

`$ docker pull registry.docker-cn.com/myname/myrepo:mytag`

例如：拉取ubuntu:16.04 （tag为16.04）

`$ docker pull registry.docker-cn.com/library/ubuntu:16.04`

意思就是：当pull的时候，加上前缀：`registry.docker-cn.com/library/` 即可。

### 牛刀小试

启动Docker后台容器(测试运行 hello-world)

`docker run hello-world`

<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109201836.png"/>

输出这段提示以后，hello world 就会停止运行，容器自动终止。

这个run干了什么呢？
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109202054.png"/>

因为我们配置了阿里云镜像，所以当本地找不到镜像的时候，会去阿里云镜像找，而不是去docker hub中找相关的镜像！！！

### 底层原理

#### docker是怎么工作的

docker是一个Client-Server结构的系统，Docker守护进程运行在主机上， 然后通过Socket连接从客户端访问，守护进程从客户端接受命令并管理运行在主机上的容器。 **容器，是一个运行时环境，就是我们前面说到的集装箱。**
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109203549.png"/>

#### 为什么Docker比较比VM快

(1) docker有着比虚拟机更少的抽象层。由于docker不需要**Hypervisor**实现硬件资源虚拟化,运行在docker容器上的程序直接使用的都是实际物理机的硬件资源。因此在CPU、内存利用率上docker将会在效率上有明显优势。

(2) docker利用的是宿主机的内核,而不需要Guest OS。因此,当新建一个容器时,docker不需要和虚拟机一样重新加载一个操作系统内核。然而避免了引寻、加载操作系统内核这个比较费时费资源的过程,当新建一个虚拟机时,虚拟机软件需要加载Guest OS,所以新建过程是分钟级别的。而docker由于直接利用宿主机的操作系统,则省略了这个过程,因此新建一个docker容器只需要几秒钟。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109204013.png" style="width:50%"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day02/QQ截图20190109204054.png" style="width:50%"/>
