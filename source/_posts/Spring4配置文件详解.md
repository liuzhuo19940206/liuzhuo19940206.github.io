---
title: Spring4配置文件详解
date: 2018-10-19 21:10:14
categories: Spring
tags: Spring
summary: Spring4中的各种配置文件
---

总结Spring4中的各种配置文件的信息。

欢迎大家补充，完善各种配置信息。

好的习惯，将会伴随你的一生。

开始今天的主题！！！


### 配置数据源

---

基本的加载properties配置文件

```
<context:property-placeholder location="classpath*:/appConfig.properties" />
```

#### JNDI方式
```
<jee:jndi-lookup id="dataSource" jndi-name="/jdbc/mysqlDS" resource-ref="true"/>
```
jndi-name：指定JNDI中资源名称

resource-ref：如果应用程序运行在java应用程序服务器中，值设为true，这样jndi-name会自动加上java:comp/env/前缀

#### 数据连接池方式

##### DBCP连接池：

使用：org.apache.commons.dbcp.BasicDataSource进行配置
```
<bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">

  <!-- 【必须】  数据库驱动-->
  <property name="driverClassName" value="${jdbc.driver}" />

  <!-- 【必须】 数据库连接地址 -->
  <property name="url" value="${jdbc.url}" />

  <!-- 【必须】 数据库用户名 -->
  <property name="username" value="${jdbc.username}" />

  <!-- 【必须】 数据库密码 -->
  <property name="password" value="${jdbc.password}" />

  <!-- 可选 启动时创建的连接数 -->
  <property name="initialSize" value="5"/>

  <!-- 可选 同时可从池中分配的最多连接数，0无限制 -->
  <property name="maxActive" value="10"/>

  <!-- 可选 池中不会被释放的最多空闲连接数 0无限制 -->
  <property name="maxIdle" value=""/>

  <!-- 可选 同时能从语句池中分配的预处理语句最大值，0无限制 -->
  <property name="maxOpenPreparedStatement" value="100"/>

  <!-- 可选 抛异常前池等待连接回收最大时间（当无可用连接），-1无限等待 -->
  <property name="maxWait" value="1000"/>

  <!-- 可选 连接在池中保持空闲而不被回收的最大时间 -->
  <property name="minEvictableIdleTimeMillis" value="2000"/>

  <!-- 可选 不创建新连接情况下池中保持空闲的最小连接数 -->
  <property name="minIdle" value="2"/>

  <!-- 可选 布尔值，是否对预处理语句进行池管理 -->
  <property name="poolPreparedStatements" value="true"/>

</bean>
```

##### C3P0连接池：

使用：com.mchange.v2.c3p0.ComboPooledDataSource进行配置
```
<bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource" destroy-method="close">

  <property name="driverClass" value="${jdbc.driver}" />
  <property name="jdbcUrl" value="${jdbc.url}" />
  <property name="user" value="${jdbc.username}" />
  <property name="password" value="${jdbc.password}" />
  
</bean>
```

##### alibaba DRUID连接池：

使用：com.alibaba.druid.pool.DruidDataSource进行配置
```
<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">  

   <!-- 基本属性 url、user、password --> 
   <property name="url" value="${jdbc_url}" /> 
   <property name="username" value="${jdbc_user}" /> 
   <property name="password" value="${jdbc_password}" /> 
   <!-- 配置初始化大小、最小、最大 --> 
   <property name="initialSize" value="1" /> 
   <property name="minIdle" value="1" />  
   <property name="maxActive" value="20" /> 
   <!-- 配置获取连接等待超时的时间 --> 
   <property name="maxWait" value="60000" /> 
   <!-- 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒 --> 
   <property name="timeBetweenEvictionRunsMillis" value="60000" /> 
   <!-- 配置一个连接在池中最小生存的时间，单位是毫秒 --> 
   <property name="minEvictableIdleTimeMillis" value="300000" /> 
   <property name="validationQuery" value="SELECT 'x'" /> 
   <property name="testWhileIdle" value="true" /> 
   <property name="testOnBorrow" value="false" /> 
   <property name="testOnReturn" value="false" /> 
   <!-- 打开PSCache，并且指定每个连接上PSCache的大小 --> 
   <property name="poolPreparedStatements" value="true" /> 
   <property name="maxPoolPreparedStatementPerConnectionSize" value="20" /> 
   <!-- 配置监控统计拦截的filters，去掉后监控界面sql无法统计 --> 
   <property name="filters" value="stat" />  

</bean>
```
#### JDBC驱动的数据源

使用：

org.springframework.jdbc.datasource.SingleConnectionDataSource【每个链接请求会返回同一个连接，不推荐】

org.springframework.jdbc.datasource.DriverManagerDataSource进行配置
```
<bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">

  <property name="driverClassName" value="${jdbc.driver}" />
  <property name="url" value="${jdbc.url}" />
  <property name="username" value="${jdbc.username}" />
  <property name="password" value="${jdbc.password}" />

</bean>
```

### 操作数据库

---

#### spring JDBC模板

模板类选择：

JdbcTemplate：提供最简单的数据访问等功能。

NamedParameterJdbcTemplate：通过该模板，可以把参数作为查询的条件传入方法中。

SimpleJdbcTemplate（推荐）：结合了一些自动装箱等功能，2.5以后，整合了NamedParameterJdbcTemplate。

配置方式：
```
<bean id="jdbcTemplate" class="org.springframework.jdbc.core.simple.SimpleJdbcTemplate">
  <constructor-arg ref="dataSource"/>
</bean>
```


#### 与ORM框架集成

主要是配置spring的Session工厂（sessionFactory），可以使用到诸如延迟加载、预先抓取、级联复杂特性。

spring对ORM框架的支持提供提供了一些附加服务：

spring声明式事务集成支持

透明的异常处理

线程安全、轻量级的模板类

DAO支持

资源管理

##### 集成Hibernate方式：[hibernate4为例]

hibernate的HBM文件配置方式（Xxx.hbm.xml)：
```
<bean id="sessionFactory" class="org.springframework.orm.hibernate4.LocalSessionFactoryBean">

  <!-- 数据源 -->
  <property name="dataSource" ref="dataSource" />
  <!-- 映射文件形式-->
  <property name="mappingResources">
     <list>
        <value>User.hbm.xml</value>
     </list>
  </property>
  <!-- Hibernate属性配置 -->
  <property name="hibernateProperties">
     <props>
         <prop key="dialect">
            org.hibernate.dialect.MySQLDialect <!-- 数据库方言 -->
         </prop>
        <!-- ……其他 -->
     </props>
  </property>

</bean>
```

代码中使用注解的方式：
```
<bean id="sessionFactory" class="org.springframework.orm.hibernate4.LocalSessionFactoryBean">

  <!-- 数据源 -->
  <property name="dataSource" ref="dataSource" />  
  <!-- 自动扫描实体对象 tdxy.bean的包结构中存放实体类  -->
  <property name="packagesToScan" value="com.test.entity"/>
  <!-- hibernate的相关属性配置 -->
  <property name="hibernateProperties">
     <value>
        <!-- 设置数据库方言 -->
        hibernate.dialect=org.hibernate.dialect.MySQLDialect
        <!-- 设置自动创建|更新|验证数据库表结构 -->
        hibernate.hbm2ddl.auto=update                 
        <!-- 是否在控制台显示sql -->
        hibernate.show_sql=true                 
        <!-- 是否格式化sql，优化显示 -->
        hibernate.format_sql=true                
        <!-- 是否开启二级缓存 -->
        hibernate.cache.use_second_level_cache=false                
        <!-- 是否开启查询缓存 -->
        hibernate.cache.use_query_cache=false                
        <!-- 数据库批量查询最大数 -->
        hibernate.jdbc.fetch_size=50
        <!-- 数据库批量更新、添加、删除操作最大数  -->
        hibernate.jdbc.batch_size=50                
        <!-- 是否自动提交事务  -->
        hibernate.connection.autocommit=true
        <!-- 指定hibernate在何时释放JDBC连接  -->
        hibernate.connection.release_mode=auto
        <!-- 创建session方式 hibernate4.x 的方式  -->
        hibernate.current_session_context_class=org.springframework.orm.hibernate4.SpringSessionContext
        <!-- javax.persistence.validation.mode默认情况下是auto的，就是说如果不设置的话它是会自动去你的classpath下面找一个bean-validation**包，所以把它设置为none即可  -->
        javax.persistence.validation.mode=none            
     </value>
  </property>
</bean>
```

针对少量实体类，还可以通过annotatedClasses属性来将应用程序中所有的持久化类以全局定名的方式明确列出：
```
<property name="annotatedClasses">
  <list>
     <value>com.demo.entity.User</value>
     <value>com.demo.entity.Blog</value>
  </list>
</property>
```

**推荐使用packagesToScan属性扫描包方式。**

【构建不依赖于spring的Hibernate代码】
```
package com.demo.dao;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.demo.entity.User;

@Repository
public class UserDaoImpl implements IUserDao  {

  private SessionFactory sessionFactory;

  // 构造注入
  @Autowired
  public UserDaoImpl(SessionFactory sessionFactory) {
     this.sessionFactory = sessionFactory;
  }

  private Session currentSession(){
     return sessionFactory.getCurrentSession();
  }

  @Override
  public void addUser(User param) {
     Session session = currentSession();
     session.save(param);
     System.out.println("Add User");
  }

  @Override
  public User get(Integer id) {
     return (User) currentSession().get(User.class, id);
  }

  @Override
  public void save(User user) {
     currentSession().update(user);
  }

}
```

还需配置：
```
<context:component-scan base-package="com.demo.dao"/>
```
就会像扫描其他注解一样扫描带@Repository注解的类到容器中。

##### 集成MyBatis方式

```
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean"
  p:dataSource-ref="dataSource" p:configLocation="classpath:mybatis-config.xml"
  p:mapperLocations="classpath:com/demo/dao/*.xml" />

<!-- spring与mybatis整合配置，扫描所有dao -->
<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer"
  p:basePackage="com.demo.dao" p:sqlSessionFactoryBeanName="sqlSessionFactory" />
```

#### 与其他JPA集成方式

配置实体管理工厂

应用程序管理类型的JPA（LocalEntityManagerFactoryBean）：它的EntityManager是由EntityManagerFactory创建的；

容器管理类型的JPA（LocalContainerEntityManagerFactoryBean）：通过PersistenceProvider的createEntityManagerFactory()方法得到，即它的EntityManagerFactory是通过PersistenceProvider的createContainerEntityManagerFactory()方法得到。

使用应用程序管理类型的JPA

绝大部分配置文件来源于名为persistence.xml的配置文件，这个文件位置必须位于类路径下的WETA-INF目录下
```
<?xml version="1.0" encoding="UTF-8"?>
<persistence version="2.0"
     xmlns="http://java.sun.com/xml/ns/persistence"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://java.sun.com/xml/ns/persistence http://java.sun.com/xml/ns/persistence/persistence_2_0.xsd">
     
  <persistence-unit name="persistenceUnit" transaction-type="RESOURCE_LOCAL">

     <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>

     <properties>
        <property name="hibernate.dialect" value="org.hibernate.dialect.MySQL5Dialect" />
        <property name="hibernate.max_fetch_depth" value="3"/>
        <property name="hibernate.hbm2ddl.auto" value="update"/>
        <property name="hibernate.jdbc.fetch_size" value="18"/>
        <property name="hibernate.jdbc.batch_size" value="10"/>
        <property name="hibernate.show_sql" value="false"/>
        <property name="hibernate.format_sql" value="false"/>
     </properties>

     <class>com.demo.entity.User</class>
     <class>com.demo.entity.Blog</class>
     <!-- …… ……-->
   </persistence-unit>

</persistence>
```

这样在spring的配置文件中配置的信息就很少了：
```
<bean id="demo" class="org.springframework.orm.jpa.LocalEntityManagerFactoryBean">
  <property name="persistenceUnit" >
</bean>
```

【TIPS】上面persistence.xml文件中的配置会出现问题：

如果每次请求EntityManagerFactory时都要定义持久化单元，代码回迅速膨胀

借助spring对JPA的支持，不再需要直接处理PersistenceProvider了，就是下面的容器管理的JPA！

使用容器管理类型的JPA

将数据源信息配置在spring的应用上下文中，而不是在persistence.xml文件中。
```
<bean id="emf" class="org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean">
  <property name="dataSource" ref="dataSource"/>
   <!-- 指定使用的是哪一个厂商的JPA实现 如Hibernate -->
  <property name="jpaVendorAdapter" ref="hibernateJpaVendorAdapter"/>
</bean>
```

配置JPA实现：

可选的有：EclipseLinkJpaVendorAdapter、HibernateJpaVendorAdapter、OpenJpaVendorAdapter、TopLinkJpaVendorAdapter

```
<bean id="hibernateJpaVendorAdapter" class="org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter">
  <property name="database" value="MYSQL"/>
  <property name="showSql" value="true"/>
  <property name="generateDdl" value="true"/>
  <property name="databasePlatform" value="org.hibernate.dialect.MySQL5Dialect"/>
</bean>
```

【TIPS】database属性：属性值表示支持哪种数据库，下面Hibernate的JPA是一些支持的数据库：
<img src="http://pp66ww0jt.bkt.clouddn.com/20181019214107.png"/>

**【注】JNDI获取实体管理工厂：**

如果spring应用部署在应用服务器中，Spring可能已经创建好EntityManagerFactory并将其置于JNDI中等饭查询使用，这种情况可使用JNDI来获取对EntityManagerFactory的引用：
```
<jee:jndi-lookup id="emf" jndi-name="persistence/testDS"/>
```

编写基于JPA的DAO
```
package com.demo.dao;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.demo.entity.User;

@Repository
@Transactional
public class JpaDao implements IUserDao {

  // 注入EntityManager
  @PersistenceContext
  private EntityManager em;

  // 使用EntityManager
  @Override
  public void addUser(User param) {
     em.persist(param);
  }

  @Override
  public User get(Integer id) {
     return em.find(User.class, id);
  }

  @Override
  public void save(User user) {
     em.merge(user);
  }

}
```

上面使用到了@PersistenceContext注解将EntityManager注入。

这样用需要在spring的上下文配置文件中配置一个PersistenceAnnotationBeanPostProcessor：
```
<!-- 使用EntityManager -->
<bean class="org.springframework.orm.jpa.support.PersistenceAnnotationBeanPostProcessor"/>
```

以上，是如何使用JDBC、Hibernate或JPA为spring应用程序构建持久层，至于选择哪种方案完全取决于偏好.

### Spring事务管理

通过毁掉机制将实际事务实现从事务性代码中抽象出来。

#### 选择事务管理器

事务管理器结构

事务处理流程：

开始事务->绑定资源->使用资源->完成事务->释放资源

##### JDBC事务
```
<bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
     <property name="dataSource" ref="dataSource"/>
</bean>
```
DataSourceTransactionManager通过调用java.sql.Connection来管理事务，由java.sql.Connection对象来提交、回滚事务。

##### Hibernate事务
```
<bean id="transactionManager"
class="org.springframework.orm.hibernate4.HibernateTransactionManager">
  <property name="sessionFactory" ref="sessionFactory" />
</bean>
```

HibernateTransactionManager通过将事务管理的职责委托给org.hibernate.Transaction对象，org.hibernate.Transaction对象从Hibernate Session中获取，然后由Transaction对象来提交、回滚事务。

##### JPA事务
```
<bean id="transactionManager" class="org.springframework.orm.jpa.JpaTransactionManager">
  <property name="entityManagerFactory" ref="entityManagerFactory"/>
</bean>
```
JpaTransactionManager只需要装配一个JPA实体管理工厂（EntityManagerFactory的任意实现），然后与由工厂产生的JPA EntityManager合作构建事务。

如果你还希望将事务应用于简单JDBC操作（JDBC操作使用的datasource和EntityManagerFactory使用的dataSource必须相同），那么JpaTransactionManager必须装配一个JpaDialect的实现：
```
<bean id="jpaDialect" class="org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter"/>


<!--然后将jpaDialect装配到transactionManager中 -->
<bean id="transactionManager" class="org.springframework.orm.jpa.JpaTransactionManager">
  <property name="entityManagerFactory" ref="entityManagerFactory"/>
  <property name="jpaDialect" ref="jpaDialect"/>
</bean>
```


##### JTA事务

如果前面的事务管理器不能满足需求或事物需要跨多个事务资源（两个及以上数据库），需要使用JtaTrasactionManager了：
```
<bean id="transactionManager"
  class="org.springframework.transaction.jta.JtaTransactionManager">
  <property name="transactionManagerName" value="java:/TrasactionManager"/>
</bean>
```
JtaTransactionManager将事务委托给一个JTA的实现（java.transaction.UserTransaction和javax.transaction.TransactionManager），通过UserTransaction来操作事务。JTA规定了应用程序晕一个或多个数据源之间协调事务的标准API，transactionManagerName属性指定了要在JNDI上查找JTA事务管理器。

#### Spring事务实现方式


1）编码事务

通过TransactionTemplate的回调机制，例如：（UserSeriveImpl.java）
```
public void addUser(final User u) {

  TransactionTemplate temp = new TransactionTemplate();
  
  temp.execute(new TransactionCallback<Void>() {
  
     @Override
     public Void doInTransaction(TransactionStatus txtStatus) {
          // 要执行的事务代码
        try {
           userDao.save(u);
        } catch (RuntimeException e) {
           e.printStackTrace();
           txtStatus.setRollbackOnly();
        }
        return null;
     }
  });
}
```

此时UserService需要如下装配：
```
<bean id="userSerive" class="com.demo.service.UserServiceImpl">
  <property name="transactionTemplate">
     <bean class="org.springframework.transaction.support.TransactionTemplate">
        <property name="transactionManager" ref="transactionManager"/>
     </bean>
  </property>
</bean>
```

优点：可以完全控制事务边界，精确控制事务。

缺点：侵入性的，事务控制在代码中实现，耦合度高

2）声明式事务

传播行为

传播行为回答了新的事务是该被启动还是被挂起，或者方法是否要在事务环境中运行。

事务的传播行为都在org.springframework.transaction.TransactionDefinition接口中以常量的方式定义出来。

隔离级别

隔离级别定义了一个事务可能受其他并发事务影响的程度。

隔离级别都在org.springframework.transaction.TransactionDefinition接口中以常量的方式定义出来。

只读

事务启动的时候由数据库实施的，只有针对具备启动一个新事务传播行为（PROPAGATION_REQUIRED、PROPAGATION_REQUIRES_NEW和PROPAGATION_NESTED）的方法来说才有意义。【tips】如果使用Hibernate，将事务声明为只读会导致flush模式被设置为FLUSH_NEVER，这会告诉hibernate避免和数据库进行不必要的对象同步，并将所有的更新延迟到事务结束。

事务超时

长时间事务会导致一些不必要的数据库资源占用。

超时时钟会在事务开始时启动，只有针对具备启动一个新事务传播行为（PROPAGATION_REQUIRED、PROPAGATION_REQUIRES_NEW和PROPAGATION_NESTED）的方法来说才有意义。

回滚规则

这些规则定义了哪些异常会导致事务回滚哪些不会，默认情况下，运行时异常会回滚，检查异常不回滚，但是可以声明事务遇到检查异常回滚，运行时异常不回滚。

3）Spring在XML中定义事务

需要包括beans、aop、tx命名空间。
```
<tx:advice id="txAdvice" transaction-manager="transactionManager">
  <tx:attributes>
     <!-- 事务执行方式 REQUIRED：指定当前方法必需在事务环境中运行，
     如果当前有事务环境就加入当前正在执行的事务环境，
     如果当前没有事务，就新建一个事务。 这是默认值。 -->
     <tx:method name="create*" propagation="REQUIRED" />
     <tx:method name="save*"   propagation="REQUIRED" />
     <tx:method name="add*"    propagation="REQUIRED" />
     <tx:method name="update*" propagation="REQUIRED" />
     <tx:method name="remove*" propagation="REQUIRED" />
     <tx:method name="del*"    propagation="REQUIRED" />
     <tx:method name="import*" propagation="REQUIRED" />
     <!-- 指定当前方法以非事务方式执行操作，如果当前存在事务，就把当前事务挂起，等我以非事务的状态运行完，再继续原来的事务。 查询定义即可
        read-only="true" 表示只读 -->
     <tx:method name="*"       propagation="NOT_SUPPORTED" read-only="true" />
  </tx:attributes>
</tx:advice>
```
其中<tx:method />有很多属性用来帮助定义方法的事务策略：
<img src="http://pp66ww0jt.bkt.clouddn.com/20181019215056.png"/>

4）定义注解驱动的事务

在XML配置文件中添加：
```
<tx:annotation-driven/>
```

可通过transaction-manager属性（默认值"transactionManager"）来指定事务管理器，如：
```
<tx:annotation-driven transaction-manager="txManager"/>
```

`<tx:annotation-driven/>`告诉Spring检查上下文中所有bean并检查使用到@Transactional注解的bean。

