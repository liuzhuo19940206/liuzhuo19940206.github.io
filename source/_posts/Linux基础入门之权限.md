---
title: Linux基础入门之权限
categories:
  - Linux
tags:
  - Linux
date: 2018-11-27 18:47:41
summary: 组管理和权限管理
---

组管理和权限管理

## 组管理

### linux组的基本介绍

在linux中的每个用户必须属于一个组，不能独立于组外。在linux中每个文件都有：所有者、所在组、其它组 的概念。

### 文件/目录 所有者

一般为文件的创建者 ， 谁创建了该文件，就自然的成为该文件的所有者。

1）查看文件的所有者

指令：ls –ahl

应用实例 :创建一个组police,再创建一个用户tom,将tom放在police组 ,然后使用 tom来创建一个文件 ok.txt，看看情况如何？
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127195335.png"/>

2）修改文件所有者

指令：chown 用户名 文件名 

应用案例要求：使用root 创建一个文件apple.txt ，然后将其所有者修改成 tom。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127195757.png"/>

### 文件/目录 所在组

当某个用户创建了一个文件后，默认情况下，这个文件的所在组就是该用户所在的组。

1）查看文件/目录所在组

基本指令：ls –ahl 

2）修改文件所在的组

基本指令：

`chgrp` 组名 文件名

应用实例：

使用root用户创建文件 orange.txt ,看看当前这个文件属于哪个组【root】，然后将这个文件所在组，修改到 police组。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127200619.png"/>

### 其它组

除文件的所有者和所在组的用户外，系统的其它用户都是文件的其它组。

### 改变用户所在组

在添加用户时，可以指定将该用户添加到哪个组中，同样的，使用root的管理权限可以改变某个用户所在的组。

1）改变用户所在组
```
1) usermod   –g   组名  用户名
2) usermod   –d   目录名  用户名  改变该用户登陆的初始目录。
```

2) 应用实例

创建一个土匪组（bandit）将 tom 这个用户从原来所在的police组，修改到 bandit(土匪) 组中。

`usermod  -g  bandit  tom`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127201505.png"/>

---

## 权限管理

### 权限的基本介绍

```
ls  -l 中显示的内容如下：
-rwxrw-r-- 1 root police 1213 Feb 2 09:39 ok.txt
```

0-9位说明:

1) 第0位确定文件类型(说明: -:普通文件, d:目录，l : 连接文件, c: 字符设备文件[键盘,鼠标] b: 块设备文件[硬盘] )

2) 第1-3位确定所有者（该文件的所有者）拥有该文件的权限。r: 读 , w : 写权限 , x:  执行权限  

3) 第4-6位确定所属组（同用户组的）拥有该文件的权限

4) 第7-9位确定其他用户拥有该文件的权限 

5) `1`: 如果是文件，表示硬链接的数目， 如果是目录，则表示有多少个子目录（不包含文件）

6) 1213： 表示文件大小(字节)，如果是目录，则统一为 4096。

7）Feb 2 09:39：文件最后的修改时候。

### rwx权限详解

#### rwx作用到文件(重要)

1) [ r ] 代表可读(read): 可以读取,查看
2) [ w ] 代表可写(write): 可以修改,但是不代表可以删除该文件,删除一个文件的前提条件是对该文件所在的目录有写权限，才能删除该文件.
3) [ x ] 代表可执行(execute):可以被执行

#### rwx作用到目录(重要)

1) [ r ] 代表可读(read): 可以读取，ls查看目录内容
2) [ w ] 代表可写(write): 可以修改,目录内创建+删除+重命名目录
3) [ x ] 代表可执行(execute):可以进入该目录  

#### 文件及目录权限实际案例

ls  -l 中显示的内容如下：
-<font color="red">rwx</font><font color="blue">rw-</font>`r--`. 1 root root 1213 Feb 2 09:39 abc

10个字符确定不同用户能对文件的权限：

 第一个字符代表文件类型： 文件 (-) , 目录(d) , 链接(l)

 其余字符每3个一组(rwx) 读(r) 写(w) 执行(x)
 第一组<font color="red">rwx</font> : 文件拥有者的权限是读、写和执行
 第二组<font color="blue">rw-</font> : 与文件所在组的用户的权限是读、写但不能执行
 第三组`r--` :  不与文件拥有者同组的其他用户的权限是读不能写和执行

可用数字表示为: r=4 , w=2 , x=1 因此 rwx = 4 + 2 + 1 = 7 .

r: 100 , w: 010 ,  x: 001
     
   1		文件：硬连接数 或  目录：子目录数
   root  		用户
   root      	组
   1213              	文件大小(字节)，如果是目录的话，显示 4096字节
   Feb 2 09:39  	最后修改日期
   abc                	文件名 

### 修改权限-chmod

基本说明：

通过chmod指令，可以修改文件或者目录的权限。

#### 第一种方式：+ 、- 、= 变更权限

 `u:所在者`  `g:所在组`  `o:其他组`  `a:所有人`(u、g、o的总和)

 1) chmod   u=rwx , g=rx , o=x　　文件、目录 【表示：给所有者rwx, 给所在组的用户 rx , 给其他人 x】
 2) chmod   o+w    文件、目录 【表示：给其它用户增加w 的权限】
 3) chmod   a-x    文件、目录	【表示：给所有用户 去掉 x权限】

案例演示：

1) 给abc文件的 **所有者**读写执行的权限 ，给**所在组**读执行权限 ，给**其它组**读执行权限。

chmod  u=rwx , g=rx , o=rx   abc

<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127205641.png"/>
2) 给abc文件的 **所有者**除去执行的权限，**所在组**增加写的权限

chmod  u-x, g+w abc
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127205833.png"/>

3) 给abc文件的**所有用户**添加读的权限 

chmod  a+r  abc  
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127205959.png"/>

#### 第二种方式：通过数字变更权限

r=4 w=2 x=1　　　　　rwx=4+2+1=7

chmod `u=rwx , g=rx , o=x` 　文件、目录  《==》   chmod   `751`  文件、目录

因为 rwx：111=7 ， rx：101=5 ， x：001=1

案例演示

要求：将 /home/abc.txt 文件的权限修改成  `rwxr-xr-x`, 使用给数字的方式实现：

chmod　　u=rwx , g=xr ,  o=x　　/home/abc.txt
chmod　　751　　/home/abc.txt
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127210926.png"/>

### 修改文件所有者-chown

基本介绍

chown　newowner　file　　改变文件的所有者

chown　newowner : newgroup　　file　　改变用户的所有者和所有组

`-R `  如果是目录 则使其下所有子文件或目录递归生效

案例演示：

1) 请将 /home/abc.txt 文件的所有者修改成 tom.

chown   tom  /home/abc.txt
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127212038.png"/>


2) 请将 /home/kkk 目录下所有的文件和目录的所有者都修改成tom.

chown `–R` tom  /home/kkk
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127212509.png"/>

3) 将/home/aaa下的所有文件和目录的所有者都改成 tom，将所在组改成police.

chown `–R  tom:police`   /home/aaa
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127212710.png"/>

### 修改文件所在组-chgrp

基本介绍

chgrp newgroup file  改变文件的所有组

案例演示：

1) 请将 /home/abc.txt 文件的所在组修改成 bandit (土匪)

chgrp  bandit  /home/abc.txt
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127213015.png"/>


2) 请将 /home/kkk 目录下所有的文件和目录的所在组都修改成 bandit(土匪)

chgrp  -R  bandit /home/kkk 
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127213340.png"/>

### 最佳实践-警察和土匪游戏

police（警察） ， bandit（土匪） 

jack , jerry: 警察
xh , xq: 土匪

1）创建组 
```
[root@liuzhuo01 home]# groupadd police
[root@liuzhuo01 home]# groupadd bandit
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127214046.png"/>
2）创建用户 
```
[root@liuzhuo01 home]# useradd -g police jack
[root@liuzhuo01 home]# useradd -g police jerry
[root@liuzhuo01 home]# useradd -g bandit xh
[root@liuzhuo01 home]# useradd -g bandit xq

```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127215156.png"/>

并给四个用户，添加密码。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127215523.png"/>

3）jack 创建一个文件，自己可以读写，本组人可以读，其它组没人任何权限

使用Xshell创建一个新的连接，使用jack登录。然后创建一个jack.txt文件。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127215732.png"/>

使用：`chmod 640 jack.txt`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127220010.png"/>

4）jack 修改该文件，让本组人可以读写 , 其它组人可以读

使用：`chmod g=rw,o=r jack.txt`
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127220327.png"/>

5）**xh 投靠 警察，看看是否可以读写jack.txt文件（重点）.**

首先使用xh连接，登入到linux系统中：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127220458.png"/>

进入jack.txt所在的目录，才能修改jack.txt文件。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127220643.png"/>

会发现权限不够，根本不能进入jack目录中，因为jack是police组，xh是bandit，组不同，而jack目录对其他组的权限无。

题目的要求是让我们把xh改为police组，所以，我们必须让jack对所在组police修改为：rx的权限，xh才能进入到jack目录中，修改jack.txt文件。

在root用户下，修改xh所在组为police组：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127221209.png"/>

在jack用户下，修改jack目录的所在组police有rx的权限：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127221427.png"/>

在xh用户下，进入jack目录
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127221545.png"/>

发现还是权限不够，我们的理论错了嘛？ 不是的，是需要我们注销，重新登入xh用户。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127221731.png"/>

修改jack.txt文件：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127222032.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127221902.png"/>

使用jack查看jack.txt文件，看是否修改成功：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day05/QQ截图20181127222225.png"/>



