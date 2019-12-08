---
title: SpringMVC架构与流程
date: 2018-10-24 15:24:40
categories: SpringMVC
tags: SpringMVC
summary: 探究MVC在SpringMVC中的关系。
---
**SpringMVC的架构与流程**

探究MVC在SpringMVC中的关系。
**前言：**

顾名思义SpringMVC是一个基于MVC设计思想的框架。

什么是mvc？MVC是模型(model)－视图(view)－控制器(controller)的缩写 ，是一种软件设计思想，主要的作用就是解决应用开发的耦合性，将应用的输入、控制、输出进行强制解耦。

mvc中的模型、视图、控制器分别担负着不同的角色：

模型：页面的数据和业务的处理。我们平常用的service和dao层就属于这一层面

视图：只用于用户的显示，不进行任何的业务处理。主要用来获取和显示数据

控制器：控制视图层与用户的交互，将对应的操作调用对应的模型。简单的说，就是管理交互的

理解了mvc，我们就来说一说mvc的执行过程：用户通过view层向服务器发出请求，controller接收请求后，调用对应的model后获取数据，控制器在将数据返回给view。

**好了，我们可以进入正题了，既然SpringMVC是基于MVC的软件设计思想的框架，我们就先看一下SpringMVC的M、V、C分别是什么**

<img src="https://gakkil.gitee.io/gakkil-image/SpringMVC/20181024152707.png"/>

上图里的东西我们不用细看，只需要大概晓得对应的mvc是啥的就行

M:这里的模型指定是具体执行的Handler(Controller)。

V:就是试图View

C:指的的前端控制器

**了解的springMVC的架构思想（mvc），我就开始继续深入的学习springmvc的执行流程吧。**

下面的顺序并不代表图中的顺序：

用户将请求发送给前端控制器（DispatcherServlet）也就是SpringMVC的控制器

然后 前端控制器 请求调用HandlerMapper（处理器映射器）

处理器映射器 根据请求的url返回 Handler和处理器拦截器（如果有）给前端控制器（DispatcherServlet）

前端控制器（DispatcherServlet）找到合适的 处理器适配器(HanderAdatper)，由处理器适配器调用Handler

Handler（以后统称为Controller）执行操作，Handler通常就是我们定义的controller(这里的controller是springmvc的model层),执行完后返回ModelAndView

处理器映射器(HanderAdatper)将ModelAndView返回给 前端控制器

然后 前端控制器将ModelAndView 传递给 视图解析器（ViewReslover )

视图解析器解析（ViewReslover )后 返回具体view，给前端控制器（DispatcherServlet）

前端控制器（DispatcherServlet）对视图进行渲染（将数据填充到视图中）

前端控制器（DispatcherServlet）将视图返回给用户。

---

了解了流程，我们在详细了解一下里面讲到的部件：

前端控制器（DispatcherServlet）：这玩意是 SpringMVC的入口（实际上呢就是一个Servlet对象），所有的请求都要通过它，因为是个Servlet所以不可避免的你要在web.xml进行配置(Servlet3.0以后，可以不使用web.xml配置文件了)。

处理器映射器(HandlerMapper)，这个玩意就是根据不同的方式找到处理器（Handler），它支持的有配置文件形式，接口形式，注解形式等等

处理器适配器（HandlAdapter ）这玩意就是 分析处理器是哪种方式的处理器（配置文件，接口、注解等形式）然后执行Handler

ModelAndView 封装了数据和视图信息，如果想进行页面的数据交互，可以选择这玩意进行传输，数据的存放位置，默认的是Request域

视图解析器（ViewResolver ），负责将处理结果生成View视图。

视图（View ） SpringMVC提供了很多视图，比如jstlView、freemarkerView、pdfView等。我们最常用的视图就是jsp

---

**在spring-mvc.xml文件中配置：**
```java
<!-- 配置处理器映射器 -->
<bean class="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping"/>
<!-- 配置处理器适配器 -->
<bean class="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter"/> 
为什么这么配置spring就能用呢？因为spring对bean的加载有一个顺序，同名称的spring只会认第一次加载的bean，也就是配置文件最先配置的bean
```

**当然了还有更简洁的配置，添加这个配置即可 mvc:annotation-driven**
```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:p="http://www.springframework.org/schema/p"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.0.xsd
        http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-4.0.xsd
        http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.0.xsd">
    <context:component-scan base-package="com.lifeibai"/>
    <mvc:annotation-driven/>
</beans>
```