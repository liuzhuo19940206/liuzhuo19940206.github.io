---
title: SpringBoot_day_09
categories:
  - SpringBoot
  - Spring
tags:
  - SpringBoot
  - Spring
date: 2018-11-12 10:40:49
---

Spring Boot启动配置原理：启动原理、运行流程、自动配置原理。
<!--more-->

几个重要的事件回调机制

配置在META-INF/spring.factories

**ApplicationContextInitializer**

**SpringApplicationRunListener**

只需要放在ioc容器中

**ApplicationRunner**

**CommandLineRunner**

---


启动流程：

首先创建一个web的Springboot项目：

然后给主main方法打上断点。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112105657.png"/>

开始debug运行。


### 创建SpringApplication对象
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112105900.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112110020.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112110059.png"/>

```java
    private void initialize(Object[] sources) {
        //保存主配置类
        if (sources != null && sources.length > 0) {
            this.sources.addAll(Arrays.asList(sources));
        }
        //判断当前是否一个web应用
        this.webEnvironment = this.deduceWebEnvironment();

        //从类路径下找到META‐INF/spring.factories配置的所有ApplicationContextInitializer；然后保存起来
        this.setInitializers(this.getSpringFactoriesInstances(ApplicationContextInitializer.class));

        //从类路径下找到ETA‐INF/spring.factories配置的所有ApplicationListener
        this.setListeners(this.getSpringFactoriesInstances(ApplicationListener.class));

        //从多个配置类中找到有main方法的主配置类
        this.mainApplicationClass = this.deduceMainApplicationClass();
    }
```

6个ApplicationContextInitializer：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112111101.png" style="width:50%"/>

10个ApplicationListener：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112111247.png" style="width:50%"/>


### 运行run方法
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112111412.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112113232.png"/>

```java
	public ConfigurableApplicationContext run(String... args) {
		StopWatch stopWatch = new StopWatch();
		stopWatch.start();
		ConfigurableApplicationContext context = null;
		FailureAnalyzers analyzers = null;
		configureHeadlessProperty();

         //获取SpringApplicationRunListeners；从类路径下META‐INF/spring.factories
		SpringApplicationRunListeners listeners = getRunListeners(args);

        //回调所有的获取SpringApplicationRunListener.starting()方法
		listeners.starting();
		try {

           //封装命令行参数
		   ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);

           //准备环境：创建环境完成后回调SpringApplicationRunListener.environmentPrepared()；表示环境准备完成
		   ConfigurableEnvironment environment = prepareEnvironment(listeners,applicationArguments);

           //打印Spring的banner
		   Banner printedBanner = printBanner(environment);

           //创建ApplicationContext；决定创建web的ioc还是普通的ioc
		   context = createApplicationContext();


		   analyzers = new FailureAnalyzers(context);

           //准备上下文环境;将environment保存到ioc中；而且applyInitializers()；
           //applyInitializers()：回调之前保存的所有的ApplicationContextInitializer的initialize方法
           //回调所有的SpringApplicationRunListener的contextPrepared()；
		   prepareContext(context, environment, listeners, applicationArguments,printedBanner);
           //prepareContext运行完成以后回调所有的SpringApplicationRunListener的contextLoaded()
           
           //刷新容器；ioc容器初始化（如果是web应用还会创建嵌入式的Tomcat）；Spring注解博客中有完整的流程
           //扫描，创建，加载所有组件的地方；（配置类，组件，自动配置）
		   refreshContext(context);

           //从ioc容器中获取所有的ApplicationRunner和CommandLineRunner进行回调
           //ApplicationRunner先回调，CommandLineRunner再回调
		   afterRefresh(context, applicationArguments);

           //所有的SpringApplicationRunListener回调finished方法
		   listeners.finished(context, null);
		   stopWatch.stop();
		   if (this.logStartupInfo) {
			   new StartupInfoLogger(this.mainApplicationClass)
					   .logStarted(getApplicationLog(), stopWatch);
		   }

           //整个SpringBoot应用启动完成以后返回启动的ioc容器
		   return context;
		}
		catch (Throwable ex) {
			handleRunFailure(context, listeners, analyzers, ex);
			throw new IllegalStateException(ex);
		}
	}
```

### 事件监听机制

上面我们已经了解了SpringBoot的启动原理，重点是里面的几个监听器：

ApplicationContextInitializer、SpringApplicationRunListener、ApplicationRunner、CommandLineRunner

现在，我们来自定义这几个监听器：

在根目录包下，创建listener包，并创建这几个接口的实现类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112130130.png"/>

ApplicationContextInitializer：
```java
public class MyApplicationContextInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
        System.out.println("MyApplicationContextInitializer---initialize" + configurableApplicationContext);
        
    }
}
```

SpringApplicationRunListener:
```java
public class MySpringApplicationRunListener implements SpringApplicationRunListener {
    @Override
    public void starting() {
        System.out.println("SpringApplicationRunListener...starting...");
    }

    @Override
    public void environmentPrepared(ConfigurableEnvironment environment) {
        Object o = environment.getSystemProperties().get("os.name");
        System.out.println("SpringApplicationRunListener...environmentPrepared.." + o);
    }

    @Override
    public void contextPrepared(ConfigurableApplicationContext context) {
        System.out.println("SpringApplicationRunListener...contextPrepared...");
    }

    @Override
    public void contextLoaded(ConfigurableApplicationContext context) {
        System.out.println("SpringApplicationRunListener...contextLoaded...");
    }

    @Override
    public void finished(ConfigurableApplicationContext context, Throwable exception) {
        System.out.println("SpringApplicationRunListener...finished...");
    }
}
```


ApplicationRunner:
```
public class MyApplicationRunner implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("ApplicationRunner...run....");
    }
}
```

CommandLineRunner:
```java
public class MyCommandLineRunner implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        System.out.println("CommandLineRunner...run..." + Arrays.asList(args));
    }
}

```


---

**要想使以上的监听器起作用：**

ApplicationContextInitializer 和 SpringApplicationRunListener需要**配置在META-INF/spring.factories**

在resources下：创建META-INF包，并创建spring.factories文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112131010.png"/>

spring.factories文件：
```java
# Initializers
org.springframework.context.ApplicationContextInitializer=\
com.liuzhuo.springboot.listener.MyApplicationContextInitializer
  
# SpringApplicationRunListene Listeners
org.springframework.boot.SpringApplicationRunListener=\
com.liuzhuo.springboot.listener.MySpringApplicationRunListener
```

如果不会写，随便打开一个SpringBoot的jar包，打开一个META-INF/spring.factories，照着写就行了。


ApplicationRunner 和 CommandLineRunner 只需要放到IOC容器中就行，即加上@Component即可。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112131311.png"/>

---

启动SpringBoot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112131418.png"/>

出现异常：
```java
MySpringApplicationRunListener.<init>(org.springframework.boot.SpringApplication, [Ljava.lang.String;)
```

说明SpringApplicationRunListener，需要有一个有参的构造函数，第一个参数是SpringApplication，第二个是String类型。

不会写的话，随便打开一个SpringApplicationRunListener的实现类：

双击：SpringApplicationRunListener，然后Ctrl + H ：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112131719.png" style="width:50%"/>
点击：EventPublishingRunListener
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112131822.png"/>

现在给我们的MySpringApplicationRunListener，添加有参的构造函数：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112132043.png"/>

再次启动SpringBoot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112132142.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112132207.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112132228.png"/>


### 自定义starter

starter：

1、这个场景需要使用到的依赖是什么？

2、如何编写自动配置

```java
@Configuration  //指定这个类是一个配置类
@ConditionalOnXXX  //在指定条件成立的情况下自动配置类生效
@AutoConfigureAfter  //指定自动配置类的顺序

@Bean  //给容器中添加组件
@ConfigurationPropertie结合相关xxxProperties类来绑定相关的配置
@EnableConfigurationProperties //让xxxProperties生效加入到容器中


自动配置类要能加载
将需要启动就加载的自动配置类，配置在META‐INF/spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.admin.SpringApplicationAdminJmxAutoConfiguration,\
org.springframework.boot.autoconfigure.aop.AopAutoConfiguration,\
```

3、模式：

启动器只用来做依赖导入；

专门来写一个自动配置模块；

启动器依赖自动配置；别人只需要引入启动器（starter）

mybatis-spring-boot-starter；自定义启动器名-spring-boot-starter

步骤：

前提准备：

创建一个空项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112140556.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112140721.png"/>

添加我们的模块：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112140815.png"/>


1) 创建启动器模块：

选择Maven项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112140952.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112141139.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112141310.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112141356.png"/>

2）创建自动配置模块
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112141500.png"/>

选择Spring Initializr：（只是为了方便快速创建模块）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112141625.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112143117.png"/>
选择web模块：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112143217.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112143246.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112143326.png"/>

3）在启动器pom文件中，引入自动配置的依赖：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112143647.png"/>
```java
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.liuzhuo.spring</groupId>
    <artifactId>liuzhuo.spring.boot.starter</artifactId>
    <version>1.0-SNAPSHOT</version>

    <!--启动器-->
    <dependencies>

        <!--引入自动配置模块-->
        <dependency>
            <groupId>com.liuzhuo.starter</groupId>
            <artifactId>liuzhuo-spring-boot-starter-autoconfigure</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>
        
    </dependencies>

    
</project>
```
4) 编写自动配置模块：

删除不需要的文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112143924.png" style="width:50%"/>
pom文件：删除test的依赖 和 插件的依赖:
```java
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
```

启动类也删除：
最终：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112144248.png" style="width:50%"/>

在starter包下：创建HelloService
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112144726.png"/>
```java
public class HelloService {

    HelloProperties helloProperties;

    public HelloProperties getHelloProperties() {
        return helloProperties;
    }

    public void setHelloProperties(HelloProperties helloProperties) {
        this.helloProperties = helloProperties;
    }

    public String sayHelloLiuzhuo(String name) {
        return helloProperties.getPrefix() + "-" + name + "-" + helloProperties.getSuffix();
    }

}
```

在starter包下：创建HelloProperties:
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112144829.png"/>
```java
@ConfigurationProperties(prefix = "liuzhuo.hello")
public class HelloProperties {

    private String prefix;
    private String suffix;

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public String getSuffix() {
        return suffix;
    }

    public void setSuffix(String suffix) {
        this.suffix = suffix;
    }
}
```
在starter包下：创建HelloServiceAutoConfiguration:
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112145420.png"/>
```java
@Configuration
@ConditionalOnWebApplication    //web应用才生效
@EnableConfigurationProperties(HelloProperties.class)
public class HelloServiceAutoConfiguration {

    @Autowired
    private HelloProperties helloProperties;

    @Bean
    public HelloService helloService() {
        HelloService helloService = new HelloService();
        helloService.setHelloProperties(helloProperties);
        return helloService;
    }
}
```

在resources下：创建META-INF/spring.factories文件
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112145629.png" style="width:50%"/>

spring.factories：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112145807.png"/>
```java
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.liuzhuo.starter.HelloServiceAutoConfiguration
```
---

5) 将这两个模块，导入到本地maven仓库中：

首先导入liuzhuo-spring-boot-starter-autoconfigure的依赖

因为liuzhuo-spring-boot-starter依赖于liuzhuo-spring-boot-starter-autoconfigure。

打开maven的工具窗口，点击liuzhuo-spring-boot-starter-autoconfigure模块，找到生命周期中的install。双击
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112150929.png"/>

liuzhuo-spring-boot-starter的导入本地仓库，类似。

6）创建新的SpringBoot的web项目，导入我们的liuzhuo-spring-boot-starter依赖，测试。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112152031.png"/>

导入：liuzhuo-spring-boot-starter依赖
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112152435.png"/>
```java
        <!--导入我们的启动依赖-->
        <dependency>
            <groupId>com.liuzhuo.starter</groupId>
            <artifactId>liuzhuo.spring.boot.starter</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112152557.png" style="width:50%"/>

创建：HelloController
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112152719.png"/>

```java
@RestController
public class HelloController {

    @Autowired
    HelloService helloService;

    @GetMapping("/hello")
    public String hello(){
        return helloService.sayHelloLiuzhuo("jackLoveDj");
    }
}
```

在配置文件中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112153251.png"/>
```java
liuzhuo.hello.prefix=欢迎
liuzhuo.hello.suffix=到来
```

启动我们的应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112153346.png"/>

没有报错，说明我们的自动配置成功了。

在浏览器中输入：`http://localhost:8080/hello`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day09/QQ截图20181112153439.png"/>

---

### 更多SpringBoot整合示例

[官方给出的样例代码](https://github.com/spring-projects/spring-boot/tree/master/spring-boot-samples)