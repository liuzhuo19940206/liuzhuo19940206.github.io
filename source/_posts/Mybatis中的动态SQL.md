---
title: Mybatis中的动态SQL
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-16 13:48:27
summary: Mybatis中的动态SQL
---

Mybatis的强大特性之一便是它的动态SQL。使用过JDBC或其他类似的框架的人都会知道，根据不同条件拼接SQL语句时不仅不能忘记必要的空格，还有注意省略掉列名列表最后的逗号，处理方式麻烦且凌乱。Mybatis的动态SQL则能帮我们摆脱这种痛苦。

在Mybatis 3 之前的版本中，使用动态SQL需要学习和了解非常多的标签，现在Mybatis采用功能强大的 OGNL 表达式语言消除了许多其他标签，以下是Mybatis的动态SQL在XML中支持的几种标签：

* if：判断语句，单条件分支判断

* choose(when、otherwise)：相当于java中的switch语句，多条件分支判断

* trim(where、set)：辅助元素，用于处理一些SQL拼装问题

* foreach：循环语句，在in语句等列举条件中常用

* bind：绑定元素，就像一个变量一样，提前定义，后面使用

---

### if用法

if元素是我们最常用的判断语句，相当于Java中的if语句，它常常与 `test` 属性联合使用。

if标签通常用于where语句中，通过判断参数值来决定是否使用某个查询条件，它也经常用于update语句中判断是否更新某一个字段，还可以在insert语句中用来判断是否插入某一个字段的值。

#### 在where条件中使用if

假设，现在我们要根据 学生id 和 学生的姓名 来查询学生的信息：
```
    <select id="selectByStu" resultType="student">
        select
        s.id,
        s.stu_name as 'stuName' ,
        s.stu_sex as 'stuSex',
        s.stu_id as 'stuId'
        from student as s
        where 
        s.id = #{id}
        and 
        s.stu_name like concat('%',#{stuName},'%')
    </select>
```

当同时输入 `id` 和 `stuName` 这两个条件时，能查出正确的结果，但是当只提供id参数时，stuName默认是null，就会导致stuName = null 也成为查询条件，因此查不到正确的结果。这时可以使用 if标签 来解决这个问题。

```
    <select id="selectByStu" resultType="student">
        select
        s.id,
        s.stu_name as 'stuName' ,
        s.stu_sex as 'stuSex',
        s.stu_id as 'stuId'
        from student as s
        where 
        1 = 1
        <if test="id != null">
        and s.id = #{id}
        </if>
        <if test="stuName != null and stuName != ''">
        and s.stu_name like concat('%',#{stuName},'%')
        </if>
    </select>
```

if标签有一个必填的属性：`test` ，test属性值是一个符合OGNL要求的表达式，表达式的结果可以是 true 或 false，除此之外所有的非0值都为 true，只有0为：false。为了方便理解，在表达式中，建议只有：true 或 false 作为结果。OGNL的详细用法，后面会提及到。

* 判断条件 `property != null 或 property == null`：适用于任何类型的字段，用于判断属性值是否为空。

* 判断条件 `property != '' 或 property == ''`：仅适合于String类型的字段，用于判断是否为空字符串。

* and 和 or：当有多个判断条件时，使用 and 或 or 进行连接，嵌套的判断可以使用小括号分组，and相当于java中的&&，or相当于||

---

上面的条件属性类型有的是String，对字符串的判断和Java中的判断类似，首先需要判断字段是否为 null，然后再去判断是否为空（在OGNL表达式中，这两个判断的顺序不会影响到结果，也不会有空指针异常）。

虽然上面可以完成需求，但是在XML中仍然需要注意两个地方：

* 注意SQL中where关键字后面的条件

`where 1=1`

由于两个条件都是动态的，所以如果没有 1=1 这个默认的条件，当两个if判断都不满足时，最后生成的SQL语句就会以 `where 结束`，这样不符合SQL语句规范，因此会报错。加上 1=1 这个条件，就可以避免SQL语句错误导致的异常。这种写法并不完美，后面我们会使用更好的方式来替代这个写法。

* 注意条件中的 and（or）

`and id =#{id}`

这里的 and（或 or）需要手动添加，当这部分条件拼接到 where 1=1 后面时任然是合法的SQL。因为有默认的 1 = 1 这个条件，我们不需要判断第一个动态条件是否需要加上 and（或 or），因为这种情况下 and（or）是必须有的。

---

#### 在update更新列中使用if

现在，需要实现这样一个功能：只更新有变化的字段，需要注意的是，更新的时候不能将原来有值但没有发生变化的字段更新为 空 或 null。

```
<update id="updateByIdSelective">
	update student
	set
		<if test="stuName !=null and stuName !=''">
		stu_name = #{stuName},
		</if>
		<if test="stuSex !=null">
		stu_sex = #{stuSex},
		</if>
		<if test="stuNumber != null and stuNumber != ''">
		stu_number = #{stuNumber},
		</if>
		id = #{id}
	where
	id = #{id}
</update>
```

需要注意的两个点：

第一个是：每个if元素里面的SQL语句后面都有逗号

第二个是：where关键字前面的 id = #{id} 这个条件。

---

* 当全部条件都是 null 或者 空。

如果有 id = #{id} 这个条件，最终的SQL语句：

`update student set id = #{id} where id = #{id}`

如果没有 id = #{id} 这个条件，最终的SQL语句：

`update student set where id = #{id}`

这个SQL很明显是错误的，set 关键字后面没有内容，直接是where关键字，不符合SQL语句规范。

* 查询条件只有一个不是null也不是空（假设是stu_name）

如果有 id =#{id}这个条件，最终的SQL语句：

`update student set stu_name =#{stuName}, id = #{id} where id = #{id}`

如果没有 id = #{id} 这个条件，最终的SQL语句：

`update student set stu_name =#{stuName}, where id = #{id}`

where关键字前面直接就是一个逗号，这个SQL语句也是错误的。

从上面两种情况来看，id = #{id} 这个条件可以最大限度保证方法不出错。除了使用这种方式外，还可以结合业务层的逻辑判断调整XML文件中的SQL来确保最终的SQL语句的正确性，也可以通过 where 和 set 标签来解决这个问题。

---

#### 在insert动态插入列中使用if

在数据库表中插入数据的时候，如果某一列的参数值不为空，就使用传入的值，如果传入参数为空，就使用数据库中的默认值（通常是空），而不使用传入的空值。使用if就可以实现这种动态插入列的功能。

```
<insert id ="insertStu" useGeneratedKeys="true" keyProperty="id">
	insert into student(
	<if test="stuName != null and stuName != ''">
	stu_name,
	</if>
	stu_sex,
	stu_number)
	values(
	<if test="stuName != null and stuName != ''">
	#{stuName},
	</if>
	#{stuSex},
	#{stuNumber})
</insert>
```

需要注意的是，若在列的部分增加了 if条件，则在values的部分也要增加相同的 if条件，必须保证上下可以互相对应，完全匹配。

---

### choose用法

上一节的 if标签 提供了基本的条件判断，但是它无法实现 if···else、if···else···的逻辑，要想实现这样的逻辑，就需要用到 choose when otherwise 标签。choose标签：包含 when 和 otherwise 两个标签，一个 choose中至少有一个when，有0个或者1个otherwise。在已知的student表中，除了主键id外，我们认为stu_name（学生名）也是唯一的，所有的用户名都不可以重复。

现在，进行如下查询：当参数 id 有值的时候，优先使用 id查询，当id没有值时就去判断用户名是否有值，如果有值就用用户名查询，如果用户名也没有值，就使用SQL查询无结果。

```
<select id="selectByStu" resultType="student">
	select
	s.id,
	s.stu_name as 'stuName' ,
	s.stu_sex as 'stuSex',
	s.stu_id as 'stuId'
	from student as s
	where 1 = 1
	<choose>
	  <when test="id != null">
	     and s.id = #{id}
	  </when>
	  <when test="stuName != null and stuName != ''">
	     and s.stu_name like concat('%',#{stuName},'%')
	  </when>
	  <otherwise>
	     and 1 = 2
	  </otherwise>
	</choose>
</select>
```

使用choose when otherwise 的时候逻辑要严密，避免由于某些值出现问题导致SQL出错。

<font color="red">
提示：上述查询中，如果没有 otherwise的话，所有用户都会查询出来，因为我们在对应的接口方法中使用了Student作为返回值，所以当实际查询结果是多个就会报错。
</font>

---

### trim、where、set用法

这个三个标签解决类似的问题，并且where 和 set 都属于 trim的一种具体用法。

#### where用法

where标签的作用：如果该标签包含的元素中有返回值，就插入一个where；如果where后面的字符串是以 and 和 or 开头的，就将它们剔除。

```
    <select id="selectByStu" resultType="student">
        select
        s.id,
        s.stu_name as 'stuName' ,
        s.stu_sex as 'stuSex',
        s.stu_id as 'stuId'
        from student as s
        <where> 
           <if test="id != null">
              and s.id = #{id}
           </if>
           <if test="stuName != null and stuName != ''">
              and s.stu_name like concat('%',#{stuName},'%')
           </if>
        </where>
    </select>
```

看到，我去掉了 1 = 1 这个条件，当 if条件都不满足的时候，where元素中没有内容，所以在SQL中不会出现 where；也就不存在 之前在 if动态用法中的问题。

如果 if条件满足，where元素的内容就是以：and 开头的条件，where会自动去掉开头的 and，这也保证了where条件正确。

#### set用法

set标签的作用：如果该标签包含的元素中有返回值，就插入一个set；如果set后面的字符串是以逗号结尾的，就将这个逗号剔除。

```
<update id="updateByIdSelective">
	update student
	<set>
		<if test="stuName !=null and stuName !=''">
		stu_name = #{stuName},
		</if>
		<if test="stuSex !=null">
		stu_sex = #{stuSex},
		</if>
		<if test="stuNumber != null and stuNumber != ''">
		stu_number = #{stuNumber},
		</if>
		id = #{id},
	</set>
	where
	id = #{id}
</update>
```

在set标签的用法中，SQL后面的逗号没有问题了，但是如果set元素中没有内容，照样会出现SQL错误，所以为了避免错误产生，类似 id = #{id} 这样必然存在的赋值仍然有保留的必要。从这个点看，set标签并没有解决全部的问题，使用时仍然需要注意。

---

#### trim用法

where 和 set 标签的功能都可以使用 trim 标签来实现，并且在底层就是通过 `TrimSqlNode`实现的。

where标签对应的 trim的实现如下：

```
<trim prefix="WHERE" prefixOverrides="AND |OR ">
···
</trim>
```

<font color="red">
提示：这里的AND 和 OR后面的空格不能省略，为了避免匹配到 andes、orders等单词。

实际上prefixOverrides 包含 "AND"、"OR"、"AND\n"、"OR\n"、"AND\r"、"OR\r"、"AND\t"、"OR\t"，不仅仅是上面提到的两个带空格的前缀。
</font>

---

set标签对应的trim实现如下：

```
<trim prefix="SET" suffixOverrides=",">
···
</trim>
```
---

trim标签有如下属性：

* prefix：当trim元素内包含内容时，会给内容增加prefix指定的前缀。

* prefixOverrs：当trim元素内包含内容时，会把内容中匹配的前缀字符串去掉。

* suffix：当trim元素内包含内容时，会给内容增加suffix指定的后缀。

* suffixOverrs：当trim元素内包含内容时，会把内容中匹配的后缀字符串去掉。

---

### foreach用法

SQL语句中有时会使用 `IN` 关键字，例如 id in（1,2,3）。可以使用 `${ids}` 方式直接获取值，但这种写法不能防止SQL注入，想避免SQL注入就需要要 `#{}`的方式，这时就要配合使用 `foreach` 标签来满足需求。

foreach 可以对数组、Map或实现了 Iterable接口（如 List、Set）的对象进行遍历。数组在处理时会转换为List对象，因此foreach遍历的对象可以分为两大类：`Iterable类型` 和 `Map类型`。

---

#### foreach实现 in 集合

foreach实现 in 集合（或数组）是最简单和最常用的一种情况，下面介绍如何根据传入的学生id集合查询出所有的学生。

```
List<Student> selectByIdList(List<Long> idList);
```

```
<select id="selectByStu" resultType="student">
    select
    s.id,
    s.stu_name as 'stuName' ,
    s.stu_sex as 'stuSex',
    s.stu_id as 'stuId'
    from student as s
    where 
    id in
    <foreach collection="list" open="(" close=")" separator="," item="id" index="i">
	#{id}
    </foreach>
</select>
```
foreach 包含以下属性：

* collection：必填，值为要迭代循环的属性名，这个属性值的情况很多。

* item：变量名，值为从迭代对象中取出的每一个值。

* index：索引的属性名，在集合数组情况下，值为当前索引的值，当迭代循环对象是Map类型时，这个值为Map的 Key（键值）。

* open：整个循环内容开头的字符串

* close：整个循环内容结尾的字符串

* separator：每次循环的分隔符

---

collection的属性要如何设置呢？来看一下Mybatis是如何处理这种类型的参数的。

（1）只有一个数组参数或集合参数

以下代码是 DefaultSqlSession中的方法，也是默认情况下的处理逻辑：
```
  private Object wrapCollection(final Object object) {
    if (object instanceof Collection) {
      StrictMap<Object> map = new StrictMap<Object>();
      map.put("collection", object);
      if (object instanceof List) {
        map.put("list", object);
      }
      return map;
    } else if (object != null && object.getClass().isArray()) {
      StrictMap<Object> map = new StrictMap<Object>();
      map.put("array", object);
      return map;
    }
    return object;
  }
```

当参数类型为集合的时候，默认会转换为Map类型，并添加一个key为 "collection" 的值，如果参数类型是List集合，那么会继续添加一个key为 "list"的值，这样，当collection = "list" 时，就能得到这个集合，并对它进行循环操作。

当参数类型为数组的时候，也会转换为Map类型，默认的key为 "array"。当采用如下方法使用数组时，就需要把foreach标签中的collection属性值设置为：array。
```
List<Student> selectByIdList(Long[] idArray);
```

（2）有多个参数

之前的博客讲过，当有多个参数的时候，要使用`@param注解`给每个参数指定一个名字，否则在SQL中使用参数时就会不方便，因此将collection设置为`@param注解`指定的名字即可。

（3）参数是Map类型

使用Map和使用@param注解方式类似，将collection指定为对应的Map中的key即可。如果要循环所传入的Map，推荐使用@param注解指定名字，此时可将collection设置为指定的名字，如果不想指定名字，就使用默认值`_parameter`。

（4）参数是一个对象

这个情况下指定为对象的属性名即可。当使用对象内多层嵌套的对象时，使用 `属性.属性（集合和数组可以使用下标）`的方式可以指定深层的属性值。

---

#### foreach实现批量插入

如果数据库支持批量插入，就可以通过foreach来实现。批量插入是SQL-92新增的特性，目前支持的数据库有DB2、SQL Server2008及以上版本、PostgreSQL8.2及以上版本、MySQL、SQLite3.7.11及以上版本、H2。批量插入的语法如下：
```
INSERT INTO tablename (column-a,[column-b,···])
VALUES ('value-1a',['value-1b',···]),
       ('value-2a',['value-2b',···]),
       ···
```

从待处理部分可以看出，后面是一个值的循环，因此可以通过foreach实现循环插入。

```

int insertList(List<Student> userList);


<insert id ="insertList">
	insert into student(
	   stu_name,stu_sex,stu_number)
	values
	<foreach collection="list" item="stu" separator=",">
	  (
	    #{stu.stuName},#{stu.stuSex},#{stu.stuNumber}
	  )
	</foreach>
</insert>
```

<font color="red">
注意：通过item指定了循环变量名后，在引用值的时候使用的是 "属性.属性" 的方式，如：stu.stuName。
</font>

从Mybatis 3.3.1版本开始，Mybatis开始支持批量新增回写主键值的功能，这个功能首先要求数据库主键值为自增类型，同时还要求该数据库提供的JDBC驱动可以支持返回批量插入的主键值（JDBC提供了接口，但并不是所有数据库都完美实现了该接口），因此到目前为止，<font color="red">**可以完美支持该功能的仅有MySQL数据库。**</font>

如果要在MySQL中实现批量插入返回自增主键值，只需要在原来代码基础上进行如下修改：
```
<insert id ="insertList" useGeneratedKeys="true" keyProperty="id">
```

和单表一样，此处增加了 useGeneratedKeys 和 keyProperty 两个属性。

---

#### foreach实现动态update

```
<update id="updateByMap">
	update student
	  set
	  <foreach collection="_parameter" index="key" item="val" separator=",">
		${key} = #{val}
	  </foreach>
	  where id = #{id}
</update>
```

这里的Key作为列名，对应的值作为该列的值，通过foreach将需要更新的字段拼接在SQL语句中。

```

int updateByMap(Map<String,Object> map);

```

这里没有通过@param注解指定参数名，因而Mybatis在内部的上下文中使用了默认 `_parameter`作为该参数的key，所以在XML中也使用了`_parameter`。

---

### bind用法

bind元素的作用是通过OGNL表达式去自定义一个上下文变量，这样更方便我们使用。在我们进行模糊查询的时候，如果是MySQL数据库，我们常常用到的是一个concat用"%" 和 参数相连接。然而在Oracle数据库则是用连接符合 "||"，这样SQL就需要提供两种形式去实现了。但是有了bind元素，我们就完全不必使用数据库的语言，只要使用Mybatis的语言即可与所需参数相连。

比如我们要按角色名称进行模糊查询，我们可以把映射文件写成如下：
```
<select id="findStudent" resultTpe="student">
    <bind name="pattern" value="'%' + stuName + '%'" />
    select id , stu_name, stu_sex, stu_number
    from student
    where id =#{id} and stu_name like #{pattern}
</select>
```

这里的 `stuName` 代表的就是传递进来的参数，它和通配符连接后，赋给了pattern，我们就可以在select语句中使用这个变量进行模糊查询了，不管是MySQL数据库还是Oracle数据库都可以使用这样的语句，提高了其可移植性。

---

我们传递的参数往往不止一个，我们可以传递多个参数。

```
public List<Student> findStu(@Param("stuName") String stuName,@Param("note") String note);


<select id="findStudent" resultTpe="student">
    <bind name="stuNameLike" value="'%' + stuName + '%'" />
    <bind name="noteLike" value="'%' + note + '%'" />
    select id , stu_name, stu_sex, stu_number,note
    from student
    where id =#{id} and stu_name like #{stuNameLike} and note like #{noteLike}
</select>
```

### OGNL用法

在Mybatis的动态SQL和 ${} 形式的参数中都用到了OGNL表达式，所以我们有必要了解一下OGNL的简单用法。

（1）e1 `or` e2

（2）e1 `and` e2

（3）e1 `==` e2 或 e1 `eq` e2

（4）e1 `!=` e2 或 e1 `neq` e2

（5）e1 `lt` e2：小于

（6）e1 `lte` e2：小于等于，其他表示为：`gt`（大于）、`gte`（大于等于）

（7）e1 + e2、e1 * e2、e1/e2、e1-e2、e1%e2

（8）!e 或 not e：非，取反

（9）e.method(args)：调用方法

（10）e.property：对象属性值

（11）e1[e2]：按索引取值（List、数组和Map）

（12）@class@method(args)：调用类的静态方法

（13）@class@field：调用类的静态字段值

---

Mybatis使用XML时，不可避免会使用到一些对XML来说是特殊的字符，比如：<：小于号，当你使用时，在XML中它也标签的符合，所以为了区别，该怎么解决呢？

方法一：

使用转义字符
```
<：&lt;

>: &gt;

&：&amp;

'(单引号）：&apos;

"(双引号)：&quot;
```
---

方法二：

使用 CDATA 部件
```
   <![CDATA[···]]>

其中的：···部分，使用特殊符号时，不起作用。
```