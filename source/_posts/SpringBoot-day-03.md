---
title: SpringBoot_day_03
categories:
  - SpringBoot
  - Spring
tags:
  - SpringBoot
  - Spring
date: 2018-11-04 09:28:58
summary: SpringBoot的日志框架与配置
---
SpringBoot的日志框架与配置

# 日志框架

小张，开发一个大型系统；
1、System.out.println("")；将关键数据打印在控制台；去掉？写在一个文件？
2、框架来记录系统的一些运行时信息；日志框架 ； zhanglogging.jar；
3、高大上的几个功能？异步模式？自动归档？xxxx？ zhanglogging-good.jar？
4、将以前框架卸下来？换上新的框架，重新修改之前相关的API；zhanglogging-prefect.jar；
5、JDBC---数据库驱动；
写了一个统一的接口层；日志门面（日志的一个抽象层）；logging-abstract.jar；
给项目中导入具体的日志实现就行了；我们之前的日志框架都是实现的抽象层；

---

**市面上的日志框架**

JUL、JCL、Jboss-logging、logback、log4j、log4j2、slf4j....

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104094606.png"/>

左边选一个门面（抽象层）、右边来选一个实现；

日志门面： SLF4J；

日志实现：Logback；

SpringBoot：底层是Spring框架，Spring框架默认是用JCL；

**SpringBoot选用 SLF4j 和 logback.**

# SLF4j使用

## 如何在系统中使用SLF4j

[SLF4j参考文档](https://www.slf4j.org/)

以后开发的时候，日志记录方法的调用，**不应该来直接调用日志的实现类，而是调用日志抽象层里面的方法；**

给系统里面导入 **slf4j的jar** 和  **logback的实现jar**

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
public class HelloWorld {
  public static void main(String[] args) {
    Logger logger = LoggerFactory.getLogger(HelloWorld.class);
    logger.info("Hello World");
  }
}
```
图示:
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104095906.png"/>

每一个日志的实现框架都有自己的配置文件。使用slf4j以后，**配置文件还是要用日志实现框架自己本身的配置文件；**

比如使用slf4j 和 logback，就用logback的配置文件，使用slf4j 和 log4j,就使用log4j的配置文件。而不是使用slf4j的配置文件。

## 遗留问题

a系统（slf4j+logback）: Spring（commons-logging）、Hibernate（jboss-logging）、MyBatis、xxxx

我们自己的a系统想要使用slf4j+logback做日志框架，但是我们的a系统是基于Spring、Hibernate等其他框架的，而这些其他框架底层使用的是其他日志框架，Spring使用的是commons-logging，Hibernate使用的是jboss-logging。

现在，我们想统一日志记录，即：使别的框架和我一起统一使用slf4j进行输出，能做到吗？

slf4j官网给出了答案，[参考答案](https://www.slf4j.org/legacy.html)

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104101357.png"/>

**如何让系统中所有的日志都统一到slf4j?**

<font color="red">1、将系统中其他日志框架的日志jar包先排除出去；

2、用中间包来替换原有的日志框架的jar；

3、导入slf4j其他的实现。</font>

# SpringBoot日志关系

创建一个新的Springboot的应用，只需要Web模块即可。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104103732.png"/>

现在，我们来查看一下Springboot的依赖关系。

查看依赖关系

1）使用idea的自带的maven管理器工具
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104103856.png" style="width:50%"/>

这样不够直观。

2）查看依赖图

在pom文件中，右键点击Diagrams -> show dependencies
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104104228.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104104542.png"/>

首先查看spring‐boot‐starter，因为这是Springboot的应用都必须依赖的jar包。

```java
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter</artifactId>
</dependency>
```

然后发现，在spring‐boot‐starter下，有spring‐boot‐starter‐logging。

说明SpringBoot使用它来做日志功能
```
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-logging</artifactId>
		</dependency>
```

再来看spring-boot-starter-logging底层依赖：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104105357.png"/>

总结：

1）、SpringBoot底层也是使用 **slf4j + logback** 的方式进行日志记录

2）、SpringBoot也把其他的日志都替换成了slf4j；

3）、中间替换包？

```java
@SuppressWarnings("rawtypes")
public abstract class LogFactory {
    static String UNSUPPORTED_OPERATION_IN_JCL_OVER_SLF4J =
"http://www.slf4j.org/codes.html#unsupported_operation_in_jcl_over_slf4j";
    static LogFactory logFactory = new SLF4JLogFactory();
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104105601.png" style="width:50%"/>

其实这些jar包，本身还是原来的日志框架的jar包，只是在使用的过程中，偷换成了slf4j的日志框架，就和适配器模式很像。

**这些操作，Springboot已经帮我们做好了，我们只需要在引入其他框架的时候，移除掉他们本身的日志框架就行了。**

4）、如果我们要引入其他框架？一定要把这个框架的默认日志依赖移除掉？

　　　我们挑Spring来做一个列子：

　　　Spring框架用的是commons-logging；

```java
<dependency>        
	<groupId>org.springframework</groupId>            
	<artifactId>spring‐core</artifactId>            
	<exclusions>            
         <exclusion>                
            <groupId>commons‐logging</groupId>                    
            <artifactId>commons‐logging</artifactId>                    
         </exclusion>                
	</exclusions>            
</dependency>
```

发现，Springboot也帮我们剔除掉了，Springboot真方便！！！

<font color="red">**SpringBoot能自动适配所有的日志，而且底层使用slf4j+logback的方式记录日志，引入其他框架的时候，只需要
把这个框架依赖的日志框架排除掉即可；**</font>

# 日志使用

## 默认配置

直接运行，我们刚刚创建的项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104112034.png"/>

发现，Springboot已经帮我们创建好了默认的配置。默认情况下，Spring Boot会用Logback来记录日志，并用INFO级别输出到控制台。在运行应用程序和其他例子时，你应该已经看到很多INFO级别的日志了。

从上图可以看到，日志输出内容元素具体如下：
- 时间日期：精确到毫秒
- 日志级别：ERROR, WARN, INFO, DEBUG or TRACE
- 进程ID
- 分隔符：－－－ 标识实际日志的开始
- 线程名：方括号括起来（可能会截断控制台输出）
- Logger名：通常使用源代码的类名
- 日志内容

使用：

在测试类中：

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringBoot03LoggingApplicationTests {

	//日志记录器
	Logger logger = LoggerFactory.getLogger(getClass());

	@Test
	public void contextLoads() {

		//System.out.println();  我们不再使用这种方法来记录了

		//日志的级别，trace < debug < info < warn < error
		//只会打印本级别和比本级别更高的日志
		logger.trace("这是trace日志···");
		logger.debug("这是debug日志···");
		//Springboot默认的级别是info级别
		logger.info("这是info日志···");
		logger.warn("这是warn日志···");
		logger.error("这error日志···");
	}

}
```

运行测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104113131.png"/>

只打印了info级别以及以上的。说明Springboot默认的日志级别是info。

1) 修改日志的级别。

在application.properties文件中。
```
logging.level.com.liuzhuo=trace
```
再次运行测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104113410.png"/>

格式为：logging.level.* = LEVEL

- logging.level：日志级别控制前缀，*为包名或Logger名
- LEVEL：选项 TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF

举例：
- logging.level.com.liuzhuo=DEBUG：com.liuzhuo包下所有class以DEBUG级别输出
- logging.level.root=WARN：root日志以WARN级别输出

2) 日志文件的输出

默认情况下，Spring Boot将日志输出到控制台，不会写到日志文件。如果要编写除控制台输出之外的日志文件，则需在application.properties中设置logging.file或logging.path属性。

- logging.file，设置文件，可以是绝对路径，也可以是相对路径。如：logging.file=my.log
- logging.path，设置目录，会在该目录下创建spring.log文件，并写入日志内容，如：logging.path=/var/log

logging.file=xxx.log，会在项目的根目录下生成xxx.log文件
logging.file=G:/xxx.log，会在G盘下生xxx.log文件

logging.path=/aaa/bbb，会在项目的磁盘下，创建aaa/bbb文件夹，然后生成spring.log日志文件，**日志文件的名字都是spring.log**

<font color="red">注：二者不能同时使用，如若同时使用，则只有logging.file生效</font>

**默认情况下，日志文件的大小达到10MB时会切分一次，产生新的日志文件，默认级别为：ERROR、WARN、INFO**

3) 日志输出格式的设置

```
# 在控制台输出的日志的格式
logging.pattern.console=%d{yyyy‐MM‐dd} [%thread] %‐5level %logger{50} ‐ %msg%n
# 指定文件中日志输出的格式
logging.pattern.file=%d{yyyy‐MM‐dd} === [%thread] === %‐5level === %logger{50} ==== %msg%n
```
```
日志输出格式：

%d表示日期时间，        
%thread表示线程名，        
%‐5level：级别从左显示5个字符宽度        
%logger{50} 表示logger名字最长50个字符，否则按照句点分割。         
%msg：日志消息，        
%n是换行符  
      
    ‐‐>

%d{yyyy‐MM‐dd HH:mm:ss.SSS} [%thread] %‐5level %logger{50} ‐ %msg%n
```

## 指定配置

在使用我们自己定义的日志配置文件之前，我们先来看看，为啥我们不用配置日志文件，Springboot中也能使用日志功能？

1) 打开org.springframework.boot:spring-boot:1.5.17.RELEASE  
2) 打开org.springframework.boot  
3) 打开logging、logback、base.xml  
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104150319.png" style="width:50%"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104150519.png" style="width:50%"/>

```java
<?xml version="1.0" encoding="UTF-8"?>

<!--
Base logback configuration provided for compatibility with Spring Boot 1.1
-->

<included>
	<include resource="org/springframework/boot/logging/logback/defaults.xml" />
	<property name="LOG_FILE" value="${LOG_FILE:-${LOG_PATH:-${LOG_TEMP:-${java.io.tmpdir:-/tmp}}}/spring.log}"/>
	<include resource="org/springframework/boot/logging/logback/console-appender.xml" />
	<include resource="org/springframework/boot/logging/logback/file-appender.xml" />
	<root level="INFO">
		<appender-ref ref="CONSOLE" />
		<appender-ref ref="FILE" />
	</root>
</included>

```

我们发现，Springboot已经帮我们默认配置好了。

我们看到root下的 level的等于INFO，所以Springboot默认是info级别。

再看`<include resource="org/springframework/boot/logging/logback/defaults.xml" />`
```
<?xml version="1.0" encoding="UTF-8"?>

<!--
Default logback configuration provided for import, equivalent to the programmatic
initialization performed by Boot
-->

<included>
	<conversionRule conversionWord="clr" converterClass="org.springframework.boot.logging.logback.ColorConverter" />
	<conversionRule conversionWord="wex" converterClass="org.springframework.boot.logging.logback.WhitespaceThrowableProxyConverter" />
	<conversionRule conversionWord="wEx" converterClass="org.springframework.boot.logging.logback.ExtendedWhitespaceThrowableProxyConverter" />
	<property name="CONSOLE_LOG_PATTERN" value="${CONSOLE_LOG_PATTERN:-%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr(${PID:- }){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}}"/>
	<property name="FILE_LOG_PATTERN" value="${FILE_LOG_PATTERN:-%d{yyyy-MM-dd HH:mm:ss.SSS} ${LOG_LEVEL_PATTERN:-%5p} ${PID:- } --- [%t] %-40.40logger{39} : %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}}"/>

	<appender name="DEBUG_LEVEL_REMAPPER" class="org.springframework.boot.logging.logback.LevelRemappingAppender">
		<destinationLogger>org.springframework.boot</destinationLogger>
	</appender>

	<logger name="org.apache.catalina.startup.DigesterFactory" level="ERROR"/>
	<logger name="org.apache.catalina.util.LifecycleBase" level="ERROR"/>
	<logger name="org.apache.coyote.http11.Http11NioProtocol" level="WARN"/>
	<logger name="org.apache.sshd.common.util.SecurityUtils" level="WARN"/>
	<logger name="org.apache.tomcat.util.net.NioSelectorPool" level="WARN"/>
	<logger name="org.crsh.plugin" level="WARN"/>
	<logger name="org.crsh.ssh" level="WARN"/>
	<logger name="org.eclipse.jetty.util.component.AbstractLifeCycle" level="ERROR"/>
	<logger name="org.hibernate.validator.internal.util.Version" level="WARN"/>
	<logger name="org.springframework.boot.actuate.autoconfigure.CrshAutoConfiguration" level="WARN"/>
	<logger name="org.springframework.boot.actuate.endpoint.jmx" additivity="false">
		<appender-ref ref="DEBUG_LEVEL_REMAPPER"/>
	</logger>
	<logger name="org.thymeleaf" additivity="false">
		<appender-ref ref="DEBUG_LEVEL_REMAPPER"/>
	</logger>
</included>

```

我们能看到
```
<property name="CONSOLE_LOG_PATTERN" value="${CONSOLE_LOG_PATTERN:-%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr(${PID:- }){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}}"/>
```
这里就是配置控制台输出日志格式的配置，我们写在application.propertiese中的logging.pattern.console=xxx.就会覆盖这个配置中的内容，如果不配置的话，就使用默认的配置，就是冒号后面的一串：`-%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} xxxxx`

---

现在我们已经了解到了Springboot的默认日志文件的配置了。当我们具体使用日志框架时，需要使用哪个配置文件呢？

打开Spring的官网，[logging参考文献](https://docs.spring.io/spring-boot/docs/1.5.17.RELEASE/reference/htmlsingle/#boot-features-logging)

找到：**26.5 Custom log configuration**

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104194411.png"/>

从图中，我们可以看出，使用logback日志框架，就使用logback-spring.xml、logback.xml等配置文件。

其他的日志框架，类似logback。

**给类路径下放上每个日志框架自己的配置文件即可；SpringBoot就不使用他默认配置的了。**

现在，我们在类路径下，即resources下，放入一个logback.xml的日志配置文件。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104195557.png"/>

```java
<?xml version="1.0" encoding="UTF-8"?>
<!--
scan：当此属性设置为true时，配置文件如果发生改变，将会被重新加载，默认值为true。
scanPeriod：设置监测配置文件是否有修改的时间间隔，如果没有给出时间单位，默认单位是毫秒当scan为true时，此属性生效。默认的时间间隔为1分钟。
debug：当此属性设置为true时，将打印出logback内部日志信息，实时查看logback运行状态。默认值为false。
-->
<configuration scan="false" scanPeriod="60 seconds" debug="false">
    <!-- 定义日志的根目录 -->
    <property name="LOG_HOME" value="/app/log" />
    <!-- 定义日志文件名称 -->
    <property name="appName" value="atguigu-springboot"></property>
    <!-- ch.qos.logback.core.ConsoleAppender 表示控制台输出 -->
    <appender name="stdout" class="ch.qos.logback.core.ConsoleAppender">
        <!--
        日志输出格式：
			%d表示日期时间，
			%thread表示线程名，
			%-5level：级别从左显示5个字符宽度
			%logger{50} 表示logger名字最长50个字符，否则按照句点分割。 
			%msg：日志消息，
			%n是换行符
        -->
        <layout class="ch.qos.logback.classic.PatternLayout">
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </layout>
    </appender>

    <!-- 滚动记录文件，先将日志记录到指定文件，当符合某个条件时，将日志记录到其他文件 -->  
    <appender name="appLogAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 指定日志文件的名称 -->
        <file>${LOG_HOME}/${appName}.log</file>
        <!--
        当发生滚动时，决定 RollingFileAppender 的行为，涉及文件移动和重命名
        TimeBasedRollingPolicy： 最常用的滚动策略，它根据时间来制定滚动策略，既负责滚动也负责出发滚动。
        -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!--
            滚动时产生的文件的存放位置及文件名称 %d{yyyy-MM-dd}：按天进行日志滚动 
            %i：当文件大小超过maxFileSize时，按照i进行文件滚动
            -->
            <fileNamePattern>${LOG_HOME}/${appName}-%d{yyyy-MM-dd}-%i.log</fileNamePattern>
            <!-- 
            可选节点，控制保留的归档文件的最大数量，超出数量就删除旧文件。假设设置每天滚动，
            且maxHistory是365，则只保存最近365天的文件，删除之前的旧文件。注意，删除旧文件是，
            那些为了归档而创建的目录也会被删除。
            -->
            <MaxHistory>365</MaxHistory>
            <!-- 
            当日志文件超过maxFileSize指定的大小是，根据上面提到的%i进行日志文件滚动 注意此处配置SizeBasedTriggeringPolicy是无法实现按文件大小进行滚动的，必须配置timeBasedFileNamingAndTriggeringPolicy
            -->
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <!-- 日志输出格式： -->     
        <layout class="ch.qos.logback.classic.PatternLayout">
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [ %thread ] - [ %-5level ] [ %logger{50} : %line ] - %msg%n</pattern>
        </layout>
    </appender>

    <!-- 
		logger主要用于存放日志对象，也可以定义日志类型、级别
		name：表示匹配的logger类型前缀，也就是包的前半部分
		level：要记录的日志级别，包括 TRACE < DEBUG < INFO < WARN < ERROR
		additivity：作用在于children-logger是否使用 rootLogger配置的appender进行输出，
		false：表示只用当前logger的appender-ref，true：
		表示当前logger的appender-ref和rootLogger的appender-ref都有效
    -->
    <!-- hibernate logger -->
    <logger name="com.atguigu" level="debug" />
    <!-- Spring framework logger -->
    <logger name="org.springframework" level="debug" additivity="false"></logger>



    <!-- 
    root与logger是父子关系，没有特别定义则默认为root，任何一个类只会和一个logger对应，
    要么是定义的logger，要么是root，判断的关键在于找到这个logger，然后判断这个logger的appender和level。 
    -->
    <root level="info">
        <appender-ref ref="stdout" />
        <appender-ref ref="appLogAppender" />
    </root>
</configuration> 
```

现在，我们修改一下日志的输出格式：
```
 <!-- 日志输出格式： -->     
<layout class="ch.qos.logback.classic.PatternLayout">
    <pattern>%d{yyyy-MM-dd} -----> [ %thread ] -----> [ %-5level ] [ %logger{50} : %line ] -----> %msg%n</pattern>
</layout>
```
**把时间的时分秒去掉，然后把分隔符改为箭头。**

启动Springboot项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104200138.png"/>

我们的日志配置文件设置成功了。

---

我们注意到了，官网上面写了logback.xml和logback-spring.xml两种配置文件的**书写方式。**

<font color="red">**官网推荐我们使用logback-spring.xml命名的配置文件。**</font>

logback.xml: 是直接被日志框架识别，在Spring应用启动之前。不会走Spring的流程。

**logback-spring.xml:** 日志框架就不直接加载日志的配置项，由SpringBoot解析日志配置，可以使用SpringBoot
的高级Profile功能

可以使用：在哪个环境下生效。

```
<springProfile name="staging">
    <!‐‐ configuration to be enabled when the "staging" profile is active ‐‐>
   可以指定某段配置只在某个环境下生效  
</springProfile>
```

如：
```
<appender name="stdout" class="ch.qos.logback.core.ConsoleAppender">
        <!‐‐
        日志输出格式：
	 %d表示日期时间，            
	 %thread表示线程名，            
	 %‐5level：级别从左显示5个字符宽度            
	 %logger{50} 表示logger名字最长50个字符，否则按照句点分割。             
	 %msg：日志消息，            
	 %n是换行符            
        ‐‐>
        <layout class="ch.qos.logback.classic.PatternLayout">
            <springProfile name="dev">
                <pattern>%d{yyyy‐MM‐dd HH:mm:ss.SSS} ‐‐‐‐> [%thread] ‐‐‐> %‐5level %logger{50} ‐ %msg%n</pattern>
            </springProfile>
            <springProfile name="!dev">
                <pattern>%d{yyyy‐MM‐dd HH:mm:ss.SSS} ==== [%thread] ==== %‐5level %logger{50} ‐ %msg%n</pattern>
            </springProfile>
        </layout>
    </appender>
```
在dev环境下：使用上面的输出格式。

在非dev环境下：使用下面的输出格式。

现在运行Springboot项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104201524.png"/>

**发现，日志框架出现错误了。因为我们的日志配置文件的名字还没有改。**

现在修改logback.xml ---> logback-spring.xml.

再次启动Springboot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104201940.png"/>

发现，启动的是非dev环境的日志控制台输出格式。

我们在配置Springboot为dev环境。

1）application.properties.

spring.profiles.active=dev

2) 配置命令行参数：
`--spring.profiles.active=dev`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104202332.png"/>

使用上面两种方法都可以改变Springboot的环境。

然后启动Springboot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104202559.png"/>


# 切换日志框架

## 切换成log4j

现在，我们使用的是slf4j+logback。但是我们想换成slf4j + log4j怎么办？

**这里，说明一下，就是因为log4j有问题，所以才会推出logback日志框架的，这里只是做个例子演示日志框架的切换，实际情况下，直接使用logback日志框架就行。**

切换日志框架，我们直接参考slf4j的官网的那个图，就行。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104204428.png"/>

现在打开我们的依赖图层：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104204742.png"/>

去掉图中画红色框框的logback的依赖。

快速移除依赖：在想要移除的依赖上面，右键Exclude
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104205023.png"/>

移除完毕后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104205144.png" style="width:50%"/>

打开pom.xml文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104205307.png"/>

现在需要添加log4j的依赖。

直接在pom.xml文件中添加：
```
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-log412</artifactId>
</dependency>
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104205726.png"/>

启动Springboot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day03/QQ%E6%88%AA%E5%9B%BE20181104205838.png"/>
**发出警告，因为在类路径下，没有log4j.properties的配置文件。**

在resources下，添加log4j.properties的配置文件
```
### set log levels ###
log4j.rootLogger = debug ,  stdout ,  D ,  E

### 输出到控制台 ###
log4j.appender.stdout = org.apache.log4j.ConsoleAppender
log4j.appender.stdout.Target = System.out
log4j.appender.stdout.layout = org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern =  %d{ABSOLUTE} %5p %c{ 1 }:%L - %m%n

#### 输出到日志文件 ###
#log4j.appender.D = org.apache.log4j.DailyRollingFileAppender
#log4j.appender.D.File = logs/log.log
#log4j.appender.D.Append = true
#log4j.appender.D.Threshold = DEBUG ## 输出DEBUG级别以上的日志
#log4j.appender.D.layout = org.apache.log4j.PatternLayout
#log4j.appender.D.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
#
#### 保存异常信息到单独文件 ###
#log4j.appender.D = org.apache.log4j.DailyRollingFileAppender
#log4j.appender.D.File = logs/error.log ## 异常日志文件名
#log4j.appender.D.Append = true
#log4j.appender.D.Threshold = ERROR ## 只输出ERROR级别以上的日志!!!
#log4j.appender.D.layout = org.apache.log4j.PatternLayout
#log4j.appender.D.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n

```

再次启动应用，就会打印出日志信息了。

---

## 切换成log4j2

在官网上面，我们能发现，Springboot默认是加载logback日志框架的，我们也可以直接改成log4j2日志框架。

在pom.xml文件中：
```java
    <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring‐boot‐starter‐web</artifactId>
          <exclusions>
             <exclusion>
                 <artifactId>spring‐boot‐starter‐logging</artifactId>
                 <groupId>org.springframework.boot</groupId>
            </exclusion>
          </exclusions>
    </dependency>

	<dependency>
	  <groupId>org.springframework.boot</groupId>
	  <artifactId>spring‐boot‐starter‐log4j2</artifactId>
	</dependency>
```

直接移除spring‐boot‐starter‐logging依赖。然后添加spring‐boot‐starter‐log4j2的依赖。

然后添加log4j2-spring.xml 或者 log4j2.xml 日志配置文件。