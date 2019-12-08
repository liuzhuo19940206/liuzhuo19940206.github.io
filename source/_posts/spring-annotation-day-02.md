---
title: spring_annotation_day_02
date: 2018-10-13 12:37:23
categories: spring_annotation
tags: spring_annotation
summary: 今天来学习Spring-annotation的包扫描功能
---
**Spring注解开发**  

今天，学习包扫描的功能。
<!--more-->

接着day01天的内容，我们知道怎么使用java类来配置并初始化容器了，使用@Configuration注解来标记一个java类就等同于了bean.xml文件了。

接下来，我们看看包扫描怎么配置，因为我们不可能给每个类都使用@Bean来配置，那样太花时间和精力，所以我们需要包扫描的配置，来自动帮我们把需要的bean对象注入到容器中。

### 一：xml版的包扫描
----
注意：这里在Bean.xml文件中需要配置命名空间,加上context的命名空间.
```java
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
         http://www.springframework.org/schema/beans
         http://www.springframework.org/schema/beans/spring-beans.xsd
         http://www.springframework.org/schema/context
         http://www.springframework.org/schema/context/spring-context.xsd">
```

主要加入了xmlns:context=···· 和 xsi: 中的两个context (看结尾) .

bean.xml配置文件加入了：
```java
    <!--包扫描、只要标注了@Controller、@Service、@Repository、@Component都会自动注入到容器中-->
    <!-- base-package包名，在该包下的子包也会被扫描-->
    <context:component-scan base-package="com.liuzhuo"/>
```
现在将bean.xml中的person配置添加注释，让其失效。
```java
    <!--以前的开发模式，使用配置文件-->
    <!--<bean id="person" class="com.liuzhuo.bean.Person">
        <property name="name" value="zhangsan"/>
        <property name="age" value="18"/>
    </bean>-->
```

在Person类上面加入@Component注解。
```java
@Component
public class Person 
```

运行MainTest测试类：
```java
  ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("bean.xml");
  Person person = (Person) applicationContext.getBean("person");
  System.out.println(person);
```

输出:

`Person{name='null', age=null}`  

说明包扫描成功!

---

### 二：java类版的包扫描  

---

首先将xml版本中的包扫描注解掉。

在java配置类上加入``@ComponentScan(value = "com.liuzhuo")``
value：就是要扫描的具体包的路径。

```java
	//配置类==配置文件
	@Configuration   //告诉spring这是一个配置类，用来生成bean
	@ComponentScan(value = "com.liuzhuo") //包扫描
	public class MainConfig {
	   ·····
	}
```

创建``com.liuzhuo.controller``、``com.liuzhuo.service``、``com.liuzhuo.dao包``
并创建相应的java类，BookController，BookService，BookDao。如下：

<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day02/20181013170247.png" style="width:50%;">  

并在相应的类上面标注相应的注解。

```java
@Controller
public class BookController {
}
-----------------------------
@Service
public class BookService {
}
-----------------------------
@Repository
public class BookDao {
}
```
主要是@Controller、@Service、@Repository三个注解。  

现在在test文件夹下面的jave包下创建测试类。

com.liuzhuo.test.IocTest类。

并在pom.xml文件中加入依赖
```java
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
        </dependency>
```

在IocTest类中写入一下代码:
```java
public class IocTest {

    @Test
    public void test01() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig.class);
        //获取所有已经注入到容器中的Bean的id.
        String[] beanDefinitionNames = applicationContext.getBeanDefinitionNames();
        for (String name : beanDefinitionNames) {
            System.out.println(name);
        }
    }
}

```
执行test01，结果：
除了spring内置的Bean对象外，主要有以下我们自己定义的Bean对象的id名
```java
mainConfig
bookController
bookDao
bookService
person01
```
---

### 三、@ComponentScan的用法

上面，我们已经初步了解了@ComponentScan包扫描的基本用法了。
点击@ComponentScan注解。我们会看到  

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
@Documented
@Repeatable(ComponentScans.class)
public @interface ComponentScan {
    @AliasFor("basePackages")
    String[] value() default {};
    ····
}
```
value这个字段，说明是一个字符串类型的数组。说明value值，我们可以填写多个值，数组的话，用大花括号来表示: ``{ }`` 。每个值用逗号:   ``，`` 来隔开。

ps:提一个小技巧，在idea中，Alt+7可以查看这个类中所有的字段和方法。

我们可以看到其中有一个includeFilters()的字段。
<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day02/20181013173018.png" style="width:50%"/>

ComponentScan.Filter[]  includeFilters()  default {};

看到includeFilters也是一个数组，类型是ComponentScan的内部类Filter。
点击Filter，发现也是一个注解.

```java
    @Retention(RetentionPolicy.RUNTIME)
    @Target({})
    public @interface Filter {
        FilterType type() default FilterType.ANNOTATION;

        @AliasFor("classes")
        Class<?>[] value() default {};

        @AliasFor("value")
        Class<?>[] classes() default {};

        String[] pattern() default {};
    }
```
发现有一个类型和字节码类的字段。

#### 1.includeFilters

现在我们来使用这个includeFilters来在包扫描的时候，只扫描我们相要的类。
```java
@ComponentScan(value = "com.liuzhuo", includeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class})
}) //包扫描
```
type是来说明过滤的类型的，这里的类型是注解``(FilterType.ANNOTATION)``。

```java
public enum FilterType {
    ANNOTATION,
    ASSIGNABLE_TYPE,
    ASPECTJ,
    REGEX,
    CUSTOM;

    private FilterType() {
    }
}
```
总共有以上五个类型。
ANNOTATION：注解类型
ASSIGNABLE_TYPE：赋值类型

----

运行test01类，发现结果还是扫描了所有的注解。
```java
mainConfig
bookController
bookDao
bookService
person01
```
是配置出现问题了嘛？<font color="red">不是，是因为我们忘记了，包扫描，默认的配置是扫描所有，所以，我们只需要将默认的配置设置为false就好了</font>。
useDefaultFilters = false

```java
@Configuration   //告诉spring这是一个配置类，用来生成bean
@ComponentScan(value = "com.liuzhuo", includeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class})
},useDefaultFilters = false) //包扫描
public class MainConfig
```
结果为：
```java
mainConfig
bookController
person01
```

#### 2.excludeFilters

excludeFilters：是和includeFilters对着来的，**是排除哪些类不扫描。**

具体的配置情况如下：
```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
@ComponentScan(value = "com.liuzhuo", excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {Controller.class})
}) //包扫描
public class MainConfig
```
输出结果为：``@Controller注解``的类就没有被扫描。
```
mainConfig
bookDao
bookService
person01
```
#### 3.总结
@ComponentScan value: 指定要扫描的包
jdk1.8中@ComponentScan是可重复的，所以可以写两个@ComponentScan
不过，可以使用@ComponentScans来配置多个@ComponentScan
excludeFilters = Filter[]: 指定扫描的时候按照什么规则排除哪些组件
includeFilters = Filter[]: 指定扫描的时候只需要包含哪些组件
<font color="red">ps: includeFilters , 需要将默认的包扫描设置为false。(useDefaultFilters = false)</font>

---

### 四、详解Filter的类型
```
FilterType.ANNOTATION　　　     按照注解
FilterType.ASSIGNABLE_TYPE     按照给定的类型
FilterType.ASPECTJ　　　　　    使用ASPECTJ表达式
FilterType.REGEX 　　　　　　   使用正则表达式
FilterType.CUSTOM　　　　　     使用自定义的规则
```
更新MainConfig类:

```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
@ComponentScans(value = {
        @ComponentScan(value = "com.liuzhuo", includeFilters = {
                 @ComponentScan.Filter(type = FilterType.ANNOTATION,
                 classes = {Controller.class}) }
                 , useDefaultFilters = false)
        }
)
public class MainConfig
```
现在的输出结果为：(只扫描有@Controller注解的类)
```
mainConfig
bookController
person01
```

现在我们使用FilterType.ASSIGNABLE_TYPE 类型(给定类的类型)

```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
@ComponentScans(value = {
        @ComponentScan(value = "com.liuzhuo", includeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,
                classes = {BookService.class})
        }, useDefaultFilters = false)
})
public class MainConfig 
```
输出结果是：只要是BookService类型的就行，他的子类也行。
```
mainConfig
bookService
person01
```

现在我们使用自定义规则，FilterType.CUSTOM。

需要自己创建一个类并实现TypeFilter接口。(我放在com.liuzhuo.config包)

```java
public class MyTypeFilter implements TypeFilter {
    @Override
    public boolean match(MetadataReader metadataReader,                 
    MetadataReaderFactory metadataReaderFactory) throws IOException {
        return false;
    }
}
```
解释一下：
1.metadataReader  读取到当前正在扫描的类的信息
2.metadataReaderFactory  可以获取到其他任何类信息

我们通过这两个参数可以获取很多当前扫描类的信息。

```java
public class MyTypeFilter implements TypeFilter {
    @Override
    public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) throws IOException {

        //获取当前类的注解信息
        AnnotationMetadata annotationMetadata = metadataReader.getAnnotationMetadata();
        //获取当前正在扫描的类信息
        ClassMetadata classMetadata = metadataReader.getClassMetadata();
        //获取当前类的资源(类的路径)
        Resource resource = metadataReader.getResource();

        String className = classMetadata.getClassName();
        System.out.println("--->" + className);

        return false;
    }
}
```

上述的方法，我们可以打印出被扫描的类的名字；
在此之前，我们还需要修改MainConfig配置类：
将Filter类型改为自定义类型。
```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
@ComponentScans(value = {
        @ComponentScan(value = "com.liuzhuo", includeFilters = {
                @ComponentScan.Filter(type = FilterType.CUSTOM, classes = 
                                      {MyTypeFilter.class})
                }, useDefaultFilters = false)
})
public class MainConfig 
```
运行test01测试类：
结果如下：
```java
--->com.liuzhuo.test.IocTest
--->com.liuzhuo.bean.Person
--->com.liuzhuo.config.MyTypeFilter
--->com.liuzhuo.controller.BookController
--->com.liuzhuo.dao.BookDao
--->com.liuzhuo.MainTest
--->com.liuzhuo.service.BookService
```

现在我们的MyTypeFilter返回都是false，所以被注入到容器的是
mainConfig
person01


现在，我们来更改MyTypeFilter类，我们只注入类名包含‘er’的类。
```java
public class MyTypeFilter implements TypeFilter {
    @Override
    public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) throws IOException {

        //获取当前类的注解信息
        AnnotationMetadata annotationMetadata = metadataReader.getAnnotationMetadata();
        //获取当前正在扫描的类信息
        ClassMetadata classMetadata = metadataReader.getClassMetadata();
        //获取当前类的资源(类的路径)
        Resource resource = metadataReader.getResource();

        String className = classMetadata.getClassName();
        System.out.println("--->" + className);

        if (className.contains("er")) return true;
        return false;
    }
}

```
其实就是加了一句代码：
`if (className.contains("er")) return true;`

运动test01测试类：
```
mainConfig
person
myTypeFilter
bookController
bookService
person01
```
除了本来的mainConfig、person01是配置文件帮我注入的。
其他的注入的类都是类名包含‘er’的。

**ps：都是在包扫描@ComponentScan(value = "com.liuzhuo")**
**com.liuzhuo包下的'er'.**