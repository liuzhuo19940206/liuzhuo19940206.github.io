---
title: Mybatis中的缓存
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-15 15:21:39
summary: Mybatis中的缓存
---

使用缓存可以使应用更快地获取数据，避免频繁的与数据库交互 ，尤其是在查询越多 、缓存命中率越高的情况下，使用缓存的作用就越明显。MyBatis 作为持久化框架提供了非常强大的查询缓存特性，可以非常方便地配置和定制使用。

一般提到Mybatis的缓存都是指二级缓存。一级缓存（也叫本地缓存）默认会启动，并且不能控制，因此很少会提到。首先，我会简单的介绍一下Mybatis的一级缓存，了解Mybatis的一级缓存可以避免产生一些难以发现的错误。其次，我会全面介绍Mybatis的二级缓存，包括二级缓存的基本配置用法，还有一些常用的缓存框架和缓存数据库的结合。

### 一级缓存

#### 第一个例子

我们来看一个简单的例子：
```java
    public void testSelectStudent() {
        SqlSession sqlSession = sqlSessionFactory.openSession();
        StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
        Student student = studentMapper.findStudentById(1L);
        System.out.println("使用同一个SqlSession再执行一次同样的方法");
        Student student2 = studentMapper.findStudentById(1L);
        sqlSession.commit();

        //开启一个新的SqlSession
        SqlSession sqlSession2 = sqlSessionFactory.openSession();
        StudentMapper studentMapper2 = sqlSession.getMapper(StudentMapper.class);
        System.out.println("开启一个新的SqlSession再执行一次：");
        Student student3 = studentMapper.findStudentById(1L);
        sqlSession2.commit();
        try {
        } finally {
            //不要忘记关闭SqlSession
            sqlSession.close();
            sqlSession2.close();
        }
    }
```

注意：这里要调用：sqlSession.commit()，才会启动缓存。

运行结果如下：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315154304.png"/>

发现，Mybatis的一级缓存存在于：<font color="red">SqlSession的生命周期中</font>，在同一个SqlSession中查询时，Mybatis会把执行的方法和参数通过算法生成缓存的键值，将键值和查询结果存入一个Map对象中。如果同一个SqlSession中执行的方法和参数完全一致，那么通过算法会生成相同的键值，当Map缓存对象中已经存在了该键值时，则会返回缓存中的对象。

---

#### 第二个例子

再看一个例子：
```
    public void testSelectStudent() {
        SqlSession sqlSession = sqlSessionFactory.openSession();
        StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
        Student student = studentMapper.findStudentById(1L);
        System.out.println(student);

        //修改student中的Name属性
        student.setStuName("dj");
        System.out.println("使用同一个SqlSession再执行一次同样的方法");

        Student student2 = studentMapper.findStudentById(1L);
        System.out.println(student2);
        sqlSession.commit();

        //开启一个新的SqlSession
        SqlSession sqlSession2 = sqlSessionFactory.openSession();
        StudentMapper studentMapper2 = sqlSession.getMapper(StudentMapper.class);
        System.out.println("开启一个新的SqlSession再执行一次：");
        Student student3 = studentMapper.findStudentById(1L);
        System.out.println(student3);
        sqlSession2.commit();
        try {
        } finally {
            //不要忘记关闭SqlSession
            sqlSession.close();
            sqlSession2.close();
        }
    }
```

运行结果：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315155617.png"/>

我们可以看到的是，当我获取 `id=1` 的 student学生后，修改它的姓名，然后再次调用同样的方法，获取 `id=1` 的学生，它的姓名也跟着发生了改变。说明此时，student2 和 student 是同一个对象，都是从缓存中获取的，所以会发生上面的问题。开启一个新的SqlSession后，获取 `id=1` 的学生，又会从数据库中重新获取了。

---

如果不想让该方法使用一级缓存的话，可以添加：`flushCache=true` ，表示，每次调用该方法，都会重新发送SQL语句，从数据库中获取最新的数据。

```
    <select id="findStudentById"  flushCache="true" resultMap="studentMap">
         select * from student where id = #{id}
     </select>
```
`flushCache=true` ，这个属性配置为：true后，会在查询数据前清空当前的一级缓存，因此该方法每次都会重新从数据库中查询数据，此时的student和student2就会变成两个不同的实例，可以避免上面的问题。

但是由于这个方法清空了一级缓存，**`会影响到当前SqlSession中所有的缓存的查询`**，因此在需要反复查询获取只读数据的情况下，会增加数据库的查询次数，所以要避免这么使用。

<font color="red">注意：调用 flushCache=true 的方法后，一级缓存会被清空，即之前的所有方法的调用缓存都会被清空，不仅仅是指：flushCache=true 的方法</font>

---

#### 第三个例子

```
    public void testSelectStudent() {
        SqlSession sqlSession = sqlSessionFactory.openSession();
        StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
        System.out.println("第一次调用");
        Student student = studentMapper.findStudentById(1L);
        System.out.println("第二次调用");
        Student student2 = studentMapper.findStudentById(1L);
        System.out.println("两个对象是否相等：" + (student == student2));
        sqlSession.commit();

        System.out.println("====================================");
        
        //开启一个新的SqlSession
        SqlSession sqlSession2 = sqlSessionFactory.openSession();
        StudentMapper studentMapper2 = sqlSession.getMapper(StudentMapper.class);
        System.out.println("开启一个新的SqlSession再执行一次：");
        Student student3 = studentMapper.findStudentById(1L);
        //执行删除操作
        studentMapper2.deleteById(3L);
        System.out.println("执行删除操作后，再调用一次");
        Student student4 = studentMapper.findStudentById(1L);
        sqlSession2.commit();
        try {
        } finally {
            //不要忘记关闭SqlSession
            sqlSession.close();
            sqlSession2.close();
        }
    }
```

前提：删除 findStudentById 方法：`flushCache=true`。

执行之后的结果如下：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315162557.png"/>

发现，在同一个SqlSession的情况下，只要执行了：insert、update、delete操作，都会清空一级缓存，所以查询 student4 时由于缓存不存在，就会再次发送SQL语句去执行数据库的查询操作。

---

以上就是Mybatis中的一级缓存的各种情况了，由于一级缓存是在默默地工作，因此要避免在使用的过程中由于不了解而发生察觉不到的错误。


### 二级缓存

Mybatis的二级缓存非常强大，它不同于一级缓存只存在于SqlSession的生命周期中，而是可以理解为存在于：SqlSessionFactory的生命周期中。虽然目前还没有接触过同时存在多个SqlSessionFactory的情况，但可以知道，当存在多个SqlSessionFactory时，它们的缓存都是绑定在各自对象上的，缓存数据在一般情况下是不相通的。只有在使用如Redis这样的缓存数据库时，才可以共享缓存。

#### 配置二级缓存

在Mybatis的全局配置settings中有一个参数为：`cacheEnabled`，这个参数是二级缓存的全局开关。默认值是：true，所以不必配置，如果想要配置，可以在：mybatis-config.xml中添加：
```
    <settings>
        <!--其他setting配置-->
        <setting name="cacheEnabled" value="true"/>
    </settings>
```

二级缓存是和命名空间绑定的，即二级缓存需要配置在`Mapper.xml`映射文件中，或者配置在Mapper.java接口中。在映射文件中，命名空间就是XML根节点mapper的namespace属性。在Mapper接口中，命名空间就是接口的全限定名。

##### Mapper.xml中配置二级缓存

在保证二级缓存的全局配置开启的情况下，给 `StudentMapper.xml` 开启二级缓存只需要添加：`<cache/>` 标签即可：
```
<mapper namespace="com.liuzhuo.mapper.StudentMapper">

    <cache/>

    <resultMap id="studentMap" type="student">
        <id column="id" property="id"/>
        <result column="stu_name" property="stuName"/>
        <result column="stu_id" property="stuId"/>
        <result column="stu_sex" property="stuSex"/>
    </resultMap>

    <!--其他配置-->
</mapper>
```

默认的二级缓存会有如下效果：

* 映射语句文件中的所有select语句将会被缓存。

* 映射语句文件中的所有insert、update、delete语句会刷新缓存。

* 缓存会使用 LRU（最近最少使用）算法来回收。

* 根据时间表，比如 No Flush Interval（没有刷新间隔），缓存不会以任何时间顺序来刷新。

* 缓存会存储集合或对象的1024个引用

* 缓存会被视为 read/write（可读/可写）的，意味着对象检索不是共享的，而且可以安全地被调用者修改，而不干扰其他调用者或线程所做的潜在修改。

---

所有的这些属性都可以通过缓存元素的属性来修改：
```
    <cache
        eviction="FIFO"
        flushInterval="60000"
        size="512"
        readOnly="true"/>
```

这个更高级的配置，创建了一个FIFO缓存，并每隔60秒刷新一次，存储集合或对象的512个引用，而且返回的对象被认为是只读的，因此在不同线程中的调用者之间修改它们会导致冲突。

cache可以配置的属性如下：

* eviction（回收策略）

（1）LRU（最近最少使用）：移除最长时间不被使用的对象，这是默认值。

（2）FIFO（先进先出）：按对象进入缓存的顺序来移除它们。

（3）SOFT（软引用）：移除基于垃圾回收器状态和软引用规则的对象。

（4）WEAK（弱引用）：更积极地移除基于垃圾回收器状态和弱引用规则的对象。

* flushInterval（刷新间隔）：可以被设置为任意的正整数，而且它们代表一个合理的毫秒形式的时间段。默认情况不设置，即没有刷新间隔，缓存仅仅在调用语句时刷新。

* size（引用数目）：可以被设置为任意的正整数，要记住缓存的对象数目和运行环境的可用内存资源数目。默认值是：1024.

* readOnly（只读）：属性可以被设置为：true 或 false。只读的缓存会给所有调用者返回缓存对象的相同实例，因此这些对象不能被修改，这提供了很重要的性能优势。默认值是：false，允许修改。

##### Mapper接口中设置二级缓存

在使用注解方式时，如果想对注解方法启用二级缓存，还需要在Mapper接口中进行配置，如果Mapper接口也存在对应的XML映射文件，两者同时开启缓存时，还需要特殊配置。

(1)当只使用注解方式配置二级缓存时，如果在 `StudentMapper`接口中，则需要增加如下配置。

```
@CacheNamespace
public interface StudentMapper {

	//接口方法
}
```

只需增加该注解即可，该注解还可以配置各项属性：
```
@CacheNamespace(
        eviction = FifoCache.class,
        flushInterval = 600000,
        size = 512,
        readWrite = true
)
public interface StudentMapper {

	//接口方法
}
```

---

(2)当同时使用注解方式和XML映射文件时，如果同时配置了上述的二级缓存，就会抛出如下异常：
```
Caches collection already contains value for com.liuzhuo.mapper.StudentMapper
```

<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315171320.png"/>

这是因为Mapper接口和对应的XML文件是相同的命名空间，想使用二级缓存，两者必须同时配置（如果接口不存在使用注解方式的方法，可以只在XML中配置），因此按照上面的方式进行配置就会出错，这个时候应该使用参数缓存。在Mapper接口中，参照缓存配置如下：
```
@CacheNamespaceRef(StudentMapper.class)
public interface StudentMapper {

}
```

注意使用的注解是：`@CacheNamespaceRef` 多了Ref的后缀！！！

因为想让StudentMapper接口中的注解方法和XML中的方法使用相同的缓存，因此使用参数缓存配置 StudentMapper.class，这样就会使用命名空间 com.liuzhuo.mapper.StudentMapper的缓存配置，即：StudentMapper.xml中配置的缓存。

Mapper接口可以通过注解引用XML映射文件或者其他接口的缓存，在XML中也可以配置参数缓存，如在 StudentMapper.xml中：
```
<cache-ref namespace="com.liuzhuo.mapper.StudentMapper"/>
```

这样配置后，XML就会引用Mapper接口中配置的二级缓存，同样可以避免同时配置二级缓存导致的冲突。

---

Mybatis中很少会同时使用Mapper接口注解方式和XML映射文件，所以参照缓存并不是为了解决这个问题而设计的。参照缓存除了能够通过引用其他缓存减少配置外，主要的作用是解决脏读。

为了保持后续测试一致，对 StudentMapper 接口和XML映射文件进行如下配置。

```
@CacheNamespaceRef(StudentMapper.class)
public interface StudentMapper {

}

<mapper namespace="com.liuzhuo.mapper.StudentMapper">
    <cache
        eviction="FIFO"
        flushInterval="60000"
        size="512"
        readOnly="false"/>
</mapper>
```

---

#### 使用二级缓存

上面讲到了二级缓存的配置，现在开始讲解二级缓存的使用，当调用 StudentMapper的所有select查询方法时，二级缓存就已经开始起作用了。需要注意的是，由于配置的是可读写的缓存，而Mybatis使用 `SerializedCache` 序列化缓存来实现可读写缓存类，并通过序列化和反序列化来保证通过缓存获取数据时，得到的是一个新的实例。因此，如果配置为只读缓存时，Mybatis就会使用Map来存储缓存值，这种情况下，从缓存中获取的对象就是同一个实例。

因为使用可读写缓存，可以使用  `SerializedCache` 序列化缓存。这个缓存类要求所有被序列化的对象必须实现 `Serializable` 接口，所以还需要修改Student对象。

```
public class Student implements Serializable {

    private static final long serializableUID = 7483479274923474792L;

	//其他属性和set、get方法
}
```

---

编写测试方法：
```
    public void testSelectStudent() {
        SqlSession sqlSession = sqlSessionFactory.openSession();
        Student student = null;
        try {
            StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
            System.out.println("第一次调用");
            student = studentMapper.findStudentById(1L);
            System.out.println(student);
            student.setStuName("dj");
            System.out.println("第二次调用");
            Student student2 = studentMapper.findStudentById(1L);
            System.out.println(student2);
            System.out.println("两个对象是否相等：" + (student == student2));
        } finally {
            sqlSession.close();
        }
        System.out.println("开启新的Sqlsession~~~~");
        //开启一个新的SqlSession
        sqlSession = sqlSessionFactory.openSession();
        try {
            StudentMapper studentMapper2 = sqlSession.getMapper(StudentMapper.class);
            System.out.println("开启一个新的SqlSession后，执行第一次：");
            Student student3 = studentMapper2.findStudentById(1L);
            System.out.println(student3);
            System.out.println("开启一个新的SqlSession后，执行第二次：");
            Student student4 = studentMapper2.findStudentById(1L);
            System.out.println(student4);
            System.out.println("两个对象是否相等：" + (student3 == student4));
            sqlSession.commit();
        } finally {
            //不要忘记关闭SqlSession
            sqlSession.close();
        }
    }
```

运行结果：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315180036.png"/>

日志中：出现的以：`Cache Hit Ratio` 开头的语句，这行语句后面输出的值为当前执行方法的缓存命中率（二级缓存的，不包括一级缓存）。

在测试第一部分中，第一次查询student时由于没有缓存，所以执行了数据库查询，在第二次查询获取student2时，student和student2是完全相同的实例，这里是使用了一级缓存，所以返回的是同一个实例，此时的命中率还是：0。

当调用SqlSession.close（）后，SqlSession才会保存查询数据到二级缓存中。在这之后二级缓存才有了缓存数据。所以可以看到在第一部分的两次查询时，命中率都是：0。

在第二部分测试代码中，再次获取student3对象时，日志中并没有输出数据库查询，而是输出了命中率，这时的命中率是：0.33333333333。这是第三次查询，并且得到了二级缓存中的数据，因此该方法一共被请求了3次，有一次命中，所以命中率就是三分之。后面再获取student4时，就是4次请求，2次命中，命中率为：0.5。并且因为是读写缓存的缘故，student3 和student4 都是反序列化得到的结果，所以它们不是相同的实例。在这一部分，这两个实例是读写安全的，其属性不会互相影响。

---

<font color="red">**提示：**</font>

在这个例子中并没有实现真正的读写安全，为啥？

因为这个测试中加入了一段不该有的代码，即：`student.setStuName("dj");` 这里修改了：student的属性后，按照常理应该更新数据到数据库中，更新后会清空一级、二级缓存，这样第二部分代码中就不出现查询结果的 stuName 都是 `'dj'` 的情况了。所以想要安全使用，需要避免毫无意义的修改，这样可以避免人为产生的脏数据，避免缓存和数据库的数据不一致的情况。

---

Mybatis默认提供的缓存实现都是基于Map实现的内存缓存，已经可以满足基本的应用。但是当需要缓存大量的数据时，不能仅仅通过提高内存来使用Mybatis的二级缓存，还可以选择一些类似 `EhCache`的缓存框架或 `Redis`缓存数据库等工具来保存Mybatis的二级缓存数据。

---

### 集成EhCache缓存

EhCache是一个纯粹的Java进程内的缓存框架，具有快速、精干等特点。具体来说，EhCache主要的特性如下。

* 快速

* 简单

* 多种缓存策略

* 缓存数据有内存和磁盘两级，无须担心容量问题

* 缓存数据会在虚拟机重启的过程中写入磁盘

* 可以通过RMI、可插入API等方式进行分布式缓存

* 具体缓存和缓存管理器的侦听接口

因为以上诸多优点，Mybatis项目开发者最早提供了EhCache的Mybatis二级缓存实现，该项目名为 `ehcache-cache`

地址是：https://github.com/mybatis/ehcache-cache

---

（1）添加项目依赖

在pom.xml中添加如下的依赖：
```
<dependency>
    <groupId>org.mybatis.caches</groupId>
    <artifactId>mybatis-ehcache</artifactId>
    <version>1.1.0</version>
</dependency>
```

（2）配置EhCache

在 src/main/resources 目录下新增 `ehcache.xml`文件。

```
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="http://ehcache.org/ehcache.xsd">

    <!-- 磁盘缓存位置 -->
    <diskStore path="E:\DEV_ENV\ehcache"/>

    <!-- 默认缓存 -->
    <defaultCache
            maxEntriesLocalHeap="10000"
            eternal="false"
            copyOnRead="true"
            copyOnWrite="true"
            timeToIdleSeconds="120"
            timeToLiveSeconds="120"
            maxEntriesLocalDisk="10000000"
            diskExpiryThreadIntervalSeconds="120"
            memoryStoreEvictionPolicy="LRU">
        <persistence strategy="localTempSwap"/>
    </defaultCache>

</ehcache>
```

有关EhCache的详细配置可以参考地址：http://www.ehcache.org/ehcache.xml

在上面的配置中重点要看两个属性，`copyOnRead` 和 `copyOnWrite` 属性。这两个属性的配置会对后面使用二级缓存产生很大影响。

`copyOnRead的含义：` 判断从缓存中读取数据时是返回对象的引用还是复制一个对象返回。默认情况下是false，即返回数据的引用，这种情况下返回的都是相同的对象，和Mybatis默认缓存中的只读对象是相同的。如果设置为：true，那就是可读写缓存，每次读取缓存时都会复制一个新的实例。

`copyOnWrite的含义：` 判断写入缓存时是直接缓存对象的引用还是复制一个对象，然后缓存，默认也是false。如果想使用可读写缓存，就需要将这两个属性配置为true，如果使用只读缓存，可以不配置这两个属性，使用默认值false即可。

---

（3）修改StudentMapper.xml中的缓存配置

ehcache-cache提供了如下2个可选的缓存实现。

* org.mybatis.caches.ehcache.EhcacheCache

* org.mybatis.caches.ehcache.LoggingEhcache

这两个缓存中，第二个是带日志的缓存，由于Mybatis初始化缓存时，如果Cache不是继承自LoggingEhcache(org.mybatis.caches.ehcache.LoggingEhcache)，Mybatis便会使用Logging Ehcache 装饰代理缓存，所以上面两个缓存使用时并没有区别，都会输出缓存命中率的日志。

修改 StudentMapper.xml 中的配置：
```
<mapper namespace="com.liuzhuo.mapper.StudentMapper">

    <cache type="org.mybatis.caches.ehcache.EhcacheCache"/>

	<!--其他配置-->
</mapper>
```

只通过设置type属性就可以使用EhCache缓存了，这时cache的其他属性都不会起到任何作用，针对缓存的配置都在ehcache.xml中进行。在ehcache.xml配置文件中，只有一个默认的缓存配置，所以配置使用EhCache缓存的Mapper映射文件都会有一个以映射文件命名空间命名的缓存。如果想针对某一个命名空间进行配置，需要在ehcache.xml中添加一个和映射文件命名空间一致的缓存配置，例如针对：StudentMapper，可以进行如下配置：
```
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="http://ehcache.org/ehcache.xsd">

    <!-- 磁盘缓存位置 -->
    <diskStore path="E:\DEV_ENV\ehcache"/>

    <!-- 默认缓存 -->
    <defaultCache
            maxEntriesLocalHeap="10000"
            eternal="false"
            copyOnRead="true"
            copyOnWrite="true"
            timeToIdleSeconds="120"
            timeToLiveSeconds="120"
            maxEntriesLocalDisk="10000000"
            diskExpiryThreadIntervalSeconds="120"
            memoryStoreEvictionPolicy="LRU">
        <persistence strategy="localTempSwap"/>
    </defaultCache>

    <!-- StudentMapper缓存 -->
    <cache
            name="com.liuzhuo.mapper.StudentMapper"
            maxElementsInMemory="1000"
            eternal="false"
            copyOnRead="true"
            copyOnWrite="true"
            timeToIdleSeconds="5000"
            timeToLiveSeconds="5000"
            diskPersistent="true"
            overflowToDisk="false"
            memoryStoreEvictionPolicy="LRU"/>
</ehcache>
```

---

执行之前的测试方法，会发现：`E:\DEV_ENV\ehcache`目录下会多出几个文件：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190315201938.png"/>

---

### 集成Redis缓存

Redis是一个高性能的 key-value 数据库，之前的博客中有一系列的Redis讲解，大家可以去看看，回顾一下。

Mybatis项目开发者提供了Redis的Mybatis二级缓存实现，该项目名为：`redis-cache`，目前只有beta版，项目地址是：

https://github.com/mybatis/redis-cache

---

（1）添加项目依赖

在pom.xml文件中添加如下依赖：
```
  <dependency>
    <groupId>org.mybatis.caches</groupId>
    <artifactId>mybatis-redis</artifactId>
    <version>1.0.0-beta2</version>
  </dependency>
```

mybatis-redis 目前只有beta版本。

（2）配置Redis

使用Redis前，必须有一个Redis服务，有关Redis安装启动的相关内容，请看我之前的博客。

参考地址：https://redis.io/topics/quickstart

Redis服务启动后，在 src/main/resources 目录下新增redis.properties文件。

```
host=localhost
port=6379
connectionTimeout=5000
soTimeout=5000
password=
database=0
clientName=
```

上面这几项是redis-cache项目提供的可以配置的参数，这里配置了服务器地址、端口号和超时时间。

（3）修改StudentMapper.xml中的缓存配置

redis-cache 提供了1个 MyBatis 缓存实现， `org.mybatis.caches.redis.RedisCache`。

```
<mapper namespace="com.liuzhuo.mapper.StudentMapper">

    <cache type="org.mybatis.caches.redis.RedisCache"/>

	<!--其他配置-->
</mapper>
```

配置很简单，RedisCache在保存缓存数据和获取缓存数据时，使用了Java的序列化和反序列化，因此还需要保证被缓存的对象必须实现Serializable接口。

Redis缓存并不会因为应用的关闭而失效。

---

当需要分布式部署应用时，如果使用Mybatis自带缓存或基础的EhCache缓存，分布式应用会各自拥有自己的缓存，它们之间不会共享缓存，这种方式会消耗更多的服务器资源。如果使用类似Redis的缓存服务，就可以将分布式应用连接到同一个缓存服务器，实现分布式应用间的缓存共享。

---

### 二级缓存适用场景

二级缓存虽然好处很多，但并不是什么时候都可以使用。在以下场景中，推荐使用二级缓存。

* 以查询为主的应用中，只有尽可能少的增、删、改操作。

* 绝大多数以单表操作存在时，由于很少存在互相关联的情况，因此不会出现脏数据。

* 可以按业务划分对表进行分组时，如关联的表比较少时，可以通过参照缓存进行配置。

除了推荐使用的情况，如果脏读对系统没有影响，也可以考虑使用。在无法保证数据不出现脏读的情况下，建议在业务层使用可控制的缓存代替二级缓存。

