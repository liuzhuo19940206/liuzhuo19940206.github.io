---
title: Mybatis中的主配置文件
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-10 10:03:48
summary: 讲解Mybatis中的主配置文件
---

今天来讲解Mybatis中的主配置文件，Mybatis的配置文件对整个Mybatis体系产生深远的影响。

### Mybatis配置文件层次结构

先来看一下MyBatis配置XML文件的层次结构。

```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration><!--配置-->
    <properties/><!--属性-->
    <settings/><!--设置-->
    <typeAliases/><!--别名-->
    <typeHandlers/><!--类型处理器-->
    <plugins/><!--插件-->
    <environments default="development"><!--配置环境-->
        <environment id="development"><!--环境变量-->
            <transactionManager type="JDBC"/><!--事务管理器-->
            <dataSource type="POOLED"/><!--数据源-->
        </environment>
    </environments>
    <databaseIdProvider/><!--数据库厂商标识-->
    <mappers/><!--映射器-->
</configuration>
```

<font color="red">**注意，这些层次是不能够颠倒顺序的的，如果颠倒顺序，Mybatis在解析XML文件的时候就会出现异常。**</font>

### properties元素

properties是一个配置属性的元素，让我们能在配置文件的上下文中使用它。

Mybatis提供3种配置方式：

* property子元素

* properties配置文件

* 程序参数传递

#### property子元素

property子元素的配置方式如下：
```
    <properties>
        <property name="driver" value="com.mysql.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/mybatis"/>
        <property name="username" value="root"/>
        <property name="password" value="123456"/>
    </properties>
```

这样我们就可以在上下文中使用已经配置好的属性值了。我们在配置数据库的数据源时就可以按照如下进行配置：
```
    <dataSource type="POOLED">
        <property name="driver" value="${driver}"/>
        <property name="url" value="${url}"/>
        <property name="username" value="${username}"/>
        <property name="password" value="${password}"/>
    </dataSource>
```
---

#### properties配置文件

更多时候，我们希望使用properties配置文件来配置属性值，以方便我们在多个配置文件中重复使用它们，也方便日后维护和随时修改，这些在Mybatis中是很容易做到的，我们先来看一下 properties文件 ( jdbc.properties )，代码如下：
```
#数据库配置文件
driver=com.mysql.jdbc.Driver
url=jdbc:mysql://localhost:3306/mybatis
username=root
password=123456
```

我们把这个properties配置文件放在**源码包**下，只要这样引入这个配置文件即可：

`<properties resources="jdbc.properties"/>`

如果想要放在自定义的包下，比如：com.liuzhuo.mybatis中就：

`<properties resources="com/liuzhuo/mybatis/jdbc.properties"/>`

---

#### 程序参数传递

在实际工作中，我们常常遇到这样的问题：系统是由运维人员去配置的，生产数据库的用户密码对于开发者而言是保密的，而且为了安全，运维人员要求对配置文件中的数据库用户密码进行加密，这样我们的配置文件中往往配置的是加密过后的数据库信息，而无法通过加密的字符串去连接数据库，这个时候可以通过编码的形式来满足我们遇到的场景。

下面假设jdbc.properties文件中的username和password两个属性使用了加密的字符串，这个时候我们需要在生成SqlSessionFactory之前将它转化为明文，而系统已经提供了解密的方法decode(str)，让我们来看看如何使用代码的方式来完成SqlSessionFactory的创建，如下：
```
	InputStream cfgStream = null;
	Reader cfgReader = null;
	InputStream proStream = null;
	Reader proReader = null;
	Properties properties = null;
	try{
	   //读取配置文件流
	   cfgStream = Resources.getResourceAsStream("mybatis-config.xml");
	   cfgReader = new InputStreamReader(cfgStream);
	
	   //读入属性文件
	   proStream = Resources.getResourceAsStream("jdbc.properties");
	   proReader = new InputStreamReader(proStream);
	   
	   properties = new Properties();
	   properties.load(proReader);
	   
	   //解密为明文
	   properties.setProperty("username",decode(properties.getProperty("username")));
	   properties.setProperty("password",decode(properties.getProperty("password")));
	}catch(IOException ex){
      System.out.println(ex.getMessage());
    }
    
    Synchronized(CLASS_LOCK){
         if(sqlSessionFactory == null){
            //使用属性来创建SqlSessionFactory
            SqlSessionFactory = new SqlSessionFactoryBuilder().build(cfgReader,properties);
         }
    }
```

这样我们完全可以在jdbc.properties配合密文了，满足对系统安全的要求了。

---

#### 优先级

Mybatis支持3种配置方式可能同时出现，并且属性还会重复配置。这3种方式是存在优先级的，Mybatis将按照下面的顺序来加载。

1. 在properties元素体内指定的属性首先被读取（property子元素）

2. 根据properties元素中的resources属性读取类路径下的.properties文件，或者根据url属性指定的路径读取属性文件，并覆盖也读取的同名属性

3. 读取作为方法参数传递的属性，并覆盖也读取的同名属性

**因此，通过`方法参数传递的属性具有最高优先级`，`resources属性中指定的配置文件次之`，`最低优先级的是properties元素中的指定的属性。`**

---

因此，在实际操作中，我们需要注意一下3点：

1. 不要混合使用，这样会导致管理混乱

2. 首选的方式是使用properties文件

3. 如果需要使用加密或者其他加工处理，不妨按照示例的方法来处理，这样做的好处是使得配置都来自于同一个配置文件，就不容易产生没有必要的歧义。

---

从MyBatis 3.4.2开始，你可以为占位符指定一个默认值。例如：

```
<dataSource type="POOLED">
  <!-- ... -->
  <property name="username" value="${username:ut_user}"/> <!-- If 'username' property not present, username become 'ut_user' -->
</dataSource>
```

这个特性默认是关闭的。如果你想为占位符指定一个默认值， 你应该添加一个指定的属性来开启这个特性。例如：
```
<properties resource="org/mybatis/example/config.properties">
  <!-- ... -->
  <property name="org.apache.ibatis.parsing.PropertyParser.enable-default-value" value="true"/> <!-- Enable this feature -->
</properties>
```

**`提示：你可以使用 ":" 作为属性键(e.g. db:username) 或者你也可以在sql定义中使用 OGNL 表达式的三元运算符
(e.g. ${tableName != null ? tableName : 'global_constants'})`**

你也可以通过增加一个指定的属性来改变分隔键和默认值的字符。例如：
```
<properties resource="org/mybatis/example/config.properties">
  <!-- ... -->
  <property name="org.apache.ibatis.parsing.PropertyParser.default-value-separator" value="?:"/> <!-- Change default value of separator -->
</properties>

<dataSource type="POOLED">
  <!-- ... -->
  <property name="username" value="${db:username?:ut_user}"/>
</dataSource>
```

---

### settings设置

设置（settings）在Mybatis中是最复杂的配置，同时也是最为重要的配置内容之一，它会改变Mybatis运行时的行为。即使不配置settings，Mybatis也可以正常的工作，不过了解settings的配置内容，以及它们的作用仍然十分必要。

Settings的配置内容如下：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310114235.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310114509.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310114547.png"/>

一个配置完整的 settings 元素的示例如下：
```
<settings>
  <setting name="cacheEnabled" value="true"/>
  <setting name="lazyLoadingEnabled" value="true"/>
  <setting name="multipleResultSetsEnabled" value="true"/>
  <setting name="useColumnLabel" value="true"/>
  <setting name="useGeneratedKeys" value="false"/>
  <setting name="autoMappingBehavior" value="PARTIAL"/>
  <setting name="autoMappingUnknownColumnBehavior" value="WARNING"/>
  <setting name="defaultExecutorType" value="SIMPLE"/>
  <setting name="defaultStatementTimeout" value="25"/>
  <setting name="defaultFetchSize" value="100"/>
  <setting name="safeRowBoundsEnabled" value="false"/>
  <setting name="mapUnderscoreToCamelCase" value="false"/>
  <setting name="localCacheScope" value="SESSION"/>
  <setting name="jdbcTypeForNull" value="OTHER"/>
  <setting name="lazyLoadTriggerMethods" value="equals,clone,hashCode,toString"/>
</settings>
```

在大部分时候我们不需要去配置它，或者只需要配置少数几项即可。

---

### typeAliases(别名)

别名(typeAliases)是一个指代的名称，因为我们遇到的类的全限定名过长，所以我们希望用一个简短的名称来指代它，而这个名称可以在Mybatis上下文中使用。别名在Mybatis里面分为**系统定义的别名**和**自定义的别名**。注意，在Mybatis中别名是不分大小写的。

一个typeAliases的实例是在解析配置文件时生成的，然后长期保存在Configuration对象中，当我们使用它时，再把它拿出来，这样就没有必要运行的时候再次生成它的实例了。

#### 系统别名

Mybatis系统定义了一些经常使用的类型的别名，比如：数值、字符串、日期和集合等，我们可以在Mybatis中直接使用它们，在使用时不要重复定义把它们给覆盖了。

如下是系统给我们定义的常用的别名：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310115942.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310120030.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310120122.png"/>

我们可以通过Mybatis的源码 org.apache.ibatis.type.TypeAliasRegistry 可以看出其自定义注册的信息，如下所示：
```
  public TypeAliasRegistry() {
    registerAlias("string", String.class);

    registerAlias("byte", Byte.class);
    registerAlias("long", Long.class);
    registerAlias("short", Short.class);
    registerAlias("int", Integer.class);
    registerAlias("integer", Integer.class);
    registerAlias("double", Double.class);
    registerAlias("float", Float.class);
    registerAlias("boolean", Boolean.class);
    ·····
}
```

这些就是Mybatis系统定义的别名，我们无需重复注册它们。

#### 自定义别名

系统所定义的别名往往是不够用的，因为不同的应用有着不同的需要，所以Mybatis允许自定义别名。

代码如下：
```
<typeAliases>
  <typeAlias alias="Author" type="domain.blog.Author"/>
  <typeAlias alias="Blog" type="domain.blog.Blog"/>
  <typeAlias alias="Comment" type="domain.blog.Comment"/>
  <typeAlias alias="Post" type="domain.blog.Post"/>
  <typeAlias alias="Section" type="domain.blog.Section"/>
  <typeAlias alias="Tag" type="domain.blog.Tag"/>
</typeAliases>
```

当这样配置时，Blog可以用在任何使用domain.blog.Blog的地方。

如果POJO对象过多的时候，配置也是非常多的。因此允许我们通过包扫描的方式来注册自定义别名，如下：
```
<typeAliases>
  <package name="domain.blog"/>
</typeAliases>
```
每一个在包 domain.blog 中的 Java Bean，**`在没有注解的情况下，会使用 Bean 的首字母小写的非限定类名来作为它的别名。`**

比如 domain.blog.Author 的别名为 author。

也可以使用注解的方法，自定义别名，如下：
```
@Alias("author")
public class Author {
    ...
}
```

当配合上面的配置，Mybatis就会自动扫描包，将扫描到的类装载到上下文中，以便将来使用。这样就算是多个POJO也可以通过包扫描的方式装载到Mybatis的上下文中。

---

### typeHandler(类型处理器)

无论是 MyBatis 在预处理语句（PreparedStatement）中设置一个参数时，还是从结果集中取出一个值时， 都会用类型处理器将获取的值以合适的方式转换成 Java 类型。

由于数据库可能来自于不同的厂商，不同的厂商设置的参数可能有所不同，同时数据库也可以自定义数据类型，typeHandler允许根据项目的需要自定义设置Java传递到数据库的参数中，或者从数据库读取数据，我们也需要进行特殊的处理，这些都可以在自定义的typeHandler中处理，尤其是在使用枚举的时候，我们常常需要使用typeHandler进行转换。

typeHandler和别名一样，分为Mybatis系统定义的和用户自定义两种。一般来说，使用Mybatis系统定义的typeHandler就可以实现大部分的功能，如果使用用户自定义的typeHandler，我们在处理的时候务必要小心谨慎，以避免出现不必要的错误。

typeHandler常用的配置为Java类型（javaType）、JDBC类型（jdbcType）。typeHandler的作用就是将参数从javaType转化为jdbcType，或者从数据库取出数据时把jdbcType转化为javaType。

#### 系统定义的typeHandler

Mybatis系统内部定义了一系列的typeHandler，我们可以看看 org.apache.ibatis.type.TypeHandlerRegistry

```
  public TypeHandlerRegistry() {
    register(Boolean.class, new BooleanTypeHandler());
    register(boolean.class, new BooleanTypeHandler());
    register(JdbcType.BOOLEAN, new BooleanTypeHandler());
    register(JdbcType.BIT, new BooleanTypeHandler());

    register(Byte.class, new ByteTypeHandler());
    register(byte.class, new ByteTypeHandler());
    register(JdbcType.TINYINT, new ByteTypeHandler());

    register(Short.class, new ShortTypeHandler());
    register(short.class, new ShortTypeHandler());
    register(JdbcType.SMALLINT, new ShortTypeHandler());
    
    ····
}
```

下表描述了一些默认的类型处理器。
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310123016.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310123134.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310123216.png"/>

---

我们需要注意下面几点。

* 数值类型的精度，数据库 int、double、decimal这些类型 和 java的 精度、长度都是不一样的。

* 时间精度，取数据，精确到日用DateOnlyTypeHandler即可，精确到秒就用SqlTimestampTypeHandler等。

#### 自定义typeHandler

在我们自定义typeHandler之前，我们先学习一下，Mybatis为我们提供的系统typeHandler，这样我们可以照着标准来自定义我们的typeHandler了。

我们来看一下最常见的：StringTypeHandler。

```
public class StringTypeHandler extends BaseTypeHandler<String> {

  @Override
  public void setNonNullParameter(PreparedStatement ps, int i, String parameter, JdbcType jdbcType)
      throws SQLException {
    ps.setString(i, parameter);
  }

  @Override
  public String getNullableResult(ResultSet rs, String columnName)
      throws SQLException {
    return rs.getString(columnName);
  }

  @Override
  public String getNullableResult(ResultSet rs, int columnIndex)
      throws SQLException {
    return rs.getString(columnIndex);
  }

  @Override
  public String getNullableResult(CallableStatement cs, int columnIndex)
      throws SQLException {
    return cs.getString(columnIndex);
  }
}
```

简单说明一下上面的代码。

StringTypeHandler 继承了 BaseTypeHandler。 而 BaseTypeHandler 实现了接口 typeHandler，并且自己定义了4个抽象的方法。所以继承它的时候，正如本例一样需要实现其定义的4个抽象方法，这些方法已经在StringTypeHandler中使用@Override注解注明了。

setParameter 是 PreparedStatement 对象设置参数，它允许我们自己填写变换的规则。

getResult 则是ResultSet用列名（columnName）或者使用列下标（columnIndex）来获取结果数据的。其中还包括了用CallableStatement（存储过程）获取结果及数据的方法。

---


一般而言，Mybatis系统提供的typeHandler已经能够应付大部分的场景了，但是我们不能排除不够用的情况。首先需要明确两个问题：我们自定义的TypeHandler需要处理什么类型？现有的TypeHandler适合我们使用吗？我们需要特殊的处理java的那些类型（JavaType）和对应处理数据库的那些类型（JdbcType），比如字典项的枚举。

这里让我们重新覆盖一个字符串参数的TypeHandler，我们首先先配置XML文件，确定我们需要处理什么类型的参数和结果，如下所示：
```
<!-- mybatis-config.xml -->
<typeHandlers>
  <typeHandler handler="com.liuzhuo.typehandler.MyStringTypehandler" javaType="string" jdbcType="VARCHAR"/>
</typeHandlers>
```

上面定义的数据库类型为VARCHAR型。当java的参数类型为string的时候，我们就可以使用MyStringTypeHandler来处理了，但是只有这个配置，Mybatis不会自动帮你去使用这个TypeHandler去转化的，你需要更多的配置。

对于MyStringTypehandler，我们需要实现：

`org.apache.ibatis.type.TypeHandler` 接口，或者是继承：`org.apache.ibatis.type.BaseTypeHandler`。

以上就是实现自定义TypeHandler的两种方式（其实BaseTypeHandler就是实现了TypeHandler接口的类）
```
@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes({String.class})
public class MyStringTypehandler extends BaseTypeHandler<String> {

  @Override
  public void setNonNullParameter(PreparedStatement ps, int i, String parameter, JdbcType jdbcType) throws SQLException {
    System.out.println("使用了我的TypeHandler");
    ps.setString(i, parameter);
  }

  @Override
  public String getNullableResult(ResultSet rs, String columnName) throws SQLException {
    System.out.println("使用了我的TypeHandler，ResultSet列名获取字符串");
    return rs.getString(columnName);
  }

  @Override
  public String getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
    System.out.println("使用了我的TypeHandler，ResultSet下标获取字符串");
    return rs.getString(columnIndex);
  }

  @Override
  public String getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
    System.out.println("使用了我的TypeHandler，CallableStatement下标获取字符串");
    return cs.getString(columnIndex);
  }
}
```

自定义的TypeHandler里，使用了注解 @MappedTypes 和 @MappedJdbcTypes 来配置 javaType 和 jdbcType。

* @MappedTypes：定义的是JavaType类型，可以指定哪些java类型被拦截

* @MappedJdbcTypes：定义的是JdbcType类型，它需要满足枚举类型 org.apache.ibatis.type.JdbcType所列的枚举类型。

<font color="red">要注意 MyBatis 不会窥探数据库元信息来决定使用哪种类型，所以你必须在参数和结果映射中指明那是 VARCHAR 类型的字段， 以使其能够绑定到正确的类型处理器上。 这是因为：MyBatis 直到语句被执行才清楚数据类型。</font>

---

通过类型处理器的泛型，MyBatis 可以得知该类型处理器处理的 Java 类型，不过这种行为可以通过两种方法改变：

* 在类型处理器的配置元素（typeHandler element）上增加一个 javaType 属性（比如：javaType="String"）；

* 在类型处理器的类上（TypeHandler class）增加一个 @MappedTypes 注解来指定与其关联的 Java 类型列表。 如果在 javaType 属性中也同时指定，则注解方式将被忽略。

可以通过两种方式来指定被关联的 JDBC 类型：

* 在类型处理器的配置元素上增加一个 jdbcType 属性（比如：jdbcType="VARCHAR"）；

* 在类型处理器的类上（TypeHandler class）增加一个 @MappedJdbcTypes 注解来指定与其关联的 JDBC 类型列表。 如果在 jdbcType 属性中也同时指定，则注解方式将被忽略。

即优先级是：
```
<typeHandler handler="xxx" javaType="string" jdbcType="VARCHAR"/>  中的 javaType 和 jdbcType 大于 @MappedTypes 和 @MappedJdbcTypes
```
---

当决定在ResultMap中使用某一TypeHandler时，此时java类型是已知的（从结果类型中获得），但是JDBC类型是未知的。 

因此Mybatis使用 javaType=[TheJavaType], jdbcType=null 的组合来选择一个TypeHandler。 

这意味着使用@MappedJdbcTypes注解可以限制TypeHandler的范围，同时除非显式的设置，否则TypeHandler在ResultMap中将是无效的。 

如果希望在ResultMap中使用TypeHandler，那么设置@MappedJdbcTypes注解的includeNullJdbcType=true即可。 

然而从Mybatis 3.4.0开始，如果只有一个注册的TypeHandler来处理Java类型，那么它将是ResultMap使用Java类型时的默认值（即使没有includeNullJdbcType=true）。

---

最后，类型处理器也可以和别名一样，使用包扫描的方式，注册多个类型处理器
```
<!-- mybatis-config.xml -->
<typeHandlers>
  <package name="org.mybatis.example"/>
</typeHandlers>
```
注意在使用自动检索（autodiscovery）功能的时候，只能通过注解方式来指定 JDBC 的类型。（@MappedJdbcTypes）

---

到现在，我们还是不能测试，因为还需要去标识哪些参数或者结果类型去用我们自定义的TypeHandler去转化，在没有任何标识的情况下，Mybatis是不会启用你定义的TypeHandler进行转化的，所以还需要给予对应的标识，比如配置jdbcType 和 javaType，或者直接使用typeHandler属性指定，因此还需要修改映射器的XML配置。
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.liuzhuo.dao.UserMapper">
	<resultMap id="usermap" type="user"><!--因为添加了别名，所以直接使用user-->
		<id column="userId" property="userId" javaType="string" jdbcType="VARCHAR"/>
		<result column="user_age" property="userAge"/>
	    	<!--定义结果类型转化器标识，才能使用类型转换器-->
		<result column="user_name" property="userName" typeHandler="com.liuzhuo.typehandler.MyStringTypehandler"/>
	</resultMap>

    <select id="selectById" parameterType="long" resultMap="usermap">
        select userId,user_name as userName,user_age as userAge from user where userId = #{id}
    </select>

    <select id="selectById03" parameterType="string" resultMap="usermap">
        select userId,user_name as userName,user_age as userAge from user where user_name = #{userName,javaType="string",jdbcType="VARCHAR"}
    </select>

    <select id="selectById02" parameterType="string" resultMap="usermap">
        select userId,user_name as userName,user_age as userAge from user where user_name = #{userName,typeHandler="com.liuzhuo.typehandler.MyStringTypehandler}
    </select>

</mapper>
```

我们这里引入了resultMap，它提供了映射规则，这里给出了3种typeHandler的使用方法。

* 在配置文件里面配置，在结果集的的id定义：javaType 和 jdbcType。只要定义的javaType 和 jdbcType 与我们定义在配置里面的typeHandler是一致的，Mybatis才会知道用我们自定义的类型转化器进行转换。

* 映射集里面直接定义具体的typeHandler，这样就不需要再在配置里面定义了。

* 在参数中制定typeHandler，这样Mybatis就会用对应的typeHandler进行转换，这样也不需要在配置里面定义了。

---

配置好后，运行我们的项目的MybatisMain主函数，接着上篇博客来写的：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310151142.png"/>

从结果看，程序运行了我们自定义的typeHandler，输出了打印语句。

---

#### 处理枚举类型

在Mybatis中枚举类型的typeHandler有自己特殊的规则，Mybatis内部提供了两个枚举typeHandler：

* EnumTypeHandler 

* EnumOrdinalTypeHandler 

EnumTypeHandler 和 EnumOrdinalTypeHandler 都是泛型类型处理器（generic TypeHandlers）

其中，EnumTypeHandler是使用枚举字符串名称来作为参数的，EnumOrdinalTypeHandler是使用整数下标作为参数的。

**注意 EnumTypeHandler 在某种意义上来说是比较特别的，其他的处理器只针对某个特定的类，而它不同，它会处理任意继承了 Enum 的类。**

然而这两个枚举类型应用却不是那么广泛，更多的时候我们希望使用自定义的typeHandler处理它们。所以在这里我们也会谈及自定义的typeHandler实现枚举映射。

##### EnumOrdinalTypeHandler

下面以性别为例，讲述如何实现枚举类。现在我们有一个性别枚举，它定义了字典：男（male），女（female）。

在com.liuzhuo.enums包下，创建Sex枚举类
```
public enum Sex {

    MALE(1, "男"), FEMALE(2, "女");

    private int id;
    private String name;

    private Sex(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public static Sex getSex(int id) {
        if (id == 1) {
            return MALE;
        } else if (id == 2) {
            return FEMALE;
        }
        return null;
    }
}
```

在没有配置的时候，EnumOrdinalTypeHandler是Mybatis的默认枚举类型的处理器，为了让EnumOrdinalTypeHandler能够处理它，我们在Mybatis中做如下配置：
```
    <typeHandlers>
        ···
        <typeHandler handler="org.apache.ibatis.type.EnumOrdinalTypeHandler" javaType="com.liuzhuo.enums.Sex"/>
    </typeHandlers>
```

这样当Mybatis遇到这个枚举类时就可以识别这个枚举了，然后修改userMapper.xml文件

```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.liuzhuo.dao.UserMapper">

    <resultMap id="userMap" type="user"><!--因为添加了别名，所以直接使用user-->
        <id column="userId" property="userId" javaType="string" jdbcType="VARCHAR"/>
        <result column="user_age" property="userAge"/>
        <!--定义结果类型转化器标识，才能使用类型转换器-->
        <result column="user_name" property="userName" typeHandler="com.liuzhuo.typehandler.MyStringTypehandler"/>
        <!--新添加的字段-->
        <result column="user_sex" property="userSex" typeHandler="org.apache.ibatis.type.EnumOrdinalTypeHandler"/>
    </resultMap>

    <select id="selectById" parameterType="long" resultMap="userMap">
        select userId,user_name as userName,user_age as userAge ,user_sex as userSex from user where userId = #{id}
    </select>

    <insert id="insertUser" parameterType="user">
        INSERT INTO user(userId,user_age,user_name,user_sex)
        VALUES (#{userId},#{userAge},#{userName},#{userSex,typeHandler=org.apache.ibatis.type.EnumOrdinalTypeHandler})
    </insert>

</mapper>
```

主要增加了一个新的字段，userSex 和 一个 insert方法。

userMapper接口：
```
public interface UserMapper {

    User selectById(Long id);

    @Select("select userId,user_age as useAge,user_name as userName from user where userId = #{id}")
    User selectById02(Long id);

    //新增加的方法
    int insertUser(User user);
}

```

User类：
```
public class User {
    private String userId;
    private Long userAge;
    private String userName;
    //多的字段
    private Sex userSex;  

    ···省略get、set、toSting方法
```

在mysql中，添加新的列，为user_sex
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310155623.png"/>

修改我们的MybatisMain类的main方法：
```
        SqlSession sqlSession = null;
        try {
            sqlSession = SqlSessionFactoryUtil.openSqlSession();
            UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
            User user = new User();
            user.setUserId(UUID.randomUUID().toString());
            user.setUserName("dj");
            user.setUserAge(18L);
            user.setUserSex(Sex.FEMALE);//插入新增加的枚举类型
            userMapper.insertUser(user);
            sqlSession.commit();
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
```

执行结果：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310155821.png"/>
打开sql数据库：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310155921.png"/>

发现它插入的是枚举类型的下标。

---

然后，再次修改MybatisMain类的main方法：
```
        SqlSession sqlSession = null;
        try {
            sqlSession = SqlSessionFactoryUtil.openSqlSession();
            UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
            //id是数据库的，请填写你的id
            User user = userMapper.selectById("a582c9ec-872b-4f6e-8520-a924e140efd7");
            System.out.println(user);
            sqlSession.commit();
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
```

执行：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310161623.png"/>

运行成功，取数据时，根据枚举的下标进行转化，变成了FEMALE。

<font color="red">注意，执行select后，打印出来的user的有可能有的字段没有值，这是因为当我们的使用resultMap后，select中就不要使用as了，这样会映射不对的！！！</font>

即：(去掉所有的as)
```
    <select id="selectById" parameterType="string" resultMap="userMap">
        select userId,user_age ,user_name ,user_sex  from user where userId = #{id}
    </select>
```

---

##### EnumTypeHandler

EnumTypeHandler是使用枚举名称去处理Java枚举类型。EnumTypeHandler对应的是一个字符串，让我们来看看它的用法。

首先将mysql中的user_sex改为`VARCHAR`类型，然后修改映射的xml文件。
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310162436.png"/>

将typeHandler换成：org.apache.ibatis.type.EnumTypeHandler 即可。

再次插入数据后：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310162944.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310163028.png"/>

---

##### 自定义枚举类的typeHandler

我们也看到了Mybatis系统内部的枚举类的typeHandler不太好，所以，一般情况下，我们都需要自己定义枚举类的typeHandler。

创建SexEnumTypeHandler：
```
public class SexEnumTypeHandler extends BaseTypeHandler<Sex> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Sex parameter, JdbcType jdbcType) throws SQLException {
        System.out.println("自定义的枚举类型，set");
        ps.setInt(i, parameter.getId());
    }

    @Override
    public Sex getNullableResult(ResultSet rs, String columnName) throws SQLException {
        System.out.println("自定义的枚举类型，get");
        int id = rs.getInt(columnName);
        return Sex.getSex(id);
    }

    @Override
    public Sex getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        System.out.println("自定义的枚举类型，get");
        int id = rs.getInt(columnIndex);
        return Sex.getSex(id);
    }

    @Override
    public Sex getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        System.out.println("自定义的枚举类型，get");
        int id = cs.getInt(columnIndex);
        return Sex.getSex(id);
    }
}
```

修改mbatis-config.xml配置文件：
```
    <typeHandlers>
        ···
        <typeHandler handler="com.liuzhuo.typehandler.SexEnumTypeHandler" javaType="com.liuzhuo.enums.Sex"/>
    </typeHandlers>
```

修改userMapper.xml文件：
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">


<mapper namespace="com.liuzhuo.dao.UserMapper">

    <resultMap id="userMap" type="user">
        <id column="userId" property="userId" javaType="string" jdbcType="VARCHAR"/>
        <result column="user_age" property="userAge"/>
        <!--定义结果类型转化器标识，才能使用类型转换器-->
        <result column="user_name" property="userName" typeHandler="com.liuzhuo.typehandler.MyStringTypehandler"/>
        <!--新添加的字段-->
        <result column="user_sex" property="userSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>
    </resultMap>

    <select id="selectById" parameterType="string" resultMap="userMap">
        select userId,user_age ,user_name ,user_sex  from user where userId = #{id}
</select>

    <insert id="insertUser" parameterType="user">
        INSERT INTO user(userId,user_age,user_name,user_sex)
        VALUES (#{userId},#{userAge},#{userName},#{userSex,typeHandler=com.liuzhuo.typehandler.SexEnumTypeHandler})
    </insert>

</mapper>
```

修改主函数：
```
            sqlSession = SqlSessionFactoryUtil.openSqlSession();
            UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
            User user = new User();
            user.setUserId(UUID.randomUUID().toString());
            user.setUserName("gakkij");
            user.setUserAge(18L);
            user.setUserSex(Sex.FEMALE);
            userMapper.insertUser(user);
            sqlSession.commit();
```
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310164451.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310164520.png"/>

---

修改主函数：
```
            sqlSession = SqlSessionFactoryUtil.openSqlSession();
            UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
            User user = userMapper.selectById("635a61a2-1d0e-450a-bda1-20aa340567db");
            System.out.println(user);
            sqlSession.commit();
```
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310164703.png"/>

---

### ObjectFactory

当Mybatis在构建一个结果返回的时候，都会使用ObjectFactory（对象工厂）去构建POJO，在Mybatis中可以定制自己的对象工厂。一般来说我们使用默认的ObjectFactory即可，Mybatis中默认的ObjectFactory是由 org.apache.ibatis.reflection.DefaultObjectFactory来提供服务的。在大部分的场景下我们都不用修改，如果要定制特定的工厂则需要进行配置，如下所示：
```
<objectFactory type="com.liuzhuo.objectFactory.MyObjectFactory">
	<property name="name" value="MyObjectFactory"/>
</objectFactory>
```

这里，我们配置了一个对象工厂MyObjectFactory，对它的要求是实现ObjectFactory的接口。实际上DefaultObjectFactory已经实现了ObjectFactory的接口，我们可以通过继承DefaultObjectFactory来简化编程。

在com.liuzhuo.objectFactory包下，创建MyObjectFactory类：
```
public class MyObjectFactory extends DefaultObjectFactory {

    private static final long serialVersionUID = -4783947743847934344L;

    Logger log = Logger.getLogger(MyObjectFactory.class);

    @Override
    public void setProperties(Properties properties) {
        log.info("定制属性：" + properties);
        super.setProperties(properties);
    }

    @Override
    public <T> T create(Class<T> type) {
        log.info("使用定制对象工厂的create方法构建单个对象");
        return super.create(type);
    }

    @Override
    public <T> T create(Class<T> type, List<Class<?>> constructorArgTypes, List<Object> constructorArgs) {
        log.info("使用定制对象工厂的create方法构建列表对象");
        return super.create(type, constructorArgTypes, constructorArgs);
    }

    @Override
    public <T> boolean isCollection(Class<T> type) {
        return super.isCollection(type);
    }
}
```
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310175851.png"/>

运行我们的main方法：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190310180429.png"/>

从运行的结果可以看出，首先，setProperties方法可以获取到`<property name="name" value="MyObjectFactory"/>`定义的属性值。

create方法分别是处理单个对象和列表对象。

注意，大部分情况下，我们不需要使用自己配置的ObjectFactory，使用默认的即可。

---

### plugins(插件)

MyBatis 允许你在已映射语句执行过程中的某一点进行拦截调用。默认情况下，MyBatis 允许使用插件来拦截的方法调用包括：

* Executor (update, query, flushStatements, commit, rollback, getTransaction, close, isClosed)

* ParameterHandler (getParameterObject, setParameters)

* ResultSetHandler (handleResultSets, handleOutputParameters)

* StatementHandler (prepare, parameterize, batch, update, query)

这些类中方法的细节可以通过查看每个方法的签名来发现，或者直接查看 MyBatis 发行包中的源代码。 如果你想做的不仅仅是监控方法的调用，那么你最好相当了解要重写的方法的行为。 **因为如果在试图修改或重写已有方法的行为的时候，你很可能在破坏 MyBatis 的核心模块。 这些都是更低层的类和方法，所以使用插件的时候要特别当心。**

通过 MyBatis 提供的强大机制，使用插件是非常简单的，只需实现 Interceptor 接口，并指定想要拦截的方法签名即可。

```
// ExamplePlugin.java
@Intercepts({@Signature(
  type= Executor.class,
  method = "update",
  args = {MappedStatement.class,Object.class})})
public class ExamplePlugin implements Interceptor {
  public Object intercept(Invocation invocation) throws Throwable {
    return invocation.proceed();
  }
  public Object plugin(Object target) {
    return Plugin.wrap(target, this);
  }
  public void setProperties(Properties properties) {
  }
}
```

```
<!-- mybatis-config.xml -->
<plugins>
  <plugin interceptor="org.mybatis.example.ExamplePlugin">
    <property name="someProperty" value="100"/>
  </plugin>
</plugins>
```
上面的插件将会拦截在 Executor 实例中所有的 “update” 方法调用， 这里的 Executor 是负责执行低层映射语句的内部对象。