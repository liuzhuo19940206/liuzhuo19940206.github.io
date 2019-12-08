---
title: SpringBoot_day_05
categories:
  - SpringBoot
  - Spring
tags:
  - SpringBoot
  - Spring
date: 2018-11-06 10:56:30
summary: Springboot中的SpringMVC的自动配置原理
---

今天，学习Springboot中的SpringMVC的自动配置原理

[Springboot的官方参考文档](https://docs.spring.io/spring-boot/docs/1.5.10.RELEASE/reference/htmlsingle/#boot-features-developing-web-applications)

## Spring MVC auto-configuration

Spring Boot 自动配置好了SpringMVC

以下是SpringBoot对SpringMVC的默认配置:（**WebMvcAutoConfiguration**）

### ContentNegotiatingViewResolver and  BeanNameViewResolver
```java
		@Bean
		@ConditionalOnBean(View.class)
		@ConditionalOnMissingBean
		public BeanNameViewResolver beanNameViewResolver() {
			BeanNameViewResolver resolver = new BeanNameViewResolver();
			resolver.setOrder(Ordered.LOWEST_PRECEDENCE - 10);
			return resolver;
		}

		@Bean
		@ConditionalOnBean(ViewResolver.class)
		@ConditionalOnMissingBean(name = "viewResolver", value = ContentNegotiatingViewResolver.class)
		public ContentNegotiatingViewResolver viewResolver(BeanFactory beanFactory) {
			ContentNegotiatingViewResolver resolver = new ContentNegotiatingViewResolver();
			resolver.setContentNegotiationManager(
					beanFactory.getBean(ContentNegotiationManager.class));
			// ContentNegotiatingViewResolver uses all the other view resolvers to locate
			// a view so it should have a high precedence
			resolver.setOrder(Ordered.HIGHEST_PRECEDENCE);
			return resolver;
		}
```

　　1) 自动配置了ViewResolver（视图解析器：根据方法的返回值得到视图对象（View），视图对象决定如何
　　渲染（转发？重定向？））

　　2) ContentNegotiatingViewResolver：组合所有的视图解析器的；

　　3) 如何定制：<font color="#FF3E96">**我们可以自己给容器中添加一个视图解析器；ContentNegotiatingViewResolver会自动将其组合进来；**</font>

### Support for serving static resources, including support for WebJars 

　　静态资源文件夹路径,webjars（上一天，我们已经学过了）

### Static  index.html support

　　静态首页index.html访问.

### Custom  Favicon support

　　favicon.ico图标的访问。

### 自动注册了 Converter、GenericConverter、Formatter beans.

　　1）Converter：转换器； public String hello(User user)：类型转换使用Converter。

　　2）Formatter：格式化器； 2017.12.17===Date。
```java
@Bean        
@ConditionalOnProperty(prefix = "spring.mvc", name = "date‐format")//在文件中配置日期格式化的规则
public Formatter<Date> dateFormatter() {        
return new DateFormatter(this.mvcProperties.getDateFormat());//日期格式化组件            
} 
```

　　3）<font color="#FF3E96">**自己添加的格式化器转换器，我们只需要放在容器中即可.**</font>

### HttpMessageConverters 

　　1) HttpMessageConverter: SpringMVC用来转换Http请求和响应的；User---Json；

　　2) HttpMessageConverters:是从容器中获取所有的HttpMessageConverter；

　　3) <font color="#FF3E96">**自己给容器中添加HttpMessageConverter，只需要将自己的组件注册容器中（@Bean,@Component）**</font>
```java
@Configuration
public class MyConfiguration {

    @Bean
    public HttpMessageConverters customConverters() {
        HttpMessageConverter<?> additional = ...
        HttpMessageConverter<?> another = ...
        return new HttpMessageConverters(additional, another);//多参数
    }

}
```

### MessageCodesResolver

　　定义错误代码生成规则 (参考官方文档)

### ConfigurableWebBindingInitializer

　　1）数据绑定的功能

　　2）<font color="#FF3E96">**我们可以配置一个ConfigurableWebBindingInitializer来替换默认的；（添加到容器）**</font>
```
初始化WebDataBinder；
请求数据=====JavaBean；
```

### 总结

<font color="red">**org.springframework.boot.autoconfigure.web：web的所有自动场景；**</font>

**如果，你想使用Springboot的默认配置的Web功能，然后添加自己额外的Web组件，就：添加一个@Configuration的配置类，然后继承WebMvcConfigurerAdapter抽象类。（不能添加@EnableWebMvc注解）**

**如果，你不想使用Springboot的默认Web功能，那么，就：添加一个@Configuration的配置类，并且加上@EnableWebMvc注解，那么就你完全自定义SpringMVC组件。**

官网文档中，这么说明的：
```
If you want to keep Spring Boot MVC features, and you just want to add additional MVC configuration
(interceptors, formatters, view controllers etc.) you can add your own  @Configuration class of type
WebMvcConfigurerAdapter , but without  @EnableWebMvc . If you wish to provide custom instances of
RequestMappingHandlerMapping ,  RequestMappingHandlerAdapter or  ExceptionHandlerExceptionResolver
you can declare a  WebMvcRegistrationsAdapter instance providing such components.
If you want to take complete control of Spring MVC, you can add your own  @Configuration annotated with
@EnableWebMvc .
```
---

## 扩展SpringMVC

我们以前开发SpringMVC的时候，都会在xml中配置如下设置（自定义配置）：
```
   <mvc:view‐controller path="/hello" view‐name="success"/>

   <mvc:interceptors>
	        <mvc:interceptor>
	            <mvc:mapping path="/hello"/>
	            <bean></bean>
	        </mvc:interceptor>
    </mvc:interceptors>
```

那么现在呢？

<font color="#FF3E96">编写一个配置类（@Configuration），继承WebMvcConfigurerAdapter类型；不能标注@EnableWebMvc;</font>

既保留了所有的Springboot自动配置，也能用我们扩展的配置；

在我们的昨天的项目中，在com.liuzhuo.springboot包下，创建config包，并且创建Myconfig类：
```java
@Configuration
public class Myconfig extends WebMvcConfigurerAdapter {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        //super.addViewControllers(registry);

        //浏览器发送 /liuzhuo 请求来到 success
        registry.addViewController("/liuzhuo").setViewName("sucess");
    }
}
```

然后在resources下的templates中：创建sucess.html文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106141537.png"/>

启动Springboot应用：

在浏览器中输入：`http://localhost:8080/liuzhuo`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106141651.png"/>

说明：我们自己配置的映射url成功。

此时，我们不仅可以使用Springboot的默认Web的配置，还能使用自己额外添加的控制器映射。

---

为什么，此时我们既能使用Springboot的默认配置，又能使用自己的配置呢？

**原理：**

1）查看WebMvcAutoConfiguration是SpringMVC的自动配置类

2）在WebMvcAutoConfiguration中，能发现一个静态内部类：WebMvcAutoConfigurationAdapter
```java
// Defined as a nested config to ensure WebMvcConfigurerAdapter is not read when not
	// on the classpath
	@Configuration
	@Import(EnableWebMvcConfiguration.class)
	@EnableConfigurationProperties({ WebMvcProperties.class, ResourceProperties.class })
	public static class WebMvcAutoConfigurationAdapter extends WebMvcConfigurerAdapter {
```

该类上面有一个注解：@Import(EnableWebMvcConfiguration.class)。说明导入了EnableWebMvcConfiguration类。

3）打开EnableWebMvcConfiguration类：
```java
@Configuration
public static class EnableWebMvcConfiguration extends DelegatingWebMvcConfiguration 
```
继承了DelegatingWebMvcConfiguration类，打开DelegatingWebMvcConfiguration类：
```java
@Configuration
public class DelegatingWebMvcConfiguration extends WebMvcConfigurationSupport {

      private final WebMvcConfigurerComposite configurers = new WebMvcConfigurerComposite();

      //从容器中获取所有的WebMvcConfigurer    
      @Autowired(required = false)
      public void setConfigurers(List<WebMvcConfigurer> configurers) {
          if (!CollectionUtils.isEmpty(configurers)) {
              this.configurers.addWebMvcConfigurers(configurers);
             //一个参考实现；将所有的WebMvcConfigurer相关配置都来一起调用；      
             @Override    
             // public void addViewControllers(ViewControllerRegistry registry) {
              //    for (WebMvcConfigurer delegate : this.delegates) {
               //       delegate.addViewControllers(registry);
               //   }
              }
          }
} 
```
4) 容器中所有的WebMvcConfigurer都会一起起作用

5) 我们的配置类也会被调用

效果：SpringMVC的自动配置和我们的扩展配置都会起作用

## 全面接管SpringMVC

SpringBoot对SpringMVC的自动配置不需要了，所有都是我们自己配置；所有的SpringMVC的自动配置都失效了

**我们需要在配置类中添加@EnableWebMvc即可**

```java
//使用WebMvcConfigurerAdapter可以来扩展SpringMVC的功能
@EnableWebMvc
@Configuration
public class MyMvcConfig extends WebMvcConfigurerAdapter {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
       // super.addViewControllers(registry);
        //浏览器发送 /atguigu 请求来到 success
        registry.addViewController("/atguigu").setViewName("success");
    }
}
```

直接启动我们的应用：
在浏览器中输入：`http://localhost:8080/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106143304.png"/>

默认的静态主页失效了。去掉@EnableWebMvc，静态主页映射就会成功。

静态主页映射：META-INF/resources、resourcs、static、public下的 index.html 都会映射：/**

---

为啥配置了@EnableWebMvc注解，SpringBoot的默认配置会失效呢？

**原理：**

1）打开@EnableWebMvc注解：
```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(DelegatingWebMvcConfiguration.class)
public @interface EnableWebMvc {
}
```

导入了DelegatingWebMvcConfiguration类。

2）打开DelegatingWebMvcConfiguration类：
```java
@Configuration
public class DelegatingWebMvcConfiguration extends WebMvcConfigurationSupport {

	private final WebMvcConfigurerComposite configurers = new WebMvcConfigurerComposite();


	@Autowired(required = false)
	public void setConfigurers(List<WebMvcConfigurer> configurers) {
		if (!CollectionUtils.isEmpty(configurers)) {
			this.configurers.addWebMvcConfigurers(configurers);
		}
	}

   ···

｝
```

DelegatingWebMvcConfiguration类：配置了SpringMVC的基本设置。

3）打开WebMvcAutoConfiguration：
```java
@Configuration
@ConditionalOnWebApplication
@ConditionalOnClass({ Servlet.class, DispatcherServlet.class,
		WebMvcConfigurerAdapter.class })
//容器中没有这个组件的时候，这个自动配置类才生效
@ConditionalOnMissingBean(WebMvcConfigurationSupport.class)
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE + 10)
@AutoConfigureAfter({ DispatcherServletAutoConfiguration.class,
		ValidationAutoConfiguration.class })
public class WebMvcAutoConfiguration {
```

上面的一个条件注解：@ConditionalOnMissingBean(WebMvcConfigurationSupport.class)

当没有WebMvcConfigurationSupport存在时，WebMvcAutoConfiguration自动配置才会生效。

而DelegatingWebMvcConfiguration就是WebMvcConfigurationSupport。

所以@EnableWebMvc将WebMvcConfigurationSupport组件导入进来，从而使WebMvcAutoConfiguration自动配置失效。

---

**总结：**

推荐我们使用 SpringBoot的默认配置 + 自定义的配置，即：**@Configuration + 继承WebMvcConfigurerAdapter **的配置类的形式。

我们完全自定义的模式：适合于简单、不负责的Web应用。

## 如何修改SpringBoot的默认配置

模式：

1）、 SpringBoot在自动配置很多组件的时候，先看容器中有没有用户自己配置的（@Bean、@Component）  
　　　如果有就用用户配置的，如果没有，才自动配置；如果有些组件可以有多个（ViewResolver）, 则将用户  
　　　配置的和自己默认的组合起来；

2）、在SpringBoot中会有非常多的xxxConfigurer帮助我们进行扩展配置

3）、在SpringBoot中会有很多的xxxCustomizer帮助我们进行定制配置

## CRUD-restful实战

[下载资料](https://pan.baidu.com/s/1_H3h5Vsw47R30mjldS68bA)

下载完毕后。找到文档中的restful-crud-实验
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106150457.png"/>

### 默认访问首页

1）首先将目录下的静态页面，xxx.html导入到我们的项目中的template目录下：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106150713.png" style="width:50%"/>

2）asserts目录放到static目录下：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106150756.png" style="width:50%"/>

3) 将dao、entities放到com.liuzhuo.springboot包下：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106151100.png" style="width:50%"/>

然后点击DepartmentDao、EmployeeDao，重写导入我们的Department、Employee的包名。

---

4）启动应用：

在浏览器中输入：`http://localhost:8080/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106151352.png"/>

发现出现的页面是：static下的index.html页面，而不是template下的index.html页面。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106151609.png" style="width:50%"/>


因为静态主页会加载：META-INF/resources、resourcs、static、public下的 index.html

此时，我们不必要重新映射我们的主页，在我们的config下的Myconfig配置中：

```java
@Configuration
public class Myconfig extends WebMvcConfigurerAdapter {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        //super.addViewControllers(registry);
        registry.addViewController("/liuzhuo").setViewName("sucess");

        //添加主页的映射
        registry.addViewController("/").setViewName("login");
        registry.addViewController("/index.html").setViewName("login");
        registry.addViewController("/login.html").setViewName("login");
    }
}
```

然后，将templates下的index.html 改为 login.html

重新启动应用：

在浏览器中输入：
`http://localhost:8080/` 
`http://localhost:8080/login.html` 
`http://localhost:8080/index.html`

都是以下的页面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106152941.png"/>

5）因为我们使用 **thymeleaf**，所以需要在每个页面头部添加命名空间：

   `xmlns:th="http://www.thymeleaf.org" `
```
<html lang="en" xmlns:th="http://www.thymeleaf.org" >
```

6) 在我们的静态页面中使用了bootstrap，所以需要bootstrap的webjar：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106153622.png"/>

```
        <!--bootstrap的jar包-->
        <dependency>
            <groupId>org.webjars</groupId>
            <artifactId>bootstrap</artifactId>
            <version>4.0.0</version>
        </dependency>
```

在我们的login.html页面的中。找到引用bootstrap的地方：

th:href="@{/webjars/bootstrap/4.0.0/css/bootstrap.css}"

```
    <!-- Bootstrap core CSS -->
    <link href="asserts/css/bootstrap.min.css" th:href="@{/webjars/bootstrap/4.0.0/css/bootstrap.css}" rel="stylesheet">
```

查看有么有配置对？ctrl + 鼠标左键：能跳转到该文件处。

使用thymeleaf的th:href="@{}"的好处：当我们给项目添加根目录时，也能自动帮我们添加上跟目录。

在application.properties中：
```
server.context-path=/curd
```
启动应用：
浏览器中输入：`http://localhost:8080/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106154552.png"/>

输入：`http://localhost:8080/curd`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106154631.png"/>

右键审查元素：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106154730.png"/>

**能看到：link 中 href：自动帮我们添加上了curd的根目录**

7）修改我们的css配置路径：

在login.html中：
th:href="@{/asserts/css/signin.css}"

```
    <!-- Custom styles for this template -->
    <link href="asserts/css/signin.css" th:href="@{/asserts/css/signin.css}" rel="stylesheet">
```

页面中的其他引入资源，依次类推改写完毕即可。

---

### 国际化

以前，我们在SpringMVC中编写国际化时的步骤：

1）**编写国际化配置文件**

2）使用ResourceBundleMessageSource管理国际化资源文件

3） 在页面使用fmt:message取出国际化内容（jsp引擎）

现在，使用Springboot开发的国际化的步骤：

1） 编写国际化配置文件，抽取页面需要显示的国际化消息

在resources下创建i18n文件来放置我们的国际化的配置文件。（国际化文件只能是properties）

然后创建login.properties（默认的国际化配置）、login_en_US.properties。

idea会帮我们自动生成 Resource Bundle 'login' 文件夹：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106161921.png" style="width:50%"/>

然后，我们在 Resource Bundle 'login' 上面右键：new
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106162042.png"/>

点击加号：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106162131.png" style="width:50%"/>

填写: 语言_国家（en_US）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106162648.png" style="width:50%"/>

最后生成的效果：有三个国家化的配置文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106162810.png" style="width:50%"/>

填写我们需要国际化的部分：

观察login页面，发现，我们需要五次国家化的部分。

login.tip (登入的标题)
login.username （用户名）
login.password （密码）
login.remembear （记住密码）
login.bt （登入按钮）

然后，随便点击一个国家化文件。在下角处切换视图：**Resource Bund**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106163314.png" />

点击在该视图模式下的，左上角的加号：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106163455.png" />

填写key：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106163605.png" />

填写value：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106165518.png" />

依次类推：把
login.username （用户名）
login.password （密码）
login.remembear （记住密码）
login.bt （登入按钮）

添加上。

---

2） SpringBoot自动配置好了管理国际化资源文件的组件(**MessageSourceAutoConfiguration**)

```java
@ConfigurationProperties(prefix = "spring.messages")
public class MessageSourceAutoConfiguration {
   
    /**
	 * Comma‐separated list of basenames (essentially a fully‐qualified classpath    
	 * location), each following the ResourceBundle convention with relaxed support for    
	 * slash based locations. If it doesn't contain a package qualifier (such as    
	 * "org.mypackage"), it will be resolved from the classpath root.    
	 */    
    private String basename = "messages";      
    //我们的配置文件可以直接放在类路径下叫messages.properties；
   
    @Bean
	public MessageSource messageSource() {    
	ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();        
	   if (StringUtils.hasText(this.basename)) {        
             //设置国际化资源文件的基础名（去掉语言国家代码的）
		    messageSource.setBasenames(StringUtils.commaDelimitedListToStringArray(            
		    StringUtils.trimAllWhitespace(this.basename)));                    
		}        
		if (this.encoding != null) {        
		   messageSource.setDefaultEncoding(this.encoding.name());            
		}        
		messageSource.setFallbackToSystemLocale(this.fallbackToSystemLocale);        
		messageSource.setCacheSeconds(this.cacheSeconds);        
		messageSource.setAlwaysUseMessageFormat(this.alwaysUseMessageFormat);        
		return messageSource;        
	}
```

如果，我们的国际化文件的名字就是messages的话，而放在类路径下的话，我们直接就可以使用了。

但是，现在我们使用了i18n文件，所以，我们需要在application.properties配置文件中：配置国际化的信息：
```java
spring.messages.basename=i18n.login
```

i18n文件夹，login是文件的名字。


3）修改login.html中的需要国际化的部分

我们从thymeleaf的官方文档中，看到了如果使用国际化的话，使用 **#{}**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106171830.png" />

4）启动应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106172121.png" />

切换我们的地域语言：打开浏览器的设置（我使用的谷歌浏览器）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106172353.png" />

刷新浏览器：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106172433.png" />


以上为止，我们的国际化就搞定成功了。

效果：根据浏览器语言设置的信息切换了国际化。

---

**原理：**

国际化Locale（区域信息对象）；LocaleResolver（获取区域信息对象）；

打开WebMvcAutoConfiguration类：寻找与国际化有关的类：
```java
		@Bean
		@ConditionalOnMissingBean
		@ConditionalOnProperty(prefix = "spring.mvc", name = "locale")
		public LocaleResolver localeResolver() {
			if (this.mvcProperties
					.getLocaleResolver() == WebMvcProperties.LocaleResolver.FIXED) {
				return new FixedLocaleResolver(this.mvcProperties.getLocale());
			}
			AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
			localeResolver.setDefaultLocale(this.mvcProperties.getLocale());
			return localeResolver;
		}
```

通过此类：我们能发现，Springboot给我们配置的默认的国家化Locale的是一个AcceptHeaderLocaleResolver。

AcceptHeaderLocaleResolver：是通过每次请求时，在请求头在获取请求的语言来进行国际化识别的。

启动我们的应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106174300.png" />
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106174349.png" style="width:50%" />

我们发现了Accept-Language：**zh-CN.**

修改我们的浏览器的语言：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106174539.png" />

再次访问我们的登入页面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106174658.png" style="width:50%" />
我们发现了Accept-Language：en-US.

这就是Springboot的默认的国际化原理。

---

我们想要自己自定义国际化配置，该怎么办呢？

Springboot的默认国际化：localeResolver上面有一个注解：@ConditionalOnMissingBean

意思就是：当我们的容器中不存在localeResolver，才会使用默认的AcceptHeaderLocaleResolver。

所以，我们只需要向容器中，添加我们的localeResolver即可，默认的localeResolver就会失效。

---

1）在component包下：创建MyLocaleResolver类(实现LocaleResolver)：

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106175524.png" />

```java
public class MyLocaleResolver implements LocaleResolver {


    @Override
    public Locale resolveLocale(HttpServletRequest request) {

        //获取请求的参数信息
        String language = request.getParameter("language");
        //获取默认的地域信息。
        Locale locale = Locale.getDefault();

        if (!StringUtils.isEmpty(language)) {
            String[] split = language.split("_");
            //第一个参数：语言信息
            //第二个参数：国家信息
            locale = new Locale(split[0], split[1]);
        }
        return locale;
    }

    @Override
    public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {

    }
}
```

2）将我们的LocaleResolver添加到容器中：

在Myconfig类中：
```java
    @Bean
    public LocaleResolver localeResolver() {
        return new MyLocaleResolver();
    }
```

3）修改login.html页面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106180204.png" />

4）启动应用：

点击底下的：中文
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106180248.png" />

点击底下的：English
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106180353.png" />

我们自定义的国际化解析器成功！

---

**发现：在此时，不管我们将浏览器中的语言设置什么，我们的默认登入都是中文的**

因为，此时：我们使用的是自己的LocaleResovler：

当获取的language：String language = request.getParameter("language");
为空时，我们的Locale locale = Locale.getDefault();是获取的是本地的，我们这里就是中文。
不再是使用请求头中的那种方式了。

### 登陆

1）修改我们的登入页面：login.html

```
<form class="form-signin" action="dashboard.html" th:action="@{/user/login}" method="post">
```

登入的action改为：/user/login。请求方式：post。

2）在controller包下，创建LoginController：
```java
@Controller
public class LoginController {

    //@RequestMapping(value = "/user/login",method = RequestMethod.POST)
    @PostMapping(value = "/user/login")
    public String login(@RequestParam("username") String username,
                        @RequestParam("password") String password,
                        Map<String, Object> map) {

        if (!StringUtils.isEmpty(username) &&
                !StringUtils.isEmpty(password) &&
                "admin".equals(username) &&
                "123456".equals(password)) {
            //登入成功！
            return "dashboard";
        } else {
            //登入失败！
            map.put("msg", "登入用户名或密码错误！");
            return "login";
        }
    }

}
```

3) 启动项目：

输入用户名和密码
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106213523.png" />

报错了：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106213554.png" />

原来是我们的login.html页面，没有给username和password添加name属性！
现在添加上：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106213732.png" />

重启项目，并添加正确的用户名和密码（admin，123456）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106213924.png" />

**注意：**

1）此时有可能还是刚刚的错误，因为thymeleaf默认是开启缓存功能的，所以我们开发的时候，要记住关闭缓存的功能
在配置文件中：

```java
spring.thymeleaf.cache=false
```

2）我们在项目已经启动的时候，修改页面后，直接刷新页面，还是不会变的，要在修改后的页面处：**ctrl+F9**（重新编译页面）

使用（1）和（2）之后，就可以在项目已经启动的时候，直接修改页面也能得到最新的体验了。

---

现在，我们输入错误的用户名和密码：不会出现错误的信息。

怎么添加错误的信息在页面上呢？

给login.html页面添加一个<p>标签
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106214738.png" />

当msg不为空时，才会出现错误的`<p>标签。`

重启项目：输入错误的用户名和密码
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106214945.png" />

现在错误提示也完成了，再次输入正确的用户名和密码，**现在一不小心按了F5，刷新了页面**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106215200.png" />

发现出现了是否重新提交表单的情况，因为我们的后端是**转发**到登入成功页面的，地址栏还是之前的登入页面的地址，所以刷新会出现这种情况。

现在修改后端的代码，将其改为**重定向。**

在LoginController中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106215826.png" />
在Myconfig中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181106215831.png" />

重启我们的应用：输入正确的用户名和密码
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107095619.png" />

什么？404？main.html没有找到？why？

当我们看到地址栏时，发现我们重定向时：是在/user下重定向的，所以找不到main.html。

**所以，在控制器Controller中：`return "redirect:main.html";` main的前面不加`/`的话
会在@PostMapping(value = "/user/login")中去掉最后一个路径下重定向，即在/user下重定向。
如果是@PostMapping(value = "/user/liuzhuo/login")的话，就在/user/liuzhuo下重定向。**

怎样在我们的根路径下重定向呢？即在我们的`/crud`根路径下重定向。只需在main的前面加`/`即可：
`return "redirect:/main.html";`

修改完毕后，重启我们的应用：输入正确的用户名和密码：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107100653.png" />

发现样式也正确了。因为是重定向而来的。**此时刷新页面，也不会重发请求了。**

### 拦截器进行登陆检查

此时，我们在另一个浏览器中：直接输入`http://localhost:8080/curd/main.html`.
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107101109.png" />

发现，没有登入就直接进来了，这是因为**没有加拦截器**的缘故。

1）在component包下：创建 **LoginHandleInterceptor **：

```java
public class LoginHandleInterceptor implements HandlerInterceptor {

    //在方法执行之前，调用。
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        //从session中获取是否有loginUser属性的值
        Object loginUser = request.getSession().getAttribute("loginUser");
        if (StringUtils.isEmpty(loginUser)) {
            //没有成功登入过。
            //转发登入页面
            request.getRequestDispatcher("/login.html").forward(request, response);
            return false;
        } else {
            //成功登入过
            return true;
        }

    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {

    }
}
```

2）将我们自己定义的拦截器添加到拦截器链中：

　　在Myconfig类中：
```java
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //super.addInterceptors(registry);
        //添加拦截器我们自定义的拦截器
        registry.addInterceptor(new LoginHandleInterceptor())
                .addPathPatterns("/**") //拦截路径：/**:拦截所有的请求
                .excludePathPatterns("/","/index.html","/login.html","/user/login");//排除登入和登入请求的拦截路径
    }
```

<b>`这里虽然是拦截了所有的请求（/**），但是静态资源是不会被拦截的，Springboot已经帮我们排除掉了，所以放心使用.`</b>

3) 在我们的登入控制器LoginController中添加session的操作：
```java
        if (!StringUtils.isEmpty(username) &&
                !StringUtils.isEmpty(password) &&
                "admin".equals(username) &&
                "123456".equals(password)) {
            //登入成功！
            //将用户名放入到session当中
            session.setAttribute("loginUser", username);
            //重定向到我们指定的登入成功的页面
            return "redirect:/main.html";
```

4) 重启我们的应用。

在谷歌浏览器中，成功登入成功后，直接输入：`http://localhost:8080/curd/main.html`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107103005.png" />

发现，可以直接直接访问，因为已经成功登入过了，在session中已经保存了我们的用户信息。

在另外的浏览器中，直接输入：`http://localhost:8080/curd/main.html`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107103240.png" />

会转发到我们的登入页面，因为是转发，所以地址栏不变。

---

### CRUD-员工列表

实验要求：

1) RestfulCRUD：CRUD满足Rest风格

URI： /资源名称/资源标识 　HTTP请求方式区分对资源CRUD操作
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107114154.png" />

2) 实验的请求架构
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107114230.png" />

3) 员工列表：

**thymeleaf公共页面元素抽取**

```
1、抽取公共片段
<div th:fragment="copy">
   &copy; 2011 The Good Thymes Virtual Grocery
</div>

2、引入公共片段
<div th:insert="~{footer :: copy}"></div>
~{templatename::selector}：模板名::选择器
~{templatename::fragmentname}:模板名::片段名

模板名就是：aaa.html中的aaa
片段名就是：th:fragment="bbb"中的bbb
选择器就是：id选择器，class选择器等

3、默认效果：
insert的公共片段在div标签中
如果使用th:insert等属性进行引入，可以不用写~{}：
行内写法必须加上：[[~{}]] ：不转义特殊字符（/n） 、  [(~{})] ：转义特殊字符
```

三种引入公共片段的th属性：

th:insert：将公共片段整个插入到声明引入的元素中

th:replace：将声明引入的元素替换为公共片段

th:include：将被引入的片段的内容包含进这个标签中

```
<footer th:fragment="copy">
	&copy; 2011 The Good Thymes Virtual Grocery
</footer>


引入方式:
<div th:insert="footer :: copy"></div>
<div th:replace="footer :: copy"></div>
<div th:include="footer :: copy"></div>

效果:
<div>
    <footer>
    	&copy; 2011 The Good Thymes Virtual Grocery
    </footer>
</div>


<footer>
	&copy; 2011 The Good Thymes Virtual Grocery
</footer>


<div>
	&copy; 2011 The Good Thymes Virtual Grocery
</div>

```

1) 将登入成功后的dashboard.html页面中的顶部和左边的侧单栏抽取出来：

在templates下：创建page文件夹，并创建两个html页面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107154114.png" style="width:50%"/>

top.html页面：
```
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

    <nav th:fragment="top" class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
        <a class="navbar-brand col-sm-3 col-md-2 mr-0" href="http://getbootstrap.com/docs/4.0/examples/dashboard/#">[[${session.loginUser}]]</a>
        <input class="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search">
        <ul class="navbar-nav px-3">
            <li class="nav-item text-nowrap">
                <a class="nav-link" href="http://getbootstrap.com/docs/4.0/examples/dashboard/#">退出</a>
            </li>
        </ul>
    </nav>

</body>
</html>
```

主要是其中的`<nav></nav>`片段，这个片段是dashboard.html中的顶部的片段复制过来的。

其中主要是在`<nav>`中加入了**th:fragment="top"**属性

slide.html页面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107154633.png" />

其中的`<nav>`片段：是dashboard.html中的左边的侧单栏的部分复制过来的。

其中，主要加入了：**id：slide** 的属性。

2）修改dashboard.html页面的顶部与左边部分：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107155129.png" />

3）启动应用，运行发现顶部与左部运行完好。

---

现在，我们开始完成员工信息的部分；即：左单栏的Customer部分。

1）将templates下的list.html页面放到empl目录下，这样分文件夹管理更加合理
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107155615.png" style="width:50%"/>


2）修改dashboard.html中的Customer部分的action属性：
因为左部已经抽取到slide.html页面，所以到slide.html页面中修改：

修改之前：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107155857.png"/>

修改之后：将Customer改为员工信息，修改a标签的href
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107160209.png"/>

3）controller包下，创建EmployeeController：

```java
@Controller
public class EmployeeController {

    @Autowired
    private EmployeeDao employeeDao;

    @GetMapping("/emp")
    public String list(Model model) {
        Collection<Employee> employees = employeeDao.getAll();
        model.addAttribute("employees", employees);
        return "empl/list";
    }
}
```

4) 启动应用
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107160734.png"/>

点击：员工信息

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107160813.png"/>

此时员工信息里面还是Customer，因为没有抽取出公共部分。

修改list.html的顶部与左部，与dashboard.html类似。自己完成。

完成后的效果：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107161524.png"/>

但是，我们发现此时**左部的高亮部分还是Dashboard**

5）怎么修改高亮为员工信息呢？

thymeleaf模板引擎中，查看官方文档，发现可以有参数化的片段布局：8.2 Parameterizable fragment signatures
[官方参考](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#parameterizable-fragment-signatures)

引入片段的时候传入参数：

`<div th:replace="commons/bar::#sidebar(activeUri='emps')"></div>`

即：就是在我们引入的同时，在后面加一个括号，里面填写：key=value。

修改dashboard.html页面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107164137.png"/>

修改list.html页面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107164221.png"/>

修改slide.html页面：

在Dashboard处：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107164336.png"/>

在员工信息处：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107164425.png"/>



重启我们的应用：

点击Dashboard，Dashboard高亮。

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107164640.png"/>

点击员工信息，员工信息高亮。

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107164704.png"/>

---

6）将员工信息换成我们的后端传递过来的数据：

在list页面中：
```java
        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
            <h2><button class="btn btn-sm btn-success">员工添加</button></h2>
            <div class="table-responsive">
                <table class="table table-striped table-sm">
                    <thead>
                    <tr>
                        <th>id</th>
                        <th>lastName</th>
                        <th>email</th>
                        <th>gender</th>
                        <th>department</th>
                        <th>birth</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr th:each="empl:${employees}">
                        <td th:text="${empl.id}">1001</td>
                        <td>[[${empl.lastName}]]</td>
                        <td th:text="${empl.email}">5589584@qq.com</td>
                        <td th:text="${empl.gender}=='0'?'女':'男'">男</td>
                        <td th:text="${empl.department.departmentName}">商业提升部</td>
                        <td th:text="${#dates.format(empl.birth, 'yyyy-MM-dd HH:mm:ss')}">2018/11/1</td>
                        <td>
                            <button class="btn btn-sm btn-primary">编辑</button>
                            <button class="btn btn-sm btn-danger">删除</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </main>
```

ctrl+F9:
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107170503.png"/>

### 员工列表的添加

首先将员工信息的url换成 **/empls **:代表获取所有的员工信息，而 **/empl **：代表添加员工的信息。

1.将员工添加的按钮换成a标签：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107172030.png"/>

2.在EmployeeController中：

```java
    @Autowired
    private DepartmentDao departmentDao;


    @GetMapping("/empl")
    public String add(Model model) {

        //获取所有的部门信息：
        Collection<Department> departments = departmentDao.getDepartments();
        model.addAttribute("departments", departments);
        return "empl/employee";
    }
```

3.在templates下的empl中添加employee.html页面：

首先，直接复制list.html为employee.html。

然后，修改其中的main标签部分：
```
        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
            <form>
                <div class="form‐group">
                    <label>LastName</label>
                    <input type="text" class="form-control" placeholder="zhangsan">
                </div>
                <br>
                <div class="form‐group">
                     <label>Email</label>
                     <input type="email" class="form-control" placeholder="zhangsan@atguigu.com">
                </div>
                <br>
                <div class="form‐group">
                    <label>Gender</label><br/>
                    <div class="form‐check form‐check‐inline">
                         <input class="form‐check‐input" type="radio" name="gender"   value="1">
                         <label class="form‐check‐label">男</label>
                    </div>
                    <div class="form‐check form‐check‐inline">
                         <input class="form‐check‐input" type="radio" name="gender"   value="0">
                         <label class="form‐check‐label">女</label>
                    </div>
                </div>
                <br>
                <div class="form‐group">
                     <label>department</label>
                     <select class="form-control">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                     </select>
                </div>
                <br>
                <div class="form‐group">
                     <label>Birth</label>
                     <input type="text" class="form-control" placeholder="zhangsan">
                </div>
                <br>
                <button type="submit" class="btn btn-sm btn-primary">添加</button>
            </form>

        </main>

```

4.重启应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107174348.png"/>

5.此时的department部分还是死数据：
```java
<div class="form‐group">
     <label>department</label>
     <select class="form-control">
        <option th:value="${dept.id}" th:text="${dept.departmentName}" th:each="dept:${departments}">1</option>
     </select>
</div>
```

刷新页面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107174754.png"/>

6.给form表单添加action和method属性：
```
 <form th:action="@{/empl}" method="post">
```

7.书写添加员工的控制器
```java
    //添加员工
    @PostMapping("/empl")
    public String addEmployee(Employee employee) {

        System.out.println(employee);
        //添加员工
        employeeDao.save(employee);

        return "redirect:/empls";
    }
```

8.重启应用，点击添加：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107183750.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107183847.png"/>

添加失败？因为我们的表单里面木有给属性添加name。
现在全部加上。

```
   <input type="text" th:name="lastName" class="form-control" placeholder="zhangsan">

   <input type="email" th:name="email" class="form-control" placeholder="zhangsan@atguigu.com">

   <select class="form-control" th:name="department.id">

    <input type="text" th:name="birth" class="form-control" placeholder="zhangsan">
```

然后再次尝试添加：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107184848.png"/>

添加成功！！！

**注意：这里填写生日的格式必须是 xxxx/xx/xx 的形式。其他形式就会出错，因为Springboot默认格式化的日期格式就是xxxx/xx/xx 的形式**

如果，我们想改日期的格式呢？

打开WebMvcAutoConfiguration类：
```
		@Bean
		@ConditionalOnProperty(prefix = "spring.mvc", name = "date-format")
		public Formatter<Date> dateFormatter() {
			return new DateFormatter(this.mvcProperties.getDateFormat());
		}
```

默认帮我们配置好的时间格式转化器。

点击：getDateFormat()：
```
	public String getDateFormat() {
		return this.dateFormat;
	}
```
再点击：this.dateFormat
```
	/**
	 * Date format to use (e.g. dd/MM/yyyy).
	 */
	private String dateFormat;
```

说明默认的确实是：dd/MM/yyyy的形式。

想要修改默认的格式：只需要在application.properties文件中修改spring.mvc.date-format=xxxx即可：
```
#修改日期的格式
spring.mvc.date-format=yyyy-MM-dd
```

---

### 员工列表的编辑

修改添加二合一表单

1）首先修改编辑按钮：
```
  <a th:href="@{/empl/}+${empl.id}" class="btn btn-sm btn-primary">编辑</a>
```
2) EmployeeController中：
```java
    //去编辑员工的页面
    @GetMapping("/empl/{id}")
    public String toEditPage(@PathVariable("id") Integer id, Model model) {

        //获取员工的信息：
        Employee employee = employeeDao.get(id);
        model.addAttribute("employee",employee);

        //获取所有的部门信息：
        Collection<Department> departments = departmentDao.getDepartments();
        model.addAttribute("departments", departments);

        //重定向到编辑员工的页面（add页面一样，共用）
        return "empl/employee";
    }
```

3) 在employee.html页面中回显员工的信息。
```
            <form th:action="@{/empl}" method="post">
                <div class="form‐group">
                    <label>LastName</label>
                    <input type="text" th:value="${employee.lastName}" th:name="lastName" class="form-control" placeholder="zhangsan">
                </div>
                <br>
                <div class="form‐group">
                     <label>Email</label>
                     <input type="email" th:value="${employee.email}" th:name="email" class="form-control" placeholder="zhangsan@atguigu.com">
                </div>
                <br>
                <div class="form‐group">
                    <label>Gender</label><br/>
                    <div class="form‐check form‐check‐inline">
                         <input class="form‐check‐input" type="radio" name="gender" value="1" th:checked="${employee.gender}==1">
                         <label class="form‐check‐label">男</label>
                    </div>
                    <div class="form‐check form‐check‐inline">
                         <input class="form‐check‐input" type="radio" name="gender" value="0" th:checked="${employee.gender}==0">
                         <label class="form‐check‐label">女</label>
                    </div>
                </div>
                <br>
                <div class="form‐group">
                     <label>department</label>
                     <select class="form-control" th:name="department.id">
                    <option th:selected="${employee.department.id}==${dept.id}" th:value="${dept.id}" th:text="${dept.departmentName}" th:each="dept:${departments}">1
                    </option>
                     </select>
                </div>
                <br>
                <div class="form‐group">
                     <label>Birth</label>
                     <input type="text" th:value="${#dates.format(employee.birth, 'yyyy-MM-dd HH:mm:ss')}" th:name="birth" class="form-control" placeholder="zhangsan">
                </div>
                <br>
                <button type="submit" class="btn btn-sm btn-primary">添加</button>
            </form>
```

4) 重启应用，点击编辑
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107193709.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107193721.png"/>

回显成功。

此时，再次点击添加时：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107193842.png"/>

控制台：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107193935.png"/>

这是因为，我们点击添加的时候，model对象中根本没有employee对象，所以employee.html中的：
**th:value="${employee.lastName}"等都会出现空指针异常。**

5）再次修改employee.html页面：添加判断语句

${employee!=null}?

例如：
```
th:value="${employee!=null}?${employee.lastName}"
```

此时：再次点击员工添加，就不会出现问题了。

6）button的按钮修改
```
  <button type="submit" th:text="${employee!=null}?'修改':'添加'" class="btn btn-sm btn-primary">添加</button>
```

7）form表单的method的修改：

当是添加操作时，就是method=post提交。
当是修改操作时，就是method=put提交。

以前是SpringMVC的时候，想要使用put提交。
1. SpringMVC中配置HiddenHttpMethodFilter;
2. 页面创建一个post表单
3. 创建一个input项，name="_method";值就是我们指定的请求方式

Springboot已经默认帮我们配置好了HiddenHttpMethodFilter。在WebMvcAutoConfiguration中：
```java
	@Bean
	@ConditionalOnMissingBean(HiddenHttpMethodFilter.class)
	public OrderedHiddenHttpMethodFilter hiddenHttpMethodFilter() {
		return new OrderedHiddenHttpMethodFilter();
	}
```

所以，现在我们只需要添加一个input项，name="_method"的标签即可：
```
      <input type="hidden" name="_method"  value="put" th:if="${employee!=null}"/>
      <input type="hidden" name="id" th:value="${employee.id}" th:if="${employee!=null}"/>
```
8) EmployeeController中添加编辑的逻辑：
```java
    //修改员工
    @PutMapping("/empl")
    public String EditEmployee(Employee employee) {
        System.out.println(employee);
        //修改员工
        employeeDao.save(employee);
        return "redirect:/empls";
    }
```

9) 随便点击一个员工进行修改：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107195757.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107195859.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107195923.png"/>

修改成功！！！

### 员工列表的删除

1）修改删除的按钮以delete的方式提交

不能简单的将button按钮标签改为a标签，因为a标签默认是get方式提交。

我们使用js的方式来提交表单：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day05/QQ%E6%88%AA%E5%9B%BE20181107202935.png"/>

2）添加js代码：
```java
<script type="text/javascript">
    $(".deleteBtn").click(function () {
        var del_url = $(this).attr("del_url");
        $("#deleteEmpForm").attr("action", del_url).submit();
        //改变form默认的提交方式
        return false;
    })
</script>
```

3) EmployeeController中：
```java
    //删除员工信息
    @DeleteMapping("/empl/{id}")
    public String deleteEmlp(@PathVariable("id") Integer id) {
        //删除指定员工id的员工
        employeeDao.delete(id);
        return "redirect:/empls";
    }
```

4) 重启应用，试试删除按钮

