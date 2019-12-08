---
title: Docker中的Dockerfile解析
categories:
  - docker
  - 容器
tags:
  - docker
  - 容器
date: 2019-01-11 18:13:42
summary: DockerFile文件
---

这篇专门来讲解Docker中比较重要的DockerFile文件

## DockerFile是什么

Dockerfile是用来构建Docker镜像的构建文件，是由一系列命令和参数构成的脚本。

构建三步骤：

* 编写Dockerfile文件

* docker build

* docker run

Dockerfile文件是什么样呢？

以我们熟悉的CentOS为例：

<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111192141.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111192322.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111192232.png"/>

---

## DockerFile构建过程解析

### Dockerfile内容基础知识

1：每条保留字指令都必须为大写字母且后面要跟随至少一个参数

2：指令按照从上到下，顺序执行

3：#表示注释

4：每条指令都会创建一个新的镜像层，并对镜像进行提交

### Docker执行Dockerfile的流程

（1）docker从基础镜像运行一个容器

（2）执行一条指令并对容器作出修改

（3）执行类似docker commit的操作提交一个新的镜像层

（4）docker再基于刚提交的镜像运行一个新容器

（5）执行dockerfile中的下一条指令直到所有指令都执行完成

### 小总结

从应用软件的角度来看，Dockerfile、Docker镜像与Docker容器分别代表软件的三个不同阶段：

*  Dockerfile是软件的原材料
  
*  Docker镜像是软件的交付品
  
*  Docker容器则可以认为是软件的运行态。

Dockerfile面向开发，Docker镜像成为交付标准，Docker容器则涉及部署与运维，三者缺一不可，合力充当Docker体系的基石。

<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111192957.png"/>

1. Dockerfile，需要定义一个Dockerfile，Dockerfile定义了进程需要的一切东西。Dockerfile涉及的内容包括执行代码或者是文件、环境变量、依赖包、运行时环境、动态链接库、操作系统的发行版、服务进程和内核进程(当应用进程需要和系统服务和内核进程打交道，这时需要考虑如何设计namespace的权限控制)等等;

2. Docker镜像，在用Dockerfile定义一个文件之后，docker build 时会产生一个Docker镜像，当运行 Docker镜像时，会真正开始提供服务;

3. Docker容器，容器是直接提供服务的。


## DockerFile体系结构(保留字指令)
```
FROM:         基础镜像，当前新镜像是基于哪个镜像的
MAINTAINER:   镜像维护者的姓名和邮箱地址
RUN:          容器构建时需要运行的linux命令
EXPOSE:       当前容器对外暴露出的端口

------------------------------------------------------
ENV:          用来在构建镜像过程中设置环境变量

ENV MY_PATH /usr/mytest
这个环境变量可以在后续的任何RUN指令中使用，这就如同在命令前面指定了环境变量前缀一样；
也可以在其它指令中直接使用这些环境变量，
 
比如：WORKDIR $MY_PATH
------------------------------------------------------

WORKDIR:      指定在创建容器后，终端默认登陆的进来工作目录，一个落脚点
ADD:          将宿主机目录下的文件拷贝进镜像且ADD命令会自动处理URL和解压tar压缩包
COPY:         类似ADD，拷贝文件和目录到镜像中。将从构建上下文目录中 <源路径> 的文件/目录复制到新的一层的镜像内的 <目标路径> 位置.
VOLUME:       容器数据卷，用于数据保存和持久化工作。

-------------------------------------------------------
CMD:          指定一个容器启动时要运行的命令,Dockerfile 中可以有多个 CMD 指令，但只有最后一个生效，CMD 会被 docker run 之后的参数替换.

CMD指令的格式与RUN相似，也是两种格式：

shell 格式：CMD <命令>

exec 格式：CMD ["可执行文件","参数1","参数2",···]

参数列表格式：CMD ["参数1","参数2",···]。在指定了 ENTRYPOINT 指令后，可以用 CMD 指定具体的参数。
--------------------------------------------------------

ENTRYPOINT：  指定一个容器启动时要运行的命令，ENTRYPOINT 的目的 和 CMD 一样，都是在指定容器启动程序及参数，但是它是叠加命令，不是覆盖命令。
ONBUILD：     当构建一个被继承的Dockerfile时运行命令，父镜像在被子继承后父镜像的onbuild被触发
```

### 小总结
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111194330.png"/>

---

## 案例

### Base镜像(scratch)

Docker Hub 中 99% 的镜像都是 通过在 base 镜像中安装和配置需要的软件构建出来的。`scratch` 就是最基础的镜像，和 java中对象默认继承Object对象一样。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111194719.png"/>

### 自定义镜像mycentos

#### 编写

1.默认的centos镜像是什么情况呢？
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111195155.png"/>

现在：我们想创建自己的mycentos镜像，修改登入后的工作目录，支持vim编辑器，支持ifconfig网络配置。

2.编写dockerfile文件

由于之前，我们在mydocker文件下，写过Dockerfile文件，所以接着在里面写了，你们如果没有，就在根目录下创建即可，随意。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111195627.png"/>

Dockerfile文件中的内容：
``` 
FROM centos                               #继承centos镜像
MAINTAINER gakki<gakki167@126.com>        #填写作者与邮箱地址
 
ENV mypath /usr/local                     #编写环境变量，方便后续使用
WORKDIR $mypath                           #修改登入后的工作目录
 
RUN yum -y install vim                    #使用RUN命令，下载vim编辑
RUN yum -y install net-tools              #使用RUN命令，下载网络配置工具
 
EXPOSE 80                                 #暴露端口号为80
 
CMD echo $mypath                          #为了测试，随便写的，不写也行
CMD echo "success--------------ok"        #为了测试，随便写的，不写也行
CMD /bin/bash                             #启动容器，执行/bin/bash命令
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111200217.png"/>

#### 构建

`docker build -f Dockerfile文件的路径 -t 新镜像名字:TAG .`  注意最后有一个点,  . 表示当前目录

如果当前目录下，存在Dockerfile文件话，而且就是`Dockerfile`这个名字，那么可以不写 `-f Dockerfile的路径`
```
docker build -t mycentos:1.3 .
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111200803.png"/>

然后开始一顿哗啦啦的代码，因为要下载 vim 和 net-tools。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111200933.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111201130.png"/>

#### 运行

`docker run -it 新镜像名:TAG`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111201358.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111201459.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111201548.png"/>

#### 列出镜像的变更历史

`docker history 镜像名`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111201937.png"/>

### CMD/ENTRYPOINT 镜像案例

为了区分 CMD 与 ENTRYPOINT 命令的区别，而做了案例。

两者都是：指定一个容器启动时要运行的命令。

#### CMD

采用 CMD 的话，当Dockerfile 中有多个 CMD 指令时，只能最后一个生效。而且 CMD 会被 docker run 之后的参数替换。
```
比如，当Dockerfile文件中的最后是:

CMD ["/bin/bash"]
CMD ["ls","-l"]

那么，只会执行 ls -l 命令，不会执行/bin/bash 命令。

当使用 docker run -it 镜像名 ls -l ： 启动容器也是一样的效果，这里的ls -l 会覆盖掉Dockerfile文件中的：CMD ["/bin/bash"]
```

这里，我以tomcat为例来演示：

<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111202901.png"/>

如果不加 ls -l ，就会执行默认的 CMD ["catalina.sh", "run"] （上图写错了）
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111203033.png"/>

---

#### ENTRYPOINT 

docker run 之后的参数会被当做参数传递给 ENTRYPOINT，之后形成新的命令组合，不会覆盖之前的命令。

制作CMD版可以查询IP信息的容器：

在mydocker文件夹下，创建Dockerfile2文件：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111203430.png"/>

Dockerfile2文件内容：
```
FROM centos
RUN yum install -y curl
CMD ["curl", "-s", "www.baidu.com"]
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111204426.png"/>

生成 myip镜像：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111203855.png"/>

运行 myip镜像：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111204646.png"/>

那是因为，我们生成myip的镜像的Dockerfile文件，最后执行了：`CMD ["curl", "-s", "www.baidu.com"]。`

如果，我们想要获取抓包过程中的头部信息，还需要加上 -i 。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111204950.png"/>

现在，我在启动myip的过程中 加上 -i：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111205157.png"/>

因为，我们使用的是CMD，不是ENTRYPOINT，所以，在docker run 后面的参数，会直接覆盖Dockerfile中的`CMD ["curl", "-s", "www.baidu.com"]`，相当于现在变成了`CMD ["-i"]` ，这个当然报错呀，都不知道是什么玩意！！！

---

现在，在mydocker文件夹下，创建Dockerfile3：
```
FROM centos
RUN yum install -y curl
ENTRYPOINT ["curl", "-s", "www.baidu.com"]
```
唯一的区别就是：将CMD 换成了 ENTRYPOINT 。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111205600.png"/>

生成新的镜像：myip2
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111205729.png"/>

启动 myip2 容器：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111205905.png"/>

到目前为止，都和CMD一样。现在 再次启动 myip2 还面带上 -i 参数：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111210120.png"/>

发现，没有报错，返回了 头部信息 和 主体信息。

以上：就是 CMD 和 ENTRYPOINT 的区别！！！

#### CURL

考虑到大家有可能对 curl 不熟，这里简单介绍一下：

curl命令可以用来执行 下载、发送各种HTTP请求，指定HTTP头部等操作。

如果系统没有curl可以使用 yum install curl安装，也可以下载安装。

`curl是将下载文件输出到stdout`
```
使用命令：curl http://www.baidu.com
执行后，www.baidu.com的html就会显示在屏幕上了

这是最简单的使用方法。用这个命令获得了http://curl.haxx.se指向的页面
同样，如果这里的URL指向的是一个文件或者一幅图都可以直接下载到本地。
如果下载的是HTML文档，那么缺省的将只显示文件头部，即HTML文档的header。要全部显示，请加参数 -i
```

---

### 自定义镜像Tomcat9

#### 创建一个目录来编写Dockerfile文件

`mkdir -p /gakki/mydocker/tomcat9`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111210844.png"/>


#### 在上述目录下创建c.txt

<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190111211019.png"/>

创建c.txt，主要是为了使用：COPY命令来玩的，没有什么作用意义。

#### 将jdk和tomcat安装的压缩包拷贝进上一步目录

在我的centos中，已经下载过 jdk 和 tocmat 的压缩包，如果大家没有，请自行下载，自学，比较简单。

`cp /usr/local/src/apache-tomcat-8.5.37.tar.gz ./`

`cp /usr/local/src/jdk-8u191-linux-x64.tar.gz ./`

<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112105516.png"/>

#### 在当前目录下创建Dockerfile文件

<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112105740.png"/>

Dockerfile文件内容：
```
#基于centos镜像
FROM centos
#作者以及邮箱
MAINTAINER gakki<gakkij@126.com>
#把宿主机当前上下文的c.txt拷贝到容器/usr/local/路径下
COPY c.txt /usr/local/copycontainer.txt
#把java与tomcat添加到容器中
ADD jdk-8u191-linux-x64.tar.gz /usr/local/
ADD apache-tomcat-8.5.37.tar.gz /usr/local/
#安装vim编辑器
RUN yum -y install vim
#设置工作访问时候的WORKDIR路径，登录落脚点
ENV MYPATH /usr/local
WORKDIR $MYPATH
#配置java与tomcat环境变量
ENV JAVA_HOME /usr/local/jdk1.8.0_191
ENV CLASSPATH $JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
ENV CATALINA_HOME /usr/local/apache-tomcat-8.5.37
ENV CATALINA_BASE /usr/local/apache-tomcat-8.5.37
ENV PATH $PATH:$JAVA_HOME/bin:$CATALINA_HOME/lib:$CATALINA_HOME/bin
#容器运行时监听的端口
EXPOSE  8080
#启动时运行tomcat
# ENTRYPOINT ["/usr/local/apache-tomcat-8.5.37/bin/startup.sh" ]
# CMD ["/usr/local/apache-tomcat-8.5.37/bin/catalina.sh","run"]
CMD /usr/local/apache-tomcat-8.5.37/bin/startup.sh && tail -F /usr/local/apache-tomcat-8.5.37/bin/logs/catalina.out
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112110723.png"/>

**注意：**上面的 jdk 和 tomcat 填写成你的机器上面的 jdk 和 tomcat 的版本，不要和我一样，除非你下载的jdk和tomcat的版本和我一样！！！

#### 构建

`docker build -t gakkitomcat9 .`

<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112111444.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112111531.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112111623.png"/>


#### run

```
docker run -d -p 9080:8080 --name myt9 -v /gakki/mydocker/tomcat9/app:/usr/local/apache-tomcat-8.5.37/webapps/app -v /gakki/mydocker/tomcat9/tomcat9logs/:/usr/local/apache-tomcat-8.5.37/logs --privileged=true gakkitomcat9

解释：上面创建了两个数据卷，一个用来创建app来与gakkitomcat9共享，放置网站用的，这样的话，我们直接就可以在宿主机上操作网站中的内容了

另一个数据卷是用来存放gakkitomcat9容器启动后的日志信息。
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112112223.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112112335.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112112437.png"/>

#### 验证
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112112648.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112112801.png"/>

#### 发布webapp

在我们的宿主机的app目录下(数据卷目录)，创建webapp的标准目录结构：
```
app
---a.jsp
---WEB-INF
------web.xml

app目录下：有a.jsp文件 和 WEB-INF目录
WEB-INF目录下：有web.xml文件
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112113341.png"/>

web.xml中的内容：
```
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="http://java.sun.com/xml/ns/javaee"
  xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
  id="WebApp_ID" version="2.5">
  
  <display-name>myApp</display-name>
 
</web-app>
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112113625.png"/>

a.jsp中的内容：
```
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Insert title here</title>
  </head>
  <body>
    -----------welcome------------
    <%="i am in docker tomcat self "%>
    <br>
    <br>
    <% System.out.println("=============docker tomcat self");%>
  </body>
</html>
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112113715.png"/>

测试：

在浏览器中输入：`localhost:9080/app/a.jsp`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112113853.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112113939.png"/>

---

现在，我们稍微修改一下，a.jsp中的内容：
```
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Insert title here</title>
  </head>
  <body>
    -----------welcome------------<br>
    <%="i am update in docker tomcat self "%>
    <br>
    <br>
    <% System.out.println("=============docker tomcat self");%>
  </body>
</html>
```
就是在：welcome后面加了换行，修改了输出语句加了：update。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112114252.png"/>

现在，来查看日志信息：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112115253.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112115340.png"/>


现在稍微明白容器数据卷的作用的吧，以后我们只需要在宿主机中的 app目录下修改、添加内容，docker容器中就会同步数据，方便开发和查看日志信息。

---

现在，我们进入gakkitomcat9中，验证：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112115727.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112120945.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112121214.png"/>

---

## 总结
<img src="https://gakkil.gitee.io/gakkil-image/docker/day06/QQ截图20190112121346.png"/>
