---
title: Servlet3.0与SpringMVC整合
categories:
  - servlet3.0
  - SpringMVC
tags:
  - servlet3.0
  - SpringMVC
date: 2018-10-29 15:14:12
summary: Servlet3.0与SpringMVC整合，永久告别web.xml的配置文件
---

Servlet3.0与SpringMVC的整合，永久告别web.xml的配置文件啦~~

### 创建maven-web工程

如果大家对idea创建maven-web工程不熟悉的话，去看我的另一篇博客[idea创建maven-web工程](/2018/10/29/idea-chuang-jian-maven-web-gong-cheng/)

<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181029201934.png" style="width:50%"/>

### 打开pom.xml文件

添加两个依赖，SpringMVC和Servlet的依赖
```
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>4.1.9.RELEASE</version>
</dependency>

<!-- https://mvnrepository.com/artifact/javax.servlet/javax.servlet-api -->
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>3.1.0</version>  <!-- 3.0以上的版本都可以-->
    <scope>provided</scope>   <!-- 因为Tomcat容器中有servlet的jar，所以打成war包的时候，不需要这个-->
</dependency>
```
### 现在开始整合SpringMVC开发。打开Spring的官网。

找到相关的文档处[Spring-web](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#spring-web)

我们能发现在servlet3.0以后，SpringMVC的官网推不再使用web.xml开发，直接使用java的配置类来替代web.xml文件。

我们只需要编写一个类实现**WebApplicationInitializer**接口，就相当于web.xml文件了。

```java
public class MyWebApplicationInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletCxt) {

        // Load Spring web application configuration
        AnnotationConfigWebApplicationContext ac = new AnnotationConfigWebApplicationContext();
        ac.register(AppConfig.class);
        ac.refresh();

        // Create and register the DispatcherServlet
        DispatcherServlet servlet = new DispatcherServlet(ac);
        ServletRegistration.Dynamic registration = servletCxt.addServlet("app", servlet);
        registration.setLoadOnStartup(1);
        registration.addMapping("/app/*");
    }
}
```

容器启动后，会执行这个实现WebApplicationInitializer接口的实现类。然后执行onStartup()方法。

在该方法中，创建了注解式配置应用上下文，传入spring的配置文件。然后向该容器中注入DispatcherServlet，来完成SpringMVC的前端控制器。

<font color="red">**重点**</font>:

那为啥实现了WebApplicationInitializer接口的实现类，在容器启动时调用呢？

首先打开这个接口：
```java
public interface WebApplicationInitializer {

	/**
	 * Configure the given {@link ServletContext} with any servlets, filters, listeners
	 * context-params and attributes necessary for initializing this web application. See
	 * examples {@linkplain WebApplicationInitializer above}.
	 * @param servletContext the {@code ServletContext} to initialize
	 * @throws ServletException if any call against the given {@code ServletContext}
	 * throws a {@code ServletException}
	 */
	void onStartup(ServletContext servletContext) throws ServletException;

}
```

只有一个方法，看不出什么头绪。但是，在这个包下有另外一个类，SpringServletContainerInitializer。它的实现如下：
```java
@HandlesTypes(WebApplicationInitializer.class)
public class SpringServletContainerInitializer implements ServletContainerInitializer {

	@Override
	public void onStartup(Set<Class<?>> webAppInitializerClasses, ServletContext servletContext)
			throws ServletException {

		List<WebApplicationInitializer> initializers = new LinkedList<WebApplicationInitializer>();

		if (webAppInitializerClasses != null) {
			for (Class<?> waiClass : webAppInitializerClasses) {
				// Be defensive: Some servlet containers provide us with invalid classes,
				// no matter what @HandlesTypes says...
				if (!waiClass.isInterface() && !Modifier.isAbstract(waiClass.getModifiers()) &&
						WebApplicationInitializer.class.isAssignableFrom(waiClass)) {
					try {
						initializers.add((WebApplicationInitializer) waiClass.newInstance());
					}
					catch (Throwable ex) {
						throw new ServletException("Failed to instantiate WebApplicationInitializer class", ex);
					}
				}
			}
		}

		if (initializers.isEmpty()) {
			servletContext.log("No Spring WebApplicationInitializer types detected on classpath");
			return;
		}

		AnnotationAwareOrderComparator.sort(initializers);
		servletContext.log("Spring WebApplicationInitializers detected on classpath: " + initializers);

		for (WebApplicationInitializer initializer : initializers) {
			initializer.onStartup(servletContext);
		}
	}

}
```

这个类就比较有意思了，先不管其他的，读一下这段代码，可以得到这样的意思。

先判断webAppInitializerClasses这个Set是否为空。如果不为空的话，找到这个set中不是接口，不是抽象类，并且是WebApplicationInitializer接口实现类的类，将它们保存到list中。当这个list为空的时候，直接return。不为空的话就按照一定的顺序排序，并将它们按照一定的顺序实例化。调用**其onStartup方法执行**。到这里，就可以解释WebApplicationInitializer实现类的工作过程了。

**但是，在web项目运行的时候，SpringServletContainerInitializer这个类又是怎样被调用的呢？**

再看被它实现的ServletContainerInitializer这个接口
它只有一个接口方法onStartup()，通过它就可以解释SpringServletContainerInitializer是如何被调用的。它的内容如下：
```java
package javax.servlet;
 
import java.util.Set;
 
public interface ServletContainerInitializer {
    void onStartup(Set<Class<?>> var1, ServletContext var2) throws ServletException;

}
```

首先，这个接口是javax.servlet下的，官方的解释是这样的：

为了支持可以不使用web.xml。提供了ServletContainerInitializer，它可以通过SPI机制。

当启动web容器的时候，会自动到项目中添加的jar包下找到META-INF/services/javax.servlet.ServletContainerInitializer文件。

它的内容为ServletContainerInitializer实现类的全路径，将它们实例化。

既然这样的话，那么SpringServletContainerInitializer作为ServletContainerInitializer的实现类，它的jar包下也应该有相应的文件。
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181029211845.png"/>

哈，现在就可以解释清楚了。首先，SpringServletContainerInitializer作为ServletContainerInitializer的实现类，通过**SPI机制**，在web容器加载的时候会自动的被调用。（这个类上还有一个注解@HandlesTypes，它的作用是将感兴趣的一些类注入到ServletContainerInitializer）， 而这个类的方法又会扫描找到WebApplicationInitializer的实现类，调用它的onStartup方法，从而起到启动web.xml相同的作用。

---
等价于web.xml文件：
```
<web-app>

    <!-- 注册这个监听器来注入Spring的父容器-->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/app-context.xml</param-value>
    </context-param>

    <!-- 注册这个Servlet来注入SpringMVC的子容器-->
    <servlet>
        <servlet-name>app</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value></param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>app</servlet-name>
        <url-pattern>/app/*</url-pattern>
    </servlet-mapping>

</web-app>
```

总结：

1）servlet3.0以后的Web容器在启动的时候，会扫描每个jar包下的META-INF/services/javax.servlet.ServletContainerInitializer文件

2）加载这个文件指定的类(实现了ServletContainerInitializer接口类)，并调用这个接口的onStartup()方法。
void onStartup(Set<Class<?>> var1, ServletContext var2) throws ServletException;

3）现在，我们在pom.xml文件中加入了spring-mvc的依赖，其中有一个jar：
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181029214152.png" style="width:50%"/>

在该META-INF/services/javax.servlet.ServletContainerInitializer文件下，有一个：org.springframework.web.SpringServletContainerInitializer的全路径。

打开SpringServletContainerInitializer类。
```
@HandlesTypes(WebApplicationInitializer.class)
public class SpringServletContainerInitializer implements ServletContainerInitializer {
  ···
}
```

该类上面有一个@HandlesTypes注解，该注解会在web容器启动的时候，传入我们感兴趣的类型，这里会传入WebApplicationInitializer的类型。

然后在该类的onStartup()方法中：
```
		if (webAppInitializerClasses != null) {
			for (Class<?> waiClass : webAppInitializerClasses) {
				// Be defensive: Some servlet containers provide us with invalid classes,
				// no matter what @HandlesTypes says...
				if (!waiClass.isInterface() && !Modifier.isAbstract(waiClass.getModifiers()) &&
						WebApplicationInitializer.class.isAssignableFrom(waiClass)) {
					try {
						initializers.add((WebApplicationInitializer) waiClass.newInstance());
					}
					catch (Throwable ex) {
						throw new ServletException("Failed to instantiate WebApplicationInitializer class", ex);
					}
				}
			}
		}
```

这里的webAppInitializerClasses就是传入的我们感兴趣的类型，判断该传入的类型，在不是接口，不是抽象类，而且是WebApplicationInitializer类型的时候，实例化该传入的类型。
```
for (WebApplicationInitializer initializer : initializers) {
	initializer.onStartup(servletContext);
}
```

最后调用WebApplicationInitializer的
onStartup(ServletContext servletContext) throws ServletException;

---

我们可以直接实现WebApplicationInitializer接口，像Spring官网一样整合SpringMVC。

但是，这里，我们来看看**WebApplicationInitializer的继承体系**：
会发现有三个抽象类：
``AbstractContextLoaderInitializer``
``AbstractDispatcherServletInitializer``
``AbstractAnnotationConfigDispatcherServletInitializer``

---

AbstractContextLoaderInitializer：

```
public abstract class AbstractContextLoaderInitializer implements WebApplicationInitializer {

	/** Logger available to subclasses */
	protected final Log logger = LogFactory.getLog(getClass());


	@Override
	public void onStartup(ServletContext servletContext) throws ServletException {
		registerContextLoaderListener(servletContext);
	}

	protected void registerContextLoaderListener(ServletContext servletContext) {
		WebApplicationContext rootAppContext = createRootApplicationContext();
		if (rootAppContext != null) {
			servletContext.addListener(new ContextLoaderListener(rootAppContext));
		}
		else {
			logger.debug("No ContextLoaderListener registered, as " +
					"createRootApplicationContext() did not return an application context");
		}
	}

	protected abstract WebApplicationContext createRootApplicationContext();

}
```

这里，我们可以看到：首先执行onStartup(),然后执行registerContextLoaderListener().

在然后执行registerContextLoaderListener中，调用createRootApplicationContext()方法来获取Spring的根容器。该方法需要我们来实现。

然后将我们创建的根容器注入到ServletContext中。

---

AbstractDispatcherServletInitializer：
```
public abstract class AbstractDispatcherServletInitializer extends AbstractContextLoaderInitializer {
    public static final String DEFAULT_SERVLET_NAME = "dispatcher";

    public AbstractDispatcherServletInitializer() {
    }

    public void onStartup(ServletContext servletContext) throws ServletException {
        super.onStartup(servletContext);
        this.registerDispatcherServlet(servletContext);
    }

    protected void registerDispatcherServlet(ServletContext servletContext) {
        String servletName = this.getServletName();
        Assert.hasLength(servletName, "getServletName() must not return empty or null");
        WebApplicationContext servletAppContext = this.createServletApplicationContext();
        Assert.notNull(servletAppContext, "createServletApplicationContext() did not return an application context for servlet [" + servletName + "]");
        DispatcherServlet dispatcherServlet = new DispatcherServlet(servletAppContext);
        Dynamic registration = servletContext.addServlet(servletName, dispatcherServlet);
        Assert.notNull(registration, "Failed to register servlet with name '" + servletName + "'." + "Check if there is another servlet registered under the same name.");
        registration.setLoadOnStartup(1);
        registration.addMapping(this.getServletMappings());
        registration.setAsyncSupported(this.isAsyncSupported());
        Filter[] filters = this.getServletFilters();
        if (!ObjectUtils.isEmpty(filters)) {
            Filter[] var7 = filters;
            int var8 = filters.length;

            for(int var9 = 0; var9 < var8; ++var9) {
                Filter filter = var7[var9];
                this.registerServletFilter(servletContext, filter);
            }
        }

        this.customizeRegistration(registration);
    }
```

第一，创建Spring的WebApplicationContext容器。

`protected abstract WebApplicationContext createServletApplicationContext();`

需要我们自己实现，这个方法，返回一个WebApplicationContext容器。

第二，帮我们创建了一个dispatcherServlet，然后注入到ServletContext中。

第三，registration.addMapping(this.getServletMappings());添加映射，Filter[] filters = this.getServletFilters();注入过滤器等。

`protected abstract String[] getServletMappings();`

映射器也需要我们重写。

---

AbstractAnnotationConfigDispatcherServletInitializer:

注解版注册DispatcherServlet的版本

```
public abstract class AbstractAnnotationConfigDispatcherServletInitializer extends AbstractDispatcherServletInitializer {
    public AbstractAnnotationConfigDispatcherServletInitializer() {
    }

    protected WebApplicationContext createRootApplicationContext() {
        Class<?>[] configClasses = this.getRootConfigClasses();
        if (!ObjectUtils.isEmpty(configClasses)) {
            AnnotationConfigWebApplicationContext rootAppContext = new AnnotationConfigWebApplicationContext();
            rootAppContext.register(configClasses);
            return rootAppContext;
        } else {
            return null;
        }
    }

    protected WebApplicationContext createServletApplicationContext() {
        AnnotationConfigWebApplicationContext servletAppContext = new AnnotationConfigWebApplicationContext();
        Class<?>[] configClasses = this.getServletConfigClasses();
        if (!ObjectUtils.isEmpty(configClasses)) {
            servletAppContext.register(configClasses);
        }

        return servletAppContext;
    }

    protected abstract Class<?>[] getRootConfigClasses();

    protected abstract Class<?>[] getServletConfigClasses();
}
```

里面就重写了两个方法：

createRootApplicationContext():创建配置类的根容器
重写getRootConfigClasses():传入一个配置类。

createServletApplicationContext():创建Web的ioc容器
重写getServletConfigClasses():获取Web版的配置类。

---

总结：

以注解方法来启动SpringMVC的话：继承AbstractAnnotationConfigDispatcherServletInitializer；

实现抽象方法指定DispatcherServlet的配置信息。

### Servlet3.0与SpringMVC的整合

1) 在src下的main下面的java里面写我们的源代码：

如果还不知道怎么配置，看我的**idea创建maven-web**的博客，最后有说明。

创建com.liuzhuo包，并在该包下面，创建MyWebAppInitializer类，继承AbstractAnnotationConfigDispatcherServletInitializer：
```
//Web容器启动的时候创建对象；调用方法来初始化容器以前的前端控制器
public class MyWebAppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

    //获取根容器的配置类；（Spring的配置文件）父容器。
    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{RootConfig.class};
    }

    //获取Web容器的配置类（SpringMVC配置文件）子容器
    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{AppConfig.class};
    }

    //获取DispatchServlet的映射信息
    // /:拦截所有请求（包括静态资源（XX.js,XX.png））,但是不包括*.jsp
    // /*:拦截所有请求；连*.jsp页面都拦截；jsp页面需要Tomcat的jsp引擎解析的。
    @Override
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }
}

```

2) 在com.liuzhuo.config包下，创建RootConfig、AppConfig类：
```
@ComponentScan(value = "com.liuzhuo", excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, value = {Controller.class})
})
//Spring的根容器（父容器）,扫描排除含有Controller注解的bean对象
public class RootConfig {
}

```

```
@ComponentScan(value = "com.liuzhuo", includeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, value = {Controller.class})
}, useDefaultFilters = false)
//SpringMVC的子容器，只扫描含有Controller注解的Bean对象
//禁用默认的规则(扫描所有)：useDefaultFilters = false
public class AppConfig {
}
```

这样配置，是根据Spring的官方给的建议：
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030134334.png" style="width:50%"/>

父容器:   配置@service、@repository，数据连接池，事务管理等。
子容器：配置@Controller层，视图解析器，映射配置。

3）在com.liuzhuo.service包下，创建HelloService：
```
@Service
public class HelloService {

    public String sayHello(String name) {
        return "Hello:" + name;
    }
}
```

4) 在com.liuzhuo.controller包下，创建HelloController：
```
@Controller
public class HelloController {

    @Autowired
    private HelloService helloService;

    @ResponseBody
    @RequestMapping("/hello")
    public String hello() {
        String hello = helloService.sayHello("tomcat·····");
        return hello;
    }
}
```

整体的项目结构：
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030134808.png" style="width:50%"/>

5) 启动项目，运行

浏览器输入：
`http://localhost:8080/hello`
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030134940.png" />

到现在为止，Servlet3.0与SpringMVC整合完成。


### 定性配置SpringMVC

打开官网，查看 [MVC Config](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-config)章节。


开启MVC的高级功能，需要@EnableWebMvc注解。

比如：
```
@Configuration
@EnableWebMvc
public class WebConfig {
}
```

相等于xml文件：`<mvc:annotation-driven/>`
```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/mvc
        http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <mvc:annotation-driven/>

</beans>
```

只有开启了@EnableWebMvc或者`<mvc:annotation-driven/>`才能定制SpringMVC的其他信息。

在官网中，我们使用配置实现 WebMvcConfigurer 接口，然后实现其中的所有方法来定制其他组件(视图解析器、拦截器、过滤器等)。

```
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    // Implement configuration methods...
}
```

但是，这样，我们就必须实现其中的所有方法了，为了方便，我们可以继承：WebMvcConfigurerAdapter 适配器，其中所有的方法帮我们实现了，只是返回空方法。然后我们通过重写自己想要定制的方法来完成自身的需求。

#### 定制视图解析器

1）改写我们的AppConfig配置类：

添加@EnableWebMvc、并且继承WebMvcConfigurerAdapter抽象类
```
@ComponentScan(value = "com.liuzhuo", includeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, value = {Controller.class})
}, useDefaultFilters = false)
//SpringMVC的子容器，只扫描含有Controller注解的Bean对象
//禁用默认的规则(扫描所有)：useDefaultFilters = false
@EnableWebMvc
public class AppConfig extends WebMvcConfigurerAdapter {

    

}
```

2）添加自定义的视图解析器

都是在AppConfig类中，直接重写方法

```java
    //配置视图解析器
    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        //定制jsp的视图解析器
        //参数一：视图的前缀路径
        //参数二：视图的后缀名
        registry.jsp("WEB-INF/views/", ".jsp");

    }
```

3）在HelloController中
```java
    @RequestMapping("/suc")
    public String sucess() {
        return "sucess";
    }
```
4) 在WEB-INF/views下，添加一个sucess.jsp的文件
```
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
    <h1>sucess!</h1>
</body>
</html>
```
5) 运行项目

在浏览器中输入：`http://localhost:8080/suc`
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030150751.png"/>

成功定制了jsp的视图解析器了。

---

#### 定制静态资源

没有配置之前：

1）在webapp根目录下：

放入一张图片，随便一张就行。
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030151708.png" style="width:50%"/>

2）在index.jsp中，添加img标签
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030151855.png" style="width:50%"/>

3) 启动项目

浏览器中输入：`http://localhost:8080`
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030152023.png" style="width:50%"/>

发现，我们的照片出不来，这是为啥呢？这是因为，我们的静态资源也会被DispatchServlet拦截。

在控制台中能发现：
```
30-Oct-2018 15:20:00.904 警告 [http-nio-8080-exec-4] org.springframework.web.servlet.PageNotFound.noHandlerFound No mapping found for HTTP request with URI [/gakki.jpg] in DispatcherServlet with name 'dispatcher'
```
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030152314.png"/>

发现 /gakki.jpg 也被DispatchServlet拦截了。

现在，我们需要不让DispatchServlet拦截我们的静态资源，使用Tomcat容器来加载静态资源。

4）在AppConfig下：

```java
    //静态资源访问
    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        //默认是匹配路径：/**
        configurer.enable();
    }
```
相等于xml中的：`<mvc:default-servlet-handler/>`

5) 启动项目
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030153052.png"/>

---

#### 定制拦截器

1）在com.liuzhuo.interceptors在，创建MyInterceptor，实现HandlerInterceptor接口
```
//自定义的拦截器
public class MyInterceptor implements HandlerInterceptor {

    //拦截之前调用
    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o) throws Exception {
        //放行
        System.out.println("preHandle·······");
        return true;
    }

    //处理之后调用
    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

        System.out.println("postHandle·······");
    }

    //成功处理后调用
    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {
        System.out.println("afterCompletion·······");
    }

}

```

2）在AppConfig类下：
```
    //添加拦截器
    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        registry.addInterceptor(new MyInterceptor()).addPathPatterns("/**");
    }
```
3) 启动项目

在浏览器中输入：`http://localhost:8080/suc`
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030155103.png"/>

拦截成功。

如果还想定制其他功能，请查看[Spring的官方文档](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-config)。
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0_SpringMVC/QQ%E6%88%AA%E5%9B%BE20181030155351.png"/>
