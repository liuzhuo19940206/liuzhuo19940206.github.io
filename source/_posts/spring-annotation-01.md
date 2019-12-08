---
title: spring_annotation_day_01
date: 2018-10-12 21:14:58
tags: spring_annotation
categories: spring_annotation
summary: Spring注解开发的第一天，介绍XML配置和JavaConfig配置的区别  
---
**Spring注解开发**  

今天学习Spring的第一天，大家一起跟着我动手搭建环境，最后一定会有收获。
<!--more-->

开发流程：主要是使用idea来完成的，此教程是针对有spring开发经验的人看的。用来对比以前的配置文件来注入依赖和java类配置来注入依赖的区别。  

打开idea创建Maven工程，输入三个坐标，groupId，artifactId，version。  
我们这里的三个坐标是:  

```
<groupId>com.liuzhuo</groupId>
<artifactId>spring-annotation</artifactId>
<version>1.0-SNAPSHOT</version>
```

创建后的工程如下：
<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day01/20181012212912.png" style="width:300px; heigh:300px"/>

---
现在打开pom.xml文件:添加依赖如下
```java
<dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>5.0.9.RELEASE</version>
        </dependency>
</dependencies>
```
更新pom文件，会自动导入jar包。 

---
在src下的main下的java中创建Person类。我的包名是com.liuzhuo.bean
Person类中主要是两个字段，一个name，一个age，如图:
```java
public class Person {
    private String name;
    private Integer age;

    ···中间省略了无参、有参的构造函数和getter、setter方法以及toString方法.    
}
```
现在在main下的resources下创建bean.xml文件  

```java
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!--以前的开发模式，使用配置文件-->
    <bean id="person" class="com.liuzhuo.bean.Person">
        <property name="name" value="zhangsan"/>
        <property name="age" value="18"/>
    </bean>

</beans>
```
---

现在在com.liuzhuo包下创建MainTest类：  
```java
public class MainTest {

    public static void main(String[] args) {

        //以前的开发模式，使用xml来配置bean
        ClassPathXmlApplicationContext applicationContext = new                			ClassPathXmlApplicationContext("bean.xml");
        Person person = (Person) applicationContext.getBean("person");
        System.out.println(person);

    }
}
```
---
输出结果:就是在配置文件中的配置的person类。

``Person{name='zhangsan', age=18}``

---

现在创建com.liuzhuo.config包，并创建MainConfig类:
```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
public class MainConfig {

    //给容器中注册一个Bean；类型为返回值的类型，id默认为方法名
    @Bean
    public Person person() {
        return new Person("lisi", 16);
    }
}
```
---
修改MainTest类：  
```java
public class MainTest {

    public static void main(String[] args) {

        //以前的开发模式，使用xml来配置bean
        /*ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("bean.xml");
        Person person = (Person) applicationContext.getBean("person");
        System.out.println(person);*/

        //现在使用java类来配置上下文容器
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(MainConfig.class);
        Person person = context.getBean(Person.class);
        System.out.println(person);
    }
}
```
---
输出结果：是MainConfig类中配置Person类(@Bean注解的类) 

``Person{name='lisi', age=16}``

在配置文件类必须使用@Configuration注解，然后再注入自己想要的Bean对象
创建一个方法，使用@Bean注解，返回值就是注入到容器中的Bean类型，默认情况下方法名就是注入到容器中的id。  

@Bean注解()中，可以输入参数，其中就有value来修改Bean的id名，如下：
```java
public class MainConfig {

    //给容器中注册一个Bean；类型为返回值的类型，id默认为方法名
    @Bean(value = "person01") //修改了Bean的id为person01
    public Person person() {
        return new Person("lisi", 16);
    }
}

```

在MainTest文件中输入获取Person类的名字：

```java
  //现在使用java类来配置上下文容器
  AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(MainConfig.class);
  Person person = context.getBean(Person.class);
  System.out.println(person);

  String[] beanNames = context.getBeanNamesForType(Person.class);
  for(String name:beanNames){
	    System.out.println(name);
  }
```

输出结果： 

```java
Person{name='lisi', age=16}
person01
```
说明此时，Bean的id名字是被@Bean(value="person01")给替换了，不再是方法名person了。

