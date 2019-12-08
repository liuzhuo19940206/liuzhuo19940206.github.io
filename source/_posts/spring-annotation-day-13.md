---
title: spring_annotation_day_13
date: 2018-10-19 14:21:22
categories: spring_annotation
tags: spring_annotation
summary: 今天来学习AOP原理
---
**Spring注解开发** 

今天来学习AOP原理。

我们上篇文章已经描述了AOP的使用情况，现在来研究一下AOP的原理。首先从@EnableAspectJAutoProxy注解开始。

---

### @EnableAspectJAutoProxy

1）点击@EnableAspectJAutoProxy注解：
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(AspectJAutoProxyRegistrar.class)
public @interface EnableAspectJAutoProxy 
```

发现，使用了@Import注解来注入组件。组件是AspectJAutoProxyRegistrar类。

2）点击AspectJAutoProxyRegistrar类：
```java
class AspectJAutoProxyRegistrar implements ImportBeanDefinitionRegistrar{
  ···
}
```

该类，实现了ImportBeanDefinitionRegistrar接口，说明是用来自定义注入组件的。其中有一个registerBeanDefinitions（）方法。
```java
public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {

		AopConfigUtils.registerAspectJAnnotationAutoProxyCreatorIfNecessary(registry);

		AnnotationAttributes enableAspectJAutoProxy =
				AnnotationConfigUtils.attributesFor(importingClassMetadata, EnableAspectJAutoProxy.class);
		if (enableAspectJAutoProxy.getBoolean("proxyTargetClass")) {
			AopConfigUtils.forceAutoProxyCreatorToUseClassProxying(registry);
		}
		if (enableAspectJAutoProxy.getBoolean("exposeProxy")) {
			AopConfigUtils.forceAutoProxyCreatorToExposeProxy(registry);
		}
	}
```

查看其中的AopConfigUtils.registerAspectJAnnotationAutoProxyCreatorIfNecessary(registry);

最终会调用registerOrEscalateApcAsRequired方法：
```java
	private static BeanDefinition registerOrEscalateApcAsRequired(Class<?> cls, BeanDefinitionRegistry registry, Object source) {
		Assert.notNull(registry, "BeanDefinitionRegistry must not be null");
		if (registry.containsBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME)) {
			BeanDefinition apcDefinition = registry.getBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME);
			if (!cls.getName().equals(apcDefinition.getBeanClassName())) {
				int currentPriority = findPriorityForClass(apcDefinition.getBeanClassName());
				int requiredPriority = findPriorityForClass(cls);
				if (currentPriority < requiredPriority) {
					apcDefinition.setBeanClassName(cls.getName());
				}
			}
			return null;
		}
		RootBeanDefinition beanDefinition = new RootBeanDefinition(cls);
		beanDefinition.setSource(source);
		beanDefinition.getPropertyValues().add("order", Ordered.HIGHEST_PRECEDENCE);
		beanDefinition.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
		registry.registerBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME, beanDefinition);
		return beanDefinition;
	}
```

最后是给容器注入了一个Bean：
id：internalAutoProxyCreator ==》 Class：AnnotationAwareAspectJAutoProxyCreator

---

### AnnotationAwareAspectJAutoProxyCreator

@EnableAspectJAutoProxy注解帮我们注入了AnnotationAwareAspectJAutoProxyCreator组件，这个组件有什么作用呢？

我们观察一下AnnotationAwareAspectJAutoProxyCreator的继承关系：

AnnotationAwareAspectJAutoProxyCreator

&nbsp;&nbsp;&nbsp;AspectJAwareAdvisorAutoProxyCreator  

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AbstractAdvisorAutoProxyCreator  

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AbstractAutoProxyCreator

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**implements SmartInstantiationAwareBeanPostProcessor, BeanFactoryAware**

**关键:实现了两个接口，一个后置处理器(在Bean初始化完成前后做事情)、一个自动装配BeanFactory**

---

### 调试

打上断点：(与后置处理器，自动装配有关的)

1）AbstractAutoProxyCreator.setBeanFactory
2）AbstractAutoProxyCreator.postProcessBeforeInstantiation
3) AbstractAutoProxyCreator.postProcessAfterInitialization

4) AbstractAdvisorAutoProxyCreator.setBeanFactory(父类重写的方法也打上断点)
5）AbstractAdvisorAutoProxyCreator.initBeanFactory

6) AspectJAwareAdvisorAutoProxyCreator类没有相关的就不打上断点

7）AnnotationAwareAspectJAutoProxyCreator.initBeanFactory(父类重写的方法也打上断点)

8) MainConfigOfAOP配置类的中的两个Bean对象打上断点：
&nbsp;&nbsp;&nbsp;mathCalculator和logAspects

### debug

流程：
1）传入配置类，创建IoC容器
```java
AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfigOfAOP.class);
```

2) 注册配置类，调用refresh（）, 刷新容器
```java
public AnnotationConfigApplicationContext(Class<?>... annotatedClasses) {
		this();
		register(annotatedClasses); //注入配置类
		refresh();  //刷新容器
	}
```

3）registerBeanPostProcessors(beanFactory);注册bean的后置处理器，来拦截bean的初始化操作。  

&nbsp;&nbsp;&nbsp;&nbsp;1.先获取IoC容器已经定义了的需要创建对象的所有BeanPostProcessor  
```java
String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanPostProcessor.class, true, false);
```
&nbsp;&nbsp;&nbsp;&nbsp;2.给容器中加别的BeanPostProcessor

&nbsp;&nbsp;&nbsp;&nbsp;3.优先注册实现了PriorityOrdered接口的BeanPostProcessor

&nbsp;&nbsp;&nbsp;&nbsp;4.再注册实现了Ordered接口的BeanPostProcessor

&nbsp;&nbsp;&nbsp;&nbsp;5.注册没有实现优先级接口的BeanPostProcessor

&nbsp;&nbsp;&nbsp;&nbsp;6.注册BeanPostProcessor，实际上就是创建BeanPostProcessor对象，保存到容器中

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 创建    internalAutoProxyCreator的BeanPostProcessor【AnnotationAwareAspectJAutoProxyCreator】 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.创建Bean对象

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.populateBean：给bean的属性赋值

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3.initializeBean：初始化bean


&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1.invokeAwareMethods：处理Aware接口的回调：
```java
	private void invokeAwareMethods(final String beanName, final Object bean) {
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
	}
```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.applyBeanPostProcessorsBeforeInitialization:执行后置处理器的postProcessor：postProcessBeforeInitialization方法

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3.invokeInitMethods：自定义的初始化方法


&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.applyBeanPostProcessorsAfterInitialization：执行postProcessor：postProcessAfterInitialization方法

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.BeanPostProcessor(AnnotationAwareAspectJAutoProxyCreator)创建成功；

&nbsp;&nbsp;&nbsp;&nbsp;7.把BeanPostProcessor注册到BeanFactory中：beanFactory.addBeanPostProcessor（）

---

以上是创建AnnotationAwareAspectJAutoProxyCreator的过程。

AnnotationAwareAspectJAutoProxyCreator =》InstantiationAwareBeanPostProcessor，而不是 BeanPostProcessor 后置处理器

InstantiationAwareBeanPostProcessor是 postProcessBeforeInstantiation（实例化）

BeanPostProcessor是postProcessBeforeInitialization（初始化）

**说明InstantiationAwareBeanPostProcessor后置处理器是 在Bean实例化前后执行**

**BeanPostProcessor后置处理器是 在Bean对象初始化前后执行**

4）finishBeanFactoryInitialization(beanFactory);完成BeanFactory初始化工作，创建剩下的没有创建的Bean组件

&nbsp;&nbsp;&nbsp;&nbsp;1.遍历获取容器中所有的Bean，依次创建对象；getBean(beanName)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;getBean()->doGetBean()->getSingleton()->createBean()


&nbsp;&nbsp;&nbsp;&nbsp;2.创建Bean：

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.先从缓存中获取当前的Bean，如果能获取到，说明bean是之前被创建过，直接使用，否则再创建.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;只要创建了bean就会被缓存起来。

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.createBean():创建Bean

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.resolveBeforeInstantiation():解析BeanPostProcessors  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **想让后置处理器在次能返回一个代理对象**，如果能返回代理对象就使用，如果不能就继续。

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.后置处理器先尝试返回代理对象  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;bean=applyBeanPostProcessorsBeforeInstantiation();拿到所有的后置处理器，如果是 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;InstantiationAwareBeanPostProcessor；就执行postProcessBeforeInstantiation方法
```java
  if (bean != null) {
	  bean = applyBeanPostProcessorsAfterInitialization(bean, beanName);
	}
```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.doCreateBean()：真正去创建一个bean实例；和3.6流程一样

---

AnnotationAwareAspectJAutoProxyCreator[InstantiationAwareBeanPostProcessor]

1) 每一个bean创建之前，调用postProcessBeforeInstantiation()  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;关心**mathCalculator**和**logAspects**

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）判断当前bean是否是在advicedBean中（保存了所有需要增强bean）

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）判断当前bean是否是基础类型的Advice、PointCut、Advisor、AopInfrastructureBean或者是否是切面(@Aspect)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）是否需要跳过

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）获取候选的增强器(切面里面的通知方法)【List<Advisor> candidateAdvisors】  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;每一个封装的通知方法的增强器是InstantiationModelAwarePointcutAdvisor  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;判断每一个增强器是否是AspectJPointcutAdvisor类型的；返回true

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）永远返回false

2）创建对象
postProcessAfterInitialization：  
return wrapIfNecessary(bean, beanName, cacheKey);//需要包装的情况下  

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）获取当前bean的所有增强器(通知方法) Object[] specificInterceptors

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）找到候选的所有增强器(找哪些通知方法是需要切入当前bean方法的)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）获取到能在bean使用的增强器

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）给增强器排序

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）保存当前bean在advisedBeans中；

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）如果当前bean需要增强，创建当前bean的代理对象

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）获取所有的增强器(通知方法)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）保存到proxyFactory

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）创建代理对象：Spring自动决定  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;jdk代理  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cglib代理


&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4）给容器中返回当前组件使用cglib代理的对象

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5）以后容器中获取的就是这个组件的代理对象，执行目标方法的时候，代理对象就会执行通知方法的流程

3）目标方法的执行流程

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;容器中保存了组件的代理对象(cglib增强后的对象)，这个对象里面保存了详细信息(比如增强器、目标对象，xxx)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）CglibAopProxy.intercept();拦截目标方法的执行

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）根据ProxyFactory对象获取将要执行的目标方法拦截器

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）List<Object> interceptorList保存所有拦截器：5  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 一个默认的ExposeInvocationInterceptor和4个增强器

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）遍历所有的增强器，将其转为Interceptor

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）将增强器转为List<MethodInterceptor>,如果是MethodInterceptor，直接加入集合中，如果不是，使用AdvisorAdapter将增强器转为   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MethodInterceptor，转换完后返回MethodInterceptor数组

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）如果没有拦截器链，直接执行目标方法

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4）如果有拦截器链，把需要执行的目标对象，目标方法，拦截器链等信息传入，创建一个CglibMethodInvocation对象，并调用  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Object retVal = mi.proceed();

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5) 拦截器链的触发过程

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）如果没有拦截器执行，就直接执行目标方法，或者拦截器的索引和拦截器数组的个数-1一样大，执行目标方法

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）链式获取每一个拦截器，拦截器执行invoke方法，每一个拦截器等待下一个拦截器执行完成返回以后再来执行：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;拦截器链的机制，保证通知方法与目标方法的执行顺序.
<img src="https://gakkil.gitee.io/gakkil-image/spring_annotation/day13/20181019201432.png"/>


### 总结

1）@EnableAspectJAutoProxy注解 开启AOP功能

2）@EnableAspectJAutoProxy 会给容器中注册一个组件 AnnotationAwareAspectJAutoProxyCreator

3）AnnotationAwareAspectJAutoProxyCreator是一个后置处理器

4）容器的创建流程：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）registerBeanPostProcessors()注册后置处理器，创建AnnotationAwareAspectJAutoProxyCreator对象  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）finishBeanFactoryInitialization()：初始化剩下的单实例bean  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）创建业务逻辑组件和切面组件  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）AnnotationAwareAspectJAutoProxyCreator拦截组件的创建过程  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）组件创建完之后，判断组件是否需要增强。是：切面的通知方法，包装成增强器(Advisor);给业务逻辑组件  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4)  创建一个代理对象 

5）执行目标方法：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）代理对象执行目标方法  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）CglibAopProxy.Intercept:  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1）得到目标方法的拦截器链(增强器包装成拦截器MethodIntercept)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2）利用拦截器的链式机制，依次进入每一个拦截器进行执行；  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3）效果：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 正常执行：前置通知 -》目标方法 -》后置通知 -》返回通知  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 出现异常：前置通知 -》目标方法 -》后置通知 -》异常通知  















