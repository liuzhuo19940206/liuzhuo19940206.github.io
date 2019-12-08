---
title: spring_annotation_day_08
date: 2018-10-16 17:14:28
categories: spring_annotation
tags: spring_annotation
summary: 今天，学习Spring的属性值的自动注入:@Value注解
---
**Spring注解开发**  

今天，学习Spring的自动注入

### @Value注解

使用@Value注解来注入值

1）在com.liuzhuo.config包下，创建新的配置类MainConfigOfProperty：
```java
@Configuration
public class MainConfigOfProperty {

    @Bean
    public Person person() {
        return new Person();
    }
}
```

2）在com.liuzhuo.test包下，创建新的测试类：
```java
public class PropertyTest {

    private AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfigOfProperty.class);

    @Test
    public void test01() {
        printBeanName(applicationContext);
        Person person = (Person) applicationContext.getBean("person");
        System.out.println(person);
        applicationContext.close();
    }

    private void printBeanName(AnnotationConfigApplicationContext applicationContext) {
        String[] names = applicationContext.getBeanDefinitionNames();
        for (String name : names) {
            System.out.println(name);
        }
    }
}
```

3) 运行测试方法：test01
```
org.springframework.context.annotation.internalConfigurationAnnotationProcessor
org.springframework.context.annotation.internalAutowiredAnnotationProcessor
org.springframework.context.annotation.internalRequiredAnnotationProcessor
org.springframework.context.annotation.internalCommonAnnotationProcessor
org.springframework.context.event.internalEventListenerProcessor
org.springframework.context.event.internalEventListenerFactory
mainConfigOfProperty
person
Person{name='null', age=null}
十月 16, 2018 5:34:32 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2ff5659e: startup date [Tue Oct 16 17:34:31 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

我们能看到，打印出来的Person对象的属性都是null。

4）修改Person类
```java
public class Person {

    /*
    * value:
    *     1.使用直接值，比如字符串，数值等
    *     2.使用SpEL表达式，#{}
    *     3.使用${},获取资源文件中的数据
    * */
    @Value("张三")
    private String name;
    @Value("#{20-2}")
    private Integer age;
    
    ·····
}
```

5）再次运行test01：
```
org.springframework.context.annotation.internalConfigurationAnnotationProcessor
org.springframework.context.annotation.internalAutowiredAnnotationProcessor
org.springframework.context.annotation.internalRequiredAnnotationProcessor
org.springframework.context.annotation.internalCommonAnnotationProcessor
org.springframework.context.event.internalEventListenerProcessor
org.springframework.context.event.internalEventListenerFactory
mainConfigOfProperty
person
Person{name='张三', age=18}
十月 16, 2018 5:37:41 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2ff5659e: startup date [Tue Oct 16 17:37:41 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

---

### @PropertySource注解

使用@PropertySource注解来获取资源配置文件中的数据。

1）在resource包下，创建person.properties文件：
```
person.nickName=小张三
```

2) 修改Person类：
添加nickName属性和对应的get、set方法：

```java
public class Person {

    /*
     * value:
     *     1.使用直接值，比如字符串，数值等
     *     2.使用SpEL表达式，#{}
     *     3.使用${},获取资源文件中的数据
     * */
    @Value("张三")
    private String name;
    @Value("#{20-2}")
    private Integer age;
    @Value("${person.nickName}")
    private String nickName;
    
    ·····
}
```

3）在配置文件中，加入资源文件的扫描：
&nbsp;&nbsp;&nbsp;@PropertySource(value = "classpath:person.properties")
```java
@Configuration
@PropertySource(value = "classpath:person.properties")
public class MainConfigOfProperty
```
这里的@PropertySource(value = "classpath:person.properties")，相当于以前在xml中的配置的 
<context:property-placeholder location="person.properties"/>，如下：
```java
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <!--包扫描、只要标注了@Controller、@Service、@Repository、@Component都会自动注入到容器中-->
    <!--<context:component-scan base-package="com.liuzhuo"/>-->

    <!--扫描资源文件-->
    <context:property-placeholder location="person.properties"/>

    <!--以前的开发模式，使用配置文件-->
    <bean id="person" class="com.liuzhuo.bean.Person" init-method="" destroy-method="">
        <property name="name" value="zhangsan"/>
        <property name="age" value="18"/>
    </bean>

</beans>
```
4) 运行test01：
```
mainConfigOfProperty
person
Person{name='张三', age=18, nickName='小张三'}

```

这里的昵称，小张三也打印出来了。