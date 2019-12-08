---
title: 解决idea控制台输出乱码问题
categories:
  - idea
  - 乱码
tags:
  - idea
  - 乱码
date: 2018-10-29 16:43:52
summary: 解决IntelliJ IDEA 控制台输出乱码问题
---

解决IntelliJ IDEA 控制台输出乱码问题

### 找到安装Intellij idea目录bin下面的idea.exe.vmoptions和idea64.exe.vmoptions文件，我的安装目录是D:\IntelliJ IDEA\IntelliJ IDEA 15.0.2\bin

<img src="https://gakkil.gitee.io/gakkil-image/idea/luanma/QQ%E6%88%AA%E5%9B%BE20181029164601.png"/>

### 修改idea.exe.vmoptions和idea64.exe.vmoptions文件，在末尾添加                -Dfile.encoding=UTF-8
<img src="https://gakkil.gitee.io/gakkil-image/idea/luanma/QQ%E6%88%AA%E5%9B%BE20181029164704.png"/>


### 设置idea file编码。在菜单栏找到”File->settings->搜索File Encodeing” 设置utf-8。如图所示
<img src="https://gakkil.gitee.io/gakkil-image/idea/luanma/QQ%E6%88%AA%E5%9B%BE20181029164741.png"/>

### 设置idea server编码。在菜单栏找到”run->editconfigration” 找到”server”选项卡 设置 vm option为 -Dfile.encoding=utf-8，如图所示 
<img src="https://gakkil.gitee.io/gakkil-image/idea/luanma/QQ%E6%88%AA%E5%9B%BE20181029164814.png"/>

### 重启Intellij IDEA

