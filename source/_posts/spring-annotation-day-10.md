---
title: spring_annotation_day_10
date: 2018-10-17 14:00:36
categories: spring_annotation
tags: spring_annotation
summary: 使用Spring容器底层的一些组件
---
**Spring注解开发**  

今天来学习，自定义组件想要使用Spring容器底层的一些组件来开发(ApplicationContext,BeanFactory,xxx)  


自定义组件实现xxxAware，在创建对象的时候，会调用接口规定的方法注入相关组件，Aware会把Spring底层的一些组件注入到自定义的Bean中。

xxxAware:功能使用xxxAwareProcessor现实的，比如：ApplicationContextAware是用ApplicationContextAwareProcessor注入的。

### ApplicationContextAware

1）在com.liuzhuo.bean包，随便找个Bean来实验：

这里使用Red类来实验：
```java
@Component
public class Red implements ApplicationContextAware {

    private ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
        System.out.println("容器:" + applicationContext.toString());
    }
}
```

2）将Red类注入到容器中，使用包扫描，修改MainConfigOfAutowired配置类：
**加入了com.liuzhuo.bean包的扫描**
```java
@Configuration
@ComponentScan(value = {"com.liuzhuo.controller", "com.liuzhuo.service", "com.liuzhuo.dao","com.liuzhuo.bean"})
public class MainConfigOfAutowired
```

3) 运行测试类IocTest_Autowired：
```java
public class IocTest_Autowired {

    @Test
    public void test01() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfigOfAutowired.class);
        applicationContext.close();
    }
}
```
4) 运行结果：
```
org.springframework.context.event.internalEventListenerProcessor------postProcessBeforeInitialization
org.springframework.context.event.internalEventListenerProcessor------postProcessAfterInitialization
org.springframework.context.event.internalEventListenerFactory------postProcessBeforeInitialization
org.springframework.context.event.internalEventListenerFactory------postProcessAfterInitialization
mainConfigOfAutowired------postProcessBeforeInitialization
mainConfigOfAutowired------postProcessAfterInitialization
bookController------postProcessBeforeInitialization
bookController------postProcessAfterInitialization
bookDao2------postProcessBeforeInitialization
bookDao2------postProcessAfterInitialization
bookService------postProcessBeforeInitialization
bookService------postProcessAfterInitialization
bookDao------postProcessBeforeInitialization
bookDao------postProcessAfterInitialization
Cat constructer ···
cat------postProcessBeforeInitialization
Cat afterPropertiesSet ····
cat------postProcessAfterInitialization
Dog construct ····
dog------postProcessBeforeInitialization
Dog @PostConstruct ····
dog------postProcessAfterInitialization
容器:org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Wed Oct 17 14:08:27 CST 2018]; root of context hierarchy
red------postProcessBeforeInitialization
red------postProcessAfterInitialization
Dog @PreDestroy ····
Cat destroy ····
十月 17, 2018 2:08:28 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Wed Oct 17 14:08:27 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

能观察到：

`容器:org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Wed Oct 17 14:08:27 CST 2018]; root of context hierarchy`

说明在Red类中，注入了容器类。

5）验证是否是同一个容器，修改测试方法：
```java
public class IocTest_Autowired {

    @Test
    public void test01() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfigOfAutowired.class);
        System.out.println(applicationContext);
        applicationContext.close();
    }
}
```
6) 运行测试方法：
```
org.springframework.context.event.internalEventListenerProcessor------postProcessBeforeInitialization
org.springframework.context.event.internalEventListenerProcessor------postProcessAfterInitialization
org.springframework.context.event.internalEventListenerFactory------postProcessBeforeInitialization
org.springframework.context.event.internalEventListenerFactory------postProcessAfterInitialization
mainConfigOfAutowired------postProcessBeforeInitialization
mainConfigOfAutowired------postProcessAfterInitialization
bookController------postProcessBeforeInitialization
bookController------postProcessAfterInitialization
bookDao2------postProcessBeforeInitialization
bookDao2------postProcessAfterInitialization
bookService------postProcessBeforeInitialization
bookService------postProcessAfterInitialization
bookDao------postProcessBeforeInitialization
bookDao------postProcessAfterInitialization
Cat constructer ···
cat------postProcessBeforeInitialization
Cat afterPropertiesSet ····
cat------postProcessAfterInitialization
Dog construct ····
dog------postProcessBeforeInitialization
Dog @PostConstruct ····
dog------postProcessAfterInitialization
容器:org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Wed Oct 17 14:14:10 CST 2018]; root of context hierarchy
red------postProcessBeforeInitialization
red------postProcessAfterInitialization
十月 17, 2018 2:14:11 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Wed Oct 17 14:14:10 CST 2018]; root of context hierarchy
org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Wed Oct 17 14:14:10 CST 2018]; root of context hierarchy
Dog @PreDestroy ····
Cat destroy ····

Process finished with exit code 0
```

观察到：
容器:

``org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: ``

``org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf:``

一样，都是@2f410acf，说明是一个容器。

---

### BeanNameAware

给自定义组件，注入自己在容器的id名。

1）修改Red类：
```java
@Component
public class Red implements ApplicationContextAware,BeanNameAware {

    private ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
        System.out.println("容器:" + applicationContext.toString());
    }

    @Override
    public void setBeanName(String name) {
        System.out.println("自定义组件的id名字："+name);
    }
}
```

2) 运行测试方法：
```java
自定义组件的id名字：red
容器:org.springframework.context.annotation.AnnotationConfigApplicationContext@2f410acf: startup date [Wed Oct 17 14:21:56 CST 2018]; root of context hierarchy
red------postProcessBeforeInitialization
red------postProcessAfterInitialization
```

**总结：**

想让自定义组件使用Spring底层的组件，就实现xxxAware接口就行。

ApplicationContextAware  
ApplicationEventPublisherAware
BeanClassLoaderAware
BeanFactoryAware
BeanNameAware
BootstrapContextAware
EmbeddedValueResolverAware
EnvironmentAware
ImportAware
LoadTimeWeaverAware
MessageSourceAware
NotificationPublisherAware
PortletConfigAware
PortletContextAware
ResourceLoaderAware
SchedulerContextAware
ServletConfigAware
ServletContextAware

---

### 原理：

1）在Red类下的setApplicationContext方法上面打上断点

2) 运行测试方法：

发现ApplicationContextAware是由ApplicationContextAwareProcessor处理的：
```java
 @Override
	public Object postProcessBeforeInitialization(final Object bean, String beanName) throws BeansException {
		AccessControlContext acc = null;

		if (System.getSecurityManager() != null &&
				(bean instanceof EnvironmentAware || bean instanceof EmbeddedValueResolverAware ||
						bean instanceof ResourceLoaderAware || bean instanceof ApplicationEventPublisherAware ||
						bean instanceof MessageSourceAware || bean instanceof ApplicationContextAware)) {
			acc = this.applicationContext.getBeanFactory().getAccessControlContext();
		}

		if (acc != null) {
			AccessController.doPrivileged(new PrivilegedAction<Object>() {
				@Override
				public Object run() {
					invokeAwareInterfaces(bean);
					return null;
				}
			}, acc);
		}
		else {
			invokeAwareInterfaces(bean);
		}

		return bean;
	}
```

内部执行postProcessBeforeInitialization方法来判断自定义的组件是否实现类xxxAware接口。

最后调用invokeAwareInterfaces(bean)方法

```java
	private void invokeAwareInterfaces(Object bean) {
		if (bean instanceof Aware) {
			if (bean instanceof EnvironmentAware) {
				((EnvironmentAware) bean).setEnvironment(this.applicationContext.getEnvironment());
			}
			if (bean instanceof EmbeddedValueResolverAware) {
				((EmbeddedValueResolverAware) bean).setEmbeddedValueResolver(this.embeddedValueResolver);
			}
			if (bean instanceof ResourceLoaderAware) {
				((ResourceLoaderAware) bean).setResourceLoader(this.applicationContext);
			}
			if (bean instanceof ApplicationEventPublisherAware) {
				((ApplicationEventPublisherAware) bean).setApplicationEventPublisher(this.applicationContext);
			}
			if (bean instanceof MessageSourceAware) {
				((MessageSourceAware) bean).setMessageSource(this.applicationContext);
			}
			if (bean instanceof ApplicationContextAware) {
				((ApplicationContextAware) bean).setApplicationContext(this.applicationContext);
			}
		}
	}
```

调用相应的方法来实现注入。