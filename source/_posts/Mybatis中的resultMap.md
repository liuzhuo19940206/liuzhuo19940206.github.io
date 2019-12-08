---
title: Mybatis中的resultMap
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-13 09:29:18
summary: Mybatis中的resultMap
---

resultMap是Mybatis里面最为复杂的元素，所以单独来讲解。

resultMap 元素是 MyBatis 中最重要最强大的元素。它可以让你从 90% 的 JDBC ResultSets 数据提取代码中解放出来, 并在一些情形下允许你做一些 JDBC 不支持的事情。 实际上，在对复杂语句进行联合映射的时候，它很可能可以代替数千行的同等功能的代码。 ResultMap 的设计思想是，简单的语句不需要明确的结果映射，而复杂一点的语句只需要描述它们的关系就行了。

---

### resultMap元素构成

resultMap元素里面还有以下的元素：
```
<resultMap>

	<constructor>
	<idArg/>
	<arg/>
	</constructor>

	<id/>
	<result/>

	<association/>
	<collection/>
	<discriminator>
		<case/>
	</discriminator>

</resultMap>
```
resultMap元素的属性：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313100156.png"/>


下一部分将详细说明每个元素。

---

 constructor

其中 constructor 元素用于配置构造方法。

**`一个POJO可能不存在没有参数的构造方法，这个时候我们就需要使用 constructor 进行配置。`**

假设角色类RoleBean不存在没有参数的构成方法，它的构造方法声明为 `public RoleBean(Integer id,String roleName)`

那么，我们需要配置如下的 resultMap：
```
<resultMap>
	<constructor>
		<idArg column = "id" javaType="int"/>
		<arg column="role_name" javaType="string"/>
	</constructor>
</resultMap>
```

这样Mybatis就知道需要使用这个构造方法来构造POJO了。

`idArg`: 表示哪个列是主键，`arg`：表示普通列表元素。

---

#### id和result

`id`元素是表示哪个列是主键，允许有多个主键，多个主键则称为联合主键。

`result`元素是配置其他的SQL列名到POJO的映射关系。

两者的一些属性：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313095715.png"/>

---

此外的 `<association/>、<collection/>、<discriminator>` 这些元素，我们在级联那里详细介绍。

---

### 使用map存储结果集

一般而言，任何的select语句都可以使用map存储，如下：
```
<select id="findColorByNote" parameterType="string" reslutMap="map">
     select id ,color,note from t_color where note like concat('%',#{note},'%')
</select>
```

使用map原则上是可以匹配所有结果集的，但是使用map接口就意味着可读性下降，所以这不是一种推荐的方式。更多的时候我们使用的是POJO的方式。

---

### 使用POJO存储结果集

POJO是我们常用的方式，也是我们推荐的方式。

一方面我们可以使用自动映射，正如 select 语句里论述的一样。

另一方面，我们还可以使用 select 语句的属性 resultMap配置映射集合，只是使用前需要配置类似的resultMap。

```
<resultMap id="roleResultMap" type="role">
	<id property="id" column="id"/>
	<result property="roleName" column="role_name"/>
</resultMap>
```

resultMap元素的属性 id 代表这个 resultMap的标识，type代表着你需要映射的POJO（可以使用定义好的别名）。

映射关系中，id 元素：表示这个对象的主键，property代表着POJO的属性名称，column表示数据库SQL的列名，于是POJO就和数据库SQL的结果一一对应起来了。

接着在 select元素 里面使用即可：
```
<select id="getRole" parameterType="long" reslutMap="roleResultMap">
     select id , role_name , note from t_role where id = #{id}
</select>
```

我们可以发现`SQL语句的列名` 和 `roleResultMap的column` 是一一对应的。

使用XML配置的结果集，还可以配置 typeHandler、javaType、jdbcType。

<font color="red">但是这条语句配置了resultMap，就不要配置resultType。</font>