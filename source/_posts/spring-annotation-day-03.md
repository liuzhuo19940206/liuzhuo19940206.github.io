---
title: spring_annotation_day_03
date: 2018-10-14 11:18:11
categories: spring_annotation
tags: spring_annotation
summary: 今天，学习Spring中的@Scope注解、懒加载
---
**Spring注解开发**  

今天，学习Spring中的@Scope注解
<!--more-->

### @Scope注解

@Scope注解：是用来控制创建对象的作用域的，这里的作用域不是我们平时所说的作用域。  
这里是：单例模式、多例模式等。  

现在创建新的配置类com.liuzhuo.config.MainConfig2:

```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
public class MainConfig2 {

    @Bean("person")
    public Person person() {
        return new Person("dengjie", 18);
    }

}
```

在测试类IocTest中创建新的测试方法，test02：

```java
    @Test
    public void test02() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig2.class);
        //获取所有已经注入到容器中的Bean的id.
        String[] beanDefinitionNames = applicationContext.getBeanDefinitionNames();
        for (String name : beanDefinitionNames) {
            System.out.println(name);
        }
    }
```

输出结果：

```
mainConfig2
person
```
---

现在我们修改配置类MainConfig2：
使用@Scope注解（作用域的功能）

@Scope可以使用四个值：  
1.singleton：单例模式（**默认值**）  
2.prototype：多例模式  
3.request  ：一个request请求，创建一个新的实例  
4.session  ：一个session请求，创建一个新的实例 

在配置类下的person方法上加入@Scope注解：   

```java
@Configuration   //告诉spring这是一个配置类，用来生成bean
public class MainConfig2 {

    @Scope
    @Bean("person")
    public Person person() {
        return new Person("dengjie", 18);
    }

}
```

现在修改test02测试方法，测试person是否是单例：

```java
    @Test
    public void test02() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig2.class);
        //获取所有已经注入到容器中的Bean的id.
        /*String[] beanDefinitionNames = applicationContext.getBeanDefinitionNames();
        for (String name : beanDefinitionNames) {
            System.out.println(name);
        }*/

        Object person = applicationContext.getBean("person");
        Object person2 = applicationContext.getBean("person");
        System.out.println(person == person2);
    }
```

输出结果：true。注意：**此时已经加载的是配置文件2了！！！**
说明@Scope默认是单例模式。

---

现在修改成多例模式：

```java
@Configuration   //告诉spring这是一个配置类，用来生成bean
public class MainConfig2 {

    @Scope(value = "prototype")
    @Bean("person")
    public Person person() {
        return new Person("dengjie", 18);
    }

}
```

运行测试方法test02：输出false。
说明：现在是多例模式。

---

### 懒加载

修改配置类，在person方法中加入一句输出语句。

```java
@Configuration   //告诉spring这是一个配置类，用来生成bean
public class MainConfig2 {

    @Scope(value = "singleton")
    @Bean("person")
    public Person person() {
        System.out.println("加载person类到容器中~~~");
        return new Person("dengjie", 18);
    }

}
```

修改测试类：
```java
    @Test
    public void test02() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig2.class);
    }
```

运行测试方法：

```java
D:\Java1.8\bin\java -ea -Didea.test.cyclic.buffer.size=1048576 
加载person类到容器中~~~
true

Process finished with exit code 0
```

此时虽然只加载了容器类，但是person还是被加载到了容器中。   
说明单例模式下，注入到容器中的类是立即注入的。不用到使用person类才注入到容器中来。

---

现在将单例变成多例模式，不改测试方法。
```java
@Configuration   //告诉spring这是一个配置类，用来生成bean
public class MainConfig2 {

    @Scope(value = "prototype")
    @Bean("person")
    public Person person() {
        System.out.println("加载person类到容器中~~~");
        return new Person("dengjie", 18);
    }

}
```

**此时啥也不输出！！!**

现在修改测试方法：

```java
    @Test
    public void test02() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig2.class);
      
        Object person = applicationContext.getBean("person");
        Object person2 = applicationContext.getBean("person");
        System.out.println(person == person2);
    }
```

输出结果：
```
加载person类到容器中~~~
加载person类到容器中~~~
false
```

说明：多例是懒加载，只有等到获取person对象时，才会将person注入到容器中。

---

### @Lazy

使用@Lazy注解来控制是否是懒加载。

修改配置类：
```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
public class MainConfig2 {

    @Scope
    @Lazy
    @Bean("person")
    public Person person() {
        System.out.println("加载person类到容器中~~~");
        return new Person("dengjie", 18);
    }

}
```

修改测试方法：
```java
    @Test
    public void test02() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig2.class);
    }
```

运行测试方法：啥也不输出，说明此时已经是懒加载了。

---

修改测试方法：
```java
    @Test
    public void test02() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig2.class);

        Object person = applicationContext.getBean("person");
        Object person2 = applicationContext.getBean("person");
        System.out.println(person == person2);
    }
```

运行测试方法：
```
加载person类到容器中~~~
true
```

此时是到使用person对象时，才会加载。并且只是加载了一次，因为是单例模式。