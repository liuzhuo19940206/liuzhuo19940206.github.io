---
title: spring_annotation_day_09
date: 2018-10-16 21:09:27
categories: spring_annotation
tags: spring_annotation
summary: Spring的自动装配:@Autowired注解、@Resource注解、@Inject注解
---
**Spring注解开发**  

Spring的自动装配：  

Spring利用依赖注入(DI)，完成对IoC容器中各个组件的依赖关系赋值。

### @Autowired注解

1）在com.liuzhuo.config包下，创建新的类MainConfigOfAutowired：
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;并扫描三个包.
```java
@Configuration
@ComponentScan(value = {"com.liuzhuo.controller", "com.liuzhuo.service", "com.liuzhuo.dao"})
public class MainConfigOfAutowired {

}
```

2) 修改BookService类：
```java
@Service
public class BookService {

    @Autowired
    private BookDao bookDao;

    public BookService() {
    }

    @Override
    public String toString() {
        return "BookService{" +
                "bookDao=" + bookDao +
                '}';
    }
}
```

3) 修改BookDao类：
```java
@Repository
public class BookDao {

    private Integer laber = 1;

    public BookDao() {
    }

    public BookDao(Integer laber) {
        this.laber = laber;
    }

    @Override
    public String toString() {
        return "BookDao{" +
                "laber=" + laber +
                '}';
    }
}

```

4) 创建新的测试类IocTest_Autowired：
```java
public class IocTest_Autowired {

    @Test
    public void test01() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfigOfAutowired.class);
        BookService bookService = applicationContext.getBean(BookService.class);
        System.out.println(bookService);
        applicationContext.close();
    }
}
```

5) 运行：
```
十月 16, 2018 9:20:48 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:20:48 CST 2018]; root of context hierarchy
BookService{bookDao=BookDao{laber=1}}
十月 16, 2018 9:20:48 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:20:48 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

看到，BookService对象中的BookDao对象也注入进来了。

---

当我们有多个相同类型的对象时，会注入哪个对象呢？

1）我们在配置文件MainConfigOfAutowired中添加先的BookDao对象：
```java
@Configuration
@ComponentScan(value = {"com.liuzhuo.controller", "com.liuzhuo.service", "com.liuzhuo.dao"})
public class MainConfigOfAutowired {

    @Bean
    public BookDao bookDao2() {
        return new BookDao(2);
    }
}
```

2）运行测试：
```
十月 16, 2018 9:27:35 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:27:35 CST 2018]; root of context hierarchy
十月 16, 2018 9:27:36 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
BookService{bookDao=BookDao{laber=1}}
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:27:35 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

**结果不变，说明有多个相同类型时，注入到容器中的对象是与@AutoWired下面属性的名字相同的id的Bean对象。**

3）验证我们的结论，修改BookService类下的属性BookDao的属性名字：
```java
@Service
public class BookService {

    @Autowired
    private BookDao bookDao2;

    public BookService() {
    }

    @Override
    public String toString() {
        return "BookService{" +
                "bookDao=" + bookDao2 +
                '}';
    }
}
```

4) 运行测试：
```
十月 16, 2018 9:30:54 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:30:54 CST 2018]; root of context hierarchy
十月 16, 2018 9:30:54 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
BookService{bookDao=BookDao{laber=2}}

信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:30:54 CST 2018]; root of context hierarchy

Process finished with exit code 0
```
验证正确，说明注入的Bean是与属性的名字相同的对象。

---

除了，上述的方法来处理多个相同类型的对象。我们还可以使用 @Qualifier来指定注入容器中的Bean的id名。

1）修改BookService类：

```java
@Service
public class BookService {
    
    @Autowired
    @Qualifier("bookDao")
    private BookDao bookDao2;

    public BookService() {
    }

    @Override
    public String toString() {
        return "BookService{" +
                "bookDao=" + bookDao2 +
                '}';
    }
}
```
2) 测试：
```
十月 16, 2018 9:34:12 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:34:12 CST 2018]; root of context hierarchy
十月 16, 2018 9:34:12 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:34:12 CST 2018]; root of context hierarchy
BookService{bookDao=BookDao{laber=1}}

Process finished with exit code 0
```

此时注入容器中的BookDao对象就是@Qualifier("bookDao")注解的对象，而不是bookDao2了。

---

默认情况下，@Autowired注解的属性，必须要在容器中已经注入了，否则会报错。

1）将刚刚的两个BookDao对象都注释掉。

2）运行测试：
```
十月 16, 2018 9:38:48 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:38:48 CST 2018]; root of context hierarchy
十月 16, 2018 9:38:48 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext refresh
警告: Exception encountered during context initialization - cancelling refresh attempt: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'bookService': Unsatisfied dependency expressed through field 'bookDao2'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.liuzhuo.dao.BookDao' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}

org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'bookService': Unsatisfied dependency expressed through field 'bookDao2'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.liuzhuo.dao.BookDao' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
···


Process finished with exit code -1
```

#### required属性

我们也可以使@Autowired注解的属性，不是必须的，即使容器中没有该Bean，也不会报错！
因为@Autowired注解里面有一个属性 boolean required() default true;  
将required设置为：false

```java
@Service
public class BookService {

    //@Qualifier("bookDao")
    @Autowired(required = false)
    private BookDao bookDao2;

    public BookService() {
    }

    @Override
    public String toString() {
        return "BookService{" +
                "bookDao=" + bookDao2 +
                '}';
    }
}
```

运行：
```
十月 16, 2018 9:43:23 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:43:23 CST 2018]; root of context hierarchy
十月 16, 2018 9:43:24 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:43:23 CST 2018]; root of context hierarchy
BookService{bookDao=null}

Process finished with exit code 0
```

此时不报错了。默认情况下，必须给@Autowired注解的属性，注入到容器中。

---

#### @primary注解

@primary注解：使用这个注解，就是当有多个类型的情况下，优先注入的bean对象：

1) 修改配置文件：

```java
@Configuration
@ComponentScan(value = {"com.liuzhuo.controller", "com.liuzhuo.service", "com.liuzhuo.dao"})
public class MainConfigOfAutowired {

    @Primary
    @Bean(value = "bookDao2")
    public BookDao bookDao() {
        return new BookDao(2);
    }
}

```

2) 修改BookService：注释掉@Qualifier("bookDao")
```java
@Service
public class BookService {

    //@Qualifier("bookDao")
    @Autowired(required = false)
    private BookDao bookDao;

    public BookService() {
    }

    @Override
    public String toString() {
        return "BookService{" +
                "bookDao=" + bookDao +
                '}';
    }
}
```

3) 运行测试：
```
十月 16, 2018 9:47:44 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:47:44 CST 2018]; root of context hierarchy
BookService{bookDao=BookDao{laber=2}}
十月 16, 2018 9:47:44 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:47:44 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

此时，输出的是laber=2的BookDao对象了，不再根据@Autowired注解下的属性名来注入到容器中了。

4）将BookService中的@Qualifier("bookDao")的注释去掉：
```java
@Service
public class BookService {

    @Qualifier("bookDao")
    @Autowired(required = false)
    private BookDao bookDao;

    public BookService() {
    }

    @Override
    public String toString() {
        return "BookService{" +
                "bookDao=" + bookDao +
                '}';
    }
}
```

5) 运行测试：
```
十月 16, 2018 9:51:00 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:51:00 CST 2018]; root of context hierarchy
BookService{bookDao=BookDao{laber=1}}
十月 16, 2018 9:51:00 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 21:51:00 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

**说明：当@Primary和@Qualifier同时存在时，是以@Qualifier为标准的！**

---

### @Resource注解

1）修改BookService类：
```java
@Service
public class BookService {

    //@Qualifier("bookDao")
    //@Autowired(required = false)
    @Resource
    private BookDao bookDao;

    public BookService() {
    }

    @Override
    public String toString() {
        return "BookService{" +
                "bookDao=" + bookDao +
                '}';
    }
}
```

2) 运行：
```
十月 16, 2018 10:09:41 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 22:09:41 CST 2018]; root of context hierarchy
十月 16, 2018 10:09:41 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 22:09:41 CST 2018]; root of context hierarchy
BookService{bookDao=BookDao{laber=1}}

Process finished with exit code 0
```

此时，输出的是laber=1的bookService对象，说明@primary注解没有起作用。
@Resource注解，默认是注入属性的名。也可以通过@Resource的name属性来修改需要注入到容器中的Bean对象。

```java
@Service
public class BookService {

    //@Qualifier("bookDao")
    //@Autowired(required = false)
    @Resource(name = "bookDao2")
    private BookDao bookDao;

    public BookService() {
    }

    @Override
    public String toString() {
        return "BookService{" +
                "bookDao=" + bookDao +
                '}';
    }
}
```

运行：
```
十月 16, 2018 10:13:02 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 22:13:02 CST 2018]; root of context hierarchy
BookService{bookDao=BookDao{laber=2}}
十月 16, 2018 10:13:02 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 22:13:02 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

---

### @Inject注解


@Inject注解：需要导入javax.inject包。

1）在pom文件中添加依赖：
```
<dependency>
    <groupId>javax.inject</groupId>
    <artifactId>javax.inject</artifactId>
    <version>1</version>
</dependency>
```

2) 修改BookService类：

```java
@Service
public class BookService {

    //@Qualifier("bookDao")
    //@Autowired(required = false)
    //@Resource(name = "bookDao2")
    @Inject
    private BookDao bookDao;

    public BookService() {
    }

    @Override
    public String toString() {
        return "BookService{" +
                "bookDao=" + bookDao +
                '}';
    }
}
```

3) 运行：
```
十月 16, 2018 10:16:52 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 22:16:52 CST 2018]; root of context hierarchy
十月 16, 2018 10:16:52 下午 org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor <init>
信息: JSR-330 'javax.inject.Inject' annotation found and supported for autowiring
BookService{bookDao=BookDao{laber=2}}
十月 16, 2018 10:16:52 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Tue Oct 16 22:16:52 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

输出的是laber=2的BookService对象，说明支持@primary注解。

---

### 总结：

1）@Autowired：自动注入  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.1）、默认优先按照类型去容器中找对应的组件。  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.2）、如果找到多个相同类型的组件，再将属性的名称作为组件的id去容器中查找  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.3）、@Qualifier：使用@Qualifier指定需要装配的组件的id，而不使用属性名  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.4）、自动装配默认是一定将属性赋值好，没有就报错。可以使用@Autowired(required=false)。  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.5）、@Primary:当存在多个同类型的Bean时，优先装配的Bean，优先级没有@Qualifier高。  

2）Spring还支持使用@Resource(JSR250)和@Inject(JSR330)[java规范的注解]  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@Resource：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;可以和@Autowired一样实现自动装配功能，默认是按照组件名称进行装配的。  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;不支持@primary功能和@Autowired(required=false)功能，但是有@Resource(name = "bookDao2")修改注入容器Bean的id的功能。  

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@Inject：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;需要导入javax.inject包，和@Autowired的功能一样，但是没有required=false的功能。

3）@Autowired是Spring定义的，只能在有Spring的环境时才有作用，@Resource和@Inject注解是java规范，只要是满足java规范的都可以使用，意思就是跨框架性更好。

4）上述自动注入都是通过AutowiredAnnotationBeanPostProcessor这个后置处理器完成。
