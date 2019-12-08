---
title: Servlet3.0
categories:
  - servlet3.0
  - web
tags:
  - servlet3.0
  - web
date: 2018-10-28 21:19:53
summary: servlet3.0创建dynamic Web项目
---
以前，不管是编写servlet、filter 和 Listener等等，还是编写SpringMVC的前端控制器，都是在web.xml中编写的。Servlet3.0版本之后，只需要使用**注解**就可以完成组件的注入，<font color="red">还有运行时的组件式插拔开发。</font>

**注意：** servlet3.0的容器Tomcat 必须是**7.0.x以上版本**才能使用servlet3.0。


### 创建dynamic Web项目

我这里使用的是idea，大家也可以使用eclipse开发。大家估计都对eclipse开发熟悉，如果对idea创建动态web项目不熟悉的话，可以看我另一篇博客[idea 创建动态Web项目](/2018/10/28/idea-chuang-jian-dong-tai-web-xiang-mu/)。

创建好工程后如下：
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029114758.png" style="width:50%"/>

#### 使用web.xml的方式

1）在src下创建com.liuzhuo.servlet包，并创建 HelloServlet（继承 HttpServlet）

```java
public class HelloServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        super.doPost(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.getWriter().write("hello world servlet3.0 ~~~");
    }
}
```

2) 在WBE-INF下的index.jsp中：

添加：`<a href="hello">hello</a>`
```
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>servlet3.0</title>
</head>
<body>
<a href="hello">hello</a>
</body>
</html>
```

3) 在web.xml中配置servlet的映射关系
```
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
         version="3.1">

    <servlet>
        <servlet-name>hello</servlet-name>
        <servlet-class>com.liuzhuo.servlet.HelloServlet</servlet-class>
    </servlet>

    <servlet-mapping>
        <servlet-name>hello</servlet-name>
        <url-pattern>/hello</url-pattern>
    </servlet-mapping>
    
</web-app>
```

4) 运行web应用
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029124916.png"/>

点击hello的超链接
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029124951.png"/>

以上就是servlet3.0之前的版本开发web工程的演示。

---

#### 不使用web.xml(servlet3.0)

1) 去掉web.xml中的servlet的配置：
```
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
         version="3.1">

</web-app>
```

2) 此时再运行web项目，点击hello超链接
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029125311.png"/>

3）使用@WebServlet注解

在HelloServlet类上面写上@WebServlet注解
name : 就是servlet的名字
value：就是映射的路径

@WebServlet上的name  <==> `<servlet-name>hello</servlet-name>`  
@WebServlet上的value <==> `<url-pattern>/hello</url-pattern>`

```java
@WebServlet(value ="/hello" )
public class HelloServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        super.doPost(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.getWriter().write("hello world servlet3.0 ~~~");
    }
}
```

4) 重新启动web项目

会发现，项目启动正常了。

**ps：在idea中，有一个web的窗口，在编辑器的左下角，点开，会看见当前web项目的映射信息，很方便排错。**
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029130641.png" style="width:50%"/>

其他注解：

@WebFilter   ：注解过滤器
@WebListener ：注解监听器
@WebInitParam：注解初始化的参数

具体的使用情况：看官方文档即可。

---

### servlet3.0的共享库和运行时插件

Shared libraries / runtimes pluggability

1）在Servlet容器启动的时候，会扫描当前应用里面的每一个jar包的``ServletContainerInitializer``的实现类

2）提供ServletContainerInitializer的实现类

必须绑定在：``META-INF/services/javax.servlet.ServletContainerInitializer``文件中。
**文件名就是 javax.servlet.ServletContainerInitializer 没有后缀。**

文件中的内容就是：ServletContainerInitializer实现类的**全类名**。

总结：容器在启动的时候，会扫描当前应用中每一个jar包里面的：META-INF/services/javax.servlet.ServletContainerInitializer文件中ServletContainerInitializer实现类，启动并运行这个实现类中的方法和传入感兴趣的类型。

3）测试

3.1) 这里就不创建jar包了，直接在src下创建META-INF/services目录，然后在该目录下，创建javax.servlet.ServletContainerInitializer文件。
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029135845.png" style="width:50%"/>

**注意：目录和文件名称不要打错！！！**

3.2）在src下的com.liuzhuo.servlet下创建MyServletContainerInitializer，并实现ServletContainerInitializer接口。
```java
@HandlesTypes(value = {HelloService.class})
public class MyServletContainerInitializer implements ServletContainerInitializer {

    /**
     * @param set：感兴趣的类型的所有子类型.@HandlesTypes注解中的value即为感兴趣的类型。
     * @param servletContext :代表当前Web应用的ServletContext,一个Web应用一个上下文
     * @throws ServletException
     */
    @Override
    public void onStartup(Set<Class<?>> set, ServletContext servletContext) throws ServletException {
        System.out.println("感兴趣的类型：");
        for (Class<?> aClass : set) {
            System.out.println(aClass);
        }
    }
}
```

3.3) 在src下的com.liuzhuo.service下创建
HelloService：接口  
HelloServiceExt：实现了HelloService的子接口  
AbstractHelloService：实现了HelloService的抽象类    
HelloServiceImpl：HelloService的实现类
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029140510.png" style="width:50%"/>

3.4）将MyServletContainerInitializer的全类名添加到：javax.servlet.ServletContainerInitializer文件中
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029140722.png"/>

3.5）运行web项目
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029140828.png"/>

能看到，输出感兴趣的类型：
```
class com.liuzhuo.service.HelloServiceImpl
interface com.liuzhuo.service.HelloServiceExt
class com.liuzhuo.service.AbstractHelloService
```

**注意感兴趣的类型：不包括本身（HelloService接口）！！！**

---

### 使用ServletContainerInitializer给容器添加组件

根据上文，我们已经了解到了，我们使用@WebServlet注解，给容器添加我们自己写的Servlet类，但是无法添加第三方的组件。只能使用Web.xml文件来添加。

现在，我们了解了Servlet3.0的共享库和运行时机制，可以使用ServletContainerInitializer的机制来注册Web组件(Servlet、Filter、Listener)，不必使用Web.xml配置文件。

接着现有的项目继续开发。

1）在com.liuzhuo.servlet下创建UserServlet、UserFilter、UserListener三大组件
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029143900.png" style="width:50%"/>

UserServlet:
```java
public class UserServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.getWriter().write("UserServlet ·····");
    }
}
```

UserFilter:
```java
public class UserFilter implements Filter {
    public void destroy() {
    }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws ServletException, IOException {
        //执行过滤的方法
        System.out.println("UserFilter ~~~");
        //放行
        chain.doFilter(req, resp);
    }

    public void init(FilterConfig config) throws ServletException {

    }

}
```

UserListener:
```java
public class UserListener implements ServletContextListener {

    //容器初始化的时候
    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        //获取ServletContext容器的上下文，这里也可以注册Servlet、Fliter、Listener组件
        ServletContext servletContext = servletContextEvent.getServletContext();
        System.out.println(servletContext);
        System.out.println("UserListener监听ServletContextListener的初始化");
    }

    //容器销毁的时候
    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        System.out.println("UserListener监听ServletContextListener的销毁");
    }
}
```

2) 在MyServletContainerInitializer中的onStartup方法中使用ServletContext注册三大组件：
```java
@HandlesTypes(value = {HelloService.class})
public class MyServletContainerInitializer implements ServletContainerInitializer {

    /**
     * @param set：感兴趣的类型的所有子类型.@HandlesTypes注解中的value即为感兴趣的类型。
     * @param servletContext :代表当前Web应用的ServletContext：一个Web应用一个上下文
     * @throws ServletException
     */
    @Override
    public void onStartup(Set<Class<?>> set, ServletContext servletContext) throws ServletException {
        System.out.println("感兴趣的类型：");
        for (Class<?> aClass : set) {
            System.out.println(aClass);
        }

        //添加userServelt组件。
        ServletRegistration.Dynamic userServelt = servletContext.addServlet("userServelt", new UserServlet());
        //添加Servlet的映射路径
        userServelt.addMapping("/user");

        //添加监听器
        servletContext.addListener(UserListener.class);

        //添加过滤器
        FilterRegistration.Dynamic userFilter = servletContext.addFilter("userFilter", UserFilter.class);
        //添加拦截规则
        //EnumSet<DispatcherType> var1 :拦截的请求类型
        // boolean var2                ：true
        // String... var3              ：拦截的路径
        userFilter.addMappingForUrlPatterns(EnumSet.of(DispatcherType.REQUEST), true, "/*");
    }
}
```

3) 运行Web项目
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029150012.png"/>

说明userListener监听器注册成功。

在浏览器中输入：`http://localhost:8080/user`
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029150247.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029150400.png"/>

说明UserServlet和userFliter注册也成功了。

停止Web项目：
<img src="https://gakkil.gitee.io/gakkil-image/servlet3.0/QQ%E6%88%AA%E5%9B%BE20181029150554.png"/>

以上，就是不使用Web.xml的注册Servlet、Filter、Listener三大组件的过程，使用硬编码的形式。

**注意：servlet3.0动态注册，只能在webapp启动时进行注册,可能是为了安全考虑吧.不能在运行时完成对servlet的注册和销毁**

在初始化情况下的注册Servlet组件有除了上面的方式，还有另外一种方式：  
就是在实现``ServletContextListener接口`` , 在``contextInitialized``方法中完成注册.

就是在上述UserListener中contextInitialized方法中获取：
 ServletContext servletContext = servletContextEvent.getServletContext();
然后进行三大组件的注册。