---
title: Docker的常用命令
categories:
  - docker
  - 容器
tags:
  - docker
  - 容器
date: 2019-01-09 21:01:28
summary: docker的常用命令
---

接着上篇，我们来学习docker的常用命令，大家是不是已经开始蠢蠢欲动了呢？come on！！！

## 帮助命令

### docker version
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109212142.png"/>

### docker info
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109212258.png"/>

### `docker --help`

重要，帮助指令，就像linux中的man指令一样。

<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109212428.png"/>

## 镜像命令

### docker images

列出本地主机上的镜像
```
docker images [OPTIONS]

各个选项说明:

REPOSITORY： 表示镜像的仓库源
TAG：        镜像的标签
IMAGE ID：   镜像ID
CREATED：    镜像创建时间
SIZE：       镜像大小
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109213548.png"/>

同一仓库源可以有多个 TAG，代表这个仓库源的不同个版本，我们使用 REPOSITORY:TAG 来定义不同的镜像。

如果你不指定一个镜像的版本标签，例如你只使用 ubuntu，docker 将默认使用 ubuntu:latest 镜像。

```
OPTIONS说明

-a：        列出所有镜像
-q：        只列出镜像的id
--digests:  显示出镜像的摘要信息
--no-trunc: 显示出完整的镜像信息
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109214237.png"/>

### docker search

在docker hub上面查找某个镜像
```
docker search 镜像名 [OPTION]

NAME：           镜像的名字
DESCRPTION:      镜像的描述信息
STARS:           相当于点赞数，星数，越多说明人用的越多
OFFICIAL:        是否官方
AUTOMATED:       是否自动构建、组装
```

使用该命令 与 在docker hub上面直接查找镜像是一样。docker hub地址：https://hub.docker.com

比如说：查找 tomcat镜像
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109215126.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109215251.png"/>

```
OPTIONS说明：

--no-trunc:    显示完整的镜像描述

-s 3:          列出收藏数（点赞数）不小于指定值的镜像。（这里就是不小于3）
这里说明一下，  命令已经过时了，现在使用：--filter=stars=3 来代替了

--automated:   只列出automated build类型的镜像
这里说明一下，  命令已经过时了，现在使用：--filter=is-automated=true 来代替了 
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109220322.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109220719.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109221006.png"/>


### docker pull

下载某个镜像，如果没有配置阿里云镜像，就是从docker huh上面拉取镜像，配置了的话，就是从阿里云镜像上面拉取镜像。
没有配置的话，下载速度老慢了，会吓死个人的。
```
docker pull 镜像名字[:TAG]

如果镜像名后面不加 :TAG , 那么就是下载最新的镜像。即  :latest。

docker pull tomcat   <======> docker pull tomcat:latest
```
现在，比如下载tomcat镜像。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109223129.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109223225.png"/>

如果，不想下载最新的镜像，要么就需要加上tag标签，那tag在哪里可以看呢？查官网。

比如，要下载tomcat镜像，点击进去后，会发现很多tag。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109223409.png"/>

### docker rmi

删除某个镜像
```
docker rmi 某个XXX镜像名字（或镜像ID）
注意，如果你不加tag，那么就是删除latest的镜像。

强制删除一个镜像
docker rmi -f 镜像名字（或镜像ID）

删除多个镜像：
docker rmi -f 镜像名1:TAG 镜像名2:TAG
多个镜像，用空格隔开

删除全部：
docker rmi -f $(docker images -qa)
使用了$(),很像mysql中的 in的作用，delete from table where id in（id1，id2，id3）。
docker images -qa：查找本地所有镜像的id
```
使用镜像名删除：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109224931.png"/>

使用镜像id删除：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190109224736.png"/>

---

## 容器命令

<font color="red">**有镜像才能创建容器，这是根本的前提(下载一个CentOS镜像演示)**</font>

`docker pull centos`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110111910.png"/>

### docker run image
新建并启动一个容器：
```
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

OPTIONS说明（常用）：有些是一个减号，有些是两个减号

--name="容器新名字": 为容器指定一个名称；
-d: 后台运行容器，并返回容器ID，也即启动守护式容器；
-i：以交互模式运行容器，通常与 -t 同时使用；
-t：为容器重新分配一个伪输入终端，通常与 -i 同时使用；
-P: 随机端口映射；(大写)
-p: 指定端口映射，有以下四种格式 （小写）
    ip:hostPort:containerPort
    ip::containerPort
    hostPort:containerPort
    containerPort
```

启动交互式容器：

`docker run -it centos`  (-i -t 可以缩写成：-it)
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110113630.png"/>

### docker ps

列出当前所有**运行**的容器
```
docker ps [OPTIONS]

OPTIONS说明（常用）：

-a :列出当前所有正在运行的容器 + 历史上运行过的。
-l :显示最近创建的容器(不管是否运行)。
-n：显示最近 n个创建的容器(不管是否运行)。
-q :静默模式，只显示容器编号。
--no-trunc :不截断输出。
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110114219.png"/>


退出使用交互式运行的容器：
```
两种方式：

exit：    容器停止并退出交互式。

ctrl+P+Q：容器不停止但退出交互式。
```

使用 exit 退出刚刚我们启动的centos容器：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110114603.png"/>

检测是否停止了容器：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110114823.png"/>


### docker start

启动容器
```
docker start 容器ID或者容器名
```
再次启动，centos容器
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110115559.png"/>

### docker restart

重启容器
```
docker restart 容器ID或者容器名
```

重启centos容器
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110120004.png"/>

### docker stop

停止容器
```
docker stop 容器ID或者容器名
```

停止centos容器运行：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110120253.png"/>

### docker kill

强制停止
```
docker kill 容器ID或者容器名

强制停止：就好比直接拔掉了电源，而stop停止就相当于正常的关机操作。
```

### docker rm

删除容器
```
docker rm 容器ID或者容器名

-f：选项，用来强制删除正在运行的容器。

注意：rmi：是删除镜像，rm才是删除容器。

一次性删除多个容器

方式一：docker rm -f $(docker ps -a -q)

方式二：docker ps -a -q | xargs docker rm
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110121246.png"/>

---

### 重点

**1.启动守护式容器**

```
docker run -d 镜像ID或镜像名 
```

之前，我们使用的是交互式启动容器，现在我们来以后台的方式来启动容器：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110125011.png"/>

问题：然后docker ps -a 进行查看, 会发现容器已经退出了。

很重要的要说明的一点: <font color="red">Docker容器后台运行 , 就必须有一个前台进程. 否则会自动退出。</font>
容器运行的命令如果不是那些一直挂起的命令（比如运行top，tail），就是会自动退出的。

**这个是docker的机制问题**,比如你的web容器,我们以nginx为例，正常情况下,我们配置启动服务只需要启动响应的service即可。例如：service nginx start
但是,这样做,nginx为后台进程模式运行，就导致docker前台没有运行的应用，这样的容器后台启动后，会立即自杀，因为他觉得他没事可做了。<font color="blue">所以，最佳的解决方案是，将你要运行的程序以前台进程的形式运行。</font>

**2.查看容器运行的日记**

```
docker logs -f -t --tail 容器ID

-t：           打印日志时，会加入时间戳
-f：           只打印最新的日志，会不退出，一直打印。
--tail 数字：  显示最后的多少条日志。（数字是几，就打印几条日志）       
```

使用：`docker run -d centos /bin/sh -c "while true;do echo hello zzyy;sleep 2;done"`

因为后台运行会自动退出，所以当以后台运行容器时，我们加入了shell脚本，使其一直打印 hello zzyy，所以容器就不会退出。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110130157.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110130315.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110130442.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110130705.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110130617.png"/>

**3.查看容器内运行的进程**
```
docker top 容器的ID
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110131211.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110131324.png"/>

**4.查看容器内部的细节**
```
docker inspect 容器的ID
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110131530.png"/>

**5.进入正在运行的容器并以命令行交互**
```
有两种方式：

方式一：docker attach 容器ID

方式二：docker exec -it 容器ID /bin/bash

方式二的功能更强大些，其实docker exec 是运行当前容器的命令，运行完命令后，就返回到宿主机，由于运行的是/bin/bash，所以才没有返回到宿主机
```

方式一：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110132223.png"/>

方式二：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110132352.png"/>

更强大的功能：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110132800.png"/>

<font color="blue">两者的区别：</font>

attach：直接进入容器启动命令的终端，不会启动新的进程。

exec：是在容器中打开新的终端，并且可以启动新的进程。

**6.从容器内拷贝文件到宿主机上**
```
docker cp  容器ID:容器内路径 目的主机路径
```

将centos中的/tmp下的yum.log 拷贝到root根目录下。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110133245.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110133436.png"/>

---

## 常用命令总结
<img src="https://gakkil.gitee.io/gakkil-image/docker/day03/QQ截图20190110133708.png"/>

```
attach    Attach to a running container                 # 当前 shell 下 attach 连接指定运行镜像
build     Build an image from a Dockerfile              # 通过 Dockerfile 定制镜像
commit    Create a new image from a container changes   # 提交当前容器为新的镜像
cp        Copy files/folders from the containers filesystem to the host path   #从容器中拷贝指定文件或者目录到宿主机中
create    Create a new container                        # 创建一个新的容器，同 run，但不启动容器
diff      Inspect changes on a container's filesystem   # 查看 docker 容器变化
events    Get real time events from the server          # 从 docker 服务获取容器实时事件
exec      Run a command in an existing container        # 在已存在的容器上运行命令
export    Stream the contents of a container as a tar archive   # 导出容器的内容流作为一个 tar 归档文件[对应 import ]
history   Show the history of an image                  # 展示一个镜像形成历史
images    List images                                   # 列出系统当前镜像
import    Create a new filesystem image from the contents of a tarball # 从tar包中的内容创建一个新的文件系统映像[对应export]
info      Display system-wide information               # 显示系统相关信息
inspect   Return low-level information on a container   # 查看容器详细信息
kill      Kill a running container                      # kill 指定 docker 容器
load      Load an image from a tar archive              # 从一个 tar 包中加载一个镜像[对应 save]
login     Register or Login to the docker registry server    # 注册或者登陆一个 docker 源服务器
logout    Log out from a Docker registry server         # 从当前 Docker registry 退出
logs      Fetch the logs of a container                 # 输出当前容器日志信息
port      Lookup the public-facing port which is NAT-ed to PRIVATE_PORT    # 查看映射端口对应的容器内部源端口
pause     Pause all processes within a container        # 暂停容器
ps        List containers                               # 列出容器列表
pull      Pull an image or a repository from the docker registry server  # 从docker镜像源服务器拉取指定镜像或者库镜像
push      Push an image or a repository to the docker registry server    # 推送指定镜像或者库镜像至docker源服务器
restart   Restart a running container                   # 重启运行的容器
rm        Remove one or more containers                 # 移除一个或者多个容器
rmi       Remove one or more images                     # 移除一个或多个镜像[无容器使用该镜像才可删除，否则需删除相关容器才可继续或 -f 强制删除]
run       Run a command in a new container              # 创建一个新的容器并运行一个命令
save      Save an image to a tar archive                # 保存一个镜像为一个 tar 包[对应 load]
search    Search for an image on the Docker Hub         # 在 docker hub 中搜索镜像
start     Start a stopped containers                    # 启动容器
stop      Stop a running containers                     # 停止容器
tag       Tag an image into a repository                # 给源中镜像打标签
top       Lookup the running processes of a container   # 查看容器中运行的进程信息
unpause   Unpause a paused container                    # 取消暂停容器
version   Show the docker version information           # 查看 docker 版本号
wait      Block until a container stops, then print its exit code   # 截取容器停止时的退出状态值
```