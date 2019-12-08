---
title: Mybatis的第三天作用域
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-09 19:36:51
summary: 探讨Mybatis中的各个对象的作用域和生命周期
---

探讨Mybatis中的各个对象的作用域和生命周期

今天主要来正确的理解Mybatis中的SqlSessionFactoryBuilder、SqlSessionFactory、SqlSession和Mapper的生命周期。

### SqlSessionFactoryBuilder

SqlSessionFactoryBuilder是利用xml和java编码获取资源来构建SqlSessionFactory的，通过它可以构建多个SqlSessionFactory，它的作用就是一个构建器，一旦我们构建了SqlSessionFactory，它的作用就结束了，失去了存在的意义。因此 SqlSessionFactoryBuilder 实例的最佳作用域是**`方法作用域（也就是局部方法变量）`**。你可以重用 SqlSessionFactoryBuilder 来创建多个 SqlSessionFactory 实例，但是最好还是不要让其一直存在以保证所有的 XML 解析资源开放给更重要的事情。

### SqlSessionFactory

SqlSessionFactory的作用就是创建SqlSession，而SqlSession就是一个会话，相当于JDBC中的Connection对象。每次应用程序访问数据库，我们就需要通过SqlSessionFactory创建的Sqlsession来访问数据库，所以SqlSessionFactory应该在Mybatis项目的整个生命周期中，而如果我们多次创建同一个数据库的SqlSessionFactory，则每次创建都会打开更多的数据库连接（Connection）资源，那么连接资源就会很快消耗殆尽。

SqlSessionFactory的责任是唯一的，它就是创建SqlSession的，所以我们果断采取**单例模式**。因此 SqlSessionFactory 的最佳作用域是**`应用作用域`**。有很多方法可以做到，最简单的就是使用单例模式或者静态单例模式。

### SqlSession

SqlSession就是一个会话，相当于JDBC中的Connection对象，它的生命周期应该是在请求数据库处理事务的过程中。**它是一个线程不安全的对象**，在涉及多线程的时候我们需要特别小心，操作数据库需要注意其隔离级别、数据库锁等高级特性。此外每次操作SqlSession完后，需要及时关闭它，它长期存在就会使数据库连接池的活动资源减少，对系统的性能的影响很大。正如前面的博客所说一样，往往通过finally语句块保证我们正确的关闭SqlSession。

每个线程都应该有它自己的 SqlSession 实例。SqlSession 的实例不是线程安全的，因此是不能被共享的，所以它的最佳的作用域是**`请求或方法作用域`**。绝对不能将 SqlSession 实例的引用放在一个类的静态域，甚至一个类的实例变量也不行。也绝不能将 SqlSession 实例的引用放在任何类型的管理作用域中，比如 Servlet 架构中的 HttpSession。

如果你现在正在使用一种 Web 框架，要考虑 SqlSession 放在一个和 HTTP 请求对象相似的作用域中。换句话说，每次收到的 HTTP 请求，就可以打开一个 SqlSession，返回一个响应，就关闭它。这个关闭操作是很重要的，你应该把这个关闭操作放到 finally 块中以确保每次都能执行关闭。下面的示例就是一个确保 SqlSession 关闭的标准模式：
```
SqlSession session = sqlSessionFactory.openSession();
try {
  // do work
} finally {
  session.close();
}
```

### Mapper

Mapper是一个接口，而没有任何实现类，它的作用是发送SQL语句，然后返回我们需要的结果，或者执行SQL语句从而修改数据库中的数据，因为它应该存在一个SqlSession事务方法之中，是一个方法级别的东西。它就如同JDBC中的一条SQL语句的执行，它最大的范围和SqlSession同级。尽管我们想一直保存着Mapper，但是你会发现它很难控制，所以尽量在一个SqlSession事务的方法中使用它们，然后废弃掉。所以，最好把映射器放在**`方法作用域（method scope）`**内。

```
SqlSession session = sqlSessionFactory.openSession();
try {
  BlogMapper mapper = session.getMapper(BlogMapper.class);
  // do work
} finally {
  session.close();
}
```
---

### 总结

有了上面的描述，我们已经清楚了Mybatis组件的生命周期了，如下图所示：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309202349.png"/>

---

### 实例

这里简单的做一个实例，它可以帮助我们熟悉Mybatis主要组件的用法。我们需要满足Mybatis各个组件的生命周期。首先SqlSessionFactory是单例，然后让它生成SqlSession，进而拿到映射器来完成我们的业务逻辑。

使用IDEA创建一个简单的maven项目，项目的整体结构如下：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309212333.png" style="width:50%"/>

java源码中：

* com.liuzhuo.entities  =====> 存放POJO对象

* com.liuzhuo.dao       =======> 存放java接口（Mapper）

* com.liuzhuo.util      ========> 存放工具类

resources资源中：

* com.liuzhuo.mapper   ======> 存放mapper.xml文件

log4j.properties文件

mybatis-config.xml文件

---

pom.xml文件：
```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.liuzhuo</groupId>
    <artifactId>mybatis</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>

        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.4.6</version>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.13</version>
        </dependency>

        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.17</version>
        </dependency>

    </dependencies>

    <build>
        <plugins>
            <plugin>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

log4j.properties文件：
```
#全局配置
log4j.rootLogger=ERROR,stdout
#MyBatis日志配置
log4j.logger.com.liuzhuo=TRACE
#控制台输出配置
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=[%5p] [%t] - %m %x %n
```

mybatis-config.xml文件：
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <!--日志采用Log4j-->
    <settings>
        <setting name="logImpl" value="LOG4J"/>
    </settings>
    <!--别名-->
    <typeAliases>
        <typeAlias alias="user" type="com.liuzhuo.entities.User"/>
    </typeAliases>
    <!--定义数据库信息，默认使用development数据库构建环境-->
    <environments default="development">
        <environment id="development">
            <!--采用JDBC事务管理-->
            <transactionManager type="JDBC">
                <!--取消自动提交-->
                <property name="autoCommit" value="false"/>
            </transactionManager>
            <!--配置数据源的信息-->
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url"
                          value="jdbc:mysql://localhost:3306/school?useUnicode=true&amp;characterEncoding=utf-8&amp;useSSL=false&amp;serverTimezone=GMT%2B8"/>
                <property name="username" value="root"/>
                <property name="password" value="123456"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <mapper resource="com/liuzhuo/mapper/userMapper.xml"/>
    </mappers>
</configuration>
```

注意：上面取消了事务的自动提交功能！！！（实际开发中，不需要取消，这里只是为了演示组件的生命周期而已）

SqlSessionFactoryUtil类：
```
public class SqlSessionFactoryUtil {

    private static SqlSessionFactory sqlSessionFactory = null;

    //类锁
    private static final Class CLASS_LOCK = SqlSessionFactoryUtil.class;

    //私有化构造方法
    private SqlSessionFactoryUtil() {
    }

    /*
     *创建sqlSessionFactory
     * */
    public static SqlSessionFactory initSqlSessionFactory() {
        String resource = "mybatis-config.xml";
        InputStream inputStream = null;
        try {
            inputStream = Resources.getResourceAsStream(resource);
        } catch (IOException e) {
            e.printStackTrace();
        }
        //上锁，防止创建多个SqlSessionFactory
        synchronized (CLASS_LOCK) {
            if (sqlSessionFactory == null) {
                sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
            }
        }
        return sqlSessionFactory;
    }

    /*
     * 打开SqlSession
     * */
    public static SqlSession openSqlSession() {
        if (sqlSessionFactory == null) {
            initSqlSessionFactory();
        }
        return sqlSessionFactory.openSession();
    }
}
```

User类：
```
public class User {
    private String userId;
    private Long userAge;
    private String userName;
    
    //省略了set、get、toString方法
}
```

UserMapper接口：
```
public interface UserMapper {

    User selectById(Long id);

    @Select("select userId,user_age as useAge,user_name as userName from user where userId = #{id}")
    User selectById02(Long id);
}
```

userMapper.xml文件：
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.liuzhuo.dao.UserMapper">
    <select id="selectById" parameterType="long" resultType="user">
        select userId,user_name as userName,user_age as userAge from user where userId = #{id}
    </select>
</mapper>
```

注意，接口的方法名与xml映射文件的id保持一致，namespace为接口的全限定名！！！

MybatisMain类：
```
public class MybatisMain {

    public static void main(String[] args) {
        SqlSession sqlSession = null;
        try {
            sqlSession = SqlSessionFactoryUtil.openSqlSession();
            UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
            User user = userMapper.selectById(1L);
            System.out.println(user);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            //出现异常，回滚
            sqlSession.rollback();
        } finally {
            //关闭sqlSession对象
            if (sqlSession != null) {
                sqlSession.close();
            }
        }
    }

}
```

本地的数据库为school：

表为user：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309213806.png"/>

---

运行MybatisMain类中的main方法：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309213950.png"/>

打印出了日志信息，可以看到sql语句的打印信息，获取到了数据库中的数据。
