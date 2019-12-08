---
title: SpringBoot_day_01
categories:
  - SpringBoot
  - Spring
tags:
  - SpringBoot
  - Spring
date: 2018-11-02 14:31:37
summary: SpringBoot开发的第一天，探索主类的执行流程
---

Spring boot 来简化Spring应用开发，约定大于配置，去繁从简，just run就能创建一个独立的，产品级别的应用。

### 背景

J2EE笨重的开发、繁多的配置、低下的开发效率、复杂的部署流程、第三方技术集成难度大。

### 解决

"Spring全家桶"时代.

SpringBoot -> J2EE一站式解决方案

SpingCloud -> 分布式整体解决方案

### 优点

- 快速创建独立运行的Spring项目以及与主流框架集成  
- 使用嵌入式的Servlet容器，应用无需打成WAR包  
- starters自动依赖与版本控制  
- 大量的自动配置，简化开发，也可修改默认值  
- 无需配置XML，无代码生成，开箱即用  
- 准生产环境的运行时应用监控  
- 与云计算的天然集成  

### 微服务

2014，martin fowler

微服务：架构风格（服务微化）

一个应用应该是一组小型服务；可以通过HTTP的方式进行互通；

单体应用：ALL IN ONE

微服务：每一个功能元素最终都是一个可独立替换和独立升级的软件单元；

[微服务参考](https://martinfowler.com/articles/microservices.html#MicroservicesAndSoa "微服务参考")

### 环境约束：

- jdk1.8：Spring Boot 推荐jdk1.7及以上；java version "1.8.0_112"  
- maven3.x：maven 3.3以上版本；Apache Maven 3.3.9  
- IntelliJIDEA2017：IntelliJ IDEA 2017.2.2 x64 、STS  
- SpringBoot 1.5.9.RELEASE：1.5.9；  

[环境软件下载](https://pan.baidu.com/s/1ay5tPJkNJeptSkFgjiL_Zw)

密码：jpro

统一环境；

**1.Maven设置**

给maven 的 settings.xml配置文件的profiles标签添加

```
<profile>
  <id>jdk‐1.8</id>
  <activation>
    <activeByDefault>true</activeByDefault>
    <jdk>1.8</jdk>
  </activation>
  <properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
  </properties>
</profile>
```

**2.IDEA设置**

整合maven进来

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102151849.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102152017.png"/>

将maven配置成我们的maven，不使用idea自带的maven。

Maven home directory： maven的安装路径

User setting file：maven的setting配置文件的路径

Local repository：maven的本地仓库的路径。

### Spring Boot HelloWorld

一个功能：

浏览器发送hello请求，服务器接受请求并处理，响应Hello World字符串；

#### 创建一个maven项目(jar)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102154909.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102155112.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102155230.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102155348.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102155708.png"/>

#### 导入spring boot相关的依赖

```
   <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring‐boot‐starter‐parent</artifactId>
        <version>1.5.17.RELEASE</version>
   </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring‐boot‐starter‐web</artifactId>
        </dependency>
    </dependencies>

```

**现在的spring boot的1.x的版本没有1.5.9，所以我们使用1.5.17.RELEASE。**

我们可以参考Spring的官网的文档。[Spring官网](https://spring.io/)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102160852.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102161036.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102161400.png"/>

添加依赖后，idea就会帮我们开始下载依赖，如果没有自动下载，可以点击idea的右边的Maven Projects，然后点击上面的循环标志。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102162613.png" style="width:50%"/>

依赖下载完毕后，可以看到我们的依赖文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102162819.png"/>

#### 编写一个主程序

在src/main/java下创建com.liuzhuo的包，并创建HelloWorldApplication类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102163202.png"/>

添加@SpringBootApplication注解，并编写一个主函数。
```java
@SpringBootApplication  //表明这是一个Springboot的启动类
public class HelloWorldApplication {

    public static void main(String[] args) {
        //启动Springboot应用。
        SpringApplication.run(HelloWorldApplication.class);
    }

}
```

#### 编写相关的Controller
在com.liuzhuo.controller下，创建HelloController
```java
@Controller
public class HelloController {
    @ResponseBody
    @RequestMapping("/hello")
    public String hello(){
        return "Hello World!";
    }
}
```

#### 运行主程序测试

回到Springboot的启动类中，直接运行main函数：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102163832.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102163913.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102163946.png"/>

出现上图所示的效果就说明Springboot应用启动成功。

在浏览器中输入：`http://localhost:8080/hello`

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102164146.png"/>


#### 简化部署

以前，部署Web应用，需要将我们的Web项目生成War，然后在服务器中安装服务器，比如Tomcat等，然后将War放在Tomcat容器中，启动Tomcat容器。

现在，我们不需要这么麻烦了，我们直接生成jar就行。生成jar之前，我们需要在pom文件中添加Springboot的构建插件。
```
    <!-- 这个插件，可以将应用打包成一个可执行的jar包-->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
```
然后生成jar包：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102164849.png" style="width:50%"/>

双击：package。

控制台输出：BUILD SUCCESS
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102165053.png" />

我们，可以在target包下，看到我们生成的可运行的jar。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102165310.png" />

拷贝这个jar到我们的桌面上面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102165410.png" />

打开命令行界面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102165718.png" />

我们的Springboot应用就启动了，这样是不是很简单，都不需要打成war包和安装Tomcat。

在浏览器中输入：`http://localhost:8080/hello`

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102164146.png"/>

### Hello World 的探究

#### POM文件

1）父项目

```
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring‐boot‐starter‐parent</artifactId>
    <version>1.5.17.RELEASE</version>
</parent>
他的父项目是

<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring‐boot‐dependencies</artifactId>
  <version>1.5.17.RELEASE</version>
  <relativePath>../../spring‐boot‐dependencies</relativePath>
</parent>
他来真正管理Spring Boot应用里面的所有依赖版本；
```

Spring Boot的版本仲裁中心；

以后我们导入依赖,默认是不需要写版本；（没有在dependencies里面管理的依赖自然需要声明版本号）

2) 启动器

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring‐boot‐starter‐web</artifactId>
</dependency>
```

spring-boot-starter-web：

spring-boot-starter：spring-boot场景启动器；帮我们导入了web模块正常运行所依赖的组件；

Spring Boot将所有的功能场景都抽取出来，做成一个个的starters（启动器），只需要在项目里面引入这些starter.
相关场景的所有依赖都会导入进来。要用什么功能就导入什么场景的启动器.

#### 主程序类，主入口类
```java
/**
 * 描述:
 *
 * @author liuzhuo
 * @create 2018-11-02 16:31
 */
@SpringBootApplication  //表明这是一个Springboot的启动类
public class HelloWorldApplication {

    public static void main(String[] args) {
        //启动Springboot应用。
        SpringApplication.run(HelloWorldApplication.class);
    }

}
```

**@SpringBootApplication:** Spring Boot应用标注在某个类上说明这个类是SpringBoot的主配置类，SpringBoot
就应该运行这个类的main方法来启动SpringBoot应用；

点击@SpringBootApplication注解：
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = {
		@Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication
```

发现@SpringBootApplication注解是一个组合注解，下面我们一一来看。

**@SpringBootConfiguration:** Spring Boot的配置类；

标注在某个类上，表示这是一个Spring Boot的配置类；
```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration
public @interface SpringBootConfiguration {
}
```

其实就是一个@Configuration注解，只是@Configuration注解，我们是在Spring中使用，@SpringBootConfiguration是在Springboot中使用，本质都一个配置类。

配置类 ----- 配置文件；配置类也是容器中的一个组件；@Component

**@EnableAutoConfiguration**：开启自动配置功能；

以前我们需要配置的东西，Spring Boot帮我们自动配置；@EnableAutoConfiguration告诉SpringBoot开启自
动配置功能；这样自动配置才能生效；
```java
@SuppressWarnings("deprecation")
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage
@Import(EnableAutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration
```
**@AutoConfigurationPackage**：自动配置包
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@Import(AutoConfigurationPackages.Registrar.class)
public @interface AutoConfigurationPackage {

}
```
@Import(AutoConfigurationPackages.Registrar.class)：
Spring的底层注解@Import，给容器中导入一个组件；导入的组件由AutoConfigurationPackages.Registrar.class注入；

```java
	@Order(Ordered.HIGHEST_PRECEDENCE)
	static class Registrar implements ImportBeanDefinitionRegistrar, DeterminableImports {

		@Override
		public void registerBeanDefinitions(AnnotationMetadata metadata,
				BeanDefinitionRegistry registry) {
			register(registry, new PackageImport(metadata).getPackageName());
		}

		@Override
		public Set<Object> determineImports(AnnotationMetadata metadata) {
			return Collections.<Object>singleton(new PackageImport(metadata));
		}

	}
```

给这个方法打上断点。debug下

**会发现，Spring会把将主配置类（@SpringBootApplication标注的类）的所在包及下面所有子包里面的所有组件扫描到Spring容器；**


@**Import(EnableAutoConfigurationImportSelector.class)；**

给容器中导入组件？

EnableAutoConfigurationImportSelector：导入哪些组件的选择器；

将所有需要导入的组件以全类名的方式返回；这些组件就会被添加到容器中；

会给容器中导入非常多的自动配置类（xxxAutoConfiguration）；就是给容器中导入这个场景需要的所有组件，并配置好这些组件；
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102192759.png"/>

有了自动配置类，免去了我们手动编写配置注入功能组件等的工作；
SpringFactoriesLoader.loadFactoryNames(EnableAutoConfiguration.class,classLoader)；

Spring Boot在启动的时候从类路径下的META-INF/spring.factories中获取EnableAutoConfiguration指定的值，将
这些值作为自动配置类导入到容器中，自动配置类就生效，帮我们进行自动配置工作；以前我们需要自己配置的东
西，自动配置类都帮我们；
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102193127.png"/>


J2EE的整体整合解决方案和自动配置都在:``spring-boot-autoconfigure-X.X.X.RELEASE.jar``；

所以，@EnableAutoConfiguration自动配置的魔法骑士就变成了：

**从classpath中搜寻所有的 META-INF/spring.factories 配置文件，并将其中org.springframework.boot.autoconfigure.EnableutoConfiguration对应的配置项**  

**通过反射（Java Refletion）实例化为对应的标注了@Configuration的JavaConfig形式的IoC容器配置类，然后汇总为一个并加载到IoC容器。**

### 深入探索SpringApplication执行流程

SpringApplication的run方法的实现是我们本次旅程的主要线路，该方法的主要流程大体可以归纳如下：

1） 如果我们使用的是SpringApplication的静态run方法，那么，这个方法里面首先要创建一个SpringApplication对象实例，然后调用这个创建好的SpringApplication的实例方法。在SpringApplication实例初始化的时候，它会提前做几件事情：

- 根据classpath里面是否存在某个特征类（org.springframework.web.context.ConfigurableWebApplicationContext）来决定是否应该创建一个为Web应用使用的ApplicationContext类型。
- 使用SpringFactoriesLoader在应用的classpath中查找并加载所有可用的ApplicationContextInitializer。
- 使用SpringFactoriesLoader在应用的classpath中查找并加载所有可用的ApplicationListener。
- 推断并设置main方法的定义类。

2）SpringApplication实例初始化完成并且完成设置后，就开始执行run方法的逻辑了，方法执行开始，首先遍历执行所有通过SpringFactoriesLoader可以查找到并加载的SpringApplicationRunListener。调用它们的started()方法，告诉这些SpringApplicationRunListener，“嘿，SpringBoot应用要开始执行咯！”。

3） 创建并配置当前Spring Boot应用将要使用的Environment（包括配置要使用的PropertySource以及Profile）。

4） 遍历调用所有SpringApplicationRunListener的environmentPrepared()的方法，告诉他们：“当前SpringBoot应用使用的Environment准备好了咯！”。

5） 如果SpringApplication的showBanner属性被设置为true，则打印banner。

6） 根据用户是否明确设置了applicationContextClass类型以及初始化阶段的推断结果，决定该为当前SpringBoot应用创建什么类型的ApplicationContext并创建完成，然后根据条件决定是否添加ShutdownHook，决定是否使用自定义的BeanNameGenerator，决定是否使用自定义的ResourceLoader，当然，最重要的，将之前准备好的Environment设置给创建好的ApplicationContext使用。

7） ApplicationContext创建好之后，SpringApplication会再次借助Spring-FactoriesLoader，查找并加载classpath中所有可用的ApplicationContext-Initializer，然后遍历调用这些ApplicationContextInitializer的initialize（applicationContext）方法来对已经创建好的ApplicationContext进行进一步的处理。

8） 遍历调用所有SpringApplicationRunListener的contextPrepared()方法。

9） 最核心的一步，将之前通过@EnableAutoConfiguration获取的所有配置以及其他形式的IoC容器配置加载到已经准备完毕的ApplicationContext。

10） 遍历调用所有SpringApplicationRunListener的contextLoaded()方法。

11） 调用ApplicationContext的refresh()方法，完成IoC容器可用的最后一道工序。

12） 查找当前ApplicationContext中是否注册有CommandLineRunner，如果有，则遍历执行它们。

13） 正常情况下，遍历执行SpringApplicationRunListener的finished()方法、（如果整个过程出现异常，则依然调用所有SpringApplicationRunListener的finished()方法，只不过这种情况下会将异常信息一并传入处理）

**总结**

到此，SpringBoot的核心组件完成了基本的解析，综合来看，大部分都是Spring框架背后的一些概念和实践方式，SpringBoot只是在这些概念和实践上对特定的场景事先进行了固化和升华，而也恰恰是这些固化让我们开发基于Sping框架的应用更加方便高效。

### 使用Spring Initializer快速创建Spring Boot项目

IDE都支持使用**Spring的项目创建向导**快速创建一个Spring Boot项目；
选择我们需要的模块；向导会联网创建Spring Boot项目；
默认生成的Spring Boot项目；
主程序已经生成好了，我们只需要我们自己的逻辑

resources文件夹中目录结构：
- static：保存所有的静态资源； js css images；
- templates：保存所有的模板页面；（Spring Boot默认jar包使用嵌入式的- - Tomcat，默认不支持JSP页面）；可以使用模板引擎（freemarker、thymeleaf）；
- application.properties：Spring Boot应用的配置文件；可以修改一些默认设置；

1）打开idea，创建一个工程Project
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102201430.png"/>

2）选择Spring Initializr
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102201714.png"/>

3) 填写Group和Artifact
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102202215.png"/>

4）选择Spring boot的版本 和 我们需要的模块（Web）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102202456.png"/>

5）填写项目名和项目的路径
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102202648.png"/>

6）删除不需要的文件
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102202925.png"/>

7）编写逻辑控制层
在com.liuzhuo.springboot的包下，创建controller包，并创建HelloController：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102205841.png"/>

8）启动Springboot应用
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102210019.png"/>

9）在浏览器中输入：`http://localhost:8080/hello`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day01/QQ%E6%88%AA%E5%9B%BE20181102210130.png"/>
