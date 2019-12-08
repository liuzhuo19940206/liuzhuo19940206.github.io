---
title: SpringBoot_day_06
categories:
  - SpringBoot
  - Spring
tags:
  - SpringBoot
  - Spring
date: 2018-11-08 09:46:59
summary: 继续Web的开发，错误处理机制、配置嵌入式Servlet容器、使用外置的Servlet容器
---

今天，继续Web的开发，错误处理机制、配置嵌入式Servlet容器、使用外置的Servlet容器。

## 错误处理机制

### SpringBoot默认的错误处理机制

默认效果：

1）浏览器，返回一个默认的错误页面

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108101934.png"/>

浏览器发送请求的请求头:

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108102024.png"/>

2) 如果是其他客户端，默认响应一个json数据

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108102057.png"/>

其他客户端发送请求的请求头:

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108102135.png"/>

**原理：**

可以参照 **ErrorMvcAutoConfiguration** ：错误处理的自动配置.

给容器中添加了以下组件:

1、DefaultErrorAttributes：
```java
帮我们在页面共享信息；
@Override
public Map<String, Object> getErrorAttributes(RequestAttributes requestAttributes,    
boolean includeStackTrace) {            
	Map<String, Object> errorAttributes = new LinkedHashMap<String, Object>();        
	errorAttributes.put("timestamp", new Date());        
	addStatus(errorAttributes, requestAttributes);        
	addErrorDetails(errorAttributes, requestAttributes, includeStackTrace);        
	addPath(errorAttributes, requestAttributes);        
	return errorAttributes;        
}
```
2、BasicErrorController：处理默认/error请求
```java
@Controller
@RequestMapping("${server.error.path:${error.path:/error}}")
public class BasicErrorController extends AbstractErrorController {
   
    @RequestMapping(produces = "text/html")//产生html类型的数据；浏览器发送的请求来到这个方法处理
	public ModelAndView errorHtml(HttpServletRequest request,HttpServletResponse response) {          
  
		HttpStatus status = getStatus(request);        
		Map<String, Object> model = Collections.unmodifiableMap(getErrorAttributes(        
		request, isIncludeStackTrace(request, MediaType.TEXT_HTML)));                
		response.setStatus(status.value());        
       
	    //去哪个页面作为错误页面；包含页面地址和页面内容
		ModelAndView modelAndView = resolveErrorView(request, response, status, model);        
		return (modelAndView == null ? new ModelAndView("error", model) : modelAndView);        
	}    

	@RequestMapping    
	@ResponseBody    //产生json数据，其他客户端来到这个方法处理；
	public ResponseEntity<Map<String, Object>> error(HttpServletRequest request) {    

		Map<String, Object> body = getErrorAttributes(request,        
		isIncludeStackTrace(request, MediaType.ALL));                
		HttpStatus status = getStatus(request);        
		return new ResponseEntity<Map<String, Object>>(body, status);        
	} 
```

3、ErrorPageCustomizer：发送默认/error请求
```java
Value("${error.path:/error}")    
private String path = "/error";  系统出现错误以后，来到error请求进行处理；（web.xml注册的错误页面规则）
```

4、DefaultErrorViewResolver：
```java
	@Override
	public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status,    
	Map<String, Object> model) {            
		ModelAndView modelAndView = resolve(String.valueOf(status), model);        
		if (modelAndView == null && SERIES_VIEWS.containsKey(status.series())) {        
		modelAndView = resolve(SERIES_VIEWS.get(status.series()), model);            
		}        
		return modelAndView;        
	 } 

    private ModelAndView resolve(String viewName, Map<String, Object> model) {    
        //默认SpringBoot可以去找到一个页面？  error/404
        String errorViewName = "error/" + viewName;        
       
        //模板引擎可以解析这个页面地址就用模板引擎解析
        TemplateAvailabilityProvider provider = this.templateAvailabilityProviders        
        .getProvider(errorViewName, this.applicationContext);     
           
        if (provider != null) {        
            //模板引擎可用的情况下返回到errorViewName指定的视图地址
            return new ModelAndView(errorViewName, model);            
         }        
        //模板引擎不可用，就在静态资源文件夹下找errorViewName对应的页面   error/404.html
        return resolveResource(errorViewName, model);        
     }
```

**步骤：**

一但系统出现4xx或者5xx之类的错误；ErrorPageCustomizer就会生效（定制错误的响应规则）；就会来到/error
请求；就会被BasicErrorController处理；

响应页面；去哪个页面是由DefaultErrorViewResolver解析得到的
```java
protected ModelAndView resolveErrorView(HttpServletRequest request,
      HttpServletResponse response, HttpStatus status, Map<String, Object> model) {
    //所有的ErrorViewResolver得到ModelAndView
    for (ErrorViewResolver resolver : this.errorViewResolvers) {
      ModelAndView modelAndView = resolver.resolveErrorView(request, status, model);
      if (modelAndView != null) {
         return modelAndView;
      }
   }
   return null;
}
```

### 如果定制错误响应

#### 如何定制错误的页面

1) **有模板引擎的情况下**

将错误页面命名为 : 错误状态码.html , 放在模板引擎文件夹里面的error文件夹下，发生此状态码的错误就会来到 对应的页面；

我们可以使用4xx和5xx作为错误页面的文件名来匹配这种类型的所有错误，精确优先（优先寻找精确的状态码.html）；

页面能获取的信息:
1. timestamp：时间戳
2. status：状态码
3. error：错误提示
4. exception：异常对象
5. message：异常消息
6. errors：JSR303数据校验的错误都在这里

2) 没有模板引擎（模板引擎找不到这个错误页面），在静态资源文件夹下找

3) 以上都没有错误页面，就是默认来到SpringBoot默认的错误提示页面
```
		private final SpelView defaultErrorView = new SpelView(
				"<html><body><h1>Whitelabel Error Page</h1>"
						+ "<p>This application has no explicit mapping for /error, so you are seeing this as a fallback.</p>"
						+ "<div id='created'>${timestamp}</div>"
						+ "<div>There was an unexpected error (type=${error}, status=${status}).</div>"
						+ "<div>${message}</div></body></html>");

		@Bean(name = "error")
		@ConditionalOnMissingBean(name = "error")
		public View defaultErrorView() {
			return this.defaultErrorView;
		}
```

#### 如何定制错误的json数据

1) 自定义异常处理&返回定制json数据

```java
@ControllerAdvice
public class MyExceptionHandler {

    @ResponseBody
    @ExceptionHandler(UserNotExistException.class)
    public Map<String,Object> handleException(Exception e){
        Map<String,Object> map = new HashMap<>();
        map.put("code","user.notexist");
        map.put("message",e.getMessage());
        return map;
    }
}
//没有自适应效果...
//即：浏览器和手机客户端都会返回json数据了
```

2）转发到/error进行自适应响应效果处理
```java
　　@ExceptionHandler(UserNotExistException.class)
    public String handleException(Exception e, HttpServletRequest request){

        Map<String,Object> map = new HashMap<>();
        //传入我们自己的错误状态码  4xx 5xx，否则就不会进入定制错误页面的解析流程
        /**
         * Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
         */
        request.setAttribute("javax.servlet.error.status_code",500);
        map.put("code","user.notexist");
        map.put("message",e.getMessage());
        
　　　　//将我们自己定义的数据放到request域中
　　　　request.setAttributes("ext",map);
        //转发到/error
        return "forward:/error";
    }
```

**3) 将我们的定制数据携带出去**

出现错误以后，会来到/error请求，会被BasicErrorController处理，响应出去可以获取的数据是由
getErrorAttributes得到的（是AbstractErrorController（ErrorController）规定的方法）

1、完全来编写一个ErrorController的实现类【或者是编写AbstractErrorController的子类】，放在容器中。

2、页面上能用的数据，或者是json返回能用的数据都是通过errorAttributes.getErrorAttributes得到

容器中DefaultErrorAttributes.getErrorAttributes()；默认进行数据处理的。

自定义ErrorAttributes：
```java
//给容器中加入我们自己定义的ErrorAttributes
@Component
public class MyErrorAttributes extends DefaultErrorAttributes {
    @Override
    public Map<String, Object> getErrorAttributes(RequestAttributes requestAttributes,boolean includeStackTrace) {

        Map<String, Object> map = super.getErrorAttributes(requestAttributes,includeStackTrace);
        map.put("company","atguigu");
        
        //从request域中获取我们自己定义的数据，0：代表request域
        Map<String,Object> ext = (Map<String,Object>)requestAttributes.getAttribute("ext",0);
        //放入要展示的map当中
        map.put("ext",ext);
        return map;
        
    }
}
```

最终的效果：响应是自适应的，可以通过定制ErrorAttributes改变需要返回的内容：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108111151.png"/>


## 配置嵌入式Servlet容器

SpringBoot默认使用Tomcat作为嵌入式的Servlet容器
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108113617.png"/>

问题？

### 如何定制和修改Servlet容器的相关配置

1、修改与server有关的配置（ServerProperties【也是EmbeddedServletContainerCustomizer】）

```
server.port=8081
server.context‐path=/crud
server.tomcat.uri‐encoding=UTF‐8

//通用的Servlet容器设置
server.xxx
//Tomcat的设置
server.tomcat.xxx
```
2、编写一个EmbeddedServletContainerCustomizer：嵌入式的Servlet容器的定制器；来修改Servlet容器的配置
```java
@Bean  //一定要将这个定制器加入到容器中
public EmbeddedServletContainerCustomizer embeddedServletContainerCustomizer(){
    return new EmbeddedServletContainerCustomizer() {
        //定制嵌入式的Servlet容器相关的规则
        @Override
        public void customize(ConfigurableEmbeddedServletContainer container) {
            container.setPort(8083);
        }
    };
}
```

### 注册Servlet三大组件【Servlet、Filter、Listener】

由于SpringBoot默认是以jar包的方式启动嵌入式的Servlet容器来启动SpringBoot的web应用，没有web.xml文件.

注册三大组件用以下方式:

1) ServletRegistrationBean
```java
@Bean
public ServletRegistrationBean myServlet(){
    ServletRegistrationBean registrationBean = new ServletRegistrationBean(new MyServlet(),"/myServlet");
    return registrationBean;
}
```
2) FilterRegistrationBean
```java
@Bean
public FilterRegistrationBean myFilter(){
    FilterRegistrationBean registrationBean = new FilterRegistrationBean();
    registrationBean.setFilter(new MyFilter());
    registrationBean.setUrlPatterns(Arrays.asList("/hello","/myServlet"));
    return registrationBean;
}
```
3) ServletListenerRegistrationBean
```java
@Bean
public ServletListenerRegistrationBean myListener(){
    ServletListenerRegistrationBean<MyListener> registrationBean = new ServletListenerRegistrationBean<>(new MyListener());
    return registrationBean;
}
```

SpringBoot帮我们自动配置SpringMVC的时候，自动的注册SpringMVC的前端控制器；DispatcherServlet；

DispatcherServletAutoConfiguration中：
```java
@Bean(name = DEFAULT_DISPATCHER_SERVLET_REGISTRATION_BEAN_NAME)
@ConditionalOnBean(value = DispatcherServlet.class, name =
DEFAULT_DISPATCHER_SERVLET_BEAN_NAME)
public ServletRegistrationBean dispatcherServletRegistration(
      DispatcherServlet dispatcherServlet) {
   ServletRegistrationBean registration = new ServletRegistrationBean(
         dispatcherServlet, this.serverProperties.getServletMapping());
    //默认拦截： /  所有请求；包静态资源，但是不拦截jsp请求；   /*会拦截jsp
    //可以通过server.servletPath来修改SpringMVC前端控制器默认拦截的请求路径
   
   registration.setName(DEFAULT_DISPATCHER_SERVLET_BEAN_NAME);
   registration.setLoadOnStartup(
         this.webMvcProperties.getServlet().getLoadOnStartup());
   if (this.multipartConfig != null) {
      registration.setMultipartConfig(this.multipartConfig);
   }
   return registration;
}
```

### 替换为其他嵌入式Servlet容器
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108114843.png" style="width:50%"/>

默认支持：

Tomcat（默认使用）
```
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring‐boot‐starter‐web</artifactId>
   引入web模块默认就是使用嵌入式的Tomcat作为Servlet容器；
</dependency>
```
Jetty
```
<!‐‐ 引入web模块 ‐‐>
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring‐boot‐starter‐web</artifactId>
   <exclusions>
      <exclusion>
         <artifactId>spring‐boot‐starter‐tomcat</artifactId>
         <groupId>org.springframework.boot</groupId>
      </exclusion>
   </exclusions>

</dependency>
<!‐‐引入其他的Servlet容器‐‐>
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring‐boot‐starter‐jetty</artifactId>
</dependency>
```
Undertow
```
<!‐‐ 引入web模块 ‐‐>
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring‐boot‐starter‐web</artifactId>
   <exclusions>
      <exclusion>
         <artifactId>spring‐boot‐starter‐tomcat</artifactId>
         <groupId>org.springframework.boot</groupId>
      </exclusion>
   </exclusions>
</dependency>

<!‐‐引入其他的Servlet容器‐‐>
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring‐boot‐starter‐undertow</artifactId>
</dependency>
```

### 嵌入式Servlet容器自动配置原理

**EmbeddedServletContainerAutoConfiguration**：嵌入式的Servlet容器自动配置

```java
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE)
@Configuration
@ConditionalOnWebApplication
@Import(BeanPostProcessorsRegistrar.class)
//导入BeanPostProcessorsRegistrar：Spring注解版；给容器中导入一些组件
//导入了EmbeddedServletContainerCustomizerBeanPostProcessor：
//后置处理器：bean初始化前后（创建完对象，还没赋值赋值）执行初始化工作
public class EmbeddedServletContainerAutoConfiguration {
   
　　 @Configuration
	@ConditionalOnClass({ Servlet.class, Tomcat.class })//判断当前是否引入了Tomcat依赖；    
	@ConditionalOnMissingBean(value = EmbeddedServletContainerFactory.class, search =
	SearchStrategy.CURRENT)//判断当前容器没有用户自己定义EmbeddedServletContainerFactory：
    //嵌入式的Servlet容器工厂；作用：创建嵌入式的Servlet容器
	public static class EmbeddedTomcat {    
	@Bean        
	public TomcatEmbeddedServletContainerFactory tomcatEmbeddedServletContainerFactory()
	{
		return new TomcatEmbeddedServletContainerFactory();            
	}        
  }    
   
	/**
	 * Nested configuration if Jetty is being used.    
	 */    
	@Configuration    
	@ConditionalOnClass({ Servlet.class, Server.class, Loader.class,    
	WebAppContext.class })            
	@ConditionalOnMissingBean(value = EmbeddedServletContainerFactory.class, search =
	SearchStrategy.CURRENT)
	   
		public static class EmbeddedJetty {    
		@Bean
        public JettyEmbeddedServletContainerFactory jettyEmbeddedServletContainerFactory() 
        {        
		return new JettyEmbeddedServletContainerFactory();            
		}        
	} 


	/**    
	 * Nested configuration if Undertow is being used.    
	 */    
	@Configuration    
	@ConditionalOnClass({ Servlet.class, Undertow.class, SslClientAuthMode.class })    
	@ConditionalOnMissingBean(value = EmbeddedServletContainerFactory.class, search =
	SearchStrategy.CURRENT)
	   
	public static class EmbeddedUndertow {    
	@Bean        
	public UndertowEmbeddedServletContainerFactory
	undertowEmbeddedServletContainerFactory() {
	       
	return new UndertowEmbeddedServletContainerFactory();            
	}        
  } 
```

1）、EmbeddedServletContainerFactory（嵌入式Servlet容器工厂）

```java
public interface EmbeddedServletContainerFactory {
   //获取嵌入式的Servlet容器
   EmbeddedServletContainer getEmbeddedServletContainer(
         ServletContextInitializer... initializers);
}
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108130503.png" style="width:50%"/>

2）、EmbeddedServletContainer：（嵌入式的Servlet容器）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108130718.png" style="width:50%"/>

3）、**以TomcatEmbeddedServletContainerFactory为例**
```java
@Override
public EmbeddedServletContainer getEmbeddedServletContainer(
      ServletContextInitializer... initializers) {
   //创建一个Tomcat
   Tomcat tomcat = new Tomcat();
   
    //配置Tomcat的基本环节
   File baseDir = (this.baseDirectory != null ? this.baseDirectory
         : createTempDir("tomcat"));
   tomcat.setBaseDir(baseDir.getAbsolutePath());
   Connector connector = new Connector(this.protocol);
   tomcat.getService().addConnector(connector);
   customizeConnector(connector);
   tomcat.setConnector(connector);
   tomcat.getHost().setAutoDeploy(false);
   configureEngine(tomcat.getEngine());
   for (Connector additionalConnector : this.additionalTomcatConnectors) {
      tomcat.getService().addConnector(additionalConnector);
   }
   prepareContext(tomcat.getHost(), initializers);
   
    //将配置好的Tomcat传入进去，返回一个EmbeddedServletContainer；并且启动Tomcat服务器
   return getTomcatEmbeddedServletContainer(tomcat);
}
```

4）、我们对嵌入式容器的配置修改是怎么生效？
```
ServerProperties、EmbeddedServletContainerCustomizer
```

**EmbeddedServletContainerCustomizer**：定制器帮我们修改了Servlet容器的配置？

怎么修改的原理？

5) 容器中导入了**EmbeddedServletContainerCustomizerBeanPostProcessor**
```java
//初始化之前
@Override
public Object postProcessBeforeInitialization(Object bean, String beanName)
      throws BeansException {
    //如果当前初始化的是一个ConfigurableEmbeddedServletContainer类型的组件
   if (bean instanceof ConfigurableEmbeddedServletContainer) {
       //
      postProcessBeforeInitialization((ConfigurableEmbeddedServletContainer) bean);
   }
   return bean;
}
private void postProcessBeforeInitialization(
ConfigurableEmbeddedServletContainer bean) {            
    //获取所有的定制器，调用每一个定制器的customize方法来给Servlet容器进行属性赋值；
    for (EmbeddedServletContainerCustomizer customizer : getCustomizers()) {
        customizer.customize(bean);
    }
}
private Collection<EmbeddedServletContainerCustomizer> getCustomizers() {
    if (this.customizers == null) {
        // Look up does not include the parent context
        this.customizers = new ArrayList<EmbeddedServletContainerCustomizer>(
            this.beanFactory
            //从容器中获取所有这葛类型的组件：EmbeddedServletContainerCustomizer
            //定制Servlet容器，给容器中可以添加一个EmbeddedServletContainerCustomizer类型的组件
            .getBeansOfType(EmbeddedServletContainerCustomizer.class,
                            false, false)
            .values());
        Collections.sort(this.customizers, AnnotationAwareOrderComparator.INSTANCE);
        this.customizers = Collections.unmodifiableList(this.customizers);
    }
    return this.customizers;
}
ServerProperties也是定制器
```

步骤：

1）、SpringBoot根据导入的嵌入式容器依赖情况，给容器中添加相应的
EmbeddedServletContainerFactory【TomcatEmbeddedServletContainerFactory】

2）、容器中某个组件要创建对象就会惊动后置处理器；
EmbeddedServletContainerCustomizerBeanPostProcessor；
只要是嵌入式的Servlet容器工厂，后置处理器就工作；

3）、后置处理器，从容器中获取所有的EmbeddedServletContainerCustomizer，调用定制器的定制方法。

### 嵌入式Servlet容器启动原理

什么时候创建嵌入式的Servlet容器工厂？什么时候获取嵌入式的Servlet容器并启动Tomcat；

获取嵌入式的Servlet容器工厂：

1）、SpringBoot应用启动运行run方法

2）、refreshContext(context); SpringBoot刷新IOC容器【创建IOC容器对象，并初始化容器，创建容器中的每一
个组件】；如果是web应用创建AnnotationConfigEmbeddedWebApplicationContext，否则：
AnnotationConfigApplicationContext

3）、refresh(context);**刷新刚才创建好的ioc容器；**
```
public void refresh() throws BeansException, IllegalStateException {
   synchronized (this.startupShutdownMonitor) {
      // Prepare this context for refreshing.
      prepareRefresh();
      // Tell the subclass to refresh the internal bean factory.
      ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
      // Prepare the bean factory for use in this context.
      prepareBeanFactory(beanFactory);
      try {
         // Allows post‐processing of the bean factory in context subclasses.
         postProcessBeanFactory(beanFactory);
         // Invoke factory processors registered as beans in the context.
         invokeBeanFactoryPostProcessors(beanFactory);
         // Register bean processors that intercept bean creation.
         registerBeanPostProcessors(beanFactory);
         // Initialize message source for this context.
         initMessageSource();
         // Initialize event multicaster for this context.
         initApplicationEventMulticaster();
         // Initialize other special beans in specific context subclasses.
         onRefresh();
         // Check for listener beans and register them.
         registerListeners();
         // Instantiate all remaining (non‐lazy‐init) singletons.
         finishBeanFactoryInitialization(beanFactory);
         // Last step: publish corresponding event.
         finishRefresh();
      }
      catch (BeansException ex) {
         if (logger.isWarnEnabled()) {
            logger.warn("Exception encountered during context initialization ‐ " +
                  "cancelling refresh attempt: " + ex);
         }
         // Destroy already created singletons to avoid dangling resources.
         destroyBeans();
         // Reset 'active' flag.
         cancelRefresh(ex);
         // Propagate exception to caller.
         throw ex;
      }
      finally {
         // Reset common introspection caches in Spring's core, since we
         // might not ever need metadata for singleton beans anymore...
         resetCommonCaches();
      }
   }
}
```

4）、 onRefresh(); web的ioc容器重写了onRefresh方法

5）、webIoC容器会创建嵌入式的Servlet容器；**createEmbeddedServletContainer();**

6）、**获取嵌入式的Servlet容器工厂**：

EmbeddedServletContainerFactory containerFactory = getEmbeddedServletContainerFactory();

从ioc容器中获取EmbeddedServletContainerFactory 组件；**TomcatEmbeddedServletContainerFactory**创建
对象，后置处理器一看是这个对象，就获取所有的定制器来先定制Servlet容器的相关配置；

7）、**使用容器工厂获取嵌入式的Servlet容器**：

this.embeddedServletContainer = containerFactory.getEmbeddedServletContainer(getSelfInitializer());

8）、嵌入式的Servlet容器创建对象并启动Servlet容器

**先启动嵌入式的Servlet容器，再将ioc容器中剩下没有创建出的对象获取出来**

<b>IOC容器启动创建嵌入式的Servlet容器</b>

---

### 使用外置的Servlet容器

嵌入式Servlet容器：应用打成可执行的jar

优点：简单、便携

缺点：默认不支持JSP、优化定制比较复杂（使用定制器【ServerProperties、自定义EmbeddedServletContainerCustomizer】
自己编写嵌入式Servlet容器的创建工厂【EmbeddedServletContainerFactory】）；

外置的Servlet容器：外面安装Tomcat---应用war包的方式打包.

#### 步骤

1）创建一个War工程：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108141118.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108141218.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108141327.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108141425.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108141535.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108141805.png"/>

2）将项目结构构**造成War的目录结构**

打开项目的结构设置：（点击Web）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108141932.png"/>

**添加webapp目录 和 web.xml文件**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108142443.png"/>

完成后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108142615.png" style="width:50%"/>

打开pom.xml文件

检查是不是war：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108142726.png"/>

**检查tomcat的依赖的scope是不是provided**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108142816.png"/>

3）添加外部的Tomcat的容器
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108143051.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108143152.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108143441.png"/>

发现上面一个警告，因为还没有配置部署的项目：点击Deployment
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108143551.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108143640.png"/>

4）启动外部的Tomcat容器：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108143747.png"/>

启动完成后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108143904.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108143941.png"/>

5）添加jsp页面，看看是否能成功

在webapp下面，直接创建index.jsp页面

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108144117.png"/>

启动应用，在浏览器中输入：`http://localhost:8080/` 或者 `http://localhost:8080/index.jsp`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108144330.png"/>

6) 编写控制器层：

一般我们的jsp.xml页面放置在WEB-INF下面，因为这样可以屏蔽直接在浏览器中输入地址直接访问我们的页面。

不信的话，我们在WEB-INF下面放置一个success.jsp页面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108144634.png"/>

重启应用，在浏览器中输入：`http://localhost:8080/WEB-INF/success.jsp`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108144754.png"/>

WEB-INF下面的资源，必须靠容器来帮我们访问，即：用控制层的重定向或者转发来寻找资源。

修改index.jsp页面：
添加一个a标签，发送/success的get请求：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108150427.png"/>

创建controller包，并创建HelloController类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108150437.png"/>

重启应用，点击success的超链接
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108150447.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108150604.png"/>

出现500，/success请求路径解析异常，因为我们没有配置视图解析器，return "success" 又会重新执行
```java
    @GetMapping("/success")
    public String success() {
        return "success";
    }
```
该方法，就会循环调用，出现异常。

所以，需要在配置文件中，配置view的前缀路径，和后缀名。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108151153.png"/>

重启应用，点击success超链接：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108151253.png"/>

以上就是使用Springboot打包成war包的开发流程：

**注意：此时不能使用Springboot的主类应用启动方式，只能使用Tomcat容器的启动方式！！！**

---

#### 原理

jar包：执行SpringBoot主类的main方法，启动ioc容器，创建嵌入式的Servlet容器；

war包：启动服务器，服务器启动SpringBoot应用【SpringBootServletInitializer】，启动ioc容器；

war包的启动原理，还是要归结于servlet3.0标准。

如果大家不清楚的话，看我的另一篇[serlvet3.0](/2018/10/28/Servlet3-0/)里面有详细的过程。

规则：

1）、服务器启动（web应用启动）会创建当前web应用里面每一个jar包里面ServletContainerInitializer实例：

2）、ServletContainerInitializer的实现放在jar包的META-INF/services文件夹下，有一个名为
javax.servlet.ServletContainerInitializer的文件，内容就是ServletContainerInitializer的实现类的全类名

3）、还可以使用@HandlesTypes，在应用启动的时候加载我们感兴趣的类；

流程：

1）、启动Tomcat

2）、org\springframework\spring-web\4.3.14.RELEASE\spring-web-4.3.14.RELEASE.jar!\META-
INF\services\javax.servlet.ServletContainerInitializer：

Spring的web模块里面有这个文件：org.springframework.web.SpringServletContainerInitializer
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108154339.png"/>

3）、SpringServletContainerInitializer将@HandlesTypes(WebApplicationInitializer.class)标注的所有这个类型
的类都传入到onStartup方法的Set集合中；为这些WebApplicationInitializer类型的类创建实例；
```java
@HandlesTypes(WebApplicationInitializer.class)
public class SpringServletContainerInitializer
```

4）、每一个WebApplicationInitializer都调用自己的onStartup；
```java
		for (WebApplicationInitializer initializer : initializers) {
			initializer.onStartup(servletContext);
		}
```

WebApplicationInitializer继承树：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108155531.png"/>

我们发现了SpringBootServletInitializer是WebApplicationInitializer一个实现类。

5）我们项目中的ServletInitializer继承了SpringBootServletInitializer：(idea自己帮我们创建的一个类，名字无所谓，继承SpringBootServletInitializer即可)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day06/QQ%E6%88%AA%E5%9B%BE20181108155741.png"/>

所以服务启动的时候，会创建ServletInitializer实例并调用onStartup方法。我们没有重写onStartup方法，所以会调用父类SpringBootServletInitializer的onStartup方法。

6）SpringBootServletInitializer执行onStartup的时候会调用createRootApplicationContext：创建容器
```java
protected WebApplicationContext createRootApplicationContext(
      ServletContext servletContext) {
    //1、创建SpringApplicationBuilder
   SpringApplicationBuilder builder = createSpringApplicationBuilder();
   StandardServletEnvironment environment = new StandardServletEnvironment();
   environment.initPropertySources(servletContext, null);
   builder.environment(environment);
   builder.main(getClass());
   ApplicationContext parent = getExistingRootWebApplicationContext(servletContext);
   if (parent != null) {
      this.logger.info("Root context already created (using as parent).");
      servletContext.setAttribute(
            WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE, null);
      builder.initializers(new ParentContextApplicationContextInitializer(parent));
   }
   builder.initializers(
         new ServletContextApplicationContextInitializer(servletContext));
   builder.contextClass(AnnotationConfigEmbeddedWebApplicationContext.class);
   
    //2.调用configure方法，子类重写了这个方法，将SpringBoot的主程序类传入了进来
   builder = configure(builder);
   
    //3.使用builder创建一个Spring应用
   SpringApplication application = builder.build();
   if (application.getSources().isEmpty() && AnnotationUtils
         .findAnnotation(getClass(), Configuration.class) != null) {
      application.getSources().add(getClass());
   }
   Assert.state(!application.getSources().isEmpty(),
         "No SpringApplication sources have been defined. Either override the "
               + "configure method or add an @Configuration annotation");
   // Ensure error pages are registered
   if (this.registerErrorPageFilter) {
      application.getSources().add(ErrorPageFilterConfiguration.class);
   }
    //4.启动Spring应用
   return run(application);
}
```

7） Spring的应用就启动并且创建IOC容器
```java
public ConfigurableApplicationContext run(String... args) {
   StopWatch stopWatch = new StopWatch();
   stopWatch.start();
   ConfigurableApplicationContext context = null;
   FailureAnalyzers analyzers = null;
   configureHeadlessProperty();
   SpringApplicationRunListeners listeners = getRunListeners(args);
   listeners.starting();
   try {
      ApplicationArguments applicationArguments = new DefaultApplicationArguments(
            args);
      ConfigurableEnvironment environment = prepareEnvironment(listeners,
            applicationArguments);
      Banner printedBanner = printBanner(environment);
      context = createApplicationContext();
      analyzers = new FailureAnalyzers(context);
      prepareContext(context, environment, listeners, applicationArguments,
            printedBanner);
      
       //刷新IOC容器
      refreshContext(context);
      afterRefresh(context, applicationArguments);
      listeners.finished(context, null);
      stopWatch.stop();
      if (this.logStartupInfo) {
         new StartupInfoLogger(this.mainApplicationClass)
               .logStarted(getApplicationLog(), stopWatch);
      }
      return context;
   }
   catch (Throwable ex) {
      handleRunFailure(context, listeners, analyzers, ex);
      throw new IllegalStateException(ex);
   }
}
```

<font color="#EE2C2C">**总结：启动Servlet容器，再启动SpringBoot应用**</font>