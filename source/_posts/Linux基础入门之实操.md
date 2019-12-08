---
title: Linux基础入门之用户
categories:
  - Linux
tags:
  - Linux
date: 2018-11-25 13:41:57
summary: 讲解Linux的用户管理、实用指令等。
---

本篇文章，将会讲解Linux的用户管理、实用指令等。

## 用户管理

### 基本介绍

Linux系统是一个多用户多任务的操作系统，任何一个要使用系统资源的用户，都必须首先向系统管理员申请一个账号，然后以这个账号的身份进入系统。

<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125135424.png"/>

注意：Linux用户需要至少属于一个组。

### 添加用户

#### 基本语法

```
useradd [选项] 用户名

useradd  用户名  //默认会在/home下创建同名的家目录

useradd -d 新的家目录的路径 用户名  //会在指定的路径下创建家目录，不要提前创建文件夹
```

#### 案例演示

打开，我们的Xshell远程登录我们的centOS系统。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125141201.png"/>

现在:
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125141406.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125141558.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125141727.png"/>


**使用细节**

1) 当创建用户成功后，会自动的创建和用户同名的家目录 【/home/用户名】

2) 也可以通过 useradd -d   指定目录   新的用户名jack 【给新创建的用户指定新的家目录】

现在创建一个新的用户jack，并把它的家目录放到 /home/rose下，默认是放在/home/jack文件夹中。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125142852.png"/>
验证jack用户是否创建成功，开启一个新的连接：
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125143053.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125143109.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125143433.png"/>

**此时/home/rose，就是jack的家目录了。**

### 指定/修改密码

#### 基本语法

```
passwd 用户名         //如果没有带用户名，则是给当前登录的用户修改密码
```

#### 案例演示
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125143821.png"/>

将xm用户的密码设置为：xm
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125144013.png"/>

创建一个新的连接，或者直接使用虚拟机登入系统，输入用户：xm，密码：xm，即可登入成功；这里就不演示了。

**注意：添加、设置密码、删除用户，都必须是下root用户下才行！！！**

### 删除用户

#### 基本语法

```
userdel   用户名   //不会删除家目录

userdel -r 用户名  //会删除家目录
```

#### 案例演示

1）删除xm用户，但不删除他的家目录【/home/xm】
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125144853.png"/>

2）删除jack用户，并且删除他的家目录

注意这里：我们创建jack用户的时候，将他的家目录修改成了/home/rose，所以删除他的家目录，就是删除/home/rose.
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125145649.png"/>


**使用细节**

在实际开发中，一般员工离职后，直接删除用户即可，不要删除他的家目录，因为里面会有他写的代码，资源很珍贵的！！！


### 查询用户信息

#### 基本语法

```
id 用户名
```

#### 案例演示

查看root用户的信息
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125150310.png"/>

查看不存在的用户
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125150459.png"/>


### 切换用户

介绍

在操作linux系统时，如果当前用户没有权限的时候，可以通过 su - 指令 ，来切换到高权利的用户，比如：root用户。

#### 基本语法

```
su - 要切换的用户名
```

#### 案例演示

创建一个zs用户，指定密码，然后切换到root用户。
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125151061.png"/>

**注意细节：**

1）普通用户前面是：$ , 超级用户前面是：# 。

2）su root 切换root用户时，如果没有带 - 的话，只是会切换到root用户，但是不会加载root用户的环境变量，这样会导致一个命令会 not found。

3）从权限高的用户切换到权限低的用户，不需要输入密码，反之需要。

4）当需要返回到原来用户时，使用exit指令。

5）如果 su – 没有带用户名，则默认切换到root用户

### 查看当前用户

#### 基本语法

```
whoami/ who am I

```

#### 案例演示
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125152055.png"/>

### 用户组

#### 介绍

类似于角色，系统可以对有共性的多个用户进行统一的管理。

#### 新增组

```
groupadd  组名
```

#### 删除组

```
groupdel 组名
```

**注意：这里有一个前提，就是这个组没有用户，才能删除。**

#### 添加用户到指定的组

```
useradd -g 组名 用户名
```

<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125154110.png"/>

#### 修改用户的到其他组

```
usermod -g 新的组名 用户名
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125154256.png"/>

### 用户和组的相关文件

#### /etc/passwd 文件

用户（user）的配置文件，记录用户的各种信息。

每行的含义：用户名 : 口令 : 用户标识号 : 组标识号 : 注释性描述 : 主目录 : 登录Shell的工具

```
vim /etc/passwd
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125155926.png"/>


#### /etc/shadow 文件

口令的配置文件

每行的含义：登录名 : 加密口令 : 最后一次修改时间 : 最小时间间隔 : 最大时间间隔 : 警告时间 : 不活动时间 : 失效时间 : 保留

```
vim /etc/shadow
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125160306.png"/>

#### /etc/group 文件

组(group)的配置文件，记录Linux包含的组的信息

每行含义：组名 : 口令 : 组标识号 : 组内用户列表

```
vim /etc/group
```
<img src="https://gakkil.gitee.io/gakkil-image/linux/day03/QQ截图20181125160725.png"/>

