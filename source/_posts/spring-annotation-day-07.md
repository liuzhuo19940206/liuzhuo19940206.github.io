---
title: spring_annotation_day_07
date: 2018-10-16 09:52:04
categories: spring_annotation
tags: spring_annotation
summary: 今天学习BeanPostProcessor的生命周期流程
---
**Spring注解开发**  

今天学习BeanPostProcessor的生命周期流程

### BeanPostProcessor的生命周期流程

我们知道BeanPostProcessor是后置处理器，是在Bean初始化前后执行一些列操作的，底层到底是怎么执行的呢？现在debug一下。

1）设置断点，在com.liuzhuo.bean包下的MyBeanPostProcessor类中，给postProcessBeforeInitialization方法设置断点。

<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day07/20181016100600.png"/>

2) debug一下。发现调用栈如下：

<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day07/20181016101036.png" style="width:50%"/>

程序是从test01开始：

1）创建AnnotationConfigApplicationContext对象  

2）执行AnnotationConfigApplicationContext的构造方法：
```java
	public AnnotationConfigApplicationContext(Class<?>... annotatedClasses) {
		this();
		register(annotatedClasses);
		refresh();
	}
```
3) 调用refresh()方法：完成一系列资源配置操作。最后调用finishBeanFactoryInitialization()方法，初始化容器。
```java
	public void refresh() throws BeansException, IllegalStateException {
		synchronized (this.startupShutdownMonitor) {
			// Prepare this context for refreshing.
			prepareRefresh();

			// Tell the subclass to refresh the internal bean factory.
			ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();

			// Prepare the bean factory for use in this context.
			prepareBeanFactory(beanFactory);

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

			catch (BeansException ex) {
				if (logger.isWarnEnabled()) {
					logger.warn("Exception encountered during context initialization - " +
							"cancelling refresh attempt: " + ex);
				}

				// Destroy already created singletons to avoid dangling resources.
				destroyBeans();

				// Reset 'active' flag.
				cancelRefresh(ex);

				// Propagate exception to caller.
				throw ex;
			}

			finally {
				// Reset common introspection caches in Spring's core, since we
				// might not ever need metadata for singleton beans anymore...
				resetCommonCaches();
			}
		}
	}
```
4）进入finishBeanFactoryInitialization：
调用
`beanFactory.preInstantiateSingletons();`

5) 最终调用doCreateBean()方法：
我们主要看其中的：
```java
        // Initialize the bean instance.
		Object exposedObject = bean;
		try {
			populateBean(beanName, mbd, instanceWrapper);
			if (exposedObject != null) {
				exposedObject = initializeBean(beanName, exposedObject, mbd);
			}
		}
```
populateBean: 给Bean的属性赋值等操作
initializeBean: Bean初始化操作。

6）点击initializeBean方法:
```java
		Object wrappedBean = bean;
		if (mbd == null || !mbd.isSynthetic()) {
			wrappedBean = applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);
		}

		try {
			invokeInitMethods(beanName, wrappedBean, mbd);
		}
		catch (Throwable ex) {
			throw new BeanCreationException(
					(mbd != null ? mbd.getResourceDescription() : null),
					beanName, "Invocation of init method failed", ex);
		}

		if (mbd == null || !mbd.isSynthetic()) {
			wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
		}
		return wrappedBean;
```
其中：
applyBeanPostProcessorsBeforeInitialization：完成初始化之前的操作。

invokeInitMethods：初始化是操作(@PostConstruc、init-method等)

applyBeanPostProcessorsAfterInitialization：完成初始化之后的操作。

7）点击applyBeanPostProcessorsBeforeInitialization：
```java
	@Override
	public Object applyBeanPostProcessorsBeforeInitialization(Object existingBean, String beanName) throws BeansException {

		Object result = existingBean;
		for (BeanPostProcessor beanProcessor : getBeanPostProcessors()) {
			result = beanProcessor.postProcessBeforeInitialization(result, beanName);
			if (result == null) {
				return result;
			}
		}
		return result;
	}
```

发现：就是使用for循环来调用一系列BeanPostProcessor接口的实现类，包括Spring容器自身的和我们自定义的实现类。

**注意:如果其中的某一个BeanPostProcessor实现类返回了null，那么后面的BeanPostProcessor实现类就不执行了！！！**

大概的流程就走完了~~~

---

### Spring底层对BeanPostProcessor的使用

ps：在idea中：类名查找类:Ctrl+Shift+Alt+N; 

<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day07/20181016104349.png"/>

1) 找到BeanPostProcessor接口：

```java
public interface BeanPostProcessor {


	Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException;


	Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException;

}
```
2) 在BeanPostProcessor上Ctrl+T：找到所有的实现类：

<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day07/20181016105219.png"/>

我们能看到各种BeanPostProcessor的实现类

3）ApplicationContextAwareProcessor

我们使用一下ApplicationContextAwareProcessor这个处理器。这个处理器是给我们的自定义Bean注入上下文容器的。

4）在com.liuzhuo.bean包下，随便找个一个Bean，并实现ApplicationContextAware接口：
ps:这里使用的Dog类
```java
@Component
public class Dog implements ApplicationContextAware 
```

5）需要实现：setApplicationContext方法
```java
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
```

这样我们就将上下文组件注入到Dog类中，在Dog类中就能使用ApplicationContext上下容器了。

---

还有：
InitDestroyAnnotationBeanPostProcessor处理我们的: @PostConstruct、@PreDestory注解。  
AutowiredAnnotationBeanPostProcessor处理我们的: @Autowired注解等。

**总结：  
&nbsp;&nbsp;&nbsp;&nbsp;Spring对底层BeanPostProcessor的使用：bean的赋值、注入其他组件、@Autowired、生命周期注解功能、@Async、xxxBeanPostProcessor等等。**




