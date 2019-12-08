---
title: SpringBoot_day_04
categories:
  - SpringBoot
  - Spring
tags:
  - SpringBoot
  - Spring
date: 2018-11-05 13:11:16
summary: Springboot的Web开发
---

今天，我们开始Springboot的Web开发

### 简介

使用SpringBoot:

**1）、创建SpringBoot应用，选中我们需要的模块；**

**2）、SpringBoot已经默认将这些场景配置好了，只需要在配置文件中指定少量配置就可以运行起来.**

**3）、自己编写业务代码；**

想要使用SpringBoot的自动配置的功能，我们必须熟知SpringBoot的自动配置的原理。

#### 自动配置原理

这个场景SpringBoot帮我们配置了什么？能不能修改？能修改哪些配置？能不能扩展？xxx

自动配置原理，一般我们需要看：**spring-boot-autoconfigure**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105134252.png" style="width:50%"/>

然后再看我们想要的模块里面的：
```java
xxxxAutoConfiguration: 帮我们给容器中自动配置组件；
xxxxProperties:        配置类来封装配置文件的内容；
```
比如：Web模块，看：DispatchServletAutoConfiguration
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105134739.png" style="width:50%"/>


## SpringBoot对静态资源的映射规则

创建我们的今天的Web项目：（添加Web模块）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105141110.png"/>

在：**spring-boot-autoconfigurejar** 下：

web下的 **WebMvcAutoConfiguration**：专门为我们配置了默认的Web应用的配置：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105141946.png"/>

**设置：静态资源的相关配置的类：**

```java
@ConfigurationProperties(prefix = "spring.resources", ignoreUnknownFields = false)
public class ResourceProperties implements ResourceLoaderAware, InitializingBean {

	private static final String[] SERVLET_RESOURCE_LOCATIONS = { "/" };

	private static final String[] CLASSPATH_RESOURCE_LOCATIONS = {
			"classpath:/META-INF/resources/", "classpath:/resources/",
			"classpath:/static/", "classpath:/public/" };

	private static final String[] RESOURCE_LOCATIONS;

	static {
		RESOURCE_LOCATIONS = new String[CLASSPATH_RESOURCE_LOCATIONS.length
				+ SERVLET_RESOURCE_LOCATIONS.length];
		System.arraycopy(SERVLET_RESOURCE_LOCATIONS, 0, RESOURCE_LOCATIONS, 0,
				SERVLET_RESOURCE_LOCATIONS.length);
		System.arraycopy(CLASSPATH_RESOURCE_LOCATIONS, 0, RESOURCE_LOCATIONS,
				SERVLET_RESOURCE_LOCATIONS.length, CLASSPATH_RESOURCE_LOCATIONS.length);
	}
   
   ·····

  //可以设置和静态资源有关的参数，缓存时间等
```

**设置静态资源映射的默认方法：**

```java
		@Override
		public void addResourceHandlers(ResourceHandlerRegistry registry) {
			if (!this.resourceProperties.isAddMappings()) {
				logger.debug("Default resource handling disabled");
				return;
			}
			Integer cachePeriod = this.resourceProperties.getCachePeriod();
			if (!registry.hasMappingForPattern("/webjars/**")) {
				customizeResourceHandlerRegistration(registry
						.addResourceHandler("/webjars/**")
						.addResourceLocations("classpath:/META-INF/resources/webjars/")
						.setCachePeriod(cachePeriod));
			}
			String staticPathPattern = this.mvcProperties.getStaticPathPattern();
			if (!registry.hasMappingForPattern(staticPathPattern)) {
				customizeResourceHandlerRegistration(
						registry.addResourceHandler(staticPathPattern)
								.addResourceLocations(
										this.resourceProperties.getStaticLocations())
								.setCachePeriod(cachePeriod));
			}
		}
```

### webjars静态资源映射规则

``所有 /webjars/** ，都去 classpath:/META-INF/resources/webjars/ 找资源 ``

webjars：以jar包的方式引入静态资源.

[webjars官网](https://www.webjars.org/)

例子：引入jQuery的静态资源。

打开webjars官网，找到jQuery的Maven配置信息：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105143244.png"/>

将拷贝的jQuery的Maven配置，导入到我们的项目中。
```
        <dependency>
            <groupId>org.webjars</groupId>
            <artifactId>jquery</artifactId>
            <version>3.3.1-1</version>
        </dependency>
```
在我们的依赖jar中，找到jQuery的依赖：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105143645.png" style="width:50%"/>

发现，这个依赖的jar的目录格式，也是 ``classpath:/META-INF/resources/webjars/``

<font color="red">所以：当我们访问/webjars/**的url时，SpringBoot会帮我们在classpath:/META-INF/resources/webjars/选择webjars的静态jar资源。</font>

启动我们的项目：

在浏览器中输入：`http://localhost:8080/webjars/jquery/3.3.1-1/jquery.js `
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105144226.png" />

**webjar的静态资源访问成功！**

### 静态资源的映射原理
``/**  访问当前项目的任何资源，都去（静态资源的文件夹）找映射``

```java
String staticPathPattern = this.mvcProperties.getStaticPathPattern();
	if (!registry.hasMappingForPattern(staticPathPattern)) {
		customizeResourceHandlerRegistration(
		registry.addResourceHandler(staticPathPattern)
				.addResourceLocations(
						this.resourceProperties.getStaticLocations())
				.setCachePeriod(cachePeriod));
	}
```

这里，注册了 **staticPathPattern** 和 **this.resourceProperties.getStaticLocations()** 的静态资源访问。

点击：staticPathPattern：`private String staticPathPattern = "/**";` 

点击：getStaticLocations()：
```javascript
	private static final String[] CLASSPATH_RESOURCE_LOCATIONS = {
			"classpath:/META-INF/resources/", "classpath:/resources/",
			"classpath:/static/", "classpath:/public/" 
    };
```

<font color="red">**总结**：</font>

对于：/** 的静态资源的访问。

会到以下的路径寻找静态资源：

**"classpath:/META‐INF/resources/",**

**"classpath:/resources/",**

**"classpath:/static/",**

**"classpath:/public/"**


这里的"classpath"：就相当于我们项目的java、resources目录。

印证我们的默认的静态资源访问：

在以上的目录中随意放一张照片：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105150445.png" style="width:50%"/>

三张，不同的照片，但是名字都是123.jpg的照片。

启动项目，在浏览器中输入：`http://localhost:8080/123.jpg`

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105150124.png" />

出现的是"META-INF/resources"下的123.jpg照片。 

删除"META-INF/resources"下的123.jpg照片. 再次访问是"classpath:/resources/"下的123.jpg

依次类推：再是"classpath:/static/"、"classpath:/public/"。

<font color="red">**优先级是：从上到下，依次递减**</font>

---

### 欢迎页: 静态资源文件夹下的所有index.html页面；被"/**"映射
```java
@Bean
public WelcomePageHandlerMapping welcomePageHandlerMapping(
		ResourceProperties resourceProperties) {
	return new WelcomePageHandlerMapping(resourceProperties.getWelcomePage(),
			this.mvcProperties.getStaticPathPattern());
}
```
getWelcomePage():
```java
	private String[] getStaticWelcomePageLocations() {
		String[] result = new String[this.staticLocations.length];
		for (int i = 0; i < result.length; i++) {
			String location = this.staticLocations[i];
			if (!location.endsWith("/")) {
				location = location + "/";
			}
			result[i] = location + "index.html";
		}
		return result;
	}
```
getStaticPathPattern():
```java
private String staticPathPattern = "/**";
```

<b>即对:　/**　 的访问。SpringBoot会自动到刚刚我们的提到的静态资源的文件夹下找index.html的页面</b>

localhost:8080/ 找index页面

---

### 所有的 **/favicon.ico 都是在静态资源文件下找
```java
@Bean
public SimpleUrlHandlerMapping faviconHandlerMapping() {
	SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
	mapping.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
	mapping.setUrlMap(Collections.singletonMap("**/favicon.ico",
			faviconRequestHandler()));
	return mapping;
}
```
---

## 模板引擎

JSP、Velocity、Freemarker、Thymeleaf
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105153402.png"/>

Springboot默认是不支持jsp模板引擎的，因为SpringBoot是打成jar包，使用嵌入式的Tomcat容器。

这里，我们使用SpringBoot官方推荐的 **Thymeleaf **模板引擎。语法更简单，功能更强大。

### 引入thymeleaf

```
  <!-- Springboot默认是：2.1.6 的版本 -->  
  <dependency>        
    <groupId>org.springframework.boot</groupId>            
    <artifactId>spring‐boot‐starter‐thymeleaf</artifactId>            
  </dependency> 
       
  <!-- 切换thymeleaf版本 -->
  <properties>
     <thymeleaf.version>3.0.9.RELEASE</thymeleaf.version>        
     <!‐‐ 布局功能的支持程序  thymeleaf3主程序  layout2以上版本 ‐‐>           
     <thymeleaf‐layout‐dialect.version>2.2.2</thymeleaf‐layout‐dialect.version>        
  </properties>
```

**注意，SpringBoot默认导入的thymeleaf只是2.1.6的版本，如果想切换更高的版本，查看thymeleaf的github中的发行版**

[thymeleaf版本](https://github.com/thymeleaf/thymeleaf/releases)

**thymeleaf‐layout‐dialect.version：布局的版本，请注意，如果使用thymeleaf3以上的版本，那么布局的版本必须是2.0.0以上**：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105155420.png"/>


### Thymeleaf使用

```java
@ConfigurationProperties(prefix = "spring.thymeleaf")
public class ThymeleafProperties {

	private static final Charset DEFAULT_ENCODING = Charset.forName("UTF‐8");   
 
	private static final MimeType DEFAULT_CONTENT_TYPE = MimeType.valueOf("text/html"); 
   
	public static final String DEFAULT_PREFIX = "classpath:/templates/";    

	public static final String DEFAULT_SUFFIX = ".html";    

	   //
}
```
Springboot默认的 themleaf 配置：

使用UTF-8字码，媒体类型：text/html，模板解析的前缀：classpath:/templates/，模板解析的后缀：.html

即：只要我们把HTML页面放在classpath:/templates/，thymeleaf就能自动渲染；

使用：

1、导入thymeleaf的名称空间：(在idea中会有相应的提示功能)
```java
<html lang="en" xmlns:th="http://www.thymeleaf.org">
```

2、使用thymeleaf语法

```
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF‐8">
    <title>Title</title>
</head>
<body>
    <h1>成功！</h1>
    <!‐‐th:text 将div里面的文本内容设置为 ‐‐>
    <div th:text="${hello}">这是显示欢迎信息</div>
</body>
</html>
```

### 语法规则

[thymeleaf参考手册](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html)


1）th:text，改变当前元素里面的文本内容。

th：任意html属性；来替换原生属性的值。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day04/QQ%E6%88%AA%E5%9B%BE20181105163700.png"/>

2）表达式

**Simple expressions:（表达式语法）**

Variable Expressions: ${...}：获取变量值；OGNL；

1）、获取对象的属性、调用方法   

例如：＄{user.name}
     
2）、使用内置的基本对象：
        
　　　#ctx : the context object
　　　#vars: the context variables.            
　　　#locale : the context locale.
　　　#request : (only in Web Contexts) the HttpServletRequest object.
　　　#response : (only in Web Contexts) the HttpServletResponse object.
　　　#session : (only in Web Contexts) the HttpSession object.
　　　#servletContext : (only in Web Contexts) the ServletContext object.

例如：${session.foo}

3）、内置的一些工具对象：
```
#execInfo : information about the template being processed.
#messages : methods for obtaining externalized messages inside variables expressions
#uris : methods for escaping parts of URLs/URIs
#conversions : methods for executing the configured conversion service (if any).
#dates : methods for java.util.Date objects: formatting, component extraction, etc.
#calendars : analogous to #dates , but for java.util.Calendar objects.
#numbers : methods for formatting numeric objects.
#strings : methods for String objects: contains, startsWith, prepending/appending, etc.
#objects : methods for objects in general.
#bools : methods for boolean evaluation.
#arrays : methods for arrays.
#lists : methods for lists.
#sets : methods for sets.
#maps : methods for maps.
#aggregates : methods for creating aggregates on arrays or collections.
#ids : methods for dealing with id attributes that might be repeated 
```
---

**Selection Variable Expressions: *{...}：选择表达式：和 ${} 在功能上是一样；**
```
 补充：配合 th:object="${session.user}：    

 <div th:object="${session.user}">
    <p>Name: <span th:text="*{firstName}">Sebastian</span>.</p>
    <p>Surname: <span th:text="*{lastName}">Pepper</span>.</p>
    <p>Nationality: <span th:text="*{nationality}">Saturn</span>.</p>
 </div>
   ---------------------------等价----------------------------------------
  <div>
    <p>Name: <span th:text="${session.user.firstName}">Sebastian</span>.</p>
    <p>Surname: <span th:text="${session.user.lastName}">Pepper</span>.</p>
    <p>Nationality: <span th:text="${session.user.nationality}">Saturn</span>.</p>
 </div>
```

---

其他表达式：
```
Message Expressions: #{...}：获取国际化内容

Link URL Expressions: @{...}：定义URL；
@{/order/process(execId=${execId},execType='FAST')} 
       
Fragment Expressions: ~{...}：片段引用表达式
<div th:insert="~{commons :: main}">...</div>

Literals（字面量）
      Text literals: 'one text' , 'Another one!' ,…
      Number literals: 0 , 34 , 3.0 , 12.3 ,…
      Boolean literals: true , false
      Null literal: null
      Literal tokens: one , sometext , main ,…
Text operations:（文本操作）
    String concatenation: +
    Literal substitutions: |The name is ${name}|
Arithmetic operations:（数学运算）
    Binary operators: + , ‐ , * , / , %
    Minus sign (unary operator): ‐
Boolean operations:（布尔运算）
    Binary operators: and , or
    Boolean negation (unary operator): ! , not
Comparisons and equality:（比较运算）
    Comparators: > , < , >= , <= ( gt , lt , ge , le )
    Equality operators: == , != ( eq , ne )
Conditional operators:条件运算（三元运算符）
    If‐then: (if) ? (then)
    If‐then‐else: (if) ? (then) : (else)
    Default: (value) ?: (defaultvalue)
Special tokens:
    No‐Operation: _

```