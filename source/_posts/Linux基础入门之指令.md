---
title: Linux基础入门之指令
categories:
  - Linux
tags:
  - Linux
date: 2018-11-25 20:52:46
summary: 本篇会介绍Linux系统的常用指令
---

本篇会介绍Linux系统的常用指令

## Linux实操指令

在我们实际工作中，是不会直接到服务器机房去登录linux系统，然后在上操作的，也不会操作图形化界面。

所以，我们必须掌握一些实用的指令，通过命令来操作linux系统。

### 运行级别

1）基本介绍

运行级别说明： 

0 ：关机 
1 ：单用户  [类似安全模式， 这个模式可以帮助**找回root密码**]
2：多用户状态没有网络服务
**3：多用户状态有网络服务 [字符界面]**
4：系统未使用保留给用户
**5：图形界面 **
6：系统重启  

常用运行级别是 3 和 5 ，要修改默认的运行级别可改配置文件【/etc/inittab】。

**/etc/inittab** 文件中： **id:5:initdefault: **   //这一行中的数字就是默认的运行级别

命令：init  [012356]  ：切换运行级别

---

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181125212656.png"/>

以上是CentOS 7.x版本之前的系统中使用的。而CentOS 7.x版本中，由于采用了systemd管理体系，因此以前运行级别（runlevel）的概念被新的运行目标（target）所取代，target的命名类似于 " multi-user.target " 这种形式.

比如原来的运行级别：3（runlevel3）对应于新的多用户目标 " multi-user.target ",运行级别5就对应于" graphical.target "。因为systemd机制中不再使用runlevel的概念，所以/etc/inittab也不再被系统使用。

在新的systemd管理体系中，默认的target通过软连接来实现的。

2) 要查看系统的默认target，可以执行如下：
```
ll /etc/systemd/system/default.target
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181125220550.png"/>

由此可知，现在系统的默认target为 " graphical.target " , 相当于 runlevel5.

3) 修改默认的运行级别为3

如果要修改默认的target为 "multi-user.target",可以先删除存在的软链接，然后重新建立软链接指向到 " multi-user.target " 即可。

操作过程如下：**(下面会有更简单的修改方式)**
```
rm -rf /etc/systemd/system/default.target

ln -sf /lib/systemd/system/multi-user.target  /etc/systemd/system/default.target

ll /etc/systemd/system/default.target
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181125221432.png"/>

重启linux系统，reboot

你会发现我们的linux系统启动后，直接进入了字符界面，没有图形化界面。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181125221515.png"/>

---

4）查看运行级别与target的对应关系，可以执行
```
ll /lib/systemd/system/runlevel*.target
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181125222306.png"/>

即：

poweroff.target 对应 runlevel0：关机模式。

rescue.target 对应 runlevel1：单用户或救援模式。

multi-user.target 对应 runlevel2、runlevel3、runlevel4：字符界面多用户模式。

graphical.target 对应 runlevel5：图形界面多用户模式。

reboot.target 对应 runlevel6：重启模式。

---

以前修改默认的运行级别是，通过修改 /etc/inittab文件来实现的，

在以前的/etc/inittab文件的最后一行是：

id:5:initdefault:  //表示默认的运行级别是5，图形界面多用户模式。只需要修改这个数字就可以修改默认的运行级别了。

而CentOS7.x版本的 /etc/inittab文件为：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181125223455.png"/>

只能通过上述修改软链接的方式来修改默认的target。

现在我们把 " multi-user.target " 修改为：" graphical.target "

<font color="red">**简便的方式：**</font>

### 查看默认的 target(运行级别)：
```java
systemctl get-default
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图2018112522423.png"/>

### 修改默认的 target(运行级别)：
```
systemctl set-default graphical.target
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181125224511.png"/>

---

以前的版本，使用： init [0213456] 来切换运行级别，现在的版本使用：systemctl isolate xxx.target （以前的init也适用）


### 面试题

在忘记了root的密码的情况下，怎么登入系统，并修改root的密码？

重启我们的linux系统，首先我们进入开机界面.

#### 错误操作

1) 按e进行选择，选择编辑选项启动
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126105206.png"/>

看上图的底部，有：Press e 进入编辑界面。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126102855.png"/>

2) 使用键盘上面的向下的按钮，找到：linux16 开头的那行。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126105357.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126110106.png"/>

3) 看到上图的底部，使用 Ctrl + x 去开始启动系统。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126110315.png"/>

现在已经进入了系统了，而且是单用户的模式，所以不需要输入密码，就进入root用户了。

4) 然后使用：passwd root 修改root的密码。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126110507.png"/>

5) 修改root密码成功后，退出我们的单用户模式，输入：`exec /sbin/init` 回车
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126110721.png"/>

6）输入我们的修改后的root密码
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126111121.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126111301.png"/>

此时，你会发现，你刚刚修改的root密码居然不好使了，其他用户的密码也不好使了，因为上述的操作是在救援模式下的操作，实际上还是改变不了我们实际的linux系统的。

#### 正确操作

1）按e进行选择，选择编辑选项启动
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126105206.png"/>

2）找到linux16开头的那行：修改 ro 为： rw init=/sysroot/bin/sh
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126112147.png"/>

3) Ctrl + x 执行
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126113403.png"/>

进入系统后，其实只是进入了一个安全模式下的内存系统，并不是真正的咱们正常使用的linux系统。

`ls /sysroot/` 下才是我们正常的linux系统里面的文件。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126113642.png"/>


**4）使用命令 chroot /sysroot 切换到正常系统中**
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126113933.png"/>

5）使用 passwd root 修改root的密码
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126114105.png"/>

**6）修改密码成功后，一定要使用 touch /.autorelabel 指令**

如果不使用的话，会导致系统无法正常登陆！！！
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126114406.png"/>

7）退出救援模式，ctrl + d

输入ctrl + d 后，屏幕上会出现：logout
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126114848.png"/>

8）重启系统，在屏幕上输入：reboot

输入新修改的root密码，就能进入linux系统了。

**简单说明一下：**

上面的修改的ro，ro=readonly权限，只要读的权限，所以修改成rw，读和写的功能。

touch /.autorelabel 这句是为了selinux生效。

#### 这样进入linux的单用户模式修改密码安全吗？

大家都说，linux系统的安全意识最强，但是这样就轻易的修改root的密码，安全意识强吗？这样的前提是你能够进入你们公司的服务器机房，然后打开linux系统，在linux系统机器上面直接操作才行，不然你的远程登录linux是进入不了刚刚的画面的，你都能进入服务器机房了，你的权限已经很大了，所有linux开发者认为你有权这样修改root密码。

---

## 帮助指令

### man获得帮助信息

#### 基本语法
```
man [命令或配置文件]（功能描述：获得帮助信息）
```

#### 应用实例

案例：查看ls命令的帮助信息
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126175357.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126175501.png"/>

使用回车：Enter，看到更多的内容。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126175700.png"/>

输入q退出查看。

### help指令

#### 基本语法
```
help  命令 （功能描述：获得shell内置命令的帮助信息）
```

#### 应用实例

案例：查看cd命令的帮助信息

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126180007.png"/>

## 文件目录类

### pwd 指令

#### 基本语法
```
pwd (功能描述：显示当前工作目录的绝对路径)
```

#### 应用实例

案例：显示当前工作目录的绝对路径

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126183105.png"/>

### ls指令

#### 基本语法
```
 ls  [选项]  [目录或是文件]

常用选项
-a  ：显示当前目录所有的文件和目录，包括隐藏的 (文件名以.开头就是隐藏)。
-l  ：以列表的方式显示信息
-h  : 显示文件大小时，以 k , m,  G单位显示
```

#### 应用实例
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126183222.png"/>

### cd 指令

#### 基本语法
```
cd  [参数] (功能描述：切换到指定目录)

常用参数
绝对路径【从 / 开始定位】和 相对路径【从当前的位置开始定位】 
cd ~   或者 cd     回到自己的家目录
cd ..  或者 cd ../ 回到当前目录的上一级目录

```

#### 应用实例

理解绝对路径和相对路径

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126184038.png"/>

案例1：使用绝对路径切换到root目录　　[cd /root]
案例2：使用相对路径到/root 目录　　　　[cd ../root]
案例3：表示回到当前目录的上一级目录 　[ cd ..]
案例4：回到家目录  　[ cd ~ ]

### mkdir指令

**说明**

mkdir指令用于创建目录

#### 基本语法
```
mkdir  [选项]  要创建的目录

常用选项
-p ：创建多级目录
```

#### 应用实例

案例1: 创建一个目录 /home/dog

`mkdir  /home/dog`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126185934.png"/>

案例2: 创建多级目录 /home/animal/tiger

`mkdir  -p  /home/animal/tiger`

注意这里的animal目录是不存在的！！！
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126190302.png"/>

### rmdir指令

说明

rmdir指令删除**空目录**

#### 基本语法
```
rmdir  [选项]  要删除的空目录

```

#### 应用实例

案例1: 删除一个空目录 /home/dog

`rmdir  /home/dog` [要求 /home/dog 是空目录]
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126191051.png"/>

案例2: 删除一个不是空的目录 /home/animal

animal里面还有一个tiger目录。

rmdir：只能删除空目录，不能删除非空目录；只能使用rm指令来删除非空目录。

`rm -rf /home/animal`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126191512.png"/>

### touch指令

说明

touch指令创建空文件， 还可以更新文件的访问和修改时间。

#### 基本语法
```
touch [选项] 文件名称

常用选项
-a 改变文件的访问时间为当前时间
-m 改变文件的修改时间为当前时间
-c 如果文件不存在，不创建也不提示
-d或者-t 使用指定的日期或时间
无 创建一个不存在的文件
```

#### 应用实例

案例1: 创建一个空文件 hello.txt

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126192008.png"/>

案例2: 修改一个已存在的文件的时间修改时间
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126193143.png"/>

### cp指令[重要]

说明

cp 指令：拷贝文件到指定目录

#### 基本语法
```
cp [选项] source【源文件】 dest【目的文件】

常用选项
-r ：递归复制整个文件夹
-a ：在复制目录时使用，它保留所有的信息。包括文件链接、文件属性、并递归地复制目录
-d ：复制时保留链接，这样不会失去链接文件
-i ：如果已经存在相同文件名的目标文件，则提示用户是否覆盖
```

#### 应用实例

案例1: 将 /home/aaa.txt 拷贝到  /home/bbb 目录下：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126195012.png"/>

案例2：将 /home/text文件，拷贝到 /home/zsf中：

text文件：里面还有三个文件，a.txt , b.txt , c.txt.
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126200111.png"/>

**注意细节：当你复制到的目的文件夹中有复制过来的文件时，会提示你是否覆盖，很烦，使用\cp强制复制。**
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126200206.png"/>

### rm指令

说明

rm 指令：移除文件或目录

#### 基本语法
```
rm  [选项]  要删除的文件或目录

常用选项
-r ：递归删除整个文件夹
-f ：强制删除不提示
-i : 交互式删除，即在删除之前进行确认
```
#### 应用实例

案例1: 将 /home/aaa.txt 删除

`rm  /home/aaa.txt`

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126201427.png"/>

案例2: 递归删除整个文件夹 /home/bbb

`rm –r  /home/bbb`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126201742.png"/>

**使用细节**

强制删除不提示的方法：带上 -f 参数即可 `rm –rf  /home/bbb`

### mv指令

说明

mv ：移动文件到目录 或 重命名文件或目录。

#### 基本语法
```
mv  oldNameFile newNameFile     (功能描述：重命名)
mv /temp/movefile /targetFolder (功能描述：移动文件或目录)

常用选项
-i：交互式操作，在对已经存在的文件或目录覆盖时，系统会发出询问。
-f：禁止交互，强制覆盖。
```
#### 应用实例

案例1: 将 /home/aaa.txt 文件 重新命名为 bbb.txt 
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126203428.png"/>

案例2: 将 /home/text目录 重新命名为 big目录
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126203513.png"/>

案例3: 将 /home/bbb.txt文件 移动到 big目录中：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126203846.png"/>

思考，能不能将一个目录移动到另一个目录中呢？（可以）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126204015.png"/>

### cat指令

说明

cat 查看文件内容（只读），同时也可以合并文件。

#### 基本语法
```
cat  [选项] 要查看的文件     //查看文件的内容

cat  文件1  文件2  > 文件3   //将文件1和文件2的内容合并后，存储到文件3中。

常用选项
-n ：显示行号
```

#### 应用实例

案例1:  查看 /ect/profile  文件内容，并显示行号。

`cat /etc/profile`

直接查看完毕，跳转到文件的底部。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126205206.png"/>

`cat -n /etc/profile` ：显示行号。

所以，一般配合more指令来分页显示。

`cat -n /etc/profile | more`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126205442.png"/>

敲击：空格键来翻页。

案例2:  将a.txt文件和b.txt文件合并，放到f.txt文件中（a和b文件存在，f不存在）

a.txt文件中的内容：aaaaa
b.txt文件中的内容：bbb

`cat a.txt b.txt > f.txt` ：自动帮我们创建f.txt文件，并把a和b内容合并到f文件中
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126209028.png"/>

案例3:  将a.txt文件和b.txt文件合并，放到c.txt文件中

a、b、c文件都存在，而且里面都有数据。
a.txt文件中的内容：aaaaa
b.txt文件中的内容：bbb
c.txt文件中的内容：ccc

`cat a.txt b.txt > c.txt` ：c文件中的内容会被覆盖
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126210504.png"/>

`cat a.txt b.txt >> c.txt` : c文件中的内容不会被覆盖
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126210728.png"/>

### more指令

说明

more指令是一个基于VI编辑器的文本过滤器，它以全屏幕的方式按页显示文本文件的内容。

#### 基本语法
```
more 要查看的文件
```

#### 应用实例

案例: 采用more查看文件 /etc/profile

`more /etc/profile`

#### 快捷键说明
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126211914.png"/>

### less指令

说明

less指令用来分屏查看文件内容，它的功能与more指令类似，但是比more指令更加强大，支持各种显示终端。less指令在显示文件内容时，并不是一次将整个文件加载之后才显示，而是根据显示需要加载内容，**对于显示大型文件具有较高的效率**。

#### 基本语法
```
less 要查看的文件
```

#### 应用实例

案例: 采用less查看一个大文件文件(体验一下速度)

#### 快捷键说明
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126212212.png"/>

### > 指令 和 >> 指令

说明

`> 输出重定向 和 >> 追加`
```
>  输出重定向：就是覆盖的意思
>> 追加：在文件末尾追加内容
```

#### 基本语法
```
1) ls -l >文件       （功能描述：列表的内容写入文件a.txt中（覆盖写））
2) ls -al >>文件     （功能描述：列表的内容追加到文件aa.txt的末尾）
3) cat 文件1 > 文件2 （功能描述：将文件1的内容覆盖到文件2）
4) echo "内容">> 文件
```

#### 应用实例

案例1: 将 /home 目录下的文件列表 写入到 /home/info.txt 中

`ls –l  /home/   >  /home/info.txt  [如果info.txt文件不存在，则会自动创建]`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126213707.png"/>

案例2: 将当前日历信息 追加到  /home/mycal 文件中 

`date  >> /home/mycal`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126213830.png"/>

### echo指令

说明

echo输出内容到控制台。

是一种最常用的与广泛使用的内置于Linux的bash和C shell的命令，通常用在脚本语言和批处理文件中来在标准输出或者文件中显示一行文本或者字符串。

#### 基本语法
```
echo  [选项]  [输出内容]

1. 输入一行文本并显示在标准输出上

# echo Tecmint is a community of Linux Nerds 

Tecmint is a community of Linux Nerds 

2. 输出一个声明的变量值

比如，声明变量x并给它赋值为10。

# x=10

# echo The value of variable x = $x 

The value of variable x = 10

3. 使用'\b'选项

'-e ' 后带上 '\b' 会删除字符间的所有空格。

注意： Linux中的选项 '-e' 扮演了转义字符反斜线的翻译器。

# echo -e "Tecmint \bis \ba \bcommunity \bof \bLinux \bNerds" 

TecmintisacommunityofLinuxNerds

4. 使用'\n'选项

'-e'后面的带上'\n'行会在遇到的地方作为新的一行

# echo -e "Tecmint \nis \na \ncommunity \nof \nLinux \nNerds"

Tecmint 
is 
a 
community 
of 
Linux 
Nerds 

5. 使用'\t'选项

'-e'后面跟上'\t'会在空格间加上水平制表符。

# echo -e "Tecmint \tis \ta \tcommunity \tof \tLinux \tNerds" 

Tecmint     is  a   community   of  Linux   Nerds

6. '-n'会在echo完后不会输出新行

# echo -n "Tecmint is a community of Linux Nerds" 

Tecmint is a community of Linux Nerds[root@liuzhuo01 home]# 

```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127120437.png"/>


#### echo 选项列表
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181126221404.png"/>

#### 应用实例

案例: 使用 echo 指令输出环境变量

`echo $PATH`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127122013.png"/>

### head指令

说明

head用于显示文件的开头部分内容，默认情况下head指令显示文件的前10行内容。

#### 基本语法
```
head  文件          (功能描述：查看文件头10行内容)
head -n 5 文件      (功能描述：查看文件头5行内容，5可以是任意行数)
```

#### 应用实例

案例: 查看 /etc/profile 的前面5行代码
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127123821.png"/>

### tail指令

说明

tail用于输出文件中尾部的内容，默认情况下tail指令显示文件的后10行内容。

#### 基本语法
```
1) tail  文件         (功能描述：查看文件尾10行内容）
2) tail  -n 5 文件   （功能描述：查看文件尾5行内容，5可以是任意行数）
3) tail  -f  文件    （功能描述：实时追踪该文档的所有更新） 重要！！！
```
#### 应用实例

案例1: 查看 /etc/profile 最后5行的代码
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127124007.png"/>

案例2: 实时监控date.log , 看看文件有变化时，能否看到变化的内容(实时的追加日期)。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127125020.png"/>

### ln 指令 (link)

说明

Linux下的链接有两种，一种是硬链接（Hard Link），另一种是软链接（Sysmbolie Link），默认情况下 ln 命令产生的是硬链接。

硬链接：是指通过文件的inode来进行链接。在Linux的文件系统中，保存在磁盘的所有类型的文件都会分配一个编号，这个编号称为inode号。硬链接的作用是允许一个文件拥有多个有效的路径名，这样用户就可以对一些重要文件建立多个硬链接，以防止误删除操作。只有最后一个硬链接删除，文件才会真正的删除。

软链接也成为符号链接，类似于windows里的快捷方式，主要存放了链接其他文件的路径。

#### 基本语法
```
ln [选项] [原文件或目录] [链接名] （功能描述：给原文件创建一个链接）

常用选项

-f：如果在目标位置存在与链接名相同的文件，会删除这个同名的文件
-s: 进行软链接
不带：硬链接
```

#### 应用实例

案例1: 在/home 目录下创建一个软链接 linkToRoot，连接到 /root 目录
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127130927.png"/>

案例2: 删除软连接 linkToRoot
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127131232.png"/>

案例3: 给date.log创建硬链接info.txt , 但是info.txt文件已经存在了。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127131547.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127131622.png"/>

**细节说明：**

当我们使用pwd指令查看目录时，仍然看到的是软链接所在目录。

### history指令

说明

查看已经执行过历史命令,也可以执行历史指令。

#### 基本语法
```
history	（功能描述：查看已经执行过历史命令)
```

#### 应用实例

案例1: 显示所有的历史命令
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127132716.png"/>


案例2: 显示最近使用过的10个指令。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127132820.png"/>

案例3: **执行**历史编号为474的指令  (!474)
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127133041.png"/>

## 时间日期类

### date指令

说明

显示当前的日期

#### 基本语法
```
1) date       (功能描述：显示当前时间）
2) date +%Y   (功能描述：显示当前年份）
3) date +%m   (功能描述：显示当前月份）
4) date +%d   (功能描述：显示当前是哪一天）
5) date "+%Y-%m-%d %H:%M:%S"      (功能描述：显示年月日时分秒）
6) date -s "2018-11-27 11:11:11"  (功能描述：设置年月日时分秒）

注意：这里的+是不能掉的，而且：Y m d H M S 年月日时分秒也是固定的写法，除了中间的分隔符可以随意写。
```
#### 应用实例

案例1: 显示当前时间信息
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127134447.png"/>
案例2: 显示当前时间年月日 
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127134736.png"/>
案例3: 显示当前时间年月日时分秒
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127134806.png"/>

案例4: 设置系统当前时间 ，比如设置成 2020-11-11 11:22:22
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127135115.png"/>

### cal指令

说明

查看日历指令

#### 基本语法
```
cal  [选项]   (功能描述：不加选项，显示本月日历）
```

#### 应用实例

案例1: 显示当前日历
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127135545.png"/>

案例2: 显示2020年日历
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127135844.png"/>

## 搜索查找类(!!)

### find指令

说明

find指令将从指定目录向下递归地遍历其各个子目录，将满足条件的文件或者目录显示在终端。

#### 基本语法
```
find  [搜索范围]  [选项]  
```

#### 选项说明
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127140046.png"/>

#### 应用实例

案例1: 按文件名：根据名称查找 /home 目录下的 hello.txt文件

`find  /home  -name  hello.txt `
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127141106.png"/>

案例2：按拥有者：查找/opt目录下，用户名称为 liuzhuo的文件

`find  /opt  -user  liuzhuo`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127141250.png"/>

案例3：查找整个linux系统下大于20M的文件（+n 大于  -n小于   n等于）

`find  /  -size  +20M` : 兆：M ，kb：k
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127141538.png"/>

### locate指令

说明

locate指令可以快速定位文件路径。locate指令利用事先建立的系统中所有文件名称及路径的**locate数据库**实现快速定位给定的文件。Locate指令无需遍历整个文件系统，**查询速度较快**。为了保证查询结果的准确度，管理员必须**定期更新locate时刻**。

#### 基本语法
```
locate  搜索文件
```

#### 特别说明

由于locate指令基于数据库进行查询，所以第一次运行前，必须使用**updatedb指令创建locate数据库**。

#### 应用实例

案例1: 请使用locate 指令快速定位 hello.txt 文件所在目录

updatedb // 创建locate的数据库
locate  hello.txt
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127141603.png"/>

### grep指令和 管道符号 |

说明

grep 过滤查找 ； 管道符，“|”，表示将前一个命令的处理结果输出传递给后面的命令处理。

#### 基本语法
```
grep  [选项]  查找内容  源文件

常用选项
-n：显示匹配行以及行号
-i：忽略字母大小写
```

#### 应用实例

案例1: 请在 /etc/profile 文件中，查找  "if"  所在行，并且显示行号

grep –n   if  /etc/profile  [在/etc/profile 中查找 if ,并显示行，区别大小写]
grep –ni   if  /etc/profile  [在/etc/profile 中查找 if ,并显示行，不区别大小写]
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127143642.png"/>

案例2: 请在 /home/hello.txt 文件中，查找  "yes"  所在行，并且显示行号
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127143926.png"/>

## 压缩与解压缩

### gzip与gunzip

说明

gzip 用于压缩文件， gunzip 用于解压的。

**gzip：只能对文件进行压缩，不能压缩目录，即使指定压缩的目录，也只能压缩目录内的所有文件。**


#### 基本语法
```
gzip [选项] 文件名 （功能描述：压缩文件，只能将文件压缩为*.gz文件）

常用选项
-r：递归压缩目录下的文件
-d：将压缩文件进行解压   等价于：gunzip 压缩的文件名

gunzip 压缩的文件名 （功能描述：解压缩文件命令）
```
#### 应用实例

案例1: gzip压缩， 将 /home下的 hello.txt文件进行压缩。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127145146.png"/>

案例2: gunzip解压缩， 将 /home下的 hello.txt.gz 文件进行解压缩。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127145225.png"/>

案例3: gzip压缩， 将 /home下的 big 目录进行压缩。（原则上不能进行压缩目录）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127145707.png"/>

案例4: gunzip解压缩， 将 /home下的 big 目录进行解压缩。（原则上不能进行解压缩目录）
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127150135.png"/>

### zip/unzip 指令 

说明

zip 用于压缩文件， unzip 用于解压的，**这个在项目打包发布中很有用的。**

将一般的文件或目录进行压缩或者解压，默认生成以 ".zip"为后缀的压缩包。

#### 基本语法
```
zip     [选项]   XXX.zip   需要压缩的内容（功能描述：压缩文件和目录的命令）
unzip   [选项]   XXX.zip	  (功能描述：解压缩文件）
```

#### zip的选项
```
-r：递归压缩目录
-m：将文件加入到压缩文件中后，删除原始文件
```

#### unzip的选项
```
-d 目录名: 将解压的文件放到指定的目录中
-n：解压时不覆盖已经存在的文件
-o：解压时覆盖已经存在的文件，并且不要求用户确认
```
#### 应用实例

案例1:  将 /home/big下的 所有文件进行压缩成 mybig.zip

`zip  -r  mybig.zip  /home/big`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127151643.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127151916.png"/>

案例2:  将 mybig.zip 解压到 /opt/tmp 目录下 [如果/opt/tmp 不存在，会自动创建]

<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127152316.png"/>

### tar指令

说明

tar是linux系统下经常使用的归档工具，对文件或目录进行打包归档，归档成一个文件，但是并不是进行压缩。

最后打包后的文件是 .tar.gz 的文件。 [可以压缩，和解压]

#### 基本语法
```
tar  [选项]  XXX.tar.gz  要打包的内容/目录   (功能描述：打包目录，压缩后的文件格式.tar.gz)

常用选项
-c：产生.tar打包文件
-v：显示详细信息
-f：指定压缩后的文件名，一定是最后的选项
-z：打包同时压缩
-x：解包.tar文件

常用的组合
-zcvf：打包压缩
-zxvf：解压缩
```

#### 应用实例

案例1:  压缩多个文件，将 /home/a1.txt 和 /home/a2.txt 压缩成  a.tar.gz。    【-zcvf】：打包压缩  【-zxvf】：解压
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127153502.png"/>

案例2:  将/home 的文件夹 压缩成 myhome.tar.gz
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127154733.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127154801.png"/>
案例3:   将 a.tar.gz  解压到当前目录
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127154950.png"/>
案例4: 将myhome.tar.gz  解压到 /opt/tmp目录下 【-C】 
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127155204.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day04/QQ截图20181127155235.png"/>



