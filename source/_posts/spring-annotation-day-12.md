---
title: spring_annotation_day_12
date: 2018-10-18 20:59:13
categories: spring_annotation
tags: spring_annotation
summary: 今天学习Spring-annotation的AOP开发与使用
---
**Spring注解开发**  

今天学习AOP的开发与使用

### AOP介绍

AOP是Spring 框架的一个关键组件，全称为Aspect-Oriented-Programming（面向切面编程），目前已是一种比较成熟的编程方式。

AOP采取横向抽取机制，将分散在各个方法中的重复代码提取出来，然后在编译或运行的时候，再将这些代码应用到需要执行的地方。

**注：提取出来的代码应用到需要执行的地方，并不会把源代码加到需要的地方执行，即源代码文件不会更改，但是它会影响最终的机器编译代码**

意思就是，有一些通用功能的代码可以提取出来，然后在使用的时候应用进去就可以了，比如表单验证和日志记录等等。

### AOP术语

Aspect（切面）

通常指封装起来用于插入到指定位置实现某项功能的类

Join point（连接点）

在SpringAOP中，连接点指方法的调用

Pointcut（切入点）

切面与程序流程的交叉点，即那些需要处理的连接点，通常在程序中，切入点指的是类或者方法名

Advice（通知/增强处理）

就是程序实际运行之前或之后执行的方法，也就是AOP加入的代码

Target Object（目标对象）

即需要加入AOP代码的对象

Proxy（代理）

AOP框架动态生成的一个对象，该对象可以作为目标对象使用

Weaving（织入）

把切面连接到其它的应用程序类型或者对象上，并创建一个需要Advice对象的过程

### AOP的例子（JDK代理）

1）首先建立一个java工程

<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day12/20181018211302.png" style="width:50%"/>

UserDao接口:
```java
package com.aop.jdk;

public interface UserDao {
 
 public void addUser();
 
}
```

UserDaoImpl:
```java
package com.aop.jdk;

public class UserDaoImpl implements UserDao {

 @Override
 public void addUser() {
   
   System.out.println("新增用户");
 }
 
}
```

JdkProxy:
```java
package com.aop.jdk;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

import com.aop.aspect.MyAspect;

/**
* JDK代理类
*/
public class JdkProxy implements InvocationHandler{
 
 // 声明目标类接口
 private UserDao userDao;
 
 // 创建代理方法
 public  Object createProxy(UserDao userDao) {
   
   this.userDao = userDao;
   
   // 1.类加载器
   ClassLoader classLoader = JdkProxy.class.getClassLoader();
   
   // 2.被代理对象实现的所有接口
   @SuppressWarnings("rawtypes")
   Class[] clazz = userDao.getClass().getInterfaces();
   
   // 3.使用代理类，进行增强，返回的是代理后的对象
   return  Proxy.newProxyInstance(classLoader,clazz,this);
   
 }
 
 /*
  * 所有动态代理类的方法调用，都会交由invoke()方法去处理
  * proxy 被代理后的对象 
  * method 将要执行的方法
  * args 执行方法时需要的参数
  */
 @Override
 public Object invoke(Object proxy, Method method, Object[] args) 
     throws Throwable {
   
   // 声明切面
   MyAspect myAspect = new MyAspect();
   
   // 指定位置程序执行前执行这个方法
   myAspect.start();
   
   // 在目标类上调用方法
   Object obj = method.invoke(userDao, args);
   
   // 指定位置程序执行结束后执行
   myAspect.end();
   
   return obj;
 }
 
}
```

MyAspect:
```java
package com.aop.aspect;

/**
*  切面
*/
public class MyAspect {
 
 public void start(){
   System.out.println("模拟事务处理功能 ...");
 }
 
 public void end(){
   System.out.println("程序结束后执行此处 ...");
 }
 
}
```

JdkTest:

测试结果项目编写完之后运行该类

```java
package com.aop.test;

import com.aop.jdk.JdkProxy;
import com.aop.jdk.UserDao;
import com.aop.jdk.UserDaoImpl;

public class JdkTest {
 
 public static void main(String[] args) {
   
   // 创建代理对象
   JdkProxy jdkProxy = new JdkProxy();
        // 创建目标对象
   UserDao userDao= new UserDaoImpl();
   // 从代理对象中获取增强后的目标对象
   UserDao userDao1 = (UserDao) jdkProxy.createProxy(userDao);
   // 执行方法
   userDao1.addUser();
 }
 
}
```

运行之后，我们可以看到以下结果：
<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day12/20181018211845.png" style="width:50%"/>

---

我们可以看到，在我们执行新增用户的方法时，依据我们AOP编程，系统自动执行了start方法和end方法

在实际运用中，我们可以把一些通用的方法放到start和end的位置，在需要的方法处加入切面即可

此外，建议大家再了解下AspectJ

AspectJ实现AOP有两种方式：一种是基于XML的声明式，另一种是基于注解的声明式

基于XML的声明式AspectJ要便捷一些，但是存在配置信息多的缺点

基于注解的声明式AspectJ则通过注解的方式减少了很多配置信息

### Spring中的AOP使用

1）创建新的配置类MainConfigOfAOP
```java
@Configuration
public class MainConfigOfAOP {
}
```

2) 在com.liuzhuo.aop包下，创建MathCalculator类
```java
public class MathCalculator {

    public int div(int a, int b) {
        return a / b;
    }
}
```

2) 在com.liuzhuo.aop包下，创建切面类MathCalculator
```java
public class LogAspects {

    public void logStart(){
        System.out.println("方法调用之前------");
    }

    public void logEnd(){
        System.out.println("方法调用之后-------");
    }

    public void logReturn(){
        System.out.println("方法成功返回之后------");
    }

    public void logThrowing(){
        System.out.println("方法出现异常之后------");
    }

    public void logRound(){
        //环绕方法
        System.out.println("环绕：方法调用之前----");
        System.out.println("环绕：方法调用之后----");
    }
}
```

3) 添加AOP的依赖，在pom文件中：
```java
<!-- https://mvnrepository.com/artifact/org.springframework/spring-aspects -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
    <version>5.1.1.RELEASE</version>
</dependency>
```

4) 将切面与目标方法进行连接：
```java
@Aspect
public class LogAspects {

    @Pointcut("execution(public int com.liuzhuo.aop.MathCalculator.div(int,int))")
    public void pointCut() {
    }

    //调用本类的切点
    @Before("pointCut()")
    public void logStart() {
        System.out.println("方法调用之前------");
    }

    //调用外面类的切点
    @After("com.liuzhuo.aop.LogAspects.pointCut()")
    public void logEnd() {
        System.out.println("方法调用之后-------");
    }

    @AfterReturning(value = "pointCut()", returning = "returns")
    public void logReturn(Object returns) {
        System.out.println("方法成功返回之后------:" + returns);
    }

    @AfterThrowing(value = "pointCut()", throwing = "e")
    public void logThrowing(Exception e) {
        System.out.println("方法出现异常之后------:" + e);
    }

    @Around("pointCut()")
    public Object logRound(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        //环绕方法
        System.out.println("环绕：方法调用之前----");
        Object proceed = proceedingJoinPoint.proceed();
        System.out.println("环绕：方法调用之后----");
        return proceed;
    }
}
```

5) 将切面和目标类注入到容器中：
```java
@Configuration
public class MainConfigOfAOP {

    @Bean
    public MathCalculator mathCalculator() {
        return new MathCalculator();
    }

    @Bean
    public LogAspects logAspects() {
        return new LogAspects();
    }
}
```
6) **开启Aspect的注解驱动**：@EnableAspectJAutoProxy 
```java
@Configuration
@EnableAspectJAutoProxy //开启AOP注解驱动
public class MainConfigOfAOP {

    @Bean
    public MathCalculator mathCalculator() {
        return new MathCalculator();
    }

    @Bean
    public LogAspects logAspects() {
        return new LogAspects();
    }
}
```

7) 创建新的测试类：
```java
public class IoCTest_AOP {

    @Test
    public void test01() {
        AnnotationConfigApplicationContext applicationContext = new 
            AnnotationConfigApplicationContext(MainConfigOfAOP.class);

        //不要自己创建MathCalculator类
        //MathCalculator mathCalculator = new MathCalculator();
        //mathCalculator.div(1, 1);

        MathCalculator mathCalculator = applicationContext.getBean(MathCalculator.class);
        mathCalculator.div(1, 1);

        applicationContext.close();

    }
}
```

8) 运行结果：
```
环绕：方法调用之前----
方法调用之前------
div:正在执行-----
环绕：方法调用之后----
方法调用之后-------
方法成功返回之后------:1
十月 18, 2018 10:03:03 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@3a4afd8d: startup date [Thu Oct 18 22:03:02 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

### 总结：

1. 将业务逻辑组件和切面类都加入到容器中，告诉Spring哪个是切面类(Aspect)  
2. 在切面类上的每一个通知方法上标注通知注解，告诉Spring何时何地运行（切入点表达式）
3. 开启基于注解的AOP模式：@EnableAspectJAutoProxy

