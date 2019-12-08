---
title: Mybatis中的主配置文件02
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-10 20:41:46
summary: 讲解Mybatis-config.xml配置文件
---

此篇博客，接着上篇博客的内容，继续讲解Mybatis-config.xml配置文件

### environments(配置环境)

配置环境可以注册多个数据源（dataSource），每个一个数据源又可以分为两大部分：一个是数据库源的配置，另外一个是数据库事务（transactionManager）的配置。

MyBatis 可以配置成适应多种环境，这种机制有助于将 SQL 映射应用于多种数据库之中， 现实情况下有多种理由需要这么做。例如，开发、测试和生产环境需要有不同的配置；或者共享相同 Schema 的多个生产数据库， 想使用相同的 SQL 映射。许多类似的用例。

**不过要记住：尽管可以配置多个环境，每个 SqlSessionFactory 实例只能选择其一。**

所以，如果你想连接两个数据库，就需要创建两个 SqlSessionFactory 实例，每个数据库对应一个。而如果是三个数据库，就需要三个实例，依此类推，记起来很简单：

**每个数据库对应一个 SqlSessionFactory 实例**

为了指定创建哪种环境，只要将它作为可选的参数传递给 SqlSessionFactoryBuilder 即可。可以接受环境配置的两个方法签名是：

```
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, environment);
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, environment, properties);
```
如果忽略了环境参数，那么默认环境将会被加载，如下所示：
```
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader);
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, properties);
```
环境元素定义了如何配置环境。
```
<environments default="development">
  <environment id="development">
    <transactionManager type="JDBC">
      <property name="..." value="..."/>
    </transactionManager>
    <dataSource type="POOLED">
      <property name="driver"   value="${driver}"/>
      <property name="url"      value="${url}"/>
      <property name="username" value="${username}"/>
      <property name="password" value="${password}"/>
    </dataSource>
  </environment>
</environments>
```

注意这里的关键点：

* environments中的属性default，表明了在缺省的情况下，我们将启动哪个数据源配置

* environment元素是配置一个数据源的开始，属性id是设置这个数据源的标志，以便Mybatis在上下文中使用它

* transactionManager 配置的是数据库事务

* dataSource 是配置数据源连接的信息

#### 事务管理器(transactionManager)

在 MyBatis 中有两种类型的事务管理器（也就是 type= " [JDBC|MANAGED] "）：

* JDBC，采用的是JDBC方式的管理，直接使用了 JDBC 的提交和回滚设置，它依赖于从数据源得到的连接来管理事务作用域。

* MANAGED，采用是容器方式管理事务，在JNDI数据源中常用

MANAGED – 这个配置几乎没做什么。它从来不提交或回滚一个连接，而是让容器来管理事务的整个生命周期（比如 JEE 应用服务器的上下文）。 默认情况下它会关闭连接，然而一些容器并不希望这样，因此需要将 closeConnection 属性设置为 false 来阻止它默认的关闭行为。例如:
```
<transactionManager type="MANAGED">
  <property name="closeConnection" value="false"/>
</transactionManager>
```

property元素则是可以配置数据源的各类属性，比如配置不自动提交：
```
<transactionManager type="JDBC">
  <property name="autoCommit" value="false"/>
</transactionManager>
```
---

这两种事务管理器类型都不需要任何属性。它们不过是类型别名，换句话说，你可以使用 TransactionFactory 接口的实现类的完全限定名或类型别名代替它们。
```
public interface TransactionFactory {
  void setProperties(Properties props);  
  Transaction newTransaction(Connection conn);
  Transaction newTransaction(DataSource dataSource, TransactionIsolationLevel level, boolean autoCommit);  
}
```
任何在 XML 中配置的属性在实例化之后将会被传递给 setProperties() 方法。你也需要创建一个 Transaction 接口的实现类，这个接口也很简单：
```
public interface Transaction {
  Connection getConnection() throws SQLException;
  void commit() throws SQLException;
  void rollback() throws SQLException;
  void close() throws SQLException;
  Integer getTimeout() throws SQLException;
}
```
使用这两个接口，你可以完全自定义 MyBatis 对事务的处理。

---

<font color="red">提示，如果你正在使用 Spring + MyBatis，则没有必要配置事务管理器， 因为 Spring 模块会使用**自带的管理器**来覆盖前面的配置。</font>

#### 数据源(dataSource)

数据库事务 Mybatis是交给 SqlSession 去控制的，我们可以通过SqlSession 提交（commit）或者 回滚（rollback）。

Mybatis内部为我们提供了3种数据源的实现方式

* UNPOOLED，非连接池。

这个数据源的实现只是每次被请求时打开和关闭连接。虽然有点慢，但对于在数据库连接可用性方面没有太高要求的简单应用程序来说，是一个很好的选择。 不同的数据库在性能方面的表现也是不一样的，对于某些数据库来说，使用连接池并不重要，这个配置就很适合这种情形。UNPOOLED 类型的数据源仅仅需要配置以下 5 种属性：
```
driver – 这是 JDBC 驱动的 Java 类的完全限定名（并不是 JDBC 驱动中可能包含的数据源类）。
url – 这是数据库的 JDBC URL 地址。
username – 登录数据库的用户名。
password – 登录数据库的密码。
defaultTransactionIsolationLevel – 默认的连接事务隔离级别。
```

作为可选项，你也可以传递属性给数据库驱动。要这样做，属性的前缀为“driver.”，例如：

`driver.encoding=UTF8`

这将通过 DriverManager.getConnection(url,driverProperties) 方法传递值为 UTF8 的 encoding 属性给数据库驱动。

* POOLED，连接池。

这种数据源的实现利用“池”的概念将 JDBC 连接对象组织起来，避免了创建新的连接实例时所必需的初始化和认证时间。 这是一种使得并发 Web 应用快速响应请求的流行处理方式。

除了上述提到 UNPOOLED 下的属性外，还有更多属性用来配置 POOLED 的数据源：
```
poolMaximumActiveConnections – 在任意时间可以存在的活动（也就是正在使用）连接数量，默认值：10
poolMaximumIdleConnections – 任意时间可能存在的空闲连接数。
poolMaximumCheckoutTime – 在被强制返回之前，池中连接被检出（checked out）时间，默认值：20000 毫秒（即 20 秒）
poolTimeToWait – 这是一个底层设置，如果获取连接花费了相当长的时间，连接池会打印状态日志并重新尝试获取一个连接（避免在误配置的情况下一直安静的失败），默认值：20000 毫秒（即 20 秒）。
poolMaximumLocalBadConnectionTolerance – 这是一个关于坏连接容忍度的底层设置， 作用于每一个尝试从缓存池获取连接的线程. 如果这个线程获取到的是一个坏的连接，那么这个数据源允许这个线程尝试重新获取一个新的连接，但是这个重新尝试的次数不应该超过 poolMaximumIdleConnections 与 poolMaximumLocalBadConnectionTolerance 之和。 默认值：3 (新增于 3.4.5)
poolPingQuery – 发送到数据库的侦测查询，用来检验连接是否正常工作并准备接受请求。默认是“NO PING QUERY SET”，这会导致多数数据库驱动失败时带有一个恰当的错误消息。
poolPingEnabled – 是否启用侦测查询。若开启，需要设置 poolPingQuery 属性为一个可执行的 SQL 语句（最好是一个速度非常快的 SQL 语句），默认值：false。
poolPingConnectionsNotUsedFor – 配置 poolPingQuery 的频率。可以被设置为和数据库连接超时时间一样，来避免不必要的侦测，默认值：0（即所有连接每一时刻都被侦测 — 当然仅当 poolPingEnabled 为 true 时适用）。
```

* JNDI

这个数据源的实现是为了能在如 EJB 或应用服务器这类容器中使用，容器可以集中或在外部配置数据源，然后放置一个 JNDI 上下文的引用。这种数据源配置只需要两个属性：
```
initial_context – 这个属性用来在 InitialContext 中寻找上下文（即，initialContext.lookup(initial_context)）。这是个可选属性，如果忽略，那么 data_source 属性将会直接从 InitialContext 中寻找。
data_source – 这是引用数据源实例位置的上下文的路径。提供了 initial_context 配置时会在其返回的上下文中进行查找，没有提供时则直接在 InitialContext 中查找。
```

和其他数据源配置类似，可以通过添加前缀“env.”直接把属性传递给初始上下文。比如：

`env.encoding=UTF8`

这就会在初始上下文（InitialContext）实例化时往它的构造方法传递值为 UTF8 的 encoding 属性。

---

你可以通过实现接口 org.apache.ibatis.datasource.DataSourceFactory 来使用**第三方数据源：**
```
public interface DataSourceFactory {
  void setProperties(Properties props);
  DataSource getDataSource();
}
```

org.apache.ibatis.datasource.unpooled.UnpooledDataSourceFactory 可被用作父类来构建新的数据源适配器，比如下面这段插入 C3P0 数据源所必需的代码：
```
import org.apache.ibatis.datasource.unpooled.UnpooledDataSourceFactory;
import com.mchange.v2.c3p0.ComboPooledDataSource;
        
public class C3P0DataSourceFactory extends UnpooledDataSourceFactory {

  public C3P0DataSourceFactory() {
    this.dataSource = new ComboPooledDataSource();
  }
}
```

为了令其工作，记得为每个希望 MyBatis 调用的 setter 方法在配置文件中增加对应的属性。下面是一个可以连接至 PostgreSQL 数据库的例子：
```
<dataSource type="org.myproject.C3P0DataSourceFactory">
  <property name="driver" value="org.postgresql.Driver"/>
  <property name="url" value="jdbc:postgresql:mydb"/>
  <property name="username" value="postgres"/>
  <property name="password" value="root"/>
</dataSource>
```

---

### databaseIdProvider

MyBatis 可以根据不同的数据库厂商执行不同的语句，这种多厂商的支持是基于映射语句中的 databaseId 属性。 MyBatis 会加载不带 databaseId 属性和带有匹配当前数据库 databaseId 属性的所有语句。 如果同时找到带有 databaseId 和不带 databaseId 的相同语句，则后者会被舍弃。 为支持多厂商特性只要像下面这样在 mybatis-config.xml 文件中加入 databaseIdProvider 即可：
```
<databaseIdProvider type="DB_VENDOR" />
```

这里的 DB_VENDOR 会通过 DatabaseMetaData#getDatabaseProductName() 返回的字符串进行设置。 由于通常情况下这个字符串都非常长而且相同产品的不同版本会返回不同的值，所以最好通过设置属性别名来使其变短，如下：
```
<databaseIdProvider type="DB_VENDOR">
  <property name="SQL Server" value="sqlserver"/>
  <property name="MySQL" value="mysql"/>   
  <property name="DB2" value="db2"/>        
  <property name="Oracle" value="oracle" />
</databaseIdProvider>
```
在提供了属性别名时，DB_VENDOR databaseIdProvider 将被设置为第一个能匹配数据库产品名称的属性键对应的值，如果没有匹配的属性将会设置为 “null”。 在这个例子中，如果 getDatabaseProductName() 返回“Oracle (DataDirect)”，databaseId 将被设置为“oracle”。

我们也可以指定SQL在哪个数据库厂商执行，我们把Mapper的XML配置修改一下，如下：
```
    <select id="selectById" parameterType="string" resultMap="userMap" databaseId="mysql">
        select userId,user_age ,user_name ,user_sex  from user where userId = #{id}
    </select>
```

在多一个databaseId属性的情况下，Mybatis将提供如下规则。

* 如果没有配置databaseIdProvider标签，那么databaseId就会返回null。

* 如果配置了databaseIdProvider标签，Mybatis就会用配置的name值去匹配数据库信息，如果匹配得上就会设置databaseId，否则为null。

* 如果Configuration的databaseId不为空，则它只会找到配置databaseId的SQL语句。

* Mybatis会加载不带databaseId属性和带有匹配当前数据库databaseId属性的所有语句。如果同时找到带有databaseId和不带databaseId的相同语句，则后者会被舍弃。

---

Mybatis也提供了规则允许自定义，我们只要实现DatabaseIdProvider接口，并且实现配置即可

```
public class MydatabaseIdProvider implements DatabaseIdProvider {

    private Properties properties = null;

    @Override
    public void setProperties(Properties p) {
        this.properties = p;
    }

    @Override
    public String getDatabaseId(DataSource dataSource) throws SQLException {
        String dbName = dataSource.getConnection().getMetaData().getDatabaseProductName();
        String dbId = (String) this.properties.get(dbName);
        return dbId;
    }
}
```

其次，注册这个类到Mybatis上下文环境中，我们这样配置databaseIdProvider标签，如下所示：
```
<databaseIdProvider type="com.liuzhuo.databaseIdProvider.MydatabaseIdProvider">
  <property name="SQL Server" value="sqlserver"/>
  <property name="MySQL" value="mysql"/>   
  <property name="DB2" value="db2"/>        
  <property name="Oracle" value="oracle" />
</databaseIdProvider>
```

我们把type修改为我们自己实现的类，类里面setProperties方法的参数传递进去的将会是我们在XML配置的信息，我们保存在类的变量properties里，方便以后读出。在方法getDatabaseId中，传递的参数是数据库数据源，我们获取其名称，然后通过properties的键值找到对应的databaseId。

---

### mapper(映射器)

映射器是Mybatis最复杂、最核心的组件。此处只是讨论如何引入映射器，其他的特性放在后面的博客中讲解。

引入映射器有4中方法：

（1）用文件路径引入映射器
```
<!-- 使用相对于类路径的资源引用 -->
<mappers>
  <mapper resource="org/mybatis/builder/authorMapper.xml"/>
  <mapper resource="org/mybatis/builder/blogMapper.xml"/>
  <mapper resource="org/mybatis/builder/postMapper.xml"/>
</mappers>
```

(2) 用完全限定资源定位(url)
```
<!-- 使用完全限定资源定位符（URL） -->
<mappers>
  <mapper url="file:///var/mappers/AuthorMapper.xml"/>
  <mapper url="file:///var/mappers/BlogMapper.xml"/>
  <mapper url="file:///var/mappers/PostMapper.xml"/>
</mappers>
```

(3) 用包名引入映射器
```
<!-- 将包内的映射器接口实现全部注册为映射器 -->
<mappers>
  <package name="org.mybatis.builder"/>
</mappers>
```

(4) 用类注册引入映射器
```
<!-- 使用映射器接口实现类的完全限定类名 -->
<mappers>
  <mapper class="org.mybatis.builder.AuthorMapper"/>
  <mapper class="org.mybatis.builder.BlogMapper"/>
  <mapper class="org.mybatis.builder.PostMapper"/>
</mappers>
```

<font color="red">注意：（1）和（2）是xml的方式，所以填写的是XML的路径，（3）和 （4）是注解的方式，填写的是mapper接口的路径</font>

（1）和（2）我就不演示了，大家都清楚。

看看（3）和（4）。

首先，我们的UserMapper在：com.liuzhuo.dao包下

然而，我们的userMapper.xml在：com.liuzhuo.mapper包下。
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310220314.png"/>

但是，在mybatis-config.xml中必须配置为mapper接口的包路径：
```
    <mappers>
        <package name="com.liuzhuo.dao"/>
    </mappers>
```
**而且，此时只能使用注解的方式，不能使用xml的方式了。**

现在，在我们的UserMapper中，有两个selectById方法，一个是xml的，一个是注解的，我们分别来演示。
```
public interface UserMapper {

    User selectById(String id);

    @Select("select userId,user_age as useAge,user_name as userName from user where userId = #{id}")
    User selectById02(String id);

    int insertUser(User user);
}

```

在主函数中调用xml的方法（selectById）
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310220747.png"/>

发现调用失败！！！！

在主函数中调用注解的方法（selectById02）
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310220942.png"/>

---

**如果想使用非注解的xml配置文件的话，必须将Mapper接口类和xml文件放在同一级目录中，且两种同名！！！**

结构如下：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190311092826.png" style="width:50%"/>

再次运行，如果你的还是出错
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190311100400.png"/>

是因为使用IDEA创建的Maven项目中，不在resources创建的xml配置文件是不会读取到的，需要修改一下pom.xml文件。
```
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
        <!--配置即使xml不在resources中，也能读取到xml文件-->
        <resources>
            <resource>
                <directory>src/main/java</directory>
                <includes>
                    <include>**/*.xml</include>
                </includes>
            </resource>
        </resources>
    </build>
```

加入上面的`<resources>`即可。

此时再次运行项目，就会成功了：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190311100710.png"/>

此时，在target目录下，能看到：com.liuzhuo.dao下的UserMapper.xml文件。
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190311100846.png" style="width:50%"/>

没有修改pom.xml文件之前，即使你在src源码目录的:com.liuzhuo.dao中加入UserMapper.xml文件，在target相同的目录下是不会有UserMapper.xml文件。

这就是出错的原因。

如果你创建的是web的maven工程，不会出错的，我的这个工程是简单的maven工程才会这样，大家如果出现了同样的问题，可以看看是不是这个原因！！！