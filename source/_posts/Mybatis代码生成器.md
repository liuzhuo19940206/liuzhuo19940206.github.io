---
title: Mybatis代码生成器
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-17 09:46:35
summary: Mybatis代码生成器
---

MyBatis Generator：代码生成器，帮助我们自动生成基本的增、删、改、查的代码，方便我们开发，减少不必要的体力活动。

当数据库表的字段比较少的时候，写起来还能接受，一旦字段过多或者需要在很多表中写这些基本方法时，就会很麻烦，不仅需要很大的代码量，而且字段过多时很容易出现错误。

作为一个优秀的程序员，"懒"是很重要的优点。我们不仅要会写代码，还要会利用工具生成代码。Mybatis的开发团队提供了一个很强大的代码生成器——MyBatis Generator，后文中使用缩写MBG来代替。

MBG通过丰富的配置可以生成不同类型的代码，代码包含了数据库表对应的实体类、Mapper接口类、MapperXML文件和Example对象等，这些代码文件中几乎包含了全部的单表操作方法，使用MBG可以极大程度上方便我们使用MyBatis，还可以减少很多重复操作。

官方文档：http://www.mybatis.org/generator/

---

### 非图形化方式

首先，我讲解官方推出的方式，[mybatis-generator](https://github.com/mybatis/generator)有三种用法：命令行、eclipse插件、maven插件。个人觉得maven插件最方便，可以在eclipse/intellij idea等ide上可以通用。

不管哪种方式，都需要学会MBG的xml配置文件，下面，我们来学习一下吧~~~

#### XML配置详解

首先按照MBG的要求添加XML的文件头：
```
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE generatorConfiguration
          PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
          "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
```

在文件头之后，需要加上XML文件的根节点：`generatorConfiguration`

```
<generatorConfiguration>

	<!--其他配置内容-->

</generatorConfiguration>
```

以上两部分内容是MBG必备的基本信息，后面是MBG中的自定义配置部分。下面介绍 generatorConfiguration 标签下的 3 个子级标签

分别是：`properties`、`classPathEntry` 和 `context`。在配置这三个标签时，注意它们的顺序，必须和这里列举的顺序一致才行！！！

---

第一个是properties标签。这个标签用来指定外部的属性元素，最多可以配置一个，也可以不配置。

properties标签用于指定一个需要在配置中解析使用的外部属性文件，引入属性文件后，可以在配置中使用 `${property}` 这种形式的引用，通过这种方式引用属性文件中的属性值，对于后面需要配置的JDBC信息会很有用。

properties标签包括 resource 和 url 两个属性，只能使用其中一个属性来指定，同时出现则会报错。

* resource：指定classpath下的属性文件，类似：com/liuzhuo/mybatis/generatorConfig.properties 这样的属性值。

* url：指定文件系统上的特定位置，例如：file:///E:/myfolder/generatorConfig.properties

---

第二个是 classPathEntry 标签。这个标签可以配置多个，也可以不配置。

classPathEntry标签最常见的用法是通过属性 location指定驱动的路径，代码如下：

`<classPathEntry location="E:\mysql\mysql-connector-java-5.1.29.jar"/>`

---

第三个是 context 标签。这个标签是要重点讲解的，该标签至少配置一个，可以配置多个。

context标签用于指定生成一组对象的环境。例如指定要连接的数据库，要生成对象的类型和要处理的数据库中的表。运行MBG的时候还可以指定要运行的context。

context标签只有一个必选属性id，用来唯一确定该标签，该id属性可以运行MBG时使用。此外还有几个可选属性：

* defaultModelType：这个属性很重要，定义了MBG如何生成实体类。该属性可选值有：

（1）conditional：默认值，和下面的 hierarchical 类似，如果一个表的主键只有一个字段，那么不会为该字段生成单独的实体类，而是会将该字段合并到基本实体类中。

（2）flat：该模型只为每张表生成一个实体类。这个实体类包含表中的所有字段。这种模型最简单，推荐使用。

（3）hierarchical：如果表有主键，那么该模型会产生一个单独的主键实体类，如果表还有BLOB字段，则会为表生成一个包含所有BLOB字段的单独的实体类，然后为所有其他的字段另外生成一个单独的实体类。MBG会在所有生成的实体类之间维护一个继承关系。

* targetRuntime：此属性用于指定生成的代码的运行环境，支持以下可选值

（1）MyBatis3：默认值

（2）MyBatis3Simple：这种情况不会生成与Example相关的方法。

* introspecedColumnImpl：该参数可以指定扩展 org.mybatis.generator.api.Introspected Column类的实现类。

---

一般情况下，使用如下配置即可。

`<context id="Mysql" defaultModeType="flat">`

---

MBG配置中的其他几个标签基本上都是 context的子标签，这些子标签（有严格的配置顺序）包括以下几个：

* property（0个或多个）

* plugin（0个或多个）

* commentGenerator（0个或多个）

* jdbcConnection（1个）

* javaTypeResolver（0个或多个）

* javaModelGenerator（1个）

* sqlMapGenerator（0个或多个）

* javaClientGenerator（0个或多个）

* table（1个或多个）

下面逐条介绍这些重要的标签。

---

##### property标签

在介绍property标签之前，先来了解一下数据库中的**分隔符**。

举一个简单的例子，假设数据库中有一个表，名为 `user info` ，注意这个名字，user 和 info 中间存在一个空格。如果直接写如下查询，在数据库执行这个查询时会报错。

`select * from user info`

可能会提示 `user` 表不存在或者user附件有语法错误，这种情况下该怎么写 `user info`表呢？

这时，就会用到**分隔符**了，在MySQL中可以使用反单引号 " ` " 作为分隔符，例如：

```
`user info`
```
在SQL Server中则是 [user info]。通过分隔符可以将其中的内容作为一个整体的字符串进行处理，当SQL中有数据库关键字时，使用反单引号括住关键字，可以避免数据库产生错误。

之所以先介绍分隔符，就是因为property标签中包含以下3个和分隔符相关的属性。

* autoDelimitKeywords

* beginningDelimiter

* endingDelimiter

从名字可以看出，第一个是自动给关键字添加分隔符的属性。MBG中维护了一个关键字列表，当数据库中的字段或表与这些关键字一样时，MBG会自动给这些字段或表添加分隔符。关键字列表可以查看MBG中的 org.mybatis.generator.internal.db.SqlReservedWords类。

后面两个属性很简单，一个是配置前置分隔符的属性，一个是配置后置分隔符的属性。在MySQL中，两个分隔符都是 " ` "，在SQL Server中分别为 " [ " 和 " ] "。

MySQL中的property配置写法如下：
```
<context id="Mysql" targetRuntime="MyBatis3" defaultModelType="flat">
   <property name="autoDelimitKeywords" value="true"/>
   <property name="beginningDelimiter" value="`"/>
   <property name="endingDelimiter" value="`"/>

   <!--其他配置-->
</context>
```

除了上面3个和分隔符相关的属性外，还有以下3个属性。

* javaFileEncoding

* javaFormatter

* xmlFormatter

属性 javaFileEncoding 设置要使用的Java文件的编码，例如 GBK 或 UTF-8。默认使用当前运行环境的编码。后面的不常用，就不介绍了。

---

##### plugin标签

plugin标签可以配置0个或多个，个数不受限制。

plugin标签用来定义一个插件，用于扩展或修改通过MBG生成的代码。该插件将按照在配置中的顺序执行。MBG插件使用的情况并不多，如果对开发插件有兴趣，可以参考MBG文档，或者参考下面要介绍的缓存插件的例子，这个例子包含在MBG插件中。

下面要介绍的缓存插件的全限定名称为： org.mybatis.generator.plugins.CachePlugin。

这个插件可以在生成的SQL XML映射文件中增加一个 cache 标签。只有当targetRuntime 为 MyBatis3时，该插件才有效。

该插件接受下列可选属性。

* cache_eviction

* cache_flushInterval

* cache_readOnly

* cache_size

* cache_type

配置方法如下：
```
<plugin type="org.mybatis.generator.plugins.CachePlugin">
   
   <property name="cache_eviction" value="LRU"/>
   <property name="cache_size" value="1024"/>

</plugin>
```

添加这个配置后，生成的Mapper.xml文件中会增加如下的缓存相关配置。
```
<cache eviction="LRU" size="1024">

</cache>
```

---

##### commentGenerator标签

该标签用来配置如何生成注释信息，最多可以配置1个。

该标签有一个可选属性 type，可以指定用户的实现类，该类需要实现 org.mybatis.generator.api.CommentGenerator接口，而且必有一个默认空的构造方法。

type属性接收默认的特殊值：DEFAULT，使用默认的实现类 org.mybatis.generator.internal.DefaultCommentGenerator。

默认的实现类中提供了三个可选属性，需要通过property属性进行配置。

* suppressAllComments：阻止生成注释，默认为false。

* suppressDate：阻止生成的注解包含时间戳，默认为false。

* addRemarkComments：注释是否添加数据库表的备注信息，默认为false。

一般情况下，由于MBG生成的注解信息没有任何价值，而且时间戳的情况下每次生成的注释都不一样，使用版本控制的时候每次都会提交，因而一般情况下都会屏蔽注释信息，可以如下配置：
```
<commentGenerator>

   <property name="suppressDate" value="true"/>
   <property name="addRemarkComments" value="true"/>

</commentGenerator>
```

##### jdbcConnection标签

jdbcConnection标签用于指定MBG要连接的数据库信息，该标签必选，并且只能有一个。

配置该标签需要注意，如果JDBC驱动不在classpath下，就要通过 classPathEntry 标签引入 jar 包，这里推荐将jar包放到classpath下，或者参考前面classPathEntry配置的JDBC驱动的方法。

该标签有两个必选属性。

* driverClass：访问数据库的JDBC驱动程序的完全限定类名。

* connectionURL：访问数据库的JDBC连接URL。

该标签还有两个可选属性。

* userId：访问数据库的用户ID。

* password：访问数据库的密码。

此外，该标签还可以接受多个property子标签，这里配置的property属性都会添加到JDBC驱动的属性中（使用property标签的name属性反射赋值）。

这个标签配置起来非常容易，基本配置如下：
```
<jdbcConnection driverClass="com.mysql.jdbc.Driver"
                connectionURL="jdbc:mysql://localhost:3306/mybatis"
                userId="root"
                password="">
</jdbcConnection>
```

Oracle的配置：
```
<jdbcConnection driverClass="oracle.jdbc.driver.OracleDriver"
                connectionURL="jdbc:oracle:thin:@//localhost:1521/oracle"
                userId="mybatis"
                password="mybatis">
    <property name="remarksReporting" value="true"/>
</jdbcConnection>
```

##### javaTypeResolver标签

该标签的配置用来指定 `JDBC类型` 和 `Java类型` 如何转换，最多可以配置一个。

该标签提供了一个可选的属性type。另外，和commentGenerator类似，该标签提供了默认的实现 DEFAULT ，一般情况下使用默认即可，需要特殊处理的情况可以通过其他标签配置来解决，不建议修改该属性。

该属性还有一个可以配置的property标签，可以配置的属性为：`forceBigDecimals`，该属性可以控制是否强制将 DECIMAL 和 NUMERIC 类型的JDBC 字段转换为JAVA类型的java.math.BigDecimal，默认值为false，一般不需要配置。

默认情况下的转换规则如下：

* 如果精度 > 0 或者 长度 > 18 ，就使用 java.math.BigDecimal。

* 如果精度 = 0 并且 10<=长度<=18，就使用 java.lang.Long。

* 如果精度 = 0 并且 5<=长度<=9，就使用 java.lang.Integer。

* 如果精度 = 0 并且 长度<5，就使用 java.lang.Short。

如果将 forceBigDecimals 设置为 true，那么一定会使用 java.math.BigDecimal类型。

```
<javaTyepResolver>
   <property name="forceBigDecimals" value="false" />
</javaTyepResolver>
```

##### javaModelGenerator标签

该标签用来控制生成的实体类，根据context标签中配置的 defaultModelType属性值的不同，一个表可能会对应生成多个不同的实体类。一个表对应多个类时使用并不方便，所以前面推荐使用 flat，保证一个表对应一个实体类。该标签必须配置一个，并且最多配置一个。

该标签只有两个必选属性。

* targetPackage：生成实体类存放的包名。一般就是放在该包下，实际还会受到其他配置的影响。

* targetProject：指定目标项目路径，可以使用相对路径或绝对路径。

该标签还支持以下几个property子标签属性。

* constructorBased：该属性只对 `MyBatis3` 有效，如果为 true就会使用构造方法入参，如果为 false就会使用setter方式。默认为false。

* enableSubPackages：如果为true，MBG会根据 catalog 和 schema 来生成子包。如果为 false 就会直接使用 targetPackage属性。默认为false。

* immutable：用来配置实体类属性是否可变。如果设置为 true，那么constructorBased不管设置成什么，都会使用构成方法入参，并且不会生成setter方法。如果false，实体类属性就可以改变。默认为false。

* rootClass：设置所有实体类的基类。如果设置，则需要使用类的全限定名称。并且，如果MBG能够加载 rootClass（可以通过classPathEntry引入jar包，或者classpath方式），那么MBG不会覆盖和父类中完全匹配的属性。匹配规则如下：

（1）属性名完全相同

（2）属性类型相同

（3）属性有getter方法

（4）属性有setter方法

* trimStrings：判断是否对数据库查询结果进行trim操作，默认值为false。如果设置为 true就会生成如下代码：
```
public void setUsername(String username){
    this.username = username == null ? null : username.trim();
}
```

javaModelGenerator配置如下：
```
<javaModelGenerator targetPackage="com.liuzhuo.model"
                    targetProject="src\main\java" >  <!--相对路径-->

     <property name="enableSubPackages" value="false" />
     <property name="trimStrings" values="false" />

</javaModelGenerator>
```

##### sqlMapGenerator标签

该标签用于配置SQL映射生成器（Mapper.xml文件）的属性，该标签可选，最多配置一个。

如果targetRuntime设置为MyBatis3，则只有当javaClientGenerator配置需要XML时，该标签才必须配置一个。如果没有配置：javaClientGenerator，则使用以下规则。

* 如果指定了一个sqlMapGenerator，那么MBG将只生成XML的SQL映射文件和实体类。

* 如果没有指定sqlMapGenerator，那么MBG将只生成实体类。

该标签只有两个必选属性。

* targetPackage：生成SQL映射文件（XML文件）存放的包名。一般就是放在该包下，实际还会受到其他配置的影响。

* targetProject：指定目标项目路径，可以使用相对路径或绝对路径。

该标签还有一个可选的property子标签属性：enableSubPackages，如果为true，MBG会根据catalog和schema来生成子包。如果为false就会直接用targetPackage属性，默认为false。

sqlMapGenerator配置如下：
```
<sqlMapGenerator targetPackage="com.liuzhuo.mapper"
                 targetProject="E:\Myproject\src\main\resources">  <!--绝对路径-->

      <property name="enableSubPackages" values="false" />
</sqlMapGenerator>
```

##### javaClientGenerator标签

该标签用于配置Java客户端生成器（Mapper接口）的属性，该标签可选，最多配置一个。如果不配置该标签，就不会生成Mapper接口。

该标签有以下3个必选属性。

* type：用于选择客户端代码（Mapper接口）的属性，用户可以自定义实现，需要继承 org.mybatis.generator.codegen.AbstractJavaClientGenerator类，必须有一个默认空的构造方法。该属性提供了以下预设的代码生成器，首先根据context的targetRuntime分成两类（不考虑iBATIS）。

（1）MyBatis3
```
ANNOTATEDMAPPER: 基于注解的Mapper接口，不会有对应的XML映射文件。
MIXEDMAPPER：    XML和注解的混合模式，上面这种情况中的SQL Provider注解方法会被XML方式替代。
XMLMAPPER：      所有方法都在XML中，接口调用依赖XML文件。
```
（2）MyBatis3Simple
```
ANNOTATEDMAPPER: 基于注解的Mapper接口，不会有对应的XML映射文件。
XMLMAPPER：      所有方法都在XML中，接口调用依赖XML文件。
```

* targePackage：生成Mapper接口存放的包名。一般就是放在该包下，实际还会受到其他配置的影响。

* targetProject：指定目标项目路径，可以使用相对路径或绝对路径。

javaClientGenerator标签配置：
```
<javaClientGenerator type="XMLMAPPER" targetPackage="com.liuzhuo.mapper"
                     targetProject="src\main\java" />

    <property name="enableSubPackages" value="true"/>

</javaClientGenerator>
```

##### table标签

table标签是最重要的一个标签，该标签用于配置需要通过内省数据库的表，只有在table中配置过的表，才能经过上述其他配置生成最终的代码，该标签至少要配置一个，可以配置多个。

table标签有一个必选属性 `tableName` ，该属性指定要生成的表名，可以使用SQL通配符匹配多个表。

例如要生成全部的表，可以配置如下：

`<table tableName="%" />`

table标签包含多个可选属性。

* schema：数据库的schema，可以使用SQL通配符匹配。如果设置了该值，生成SQL的表名会变成如 schema.tableName的形式。

* catalog：数据库的catalog，如果设置了该值，生成SQL的表名会变成如：catalog.tableName的形式。

* alias：如果指定，这个值会用在生成的 select 查询SQL表的别名和列名上，例如 alias_actualColumnName（别名_实际列名）。

* domainObjectName：生成对象的基本名称。如果没有指定，MBG会自动根据表名来生成名称。

* enableXXX：XXX代表多种SQL方法，该属性用来指定是否生成对应的XXX语句。

* selectByPrimaryKeyQueryId：DBA跟踪工具中会用到，具体请参考详细文档。

* selectByExampleQueryid：DBA跟踪工具中会用到，具体请参考详细文档。

* modelType：和context的defaultModelType含义一样，这里可以针对表进行配置，胡覆盖defaultModelType的配置。

* escapeWildcards：表示查询列是否对 schema和表名中的SQL通配符（ _ 和 % ）进行转义。对于某些驱动，当 schema或表名中包含SQL通配符时，转义是必须的。有一些驱动则需要将下画线进行转义，例如：MY_TABLE。默认值是 false。

* delimitidentifiers：是否给标识符增加分隔符。默认是false。当 catalog、schema、tableName中包含空白时，默认为true。

* delimitAllColumns：是否对所有列添加分隔符。默认为 false。

---

除了 property 子标签外， table 还包含以下子标签。

* generatedKey （0个或 多个）

* columnRenamingRule（0 个或 多个）

* columnOverride （0个或多个）

* ignoreColumn （0个或多个）

---

generatedKey：该标签用来指定自动生成主键的属性。

该标签包含以下两个必选属性。

* column：生成列的列名

* sqlStatement：返回新值的SQL语句。如果这是一个identity列，则可以使用其中一个预定义的特殊值，预定义值如下：

（1） Cloudscape 

（2）DB2

（3）DB2_MF

（4）Derby 

（5）HSQLDB

（6）Informix

（7）MySQL

（8）SQL Server

（9）SYBASE

（10）JDBC：使用该值时，Mybatis会使用JDBC标准接口来获取值，这是一个独立于数据库获取标识列中的值的方法。


该标签还包含两个可选属性。

* identity：当设置为 true 时，该列会被标记为 identity 井且 selectKey标签会被插入在 insert后面；当设置为 false时，selectKey标签会被插入在 insert前面面。

* type： type = post 且 identity=true 时，生成的 selectKey 中 order=AFTER；当type=pre时，identity只能为false，生成selectKey中的 order=BEFORE。

---

table的示例：
```
<table tableName="user login info" domainObjectName= "UserLogininfo">

       <generatedKey column="id" sqlStatement="MySql" />
</table> 
```

改配置生成的对应的insert方法如下：
```
<insert id="insert" parameterType="com.liuzhuo.model.UserLogininfo">
    <selectKey keyProperty="id" order="AFTER" resultType="java.lang.Integer">
            SELECT LAST INSERT ID () 
    </selectKey> 
    insert into `user login info` (Id, username , logindate , loginip) 
    values (#{id,jdbcType=INTEGER} , #{username , jdbcType=VARCHAR} , 
            #{logindate,jdbcType=TIMESTAMP}
            #{loginip,jdbcType=VARCHAR}) 
</ insert> 
```

---

#### 完整的配置

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE generatorConfiguration
        PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">

<generatorConfiguration>

    <classPathEntry
            location="D:\mysql-connect-jar\mysql-connector-java-5.1.39.jar"/>

    <context id="mySqlContext" targetRuntime="MyBatis3" 
             defaultModelType="flat">

        <property name="begnningDelimiter" value="`"/>
        <property name="endingDelimiter" value="`"/>

        <commentGenerator>
            <property name="suppressDate" value="false"/>
            <property name="suppressAllComments" value="true"/>
        </commentGenerator>

        <jdbcConnection driverClass="com.mysql.jdbc.Driver"
                        connectionURL="jdbc:mysql://localhost:3306/mybatis"
                        userId="root"
                        password=""/>

        <javaModelGenerator targetPackage="com.liuzhuo.entity"
                            targetProject="src\main\java">
            <property name="enableSubPackages" value="true"/>
            <property name="trimStrings" value="true"/>
        </javaModelGenerator>

        <sqlMapGenerator targetPackage="com.liuzhuo.mapper"
                         targetProject="src\main\resources">
            <property name="enableSubPackages" value="true"/>
        </sqlMapGenerator>

        <javaClientGenerator targetPackage="com.liuzhuo.mapper"
                             targetProject="src\main\java"
                             type="MIXEDMAPPER">
            <property name="enableSubPackages" value="true"/>
        </javaClientGenerator>

        <!--<table tableName="T_FEE_AGTBILL" domainObjectName="FeeAgentBill"
               enableCountByExample="false" enableUpdateByExample="false"
               enableDeleteByExample="false" enableSelectByExample="false"
               selectByExampleQueryId="false"/>-->

        <table tableName="student" domainObjectName="Student">
              <generatedKey column="id" sqlStatement="MySql"/>
        </table>

    </context>
</generatorConfiguration>
```

有关配置有几点重要说明。

（1）context属性 targetRuntime 设置为 MyBatis3Simple，可以避免生成与Example相关的代码和方法，如果需要Example相关的代码，则设置为：MyBatis3.

（2）context属性 defaultModelType 设置为 flat，目的是使每个表只生成一个实体类，当没有复杂的类继承时，使用起来更方便。

（3）因为此处使用的数据库为MySQL，所以前后分隔符都设置为 " ` "。

---

#### 运行MyBatis Generator

MBG提供了很多种运行方式，常用的有以下几种：

* 使用java编写代码运行

* 从命令提示符运行

* 使用 Maven Plugin运行

* 使用 Eclipse插件运行

---

##### 使用java编写方式

在写代码之前，需要先把MBG的jar包添加到项目当中。

第一种方式是，从地址：https://github.com/mybatis/generator/releases 下载jar包。

第二种方式是，使用Maven方式直接引入依赖，在pom.xml中添加如下依赖：
```
<dependency>
    <groupId>org.mybatis.generator</groupId>
    <artifactId>mybatis-generator</artifactId>
    <version>1.3.7</version>
</dependency>
```

在MyBatis项目中添加 `com.mybatis.generator`包，创建Generator.java类。

```
public class Generator {

   public static void main(String[] args) throws Exception{
    //MBG执行过程中的警告信息
    List<String> warning = new ArrayList<String>();
    //当生成的代码重复时，覆盖原代码
    boolean overwrite = true;
    //读取MBG配置文件
    InputStream is = Generator.class.getResourceAsStream("/generator/generatorConfig.xml");
    ConfigurationParser cp = new ConfigurationParser(warnings);
    Configuration config = cp.parseConfiguration(is);
    is.close();

    DefaultShellCallback callback =  new DefaultShellCallback(overwrite);

   //创建MBG
   MyBatisGenerator myBatisGenerator = new MyBatisGenerator(config,callback,warnings);
   //执行生成代码
   myBatisGenerator.generate(null);
   //输出警告信息
   for(Strng warning : warnings) { 
       System.out.println(warning); 
     }
  }
}
```

使用Java编码方式运行的好处是，generatorConfig.xml配置的一些特殊的类（如commentGenerator 标签中 type 属性配置的 MyCommentGenerator 类）只要在当前项目中，或者在当前项目的 classpath 中， 就可以直接使用。使用其他方式时都需要特别配置才能在MBG执行过程中找到 MyCommentGenerator 类并实例化，否则都会由于找不到这个类而抛出异常。


##### 从命令提示符运行

从命令提示符运行就必须使用 jar包，将这个jar包与generatorConfig.xml文件放在一起。从这里就可以体会到为什么说这种配置方式不方便了，因为需要修改generatorConfig.xml配置文件。

将 MySQL JDBC 驱动 （如 mysql-connector java-5.1.38.jar ）放到当前目录中，然后在配置文件中添加classPathEntry：
```
<generatorConfiguration>
 
<classPathEntry location="mysql-connector java-5.1.38.jar"/>

<context id="MySqlContext" defaultModelTyp="flat">
  <!--其他原有配置-->
</context>

</generatorConfiguration> 
```

除此之外，在当前目录中添加src文件夹，在src中再添加 main文件夹，main文件夹中添加 java 和 resources文件夹。
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190317175506.png" style="width:50%"/>

下面介绍一下MBG命令行可以接受的几个参数：

* -configfile fileName ：指定配置文件的名称。

* -overwrite(可选)：指定了该参数后，如果生成的java文件已经存在同名的文件，新生成的文件则会覆盖原有的文件。否则，会新生成一个唯一的名字。

* -verbose（可选）：指定该参数，执行过程中会输出到控制台。

* -forceJavaLogging（可选）：指定该参数，MBG将会使用Java日志记录而不会使用Log4J，即使Log4J在运行时的类路径中。

* contextids context1,context2,···(可选)：指定该参数，逗号隔开这些的context会被执行。

* tables table1,table2,···(可选)：指定该参数，逗号隔开的这些表会被运行。

---

```
java -jar mybatis-generator-core-1.3.3.jar -configfile generatorConfig.xml


java -Dfile.encoding=UTF-8 -jar mybatis-generator-core-1.3.3.jar -configfile generatorConfig.xml -overwrite
```

---

##### 使用Maven Plugin运行

使用 Maven Plugin 插件方式和 java编码方式类似，都是和项目绑定在一起的，当需要引用其他类时，需要给 Maven插件添加依赖，否则找不到类。

在pom.xml文件中添加插件配置：
```
	<build>
		<plugins>
            <plugin>
			<groupid>org.mybatis.generator</groupid> 
			<artifactid>mybatis-generator-maven-plugin</artifactid> 
			<version>l.3.3</version> 
			<configuration> 
			     <configurationFile> 
			              ${basedir}/src/main/resources/generator/generatorConfig.xml 
			     </configurationFile> 
			     <overwrite>true</overwrite>
			     <verbose>true</verbose> 
			</configuration> 
			<dependencies> 
			     <dependency> 
			         <groupid>mysql</groupid> 
			         <artifactid>mysql-connector-java</artifactid> 
			         <version>5.l.38</version> 
			     </dependency> 
			     <dependency> 
			         <groupid>com.liuzhuo</groupid> 
			         <artifactid>mybatis</artifactid> 
			         <version>0.0.1-SNAPSHOT</version> 
			      </dependency> 
			</dependencies> 
			</plugin> 
		</plugins>
	</build>
```

这里`<configuration>`就和命令行的参数一样，不用讲了，特殊之处在于插件中的`<dependencies>`，在generatorConfig.xml配置文件中，没有通过classPathEntry方式配置 JDBC驱动了，这里通过添加依赖将 JDBC驱动添加到了MBG的classpath中，另外还添加了当前项目的依赖。

**需要特别注意的是：**当前项目必须执行 mvn install（通过Maven命令将当前项目安装到本地仓库），否则会找不到当前项目的依赖。

配置好插件后，可以执行：

`mvn mybatis-generator:generate`

---

##### Eclipse插件方式

（1）安装Eclipse插件：

从MBG的发布页面 https://github.com/mybatis/generator/releases 中下载插件：

`org.mybatis.generator.eclipse.site-1.3.7.201807042148.zip`
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190317182045.png"/>

下载好插件后，在Eclipse中选中菜单 Help 中的 Install New Software：

点击Add按钮，在弹出的窗口中选择 Archive，选择下载完成的 MBG 插件，输入 Name MBG后，点击OK。

从下拉列表中选择全部的 MyBatis Generator，点击Next，一步步完成安装，安装完成后重启Eclipse。

（2）使用Eclipse插件

Eclipse 插件的运行方式有点特殊， JDBC 驱动需要通过 classPathEntry 进行配置，其他定制类只要在当前项目或当前项目classpath中即可使用。

```
<generatorConfiguration>

    <classPathEntry
            location="D:\mysql-connect-jar\mysql-connector-java-5.1.39.jar"/>

    <context id="mySqlContext" targetRuntime="MyBatis3" 
             defaultModelType="flat">

        <property name="begnningDelimiter" value="`"/>
        <property name="endingDelimiter" value="`"/>
        <property name="javaFileEncoding" value="UTF-8"/>
        <!--其他配置-->
</generatorConfiguration>
```

(3) 运行

完成上述修改后，在配置文件中单击鼠标右键，选择：`Generate MyBatis/iBATIS Artifacts`

点击 Generate MyBatis 后就会自动生成代码。

---

##### 使用IDEA的方式

我自己使用的是IDEA的方式。

随便创建一个 Springboot的web项目：

我填写的是：
groupId：com.generator
artifactId：mybatis

项目结构：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190317183413.png"/>

pom.xml文件：
```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.generator</groupId>
    <artifactId>mybatis</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>mybatis</name>
    <description>generator-mybatis</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>1.5.6.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>1.3.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.mybatis.generator</groupId>
                <artifactId>mybatis-generator-maven-plugin</artifactId>
                <version>1.3.2</version>
                <configuration>
                    <verbose>true</verbose>
                    <overwrite>true</overwrite>
                </configuration>
                <dependencies>
                    <dependency>
                        <groupId>mysql</groupId>
                        <artifactId>mysql-connector-java</artifactId>
                        <version>5.1.39</version>
                    </dependency>
                </dependencies>
            </plugin>
        </plugins>
    </build>

</project>
```

在resources中，添加：generator.properties 文件：
```
jdbc.driverClass=com.mysql.jdbc.Driver
jdbc.connectionURL=jdbc:mysql://localhost:3306/mybatis
jdbc.userId=root
jdbc.password=123456
jdbc.database=mybatis
```

generatorConfig.xml文件中：
```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE generatorConfiguration
        PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">

<generatorConfiguration>
    <!--导入属性配置 -->
    <properties resource="generator.properties"></properties>

    <!--指定特定数据库的jdbc驱动jar包的位置 -->
    <!--<classPathEntry location="${jdbc.driverLocation}"/>-->

    <context id="default" targetRuntime="MyBatis3">


        <!-- optional，旨在创建class时，对注释进行控制 -->
        <commentGenerator>
            <!-- 是否去除自动生成的注释 true：是 ： false:否 -->
            <property name="suppressDate" value="false"/>
            <property name="suppressAllComments" value="true"/>
        </commentGenerator>


        <!--jdbc的数据库连接 -->
        <!--数据库连接的信息：驱动类、连接地址、用户名、密码 -->
        <jdbcConnection
                driverClass="${jdbc.driverClass}"
                connectionURL="${jdbc.connectionURL}"
                userId="${jdbc.userId}"
                password="${jdbc.password}">
        </jdbcConnection>


        <!-- 非必需，类型处理器，在数据库类型和java类型之间的转换控制-->
        <javaTypeResolver>
            <property name="forceBigDecimals" value="false"/>
        </javaTypeResolver>

        <!-- Model模型生成器,用来生成含有主键key的类，记录类 以及查询Example类
            targetPackage     指定生成的model生成所在的包名
            targetProject     指定在该项目下所在的路径
        -->
        <javaModelGenerator targetPackage="com.liuzhuo.model.student" targetProject="src/main/java">
            <!-- 是否对model添加 构造函数 -->
            <property name="constructorBased" value="true"/>

            <!-- 是否允许子包，即targetPackage.schemaName.tableName -->
            <property name="enableSubPackages" value="false"/>

            <!-- 建立的Model对象是否 不可改变  即生成的Model对象不会有 setter方法，只有构造方法 -->
            <property name="immutable" value="false"/>

            <!-- 是否对类CHAR类型的列的数据进行trim操作 -->
            <property name="trimStrings" value="true"/>
        </javaModelGenerator>

        <!--Mapper映射文件生成所在的目录 为每一个数据库的表生成对应的SqlMap文件 -->
        <sqlMapGenerator targetPackage="com.liuzhuo.mapper.student" targetProject="src/main/java">
            <property name="enableSubPackages" value="false"/>
        </sqlMapGenerator>


        <!-- 客户端代码，生成易于使用的针对Model对象和XML配置文件 的代码
                type="ANNOTATEDMAPPER",生成Java Model 和 基于注解的Mapper对象
                type="MIXEDMAPPER",生成基于注解的Java Model 和相应的Mapper对象
                type="XMLMAPPER",生成SQLMap XML文件和独立的Mapper接口
        -->
        <javaClientGenerator targetPackage="com.liuzhuo.mapper.student" targetProject="src/main/java"
                             type="MIXEDMAPPER">
            <property name="enableSubPackages" value="true"/>
            <!--
                    定义Maper.java 源代码中的ByExample() 方法的可视性，可选的值有：
                    public;
                    private;
                    protected;
                    default
                    注意：如果 targetRuntime="MyBatis3",此参数被忽略
             -->
            <property name="exampleMethodVisibility" value="public"/>
            <!--
              方法名计数器
              Important note: this property is ignored if the target runtime is MyBatis3.
            <property name="methodNameCalculator" value=""/>
             -->
            <!--
                  为生成的接口添加父接口
            <property name="rootInterface" value=""/>
            -->
        </javaClientGenerator>

        <!--tableName:表名
            schema:数据库名
            domainObjectName:实体类的名字
        -->
        <!--详细的表-->
        <!--
       <table tableName="tbl_file_permission_map" schema="${jdbc.database}"
               domainObjectName="FilePermissionMap"
               enableCountByExample="false" enableUpdateByExample="false"
               enableDeleteByExample="false" enableSelectByExample="false"
               selectByExampleQueryId="false">

               optional , only for mybatis3 runtime
               自动生成的键值（identity,或者序列值）
               如果指定此元素，MBG将会生成<selectKey>元素，然后将此元素插入到SQL Map的<insert> 元素之中
               sqlStatement 的语句将会返回新的值
               如果是一个自增主键的话，你可以使用预定义的语句,或者添加自定义的SQL语句. 预定义的值如下:
                  Cloudscape    This will translate to: VALUES IDENTITY_VAL_LOCAL()
                  DB2:      VALUES IDENTITY_VAL_LOCAL()
                  DB2_MF:       SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1
                  Derby:        VALUES IDENTITY_VAL_LOCAL()
                  HSQLDB:   CALL IDENTITY()
                  Informix:     select dbinfo('sqlca.sqlerrd1') from systables where tabid=1
                  MySql:        SELECT LAST_INSERT_ID()
                  SqlServer:    SELECT SCOPE_IDENTITY()
                  SYBASE:   SELECT @@IDENTITY
                  JDBC:     This will configure MBG to generate code for MyBatis3 suport of JDBC standard generated keys. This is a database independent method of obtaining the value from identity columns.
                  identity: 自增主键  If true, then the column is flagged as an identity column and the generated <selectKey> element will be placed after the insert (for an identity column). If false, then the generated <selectKey> will be placed before the insert (typically for a sequence).

            <generatedKey column="" sqlStatement="" identity="" type=""/>

            optional.
                     列的命名规则：
                     MBG使用 <columnRenamingRule> 元素在计算列名的对应 名称之前，先对列名进行重命名，
                     作用：一般需要对BUSI_CLIENT_NO 前的BUSI_进行过滤
                     支持正在表达式
                     searchString 表示要被换掉的字符串
                     replaceString 则是要换成的字符串，默认情况下为空字符串，可选

            <columnRenamingRule searchString="" replaceString=""/>

            optional.告诉 MBG 忽略某一列
                    column，需要忽略的列
                    delimitedColumnName:true ,匹配column的值和数据库列的名称 大小写完全匹配，false 忽略大小写匹配
                    是否限定表的列名，即固定表列在Model中的名称

            <ignoreColumn column="" delimitedColumnName=""/>


            optional.覆盖MBG对Model 的生成规则
                 column: 数据库的列名
                 javaType: 对应的Java数据类型的完全限定名
                 在必要的时候可以覆盖由JavaTypeResolver计算得到的java数据类型. For some databases, this is necessary to handle "odd" database types (e.g. MySql's unsigned bigint type should be mapped to java.lang.Object).
                 jdbcType:该列的JDBC数据类型(INTEGER, DECIMAL, NUMERIC, VARCHAR, etc.)，该列可以覆盖由JavaTypeResolver计算得到的Jdbc类型，对某些数据库而言，对于处理特定的JDBC 驱动癖好 很有必要(e.g. DB2's LONGVARCHAR type should be mapped to VARCHAR for iBATIS).
                 typeHandler:

            <columnOverride column="" javaType="" jdbcType="" typeHandler="" delimitedColumnName=""/>
        </table>
        -->

        <!--其他表的简单配置-->
        <table tableName="student" domainObjectName="Student"
               enableCountByExample="false" enableUpdateByExample="false"
               enableDeleteByExample="false" enableSelectByExample="false"
               selectByExampleQueryId="false">
        </table>
    </context>
</generatorConfiguration>
```

resources目录结构：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190317190500.png"/>

---

使用 Maven 插件运行：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190317190650.png" style="width:50%"/>


运行后的结果：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190317190809.png"/>

---

### 图像化方式

mybatis-generator-gui是基于mybatis generator开发一款界面工具, 本工具可以使你非常容易及快速生成Mybatis的Java POJO文件及数据库Mapping文件。

地址是：https://github.com/zouzg/mybatis-generator-gui

要求：本工具由于使用了Java 8的众多特性，所以要求JDK 1.8.0.60以上版本，另外JDK 1.9暂时还不支持。

---

#### 方式一下载软件

直接下载软件： http://tools.mingzhi.ink

（1）下载完成后，直接运行该软件（前提，你的本机的java环境变量要配置为：JDK 1.8.0.60以上版本）。
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190317215847.png"/>

（2）点击保存后：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190317220231.png"/>

（3）点击代码生成：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190317220414.png"/>

#### 方式二下载源码启动

##### 两种方式下载源码

* 直接下载源码：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190318092300.png"/>

* 使用git工具：`git clone https://github.com/zouzg/mybatis-generator-gui`

##### 两种方式启动

* 直接进入下载好的源码目录

直接下载的目录为：`mybatis-generator-gui-master` ，git后的目录为：`mybatis-generator-gui`

(1)在根目录下，启动 `cmd`

然后输入：`mvn jfx:jar`
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190318092931.png"/>

注意：你的本机要先安装好 maven，并配置好相关的环境变量。

输入命令后，会开始下载相关的jar包：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190318093145.png"/>

(2) 进入target/jfx/app/目录下

输入：`cd target/jfx/app/`

然后输入：`java -jar mybatis-generator-gui.jar`
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190318093422.png"/>

回车后，就会弹出界面系统：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190318093506.png"/>

---

* 使用Eclipse或IDEA启动下载好的源代码

要求，你的IDE配置的JDK必须大于：1.8.0.40。

在 com.zzg.mybatis.generator下，找到：`MainUI` 主类：

<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190318093945.png"/>

运行主类即可：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190318094150.png"/>

---

<font color="red">
**注意事项**

(1) 本自动生成代码工具只适合生成单表的增删改查，对于需要做数据库联合查询的，请自行写新的XML与Mapper；

(2) 部分系统在中文输入方法时输入框中无法输入文字，请切换成英文输入法；

(3) 如果不明白对应字段或选项是什么意思的时候，把光标放在对应字段或Label上停留一会然后如果有解释会出现解释；

</font>

---

还有一款图形化生成器：https://github.com/spawpaw/mybatis-generator-gui-extension

大家可以自行尝试，运行。