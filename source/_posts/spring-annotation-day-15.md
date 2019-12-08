---
title: spring_annotation_day_15
date: 2018-10-22 10:05:14
categories: spring_annotation
tags: spring_annotation
summary: 讲解Spring其他的扩展原理
---
**Spring注解开发** 

今天，来讲解其他的扩展原理，帮助大家学习其他的小知识点

### BeanFactoryPostProcessor

BeanPostProcessor：bean的后置处理器，bean创建对象初始化前后进行拦截工作的。  

BeanFactoryPostProcessor：BeanFactory的后置处理器，在BeanFactory标准初始化之后调用，来定制和修改BeanFactory的内容，所有的Bean的定义已经保存加载到BeanFactory，**但是bean的实例还没有创建**。

#### 创建ExConfig配置类：

```java
@Configuration
@ComponentScan("com.liuzhuo.ext")
public class ExtConfig {

    @Bean
    public Blue blue() {
        return new Blue();
    }
}
```

#### 创建自定义的BeanFactoryPostProcessor：
```java
@Component
public class MyBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
    /**
     * @param beanFactory
     * @throws BeansException
     * 在BeanFactory标准初始化之后调用，来定制和修改BeanFactory的内容，
     * 此时，所有的bean的定义信息已经保存到BeanFactory，但是Bean还没有创建
     */
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {

        System.out.println("postProcessBeanFactory·······");

        int count = beanFactory.getBeanDefinitionCount();
        String[] names = beanFactory.getBeanDefinitionNames();
        for (String name : names) {
            System.out.println(name);
        }
    }
}
```

#### 创建新的测试类：
```java
public class IoCTest_EXT {

    @Test
    public void test01() {
        AnnotationConfigApplicationContext applicationContext = new 
            AnnotationConfigApplicationContext(ExtConfig.class);
        applicationContext.close();

    }
}
```

#### 运行：
```
postProcessBeanFactory·······
org.springframework.context.annotation.internalConfigurationAnnotationProcessor
org.springframework.context.annotation.internalAutowiredAnnotationProcessor
org.springframework.context.annotation.internalRequiredAnnotationProcessor
org.springframework.context.annotation.internalCommonAnnotationProcessor
org.springframework.context.event.internalEventListenerProcessor
org.springframework.context.event.internalEventListenerFactory
extConfig
myBeanFactoryPostProcessor
blue
```

**能看到，我们获取了所有的BeanFactory中定义的bean了，但是还没有创建bean的实例对象**。

#### 调试：

给MyBeanFactoryPostProcessor中的postProcessBeanFactory方法加上断点，并运行。

过程：
1）加载容器。
2）refresh();刷新容器
3）invokeBeanFactoryPostProcessors(beanFactory);
```java
@Override
	public void refresh() throws BeansException, IllegalStateException {
    
    try {
		// Allows post-processing of the bean factory in context subclasses.
		postProcessBeanFactory(beanFactory);
		
		// Invoke factory processors registered as beans in the context.
		invokeBeanFactoryPostProcessors(beanFactory);
		
		// Register bean processors that intercept bean creation.
		registerBeanPostProcessors(beanFactory);
		
		// Initialize message source for this context.
		initMessageSource();
		
		// Initialize event multicaster for this context.
		initApplicationEventMulticaster();
		
		// Initialize other special beans in specific context subclasses.
		onRefresh();
		
		// Check for listener beans and register them.
		registerListeners();
		
		// Instantiate all remaining (non-lazy-init) singletons.
		finishBeanFactoryInitialization(beanFactory);
		
		// Last step: publish corresponding event.
		finishRefresh();
	}
}
```

能发现，invokeBeanFactoryPostProcessors(beanFactory);是在finishBeanFactoryInitialization(beanFactory);方法之前的，就说明了BeanFactoryPostProcessor是在bean的实例化之前的，是在BeanFactory实例化之后的。

---

### BeanDefinitionRegisterPostProcessor

BeanDefinitionRegisterPostProcessor extends BeanFactoryPostProcessor

在所有bean定义信息将要被加载，bean实例还未创建。

优先于BeanFactoryPostProcessor执行  
利用BeanDefinitionRegisterPostProcessor给容器中再额外添加一些组件。

原理：  
1）ioc创建对象  
2）refresh() -> invokeBeanFactoryPostProcessors(beanFactory);  
3) 从容器中获取所有的BeanDefinitionRegisterPostProcessor组件。  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1)依次触发所有的postProcessorBeanDefinitionRegistry()方法  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2)再次触发postProcessorBeanFactory()方法的BeanFactoryPostProcessor；  
4）再来从容器中找到BeanFactoryPostProcessor组件；然后依次触发postProcessorBeanFactory()方法

#### 创建MyBeanDefinitionRegisterPostProcessor类：
```java
@Component
public class MyBeanDefinitionRegisterPostProcessor implements BeanDefinitionRegistryPostProcessor {

    //先执行
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException {
        System.out.println("postProcessBeanDefinitionRegistry······");

        int count = registry.getBeanDefinitionCount();
        System.out.println("容器中注册的bean的个数(1)：" + count);

        //还能注册新的bean组件
        RootBeanDefinition beanDefinition = new RootBeanDefinition(Blue.class);
        registry.registerBeanDefinition("hello", beanDefinition);
    }

    //后执行
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {

        System.out.println("postProcessBeanFactory··········");
        int count = beanFactory.getBeanDefinitionCount();
        System.out.println("容器中注册的bean的个数(2)：" + count);
    }
}
```

#### 运行测试类:
```
十月 22, 2018 11:32:15 上午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Mon Oct 22 11:32:15 CST 2018]; root of context hierarchy
postProcessBeanDefinitionRegistry······
容器中注册的bean的个数(1)：10
postProcessBeanFactory··········
容器中注册的bean的个数(2)：11

十月 22, 2018 11:32:15 上午 org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor <init>
信息: JSR-330 'javax.inject.Inject' annotation found and supported for autowiring
postProcessBeanFactory·······
org.springframework.context.annotation.internalConfigurationAnnotationProcessor
org.springframework.context.annotation.internalAutowiredAnnotationProcessor
org.springframework.context.annotation.internalRequiredAnnotationProcessor
org.springframework.context.annotation.internalCommonAnnotationProcessor
org.springframework.context.event.internalEventListenerProcessor
org.springframework.context.event.internalEventListenerFactory
extConfig
myBeanDefinitionRegisterPostProcessor
myBeanFactoryPostProcessor
blue
hello

十月 22, 2018 11:32:15 上午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Mon Oct 22 11:32:15 CST 2018]; root of context hierarchy

Process finished with exit code 0
```

能发现  
1）首先执行BeanDefinitionRegistryPostProcessor的postProcessBeanDefinitionRegistry()方法 
2）再执行BeanDefinitionRegistryPostProcessor的postProcessBeanFactory()方法  
3）最后执行BeanFactoryPostProcessor的postProcessBeanFactory()方法

#### 调试(原理)

给MyBeanDefinitionRegisterPostProcessor的postProcessBeanDefinitionRegistry()方法打上断点，并debug。

1）加载容器  
2）refresh();刷新容器  
3）invokeBeanFactoryPostProcessors(beanFactory);和BeanFactoryPostProcessor的流程一样  
4）invokeBeanFactoryPostProcessors()

在invokeBeanFactoryPostProcessors()方法中，可以看到  
1）首先获取所有的BeanDefinitionRegistryPostProcessor的定义信息
```java
String[] postProcessorNames =
	beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
		for (String ppName : postProcessorNames) {
		if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
		currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
		processedBeans.add(ppName);
		}
	}
```

2）然后调用invokeBeanDefinitionRegistryPostProcessors()方法：
```java
	private static void invokeBeanDefinitionRegistryPostProcessors(
			Collection<? extends BeanDefinitionRegistryPostProcessor> postProcessors, BeanDefinitionRegistry registry) {

		for (BeanDefinitionRegistryPostProcessor postProcessor : postProcessors) {
			postProcessor.postProcessBeanDefinitionRegistry(registry);
		}
	}
```

3) 再调用invokeBeanFactoryPostProcessors：
```java
	private static void invokeBeanFactoryPostProcessors(
			Collection<? extends BeanFactoryPostProcessor> postProcessors, ConfigurableListableBeanFactory beanFactory) {

		for (BeanFactoryPostProcessor postProcessor : postProcessors) {
			postProcessor.postProcessBeanFactory(beanFactory);
		}
	}

```

4) 获取所有的BeanFactoryPostProcessor的定义信息
```java
String[] postProcessorNames =
		beanFactory.getBeanNamesForType(BeanFactoryPostProcessor.class, true, false);
```

5）调用invokeBeanFactoryPostProcessors：
```java
	private static void invokeBeanFactoryPostProcessors(
			Collection<? extends BeanFactoryPostProcessor> postProcessors, ConfigurableListableBeanFactory beanFactory) {

		for (BeanFactoryPostProcessor postProcessor : postProcessors) {
			postProcessor.postProcessBeanFactory(beanFactory);
		}
	}
```

---

### ApplicationListener:

监听容器中发布的事件。事件驱动模型开发。

步骤：

1）写一个监听器(ApplicationListener实现类)来监听某个事件(ApplicationEvent及其子类)

2) 把监听器加入到容器中

3）只要容器中有相关事件的发布，我们就能监听到这个事件

4）发布一个事件: applicationContext.publishEvent();

#### 编写一个MyApplicationListener
```javascript
@Component
public class MyApplicationListener implements ApplicationListener<ApplicationEvent> {
    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        System.out.println("监听:" + event);
    }
}
```

#### 运行测试类：
```
十月 22, 2018 8:42:11 下午 org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor <init>
信息: JSR-330 'javax.inject.Inject' annotation found and supported for autowiring
监听:org.springframework.context.event.ContextRefreshedEvent[source=org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Mon Oct 22 20:42:11 CST 2018]; root of context hierarchy]

十月 22, 2018 8:42:11 下午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Mon Oct 22 20:42:11 CST 2018]; root of context hierarchy
监听:org.springframework.context.event.ContextClosedEvent[source=org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Mon Oct 22 20:42:11 CST 2018]; root of context hierarchy]
```

说明容器，为我们发布了两个事件：ContextRefreshedEvent 和 ContextClosedEvent

#### 发布自己的事件
```java
    @Test
    public void test01() {
        AnnotationConfigApplicationContext applicationContext = new 
            AnnotationConfigApplicationContext(ExtConfig.class);

        applicationContext.publishEvent(new ApplicationEvent(new String("自定义事件")) {
        });

        applicationContext.close();
    }
}
```
运行：
```
监听:org.springframework.context.event.ContextRefreshedEvent[source=org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Mon Oct 22 20:47:38 CST 2018]; root of context hierarchy]
监听:com.liuzhuo.test.IoCTest_EXT$1[source=自定义事件]
监听:org.springframework.context.event.ContextClosedEvent[source=org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Mon Oct 22 20:47:38 CST 2018]; root of context hierarchy]
```

#### 原理：

1）初始化容器；refresh();

2）finishRefresh();  // Last step: publish corresponding event.

3）publishEvent(new ContextRefreshedEvent(this));发布事件

4）getApplicationEventMulticaster().multicastEvent(applicationEvent, eventType);获取派发器

5）获取所有的ApplicationListener：for (final ApplicationListener<?> listener : getApplicationListeners(event, type))

6）如果有Executor，可以支持使用Executor进行异步派发，否则，使用同步方式直接执行invokeListener(listener, event);

7）doInvokeListener(listener, event);回调listener.onApplicationEvent(event);

我们这里的三个事件：  

1）finishRefresh();容器刷新完成后，执行ContextRefreshedEvent事件。

2）自己发布的事件

3）容器关闭会发布ContextClosedEvent事件

---

事件派发器(EventMulticaster)：

1）容器创建对象；refresh();

2）initApplicationEventMulticaster();初始化事件派发器

3）先去查看容器中是否有id=“applicationEventMulticaster”组件，如果有直接使用，没有的话，new SimpleApplicationEventMulticaster()组件。并且加入到容器中。我们就可以在其他组件要派发事件时，自动注入这个applicationEventMulticaster组件。

---

容器中有哪些监听器：

1）容器创建对象；refresh();

2）registerListeners(); //注册监听器  
从容器中拿到所有的监听器，把它们注册到applicationEventMulticaster中。
String[] listenerBeanNames = getBeanNamesForType(ApplicationListener.class, true, false);  
getApplicationEventMulticaster().addApplicationListenerBean(listenerBeanName);

### @EventListener

@EventListener注解，可以使普通类的普通方法来监听事件，不用去实现ApplicationEvent接口。

1）在com.liuzhuo.ext包下，创建UserService类：
```java
@Service
public class UserService {

    @EventListener(value = {ApplicationEvent.class})
    public void listen(ApplicationEvent event) {
        System.out.println("UserService监听:" + event);
    }
}
```

2) 运行IoCTest_EXT测试类：
```
UserService监听:org.springframework.context.event.ContextRefreshedEvent[source=org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Tue Oct 23 09:52:08 CST 2018]; root of context hierarchy]
监听:org.springframework.context.event.ContextRefreshedEvent[source=org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Tue Oct 23 09:52:08 CST 2018]; root of context hierarchy]
UserService监听:com.liuzhuo.test.IoCTest_EXT$1[source=自定义事件]
监听:com.liuzhuo.test.IoCTest_EXT$1[source=自定义事件]
UserService监听:org.springframework.context.event.ContextClosedEvent[source=org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Tue Oct 23 09:52:08 CST 2018]; root of context hierarchy]
监听:org.springframework.context.event.ContextClosedEvent[source=org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Tue Oct 23 09:52:08 CST 2018]; root of context hierarchy]
```

3) 原理：

@EventListener使用EventListenerMethodProcessor处理器来完成的
```java
* @author Stephane Nicoll
 * @since 4.2
 * @see EventListenerMethodProcessor
 */
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface EventListener
```

点击EventListenerMethodProcessor处理器：
```
public class EventListenerMethodProcessor implements SmartInitializingSingleton, ApplicationContextAware
```

实现了SmartInitializingSingleton接口，所有重点是SmartInitializingSingleton接口。

点击SmartInitializingSingleton接口：
```
public interface SmartInitializingSingleton {

	/**
	 * Invoked right at the end of the singleton pre-instantiation phase,
	 * with a guarantee that all regular singleton beans have been created
	 * already. {@link ListableBeanFactory#getBeansOfType} calls within
	 * this method won't trigger accidental side effects during bootstrap.
	 * <p><b>NOTE:</b> This callback won't be triggered for singleton beans
	 * lazily initialized on demand after {@link BeanFactory} bootstrap,
	 * and not for any other bean scope either. Carefully use it for beans
	 * with the intended bootstrap semantics only.
	 */
	void afterSingletonsInstantiated();

}

```

其中有一个方法：afterSingletonsInstantiated(); 该方法是在所有的单实例初始化完成后才调用的。

调试：
给UserService类打上断点，并debug。

1）ioc容器创建对象；refresh();刷新容器

2）finishBeanFactoryInitialization(beanFactory)；初始化剩下的单实例bean

3）先创建所有的单实例bean；getBean();

4) 获取所有创建好的单实例bean，判断是否是SmartInitializingSingleton类型的，如果是就调用afterSingletonsInstantiated()方法
