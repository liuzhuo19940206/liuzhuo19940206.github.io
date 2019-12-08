---
title: Linux基础入门之进阶
categories:
  - Linux
tags:
  - Linux
date: 2018-11-23 20:33:02
summary: Linux基础入门的目录结构、远程登入
---

Linux基础入门的目录结构、远程登入等

## Linux的目录结构

### Linux的基本介绍

linux的文件系统是采用级层式的**树状目录结构**，在此结构中的最上层是根目录“/”，然后在此目录下再创建其他的目录。

深刻理解linux树状文件目录是非常重要的，这里我给大家说明一下。

记住一句经典的话：<font color="red">**在Linux世界里，一切皆文件（即使是一个硬件设备，也是使用文件来标志）**</font>

### linux的目录结构图

<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123210048.png"/>

打开我们的centOS虚拟机，点击计算机，也会出现：根目录下的目录结构：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123210800.png"/>

**PS：如果你想使用VirtualBox的全屏功能，需要安装增强功能。**

点击设备：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123211621.png"/>

然后点击：安装增强功能：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123211805.png"/>

然后：输入root的密码。

安装完后，**按下回车键**，就安装成功了。

如果你的安装失败，是因为你的系统需要安装：gcc, kernel, kernel-devel。

于是使用yum安装：`yum install -y gcc kernel kernel-devel`

桌面上面，就会出现一个VBox_GAs_xxx的光盘图标。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123212208.png"/>

双击那个光盘：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123213629.png"/>

切换成root用户，在终端下面进入那个光盘下面，然后：`sh VBoxLinuxAdditions.run`

<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123220916.png"/>

安装成功后，重启虚拟机就好了：就可以使用全屏的功能了。

---

回到我们的Linux目录结构：

基本介绍：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123214545.png"/>

### 具体的目录说明
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123214859.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123215006.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123215252.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123215959.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181123220105.png"/>

### 对linux目录结构的小结

1)在linux中，目录结构 有一个  根目录 / , 其他的目录都是在 / 目录分支。

2)在linux中，有很多目录，是安装后，自动生成的目录，每个目录都会存放相应的内容，不要去修改.

3)在linux中，所有的设备都可以通过文件来体现(字符设备文件[比如键盘，鼠标]，块设备文件[硬盘])

4)**在学习linux时，要尽快的在脑海中，形成一个 目录树**


## Linux系统之远程登录与上传下载

为啥要远程登录呢？我们不能直接在我们的虚拟机上面操作吗？登录账户和密码后，就可以直接操作呀？
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124100504.png"/>

那是因为，在我们实际上班的时候，我们不是使用Windows电脑安装虚拟机来操作Linux系统的，linux服务器是在机房里面，我们每个开发人员，不可能每次要操作linux服务器就去机房，那样太麻烦，而且效率极低。所以，我们需要在自己的windows电脑上面远程登录到机房中的linux服务器。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124100938.png"/>

常见的远程登录软件有：Xshell、SecureCRT、SmartTTY等等

### 远程登录之Xshell

#### 介绍

Xshell 是目前最好的远程登录到Linux操作的软件，流畅的速度并且完美解决了**中文乱码**的问题， 是目前程序员首选的软件。

Xshell 是一个强大的安全终端模拟软件，它支持SSH1, SSH2, 以及 Microsoft Windows 平台的 TELNET 协议

Xshell 可以在Windows界面下用来访问远端不同系统下的服务器，从而比较好的达到远程控制终端的目的。

#### 安装与配置

1）到Xshell官网上面去下载

`http://www.netsarang.com/`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124111119.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124111225.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124111343.png"/>

2) 安装Xshell软件

傻瓜式安装即可。

安装完毕后，双击Xshell软件：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124112122.png"/>

点击新建会话：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124112212.png"/>

填写相关信息：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124112620.png"/>

连接：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124112738.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124124930.png"/>

如果出现连接失败的话，看看你的linux的sshd服务是否开启：

在虚拟机中的终端中输入：setup
如果不是root用户，会让你先输入root的密码。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124123720.png"/>

选择系统服务后，回车。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124123855.png"/>

在其中找到sshd.service,看它的前面是否有 * 号，有的话，说明已经开启了，没有的话，使用**空格**开启。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124124037.png"/>

然后使用：tab键进入到确定，然后回车确定即可。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124124357.png"/>

然后使用tab键到退出。此时sshd服务就开启了。

验证sshd服务是否开启：`service sshd status`

出现：active的绿色字体，说明开启成功！
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124124648.png"/>

再次使用Xshell连接我们的虚拟机：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124124930.png"/>

发现还是连接失败，这是因为我们的宿主机的ip地址是：10.6.11.123，而我们的linux的ip地址是：10.0.2.15
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124125343.png"/>

在宿主机下，ping我们的虚拟机的linux的ip，发现超时，即：宿主机与虚拟机的linux不连通
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124125524.png"/>

所以，只要我们的宿主机与虚拟机的linux服务器能够连通的话，Xshell才能连接成功。

现在修改我们的linux的网络配置，添加网桥模式：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124125734.png"/>

重启我们的centOS虚拟机：

发现，现在我们已经有了两个网卡：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124125911.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124130023.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124130141.png"/>

现在使用我们的宿主机 ping 网桥模式下分配的ip地址，我这里就是：10.6.11.104
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124130405.png"/>

最后，修改我们的Xshell下的主机的ip地址（网桥模式下的ip地址）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124130556.png"/>

点击确定，连接：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124130641.png"/>

然后，会让你输入连接的用户名和密码：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124130728.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124130819.png"/>

**PS：如果以上还是不能成功，请你关闭防火墙**

systemctl disable 服务名 service    永久关闭防火墙
systemctl status firewalld.service    查看防火墙
systemctl stop firewalld.service    关闭防火墙
systemctl start firewalld service    打开防火墙

---

验证我们的远程登录是否有效，在Xshell界面中，进入Desktop，然后创建一个hello文件：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124140900.png"/>

然后在我们的root用户的桌面下，就会出现一个hello的文件：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124140951.png"/>

### 远程上传下载之Xftp

#### Xftp的简单介绍

是一个基于 windows 平台的功能强大的 SFTP、FTP 文件传输软件。使用了 Xftp 以后，windows 用户能安全地在 UNIX/Linux 和 Windows PC 之间传输文件。

#### Xftp的安装配置

到官网上面下载：`https://www.netsarang.com/products/xfp_overview.html`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124151724.png"/>

和Xshell的安装类似，我就不演示了。

下载完成后：打开Xftp软件：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124153248.png"/>

新建我们的会话：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124153555.png"/>

连接：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124153720.png"/>

输入root的密码：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124153803.png"/>

成功后的效果图：（左边windows的桌面，右边linux系统的用户根目录）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124153946.png"/>

如果你的右边的linux系统出现中文乱码的话：点击绿色的小齿轮
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124154117.png"/>

然后，点击选项，编码选择utf-8即可：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124154214.png"/>

在右边的linux系统中右键刷新后，就不会中文乱码了。

#### Xftp的简单使用

1）从windows系统中，上传图片到linux系统中

在左边的windows界面下，随便找到一个图片，右键选择**传输**即可。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124154555.png"/>

完成后，在右边的linux系统中，就会多出一张图片
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124154724.png"/>

打开我们的虚拟机，也能看到那张图片：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124154838.png"/>

2）从linux系统下载文件到我们的windows系统中

一样的操作，在右边的linux系统中，随便上传一个文件即可。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124155039.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124155236.png"/>

打开我们的windows桌面：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124155351.png"/>

**注意：在上传文件的时候，文件上传的目的地就是你现在的打开的目的地的目录，比如你的目的地linux打开在home目下，那么从windows系统下上传的文件就会传输到linux的home目录下**

**PS：**当我们在实际工作中，如果需要部署一个项目，则应当先压缩后，再上传，上传后，使用linux的相关的解压缩命令，来解压。

### SecureCRT的安装和使用

#### 基本的介绍

是用于远程登录Linux的软件。SecureCRT 也是一款常用的远程登录Linux的软件，在**大数据开发**中使用较多。

#### 安装

下载绿色安装板即可，直接拷贝整个目录就可以用了。

#### 使用

打开SecureCRT的运行文件
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124161136.png"/>

新建连接：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124161258.png"/>

新建会话：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124161419.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124161604.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124161645.png"/>

连接：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124161719.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124161741.png"/>

输入root密码即可：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124162002.png"/>

出现中文乱码问题：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124162055.png"/>

解决中文乱码问题：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124162224.png"/>

再次连接：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124162521.png"/>

测试：

直接输入：`touch hello`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124162827.png"/>

打开我们的虚拟机：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124162918.png"/>

## Vi和Vim编辑器

### vi和vim的简单介绍

所有的 Linux 系统都会内建 vi 文本编辑器。

Vim 具有程序编辑的能力，可以看做是Vi的增强版本，可以主动的以字体颜色辨别语法的正确性，方便程序设计。代码补完、编译及错误跳转等方便编程的功能特别丰富，在程序员中被广泛使用。我们只需要掌握它的基本使用即可。

### vi和vim的三种模式

#### 正常模式

以 vim 打开一个文件就直接进入正常模式了(这是默认的模式)。在这个模式中， 你可以使用『上下左右』按键来移动光标，你可以使用『删除字符』或『删除整行』来处理档案内容， 也可以使用『复制、贴上』来处理你的文件数据。在正常模式下可以使用快捷键。

#### 插入模式(编辑模式)

按下**i（insert）**, I, o, O, a, A, r, R等任何一个字母之后才会进入编辑模式, 一般来说按**i**即可.

#### 命令行模式

在这个模式当中， 可以提供你相关指令，完成读取、存盘、替换、离开 vim 、显示行号等的动作则是在此模式中达成的！
（ Esc + ：进入该模式 ）

### 快速入门

在linux系统下，编写一个java程序

打开Xshell软件：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124164946.png"/>

此时，桌面上面还没有hello.java文件。

输入：`vim hello.java`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124165113.png"/>

此时，就进入了正常模式，你会发现，此时，不管你在键盘上面怎么输入，都不会输入进去。我们需要切换到编辑模式下：输入i

就会进入插入模式：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124165446.png"/>

现在怎么保存退出呢？需要切换到命令行模式下：（ Esc + ：）

然后输入：wq（保存并退出）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124165701.png"/>

回车后，就回到我们的终端下面，再次输入：ll
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124165845.png"/>

查看我们刚刚编写的hello.java文件：（cat hello.java）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124165954.png"/>

说明刚刚的hello.java文件，保存成功！

### vi和vim模式的互相切换
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124170148.png"/>

：wq 修改保存并退出

：q  你打开一个文件，然后觉得没有修改的，直接输入q退出即可

：q！你打开一个文件，然后修改了，但是觉得不想保存修改的内容，那就q！强制退出并不保存之前修改的内容

### vim和vi的快捷键的使用

常用的快捷键的使用：

1) 拷贝当前行（yy） , 拷贝当前行向下的5行  （5yy），并粘贴（ p ）。【快捷键在正常模式下使用】

2) 删除当前行（dd）  , 删除当前行向下的5行 （5dd）。【快捷键在正常模式下使用】

3) 在文件中查找某个单词 [命令模式下输入 **/关键字** ， 回车 查找 ,  正常模式下输入 n 就是查找下一个 ]

4) 设置文件的行号，取消文件的行号. [命令行下  : set nu  和  :set nonu]

5) 编辑 /etc/profile 文件，使用快捷键到底文档的 **最末行[G]**和 **最首行[gg]** 【正常模式下】

6) 在一个文件中输入 “hello” , 然后又撤销这个动作 u  【正常模式下】

先是在插入模式下，修改了文件的内容，然后觉得不想修改，那么切换到正常模式下，输入u。

7) 编辑  /etc/profile 文件，并将光标移动到  20行 shift + g

先在命令行模式下：set nu，看到行号，然后在正常模式下，输入：20 + shift + g ，就会跳转到第20行号的位置。

---

更多快捷键的使用：

正常模式下：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124173155.png"/>

编辑模式下：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124173454.png"/>

命令行模式下：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124173621.png"/>

## 开机、重启和用户登录注销

### 关机&重启命令

基本介绍:

shutdown:
```
shutdown    –h    now   	  立该进行关机  【halt】
shudown     -h     1              1分钟后会关机了
shutdown    –r     now  	  现在重新启动计算机  [reboot]
```

halt：立即关机

reboot：现在重新启动计算机

sync：把内存的数据同步到磁盘.

**注意细节：**

不管是重启系统还是关闭系统，首先要运行sync命令，把内存中的数据写到磁盘中，防止数据丢失！

### 用户登录和注销

#### 基本介绍

1）登录时尽量少用root帐号登录，因为它是系统管理员，最大的权限，避免操作失误。可以利用普通用户登录，登录后
再用 "su - 用户名" 命令来切换成系统管理员身份.

2）在提示符下输入 logout 即可注销用户【不同的shell 可能不同(logout  exit)】

#### 使用细节

1) logout 注销指令在图形运行级别(简单提一下：0-6个级别)无效，在运行级别 3下有效.

即：在我们的图形化界面下的终端，输入：logout 无效。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124175449.png"/>

运行级别3：代表的就是远程登录。

在Xshell下，输入：logout 就退出了
<img src="https://gakkil.gitee.io/gakkil-image/linux/day02/QQ截图20181124175622.png"/>


2) 运行级别这个概念，后面给大家介绍
