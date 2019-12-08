---
title: Spring Boot与分布式
categories:
  - SpringBoot
  - 分布式
tags:
  - SpringBoot
  - 分布式
date: 2018-11-19 10:08:05
summary: 分步式、Dubbo/Zookeeper、Spring Boot/Cloud
---

分步式、Dubbo/Zookeeper、SpringBoot/Cloud

## 分布式应用

在分布式系统中，国内常用zookeeper+dubbo组合，而SpringBoot推荐使用全栈的Spring，Spring Boot+Spring Cloud。

- 单一应用架构
当网站流量很小时，只需一个应用，将所有功能都部署在一起，以减少部署节点和成本。此时，用于简化增删改查工作量的数据访问框架(ORM)是关键。

- 垂直应用架构
当访问量逐渐增大，单一应用增加机器带来的加速度越来越小，将应用拆成互不相干的几个应用，以提升效率。此时，用于加速前端页面开发的Web框架(MVC)是关键。

- 分布式服务架构
当垂直应用越来越多，应用之间交互不可避免，将核心业务抽取出来，作为独立的服务，逐渐形成稳定的服务中心，使前端应用能更快速的响应多变的市场需求。此时,用于提高业务复用及整合的分布式服务框架(RPC)是关键。

- 流动计算架构
当服务越来越多，容量的评估，小服务资源的浪费等问题逐渐显现，此时需增加一个调度中心基于访问压力实时管理集群容量，提高集群利用率。此时，用于提高机器利用率的资源调度和治理中心(SOA)是关键。

## Zookeeper和Dubbo

- ZooKeeper

ZooKeeper 是一个分布式的，开放源码的分布式应用程序协调服务。它是一个为分布式应用提供一致性服务的软件，提供的功能包括：配置维护、域名服务、分布式同步、组服务等。

- Dubbo

Dubbo是Alibaba开源的分布式服务框架，它最大的特点是按照分层的方式来架构，使用这种方式可以使各个层之间解耦合（或者最大限度地松耦合）。从服务模型的角度来看，Dubbo采用的是一种非常简单的模型，要么是提供方提供服务，要么是消费方消费服务，所以基于这一点可以抽象出 **服务提供方（Provider）**和 **服务消费方（Consumer）**两个角色。

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119102607.png"/>

步骤：
• 1、安装zookeeper作为注册中心
• 2、编写服务提供者
• 3、编写服务消费者
• 4、整合dubbo
```
<dependency>
	<groupId>com.alibaba.spring.boot</groupId>
	<artifactId>dubbo-spring-boot-starter</artifactId>
	<version>2.0.0</version>
</dependency>
```

###  下载zookeeper镜像

1）打开我们的虚拟机，下载zookeeper镜像：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119111308.png"/>
```
docker pull registry.docker-cn.com/library/zookeeper
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119112101.png"/>

查看zookeeper的docker官网，看怎么运行？
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119112223.png"/>

发现：会暴露三个端口号，2181,2888,3888。我们只需要暴露2181即可，因为我们不做集群。
```
docker run --name zk01 -p 2181:2181 --restart always -d zookeeper的imageId 
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119113528.png"/>

### 创建工程
2) 创建两个工程，一个服务提供者 和 一个服务消费者

打开idea，创建一个空项目，为了方便演示而已：

这个空项目里面：会包括服务提供者和服务消费者
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119115031.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119115245.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119115341.png"/>

在这个空项目中，添加 服务提供者 和 服务消费者 工程：

服务提供者工程：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119115531.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119115559.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119115833.png"/>
选中Web模块，1.x.x的版本
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119115913.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119120004.png"/>
创建完成后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119120056.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119120144.png"/>

服务消费者工程：

类似：只是工程名字为：consume-ticket
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119120418.png"/>

最后，两个工程生成完毕后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119123653.png"/>

### 编写提供者和消费者

打开dubbo官网：http://dubbo.apache.org/en-us/
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119124046.png"/>

可以学习相关的知识。

#### 服务提供者

3.1.1）在服务提供者项目中：导入dubbo的spring-boot-starter：
```
<!-- https://mvnrepository.com/artifact/com.alibaba.boot/dubbo-spring-boot-starter -->
<dependency>
    <groupId>com.alibaba.boot</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>0.2.0</version>
</dependency>

```

3.1.2）导入zookeeper的相关依赖：
```
<dependency>
    <groupId>com.github.sgroschupf</groupId>
    <artifactId>zkclient</artifactId>
    <version>0.1</version>
</dependency>
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119125517.png"/>

3.1.3) 编写服务提供者的售票服务：

在service包下，创建TickerService接口：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119125831.png"/>

在service包下，创建创建TickerService接口的实现类：TickerServiceImpl：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119130029.png"/>

3.1.4）将我们编写的服务注册到注册中心：

在application配置文件中，配置zookeeper的信息：

dubbo是阿里提供的RPC：开源的远程调用服务，帮助我们将服务注册到Zookeeper注册中心中。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119130712.png"/>
```
#注册服务到zookeeper注册中心中的服务名字
dubbo.application.name=provide-ticket

#ip地址是你的虚拟机的ip地址，记住zookeeper服务是启动的状态
dubbo.registry.address=zookeeper://10.6.11.17:2181

# 扫描包，将该包下的使用的dubbo的@Service注解的类注册到注册中心中
dubbo.scan.base-packages=com.liuzhuo.ticket.service
```

3.1.5) 给我们的服务添加上**dubbo的@Service**注解

**注意：这里的@Service注解是dubbo的，不是Spring的@Service注解。**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119131152.png"/>

3.6）启动服务提供者的Springboot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119131324.png"/>

启动失败的？
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119131548.png"/>

这里是因为：版本依赖的问题，Springboot 1.x 要导入：0.1.x的dubbo。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119131649.png"/>

修改application的配置文件：
```
<dependency>
    <groupId>com.alibaba.boot</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>0.1.0</version>
</dependency>

```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119132013.png"/>

重启服务提供者的应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119134051.png"/>

启动成功！！！

---

#### 服务消费者

3.2.1）导入dubbo和Zookeeper的相关依赖：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119134412.png"/>

3.2.2）配置application文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119134615.png"/>

3.2.3）编写消费的代码：

在user/service包下，创建UserService类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119135241.png"/>

3.2.4）引入服务提供者的服务：

**关键：在服务消费者的工程下，创建服务提供者一模一样的类名的接口：TickerService**

即：将服务提供者的：TickerService的全类名拷贝到服务消费者中：（只要TickerService接口即可）

这就是为啥，我在创建两个项目的时候，项目的包名都是一样的原因！！！（都是com.liuzhuo.ticket）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119135557.png"/>

3.2.5) 在UserService类中注入服务提供者的TickerService：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119140053.png"/>

3.2.6）在测试类中，测试是否能调用到服务提供者的售票服务：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119140231.png"/>

启动测试：

**注意：此时的服务提供者的Springboot应用不要停，也要一直启动！！！**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119140404.png"/>

远程调用成功！！！

---

## SpringBoot和SpringCloud

**Spring Cloud**
Spring Cloud是一个分布式的整体解决方案。Spring Cloud 为开发者提供了在**分布式系统（配置管理，服务发现，熔断，路由，微代理，控制总线，一次性token，全局琐，leader选举，分布式session，集群状态）中快速构建的工具**，使用Spring Cloud的开发者可以快速的启动服务或构建应用、同时能够快速和云平台资源进行对接。

**SpringCloud分布式开发五大常用组件**

- 服务发现——Netflix Eureka

- 客服端负载均衡——Netflix Ribbon

- 断路器——Netflix Hystrix

- 服务网关——Netflix Zuul

- 分布式配置——Spring Cloud Config

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119143127.png"/>

微服务原文：https://martinfowler.com/articles/microservices.html

Spring Cloud 入门

1、创建provider
2、创建consumer
3、引入Spring Cloud
4、引入Eureka注册中心
5、引入Ribbon进行客户端负载均衡

---
### 创建空的工程
1）创建空的工程：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119143436.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119143545.png"/>

### 创建三个工程
2）添加三个工程：

Eureka注册中心工程、服务提供者工程、服务消费者工程。

#### 创建Eureka注册中心

2.1）创建Eureka注册中心
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119144149.png"/>

添加：Eureka Server模块（因为是注册模块）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119144408.png"/>

#### 创建服务提供者

2.2）创建服务提供者
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119144658.png"/>

添加：Eureka Discovery模块（发现服务的模块）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119144840.png"/>

#### 创建服务消费者

2.3）创建服务消费者
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119145013.png"/>

添加：Eureka Discovery模块（发现服务的模块）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119144840.png"/>

最后三个工程都创建完毕后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119145128.png"/>

---

### 配置Eureka server模块：

在eureka-server工程中，配置Application文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119153233.png"/>
```
#配置服务的端口号：
server:
  port: 8761

#配置eureka信息
eureka:
  instance:
    hostname: eureka-server  # eureka实例的主机名
  client:
    register-with-eureka: false # 不注册自己到eureka上
    fetch-registry: false # 不从eureka上面获取服务的注册信息
    service-url:     # 是一个map结构
      defaultZone: http://localhost:8761/eureka/  # 注册中心的地址

```

在在eureka-server工程中的启动类上，添加Eureka的注解启动功能：@EnableEurekaServer
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119153514.png"/>

启动Eureka-Server项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119153754.png"/>

**启动成功后，就不要关闭了。**

在浏览器中输入：`http://localhost:8761/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119153920.png"/>

到目前为止，我们的Eureka服务注册中心启动成功！

---

### 配置服务提供者模块：

在privoder-ticket项目中：

在service包下，创建TicketService服务:
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119154409.png"/>

在controller包下，创建TicketController：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119154648.png"/>

将我们的服务注册到服务中心中：

编写privoder-ticket项目中的Application配置文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119155034.png"/>
```
#项目的端口号
server:
  port: 8001

#项目的名字
spring:
  application:
    name: provider-ticket


#配置eureka信息
eureka:
  instance:
    prefer-ip-address: true # 注册服务到Eureka服务中心的时候，使用ip地址
  client:
    service-url:     # 是一个map结构
      defaultZone: http://localhost:8761/eureka/  # 注册中心的地址
```

启动privoder-ticket项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119155314.png"/>

在浏览器中输入：`http://localhost:8001/ticket`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119155415.png"/>

服务启动成功！

打开 `http://localhost:8761/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119155524.png"/>

在Eureka服务注册中心中，发现了我们的注册的服务提供者：privoder-ticket。

以上就是，注册服务到服务中心中。

---

一个项目，我们可以注册多个服务到服务中心中。

现在，停止我们的：privoder-ticket 项目。改用：java - jar 的方式来启动应用。

现在，将我们的项目打包成jar包：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119155930.png"/>

双击：package
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119160049.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119160213.png"/>

将target中的打包成功的jar包，保存到桌面的service文件夹中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119160333.png"/>

将jar包的名字后面加上了8001，是为了区分。

---

现在，将privoder-ticket 项目中的Application配置文件中的端口号，改为8002，然后打成jar包。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119160559.png"/>

然后，使用 java -jar 的形式来启动这两个jar包：

```
java -jar privoder-ticket-0.0.1-SNAPSHOT-8001.jar

和

java -jar privoder-ticket-0.0.1-SNAPSHOT-8002.jar
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119160914.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119161158.png"/>

**注意：这里是开启两个windows的终端窗口！！！**

验证：

分别在浏览器中输入：`http://localhost:8001/ticket` 和 `http://localhost:8002/ticket`

出现：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119161615.png"/>

而且在 `http://localhost:8761/` 中：

会发现，两个privoder-ticket服务。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119161750.png"/>

---

### 配置服务消费者模块：

配置application文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119162326.png"/>
```
#项目的端口号
server:
  port: 8200

#项目的名字
spring:
  application:
    name: consume-user

#配置eureka信息
eureka:
  instance:
    prefer-ip-address: true # 注册服务到Eureka服务中心的时候，使用ip地址
  client:
    service-url:     # 是一个map结构
      defaultZone: http://localhost:8761/eureka/  # 注册中心的地址
```

在启动类上，添加@EnableDiscoveryClient注解：开启发现服务的功能。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119162555.png"/>

因为Springcloud是用restful的形式来发现、调用服务的。 所以，我们需要注入一个RestTemplate类来操作发送http请求。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119162917.png"/>

**@LoadBalanced：发送http请求时，起到负载均衡的作用**

配置消费功能：

在controller包下，创建UserController类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119163401.png"/>
```
@RestController
public class UserController {

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/buy")
    public String buyTicket(String name){
        /**
         * 第一个参数：http的请求地址：PROVIDER-TICKET 服务中心中的服务名字
         * 第二个参数：返回值的类型
         */
        String ticket = restTemplate.getForObject("http://PROVIDER-TICKET/ticket", String.class);
        return name+":购买了：ticket";
    }
}

```

PROVIDER-TICKET: 是Eureka服务中心的服务的名字：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119163555.png"/>

`http://PROVIDER-TICKET/ticket`   就是调用服务中心中PROVIDER-TICKET的项目，发送/ticket请求，就会获取电影票的功能。

启动consume-user项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119163858.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119163955.png"/>

在 `http://localhost:8761/` 中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119164036.png"/>

---

现在，在浏览器中输入：`http://localhost:8200/buy?name=zhangsan`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119164317.png"/>

成功：我们的 consume-user项目 通过http请求，调用Eureka服务中心中的 PROVIDER-TICKET 项目，获取到了《你的名字》的电影票。

**PS：我们的服务提供者还是负载均衡的，因为我们有两个PROVIDER-TICKET，加上@LoadBalanced**

刷新 `http://localhost:8200/buy?name=zhangsan` 页面 ：

服务中心，会帮我们轮询调用PROVIDER-TICKET服务，这里，我们没有在privoder-ticket项目中的TicketService方法中，添加输出语句，所以看不到效果。

不信的话，你添加输出语句就会看到效果了。

```
@Service
public class TicketService {

    public String ticketService(){
        System.out.println("8001端口的privoder-ticket服务");
        return "《你的名字》";
    }
}

和

@Service
public class TicketService {

    public String ticketService(){
        System.out.println("8002端口的privoder-ticket服务");
        return "《你的名字》";
    }
}
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/dubbo/QQ截图20181119165751.png"/>
