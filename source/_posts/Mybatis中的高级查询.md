---
title: Mybatis中的高级查询
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-13 10:53:31
summary: Mybatis中的高级查询
---

通过前面几篇博客的学习，我们已经了解了 MyBatis 中最常用的部分。基本的增、删、改、查操作己经可以满足我们大部分的需求，今天将会对除上述内容之外的知识点进行详细介绍。

本篇博客主要包含的内容为MyBatis的高级结果映射，主要处理数据库一对一、一对多的查询，另外就是在 MyBtis 中使用存储过程的方法，处理存储过程的入参和出参方法。

---

### 高级映射

在关系型数据库中，我们经常要处理 一对一、一对多 的关系 例如， 一辆汽车需要有引擎，这是一对一的关系。 一辆汽车有4个或更多个轮子，这是一对多的关系。

在Mybatis中使用3种方式来操作级联：

* association，代表一对一的关系，比如中国公民和身份证是一对一的关系。

* collection，代表一对多的关系，比如班级和学生是一对多的关系，一个班级有多个学生。

* discriminator，是鉴别器，它可以根据实际情况，选择采用哪个类作为实例，允许你根据特定的条件去关联不同的结果集。

---
为了方便讲解，我们来创建一系列的数据库表，它们的模型关系，如下所示：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313130557.png"/>

学生表为核心，学生表与学生证表是一对一的关系；学生表与课程成绩表是一对多的关系，一个学生有多门课；课程表与课程成绩表也是一对多的关系。

学生有男生与女生，所以健康项目不一样，这里我就列举了一个不同点，简化一下。根据学生的性别不同来决定使用哪个表，而鉴别性别就需要使用鉴别器了。

---

这里，大家可能会想到，数据库中不是还有多对多的关系嘛？为啥这里没有体现呢？

这是因为在实际中，多对多的关系应用不多，因为它比较复杂，会增加理解和关联的复杂性，推荐的方法是，使用一对多的关系把它分解为双向关系，以降低关系的复杂度，简化程序。

---

根据上述的数据库表的描述，生成相应的表，然后创建新的maven工程。

（1）生成Mybatis数据库：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313131616.png"/>

（2）创建相关的表：
```

use mybatis;

drop table if exists student;

drop table if exists student_selfcard;

drop table if exists lecture;

drop table if exists student_lecture;

drop table if exists student_female_health;

drop table if exists student_male_health;

create table student(

 id  INT(20) not null auto_increment COMMENT '学生编号',
 stu_name VARCHAR(60) not null comment '学生姓名',
 stu_sex TINYINT(4) not null comment '性别',
 stu_id int(20) not NULL COMMENT '学生证号',
 PRIMARY key(id)
);

create table student_selfcard(

 id INT(20) not null auto_increment COMMENT '编号',
 stu_number int(20) not null COMMENT '学生证号',
 stu_birthplace VARCHAR(60) COMMENT '籍贯',
 stu_start_time date COMMENT '发证日期',
 stu_end_time date COMMENT '结束日期',
 primary key(id)
);

create table lecture(

 id int(20) not null comment '编号',
 lecture_name varchar(60) not null comment '课程名称',
 primary key(id)
);

create table student_lecture(

 id int(20) not null auto_increment comment '编号',
 stu_id int(20) not null comment '学生编号',
 lecture_id int(20) not null comment '课程编号',
 grade DECIMAL(16,2) not null comment '课程成绩',
 primary key(id)
);

create table student_female_health(
 id int(20) not null auto_increment comment '编号',
 stu_id int(20) not null comment '学生编号',
 check_date date not null comment '检查日期',
 heart varchar(60) not null comment '心',
 uterus varchar(60) not null comment '子宫',
 primary key(id)
);

create table student_male_health(
 id int(20) not null auto_increment comment '编号',
 stu_id int(20) not null comment '学生编号',
 check_date date not null comment '检查日期',
 heart varchar(60) not null comment '心',
 prostate varchar(60) not null comment '前列腺',
 primary key(id)
);

```
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313135537.png"/>

(3) 创建新的maven工程

项目的整体结构：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313145410.png"/>

entities：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313145502.png"/>

mappers：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313145550.png"/>

typeHanler：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313145813.png"/>

pom.xml:
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

</project>
```

jdbc.properties：
```
jdbc.driver=com.mysql.cj.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/mybatis?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=GMT%2B8
jdbc.username=root
jdbc.password=123456
```

log4j.properties:
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

mybatis-config.xml:
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <properties resource="jdbc.properties">
    </properties>
    <settings>
        <setting name="logImpl" value="LOG4J"/>
    </settings>
    <!--别名-->
    <typeAliases>
        <package name="com.liuzhuo.entities"/>
    </typeAliases>
    <typeHandlers>
        <typeHandler handler="com.liuzhuo.typehandler.SexEnumTypeHandler" javaType="com.liuzhuo.enums.Sex"/>
    </typeHandlers>
    <!--定义数据库信息，默认使用development数据库构建环境-->
    <environments default="development">
        <environment id="development">
            <!--采用JDBC事务管理-->
            <transactionManager type="JDBC">
            </transactionManager>
            <!--配置数据源的信息-->
            <dataSource type="POOLED">
                <property name="driver" value="${jdbc.driver}"/>
                <property name="url" value="${jdbc.url}"/>
                <property name="username" value="${jdbc.username}"/>
                <property name="password" value="${jdbc.password}"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <package name="com.liuzhuo.mapper"/>
    </mappers>
</configuration>
```
entities中的POJO，我就不列出来了，大家自行解决。

Sex:
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
SexEnumTypeHandler:
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

StudentMapper.xml:
```
<mapper namespace="com.liuzhuo.mapper.StudentMapper">

    <resultMap id="studentMap" type="student">
        <id column="id" property="id"/>
        <result column="stu_name" property="stuName"/>
        <result column="stu_id" property="stuId"/>
        <!--新添加的字段-->
        <result column="stu_sex" property="stuSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>
    </resultMap>

    <select id="findStudentById" resultMap="studentMap">
         select * from student where id = #{id}
     </select>
</mapper>
```

test:
```
public class MainTest {

    private static SqlSessionFactory sqlSessionFactory;

    @BeforeClass
    public static void init() {
        try {
            String mybatisConfig = "mybatis-config.xml";
            InputStream inputStream = Resources.getResourceAsStream(mybatisConfig);
            sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
            inputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testSelectStudent() {
        SqlSession sqlSession = sqlSessionFactory.openSession();
            StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
            Student student = studentMapper.findStudentById(1L);
            System.out.println(student);
            try {
        } finally {
            //不要忘记关闭SqlSession
            sqlSession.close();
        }
    }
}
```
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313150007.png"/>

---

运行测试：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313150123.png"/>

**数据库中的数据，自己随意添加呀，没有要求的。**

以上就是我们的新的项目工程，现在已经能够运行了，下面，我们开始讲解Mybatis中的高级映射功能。

### 一对一映射

一个学生对应一个学生证，属于一对一映射。

#### 使用自动映射处理一对一映射

添加新的POJO对象：StudentAndSelfcard类：
```
public class StudentAndSelfcard extends Student {

    private StudentSelfcard studentSelfcard;

    public StudentSelfcard getStudentSelfcard() {
        return studentSelfcard;
    }
    public void setStudentSelfcard(StudentSelfcard studentSelfcard) {
        this.studentSelfcard = studentSelfcard;
    }

    @Override
    public String toString() {
        return super.toString() +
                " + StudentAndSelfcard{ " +
                "studentSelfcard=" + studentSelfcard +
                '}';
    }
}

```

该类就是一个Student类中添加一个StudentSelfcard属性。

修改：StudentMapper.xml

添加一个新的`selectStudentAndSelfcardById` select 标签：
```
    <select id="selectStudentAndSelfcardById" resultType="studentAndSelfcard">
        select
        s.id,
        s.stu_name as 'stuName' ,
        s.stu_sex as 'stuSex',
        s.stu_id as 'stuId' ,
        ss.id as 'studentSelfcard.id',
        ss.stu_number as 'studentSelfcard.stuNumber',
        ss.stu_birthplace as 'studentSelfcard.stuBirthplace',
        ss.stu_start_time as 'studentSelfcard.stuStartTime',
        ss.stu_end_time as 'studentSelfcard.stuEndTime'
        from student as s
        JOIN student_selfcard as ss on s.stu_id = ss.stu_number
        where s.id = #{id}
    </select>
```

注意上面，因为使用的是Mybatis的自动映射，所以，从student_selfcard表中获取的数据，在使用别名时，都加上了`studentSelfcard`前缀，通过这种方式将student_selfcard表中的数据映射到StudentAndSelfcard类中的studentSelfcard属性中。

---

在StudentMapper中添加新的方法：`selectStudentAndSelfcardById`
```
public interface StudentMapper {

    public Student findStudentById(Long id);

    public StudentAndSelfcard selectStudentAndSelfcardById(Long id);
}

```

---

在MainTest中添加新的测试方法：
```
    @Test
    public void testSelectStudentAndSelfcardById() {

        SqlSession sqlSession = sqlSessionFactory.openSession();
        try {
            StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
            StudentAndSelfcard studentAndSelfcard = studentMapper.selectStudentAndSelfcardById(1L);

            //student不为空
            Assert.assertNotNull(studentAndSelfcard);
            //studentSelfcard不为空
            Assert.assertNotNull(studentAndSelfcard.getStudentSelfcard());

            System.out.println(studentAndSelfcard);
        } finally {
            sqlSession.close();
        }
    }
```
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313154824.png"/>

可以看到映射成功，通过 SQL 日志可以看到已经查询出的一条数据， Mybatis 将这条数据映射到了两个类中。

像这样通过一次查询，将结果映射到不同对象的方式，称之为：**<font color="red">关联的嵌套结果映射。</font>**

关联 嵌套结果 映射 ，需要关联多张表，将所有需要的值一次性查询出来。这种方式的好处是减少数据库查询次数 ，减轻数据库的压力， 缺点是要写很复杂的 SQL，并且当嵌套结果更复杂时， 不容易一次写正确 ，由于要在应用服务器上将结果映射到不同的类上。 因此 ，会增加应用服务器的压力。当一定要使用 嵌套结果 并且整个复杂的 SQL 执行速度很快时 ，建议使用关联的嵌套结果映射。

---

#### resultMap处理一对一映射

除了使用Mybatis的自动映射来处理一对一嵌套外，还可以在XML映射文件中配置结果映射。

使用resultMap来实现与上一节相同的效果。

在 `StudentMapper.xml` 文件中：

添加新的resultMap：
```
    <resultMap id="studentSelfcardMap" type="studentAndSelfcard">

        <!--student的映射-->
        <id column="id" property="id"/>
        <result column="stu_name" property="stuName"/>
        <result column="stu_id" property="stuId"/>
        <result column="stu_sex" property="stuSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>

        <!--studentselfcard的映射-->
        <result column="studentSelfcard_id" property="studentSelfcard.id"/>
        <result column="studentSelfcard_stu_number" property="studentSelfcard.stuNumber"/>
        <result column="studentSelfcard_stu_birthplace" property="studentSelfcard.stuBirthplace"/>
        <result column="studentSelfcard_stu_start_time" property="studentSelfcard.stuStartTime"/>
        <result column="studentSelfcard_stu_end_time" property="studentSelfcard.stuEndTime"/>

    </resultMap>
```
在映射studentSelfcard表时，列名我都加上了 `studentSelfcard_` 的前缀了，为了防止与student中有相同的列名。

添加新的select：
```
    <select id="selectStudentAndSelfcardById02" resultMap="studentSelfcardMap">
        select
        s.id,
        s.stu_name,
        s.stu_sex,
        s.stu_id,
        ss.id as 'studentSelfcard_id',
        ss.stu_number as 'studentSelfcard_stu_number',
        ss.stu_birthplace as 'studentSelfcard_stu_birthplace',
        ss.stu_start_time as 'studentSelfcard_stu_start_time',
        ss.stu_end_time as 'studentSelfcard_stu_end_time'
        from student as s
        JOIN student_selfcard as ss on s.stu_id = ss.stu_number
        where s.id = #{id}
    </select>
```

看到，查询student时，我们都没有使用别名，因为此时，我们在resultMap中配置了，此时查询出来的列名要与resultMap中的`column`同名才行。

所以，查询student_selfcard表时，我们都使用了`studentSelfcard_`前缀的别名，来与resultMap中的`column`同名。

<font color="red">此时，是不是已经看出了与自动映射的区别了，在自动映射中，列名的别名是对应着POJO的属性名，而使用resultMap的话，select中查询出来的列名的别名，要与resultMap中的column的属性值一模一样！！！</font>

**此时在select标签中，使用的是resultMap元素，而不是resultType元素了。select标签中的resultMap元素等于resultMap标签中的id元素值。**

---

在StudentMapper接口中添加:`selectStudentAndSelfcardById02`
```
public interface StudentMapper {

    public Student findStudentById(Long id);

    public StudentAndSelfcard selectStudentAndSelfcardById(Long id);

    public StudentAndSelfcard selectStudentAndSelfcardById02(Long id);
}

```

---

在MainTest中添加新的测试方法：
```
    @Test
    public void testSelectStudentAndSelfcardById02() {

        SqlSession sqlSession = sqlSessionFactory.openSession();
        try {
            StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
            StudentAndSelfcard studentAndSelfcard = studentMapper.selectStudentAndSelfcardById02(1L);

            //student不为空
            Assert.assertNotNull(studentAndSelfcard);
            //studentSelfcard不为空
            Assert.assertNotNull(studentAndSelfcard.getStudentSelfcard());

            System.out.println(studentAndSelfcard);
        } finally {
            sqlSession.close();
        }
    }
```

运行结果：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313162728.png"/>

结果和使用自动映射的效果一模一样，但是，大家肯定会觉得这样岂不是更加麻烦了，还多写了一个resultMap标签来映射，不仅没有方便开发，还增加了工作量。

下面就使用resultMap的继承功能：

##### resultMap的继承功能

在我们的 xxxMapper.xml中都会有一个基本的xxxtMap的resultMap映射，这个映射可以使用 **`MyBatis的代码生成器生成`**，所以可以省略手动工作。

关于MyBatis的代码生成器生成，后面我会讲到，大家不要急，现在只需要知道就行。

---

在我们的 StudentMapper.xml 中的基类resultMap为：
```
    <resultMap id="studentMap" type="student">
        <id column="id" property="id"/>
        <result column="stu_name" property="stuName"/>
        <result column="stu_id" property="stuId"/>
        <result column="stu_sex" property="stuSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>
    </resultMap>
```

只映射了student的属性。

添加新的resultMap标签：（studentSelfcardMap02）
```
    <resultMap id="studentMap" type="student">
        <id column="id" property="id"/>
        <result column="stu_name" property="stuName"/>
        <result column="stu_id" property="stuId"/>
        <result column="stu_sex" property="stuSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>
    </resultMap>

    <resultMap id="studentSelfcardMap02" type="studentAndSelfcard" extends="studentMap">
        <!--studentselfcard的映射-->
        <result column="studentSelfcard_id" property="studentSelfcard.id"/>
        <result column="studentSelfcard_stu_number" property="studentSelfcard.stuNumber"/>
        <result column="studentSelfcard_stu_birthplace" property="studentSelfcard.stuBirthplace"/>
        <result column="studentSelfcard_stu_start_time" property="studentSelfcard.stuStartTime"/>
        <result column="studentSelfcard_stu_end_time" property="studentSelfcard.stuEndTime"/>
    </resultMap>
```

可以看到新的`studentSelfcardMap02` 中使用 `extends`关键字继承了 `studentMap`。

此时只需要书写：studentSelfcard的相关属性即可，简化了我们的书写。

而且如果要修改：student表的话，我们只需要修改：studentMap一次即可，不需要修改多个resultMap。


将 `select id=selectStudentAndSelfcardById02`的 **`resultMap`** 改为：`selectStudentAndSelfcardById02`,然后运行`testSelectStudentAndSelfcardById02`

发现运行还是成功的。

---

#### 使用resultMap的association

添加新的resultMap标签：
```
    <resultMap id="studentSelfcardMap03" type="studentAndSelfcard" extends="studentMap">
        <!--studentselfcard的映射-->
        <association property="studentSelfcard" columnPrefix="studentSelfcard_" javaType="studentSelfcard">
            <result property="id" column="id"/>
            <result property="stuNumber" column="stu_number"/>
            <result property="stuBirthplace" column="stu_stu_birthplace"/>
            <result property="stuStartTime" column="stu_start_time"/>
            <result property="stuEndTime" column="stu_end_time"/>
        </association>
    </resultMap>
```

association标签包含以下属性：

* property：对应POJO中的属性名，必须填

* javaType：属性对应的Java类型（可以使用别名）

* resultMap：可以直接使用现有的resultMap，然后就不要在这里配置了。

* columnPrefix：查询列的前缀，在子标签配置result的column时可以省略前缀。

还有其他的属性，此处不做过多的介绍了。

然后运行，结果会是一样的，这里就不演示了。

---

使用association配置时，还可以使用resultMap配置一个已经存在的resultMap映射，一般情况下，如果使用了Mybatis代码生成器，都会生成每个表对应实体的resultMap配置，也可以手动写一个resultMap。
```
    <resultMap id="studentSelfcardBaseMap" type="studentSelfcard">
        <id column="id" property="id"/>
        <result column="stu_number" property="stuNumber"/>
        <result column="stu_birthplace" property="stuBirthplace"/>
        <result column="stu_start_time" property="stuStartTime"/>
        <result column="stu_end_time" property="stuEndTime"/>
    </resultMap>
```

添加新的resultMap：
```
    <resultMap id="studentSelfcardMap04" type="studentAndSelfcard" extends="studentMap">
       
        <association property="studentSelfcard" columnPrefix="studentSelfcard_"  resultMap="studentSelfcardBaseMap"/>

    </resultMap>
```

此时，就很简单了，看起来很清爽了。

需要注意的是，`studentSelfcardBaseMap`：现在是写在：`StudentMapper.xml`中的，但是实际开发中，`studentSelfcardBaseMap`应该在`StudentSelfcardMapper.xml`文件中，此时，`studentSelfcardMap04`就不能简单的直接使用: `resultMap=studentSelfcardBaseMap`了，必须要加上 namespace命名空间。

如下：
```
    <resultMap id="studentSelfcardMap04" type="studentAndSelfcard" extends="studentMap">
       
        <association property="studentSelfcard" columnPrefix="studentSelfcard_"  resultMap="com.liuzhuo.mapper.StudentSelfcardMapper.studentSelfcardBaseMap"/>

    </resultMap>
```

---

#### association标签的嵌套查询

除了前面3种通过复杂的SQL查询获取结果外，还可以利用简单的SQL通过多次查询转换为我们需要的结果，这种方式与根据业务逻辑手动执行多次SQL的方式相像，最后将结果组合成一个对象。

association标签的嵌套查询常用的属性：

* select：另一个映射查询的id，Mybatis会额外执行这个查询获取嵌套对象的结果。

* column：列名（或别名），将主查询中列的结果作为嵌套查询的参数，配置方式如：`column={prop1=col1,prop2=col2}`,其中prop1和prop2将作为嵌套查询的参数，就像#{prop1}一样，col1和col2就是主查询出来的列名。

* fetchType：数据加载方式，可选值为：`lazy` 和 `eager`，分别为延迟加载和积极加载，这个配置会覆盖全局的lazyLoadingEnabled配置。

---

使用嵌套查询的方式配置一个和前面功能一样的方法，首先在 `StudentMapper.xml` 中：
```
    <resultMap id="studentSelfcardMap05" type="studentAndSelfcard" extends="studentMap">
        <association property="studentSelfcard" column="stuNumber=stu_id"
                     select="com.liuzhuo.mapper.StudentSelfcardMapper.selectStudentSelfcardBystuNumber">
        </association>
    </resultMap>
```

然后创建一个select标签：
```
    <select id="selectStudentAndSelfcardById03" resultMap="studentSelfcardMap05">
        select
        s.id,
        s.stu_name,
        s.stu_sex,
        s.stu_id,
        from student as s
        where s.id = #{id}
    </select>
```
注意关联中已经没有了 `studentSelfcard`了 ，因为我们不再是通过一个SQL语句来获取全部的信息了，学生证表的信息是通过配置的`select="com.liuzhuo.mapper.StudentSelfcardMapper.selectStudentSelfcardBystuNumber"` 来查询的，这个方法写在 `StudentSelfcardMapper.xml`中。

<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313173138.png"/>

```
<mapper namespace="com.liuzhuo.mapper.StudentSelfcardMapper">

    <resultMap id="studentSelfcard" type="studentSelfcard">
        <id column="id" property="id"/>
        <result column="stu_number" property="stuNumber"/>
        <result column="stu_birthplace" property="stuBirthplace"/>
        <result column="stu_start_time" property="stuStartTime"/>
        <result column="stu_end_time" property="stuEndTime"/>
    </resultMap>

   <select id="selectStudentSelfcardBystuNumber" resultMap="studentSelfcard">
        select
        ss.id,
        ss.stu_number as 'stuNumber',
        ss.stu_birthplace as 'stuBirthplace',
        ss.stu_start_time as 'stuStartTime',
        ss.stu_end_time as 'stuEndTime'
        from student_selfcard as ss
        where ss.stu_number = #{stuNumber}
   </select>
    
</mapper>
```

注意，可用的参数是通过上面的 `column="{stuNumber=stu_id}"`进行配置的，因此在嵌套的SQL中只能使用#{stuNumber}参数，当需要多个参数的时候，可用配置多个，使用逗号隔开即可，例如：

 `column="{id = id,stuNumber=stu_id}"`。

---

针对上面的方法，在MainTest中编写测试的方法：
```
    @Test
    public void testSelectStudentAndSelfcardById03() {

        SqlSession sqlSession = sqlSessionFactory.openSession();
        try {
            StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
            StudentAndSelfcard studentAndSelfcard = studentMapper.selectStudentAndSelfcardById03(1L);

            //student不为空
            Assert.assertNotNull(studentAndSelfcard);
            //studentSelfcard不为空
            Assert.assertNotNull(studentAndSelfcard.getStudentSelfcard());

            System.out.println(studentAndSelfcard);
        } finally {
            sqlSession.close();
        }
    }
```

运行：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313174148.png"/>

结果和我们想的一致，因为第一条SQL语句的查询结果只有一条，所以根据这一条数据的 `stu_id` 来关联另一个查询，因此执行了两次SQL。

这种配置方式符合开始预期的结果，但是由于嵌套查询会执行多条SQL语句，所以还要考虑更多的情况。在这个例子中，是否一定会用到`StudentSelfcard`呢？

如果查询出来并没有使用，那不就是白白浪费了一次查询吗？如果查询的不是1条数据，而是N条数据，那就会出现 N+1 的问题，主SQL会查询一次，查询出N条结果，这N条结果，那就需要进行N此查询。如何解决这个问题呢？

在上面在介绍：association标签的属性时，介绍了`fetchType`数据加载方式，这个方式可以帮我们实现延迟加载，解决 N+1 的问题。

按照上面的介绍，需要把 `fetchType` 设置为：lazy，这样设置后，只有当调用：`studentAndSelfcard.getStudentSelfcard()`方法获取：StudentSelfcard的时候，Mybatis才会执行嵌套查询去获取数据。

首先修改：`studentSelfcardMap05`
```
    <resultMap id="studentSelfcardMap05" type="studentAndSelfcard" extends="studentMap">
        <association property="studentSelfcard" column="stuNumber=stu_id"
                     select="com.liuzhuo.mapper.StudentSelfcardMapper.selectStudentSelfcardBystuNumber"
                     fetchType="lazy">
        </association>
    </resultMap>
```

添加了：`fetchType="lazy"`

然后修改测试方法，在调用`studentAndSelfcard.getStudentSelfcard()`方法之前增加一行输出：
```
    //student不为空
    Assert.assertNotNull(studentAndSelfcard);
    System.out.println("调用studentAndSelfcard.getStudentSelfcard()");
    //studentSelfcard不为空
    Assert.assertNotNull(studentAndSelfcard.getStudentSelfcard());
```

再运行测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313175722.png"/>

发现，现在是按需加载了。

现在将 `Assert.assertNotNull(studentAndSelfcard.getStudentSelfcard());` 注释掉，再测试：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313175940.png"/>

---

我们在把 `fetchType` 去掉后，再测试：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190313180224.png"/>

---

现在最新的Mybatis中，只需要把 `fetchType=lazy` 就可以实现按需执行SQL语句了。

如果你的不是最新的Mybatis的话，还需要配置一个全局的参数 `aggressiveLazyLoading`。

这个参数的含义是，当参数设置为：true时，对任意延迟属性的调用，会使带有延迟加载属性的对象**`完整加载`**，反之，每种属性都将按需加载。

以前版本默认是：true。所以即使你配置了：`fetchType=lazy`，也会全部加载！！！

需要在mybatis-config.xml中配置：
```
    <settings>
        <!--其他配置-->
        <setting name="aggressiveLazyLoading" value="false"/>
    </settings>
```

增加这个配合后，再次执行测试，就会和新版的一样了。

---

<font color="red">
注意：

许多对延迟加载原理不太熟悉的朋友会经常遇到一些莫名其妙的问题：有些时候延迟加载可以得到数据，有些时候延迟加载就会报错，为什么会出现这种情况呢？

Mybatis延迟加载是通过动态代理实现的，当调用配置为延迟加载的属性方法时，动态代理的操作会被触发，这些额外的操作就是通过Mybatis的SqlSession去执行嵌套SQl的。

由于在和某些框架集成的时候，SqlSession的生命周期交给了框架管理，因为当对象超出SqlSession生命周期调用时，会由于链接关闭等问题而抛出异常。在和Spring集成时，要确保只能在Service层延迟加载属性。当结果从Service层返回至Controller层时，如果获取延迟加载的属性值时，会因为SqlSession已经关闭而抛出异常。
</font>

---

### 一对多映射

在上一节中，我们使用了4种方式实现了一对一映射。这一节中，<font color="red">**一对多映射只有两种配置方式，都是使用collection标签进行的**</font>，下面来看看具体的介绍。

#### collection集合的嵌套结果映射

和association类似，集合的嵌套结果映射就是指通过一次SQl语句，查询出所有的结果，然后通过配置的结果映射，将数据映射到不同的对象中。在一对多的关系中，主表的一条数据会对应关联表中的多条数据，因此一般查询时会查询出多个结果，按照一对多的数据结构存储数据的时候，最终的结果数会小于等于查询的总记录数。

---

在我们的数据库中，有两个级联关系，一个是学生和课程成绩的级联，这是一对多的关系，另一个是课程成绩与课程的级联，这是一对一的关系。

现在我们首先来看一对多的关系，学生与课程成绩的关系。

创建一个新的POJO对象：StudentBean
```
public class StudentBean extends Student {

    List<StudentLecture> studentLectureList;

    public List<StudentLecture> getStudentLectureList() {
        return studentLectureList;
    }

    public void setStudentLectureList(List<StudentLecture> studentLectureList) {
        this.studentLectureList = studentLectureList;
    }
}
```

使用List集合来对应：一对多中的多的一方。在这里就是`List<StudentLecture>`。

---

打开：StudentMapper.xml，添加新的resultMap：

```
    <resultMap id="studentBeanMap" type="studentBean">
        <!--student的基本信息-->
        <id column="id" property="id"/>
        <result column="stu_name" property="stuName"/>
        <result column="stu_id" property="stuId"/>
        <result column="stu_sex" property="stuSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>
        <!--studentLecture-->
        <collection property="studentLectureList" columnPrefix="studentLecture_" ofType="studentLecture">
            <id property="id" column="id"/>
            <result property="stuId" column="stu_id"/>
            <result property="lectureId" column="lecture_id"/>
            <result property="grade" column="grade"/>
        </collection>
    </resultMap>
```

<font color="red">**注意：在collection中，ofType：为List中的java类型，此时不是使用javaType，javaType是在association中使用的，注意差别！！！**</font>

---

select标签：
```
    <select id="selectStudentBeanById" resultMap="studentBeanMap">
        select
        s.id,
        s.stu_name,
        s.stu_sex,
        s.stu_id,
        sl.id as 'studentLecture_id',
        sl.stu_id as 'studentLecture_stu_id',
        sl.lecture_id as 'studentLecture_lecture_id',
        sl.grade as 'studentLecture_grade'
        from student as s join student_lecture as sl on s.stu_id = sl.stu_id
        where s.id = #{id}
    </select>
```

---

StudentMapper接口：
```
public interface StudentMapper {

    public Student findStudentById(Long id);

    public StudentAndSelfcard selectStudentAndSelfcardById(Long id);

    public StudentAndSelfcard selectStudentAndSelfcardById02(Long id);

    public StudentAndSelfcard selectStudentAndSelfcardById03(Long id);

    //增加的新的方法
    public StudentBean selectStudentBeanById(Long id);
}
```
---

MainTest：
```
    @Test
    public void testSelectStudentBeanById() {

        SqlSession sqlSession = sqlSessionFactory.openSession();
        try {
            StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
            StudentBean studentBean = studentMapper.selectStudentBeanById(1L);

            Assert.assertNotNull(studentBean);
            List<StudentLecture> studentLectureList = studentBean.getStudentLectureList();

            System.out.println(studentBean.getStuName() + " : 选修了：" + studentLectureList.size() + " 门功课!");

            for (StudentLecture studentLecture : studentLectureList) {
                System.out.println(studentLecture);
            }

        } finally {
            sqlSession.close();
        }
    }
```

---

运行结果：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190314160845.png"/>

一条SQL语句，查询出所有的结果，然后Mybatis帮我们组合起来。

---

然后，我们还能简化，在collection中，还可以使用已存在的resultMap。

在 StudentLectureMapper.xml中：
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.liuzhuo.mapper.StudentLectureMapper">

    <resultMap id="studentLectureMap" type="studentLecture">
        <id column="id" property="id"/>
        <result column="stu_id" property="stuId"/>
        <result column="lecture_id" property="lectureId"/>
        <result column="grade" property="grade"/>
    </resultMap>

</mapper>
```

有一个基本的 `studentLectureMap` 映射配置

---

在 StudentMapper.xml中：
```
    <resultMap id="studentBeanMap02" type="studentBean" extends="studentMap">
        <collection property="studentLectureList" columnPrefix="studentLecture_" resultMap="com.liuzhuo.mapper.StudentLectureMapper.studentLectureMap">
        </collection>
    </resultMap>
```

首先，第一个resultMap，使用 extends 继承了 studentMap 了，所以此时student的映射就不需要写了。

然后，在collection中，使用resultMap等于StudentLectureMapper.xml中的studentLectureMap，来映射studentLecture，此时ofType就不需要写了！！！

---

现在测试，发现结果也是好使的。

---

现在，我们往数据库中，添加一些新的数据：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190314162837.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190314162915.png"/>

能看到，jack有三条课程成绩数据，gakki有两条课程成绩数据，应该会有五条记录。

在 StudentMapper.xml中添加新的select标签：
```
    <select id="selectStudentBeanAll" resultMap="studentBeanMap02">
        select
        s.id,
        s.stu_name,
        s.stu_sex,
        s.stu_id,
        sl.id as 'studentLecture_id',
        sl.stu_id as 'studentLecture_stu_id',
        sl.lecture_id as 'studentLecture_lecture_id',
        sl.grade as 'studentLecture_grade'
        from student as s join student_lecture as sl on s.stu_id = sl.stu_id
    </select>
```
---

在StudentMapper接口添加新的接口：
```
public List<StudentBean> selectStudentBeanAll();
```

在MainTest中：
```
    @Test
    public void testSelectStudentBeanAll() {

        SqlSession sqlSession = sqlSessionFactory.openSession();
        try {
            StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
            List<StudentBean> studentBeanList = studentMapper.selectStudentBeanAll();

            System.out.println("有:" + studentBeanList.size() + "个学生");
            for (StudentBean studentBean : studentBeanList) {
                System.out.println("学生名：" + studentBean.getStuName());
                for (StudentLecture studentLecture : studentBean.getStudentLectureList()) {
                    System.out.println("课程Id：" + studentLecture.getLectureId());
                }

            }
        } finally {
            sqlSession.close();
        }
    }
```

执行测试方法，验证一下：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190314164045.png"/>

---

通过日志可以清楚地看出，SQL执行的结果数有5条，后面输出的学生数是2，也就说本来查询出来的5条结果经过Mybatis对collection数据的处理后，变成了两条。

我们都知道，因为第一个学生有三门课程，所以转换为一对多的数据结构后就变成了三条结果。那么Mybatis是怎么知道将5条数据中的哪三条给第一个学生呢？

理解Mybatis处理的规则对使用一对多配置是非常重要的，如果只是一知半解，很容易就会遇到各种莫名其妙的问题，所以针对Mybatis处理中的要点，下面进行一个详细的阐述。

Mybatis在处理结果的时候，会判断结果是否相同，如果是相同的的结果，则只会保留第一结果，所以这个问题的关键点就是Mybatis如何判断结果是否相同。

Mybatis判断是否相同时，最简单的情况就是在映射配置中至少有一个id标签，在studentMap中配置如下：
```
<id property='id' column='id'/>
```

我们对id（构造方法中为idArg）的理解一般是，它配置的字段为表的主键（联合主键时可以配置多个id标签），因为Mybatis的resultMap只用于配置结果如何映射，并不知道这个表具体如何。<font color="red">id的唯一作用就是嵌套的映射配置时判断数据是否相同</font>，当配置id标签时，Mybatis只需要比较所有数据中id标签配置字段值是否相同即可。在配置嵌套结果查询时，配置id标签可以提高处理效率。

这样一来，上面的查询就不难理解了。因为前三条数据的studentMap部分的id相同，所以它们属于同一个学生，因此这条数据会合并到同一个学生中。

为了让大家更清楚的理解id的作用，可以临时对studentMap的映射进行如下的修改：
```
    <resultMap id="studentMap" type="student">
        <!--<id column="id" property="id"/>-->
        <id column="stu_sex" property="stuSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>
        <result column="stu_name" property="stuName"/>
        <result column="stu_id" property="stuId"/>
        <result column="id" property="id"/>
        <!--<result column="stu_sex" property="stuSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>-->
    </resultMap>
```

将stu_sex 设置为id元素，然后将数据库中的两个学生的stu_sex字段设置为相同的值。

然后执行测试：

<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190314171115.png"/>

---

我们能看到，变成了一个学生！！！学生信息保留的是第一个学生的信息，因此学生姓名为jack。

大家通过这个简单的例子应该明白id的作用了。需要注意的是，很有可能会出现一种没有配置id的情况。没有配置id时，Mybatis就会把resultMap中配置的所有字段进行比较，如果所有字段的值都相同就合并，只要有一个字段值不同，就不合并。

<font color="red">**提示：在嵌套结果配置时id属性时，如果查询语句中没有查询id属性配置的列，就会导致id对应的值为null。这种情况下，所有值的id都相同，因此会使嵌套的集合中只有一条数据。所以在配置id列时，查询语句中必须包含该列。**</font>

---

可以对studentMap再次修改，将id标签改为result：
```
    <resultMap id="studentMap" type="student">
        <!--<id column="id" property="id"/>-->
        <result column="stu_sex" property="stuSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>
        <result column="stu_name" property="stuName"/>
        <result column="stu_id" property="stuId"/>
        <result column="id" property="id"/>
        <!--<result column="stu_sex" property="stuSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>-->
    </resultMap>
```

此时，已经不存id标签了，执行测试方法：

<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190314172153.png"/>

发现此时的结果，与配置id标签时的结果相同。因为学生在studentMap这部分配置的属性都相同，因此合并。

虽然结果相同，但是由于Mybatis要对所有字段进行比较，因此字段数为M时，如果查询结果又N条，就需要进行M * N 次比较，相比配置id时的N次比较，效率相差更多，所以要尽可能配置id标签！！！

在studentMap比较完毕后，会接着比较studentLecture，如果不多，就会增加一个studentLecture对象，如果两个studentLecture相同就保留一个。假设studentLecture还有下一级，仍然按照该规则去比较。

---

上面就是学生与课程成绩的一对多的映射配置，我们还有一个课程表与课程成绩表是一对一的映射，现在我们将这个映射也加上。


添加的POJO类：StudentLectureBean
```
public class StudentLectureBean extends StudentLecture {

    private Lecture lecture;

    public Lecture getLecture() {
        return lecture;
    }

    public void setLecture(Lecture lecture) {
        this.lecture = lecture;
    }
}
```

修改：StudentBean
```
public class StudentBean extends Student {

    //将List中类型修改为我们添加的POJO对象
    List<StudentLectureBean> studentLectureList;

    public List<StudentLectureBean> getStudentLectureList() {
        return studentLectureList;
    }

    public void setStudentLectureList(List<StudentLectureBean> studentLectureList) {
        this.studentLectureList = studentLectureList;
    }
}
```

添加：LectureMapper.xml
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.liuzhuo.mapper.LectureMapper">

    <resultMap id="lectureMap" type="lecture">
        <id column="id" property="id"/>
        <result column="lecture_name" property="lectureName"/>
    </resultMap>

</mapper>
```

在：StudentLectureMapper.xml 添加新的映射配置：
```
    <resultMap id="studentLectureMap02" type="studentLectureBean">
        <id column="id" property="id"/>
        <result column="stu_id" property="stuId"/>
        <result column="lecture_id" property="lectureId"/>
        <result column="grade" property="grade"/>

        <association property="lecture" columnPrefix="lecture_"
                     resultMap="com.liuzhuo.mapper.LectureMapper.lectureMap"/>
    </resultMap>
```

在 StudentMapper.xml 中修改：
```
    <resultMap id="studentBeanMap02" type="studentBean" extends="studentMap">
        <!--student的基本信息-->
        <!--studentLecture-->
        <collection property="studentLectureList" columnPrefix="studentLecture_"
                    resultMap="com.liuzhuo.mapper.StudentLectureMapper.studentLectureMap02"> <!--修改为02了-->
        </collection>
    </resultMap>
```

修改测试方法：
```
    public void testSelectStudentBeanAll() {

        SqlSession sqlSession = sqlSessionFactory.openSession();
        try {
            StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
            List<StudentBean> studentBeanList = studentMapper.selectStudentBeanAll();

            System.out.println("有:" + studentBeanList.size() + "个学生");
            for (StudentBean studentBean : studentBeanList) {
                System.out.println("学生名：" + studentBean.getStuName());
                for (StudentLectureBean studentLecture : studentBean.getStudentLectureList()) {
                    System.out.println("课程Id：" + studentLecture.getLectureId());
                    System.out.println("课程的名字: " + studentLecture.getLecture().getLectureName());
                }

            }
        } finally {
            sqlSession.close();
        }
    }
```

运行结果：

<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190314180033.png"/>

---

虽然association和collection标签是分开介绍的，但是这两者可以组合使用或者互相嵌套使用，也可以使用符合自己需要的任何数据结构，不需要局限于数据库表之间的关系联系。

---

#### collection集合的嵌套查询

接着上一节的内容，我们来将上诉的collection嵌套结果映射改为嵌套查询。

StudentMapper接口：
```
public List<StudentBean> selectStudentBeanAll02();
```
StudentMapper.xml：
```
    <resultMap id="studentMap" type="student">
        <id column="id" property="id"/>
        <result column="stu_name" property="stuName"/>
        <result column="stu_id" property="stuId"/>
        <result column="stu_sex" property="stuSex" typeHandler="com.liuzhuo.typehandler.SexEnumTypeHandler"/>
    </resultMap>

    <resultMap id="studentBeanMap03" type="studentBean" extends="studentMap">
        <collection property="studentLectureList" fetchType="lazy" column="{stuId = stu_id}"
                    select="com.liuzhuo.mapper.StudentLectureMapper.selectStudentLectureByStuId"/>
    </resultMap>

    <select id="selectStudentBeanAll02" resultMap="studentBeanMap03">
        select
        s.id,
        s.stu_name,
        s.stu_sex,
        s.stu_id
        from
        student as s
    </select>
```

StudentLectureMapper.xml:
```
    <resultMap id="studentLectureMap03" type="studentLectureBean">
        <id column="id" property="id"/>
        <result column="stu_id" property="stuId"/>
        <result column="lecture_id" property="lectureId"/>
        <result column="grade" property="grade"/>

        <association property="lecture" fetchType="lazy" column="{lectureId = lecture_id}"
                     select="com.liuzhuo.mapper.LectureMapper.selectLectureById"/>
    </resultMap>

    <select id="selectStudentLectureByStuId" resultMap="studentLectureMap03">
         SELECT id , stu_id , lecture_id , grade from student_lecture where stu_id = #{stuId}
    </select>
```

LectureMapper.xml:
```
    <resultMap id="lectureMap" type="lecture">
        <id column="id" property="id"/>
        <result column="lecture_name" property="lectureName"/>
    </resultMap>

    <select id="selectLectureById" resultMap="lectureMap">
        SELECT id , lecture_name FROM lecture WHERE id = #{lectureId}
    </select>
```

testSelectStudentBeanAll02测试方法：
```
    public void testSelectStudentBeanAll02() {

        SqlSession sqlSession = sqlSessionFactory.openSession();
        try {
            StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
            List<StudentBean> studentBeanList = studentMapper.selectStudentBeanAll02();

            System.out.println("有:" + studentBeanList.size() + "个学生");
            for (StudentBean studentBean : studentBeanList) {
                System.out.println("学生名：" + studentBean.getStuName());
                for (StudentLectureBean studentLecture : studentBean.getStudentLectureList()) {
                    System.out.println("课程Id：" + studentLecture.getLectureId());
                    System.out.println("课程的名字: " + studentLecture.getLecture().getLectureName());
                }
            }
        } finally {
            sqlSession.close();
        }
    }
```

---

运行测试结果：

<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190314191100.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190314191130.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190314191147.png"/>

从结果可以看出，是按需发送SQL语句，然后获取数据的。

首先只是获取了学生的基本信息。

然后获取学生的课程成绩时，会发送第二条SQL语句，获取课程的id。

最后获取学生课程的名称时，会发送第三条SQL语句，获取课程的名称。

我们也可以发现，当获取第二个学生的时候，只是获取它的课程信息时发送了SQL语句，后面的课程名称没有发送SQL语句，因为在第一个学生那里已经发送过了，Mybatis会自动帮我们缓存，这个缓存的知识点，我们后面会讲到，大家不要急~~~

---

### discriminator鉴别器

鉴别器级联是在特定的条件下去使用不同的POJO。比如本例中要了解学生的健康情况，如果是男生总不能去了解他的女性生理指标吧，这样就会闹出笑话了，同样女生也不能去了解男性的生理指标。这个时候就需要使用到鉴别器了。

---

我们可以根据学生信息中的性别属性进行判断去关联男性的健康指标或者女性的健康指标，然后进行关联即可，在Mybatis中我们采用的是鉴别器discriminator，由它来处理这些需要鉴别的场景，它相当于Java语言中的switch语句。让我们来看看它是如何实现的。

`discriminator`标签常用的两个属性如下：

* column：该属性用于设置要进行鉴别比较值的列。

* javaType：该属性用于指定列的类型，保证使用相同的java类型来比较值。

`discriminator` 标签可以有1个或多个`case标签`，case标签包含以下三个属性：

* value：该值为discriminator指定column用来匹配的值。

* resultMap：当column的值和value的值匹配时，可以配置使用resultMap指定的映射，resultMap优先级高于resulType。

* resultType：当column的值和value的值匹配时，用于配置使用resultType指定的映射。

case标签下面可以包含的标签和resultMap中一样，用法也一样。

---

Student类：
```
public class Student {

    private Long id;  //学生编号
    private String stuName; //学生姓名
    private Integer stuSex;//性别
    private Long stuId;//学生证号

    ····省略get、set方法
}
```
---

StudentBean类：
```
public class StudentBean extends Student {

    private List<StudentLectureBean> studentLectureList;

    ····省略get、set方法
}
```
---

StudentMaleHealth类：
```
public class StudentMaleHealth {

    private Long id;
    private Long stuId;
    private Date checkDate;
    private String heart;
    private String prostate;
    
    ····省略get、set方法
}
```
---

StudentFemaleHealth类：
```
public class StudentFemaleHealth {

    private Long id;
    private Long stuId;
    private Date checkDate;
    private String heart;
    private String uterus;

    ····省略get、set方法
}
```

**上面的都是之前创建的POJO，现在开始创建新的POJO类：**

---

MaleStudentBean类：
```
public class MaleStudentBean extends StudentBean {

    private StudentMaleHealth studentMaleHealth;

    ····省略get、set方法
}
```

---

FemaleStudentBean类：
```
public class FemaleStudentBean extends StudentBean {

    private StudentFemaleHealth studentFemaleHealth;

    ····省略get、set方法
}
```

---
StudentMapper.xml文件：

```
    <resultMap id="studentMap" type="student">
        <id column="id" property="id"/>
        <result column="stu_name" property="stuName"/>
        <result column="stu_id" property="stuId"/>
        <result column="stu_sex" property="stuSex"/>
    </resultMap>

    <resultMap id="studentBeanMap04" type="studentBean" extends="studentMap">
        <collection property="studentLectureList" fetchType="lazy" column="{stuId = stu_id}"
                    select="com.liuzhuo.mapper.StudentLectureMapper.selectStudentLectureByStuId"/>
        <discriminator javaType="int" column="stu_sex">
            <case value="1" resultMap="maleStudentMap"/>
            <case value="2" resultMap="femaleStudentMap"/>
        </discriminator>
    </resultMap>

    <resultMap id="maleStudentMap" type="maleStudentBean" extends="studentMap">
        <association property="studentMaleHealth" fetchType="lazy" column="{stuId = stu_id}"
                     select="com.liuzhuo.mapper.StudentMaleHealthMapper.selectStudentMaleHealthByStuId"/>
        <collection property="studentLectureList" fetchType="lazy" column="{stuId = stu_id}"
                    select="com.liuzhuo.mapper.StudentLectureMapper.selectStudentLectureByStuId"/>
    </resultMap>

    <resultMap id="femaleStudentMap" type="femaleStudentBean" extends="studentMap">
        <association property="studentFemaleHealth" fetchType="lazy" column="{stuId = stu_id}"
                     select="com.liuzhuo.mapper.StudentFemaleHealthMapper.selectStudentFemaleHealthByStuId"/>
        <collection property="studentLectureList" fetchType="lazy" column="{stuId = stu_id}"
                    select="com.liuzhuo.mapper.StudentLectureMapper.selectStudentLectureByStuId"/>
    </resultMap>

    <select id="selectStudentBeanAll03" resultMap="studentBeanMap04">
        select
        s.id,
        s.stu_name,
        s.stu_sex,
        s.stu_id
        from
        student as s
    </select>
```
---

StudentMaleHealthMapper.xml文件：
```
<mapper namespace="com.liuzhuo.mapper.StudentMaleHealthMapper">

    <resultMap id="studentMaleHealthMap" type="studentMaleHealth">
        <id column="id" property="id"/>
        <result column="stu_id" property="stuId"/>
        <result column="check_date" property="checkDate"/>
        <result column="heart" property="heart"/>
        <result column="prostate" property="prostate"/>
    </resultMap>

    <select id="selectStudentMaleHealthByStuId" resultMap="studentMaleHealthMap">
        SELECT id , stu_id ,check_date,heart,prostate FROM student_male_health WHERE stu_id = #{stuId}
    </select>

</mapper>
```

---

StudentFemaleHealthMapper.xml文件：
```
<mapper namespace="com.liuzhuo.mapper.StudentFemaleHealthMapper">

    <resultMap id="studentFemaleHealthMap" type="studentFemaleHealth">
        <id column="id" property="id"/>
        <result column="stu_id" property="stuId"/>
        <result column="check_date" property="checkDate"/>
        <result column="heart" property="heart"/>
        <result column="uterus" property="uterus"/>
    </resultMap>

    <select id="selectStudentFemaleHealthByStuId" resultMap="studentFemaleHealthMap">
        SELECT id , stu_id ,check_date,heart,uterus FROM student_female_health WHERE stu_id = #{stuId}
    </select>

</mapper>
```
---

StudentMapper接口：
```
public List<StudentBean> selectStudentBeanAll03();
```

这里返回的是`StudentBean`类型，因为 MaleStudentBean、FemaleStudentBean都是它的子类。

---

MainTest类：
```
    public void testSelectStudentBeanAll03() {

        SqlSession sqlSession = sqlSessionFactory.openSession();
        try {
            StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
            List<StudentBean> studentBeanList = studentMapper.selectStudentBeanAll03();

            System.out.println("有:" + studentBeanList.size() + "个学生");
            for (StudentBean studentBean : studentBeanList) {
                System.out.println("学生名：" + studentBean.getStuName());
                System.out.println("学生的性别：" + studentBean.getStuSex());

                //判断是哪个类型的学生类型
                if (studentBean instanceof MaleStudentBean) {
                    MaleStudentBean maleStudentBean = (MaleStudentBean) studentBean;
                    System.out.println(maleStudentBean.getStudentMaleHealth().getHeart());
                    System.out.println(maleStudentBean.getStudentMaleHealth().getProstate());
                } else if (studentBean instanceof FemaleStudentBean) {
                    FemaleStudentBean femaleStudentBean = (FemaleStudentBean) studentBean;
                    System.out.println(femaleStudentBean.getStudentFemaleHealth().getHeart());
                    System.out.println(femaleStudentBean.getStudentFemaleHealth().getUterus());
                } else {
                    System.out.println("没有映射成功!!!");
                }

                for (StudentLectureBean studentLecture : studentBean.getStudentLectureList()) {
                    System.out.println("课程Id：" + studentLecture.getLectureId());
                    System.out.println("课程的名字: " + studentLecture.getLecture().getLectureName());
                }
            }
        } finally {
            sqlSession.close();
        }
    }
```

上面通过：`studentBean instanceof MaleStudentBean` 来判断Mybatis帮我们返回的具体类型是哪个。

---

测试结果：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315110511.png"/>

当判断具体是哪个类型时，再发生SQL语句，查询具体的信息：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315110619.png"/>

当要获取学生的课程成绩时，再发生SQL语句：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315110738.png"/>

当要获取学生的课程名是，再发生SQL语句：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315110819.png"/>

接下来就是类似的操作了：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315110934.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315110953.png"/>

---

<font color="red">鉴别器是一种很少使用的方式，在使用之前一定要完全掌握，没有把握的情况下尽可能避免使用。</font>


