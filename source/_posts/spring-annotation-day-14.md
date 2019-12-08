---
title: spring_annotation_day_14
date: 2018-10-20 10:44:10
categories: spring_annotation
tags: spring_annotation
summary: 今天来学习Spring的声明式事务
---

**Spring注解开发** 

今天来学习Spring的声明式事务。

#### 不使用事务

环境搭建

1）导入相关依赖

数据源、数据驱动、Spring-jdbc模块.
数据源、数据驱动之前已经导入过，现在只需要Spring-jdbc模块.
```
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>5.1.1.RELEASE</version>
        </dependency>
```
2）创建com.liuzhuo.tx包，并创建TxConfig类：
```java
@Configuration
@ComponentScan("com.liuzhuo.tx")
public class TxConfig {

    //c3p0的数据源
    @Bean
    public DataSource dataSource() throws Exception {
        ComboPooledDataSource dataSource = new ComboPooledDataSource();
        dataSource.setUser("root");
        dataSource.setPassword("123456");
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2B8");
        dataSource.setDriverClass("com.mysql.jdbc.Driver");
        return dataSource;
    }

    //注入jdbcTemplate模板
    @Bean
    public JdbcTemplate jdbcTemplate() throws Exception {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource());
        return jdbcTemplate;
    }
}
```

**注意，这里的数据链接url，必须加上?serverTimezone=GMT%2B8，这是在使用MySQL 8.0以上版本时候必须加上的，否则会出现时区问题！！！！**

3）在com.liuzhuo.tx包下，创建UserService和UserDao类：
```java
@Service
public class UserService {

    @Autowired
    private UserDao userDao;

    public void insertUser(){
        userDao.insert();
        System.out.println("插入成功!!!!");
    }
}
```

```java
@Repository
public class UserDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void insert() {
        String sql = "insert into tbl_user(username,age) VALUES(?,?);";
        String username = UUID.randomUUID().toString().substring(0, 4);
        int age = 16;
        jdbcTemplate.update(sql, username, age);
    }
}
```

4) 创建新的测试类IoCTest_TX：

```java
public class IoCTest_TX {

    @Test
    public void test01() {
        AnnotationConfigApplicationContext applicationContext = new 
            AnnotationConfigApplicationContext(TxConfig.class);

        UserService userService = applicationContext.getBean(UserService.class);
        userService.insertUser();

        applicationContext.close();

    }
}
```

5) 运行测试方法：
```
十月 20, 2018 10:42:43 上午 org.springframework.context.annotation.AnnotationConfigApplicationContext prepareRefresh
信息: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Sat Oct 20 10:42:43 CST 2018]; root of context hierarchy
十月 20, 2018 10:42:43 上午 org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor <init>
信息: JSR-330 'javax.inject.Inject' annotation found and supported for autowiring
十月 20, 2018 10:42:43 上午 com.mchange.v2.log.MLog 
信息: MLog clients using java 1.4+ standard logging.
十月 20, 2018 10:42:44 上午 com.mchange.v2.c3p0.C3P0Registry 
信息: Initializing c3p0-0.9.5.2 [built 08-December-2015 22:06:04 -0800; debug? true; trace: 10]
十月 20, 2018 10:42:44 上午 com.mchange.v2.c3p0.impl.AbstractPoolBackedDataSource 
信息: Initializing c3p0 pool... com.mchange.v2.c3p0.ComboPooledDataSource [ acquireIncrement -> 3, acquireRetryAttempts -> 30, acquireRetryDelay -> 1000, autoCommitOnClose -> false, automaticTestTable -> null, breakAfterAcquireFailure -> false, checkoutTimeout -> 0, connectionCustomizerClassName -> null, connectionTesterClassName -> com.mchange.v2.c3p0.impl.DefaultConnectionTester, contextClassLoaderSource -> caller, dataSourceName -> 2s4fkk9y13rx1eqqia0s|69b2283a, debugUnreturnedConnectionStackTraces -> false, description -> null, driverClass -> com.mysql.jdbc.Driver, extensions -> {}, factoryClassLocation -> null, forceIgnoreUnresolvedTransactions -> false, forceSynchronousCheckins -> false, forceUseNamedDriverClass -> false, identityToken -> 2s4fkk9y13rx1eqqia0s|69b2283a, idleConnectionTestPeriod -> 0, initialPoolSize -> 3, jdbcUrl -> jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2B8, maxAdministrativeTaskTime -> 0, maxConnectionAge -> 0, maxIdleTime -> 0, maxIdleTimeExcessConnections -> 0, maxPoolSize -> 15, maxStatements -> 0, maxStatementsPerConnection -> 0, minPoolSize -> 3, numHelperThreads -> 3, preferredTestQuery -> null, privilegeSpawnedThreads -> false, properties -> {user=******, password=******}, propertyCycle -> 0, statementCacheNumDeferredCloseThreads -> 0, testConnectionOnCheckin -> false, testConnectionOnCheckout -> false, unreturnedConnectionTimeout -> 0, userOverrides -> {}, usesTraditionalReflectiveProxies -> false ]
Loading class `com.mysql.jdbc.Driver'. This is deprecated. The new driver class is `com.mysql.cj.jdbc.Driver'. The driver is automatically registered via the SPI and manual loading of the driver class is generally unnecessary.
Sat Oct 20 10:42:45 CST 2018 WARN: Establishing SSL connection without server's identity verification is not recommended. According to MySQL 5.5.45+, 5.6.26+ and 5.7.6+ requirements SSL connection must be established by default if explicit option isn't set. For compliance with existing applications not using SSL the verifyServerCertificate property is set to 'false'. You need either to explicitly disable SSL by setting useSSL=false, or set useSSL=true and provide truststore for server certificate verification.
Sat Oct 20 10:42:45 CST 2018 WARN: Establishing SSL connection without server's identity verification is not recommended. According to MySQL 5.5.45+, 5.6.26+ and 5.7.6+ requirements SSL connection must be established by default if explicit option isn't set. For compliance with existing applications not using SSL the verifyServerCertificate property is set to 'false'. You need either to explicitly disable SSL by setting useSSL=false, or set useSSL=true and provide truststore for server certificate verification.
Sat Oct 20 10:42:45 CST 2018 WARN: Establishing SSL connection without server's identity verification is not recommended. According to MySQL 5.5.45+, 5.6.26+ and 5.7.6+ requirements SSL connection must be established by default if explicit option isn't set. For compliance with existing applications not using SSL the verifyServerCertificate property is set to 'false'. You need either to explicitly disable SSL by setting useSSL=false, or set useSSL=true and provide truststore for server certificate verification.
插入成功!!!!
十月 20, 2018 10:42:45 上午 org.springframework.context.annotation.AnnotationConfigApplicationContext doClose
信息: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@6d1e7682: startup date [Sat Oct 20 10:42:43 CST 2018]; root of context hierarchy

```

看到插入成功，打开数据库也能发现数据库中多了一条新的记录。

ps：以上操作是建立在本地存在数据库test，和一个表，表的字段有: id自增，username用户名，age用户的年龄，这里就不详细描述数据库的创建过程了。

---

6）修改UserService类：
添加 int res = 1 / 0;
```java
@Service
public class UserService {

    @Autowired
    private UserDao userDao;

    public void insertUser() {
        userDao.insert();
        System.out.println("插入成功!!!!");
        int res = 1 / 0;
    }
}
```

7）再次运行测试方法：
```
插入成功!!!!

java.lang.ArithmeticException: / by zero

	at com.liuzhuo.tx.UserService.insertUser(UserService.java:21)
	at com.liuzhuo.test.IoCTest_TX.test01(IoCTest_TX.java:23)
```
**会出现异常。打开数据库，发现还是会添加一条新的记录，这是因为没有添加事务的原因。**

### 使用事务

1）修改UserService类：
添加@Transactional注解
```java
@Service
public class UserService {

    @Autowired
    private UserDao userDao;

    @Transactional
    public void insertUser() {
        userDao.insert();
        System.out.println("插入成功!!!!");
        int res = 1 / 0;
    }
}
```

2) 运行测试方法：
```
插入成功!!!!

java.lang.ArithmeticException: / by zero
```
出现ArithmeticException异常，打开数据库，发现还是会添加一条数据，说明事务还没有添加上去，**因为没有开启注解时事务**。

3）修改配置类
添加@EnableTransactionManagement注解
```java
@Configuration
@ComponentScan("com.liuzhuo.tx")
@EnableTransactionManagement
public class TxConfig 
```

4) 运行测试方法：
```
No qualifying bean of type 'org.springframework.transaction.PlatformTransactionManager' available
```
发现出现没有PlatformTransactionManager这个组件的异常，此时虽然数据库没有添加一条数据，但是是出现了其他异常，而不是出现ArithmeticException异常。


出现没有PlatformTransactionManager这个组件异常，说明我们还需要配置事务管理器。

5) 添加事务管理器
```java
   //添加事务管理器
    @Bean
    public PlatformTransactionManager transactionManager() throws Exception {
        return new DataSourceTransactionManager(dataSource());
    }
```

6) 运行测试方法：
```
插入成功!!!!

java.lang.ArithmeticException: / by zero
```
出现了ArithmeticException异常，打开数据库，发现也没有添加新的一条记录，说明事务起作用了。

### 总结

使用事务的步骤：

1. 添加相关的依赖(Spring-jdbc)
2. 配置数据源、事务管理器(PlatformTransactionManager)
3. 开始注解式事务(@EnableTransactionManagement)
4. 给相关的方法添加@Transactional注解

---

### 事务原理

点击@EnableTransactionManagement注解：
```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import({TransactionManagementConfigurationSelector.class})
public @interface EnableTransactionManagement {
    boolean proxyTargetClass() default false;

    AdviceMode mode() default AdviceMode.PROXY;

    int order() default 2147483647;
}
```
@Import({TransactionManagementConfigurationSelector.class})
```java
	@Override
	protected String[] selectImports(AdviceMode adviceMode) {
		switch (adviceMode) {
			case PROXY:
				return new String[] {AutoProxyRegistrar.class.getName(),
						ProxyTransactionManagementConfiguration.class.getName()};
			case ASPECTJ:
				return new String[] {determineTransactionAspectClass()};
			default:
				return null;
		}
	}
```
会导入AutoProxyRegistrar和ProxyTransactionManagementConfiguration两个组件。

1）AutoProxyRegistrar会给容器注入InfrastructureAdvisorAutoProxyCreator组件（也是一个后置处理器）。

InfrastructureAdvisorAutoProxyCreator组件利用后置处理器机制在对象创建时，包装对象，返回一个代理对象（增强器），代理对象执行方法利用拦截器链执行。

2）ProxyTransactionManagementConfiguration

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;给容器注入事务增强器  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;事务增强器要用事务注解的信息  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;事务拦截器：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TransactionInterceptor：保存了事务属性信息，事务管理器  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;它是一个MethodInterceptor   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在目标方法执行的时候：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;执行拦截器链：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;事务拦截器：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;先获取事务相关的属性  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;再获取事务管理器  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;执行目标方法：  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;如果异常，获取事务管理器，回滚  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;如果正常，利用事务管理器，提交事务

