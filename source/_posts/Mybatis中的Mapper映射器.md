---
title: Mybatis中的Mapper映射器
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-11 13:45:30
summary: Mybatis中的Mapper映射器
---

映射器是Mybatis最强大的工具，也是我们使用Mybatis时用得最多的工具，因此熟练掌握它十分必要。

MyBatis 的真正强大在于它的映射语句，也是它的魔力所在。由于它的异常强大，映射器的 XML 文件就显得相对简单。如果拿它跟具有相同功能的 JDBC 代码进行对比，你会立即发现省掉了将近 95% 的代码。MyBatis 就是针对 SQL 构建的，并且比普通的方法做的更好。

SQL 映射文件有很少的几个顶级元素（按照它们应该被定义的顺序）：

* cache – 给定命名空间的缓存配置。

* cache-ref – 其他命名空间缓存配置的引用。

* resultMap – 是最复杂也是最强大的元素，用来描述如何从数据库结果集中来加载对象。

* parameterMap – 已废弃！老式风格的参数映射。内联参数是首选,这个元素可能在将来被移除，这里不会记录。

* sql – 可被其他语句引用的可重用语句块。

* insert – 映射插入语句

* update – 映射更新语句

* delete – 映射删除语句

* select – 映射查询语句

下一部分将从语句本身开始来描述每个元素的细节。

---

### select元素

查询语句是 MyBatis 中最常用的元素之一，光能把数据存到数据库中价值并不大，如果还能重新取出来才有用，多数应用也都是查询比修改要频繁。对每个插入、更新或删除操作，通常对应多个查询操作。这是 MyBatis 的基本原则之一，也是将焦点和努力放到查询和结果映射的原因。简单查询的 select 元素是非常简单的。比如：
```
<select id="selectPerson" parameterType="int" resultType="hashmap">
  SELECT * FROM PERSON WHERE ID = #{id}
</select>
```
这个语句被称作 selectPerson，接受一个 int（或 Integer）类型的参数，并返回一个 HashMap 类型的对象，其中的键是列名，值便是结果行中的对应值。

注意参数符号：
`#{id}`

这就告诉 MyBatis 创建一个预处理语句参数，通过 JDBC，这样的一个参数在 SQL 中会由一个“?”来标识，并被传递到一个新的预处理语句中，就像这样：
```
// Similar JDBC code, NOT MyBatis…
String selectPerson = "SELECT * FROM PERSON WHERE ID=?";
PreparedStatement ps = conn.prepareStatement(selectPerson);
ps.setInt(1,id);
```

当然，这需要很多单独的 JDBC 的代码来提取结果并将它们映射到对象实例中，这就是 MyBatis 节省你时间的地方。我们需要深入了解参数和结果映射，细节部分我们下面来了解。

select 元素有很多属性允许你配置，来决定每条语句的作用细节。

```
<select
  id="selectPerson"
  parameterType="int"
  parameterMap="deprecated"
  resultType="hashmap"
  resultMap="personResultMap"
  flushCache="false"
  useCache="true"
  timeout="10000"
  fetchSize="256"
  statementType="PREPARED"
  resultSetType="FORWARD_ONLY">
```
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190311135926.png"/>

#### 自动映射

在简单的场景下，MyBatis可以替你自动映射查询结果。如果遇到复杂的场景，你需要构建一个resultMap，resultMap之后介绍。

有这样一个参数autoMappingBehavior，当它不设置为NONE的时候，只要返回的SQL列名和POJO对象的属性名一致（忽略大小写），Mybatis就会帮助我们回填这些字段而无需任何配置，它可以在很大程度上简化我们的配置工作。

在实际工作中，大部分数据库规范都是要求大写单词命名，单词间用下划线分隔，而java则是使用驼峰命名法，于是可以使用列的别名来使得Mybatis自动映射，或者直接在配置文件中开启驼峰命名方式。

让我们来看一个简单的例子，体验一下自动映射的好处。

javaBean:
```
public class Role{
   private Long id;
   private String roleName;
   private String note;

   ···set、get、toString方法
}
```

数据库表（T_ROLE）
```
字段        类型
ID          INT(20)
ROLE_NAME   VACHAR(60)
NOTE        VARCHAR(1024)
```

让我们编写Mapper的映射语句：
```
<select id="getRole" parameterType="long" resultType="role">
     select id, role_name as roleName, note from t_role where id = #{id}
</select>
```

RoleMapper接口：
```
public Role getRole(Long id);
```

虽然数据中的列名和javaBean的属性名不是一一对应，但是我们在查询语句中使用了 `as` 别名，让它们一致了，所以Mybatis会自动帮我们映射。

---

自动映射可以在 `settings元素` 中配置 autoMapperBehavior属性值来设置其策略，它含有三个值：

* NONE，取消自动映射。仅设置手动映射属性。

* PARTIAL，只会自动映射，没有定义嵌套结果映射的结果集

* FULL，会自动映射任意复杂的结果集（无论是否嵌套）

**默认值是PARTIAL**，当使用FULL时，自动映射会在处理join结果时执行，并且join取得若干相同行的不同实体数据，因此这可能导致非预期的映射。

下面的例子将展示这种风险：
```
<select id="selectBlog" resultMap="blogResult">
  select
    B.id,
    B.title,
    A.username,
  from Blog B left outer join Author A on B.author_id = A.id
  where B.id = #{id}
</select>
```
```
<resultMap id="blogResult" type="Blog">
  <association property="author" resultMap="authorResult"/>
</resultMap>

<resultMap id="authorResult" type="Author">
  <result property="username" column="author_username"/>
</resultMap>
```
在结果中Blog和Author均将自动映射。但是注意Author有一个id属性，在ResultSet中有一个列名为id， 所以Author的id将被填充为Blog的id，这不是你所期待的。所以需要谨慎使用FULL。

通过添加autoMapping属性可以忽略自动映射等级配置，你可以启用或者禁用自动映射指定的ResultMap。
```
<resultMap id="userResultMap" type="User" autoMapping="false">
  <result property="password" column="hashed_password"/>
</resultMap>
```

---

如果你的数据库是规范命名的，即每个单词之间用下划线隔开，javaBean采用驼峰命名法，那么你可以使用设置 `mapUnderscoreToCamelCase = true`,这样不用使用 `as`来重新命名列名 , Mybatis也会帮我们自动映射的。

#### 传递多个参数

之前的例子，我们都是传递一个参数，但是，更多的时候我们需要传递多个参数给映射器。

##### 使用Map传递多个参数

```
    <select id="selectByMap" parameterType="map" resultMap="userMap">
        select userId,user_age ,user_name ,user_sex  from user where userId = #{id} and user_age=#{userAge}
    </select>
```

这里，parameterType = "map"，说明参数是Map类型的。

```
public interface UserMapper {

    User selectByMap(Map<String,String> map);
}

```
```
    sqlSession = SqlSessionFactoryUtil.openSqlSession();
    UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
    Map<String ,String > userMap = new HashMap<>();
    userMap.put("id","1");
    userMap.put("userAge","18");
    User user = userMapper.selectByMap(userMap);
    System.out.println(user);
```
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190311144413.png"/>

使用Map来传递多个参数的话，<font color="red">Map中的键名，必须和SQL语句中的：#{XXX}中的XXX一致才行。</font>

这里就是 id 和 userAge，现在我们修改一下，传递给Map的键名，将 userAge 变成 user_age.
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190311144942.png"/>

---

使用Map传递多个参数的缺点：因为参数是封装在Map中的，由于业务关联性不强，你需要深入到程序中看代码，造成可读性下降。

##### 使用注解的方式

我们需要使用Mybatis的参数注解@Param(org.apache.ibatis.annotations.Param)来实现想要的功能。

```
User selectByAnnotation(@Param("id") String userId, @Param("userAge") long useAge);
```
```
<select id="selectByMap" parameterType="map" resultMap="userMap">
    select userId,user_age ,user_name ,user_sex  from user 
    where userId = #{id} and user_age = #{userAge}
</select>
```
这样，Mybatis会把 @Param("xxx") 代表的值，传递给 SQL语句中的 #{xxx}.

这样可读性性增强了，但是当需要传递的参数过多的时候，那么我们会写很多的@Param注解，麻烦。

##### 使用javaBean的方式

当参数过多的时候，Mybatis允许组织一个JavaBean，通过简单的 setter 和 getter 方法设置参数，这样就可以提高我们的可读性。

首先定义一个javaBean对象：
```
public class User {
    private String userId;
    private Long userAge;
    private String userName;
    private Sex userSex;
    ····set、get方法
}
```
```
<select id="selectByMap" parameterType="com.liuzhuo.entities.User" resultMap="userMap">
    select userId,user_age ,user_name ,user_sex  from user 
    where userId = #{id} and user_age = #{userAge}
</select>
```

这里，parameterType为javaBean的全限定名，如果你配置了别名的话，就直接使用别名也行，更方便。

```
public User selectByUser(User user);
```

---

##### 总结

* 使用Map传递参数。因为Map导致业务可读性差，从而导致后续扩展和维护的困难，我们应该在实际开发中废弃这样的方式

* 使用@Param注解，这个方式适合于参数不多的情况下（参数<=5）

* javaB的方式，适合于参数过多的情况

---

#### resultMap映射结果集

在自动映射章节，我们使用的是 `resultType=javaBean的全限定名` 来完成自动映射的，但是某些时候，我们需要处理更多复杂的映射。

resultMap为我们提供了这样的模式，使用resultMap之前，我们需要首先定义它：
```
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
```
**`使用<resultMap>标签来定义，然后在<select>标签中使用 resultMap = 在<resultMap>中定义的id 即可`。**

解释一下resultMap的配置：

* id是resultMap的唯一标识，用type属性去定义它对应的是哪个javaBean（可以使用别名）

* 通过`<id>元素`定义这个对象的主键，column：列名，property：属性名

* 通过`<result>元素`定义普通列的映射关系，column：列名，property：属性名

* 这样select语句就不再需要使用自动映射规则了，直接使用resultMap属性指定的userMap即可，这样Mybatis就会使用这个自定义的映射规则了。

javaType，jdbcType，typeHandler是用来指定TypeHandler的，之前我们就讲过，现在应该有点感觉了吧~~~

resultMap是映射器中最为复杂的元素，它一般用于复杂、级联这些关联的配置，后面会单独来讲解，这样就简单了解一下。

---

### insert元素

insert元素，相对于select元素而言简单许多了。Mybatis执行insert后会返回一个整数，代表插入到数据库的行数。
update、delete类似。
```
<insert
  id="insertAuthor"
  parameterType="domain.blog.Author"
  flushCache="true"
  statementType="PREPARED"
  keyProperty=""
  keyColumn=""
  useGeneratedKeys=""
  timeout="20">

<update
  id="updateAuthor"
  parameterType="domain.blog.Author"
  flushCache="true"
  statementType="PREPARED"
  timeout="20">

<delete
  id="deleteAuthor"
  parameterType="domain.blog.Author"
  flushCache="true"
  statementType="PREPARED"
  timeout="20">
```

详细介绍：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190311153037.png"/>

<font color="red">注意：keyProperty 和 keyColumn不能同时使用，keyProperty表示以哪个列名作为属性的主键，keyColumn是表示哪一列，接受的是整数！！</font>

---

简单使用：
```
    <insert id="insertUser" parameterType="user">
        INSERT INTO user(userId,user_age,user_name,user_sex)
        VALUES (#{userId},#{userAge},#{userName},#{userSex,typeHandler=com.liuzhuo.typehandler.SexEnumTypeHandler})
    </insert>
```

---

#### 主键回填和自定义

现实中有许多我们需要处理的问题，例如，主键自增字段；MySql里面的主键需要根据一些特殊的规则去生成，在插入后我们往往需要获取到这个主键，以便未来的操作，而Mybatis提供了实现的方法。

首先，我们可以使用 keyProperty 属性指定哪个是主键字段，同时使用 useGeneratedKeys属性告诉Mybatis这个主键是否使用数据库内置策略生成。
```
    <insert id="insertUser" parameterType="user"
            useGeneratedKeys="true" keyColumn="userId">
        INSERT INTO user(user_age,user_name,user_sex)
        VALUES (#{userAge},#{userName},#{userSex,typeHandler=com.liuzhuo.typehandler.SexEnumTypeHandler})
    </insert>
```

这样，我们传入的user对象，就不需要设置userId的值了，Mybatis会用数据库的设置进行处理。这样做的好处是在Mybatis插入的时候，它会回填javaBean的id值。

**以上成功的前提是数据库支持自动生成主键的字段（比如 MySQL 和 SQL Server）**

---

对于不支持自动生成类型的数据库或可能不支持自动生成主键的 JDBC 驱动，MyBatis 有另外一种方法来生成主键。

这里有一个简单示例，表中没有记录 id就为 1，否则为最大的 id + 2：
```
<insert id="inserUser" parameterType="user" keyColumn="userId">
  <selectKey keyProperty="userId" resultType="int" order="BEFORE">
    select if( max(user_id) is null , 1 , max(user_id) + 2 ) as newId from user
  </selectKey>
  insert into user
    (user_id, user_name, user_age,user_sex)
  values
    (#{userId}, #{userName}, #{userAge}, #{userSex})
</insert>
```
在上面的示例中，selectKey 元素将会首先运行，User 的 userId 会被设值，然后插入语句会被调用。这给你了一个和数据库中来处理自动生成的主键类似的行为，避免了使 Java 代码变得复杂。

---

selectKey 元素描述如下：
```
<selectKey
  keyProperty="id"
  resultType="int"
  order="BEFORE"
  statementType="PREPARED">
```
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190311155900.png"/>

---

### update/delete

这个两个元素比较简单，所以放在一起讨论，和insert元素一样，Mybatis执行update、delete元素后会返回一个整数，标出执行后影响的记录条数。

```
<update id="updateUser">
  update user set
    user_name = #{userName},
    user_age = #{userAge},
  where id = #{id}
</update>

<delete id="deleteUser">
  delete from user where user_id = #{userId}
</delete>
```


### 参数

#### 参数设置

正如你所见，我们可以传入一个简单的参数，比如int、double等，也可以传入javaBean，这些我们都讨论过了，有时候我们需要处理一个特殊的情况，我们可以指定特定的类型，以确定使用哪个typeHandler处理它们，以便我们进行特殊的处理。

```
#{ age, javaType=int , jdbcType = NUMERIC }
```

当然，我们还可以指定用哪个typeHandler去处理参数

```
#{ age, javaType=int , jdbcType = NUMERIC , typeHandler = MyTypeHandler}
```

此外，我们还可以对一些数值型的参数设置其保存的精度
```
#{ price , javaType= double , jdbcType = NUMERIC , numericScale = 2}
```

可见Mybatis映射器可以通过EL的功能帮助完成我们所需要的多种的功能，使用还是很方便的。

---

#### 特殊字符串处理(#和$)

在Mybatis中，我们常常传递字符串，我们设置的参数 #{name} 在大部分的情况下Mybatis会用创建**预编译的语句**，然后Mybatis为它设值，而有时候我们需要的是传递SQL语句本身，而不是SQL所需要的参数。

例如，在一些动态表格中，我们需要传递SQL的列名，根据某些列进行排序，或者传递列名给SQL都是比较常见的场景，当然Mybatis也对这样的场景进行了支持，这些是Hibernate难以做到的。

例如，在程序中传递变量 columns = " col1 , col2 , col3 ..." 给SQL，让其组装成为SQL语句。我们当然不想被Mybatis像处理普通参数一样把它设为" col1.col2,col3..."，那么我们就可以写成如下语句。

```
 select ${columns} from t tablename
```

这样Mybatis就不会帮我们转译 columns，而变为 **直出** ，而不是作为SQL的参数进行设置了。只是这样是对SQL而言是不安全的，Mybatis给了你灵活性的同时，也需要你自己去控制参数以保证SQL运转的正确性和安全性。

### sql元素

这个元素可以被用来定义可重用的 SQL 代码段，可以包含在其他语句中。它可以被静态地(在加载参数) 参数化. 不同的属性值通过包含的实例变化. 比如：
```
<sql id="userColumns"> ${alias}.id , ${alias}.username , ${alias}.password </sql>
```

这个 SQL 片段可以被包含在其他语句中，例如：
```
<select id="selectUsers" resultType="map">
  select
    <include refid="userColumns">
            <property name="alias" value="t1"/>
    </include>,
    <include refid="userColumns">
            <property name="alias" value="t2"/>
    </include>
  from some_table t1 cross join some_table t2
</select>
```

属性值也可以被用在 include 元素的 refid 属性里（

`<include refid="${include_target}"/>` )

或者 include 内部语句中（

`${prefix}Table` )

例如：
```
<sql id="sometable">
  ${prefix}Table
</sql>

<sql id="someinclude">
  from
    <include refid="${include_target}"/>
</sql>

<select id="select" resultType="map">
  select
    field1, field2, field3
  <include refid="someinclude">
    <property name="prefix" value="Some"/>
    <property name="include_target" value="sometable"/>
  </include>
</select>
```