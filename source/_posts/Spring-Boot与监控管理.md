---
title: Spring Boot与监控管理
categories:
  - SpringBoot
  - 监控管理
tags:
  - SpringBoot
  - 监控管理
date: 2018-11-21 15:47:55
summary: SpringBoot与监控管理
---

Spring Boot与监控管理

## 监控管理

通过引入spring-boot-starter-actuator，可以使用Spring Boot为我们提供的准生产环境下的应用监控和管理功能。我们可以通过HTTP，JMX，SSH协议来进行操作，自动得到审计、健康及指标信息等.

步骤：

– 引入spring-boot-starter-actuator
– 通过http方式访问监控端点
– 可进行shutdown（POST 提交，此端点默认关闭）

## 监控和管理端点:
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121155804.png"/>

1) 创建新的Springboot项目：

添加：DevTools、Web、Actuator模块：

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121160723.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121160747.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121160816.png"/>

2）直接运行应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121160955.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121161042.png"/>

发现：多了很多映射的url。

这些url都是因为加入:`spring-boot-starter-actuator` 依赖
```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

3）访问这些url映射：

随便访问一个：比如：/beans
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121161305.png"/>

发现：没有权限访问！！！

4）关闭安全监测

在application配置文件中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121161735.png"/>
```
#关闭安全管理检测
management.security.enabled=false
```

ctrl+F9:即可，不需要重启应用。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121161833.png"/>

其他的监控信息：请看**监控和管理端点**的图片，执行测试即可。

## 定制端点信息

– 定制端点一般通过endpoints+端点名+属性名来设置。

– 修改端点id（endpoints.beans.id=mybeans）

– 开启远程应用关闭功能（endpoints.shutdown.enabled=true）

– 关闭端点（endpoints.beans.enabled=false）

– 开启所需端点
• endpoints.enabled=false
• endpoints.beans.enabled=true

– 定制端点访问根路径
• management.context-path=/manage

– 关闭http端点
• management.port=-1

---

测试：

1）在application配置文件中：
```
#定制端点信息
endpoints.beans.id=mybeans
```

现在，beans的访问端点就不行了，必须是mybeans了。（修改了默认的访问名）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121162813.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121162844.png"/>

2）在application配置文件中：
```
#定制端点信息
endpoints.beans.id=mybeans
endpoints.beans.path=/b
```

此时的beans的访问路径，就变成了/b. 默认的 /beans 和 /mybeans 都不好使了。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121163113.png"/>

3）在application配置文件中：
```
#定制端点信息
endpoints.beans.id=mybeans
endpoints.beans.path=/b
#关闭了beans的端点
endpoints.beans.enabled=false
```

此时，就会把beans端点给关闭了。不管访问 /beans 和 /mybeans 和 /b 都不好使了。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121163338.png"/>

但是其他端点好使：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121163416.png"/>

4）如果想关闭所有的，但是只留一些端点开放：
```
#关闭所有的端点
endpoints.enabled=false
#开启部分端点(beans)
endpoints.beans.enabled=true
```
其他端点都不好使了。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121163647.png"/>
只要beans端点好使：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121163733.png"/>

5）定制端点访问根路径
```
#设置访问端点的根路径
management.context-path=/manager
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121163931.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121164012.png"/>

6) 定制端点访问的端口号
```
#设置访问端点的根路径
management.context-path=/manager
management.port=8081
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121164156.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121164226.png"/>

7) 关闭http端点
```
#设置访问端点的根路径
management.context-path=/manager
management.port=-1
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/jiankong/QQ截图20181121164352.png"/>