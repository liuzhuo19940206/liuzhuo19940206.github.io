---
title: Docker中的容器数据卷
categories:
  - docker
  - 容器
tags:
  - docker
  - 容器
date: 2019-01-10 22:11:15
summary: Docker中的容器数据卷
---

Docker中的容器数据卷，我们知道redis是一个内存数据库，为啥，退出后，下次重启后，数据库中还有之前的数据呢？因为有rdb和aof持久化。
因此，Docker中的容器数据卷，也是为了将容器中的数据，保存到宿主机中的技术，防止容器停止后，数据丢失。

## 数据卷是什么

先来看看Docker的理念：

*  将应用与运行的环境打包形成容器运行 ，运行可以伴随着容器，但是我们对数据的要求希望是持久化的

*  容器之间希望有可能共享数据

Docker容器产生的数据，如果不通过docker commit生成新的镜像，使得数据做为镜像的一部分保存下来，那么当容器删除后，数据自然也就没有了。

为了能保存在docker中的数据，我们使用卷。

## 数据卷能干嘛

卷就是目录或文件，存在于一个或多个容器中，由docker挂载到容器，但不属于联合文件系统，因此能够绕过Union File System提供一些用于持续存储或共享数据的特性。

卷的设计目的就是数据的持久化，完全独立于容器的生存周期，因此Docker不会在容器删除时删除其挂载的数据卷。

特点：

1：数据卷可在容器之间共享或重用数据
2：卷中的更改可以直接生效
3：数据卷中的更改不会包含在镜像的更新中
4：数据卷的生命周期一直持续到没有容器使用它为止

## 使用数据卷

容器内添加，有两种方式：

* 直接命令添加

* DockerFile添加


### 直接命令添加

**`docker run -it -v /宿主机绝对路径目录:/容器内目录   镜像名`**
```
这里主要就是添加了一个 -v 的选项参数。

```

现在，我们来正式演示一遍：

**在宿主机的根目录下创建：mydataVolume目录。**

然后使用：`docker run -it -v /mydataVolume:/dataVolumeContainer centos /bin/bash` 将两者挂载在一起，实现数据共享。

该命令会帮我们以交换式的方式启动centos容器，然后会自动帮我们在centos的根目录下创建：dataVolumeContainer目录。

<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111112831.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111113633.png"/>

**查看数据卷是否挂载成功：**

`docker inspect 容器ID`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111113940.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111114243.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111114421.png"/>

出现上面的信息，说明挂载数据卷成功。

---

**宿主机与容器之间数据共享：**

在宿主机中的：mydataVolume目录下：创建一个host.txt文件，随便编写一些数据。

<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111114942.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111115028.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111115109.png"/>

在centos容器中，查看：dataVolumeContainer目录下，是否存在host.txt，并且里面有数据：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111115709.png"/>

瞬间懵逼了，后来发现：我是宿主机的root目录下创建的：mydataVolume，然后在该目录下创建的host.txt文件，当然是无法共享的呀。

因为，`docker run -it -v /mydataVolume:/dataVolumeContainer centos /bin/bash` **是宿主机的根目录下创建：mydataVolume ！！！！**

现在，在宿主机下，切换到根目录下，发现mydataVolume目录已经存在了，说明执行了：`docker run -it -v /mydataVolume:/dataVolumeContainer centos /bin/bash` 命令后，会自动帮我们创建这两个共享的目录。

<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111120217.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111120316.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111120500.png"/>

那，在容器下，创建新的文件，修改旧的文件，在宿主机中能更新吗？ 能，数据卷是互相共享的。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111120811.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111120941.png"/>

---

**那么，容器退出后，在宿主机中修改数据，等到原来的容器再次启动时，数据是否会同步呢？**
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111121222.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111121327.png"/>

接着，在宿主机中，修改host.txt文件中的内容：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111121514.png"/>

启动，**原先的**centos容器：

`docker start 容器的ID`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111121959.png"/>

进入centos容器内部：

`docker attach 容器ID`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111122237.png"/>

上面就是，宿主机与容器之间的数据卷共享，可读可写。

---

**那么，可不可以，只能宿主机可读可写，而容器只读呢？ 可以的。**

`docker run -it -v /宿主机绝对路径目录:/容器内目录:ro 镜像名`

请看，上面命令，只是下后面加了一个 `:ro` , ro : readonly的意思，只读。
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111122815.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111123127.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111123217.png"/>

使用 `docker inspect 容器ID`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111123350.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111123441.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111123526.png"/>

---

### 使用DockerFile添加

这里，不会讲太多的DockerFile的知识，只是简单带大家了解一下，使用DockerFile来数据共享，下篇文章，我会继续带大家进行DockerFile的探索。

**第一步：在宿主机的根目录下，创建mydocker文件夹并进入：**
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111135831.png"/>

可在 Dockerfile中 使用 **VOLUME指令** 来给镜像添加一个或多个数据卷。

`VOLUME["/dataVolumeContainer","/dataVolumeContainer2","/dataVolumeContainer3"]`

说明：

出于 **可移植** 和 **分享** 的考虑，用 -v **主机目录:容器目录** 这种方法不能够直接在Dockerfile中实现。

由于宿主机目录是依赖于特定宿主机的，并不能够保证在所有的宿主机上都存在这样的特定目录。

所以，使用DockerFile来进行数据卷的共享时，不需要创建宿主机的共享目录，只需要确定容器内的共享目录即可，这是与使用 -v 命令的区别所在。

那么，什么是DockerFile文件呢？ 这里还是带大家简单了解一下：

打开docker hub的官网，随便搜索一个镜像，比如tomcat：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111141044.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111141140.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111141243.png"/>

简单来看一下：最上面是基于jdk1.8的镜像来生成tomcat镜像的，所以tomcat镜像文件才几百兆，不想在windows中下在一个tomcat几十兆那么小，因为tomcat镜像中包括了jdk的运行环境等，所以比较大。

```
EVN :  配置环境变量的
EXPOSE 8080   ：配置暴露的端口号
CMD ["catalina.sh", "run"]  ：运行镜像最外层的可写的那层
```

使用Dockerfile来数据卷的共享，就是编写一个Dockerfile文件，然后使用这个Dockerfile来生成新的镜像。这里只是简单了解一下。

**第二步，在mydocker文件夹下，编写dockerfile文件：**
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111141828.png"/>

在dockerfile中：
```
# volume test
FROM centos                                               #相当于继承centos镜像
VOLUME ["/dataVolumeContainer1","/dataVolumeContainer2"]  #配置数据卷容器内的目录，可以是多个
CMD echo "finished,--------success1"                      #CMD执行命令，这里是简单测试语句
CMD /bin/bash                                             #执行 /bin/bash 命令，进入终端
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111142130.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111142226.png"/>

**第三步，build我们的dockerfile文件，生成镜像**

`docker build -f /mydocker/dockerfile -t liuzhuo/centos .`
```
-f：     dockerfile文件的路径
-t：     命名空间/镜像名称

注意：最后有一个 空格 + 点
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111142918.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111143207.png"/>

**第四步，查看有没有生成新的镜像**
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111143325.png"/>

**第五步，启动新的镜像**
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111143523.png"/>

**通过上述步骤，容器内的卷目录地址已经知道，对应的主机目录地址哪？？**

使用 `docker inspect 容器id` 来查看宿主机的目录地址：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111143950.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111144227.png"/>

这里，我就使用 **/dataVolumeContainer1** 对应的宿主机的地址来演示了
```
/var/lib/docker/volumes/ef6a4b962d138913b14a43750d12c1a553c2837c34481ff732796e79e62203b3/_data
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111144408.png"/>

创建新的文件，container.txt
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111144609.png"/>

然后在，容器中查看是否有：container.txt
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111144609.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111144738.png"/>

---

**备注:**

Docker挂载主机目录Docker访问出现 cannot open directory . : Permission denied

**解决办法：在挂载目录后多加一个 --privileged=true 参数即可。**

即：`docker run -it -v /mydataVolume:/dataVolumeContainer --privileged=true centos /bin/bash`

一般情况下，是不会出现这样的问题的。

## 数据卷容器

### 数据卷容器是什么

命名的容器 挂载 数据卷后，**其它容器** 通过 挂载这个(父容器)实现数据共享，挂载数据卷的容器，称之为数据卷容器。

### 总体介绍

使用上面的：liuzhuo/centos 为模板，运行三个容器：doc01、doc02、doc03。

它们三个容器本身都具有两个容器卷：`/dataVolumeContainer1` 和 `/dataVolumeContainer2`

### 容器间传递共享

**1.先启动一个父容器doc01**

`docker run -it --name doc01 liuzhuo/centos`
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111145928.png"/>

在 /dataVolumeContainer2 中：添加新的文件：doc01.txt
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111150102.png"/>

**2.将doc02、doc03容器都继承自doc01**

`docker run -it --name doc02 --volumes-from doc01 liuzhuo/centos`

```
--volumes-from  :  继承自哪个容器
```
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111150614.png"/>

查看：/dataVolumeContainer2 目录：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111150750.png"/>

在doc02中的 /dataVolumeContainer2 目录下：创建新的文件：doc02.txt
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111150908.png"/>

接着：`docker run -it --name doc03 --volumes-from doc01 liuzhuo/centos`

<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111151244.png"/>

查看：/dataVolumeContainer2 目录：
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111151340.png"/>

在doc03中的 /dataVolumeContainer2 目录下：创建新的文件：doc03.txt
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111151826.png"/>


大家到此，有没有觉得疑惑呢？ 明明doc03 只是继承 doc01 ，为啥连doc02的文件也共享了呢？这就是docker强大之处，其实就像一个网状结构一样，doc03 继承 doc01，而 doc01 与 doc02 互通，所以 doc02 与 doc03 也就互通了。

---

**回到doc01，可以看到doc02、doc03创建的文件**
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111151937.png"/>

**删除doc01，doc02修改doc02.txt文件，doc03中能检查到文件发生改变**

<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111152312.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111152540.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111152655.png"/>

验证了，虽然 doc03 继承与 doc01 ，现在将 doc01 停止了，但是还能与 doc02 互通。（网状结构）

**删除doc02后，doc03能否访问**
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111153020.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111153116.png"/>

现在，在doc03中，再添加一个新的文件：doc03_update.txt
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111153248.png"/>

**新建doc04容器，删除doc03容器**

<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111153938.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111154035.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111154132.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/docker/day05/QQ截图20190111154226.png"/>

---

**结论：**

**<font color="red">容器之间 配置信息的传递，数据卷的生命周期 一直持续到 没有容器使用它为止。</font>**