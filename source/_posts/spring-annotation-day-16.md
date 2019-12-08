---
title: spring_annotation_day_16
date: 2018-10-23 10:33:28
categories: spring_annotation
tags: spring_annotation
summary: Spring容器的创建过程
---
**Spring容器的创建过程**

今天，我们来统一学习一下，Spring容器的整个创建过程。



---

**Spring容器的refresh()[创建刷新]**

### prepareRefresh();【刷新前的预处理】

1）initPropertySources();初始化一些属性设置；子类自定义个性化的属性设置方法；
```java
   protected void initPropertySources() {
		 // For subclasses: do nothing by default.
	 }
```

2)  getEnvironment().validateRequiredProperties();检验属性的合法性等

3）earlyApplicationEvents = new LinkedHashSet<ApplicationEvent>();保存容器的一些早期的事件；

### obtainFreshBeanFactory；【获取BeanFactory】

1）refreshBeanFactory();刷新BeanFactory  
创建 this.beanFactory = new DefaultListableBeanFactory();
设置id。

2）getBeanFactory();  
返回GenericApplicationContext创建的beanFactory对象;return this.beanFactory;

3)将创建好的BeanFactory【GenericApplicationContext】对象返回；

### prepareBeanFactory(beanFactory);

BeanFactory的预准备工作（BeanFactory进行一些设置）

1）设置BeanFactory的类加载、支持表达式解析器····

2）添加部分BeanPostProcessor【ApplicationContextAwareProcessor】

3）设置忽略的自动装配的接口EnvironmentAware、EmbeddedValueResolverAware、ResourceLoaderAware等

4）注册可以解析的自动装配：我们能直接在任何组件中自动注入：BeanFactory、ResourceLoader、ApplicationEventPublisher、ApplicationContext。

5）添加BeanPostProcessor【ApplicationListenerDetector】

6）添加编译时Aspectj
```java
   // Detect a LoadTimeWeaver and prepare for weaving, if found.
		if (beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
			beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
			// Set a temporary ClassLoader for type matching.
			beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
		}
```

7) 给BeanFactory中注册一些能用的组件

environment【ConfigurableEnvironment】

systemProperties【Map<String, Object>】

systemEnvironment【Map<String, Object>】

### postProcessBeanFactory(beanFactory);

BeanFactory准备工作完成后进行的后置处理工作
```java
protected void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    
}
```

子类通过覆写这个方法来在BeanFactory创建并准备完成以后做进一步的设置。

<div style="text-align: center;"><font color=#00ffff size=4>以上是BeanFactory的创建以及准备工作</font></div>

---

### invokeBeanFactoryPostProcessors(beanFactory);

执行BeanFactoryPostProcessor

BeanFactoryPostProcessor：BeanFactory的后置处理器。在BeanFactory标准化初始化之后执行。

两个接口：BeanFactoryPostProcessor、BeanDefinitionRegistryPostProcessor。

一、执行BeanFactoryPostProcessor的方法：

**先执行BeanDefinitionRegistryPostProcessor**

1）获取所有的BeanDefinitionRegistryPostProcessor  

2）先执行实现了PriorityOrdered优先级接口的BeanDefinitionRegistryPostProcessor
postProcessor.postProcessBeanDefinitionRegistry(registry);

3）再执行实现了Ordered顺序接口的BeanDefinitionRegistryPostProcessor
postProcessor.postProcessBeanDefinitionRegistry(registry);

4）最后执行没有实现任何优先级或者顺序接口的BeanDefinitionRegistryPostProcessor
postProcessor.postProcessBeanDefinitionRegistry(registry);

**后执行BeanFactoryPostProcessor的方法**

1）获取所有的BeanFactoryPostProcessor

2）先执行实现了PriorityOrdered优先级接口的BeanFactoryPostProcessor
postProcessor.postProcessBeanFactory();

3）再执行实现了Ordered顺序接口的BeanFactoryPostProcessor
postProcessor.postProcessBeanFactory();

4）最后执行没有实现任何优先级或者顺序接口的BeanFactoryPostProcessor
postProcessor.postProcessBeanFactory();

### registerBeanPostProcessors（BeanFactory）

注册BeanPostProcessor（Bean的后置处理器）【Intercept bean creation.】

不同类型的BeanPostProcessor：在Bean的创建前后的执行顺序是不同的

DestructionAwareBeanPostProcessor

InstantiationAwareBeanPostProcessor

MergedBeanDefinitionPostProcessor【internalPostProcessor】

SmartInstantiationAwareBeanPostProcessor

1）获取所有的BeanPostProcessor；后置处理器默认都可以通过PriorityOrdered、Ordered接口来执行优先级

2）先注册PriorityOrdered优先级接口的BeanPostProcessor；把每一个BeanPostProcessor添加到BeanFactory中

3）再注册Ordered

4）注册其他的没有实现任何接口的BeanPostProcessor

5）最终注册MergedBeanDefinitionPostProcessor

6）注册一个ApplicationListenerDetector；来在Bean创建后检查是否是ApplicationListener，如果是，就添加到容器中：applicationContext.addApplicationListener((ApplicationListener<?>) bean);

### initMessageSource();

初始化MessageSource组件，做国家化功能；消息绑定；消息解析。

1）获取BeanFactory

2）看容器中是否有id=messageSource，类型是MessageSource的组件。如果有就赋值给messageSource，如果没有就自己创建一个DelegatingMessageSource组件。

MessageSource：取出国际化配置文件中的某个key的值；能按照区域信息获取。

3）把创建好的messageSource注册到容器中，以后获取国际化配置文件时，可以自动注入MessageSource

### initApplicationEventMulticaster();

初始化事件派发器

1）获取BeanFactory

2）从BeanFactory中获取applicationEventMulticaster的ApplicationEventMulticaster

3）如果上一步没有配置，就创建一个SimpleApplicationEventMulticaster

4）将创建好的ApplicationEventMulticaster添加到容器中，以后其他组件直接自动注入

### onRefresh();

留给子类，重写onRefresh()方法.在容器刷新的时候自定义逻辑。

### registerListeners();

给容器中将所有项目里面的ApplicationListener注册进来

1）从容器中拿到所有的ApplicationListener组件

2）将每个监听器添加到事件派发器中：getApplicationEventMulticaster().addApplicationListenerBean(listenerBeanName);

3）派发之前步骤中产生的事件：
```java
  Set<ApplicationEvent> earlyEventsToProcess = this.earlyApplicationEvents;
		this.earlyApplicationEvents = null;
		if (earlyEventsToProcess != null) {
			for (ApplicationEvent earlyEvent : earlyEventsToProcess) {
				getApplicationEventMulticaster().multicastEvent(earlyEvent);
			}
		}
```

### finishBeanFactoryInitialization(beanFactory);

初始化所有的剩下的单实例Bean对象

1）beanFactory.preInstantiateSingletons();初始化剩下的单实例Bean

1.1 获取容器中的所有Bean，依次初始化和创建对象

1.2 获取Bean的定义信息：RootBeanDefinition

1.3 Bean不是抽象的、是单实例、是懒加载  

　　1.3.1 判断是不是FactoryBean；是否是实现FactoryBean接口的Bean  

　　1.3.2 不是工厂Bean，就利用getBean()获取Bean对象。 

---

　　　　1.3.2.1）getBean(beanName);ioc.getBean();

　　　　1.3.2.2) doGetBean(name,null,null,false);

　　　　1.3.2.3) 先获取缓存中保存的单实例bean。如果能获取说明这个Bean之前创建过（所有创建过的单实例Bean都会被保存起来）

　　　　1.3.2.4）缓存中获取不到，开始Bean的创建对象流程

　　　　1.3.2.5）标记当前Bean已经被创建，防止多线程下创建多个单实例Bean

　　　　1.3.2.6）获取Bean的定义信息

　　　　1.3.2.7）获取当前Bean依赖的其他Bean；如果有按照getBean()把依赖的Bean先创建出来；

　　　　1.3.2.8）启动单实例Bean的创建过程：

---

　　　　　　1.3.2.8.1) createBean(beanName,mbd,args)

　　　　　　1.3.2.8.2) resolveBeforeInstantiation(beanName, mbdToUse);让BeanPostProcessor在Bean的创建之前执行，是InstantiationAwareBeanPostProcessor类型的后置处理器。看是否是需要创建代理对象。

先触发applyBeanPostProcessorsBeforeInstantiation：postProcessBeforeInstantiation()

如果有返回值：applyBeanPostProcessorsAfterInitialization：postProcessAfterInitialization()

　　　　　　1.3.2.8.3)如果前面InstantiationAwareBeanPostProcessor没有返回值，说明不需要创建代理对象。

　　　　　　1.3.2.8.4)Object beanInstance = doCreateBean(beanName, mbdToUse, args);创建Bean

---

　　　　　　　　1.3.2.8.4.1) instanceWrapper = createBeanInstance(beanName, mbd, args);创建Bean对象；利用工厂方法或者构造器创建出Bean对象

　　　　　　　　1.3.2.8.4.2) applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);调用MergedBeanDefinitionPostProcessor的postProcessMergedBeanDefinition(mbd, beanType, beanName);

　　　　　　　　1.3.2.8.4.3) 【属性赋值】populateBean(beanName, mbd, instanceWrapper);

---
赋值之前：
　　　　　　　　　　1.3.2.8.4.3.1) InstantiationAwareBeanPostProcessor后置处理器；
postProcessAfterInstrantiation();

　　　　　　　　　　1.3.2.8.4.3.2) InstantiationAwareBeanPostProcessor后置处理器；
postProcessPropertyValues();

赋值之后：
　　　　　　　　　　1.3.2.8.4.3.3) 应用Bean属性的值：为属性利用setter方法等进行赋值  
applyPropertyValues(beanName, mbd, bw, pvs);

　　　　　　　　　　1.3.2.8.4.4) 【Bean初始化】initializeBean(beanName, exposedObject, mbd)；

---
1.3.2.8.4.4.1) 【执行Aware接口方法】invokeAwareMethods(beanName, bean);
```java
     if (bean instanceof Aware) {
			if (bean instanceof BeanNameAware) {
				((BeanNameAware) bean).setBeanName(beanName);
			}
			if (bean instanceof BeanClassLoaderAware) {
				((BeanClassLoaderAware) bean).setBeanClassLoader(getBeanClassLoader());
			}
			if (bean instanceof BeanFactoryAware) {
				((BeanFactoryAware) bean).setBeanFactory(AbstractAutowireCapableBeanFactory.this);
			}
		}
```

1.3.2.8.4.4.2) 【执行后置处理器初始化之前】 

applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);       
beanProcessor.postProcessBeforeInitialization(result, beanName);

1.3.2.8.4.4.3)【执行初始化方法】invokeInitMethods(beanName, wrappedBean, mbd);

---

1.3.2.8.4.4.3.1) 是否是InitializingBean接口的实现；执行接口规定的初始化

1.3.2.8.4.4.3.2) 是否自定义初始化方法：invokeCustomInitMethod(beanName, bean, mbd);

---

1.3.2.8.4.4.4)【执行后置处理器初始化之后】  

applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);  
beanProcessor.postProcessAfterInitialization(result, beanName);

1.3.2.8.4.5)【注册Bean的销毁方法】：DisposableBeanAdapter


1.3.2.8.5）将创建的Bean添加到缓存中singletonObjects；  
ioc容器就是这些Map：很多的Map里面保存了单实例Bean，环境信息····

所有的Bean都利用getBean()创建完后：  
 检查所有的Bean是否是SmartInitializingSingleton接口类型；如果是，就执行afterSingletonsInstantion()方法

### finishRefresh();

完成BeanFactory的初始化创建工作；IoC容器就创建完了。

1）initLifecycleProcessor();初始化和生命周期有关的后置处理器：LifecycleProcessor

默认从容器中找是否是lifecycleProcessor的组件；如果没有，创建一个默认的 new DefaultLifecycleProcessor()；并加入到容器中。

2）getLifecycleProcessor().onRefresh();

拿到前面定义的生命周期处理器，并回调onRefresh()方法。

3）publishEvent(new ContextRefreshedEvent(this));发布容器刷新完成事件。

4）LiveBeansView.registerApplicationContext(this);

---

### 总结

1）**Spring容器在启动的时候，先会保存所有注册进来的Bean定义信息。**

1.1 xml注册的bean；<bean  />

1.2 注解注册Bean:@Bean、@Service、@Component、XXX

2）**Spring容器会在合适的时候创建这些Bean**

2.1 用到这个bean的时候，利用getBean创建bean；创建好以后保存在容器中；

2.2 统一创建剩下的所有单实例bean；finishBeanFactoryInitialization(beanFactory);

3）**后置处理器**

每个bean创建完后，都会使用各种后置处理器进行处理；来增强bean的功能；  

AutowiredAnnotationBeanPostProcessor：处理自动注入

AnnotationAwareAspectJAutoProxyCreator：来做AOP功能

XXX····

增强的功能注解：

AsyncAnnotationBeanPostProcessor

4）**事件驱动模型：**

ApplicationListener：事件监听器

ApplicationEventMulticaster：事件派发


