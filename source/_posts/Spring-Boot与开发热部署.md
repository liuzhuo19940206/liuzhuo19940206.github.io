---
title: Spring Boot与开发热部署
categories:
  - SpringBoot
  - 热部署
tags:
  - SpringBoot
  - 热部署
date: 2018-11-21 12:59:03
summary: SpringBoot中的热部署
---

SpringBoot中的热部署

## 热部署

在开发中我们修改一个Java文件后想看到效果不得不重启应用，这导致大量时间花费，我们希望不重启应用的情况下，程序可以自动部署（热部署）。有以下四种情况，如何能实现热部署。

### 模板引擎

– 在Spring Boot中开发情况下禁用模板引擎的cache
– 页面模板改变ctrl+F9可以重新编译当前页面并生效

### Spring Loaded

Spring官方提供的热部署程序，实现修改类文件的热部署
– 下载Spring Loaded（项目地址https://github.com/spring-projects/spring-loaded）
– 添加运行时参数: -javaagent:C:/springloaded-1.2.5.RELEASE.jar -noverify

### JRebel

– 收费的一个热部署软件
– 安装插件使用即可

### Spring Boot Devtools（推荐）

引入依赖:
```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-devtools</artifactId>
</dependency>
```

## 演示Spring Boot Devtools

1）创建一个Thymeleaf的Springboot的项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121143729.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121144641.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121143827.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121143851.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121144815.png"/>

2) 在templates下，创建一个hello.html文件
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121144956.png"/>

3）在controller包下，创建HelloWorldController：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121145141.png"/>

4）启动Springboot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121145251.png"/>

在浏览器中输入：`http://localhost:8080/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121145323.png"/>

5) 现在修改映射url：

不要关闭应用！！！
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121145426.png"/>

访问：`http://localhost:8080/hello`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121145529.png"/>

说明，根本没有热部署功能！

现在：打开target包下的：HelloWorldController：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121145705.png"/>

说明：我们的编译后的class文件，根本没有改过。

现在，在我们的src下的HelloWorldController类中：**ctrl+F9**

然后再次打开target下的HelloWorldController类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121145916.png"/>

发现，我们改变的HelloWorldController类已经改变了。

再次在浏览器中输入：`http://localhost:8080/hello`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121145529.png"/>

还是不行，这是我们需要导入spring-boot-devtools依赖：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121150337.png"/>

```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>
</dependency>
```

此时，我们重启Springboot应用：

在浏览器中输入：`http://localhost:8080/hello`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121150510.png"/>

在把映射的url修改回来：

不停止应用！！！
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121150606.png"/>

然后：ctrl+F9

在浏览器中输入：`http://localhost:8080/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121153657.png"/>

热部署成功！

## 总结：

引入依赖
```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-devtools</artifactId>
	<optional>true</optional>
</dependency>
```

– IDEA 使用 : ctrl+F9
– 或做一些小调整
Intellij IEDA和Eclipse不同，Eclipse设置了自动编译之后，修改类它会自动编译，而IDEA在非RUN或DEBUG情况下
才会自动编译（前提是你已经设置了Auto-Compile）。

---

• 设置自动编译（settings-compiler-make project automatically）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121154016.png"/>

• ctrl+shift+alt+/（maintenance）
• 勾选compiler.automake.allow.when.app.running

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121154100.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/hotLoad/QQ截图20181121154123.png"/>