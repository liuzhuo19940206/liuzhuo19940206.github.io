---
title: idea创建maven-web工程
categories:
  - idea
  - maven
  - web
tags:
  - idea
  - maven
  - web
date: 2018-10-29 12:02:04
summary: idea创建maven-web工程
---

前不久有学弟问我使用maven来创建web项目，不要创建原始的Dynamic Web项目了，那好吧，我们今天就来使用idea来创建maven的web项目吧。

### 首先先创建一个project(一个project就是一个工作空间)，在这里就是创建一个maven的工作空间
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029170715.png" style="width:50%"/>


### 你要选择maven然后按照下面图片 的指示操作就可以了--->最后点击next按钮
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029171222.png"/>

### 填写，groupID、ArtifactID
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029171531.png"/>

### 配置maven的本地仓库的位置

是通过修改本机中的maven中的settings.xml配置文件来实现的，需要你加上阿里巴巴的仓库，这样你的下载速度就会加快，如果你不采用阿里巴巴的仓库，你在下载你需要的jar包的时，是通过FQ去下载，你的速度就会变慢，尤其是某些包！！！！
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029172013.png"/>

### 填写项目名

一般不用改了，直接finish
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029172634.png"/>

### 喝杯咖啡，泡杯茶稍安勿躁，等一等。maven正在下载架构
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029172839.png"/>

### 等出结果，如果目录结构还不出来直接按图操作一波
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029172941.png"/>

### 项目的基本目录结构出来后我们最后还需要为项目配置下编译路径。
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029173041.png" style="width:50%"/>

点击Modules，如果你的是空的的话，就需要配置了，如果存在就不需要配置了，**idea201703版本后**，会自动帮我们配置的。
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029173524.png" style="width:50%"/>
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029173829.png"/>

如果你的idea的自动帮你配置了，你只需要检查那两个路径对不对即可，一般都是对的。

### 为项目配置下Artifacts

和Modules一样，如果已经存在了，就不要配置了。如果没有的话
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029174352.png" style="width:50%"/>

选择我们的项目
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029174451.png"/>

### 配置Tomcat容器
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029174611.png"/>

出现这个画面，然后按图再操作一波
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029174659.png" style="width:50%"/>

接着出现这个画面，继续看图操作
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029175057.png"/>

然后你选择右边第二个选项，Deployment，还是看图操作。。。
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029175151.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029175319.png"/>

最后点击ok完成Tomcat配置，现在就可以启动tomcat跑跑我们的helloWorld了！

### 启动tomcat，看效果
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029175623.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181029175655.png"/>

### 配置src/main/java

如上图，src/main目录下缺少java目录，我们可以右键创建目录java，然后在modules中配置为Sources目录

<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181030112516.png"/>

这样src/main/java图标就变成了蓝色，作为java源代码区了。

### 配置src/main/resources

如上图，src/main目录下缺少resources目录，我们可以右键创建目录resources，然后再modules中配置为Resources目录
<img src="https://gakkil.gitee.io/gakkil-image/idea/maven/QQ%E6%88%AA%E5%9B%BE20181030112807.png"/>

这样src/main/resources图标就变成了右下角有黄标了，作为resources资源区了。

