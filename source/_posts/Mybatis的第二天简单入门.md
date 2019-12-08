---
title: Mybatis的第二天简单入门
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-08 21:40:26
summary: Mybatis的基本用法，带大家入门
---

今天来学习Mybatis的基本用法，带大家入门。

### 开发环境

学习编程是一门实操的科学，只有一边敲代码一边学习才能有更好的效果，所以需要搭建一个学习的环境才行。

#### 下载Mybatis

输入官网：https://github.com/mybatis/mybatis-3/releases 进入官网，我们就可以下载Mybatis，如下图所示：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190308214814.png"/>

在这里，我们可以下载到Mybatis所需的jar包和源码包。

mybatis的jar包下载地址：https://github.com/mybatis/mybatis-3/releases

mybatis和Spring整合jar包下载地址：https://github.com/mybatis/spring/releases

---

**`使用Mybatis项目可以参考`**：http://mybatis.org/mybatis-3/zh/index.html

**`使用Mybatis-Spring项目可以参考`**：http://mybatis.org/spring/zh/index.html

### 搭建Mybatis的环境

无论使用哪种java IDE都可以轻松的搭建开发环境。我这里使用IDEA来搭建开发环境，Eclipse也行，都是类似的。

使用IDEA时，我们可以创建普通的java项目，然后将**下载的Mybatis的jar和lib包**导入到项目中使用Mybatis，但是，我觉得还是使用maven来搭建环境比较好，毕竟大家最后开发都是使用maven来开发项目的，maven大家应该都比较熟悉了，这里就不解释了。

（1） 使用IDEA创建maven项目：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190308220624.png"/>

（2）添加Mybatis的依赖：
```
    <dependencies>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.4.6</version>
        </dependency>
    </dependencies>
```
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190308220907.png"/>

至于：Mybatis的版本号，自己到maven的仓库中寻找最新即可，我现在最新的版本是3.4.6

以上，我们的Mybatis的开发环境就搭建完毕了。

---

### Mybatis的基本构成

* SqlSessionFactoryBuilder(构造器)：它会根据配置信息或者代码来生成SqlSessionFactory（工厂接口）

* SqlSessionFactory：依靠工厂来生成SqlSession（会话）。

* SqlSession：是一个既可以发送SQL去执行并返回结果，也可以获取Mapper的接口。

* SQL Mapper：它是Mybatis新设计的组件，它是由一个java接口和XML文件（或注解）构成的，需要给出对应的SQL和映射规则。它负责发送SQL去执行，并返回结果。

可以用如下的图来表示：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309094652.png"/>

#### 构建SqlSessionFactory

每个Mybatis应用都是以SqlSessionFactory的实例为中心的。SqlSessionFactory的实例可以通过SqlSessionFactoryBuilder获取。但是注意：SqlSessionFactory只是一个接口，它的任务是创建SqlSession。SqlSession类似于一个JDBC的Connection对象。Mybatis提供了两种模式去创建SqlsessionFactory：**一种是使用XML配置的方式**，**另一种是代码的方式**。

通过SqlSessionFactoryBuilder创建SqlsessionFactory时，需要传入一个XML配置文件，然后构建Configuration对象，类的全限定名是：`org.apache.ibatis.session.Configuration`，这个对象存在于整个Mybatis应用的生命周期中，以便重复的读取和运用。我们解析一次配置的XML文件保存到Configuration类对象中，方便我们从这个对象中读取配置信息，性能高。

在Mybatis中提供了两个SqlSessionFactory的实现类，**DefaultSqlSessionFactory** 和 **SqlSessionManager**。 不过目前，SqlSessionManager还没有使用，Mybatis中目前使用的是：DefaulSqlSessionFactory。
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309100536.png"/>

(1)XML构成SqlsessionFactory

在我们的项目中的resources的根目录中创建：mybatis-config.xml文件：
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <!--别名-->
    <typeAliases>
        <typeAlias alias="user" type="com.liuzhuo.entity.User"/>
    </typeAliases>
    <!--定义数据库信息，默认使用development数据库构建环境-->
    <environments default="development">
        <environment id="development">
            <!--采用JDBC事务管理-->
            <transactionManager type="JDBC"/>
            <!--配置数据源的信息-->
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/school?useUnicode=true&amp;characterEncoding=utf-8&amp;serverTimezone=GMT%2B8"/>
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
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309104551.png"/>

这里配置信息，看注释即可，以后会专门来讲解这个配置文件。

**这里注意一下，mysql的url的连接配置：**

我这里的驱动版本是：mysql-connector-java-8.0.13

8.0之前（网上有说6.0.2版本之后改的） 
com.mysql.jdbc.Driver 
jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8

8.0及以后（或者说6.0.2版本之后） 
com.mysql.cj.jdbc.Driver 
jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=GMT%2B8

`还有，如果你是配置在xml中时，& 需要使用：&amp; 来代替！！！`

---

配置好mybatis-config.xml文件后，就可以创建SqlsessionFactory：
```
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
```

Mybatis的解析器程序会把mybatis-config.xml文件配置的信息解析到Configuration类对象里面，然后利用SqlSessionFactoryBuilder读取这个对象为我们创建SqlSessionFactory。

（2）使用代码来创建SqlSessionFactory
```
        //配置数据库连接池
        PooledDataSource dataSource = new PooledDataSource();
        dataSource.setDriver("com.mysql.cj.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://localhost:3306/school?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=GMT%2B8");
        dataSource.setUsername("root");
        dataSource.setPassword("123456");

        //构建数据库事务方式
        JdbcTransactionFactory transactionFactory = new JdbcTransactionFactory();
        Environment environment = new Environment("development", transactionFactory, dataSource);

        //构建Configuration对象
        Configuration configuration = new Configuration(environment);

        //注册别名
        configuration.getTypeAliasRegistry().registerAlias("user", User.class);

        //加入映射器
        configuration.addMapper(UserMapper.class);

        //创建SqlSessionFactory
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);

```

显然用代码方式和用XML方式只是换了一个方法实现而已，其本质都是一样的。采用代码方式一般是在需要加入自己特性的时候才会用到。

---

#### 创建SqlSession

SqlSession是一个接口类，它类似于你们公司的美女客服，它扮演着门面的作用，而真正干活的是Executor接口，你可以认为它是公司的工程师。假设我是客户找你们公司干活，我只需要告诉前台的美女客服（SqlSession）我要什么信息（参数），要做什么东西，过段时间，她会将结果给我。在这个过程中，作为用户的我所关心的是：

（1）要给美女客户（SqlSession）什么信息（功能和参数）。

（2）美女客服会返回什么结果（ResultSet)。

在Mybatis中的Sqlsession接口的实现类有两个，分别是DefaultSqlSession 和 SqlSessionManager。这里我们不深入讨论Executor接口以及涉及的其他类，只关心SqlSession的用法就好。

SqlSession就相当于JDBC中的Connection接口对象，我们需要保证每次调用完后能关闭它，所以正确的做法是把关闭Sqlsession接口的代码写在finally语句中保证每次都会关闭SqlSession，让连接资源归还给数据库。

伪代码如下：
```
SqlSession sqlSession = null;

try{
	//打开SqlSession会话
	sqlSession = sqlSessionFactory.openSession();
	//some code
	sqlSession.commit();
}catch(Exception ex){
	System.out.println(ex.getMessage());
	sqlSession.rollback();
}finally{
	//在finally语句中确保资源被顺利关闭
	if(sqlSession!=null){
		sqlSession.close();
	}
}
```

SqlSession的作用：

（1）获取映射器Mapper，让映射器通过`命名空间`和`方法名`找到对应的SQL，发送给数据库执行后返回结果。

（2）直接通过命名信息去执行SQL返回结果，这是ibatis版本留下的方式。在SqlSession层可以直接通过update、insert、select、delete等方法，带上SQl的id来操作在XML中配置好的SQL，从而完成我们的工作；与此同时它也支持事务，通过commit、rollback方法提交事务或者回滚事务。

---

#### 映射器

映射器是由 `java接口` 和 `XML文件`（或注解）共同组成的，它的作用如下：

（1）定义参数类型
（2）描述缓存
（3）描述SQL语句
（4）定义查询结果和POJO的映射关系。

一个映射器的实现方式有两种：`xml方式`，`注解方式`。

在mybatis-config.xml中，描述了一个xml文件，在<mapper></mapper>标签中，就是用来配置映射器的xml文件，通过它来生成Mapper文件。

注解的方式是不用写mapper的xml文件的，只需要在Java的接口方法上面写相应的注解信息即可。

两种方式，根据自己的项目来选择，xml更加灵活，便于排除，写动态sql语句，可读性好，注解只适合于书写简单的sql语句，方便开发简单的项目，不方便维护。

（1）xml的方式
在resources下，创建com.liuzhuo.mapper包，并在其中创建userMapper.xml文件
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
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309115557.png"/>

使用XML文件配置是Mybatis实现Mapper的首选方式。它是由一个java接口和一个XML文件组成的。

java接口文件如下：
```
public interface UserMapper {

    User selectById(Long id);
}
```

xml中的namespace必须为java接口类的全限定名，java接口中的方法名必须是xml中的id名，这两则必须一致！！！

我们看到`<select>`标签中，有一个resultType=user，这是因为我们在mybatis-config.xml中配置了别名，否则就需要填写User类的全限定名了(com.liuzhuo.entity.User)。

这里的User类为：
```
public class User {

    private String userId;
    private Long userAge;
    private String userName;

    //省略了get、set、toString方法
}
```

再看看SQL语句，我们查询了user的信息，并给查询出来的列重新命名了，使用查询出来的列名和POJO对象的属性名一致了，这么Mybatis才会将从数据库中查询出来的信息，自动帮我们赋值到User对象中。如果数据库中的表的列名与POJO对象一致的话，就不需要别名了。

---

### 项目整体结构

这个项目的整体结构如下：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309120612.png"/>

在java包下：

com.liuzhuo.entity:存储POJO类

com.liuzhuo.dao：存储java接口Mapper类

在resources包下：

根目录下，存放mybatis-config.xml的基本xml配置文件。

com.liuzhuo.mapper:存储mapper的xml文件。

### 测试

在test下，创建com.liuzhuo.test包，并创建一个测试类：
```
public class UserTest {
	@Test
    public void test01() throws IOException {
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = sqlSessionFactory.openSession();
        UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
        User user = userMapper.selectById(1L);
        System.out.println(user);
    }
}
```

现在完整的pom文件：
```
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

    </dependencies>
```

运行测试方法test01：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309121425.png"/>

---

这里简单演示一下注解的使用

在UserMapper接口中：
添加新的方法
```
public interface UserMapper {

    User selectById(Long id);

    @Select("select userId,user_age as useAge,user_name as userName from user where userId = #{id}")
    User selectById02(Long id);
}

```

在测试类中，添加新的测试方法：
```
    @Test
    public void test04() throws IOException {
        String resource = "mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession sqlSession = sqlSessionFactory.openSession();
        UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
        User user = userMapper.selectById02(1L);
        System.out.println(user);
    }
```

这里我们使用：selectById02方法来执行
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190309122041.png"/>

发现也能执行成功，所以xml和注解的方式都是类似的。注解还有update、insert、delete等，大家可以去官网去看看，这里就不详细讲解了。