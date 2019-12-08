---
title: Docker中的常用安装
categories:
  - docker
  - 容器
tags:
  - docker
  - 容器
date: 2019-01-12 14:10:33
summary: Docker中的常用安装
---

今天，主要来介绍Docker中的常用安装，希望大家学习完毕后，可以举一反三。

## 总体步骤

* 搜索镜像：docker search 镜像名

* 拉取镜像：docker pull 镜像名:TAG

* 查看镜像：docker images 镜像名

* 启动镜像：docker run 镜像名

* 停止容器：docker stop 容器ID

* 移除容器：docker rm 容器ID

---

## 安装tomcat

1.docker hub 上面查找tomcat镜像 或者 docker search tomcat
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112143621.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112143711.png"/>

2.从docker hub上面拉取tomcat镜像到本地

`docker pull tomcat`

官网命令：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112143916.png"/>

拉取完成：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112144007.png"/>

3.docker images 查看是否有拉取到的tomcat
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112144124.png"/>

4.使用tomcat镜像启动容器

`docker run -it -p 8080:8080 tomcat`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112144307.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112144405.png"/>

---

## 安装mysql

1.从docker hub上面搜索mysql镜像
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112144556.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112144632.png"/>

2.从docker hub上拉取mysql镜像到本地，标签为：5.6

<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112145414.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112145518.png"/>

3.启动mysql镜像

```
docker run -p 3306:3306 --name mysql -v /gakki/mysql/conf:/etc/mysql/conf.d -v /gakki/mysql/logs:/logs -v /gakki/mysql/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.6

拆开：
docker run -p 3306:3306 --name mysql 
-v /gakki/mysql/conf:/etc/mysql/conf.d 
-v /gakki/mysql/logs:/logs 
-v /gakki/mysql/data:/var/lib/mysql 
-e MYSQL_ROOT_PASSWORD=123456
-d mysql:5.6

命令说明：
-p 3306:3306：将主机的3306端口映射到docker容器的3306端口。
--name mysql：运行服务名字
-v /gakki/mysql/conf:/etc/mysql/conf.d ：将主机/gakki/mysql目录下的conf目录 挂载到容器的 /etc/mysql/conf.d
-v /gakki/mysql/logs:/logs：将主机/gakki/mysql目录下的 logs 目录挂载到容器的 /logs。
-v /gakki/mysql/data:/var/lib/mysql ：将主机/gakki/mysql目录下的data目录挂载到容器的 /var/lib/mysql 
-e MYSQL_ROOT_PASSWORD=123456：初始化 root 用户的密码。
-d mysql:5.6 : 后台程序运行mysql5.6

docker run -p 3306:3306 --name mysql -v /gakki/mysql/conf:/etc/mysql/conf.d -v /gakki/mysql/logs:/logs -v /gakki/mysql/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.6
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112150227.png"/>

4.进入启动后的mysql容器内：

`docker exec -it MySQL运行成功后的容器ID /bin/bash`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112150441.png"/>

进入容器中的mysql服务内：

`mysql -uroot -p`

`Enter password: 输入你的mysql密码`

<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112150631.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112150933.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112151207.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112151353.png"/>

5.使用我们的windows机来验证这个mysql是否成功：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112151634.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112151745.png"/>

现在，在windows上面插入数据，在docker容器检查：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112151908.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112152012.png"/>

---

5.备份数据

`docker exec myql服务容器ID sh -c 'exec mysqldump --all-databases -uroot -p"123456"' > /gakki/all-databases.sql`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112152311.png"/>

然后，我们就可以使用这个备份文件来恢复数据，或者在其他机器上执行。

## 安装redis

1.从docker hub上搜索redis镜像
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112152715.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112152740.png"/>

2.拉取redis镜像，标签为：3.2
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112153022.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112153127.png"/>

3.使用redis:3.2生成容器
```
docker run -p 6379:6379 --name myredis -v /gakki/myredis/data:/data -v /gakki/myredis/conf/redis.conf:/usr/local/etc/redis/redis.conf -d redis:3.2 redis-server /usr/local/etc/redis/redis.conf --appendonly yes

拆开：
docker run -p 6379:6379 --name myredis 
-v /gakki/myredis/data:/data
-v /gakki/myredis/conf/redis.conf:/usr/local/etc/redis/redis.conf
-d redis:3.2 redis-server /usr/local/etc/redis/redis.conf
--appendonly yes
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112153817.png"/>

4.在宿主机的：/gakki/myredis/conf/redis.conf目录下：新建redis.conf文件

`vim /gakki/myredis/conf/redis.conf/redis.conf`

redis.conf内容：
```
就是标准的redis.conf的内容，这里就不演示了，因为文件内容比较多。

主要是：关闭 bind 主机的功能：

# bind 127.0.0.1

```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112154401.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112154536.png"/>

5.使用redis-cli来测试：

`docker exec -it 运行着Redis服务的容器ID redis-cli`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112154823.png"/>

6.测试持久化文件
<img src="https://gakkil.gitee.io/gakkil-image/docker/day07/QQ截图20190112155035.png"/>

---

我相信大家对这三个常用的软件安装熟悉后，对于其他的软件安装应该也就没有问题了。