---
title: spring_annotation_day_11
date: 2018-10-17 14:58:03
categories: spring_annotation
tags: spring_annotation
summary: 今天学习，@Profile注解的使用。
---
**Spring注解开发**  

今天学习，@Profile注解的使用。

### @Profile注解

Profile：Spring为我们提供的可以根据当前环境，动态的激活和切换一系列组件的功能。

比如：开发环境、测试环境、生产环境；

根据不同是环境，我们自动切换我们的数据源。

1）添加c3p0的数据源和mysql的驱动依赖：
```java
       <!-- https://mvnrepository.com/artifact/com.mchange/c3p0 -->
        <dependency>
            <groupId>com.mchange</groupId>
            <artifactId>c3p0</artifactId>
            <version>0.9.5.2</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.12</version>
        </dependency>
```

2) 创建数据源的配置dbconfig.properties：

```
db.user=root
db.password=123456
db.driverClass=com.mysql.jdbc.Driver 
```

3) 创建新的配置类MainConfigOfProfile：
```java
@Configuration
@PropertySource(value = "classpath:/dbconfig.properties")
public class MainConfigOfProfile implements EmbeddedValueResolverAware {

    @Value("${db.user}")
    private String user;

    private StringValueResolver valueResolver;
    private String driverClass;

    @Override
    public void setEmbeddedValueResolver(StringValueResolver resolver) {
        this.valueResolver = resolver;
        String driverClass = valueResolver.resolveStringValue("${db.driverClass}");
        this.driverClass = driverClass;
    }


    @Bean("testDataSource")
    public DataSource dataSourceTest(@Value("${db.password}") String pwd) throws PropertyVetoException {
        ComboPooledDataSource dataSource = new ComboPooledDataSource();
        dataSource.setUser(user);
        dataSource.setPassword(pwd);
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/test");
        dataSource.setDriverClass(driverClass);
        return dataSource;
    }

    @Bean("devDataSource")
    public DataSource dataSourceDev() throws PropertyVetoException {
        ComboPooledDataSource dataSource = new ComboPooledDataSource();
        dataSource.setUser(user);
        dataSource.setPassword("123456");
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/school");
        dataSource.setDriverClass("com.mysql.jdbc.Driver");
        return dataSource;
    }

    @Bean("proDataSource")
    public DataSource dataSourcePro() throws PropertyVetoException {
        ComboPooledDataSource dataSource = new ComboPooledDataSource();
        dataSource.setUser("root");
        dataSource.setPassword("123456");
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/sell");
        dataSource.setDriverClass("com.mysql.jdbc.Driver");
        return dataSource;
    }

}
```

上述，有三个不同环境的数据源，test，dev，pro数据源，使用了不同的方式来给数据源进行赋值。

4）创建新的测试类IoCTest_Profile:
```java
public class IoCTest_Profile {

    @Test
    public void test01() {
        AnnotationConfigApplicationContext applicationContext = 
        new AnnotationConfigApplicationContext(MainConfigOfProfile.class);
        String[] beanDefinitionNames = applicationContext.getBeanDefinitionNames();
        for (String name : beanDefinitionNames) {
            System.out.println(name);
        }
    }
}
```

5) 运行：
```
mainConfigOfProfile
testDataSource
devDataSource
proDataSource
```

说明数据源都已经注入到容器中了。

---

现在我们需要根据不同的环境，来指定加载需要的配置。

1)使用@Profile注解，是给属性、类加上一个标记的，标记这个属性或者类是属于这个环境的，只有激活了这个环境，才能被注册到容器中，默认激活default的环境，即@Profile("default"）.

2)写在配置类上的@Profile，只能在该环境激活的情况下，整个配置类才能起作用，不管配置类里面的Bean是否是符合当前环境。

3）没有标记环境的bean，在任何环境下都是加载的

**验证：**

1) 在配置类MainConfigOfProfile中，给三个数据源加上标记：
```java
@Configuration
@PropertySource(value = "classpath:/dbconfig.properties")
public class MainConfigOfProfile implements EmbeddedValueResolverAware {

    @Value("${db.user}")
    private String user;

    private StringValueResolver valueResolver;
    private String driverClass;

    @Override
    public void setEmbeddedValueResolver(StringValueResolver resolver) {
        this.valueResolver = resolver;
        String driverClass = valueResolver.resolveStringValue("${db.driverClass}");
        this.driverClass = driverClass;
    }


    @Profile("test")
    @Bean("testDataSource")
    public DataSource dataSourceTest(@Value("${db.password}") String pwd) throws PropertyVetoException {
        ComboPooledDataSource dataSource = new ComboPooledDataSource();
        dataSource.setUser(user);
        dataSource.setPassword(pwd);
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/test");
        dataSource.setDriverClass(driverClass);
        return dataSource;
    }

    @Profile("dev")
    @Bean("devDataSource")
    public DataSource dataSourceDev() throws PropertyVetoException {
        ComboPooledDataSource dataSource = new ComboPooledDataSource();
        dataSource.setUser(user);
        dataSource.setPassword("123456");
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/school");
        dataSource.setDriverClass("com.mysql.jdbc.Driver");
        return dataSource;
    }

    @Profile("pro")
    @Bean("proDataSource")
    public DataSource dataSourcePro() throws PropertyVetoException {
        ComboPooledDataSource dataSource = new ComboPooledDataSource();
        dataSource.setUser("root");
        dataSource.setPassword("123456");
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/sell");
        dataSource.setDriverClass("com.mysql.jdbc.Driver");
        return dataSource;
    }

}
```

2) 设置当前的环境：

**方法一：**  

 配置虚拟机的运行参数。

-Dspring.profiles.active=test

运行：
```
mainConfigOfProfile
testDataSource
```
此时，容器中只有testDataSource数据源了。

---

-Dspring.profiles.active=dev

运行：
```
mainConfigOfProfile
devDataSource
```
此时，容器中只有devDataSource数据源了。

**方法二：**  

使用无参数的AnnotationConfigApplicationContext容器。
```java
public class IoCTest_Profile {

    @Test
    public void test01() {
        //1.无参数
        AnnotationConfigApplicationContext applicationContext = 
        new AnnotationConfigApplicationContext();
        //2.设置环境,这里激活了test和dev
        applicationContext.getEnvironment().setActiveProfiles("test","dev");
        //3.设置配置类
        applicationContext.register(MainConfigOfProfile.class);
        //4.刷新容器
        applicationContext.refresh();


        String[] beanDefinitionNames = applicationContext.getBeanDefinitionNames();
        for (String name : beanDefinitionNames) {
            System.out.println(name);
        }
    }
}
```

运行结果：
```
mainConfigOfProfile
testDataSource
devDataSource
```

这里，test和dev数据源被激活了。