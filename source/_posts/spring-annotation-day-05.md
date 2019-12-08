---
title: spring_annotation_day_05
date: 2018-10-15 09:50:41
categories: spring_annotation
tags: spring_annotation
summary: 今天,学习给容器中注入组件:@Import注解、FactoryBean
---

**Spring注解开发**  

今天，学习给容器中注入组件，昨天，我们学习了条件注解，可以在满足一定的条件下，注入bean，今天的@Import注解也能帮我们完成相同的功能。


### @Import注解

给容器中注册组件主要有以下三种方法 : 
1）、包扫描+组件标记注解（@Controller、@Service、@Repository、@Component)[导入我们自己写的组件] 
2）、@Bean[导入第三方包里面的组件] 
3）、@Import[快速给容器中导入一个组件]  

---

@Bean导入，只能一个一个的导入，不太方便，所以需要@Import注解。现在我们来看@Import的用法。

#### 一、@Import  

@Import：容器会自动注册加了该注解的组件，组件的id默认是组件的全类名  

1）在com.liuzhuo.bean包下，创建Color对象。  
2）修改配置类MainConfig2类：(看@Import注解)

```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
@Import(Color.class)
public class MainConfig2
```
3）在test类中，创建新的测试方法：
```java
    @Test
    public void testImport() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig2.class);
        printBeanName(applicationContext);
    }

    private void printBeanName(AnnotationConfigApplicationContext applicationContext) {
        String[] names = applicationContext.getBeanDefinitionNames();
        for (String name : names) {
            System.out.println(name);
        }
    }
```
4) 运行测试方法：
```
mainConfig2
com.liuzhuo.bean.Color
person
bier
```

观察结果：发现Color组件已经注册到容器中了，而且id名是全类名。

---

点击@Import。
```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Import {
    Class<?>[] value();
}

```
发现，@Import中的value是一个Class类型的数组，说明可以注入多个Class类型  

1）现在，在com.liuzhuo.bean包下，再创建一个Red类：
```java
public class Red {
    
}
```

2）修改配置类MainConfig2：
```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
@Import({Color.class, Red.class})
public class MainConfig2 
```
3) 运行测试方法testImport:
```
mainConfig2
com.liuzhuo.bean.Color
com.liuzhuo.bean.Red
person
bier
```
结果：Red类也被注册到容器中了。

---

#### 二、ImportSelect

ImportSelect：返回要导入的全类名数组。

在@Import的value属性中，导入实现了ImportSelect接口的类，该实现类返回我们需要导入的组件的全类名即可。

1）在com.liuzhuo.condition包下，创建MyImportSelect类并实现ImportSelect接口：
```java
public class MyImportSelect implements ImportSelector {

    /*
    * annotationMetadata:获取注解的信息。
    * 返回值：全类名的字符串数组
    * */
    @Override
    public String[] selectImports(AnnotationMetadata annotationMetadata) {

        //返回值不能是null，否则会出空指针异常
        return new String[0];
    }
}
```

2) 在com.liuzhuo.bean包下，创建Bule、Yellow类。

3）修改selectImports方法是返回值：
```java
public class MyImportSelect implements ImportSelector {

    /*
    * annotationMetadata:获取注解的信息。
    * 返回值：全类名的字符串数组
    * */
    @Override
    public String[] selectImports(AnnotationMetadata annotationMetadata) {

        //返回值不能是null，否则会出空指针异常
        return new String[]{"com.liuzhuo.bean.Blue","com.liuzhuo.bean.Yellow"};
    }
}
```
4) 修改配置类MainConfig2:(添加类MyImportSelect类)
```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
@Import({Color.class, Red.class, MyImportSelect.class})
public class MainConfig2
```
5)运行测试方法testImport:

结果：
```
mainConfig2
com.liuzhuo.bean.Color
com.liuzhuo.bean.Red
com.liuzhuo.bean.Blue
com.liuzhuo.bean.Yellow
person
bier
```
发现：Blue、Yellow也被注册到容器中了。

---

#### 三、ImportBeanDefinitionRegistrar  

ImportBeanDefinitionRegistrar ：手动注册Bean。

使用的形式与ImportSelect类似。

1）在com.liuzhuo.condition包下，创建MyImportBeanDefinitionRegistrar类实现ImportBeanDefinitionRegistrar接口。  
```java
public class MyImportBeanDefinitionRegistrar implements ImportBeanDefinitionRegistrar {
    /*
    *
    * importingClassMetadata:注解类的信息
    * registry：注册组件，使用register.registerBeanDefinition()方法，手动注册Bean。
    * */
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {

    }
}
```

2)在com.liuzhuo.bean包下，创建RainBow类。
```java
public class RainBow {

}
```
3) 修改registerBeanDefinitions方法：
```java
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {

        /*
         * 这里，我们根据是否有Bule和Yellow组件来注册RainBow组件。
         * */

        //注意这里传入的是Bean的id。
        boolean b = registry.containsBeanDefinition("com.liuzhuo.bean.Blue");
        boolean y = registry.containsBeanDefinition("com.liuzhuo.bean.Yellow");
        if (b && y) {
            //两个参数：String beanName
            //         BeanDefinition beanDefinition
            // beanName：要注册的Bean的id
            //beanDefinition:Bean的定义。是一个接口，我们需要传入一个实现类。
            RootBeanDefinition rootBeanDefinition = new RootBeanDefinition(RainBow.class);
            registry.registerBeanDefinition("rainBow", rootBeanDefinition);
        }
    }
```
4) 修改配置类MainConfig2：(MyImportBeanDefinitionRegistrar.class)
```java
//配置类==配置文件
@Configuration   //告诉spring这是一个配置类，用来生成bean
@Import({Color.class, Red.class, MyImportSelect.class, MyImportBeanDefinitionRegistrar.class})
public class MainConfig2
```
5) 运行测试方法testImport:
```
mainConfig2
com.liuzhuo.bean.Color
com.liuzhuo.bean.Red
com.liuzhuo.bean.Blue
com.liuzhuo.bean.Yellow
person
bier
rainBow
```
结果：发现rainBow已经被注册到容器中了。

---

### FactoryBean

第四种方法给容器注册Bean.

使用Spring提供的FactoryBean（工厂Bean） 
 &nbsp;&nbsp;&nbsp;&nbsp;1）默认获取的是工厂bean调用getObject创建的对象  
 &nbsp;&nbsp;&nbsp;&nbsp;2）要想获取工厂Bean本身，需要给id前面加一个&

---

1) 在com.liuzhuo.bean包下，创建ColorFactoryBean类，实现FactoryBean接口：
```java
public class ColorFactoryBean implements FactoryBean<Color> {

    //返回的Bean对象
    @Override
    public Color getObject() throws Exception {
        return new Color();
    }

    //Bean的类型
    @Override
    public Class<?> getObjectType() {
        return Color.class;
    }

    //是否是单例：
    //true:单例
    //false:多例
    @Override
    public boolean isSingleton() {
        return true;
    }
}

```
2) 注册ColorFactoryBean到容器中，在配置文件MainConfig2中：
```java
    @Bean
    public ColorFactoryBean colorFactoryBean() {
        return new ColorFactoryBean();
    }
```
3) 修改testImport方法：
```java
    @Test
    public void testImport() {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(MainConfig2.class);
        printBeanName(applicationContext);


        Object colorFactoryBean = applicationContext.getBean("colorFactoryBean");
        System.out.println(colorFactoryBean);
    }
```
4) 结果：
```
mainConfig2
com.liuzhuo.bean.Color
com.liuzhuo.bean.Red
com.liuzhuo.bean.Blue
com.liuzhuo.bean.Yellow
person
bier
colorFactoryBean
rainBow
com.liuzhuo.bean.Color@6107227e
```

发现：com.liuzhuo.bean.Color@6107227e 已经注册到容器中了。
<font color="red">**注意：我们注册到容器中的是ColorFactoryBean，但是获取Bean的时候，却是Color。**</font>

底层是调用ColorFactoryBean的getObject()来获取的。

如果就是想要获取ColorFactoryBean本身的话，在id前面加一个&：
```java
        Object colorFactoryBean = applicationContext.getBean("colorFactoryBean");
        System.out.println(colorFactoryBean);
        Object colorFactoryBean2 = applicationContext.getBean("&colorFactoryBean");
        System.out.println(colorFactoryBean2);
```
结果：
```
com.liuzhuo.bean.Color@6107227e
com.liuzhuo.bean.ColorFactoryBean@7c417213
```

ps:点击BeanFactory：
会发现有一个字段：
`String FACTORY_BEAN_PREFIX = "&";`
这就是为啥加&会获取FactoryBean本身的原因.