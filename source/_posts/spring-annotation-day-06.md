---
title: spring_annotation_day_06
date: 2018-10-15 20:41:40
categories: spring_annotation
tags: spring_annotation
summary: 今天，学习Bean的生命周期
---
**Spring注解开发**  

今天，学习Bean的生命周期

### Bean的生命周期  

在Spring中Bean的生命周期：
Bean的创建----初始化-----调用-----销毁。

构造(对象的创建)：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;单实例：在容器启动的时候创建对象  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;多实例：在每次获取的时候创建对象 

初始化：
对象创建完成，并赋值好，调用初始化方法

销毁：
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;单实例：容器关闭的时候
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;多实例：容器不会管理这个Bean，容器不会调用销毁方法

以前，我们定义初始化和销毁方法是在xml文件中配置的：
```java
<!--以前的开发模式，使用配置文件-->
<bean id="person" class="com.liuzhuo.bean.Person" init-method="" destroy-method="">
    <property name="name" value="zhangsan"/>
    <property name="age" value="18"/>
</bean>
```

init-method=""    : 定义初始化方法
destroy-method="" : 定义销毁方法  

---

现在，我们可以使用其他方式来完成生命周期。

#### 通过@Bean指定init-method和destroy-method

1）在com.liuzhuo.config包下，创建MainConfigOfLife配置类：
```java
@Configuration
public class MainConfigOfLife {

}
```

2) 在com.liuzhuo.bean包下，创建Car类：
```java
public class Car {

    public Car() {
        System.out.println("Car construct ····");
    }

    //定义初始化方法
    public void init(){
        System.out.println("Car init ·····");
    }

    //定义销毁方法
    public void destory(){
        System.out.println("Car destory ·····");
    }
}
```

3) 将Car注册到容器中：
```java
@Configuration
public class MainConfigOfLife {

    @Bean(initMethod = "init",destroyMethod = "destory")
    public Car car() {
        return new Car();
    }
}
```

4) 在com.liuzhuo.test包下，创建新的测试类(IocOfLifeTest):
```java
public class IocOfLifeTest {

    @Test
    public void test01() {
        AnnotationConfigApplicationContext applicationContext =
                new AnnotationConfigApplicationContext(MainConfigOfLife.class);
        
    }
}
```

5)运行测试test01方法：
```
Car construct ····
Car init ·····
```

说明：单例模式下，容器启动就会将Bean对象注入到容器中，并执行了初始化方法。

想要调用销毁方法，关闭容器就好。
```java
public class IocOfLifeTest {

    @Test
    public void test01() {

        //启动容器
        AnnotationConfigApplicationContext applicationContext =
                new AnnotationConfigApplicationContext(MainConfigOfLife.class);
        //关闭容器
        applicationContext.close();
    }
}
```

运行结果：
```
D:\Java1.8\bin\java
十月 15, 2018 9:08:11 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Mon Oct 15 21:08:11 CST 2018]; root of context hierarchy
Car construct ····
Car init ·····
十月 15, 2018 9:08:11 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Mon Oct 15 21:08:11 CST 2018]; root of context hierarchy
Car destory ·····

Process finished with exit code 0
```

---


#### InitializingBean和DisposableBean

通过让Bean实现InitializingBean和DisposableBean两个接口来定义初始化和销毁。

1）在com.liuzhuo.bean包下，创建Cat类，并实现上述两个接口：
```java
@Component
public class Cat implements InitializingBean, DisposableBean {

    public Cat() {
        System.out.println("Cat constructer ···");
    }

    @Override
    public void destroy() throws Exception {
        System.out.println("Cat destroy ····");
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("Cat afterPropertiesSet ····");
    }
}

```

2) 将Cat类注入到容器中，这里我使用了包扫描:
```java
@Configuration
@ComponentScan(value = "com.liuzhuo")
public class MainConfigOfLife 
```

3) 运行测试方法test01:
```java
public class IocOfLifeTest {

    @Test
    public void test01() {

        //启动容器
        AnnotationConfigApplicationContext applicationContext =
                new AnnotationConfigApplicationContext(MainConfigOfLife.class);

        Object cat = applicationContext.getBean("cat");
        //关闭容器
        applicationContext.close();
    }
}
```

4) 结果：

```
十月 15, 2018 9:21:42 下午 org.springframework.beans.factory.support.DefaultListableBeanFactory registerBeanDefinition
信息: Overriding bean definition for bean 'person' with a different definition: replacing [Generic bean: class [com.liuzhuo.bean.Person]; scope=singleton; abstract=false; lazyInit=false; autowireMode=0; dependencyCheck=0; autowireCandidate=true; primary=false; factoryBeanName=null; factoryMethodName=null; initMethodName=null; destroyMethodName=null; defined in file [E:\ideaProject\springannotation\target\classes\com\liuzhuo\bean\Person.class]] with [Root bean: class [null]; scope=; abstract=false; lazyInit=true; autowireMode=3; dependencyCheck=0; autowireCandidate=true; primary=false; factoryBeanName=mainConfig2; factoryMethodName=person; initMethodName=null; destroyMethodName=(inferred); defined in class path resource [com/liuzhuo/config/MainConfig2.class]]
Cat constructer ···
Cat afterPropertiesSet ····
Car construct ····
Car init ·····
十月 15, 2018 9:21:43 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Mon Oct 15 21:21:42 CST 2018]; root of context hierarchy
Car destory ·····
Cat destroy ····
```

---

#### JSR250:@PostConstruct和@PreDestory

@PostConstruct: 在bean创建完成并且属性赋值完成，来执行初始化方法
@PreDestory：&nbsp;&nbsp;在容器销毁bean之前通知我们进行清理工作

1) 在com.liuzhuo.bean包下，创建Dog类：
```java
@Component
public class Dog {

    public Dog() {
        System.out.println("Dog construct ····");
    }

    //在构造函数之后
    @PostConstruct
    public void init() {
        System.out.println("Dog @PostConstruct ····");
    }

    //在销毁之前
    @PreDestroy
    public void destory() {
        System.out.println("Dog @PreDestroy ····");
    }
}
```

2) 运行测试类test01:
```java
public class IocOfLifeTest {

    @Test
    public void test01() {

        //启动容器
        AnnotationConfigApplicationContext applicationContext =
                new AnnotationConfigApplicationContext(MainConfigOfLife.class);

        applicationContext.getBean("dog");
        
        //关闭容器
        applicationContext.close();
    }
}
```

3) 结果：
```
十月 15, 2018 9:35:11 下午 org.springframework.beans.factory.support.DefaultListableBeanFactory registerBeanDefinition
信息: Overriding bean definition for bean 'person' with a different definition: replacing [Generic bean: class [com.liuzhuo.bean.Person]; scope=singleton; abstract=false; lazyInit=false; autowireMode=0; dependencyCheck=0; autowireCandidate=true; primary=false; factoryBeanName=null; factoryMethodName=null; initMethodName=null; destroyMethodName=null; defined in file [E:\ideaProject\springannotation\target\classes\com\liuzhuo\bean\Person.class]] with [Root bean: class [null]; scope=; abstract=false; lazyInit=true; autowireMode=3; dependencyCheck=0; autowireCandidate=true; primary=false; factoryBeanName=mainConfig2; factoryMethodName=person; initMethodName=null; destroyMethodName=(inferred); defined in class path resource [com/liuzhuo/config/MainConfig2.class]]
Cat constructer ···
Cat afterPropertiesSet ····
Dog construct ····
Dog @PostConstruct ····
Car construct ····
Car init ·····
十月 15, 2018 9:35:12 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Mon Oct 15 21:35:11 CST 2018]; root of context hierarchy
Car destory ·····
Dog @PreDestroy ····
Cat destroy ····
```

---


#### BeanPostProcessor

BeanPostProcessor: bean后置处理器（意思是bean初始化前后执行）

postProcessBeforeInitialization：在初始化之前执行，这里是初始化指：上述的init-method、InitializingBean、@PostConstruct。

postProcessAfterInitialization：在初始化之后执行。

---

1）在com.liuzhuo.bean包下，创建MyBeanPostProcessor并实现BeanPostProcessor接口
```java
@Component
public class MyBeanPostProcessor implements BeanPostProcessor {

    //初始化之前执行
    /**
     * @param bean     容器创建的Bean
     * @param beanName bean的id
     * @return
     * @throws BeansException
     */
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {

        System.out.println(beanName + "------postProcessBeforeInitialization");
        //返回值是原始的Bean，或者是包装后的Bean
        return bean;
    }

    //初始化之后执行
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println(beanName + "------postProcessAfterInitialization");
        return bean;
    }
}
```

3) 运行测试方法test01：
```java
public class IocOfLifeTest {

    @Test
    public void test01() {

        //启动容器
        AnnotationConfigApplicationContext applicationContext =
                new AnnotationConfigApplicationContext(MainConfigOfLife.class);

        applicationContext.getBean("dog");

        //关闭容器
        applicationContext.close();
    }
}
```

4) 结果：
```
mainConfigOfLife------postProcessBeforeInitialization
mainConfigOfLife------postProcessAfterInitialization
Cat constructer ···
cat------postProcessBeforeInitialization
Cat afterPropertiesSet ····
cat------postProcessAfterInitialization
Dog construct ····
dog------postProcessBeforeInitialization
Dog @PostConstruct ····
dog------postProcessAfterInitialization
Car construct ····
car------postProcessBeforeInitialization
Car init ·····
car------postProcessAfterInitialization
Car destory ·····
Dog @PreDestroy ····
Cat destroy ····
十月 15, 2018 9:57:03 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Mon Oct 15 21:57:03 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

分析： 
Cat constructer ···  
cat------postProcessBeforeInitialization  
Cat afterPropertiesSet ····  
cat------postProcessAfterInitialization    
Cat destroy ····  

**构造--初始化之前--初始化--初始化之后--销毁**