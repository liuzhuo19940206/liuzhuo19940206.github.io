---
title: Rabbitmq的安装与入门
author: gakkij
categories:
  - Rabbitmq
  - 消息中间件
tags:
  - Rabbitmq
  - 消息中间件
toc: true
date: 2019-04-28 14:53:01
summary: Rabbitmq的安装与入门
---

今天，我们来学习Rabbitmq的安装与入门。

---

一般情况下，Rabbitmq都是安装在linux系统中，所以，这里我也是以linux系统为主来讲解。

如果，大家想安装在windows上面，可以查看Rabbitmq的官网。

### Rabbitmq的下载

主要分为：以下四个步骤

1）查看Rabbitmq的官网信息

2）提前准备：安装Linux必要依赖包

3）下载Rabbitmq必须的安装包

4）修改配置文件

---

学习一门技术之前，我们首先需要到官网上面，来查看官方的信息：www.rabbitmq.com

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/20190428150300.png"/>

我们能看到，目前Rabbitmq的最新版本为：3.7.14

也能发现Rabbitmq版本的更新很快，但是，我们一般不用最新的Rabbitmq版本，使用**Rabbitmq 3.6.x**即可。

Rabbitmq 3.6.x 是目前最稳定的版本，互联网大厂一般也是用这个版本，所以，大家目前就使用这个版本就行。

---

这里，我使用的是3.6.5的版本：

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428151551.png"/>

点击：**downloads page**

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428151752.png"/>

能看到Rabbitmq支持多个操作系统，我这里主要使用Linux系统来演示。

Rabbitmq的安装包，分为：rpm和zip的两种方式，rpm的安装方式会自动帮我们安装好一切，也会帮我们默认配置一些信息，而zip压缩包的安装方式，需要我们手动来设置配置文件，对于新手来说使用rpm方式比较好，当你们熟练掌握Rabbitmq后，zip的方式也就水到渠成了。

---

选择好安装方式后，我们还需要注意到，Rabbitmq由于是Erlang语言开发的，所以安装Rabbitmq的前提是需要先安装Erlang的依赖，而对于不同版本的Rabbitmq需要哪个版本的Erlang呢？

这里，我们点击右边的** Erlang Version**：

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428152532.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428152836.png"/>

这里，我们就需要Erlang语言版本的：R16Bo3 版本。

---

现在，我们的前提知识点都疏通了，打开我们的虚拟机，我的虚拟机使用的是：CentOS7版本。

当前目录为：usr/local/soft

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428153200.png"/>

如果你的CentOS7是精简版的话，还需要提前安装必要的Linux依赖包：

```
yum install 
build-essential openssl openssl-devel unixODBC unixODBC-devel 
make gcc gcc-c++ kernel-devel m4 ncurses-devel tk tc xz
```

下载：Erlang 和 Rabbitmq

```
wget www.rabbitmq.com/releases/erlang/erlang-18.3-1.el7.centos.x86_64.rpm
wget http://repo.iotti.biz/CentOS/7/x86_64/socat-1.7.3.2-5.el7.lux.x86_64.rpm
wget www.rabbitmq.com/releases/rabbitmq-server/v3.6.5/rabbitmq-server-3.6.5-1.noarch.rpm
```

下载完毕后：

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428153609.png"/>

### Rabbitmq的安装

上述步骤中，我们已经下载好了所有的安装包。现在，开始我们的安装流程。

首先，要告诉大家的是：三个rpm安装包的安装顺序，Erlang必须是在Rabbitmq安装之前的安装。

1）首先安装 Erlang

**rpm -ivh erlang-18.3-1.el7.centos.x86_64.rpm**

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428154158.png"/>

Erlang安装成功。

现在是先安装socat还是Rabbitmq呢？我们尝试一下就好了。

先尝试安装Rabbitmq：

**rpm -ivh rabbitmq-server-3.6.5-1.noarch.rpm**

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428154503.png"/>

所以，需要先安装：socat依赖

2）安装socat依赖

**rpm -ivh socat-1.7.3.2-5.el7.lux.x86_64.rpm**

3）安装Rabbitmq

**rpm -ivh rabbitmq-server-3.6.5-1.noarch.rpm**

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428154835.png"/>

### Rabbitmq的配置

**vim /usr/lib/rabbitmq/lib/rabbitmq_server-3.6.5/ebin/rabbit.app**

这个rabbit.app是核心配置文件，这里就简单的说明一下，以后会重点介绍的，比如修改密码、配置等等。

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428160302.png"/>

这里，我们主要修改一下，我们需要访问的用户：

**loopback_users 中的 <<"guest">> , 只保留guest。即：{loopback_users，[guest]}**

不做这样的修改的话，我们是不能直接访问Rabbitmq的。

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428160535.png"/>

### Rabbitmq服务的启动

1）服务的启动：

**rabbitmq-server start &**

后台启动rabbitmq服务

2）服务的停止：

**rabbitmqctl stop_app**

3）管理插件

**rabbitmq-plugins enable rabbitmq_management**

4）访问地址：

**http://ip地址:15672**

---

在我们的终端中输入：rabbitmq然后敲Tab键

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428161208.png"/>

Linux系统帮我们补全了：rabbitmq的命令，主要使用三个脚本命令。

1）rabbitmqctl：一系列rabbitmq的操作命令，我们大多时候会使用这个命令，这个脚本命令比较全

2）rabbitmq-plugins：rabbitmq的插件命令，比如rabbitmq的界面管理插件等

3）rabbitmq-server：主要用于rabbitmq服务的启动，停止。

---

使用 **rabbtitmq-server start &**

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428161928.png"/>

这个，有个细节，就是日志文件是以：rabbit开头，@作为分界符，加你的主机名来命名的，我们的主机名要使用英文，不要使用中文的命名。

怎么印证我们的rabbitmq已经启动成功了呢？首先：ctrl+C退出当前的运行。

输入：**lsof -i:5672**

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428162434.png"/>

---

使用：**rabbitmqctl stop_app** 停止rabbitmq服务：

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428162826.png"/>

---

使用rabbitmq的插件，来提供一个rabbitmq的界面管理工具，方便我们的管理。

**rabbitmq-plugins list** 列出所有的插件

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428163414.png"/>

****

**rabbitmq-plugins enable rabbitmq_management** 启动rabbitmq管控台插件

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428163716.png"/>

再次，启动我们的rabbitmq应用：**rabbitmqctl start_app**

此时我们的rabbitmq服务是启动的，只是停止了rabbitmq的应用，启动应用使用：rabbitmqctl start_app，而不是：rabbitmq-server start &

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428164323.png"/>

再次启动：rabbitmq的插件：**rabbitmq-plugins enable rabbitmq_management**

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428164830.png"/>

现在来印证我们的rabbitmq-management是否启动成功：

在我们的虚拟机中的浏览器中输入：**localhost:15672**

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428170712.png"/>

我们能看到，rabbitmq的管控台了，成功了一半。

在我们的宿主机中输入：**http://192.168.69.200:15672/**

其中的ip地址是我的虚拟机的ip地址。

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428170910.png"/>

为啥，我们的宿主机访问失败呢？那是因为在我们的虚拟机中linux系统设置了防火墙，需要修改防火墙的设置。

```
firewall-cmd --zone=public --add-port=15672/tcp --permanent

firewall-cmd --reload 
```

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428171424.png"/>

刷新我们的宿主机的浏览器：

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428171518.png"/>

输入默认的账号和密码：**guest**

<img src="https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ%E6%88%AA%E5%9B%BE20190428171630.png"/>

登入成功，这里我们能看到图形化的信息，连接数，信道数，交换机，队列，用户管理等。



