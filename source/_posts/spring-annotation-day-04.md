---
title: spring_annotation_day_04
date: 2018-10-14 19:47:13
categories: spring_annotation
tags: spring_annotation
summary: 今天，学习条件注解！！！这个很重要、很重要、很重要！
---
**Spring注解开发**  

今天，学习条件注解！！！这个注解很重要，对以后大家学习Springboot很有帮助。
<!--more-->

### @Conditional

作用：按照一定的条件进行判断，满足条件的bean给注入到容器中  

现在我们的需求的是根据操作系统的类型来，注入给定的bean对象。

在MainConfig2配置类中，再添加两个新方法：
```java
    @Bean("bier")
    public Person person01() { //如果是windows系统就注入到容器中
        return new Person("Bier", 16);
    }

    @Bean("linux")
    public Person person02() { //如果是Linux系统就注入到容器中
        return new Person("Linux", 18);
    }
```

在测试类中，创建新的test03方法:
```java
    @Test
    public void test03() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig2.class);
        //根据Bean类来获取所有的Bean类的id名字
        String[] beanNamesForType = applicationContext.getBeanNamesForType(Person.class);
        for (String name : beanNamesForType) {
            System.out.println(name);
        }
        //根据Bean类来获取Map结构
        Map<String, Person> beansOfType = applicationContext.getBeansOfType(Person.class);
        System.out.println(beansOfType);

    }
```

输出结果：
```
D:\Java1.8\bin\java  
person
bier
linux
加载person类到容器中~~~
{person=Person{name='dengjie', age=18}, bier=Person{name='Bier', age=16}, linux=Person{name='Linux', age=18}}

Process finished with exit code 0
```

此时：获取了所有的person类的Bean的id的名字。

---

现在，我们创建com.liuzhuo.conditaion包，并创建两个实现了condition接口的类。如下：

<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day04/20181014203017.png" style="width:50%"> 


WinCondition类：
```java
public class WinCondition implements Condition {
    /*
     * conditionContext：     条件上下文（获取我们需要的资源）
     * annotatedTypeMetadata：注解类型的信息
     * */
    @Override
    public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata annotatedTypeMetadata) {

        //获取beanFactory工厂
        ConfigurableListableBeanFactory beanFactory = conditionContext.getBeanFactory();
        //获取加载类
        ClassLoader classLoader = conditionContext.getClassLoader();
        //获取注解类
        BeanDefinitionRegistry registry = conditionContext.getRegistry();
        //获取环境变量
        Environment environment = conditionContext.getEnvironment();
        //获取资源加载类
        ResourceLoader resourceLoader = conditionContext.getResourceLoader();

        /*
        * 创建如果是windows系统的话，就注入到容器中
        * */
        String property = environment.getProperty("os.name");
        if (property.contains("Windows")) return true;
        return false;
    }
}
```

LinuxCondition类：
```java
public class LinuxCondition implements Condition {
    @Override
    public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata annotatedTypeMetadata) {

        Environment environment = conditionContext.getEnvironment();
        String property = environment.getProperty("os.name");
        if (property.contains("Linux")) return true;
        return false;
    }
}
```

修改配置类：给刚刚创建的两个方法添加@Conditional注解

```java
    @Conditional({WinCondition.class})
    @Bean("bier")
    public Person person01() { //如果是windows系统就注入到容器中
        return new Person("Bier", 16);
    }

    @Conditional({LinuxCondition.class})
    @Bean("linux")
    public Person person02() { //如果是Linux系统就注入到容器中
        return new Person("Linux", 18);
    }
```

输出结果：
```
person
bier
加载person类到容器中~~~
{person=Person{name='dengjie', age=18}, bier=Person{name='Bier', age=16}}
Windows 10

Process finished with exit code 0
```

看到结果：现在作者的操作系统是windows系统，所以现在是bier给注入到容器中了。

现在修改操作系统的类型。

修改test03的运行环境，在idea的右上角点击 "Edit Configrations···" :

<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day04/20181014204146.png" style="width:50%">

编辑里面的 VM options: ``-Dos.name=Linux ``

然后运行test03.
```
person
linux
加载person类到容器中~~~
{person=Person{name='dengjie', age=18}, linux=Person{name='Linux', age=18}}
Linux

Process finished with exit code 0
```

此时，注入到容器中的是linux。

---

总结：@Conditional注解是用来按照一定的条件进行判断，满足条件给容器中注入bean。  
点击@Conditional：
```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Conditional {
    Class<? extends Condition>[] value();
}
```

说明@Conditional里面是Condition>[] value()数组。我们需要在@Conditional的value中写入数组。数组需要使用｛｝来写。传入的是实现了Condition接口的类。比如这里的WinCondition、LinuxCondition类。
实例：@Conditional({WinCondition.class})、@Conditional({LinuxCondition.class})。

@Conditional，不仅可以放在方法上面，还可以是类上面。  
放在类上面，就是对这个类统一设置。