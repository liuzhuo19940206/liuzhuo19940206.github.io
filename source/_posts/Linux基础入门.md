---
title: Linux基础入门之安装
categories:
  - Linux
tags:
  - Linux
date: 2018-11-22 10:15:44
summary: Linux的基础入门篇，帮助大家入门的教程
---
Linux的基础入门篇，帮助大家入门的教程

## Linux的发行版

### 常见的Linux发行版

1）Red Hat Linux

　　Red Hat Linux 是 Red Hat 最早的发行的个人版本的Linux，其1.0版本于1994年11月3日发行。自从Red Hat 9.0版本发布后，Red Hat公司不再开发桌面版Linux发行版本，Red Hat Linux停止发布，而将全部的力量集中在**服务器版**的发布上面，也就是Red Hat Enterprise Linux版。2004年4月30号，Red Hat公司正式停止Rad Hat Linux的发行套件则与来着开源社区的Fedora进行合并，成为了**Fedora Core** 发行版本。

　　目前 Red Hat 分为两个系列：由Red Hat 公司提供收费技术支持和更新的 Red Hat Enterprise Linux，以及由社区开发的免费的 Fedora Core。

2）CentOS

　　CentOS全名为 "社区企业操作系统"（Community Enterprise Operating System），它由来自于 RHEL 依照开放源代码规定发布的源代码编译而成，由于 RHEL 是商业产品，因此必须将 Red Hat 的所有Logo改成自己的 CentOS标识，这就产生了CentOS操作系统。两者的不同在于，CentOS并不是包含封闭源代码软件。因此，CentOS不但可以自由使用，而且能享受CentOS提供的长期免费升级和更新服务。这是CentOS的一个很大的优势。

　　在2014年CentOS宣布与Red Hat合作，但CentOS将会在新的委员会下继续运作，并不受RHEL的影响。这个策略表明CentOS后续发展将由Red Hat作为强有力的支持。

3）SuSE Linux

　　SUSE 是德国最著名的Linux发行版，也享有很高的声誉，不过命运相当坎坷。据不完全统计，SUSE Linux现在欧洲Linux市场中占有将近80%的份额，大部分关键应用都是建立在SUSE Linux下的。

4）Ubuntu Linux

　　Ubuntu(中文谐音为：友邦拓、优般图、乌班图)是一个以桌面应用为主的Linux操作系统，基于Debian GNU/Linux，Ubuntu旨在为一般用户提供一个主要由自由软件构建而成的最新的同时又相当稳定的操作系统。Ubuntu具有庞大的社区力量，用户可以方便地从社区获取帮助。

---

**总结：**

初学者入门首选：CentOS系列，CentOS系列可以从官网或163开源、SOHU开源、阿里云开源站下载各个版本的安装介质。

桌面平台首选：Ubuntu Linux。

企业级应用首选：RHEL/CentOS系列

## 虚拟机技术学习Linux

### 虚拟机技术

虚拟机指通过软件模拟的具有完整硬件系统的功能的、运行在一个完全隔离环境中的完整计算机系统。

虚拟机会生成现有操作系统的全新虚拟机镜像，它与真实系统具有完全一样的功能，进入虚拟机后，所有操作都在这个全新的独立虚拟机系统里面进行，可以独立安装、运行软件，保存数据，拥有自己的独立桌面，这不会对真实的系统产生任何影响，而且能够在现有系统与虚拟机之间灵活切换。

### 使用虚拟机的好处

1）节约成本

　　如果在一台计算机上安装Linux和Windows系统，而不用虚拟机，有两个方法。一是安装多个硬盘，每个硬盘安装一个操作系统，这个方法的缺点是费用比较昂贵。二是在一个硬盘上安装双系统，这个方法的缺点是不够安全，因为系统的MBR是操作系统的必争之地，Windows更是霸道，每次重新安装系统都要重写系统的MBR，这样，几个操作系统可能会同时崩溃。而使用虚拟机软件既省钱又安全，因此对于新手来说，利用虚拟机学习Linux简直再好不过了。

2）安全便捷

　　在虚拟机上面安装Linux系统，不用担心会格式化掉自己的硬盘，甚至可以随意地对虚拟机系统进行任何设置和更新操作，可以格式化虚拟机系统硬盘，还可以重新分区虚拟机系统硬盘等等，因为虚拟机是在真实系统上运行的软件，对虚拟机系统的任何操作都是对软件的操作。

3）简单高效

　　利用虚拟机模拟出来的Linux系统和真实的Linux系统是一模一样的。现在各个公司专门的Linux服务器是不会让新生随意操作的，而供测试的Linux服务器一般有很紧缺，如果在自己的电脑上安装虚拟机Linux系统，就可以随意地学习测试，而不受任何环境影响。

### 虚拟机的运行环境和硬件需求

1）运行环境

流行的虚拟机软件有：VMware、**VirtualBox**，它们都有Windows和Linux两个版本，也就是说，它们可以安装在Windows和Linux两个平台下：在Windows平台可以虚拟出Windows、Linux、UNIX等多个操作系统，同理，在Linux平台上也可以虚拟出Windows、Linux、UNIX等多个操作系统计算机。

**注意：**运行虚拟机软件的操作系统叫做：Host OS，在虚拟机里面运行的操作系统叫做：Guest OS。

2）硬件需求

虚拟机软件是将两台以上的计算机的任务集成到一台计算机上来的，因此对硬件的要求比较高，主要涉及的是内存、硬件和CPU。内存要足够大，因为每个虚拟机都会占用一定的内存资源，内存的总大小等于各个虚拟机系统的总和。可喜的是，现在内存已经很便宜，因此就不是问题了。同样，硬盘空间也是每个虚拟机都要占用的，CPU现在都发展到了多核阶段，硬盘也不是问题。

### 虚拟机的安装与使用

1）VirtualBox虚拟机概述

VirtualBox是一款开源虚拟机软件。最初是由德国Innotek公司开发，由Sun Microsystems公司出品的软件，使用Qt编写，在Sun被Oracle收购后正式更名成Oracle VM VirtualBox。

VirtualBox可以说是最强大的免费虚拟机软件，它不仅具有丰富的特色，而且性能非常优异，并且简单易用。它可以虚拟的系统有：Windows、Mac OS X、Linux、OpenBSD、Solaris、IBM OS2，甚至Android 4.0等多种操作系统。

2）虚拟机软件的安装

VirtualBox 的官方网站是：`https://www.virtualbox.org`, 可以从此网站下载VirtualBox的稳定版本，目前最新的稳定版本的为：VirtualBox 5.2。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122114300.png"/>

这里，我们下载Windows版本的VirtualBox。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122114531.png"/>

Windows下安装VirtualBox软件很简单，只须要按照Windows常规方法安装方法安装即可完成，这里就不再讲述了。
安装完成后：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122115230.png"/>

### 创建虚拟机系统

打开：Oracle VM VirtualBox软件，进行虚拟机系统的创建，具体步骤如下：

#### 新建虚拟机
1）按 ctrl + N 快捷键新建虚拟机或者直接点击新建：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122115614.png"/>

#### 填写虚拟机信息
2）填写虚拟机的名称、虚拟机的类型、虚拟机的版本。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122135544.png"/>

#### 配置虚拟机内存
3）配置虚拟机内存大小，这里选择：4096M
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122133837.png"/>

#### 添加虚拟硬盘
4）添加虚拟硬盘

选择现在创建虚拟硬盘：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122134311.png"/>

#### 设置虚拟硬盘的文件类型
5）设置虚拟硬盘的文件类型：

选择VDI类型：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122134414.png"/>

#### 设置虚拟硬盘的空间分配方式
6）设置虚拟硬盘的空间分配方式

选择动态分配：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122134529.png"/>

#### 设置虚拟磁盘文件的位置和大小
7）设置虚拟磁盘文件的位置和大小

位置：选择自己喜欢的位置
大小：选择实际硬盘的合理大小即可
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122134855.png"/>

8）虚拟机系统创建成功后
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181122135649.png"/>

单击左侧的虚拟机名称，在右边可以看到此虚拟机的配置属性。

在设置页面中，可以对虚拟机的常规、系统、显示、存储、声音、网络、串口、USB设置、共享文件夹等多个方面进行设置。

#### 下载linux系统的ISO镜像
9）虚拟机上安装linux系统

在虚拟机上安装Linux系统，常用的方法有两种：光驱安装和ISO镜像文件安装。

这里，我使用ISO镜像文件安装。

10）到开源镜像站下载IOS镜像

推荐163镜像站、阿里云镜像站。

这里，我使用阿里云镜像站：`https://opsx.alibaba.com/mirror`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123100200.png"/>

选择：最新的版本，当前最新的是7.5。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123100328.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123100424.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123100604.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123100838.png"/>

各个版本的ISO镜像文件说明：

CentOS-7-x86_64-DVD-1804.iso　　　　　　　　标准安装版（推荐）

CentOS-7-x86_64-Everything-1804.iso　　　　 　完整版，集成所有软件（以用来补充系统的软件或者填充本地镜像）

CentOS-7-x86_64-LiveGNOME-1804.iso　　　　GNOME桌面版  

CentOS-7-x86_64-LiveKDE-1804.iso　　　　　　KDE桌面版  

CentOS-7-x86_64-Minimal-1804.iso　　　　　　精简版，自带的软件最少

CentOS-7-x86_64-NetInstall-1804.iso　　　　 　网络安装版（从网络安装或者救援系统）

这里，下载标准安装版：**CentOS-7-x86_64-DVD-1804.iso**

---

#### 关联虚拟机与CentOS的ISO镜像文件
11）将我们下载的CentOS_7 和 我们创建的虚拟机系统关联
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123132843.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123132945.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123133020.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123133116.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123133150.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123133224.png"/>

#### linux系统的安装流程

12）启动我们的centOS_7.5

如果出现错误的话，是你的电脑没有开启虚拟机化技术。

我们需要进入BIOS，将虚拟机化技术打开：

重启我们的电脑，通常按 F2 或者 F12、Esc等进入BISO界面。选择configuration，再选择Intel virtual technology，将其改为enable即可。

再次重启电脑后，打开virtualBox，进入Linux的安装流程。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123134107.png"/>

打开后，会发现centOS7有三个启动流程：Install CentOS7（立即安装），Test this mdia & Install CentOS7（测试安装介质并安装），Troubleshooting（故障修复）。我们选择：**Install CentOS7（立即安装）**
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123134640.png"/>

选择系统安装过程中的语言，这里选择English选项，当然，你可以选择简体中文，不过建议使用English安装。单击**continue**
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123134841.png"/>

此时，进入了系统安装的总体浏览界面，从图可以看出，分为三个部分：LOCALIZATION（本地化安装）、SOFTWARE（软件安装）、SYSTEM（系统安装）。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123135407.png"/>

进入LOCALIZATION（本地化安装）的 DATE & TIME：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123135942.png"/>

设置：Asia（亚洲）、Shanghai（上海）。点击左上角的Done。

进入LOCALIZATION（本地化安装）的 KEYBOARD（键盘设置）：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123140255.png"/>

对于KEYBOARD选项，选择English即可，也可以添加Chinese。

进入LOCALIZATION（本地化安装）的 LANGUAGE SUPPORT（语言设置）：

添加English、简体中文。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123140512.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123140544.png"/>

---

接下来，进入：软件安装设置，点击 INSTALLATION SOURCE
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123140817.png"/>

点击：SOFTWARE SELECTION（安装软件的配置信息）

我们知道，Linux系统，一般指的是Linux内核，而一些组织、公司在内核的基础上又进行了封装，即二次开发，就变成了现在的centOS、红帽等产品。这里的选项就是安装除了centOS内核外的软件。

- 初学者选择 CNOME Desktop 或 KDE Plasma Workspaces，这两种环境提供了非常友好的、直观的Linux桌面环境。
- 如果在Linux上开发，建议选择Development and Creative Workspaces
- 如果只是一个Linux环境，选择Minimal Install即可
- 如果在Linux上运行虚拟化程序，选择Virtualization Host
- 如果是搭建一个Linux服务器，那么建议Server with GUI。

在我们以后的工作中，一般我们的Linux都是作为服务器来使用的，所以，这里选择：**Server with GUI**。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123142003.png"/>

---

**接下来，进入磁盘分区部分，重点！！！**
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123142217.png"/>

出现了，我们设置虚拟机系统的磁盘空间大小的64G。

首先选中我们的64G那个的sda盘。然后在左下角会有两个分区的选项，第一个是Automaticlly configure partitioning，表示自动分区；第二个是 **I will configure partitioning**，表示手动分区。如果对分区不太熟的话，直接使用自动分区即可，但是，我们是学习Linux系统，所以，这里选择**手动分区**。

选择完毕后，单击Done。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123142724.png"/>

分区方案：有标准分区 Standard Partition、Btrfs、LVM 和 LVM Thin Provisioning（精简分区）

这里，选择标准分区即可。

接下来就要开始创建挂载点了。在此之前，进行一些必要的说明：

Linux系统下必需的分区为：根分区（/）和 交换分区（swap）。swap分区相当于windows下的虚拟内存，当内存不够的时候，会临时使用swap分区的空间。

swap分区的大小，一般是你的本机的物理内存的2倍。物理内存小于4G，那么swap：两倍；物理内存：4G~16G，那么swap：等于物理内存；物理内存大于16G，swap：0。一般swap不建议0，设置一定大小的swap还是有一定的作用的。

虽然Linux系统默认只需要：划分根分区和swap分区就可以了，但是不建议这么做，因为如果只划分了根分区，那么当根分区遭到破坏后，系统可以无法启动，存储在根分区中的资料也有可能丢失，这样很不安全。因此，建议给独立的应用分配独立的分区，这样即使某个分区被破坏，也不影响其他分区的数据。

以下是建议在安装系统时独立分配的分区

1）/boot: 存储系统的引导信息和内核等信息

2）/usr: 存储系统应用软件安装信息

3）/var: 存储系统日志信息。

根分区包含Linux系统所有的目录。如果在安装系统时只分配了根分区，那么上面的/boot,/user,/var都包含在根分区中，也就是说，这些分区将占用根分区的空间。如果将/boot,/usr,/var等单独划分，那么这些分区将不再占用根分区的空间。

---

先创建**根分区**，根分区空间尽量大点，这里，我选择了20G。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123144507.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123144901.png"/>

添加/boot分区：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123145024.png"/>

添加/usr分区：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123145218.png"/>

添加/var分区：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123145341.png"/>

添加**swap交换区**
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123145635.png"/>

剩下的空间，我们可以再创建一个分区，用来保存用户的数据信息：
添加/mydata分区：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123145921.png"/>

最终分区分配完毕后的结果：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123150055.png"/>

---

点击左上角的Done。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123150315.png"/>

点击：Accept Changes

---

进入 SYSTEM ：KDUPM
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123150442.png"/>

kdump：主要用来记录系统出错后的信息，用来侦查系统出错的原因，开启后，会占用一定的内存资源。

这里，我们是学习，我就关闭了，如果是你是上班，开发的话，就将其开启。

---


进入 SYSTEM ：NETWORK & HOST NAME
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123150800.png"/>

默认情况下，网卡处于断开连接状态，可单击右上角的 ON/OFF（开关）按钮，将网卡激活。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123151058.png"/>

激活后，我们看到了网卡自动帮我们配置了ip地址，网关ip地址，DNS服务地址等。

如果想自己手动配置，可以点击右下角的：Configure。

进入了设置页面：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123151255.png"/>

可以根据连接网络的类型配置：有线、无线、VPN 或 DSL的连接，在这里选择 Automatically connect to this network when it is available 和 All uesrs may connect to this network的复选框，这样就可以实现系统启动后自动连接。

在网络配置部分，看似很多选项需要配置，其实需要配置的并不多。选择IPV4 Settings。

在Method选项中：有Automatic DHCP、Manual、Link-Local Only等，这里选择Manual。

接着就可以添加 IPv4 的ip地址，这里添加的ip地址：192.168.56.101，子网掩码：255.255.255.0，网关：192.168.56.1，然后DNS Server：223.5.5.5.
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123152436.png"/>

点save保存。网卡会自动尝试网络连通性，配置完成后的效果：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123152608.png"/>

**PS：不想手工配合的话，直接开启激化网卡就好，后面的操作不用进行的**

---

进入 SYSTEM ：SECURITY POLICY

安全策略，选择标准的策略即可。（不开启安全策略也行）

---

到此为止，我们的基本设置已经完成，点击 Begin Installation。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123153830.png"/>


在安装的过程中，我们需要设置Linux的管理员账号ROOT的密码，**密码不能过于简单，否则会提示你，让你重新设置。**
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123153638.png"/>


在安装的过程中，也可以设置普通用户，输入用户名和密码即可。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123153657.png"/>


**注意：如果要设置root和普通用户，请在安装完成之前进行，否则安装完成后，就不能设置了！！！**

---

安装完成后，点击Reboot按钮重启系统。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123155718.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123155902.png"/>

选择接受：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123155937.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123160010.png"/>

用户登入界面：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123160111.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123160151.png"/>

进入开机引导的界面：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123160307.png"/>

选择，你自己喜欢的语言，English，汉语等，进行引导安装

选择，键盘的输入：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123160430.png"/>

隐私：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123160520.png"/>

选择在线用户，没有就跳过
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123160620.png"/>

开始使用Linux系统：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123160723.png"/>

---

到此，Linux系统，终于安装完毕，也看到了我们Linux系统的界面了
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123160817.png"/>

### Linux系统下的常用指令

Linux系统由桌面控制台和字符控制台组成，桌面系统其实就是我们安装软件包时的X-Window视窗，而X-Window的实质是在命令行下运行的一个应用程序。字符控制台是Linux系统的核心，大部分操作都是在字符控制台下面完成的，即：终端。

默认Linux下有6个字符控制台，每个控制台可以独立作业，互不影响，这真正体现了Linux系统下的：多用户、多任务的特性。

在图形界面下要切换到字符界面时，只需要按：**ctrl+alt+F2~F7组合键**中的任何一个，即可进入字符界面。相反如果要从字符界面切换到图形界面的话，可以在字符界面输入：startx 或者 **ctrl+alt+F1**组合键.

虚拟机和物理机之间的鼠标和键盘切换问题，默认是通过：**右下角的ctrl键**来切换的。这个右下角的ctrl键也称为：热键或者主机（host）键。

主机键和其他键组合，可以实现对虚拟机的快捷操作，例如：Host+Del组件键：表示键盘上的ctrl+alt+del组合键，Host+R：表示重启虚拟机，Host+H：表示正常关闭虚拟机。

Linux系统的关闭过程

1）shutdown [-fFhknrc参数名称] [-t 秒数] 时间 [警告信息]

-f: 重新启动时，不执行fsck。 fsck：是Linux下的一个检查和修复文件系统的程序。

-h：将系统关机，在某种程度上功能与halt命令相当

-k：只发送信息给所有的用户，但并不会真正关机

-n：不调用init程序关机，而是由shutdown自己进行（一般关机程序是由shutdown调用init来实现关机动作的），使用此参数关机速度快，不建议

-r：关机后重启

-c：取消前一个shutdown命令。

-t[秒数]：发送警告信息和关机信息之间要延迟多少秒。警告信息将提醒用户保存当前进行的工作。

[时间]：设置多久时间后执行shutdown命令。时间参数有 hh:mm 或 +m 两种模式。例如： shutdown 16:50 :表示将在16:50关机。

now：表示立即关机。

常用指令：

立即关机

```
shutdown -h now
```

立即关机重启

```
shutdown -r now
```
设定5分钟后关机，同时发出警告信息给登录的Linux用户。
```
shutdown +5 "System will shutdown after 5 minutes"
```

---

### 虚拟机的网络连接是三种方式

1）桥接模式

好处：大家都在同一个网段，相互可以通讯。
坏处：因为ip地址有限，可能造成ip冲突

因为桥接模式下的网络，是会帮我们的虚拟机的Linux系统，自动分配一个ip地址，这个ip地址会和我的宿主机在一个网段内，比如：我们的宿主机的ip地址是192.168.14.100 ，那么centOS虚拟机的ip就会是192.168.14.xxx（比如192.168.14.120）。在该网段下的其他宿主机，张三（192.168.14.110）就能直接访问到我的centOS虚拟机。

如果每个人都使用这种模式来开启虚拟机的网络设置，那么ip地址就不够用了，容易ip地址冲突！！！

2）Nat [网络地址转换模式]

好处：虚拟机不占用其他的ip,所以不会ip冲突
坏处：内网的其他人不能和虚拟机通讯

Nat模式下的话，会在我们的宿主机上面创建一个新的ip地址，会和我们的windows宿主机的ip地址不在一个网段上面，比如：我们的是192.168.14.64，那么创建的新的ip地址会是：192.168.102.1。不在一个网段上面，而且也会在centOS虚拟机上面分配一个和新的windows上面ip地址同一个网段的ip地址，比如：192.168.102.128。
即：centOS虚拟机ip地址与新的windows的ip地址连通，然后新的windows的ip与我们本身的windows的ip互通，这样就能访问我们的centOS虚拟机了，但是，在该网段下的其他用户，李四：192.168.14.112，就不与我们的centOS虚拟机（192.168.102.128）通信了，不过我们的centOS虚拟机（192.168.102.128）可以与李四通信，因为centOS虚拟机与本机连通，可以通过本机的ip（192.168.14.64）与李四通信，在一个网段下面。


3）仅主机模式（Host-only）

意思很明确了，就是单独一台电脑。linux不能访问外网（一般实际生产中，很少用）

---

<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123170336.png"/>

### centOS的终端使用和联网

#### 终端的使用

在centOS系统中，右键打开终端：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123173038.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123172554.png"/>

会发现是白色的背景，黑色的字体，看着不舒服，我们修改
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123172951.png"/>
选择颜色：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123172854.png"/>

修改后：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123173132.png"/>

---

#### 联网

启动：火狐浏览器
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123173303.png"/>

在浏览器中输入：`www.baidu.com`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123173520.png"/>

发现，连接不上网。

怎么联网呢？

我们的虚拟机网络设置的是：NAT[网络地址转换]
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123173701.png"/>

根据，上一节的介绍，我们的宿主机应该有两个ip地址：

打开windows下的终端：home+R：cmd

输入：ipconfig
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123175311.png"/>

能够看到，我们的ip地址。

现在打开，centOS中的终端：

在linux系统中，使用 ifconfig 来查看ip地址
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123175508.png"/>

发现，根本没有ip地址，所以我们不能联网。

现在来设置ip地址，点击右上角的声音、电池、亮度的图标
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123175619.png"/>

点击有线设置：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123175819.png"/>

点击有线连接的上面的齿轮进行具体的设置：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123175927.png"/>
点击IPv4：
改为：DHCP（自动设置）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123180012.png"/>

单击：应用
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123180158.png"/>

打开有线连接：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123180252.png"/>

进入终端：ifconfig
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123180417.png"/>

现在已经帮我们自动配合了，IP地址了，这里是：10.0.2.15

再次打开：火狐浏览器输入：`www.baidu.com`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day01/QQ截图20181123181048.png"/>

联网成功，只要你的宿主机能够联网，那么centOS虚拟机也就能够联网了。

**注意：我使用的是virtualBox，照理说NAT模式下，应该会有一个新的windows的ip地址，而且是不同的网段，但是这里在windows下ipconfig，看不到那个新产生的ip地址，在centOS下的自动生成的ip地址应该会和新生成的windows的ip在同一个网络，这里也看不出来，但是，如果你使用的是VMWare虚拟机的话，就能发现。至于什么原因，我也不清楚，以后解决了，会留言告诉大家！！！**

**PS：这里使用的是DHCP：动态帮我们配置的ip地址，每次启动都会变动，以后我们会学习静态ip分配**





