---
title: Spring Boot与缓存
categories:
  - SpringBoot
  - 缓存
tags:
  - SpringBoot
  - 缓存
date: 2018-11-13 10:27:48
summary: JSR-107、Spring缓存抽象、整合Redis
---

JSR-107、Spring缓存抽象、整合Redis
<!--more-->

## JSR107

Java Caching定义了5个核心接口，分别是CachingProvider, CacheManager, Cache, Entry 和 Expiry。

1. CachingProvider：定义了创建、配置、获取、管理和控制多个CacheManager。一个应用可
以在运行期访问多个CachingProvider。

2. CacheManager定义了创建、配置、获取、管理和控制多个唯一命名的Cache，这些Cache
存在于CacheManager的上下文中。一个CacheManager仅被一个CachingProvider所拥有。

3. Cache是一个类似Map的数据结构并临时存储以Key为索引的值。一个Cache仅被一个
CacheManager所拥有。

4. Entry 是一个存储在Cache中的key-value对。

5. Expiry 每一个存储在Cache中的条目有一个定义的有效期。一旦超过这个时间，条目为过期
的状态。一旦过期，条目将不可访问、更新和删除。缓存有效期可以通过ExpiryPolicy设置。

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113103324.png"/>

JSR107:定义的缓存规范，比较复杂，一般我们很少使用，接下来我们看看Spring的缓存抽象。

## Spring缓存抽象

Spring从3.1开始定义了org.springframework.cache.**Cache**和org.springframework.cache.**CacheManager**接口来统一不同的缓存技术；并支持使用JCache（JSR-107）**注解**简化我们开发；

- Cache接口为缓存的组件规范定义，包含缓存的各种操作集合；

- Cache接口下Spring提供了各种xxxCache的实现；如RedisCache，EhCacheCache,ConcurrentMapCache等；

- 每次调用需要缓存功能的方法时，Spring会检查检查指定参数的指定的目标方法是否已经被调用过；如果有就直接从缓存中获取方法调用后的结果，如果没有就调用方法并缓存结果后返回给用户。下次调用直接从缓存中获取。

- 使用Spring缓存抽象时我们需要关注以下两点；

　　1.确定方法需要被缓存以及他们的缓存策略

　　2.从缓存中读取之前缓存存储的数据

---

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113103919.png"/>

## 几个重要概念&缓存注解
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113104138.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113104254.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113104630.png"/>

## 缓存使用

1. 引入spring-boot-starter-cache模块

2. @EnableCaching开启缓存

3. 使用缓存注解

4. 切换为其他缓存

---

### 搭建基本环境

1）导入数据库文件，创建出department和employee表：

打开Navicat：mysql客户端。创建本地的数据库spring_cache

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113114130.png"/>

将spring_cache.sql文件导入到spring_cache数据库中

spring_cache.sql:

```
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for department
-- ----------------------------
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `departmentName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for employee
-- ----------------------------
DROP TABLE IF EXISTS `employee`;
CREATE TABLE `employee` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lastName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` int(2) DEFAULT NULL,
  `d_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

```
导入成功后，会生成 department和employee表。（大家实在不会，手动创建也行）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113114431.png"/>

2）打开idea创建Springboot项目。选择cache、web、mysql、mybatis模块
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113115000.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113115035.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113115102.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113115139.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113150553.png"/>

3）创建对应的 javaBean对象：（ department 和 employee ）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113150738.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113150806.png"/>

4）配置数据库信息

在application配置文件中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113151529.png"/>
```
#数据库连接
spring.datasource.url=jdbc:mysql://localhost:3306/spring_cache
spring.datasource.username=root
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.jdbc.Driver

#mybatis的驼峰命令:dId=d_id
mybatis.configuration.map-underscore-to-camel-case=true
```

5) 整合mybatis

创建mapper包：并创建 DepartmentMapper 和 EmployeeMapper

如果不清楚Mybatis与Springboot的整合，去看Springboot的基础里面的数据部分。[Mybatis整合](https://gakkil.top/2018/11/11/SpringBoot-day-08/#%E6%95%B4%E5%90%88MyBatis)

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113152057.png"/>

```
@Mapper
public interface EmployeeMapper {

    //获取Employee对象
    @Select("select * from employee where id =#{id}")
    public Employee getEmployeeById(Integer id);

    //更新Employee对象
    @Update("update employee set lastName=#{lastName},email=#{email},gender=#{gender},d_id=#{dId} where id=#{id}")
    public Employee updateEmployee(Employee employee);

    //删除employee对象
    @Delete("delete from employee where id=#{id}")
    public void deleteEmployeeById(Integer id);

    //增加employee对象
    @Insert("insert into employee(lastName,email,gender,d_id) values(#{lastName},#{email},#{gender},#{dId})")
    public void insertEmployee(Employee employee);

}

```

6) 编写service和controller层：

EmployeeService：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113153826.png"/>

EmployeeController：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113154057.png"/>

7）启动应用，验证我们的应用是否成功：

然后在我们的数据库中，随便手动插入一条数据：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113155237.png"/>


在浏览器中输入：`http://localhost:8080/empl/1`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113155303.png"/>

**PS：如果控制台出现Establishing SSL警告**：是因为在MYSQL5.5.45+, 5.6.26+ and 5.7.6+版本中需要携带服务器身份验证的SSL连接。
解决办法：
1）在数据库连接的url中添加useSSL=false;（不使用ssl连接）
2）url中添加useSSL=true，并且提供服务器的验证证书。

我们这里就直接不使用了，在url后面加上？useSSL=false即可。
`spring.datasource.url=jdbc:mysql://localhost:3306/spring_cache?useSSL=false`

### 缓存的快速体验

步骤：

1）开启缓存的注解，@EnableCaching
2）使用缓存的注解来添加缓存的功能

---

在没有使用缓存的时候，每次发送请求都会到数据库中，查询数据：
现在，给EmployeeService添加输出语句：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113162215.png"/>
修改日志的级别：
logging.level.com.liuzhuo.cache=debug

启动Springboot应用：在浏览器中输入：`http://localhost:8080/empl/1`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113162510.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113162536.png"/>

刷新页面，还是会打印出 输出语句 和 sql的查询信息。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113162657.png"/>

---

使用缓存：

1）给启动类上面，加上@EnableCaching
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113162019.png"/>

2）给 EmployeeService 中 findEmployeeById 方法添加缓存的注解:( @Cacheable ）
```
@Service
public class EmployeeService {

    @Autowired
    private EmployeeMapper employeeMapper;

    //获取Employee对象

    /**
     *  Cacheable:查询时候缓存，第一次会到数据库中查询数据，以后都只会到
     *  缓存中获取数据。
     *  几个重要的属性：
     *   1）cacheName/value: 指定缓存组件的名字。
     *   2）key：缓存数据使用的key。默认是使用方法参数的值，比如这里id=1的话，默认key=1
     *           可以使用SpEl表达式：#id获取的参数的值，#a0 #p0都是获取第一个参数的值
     *           #root.args[0]:也是获取第一个参数的值
     *   3）keyGenerator:key的生成器，可以自己指定key的生成器的组件的id
     *            key或keyGenerator：二选一
     *   4) cacheManager:指定缓存管理器
     *   5) cacheResolver:指定缓存解析器。和cacheManager二选一
     *   6) condition:指定符合条件的情况下，才缓存数据.
     *             可以使用SpEl表达式：condition="#id>5"
     *   7) unless:否定缓存，与condition作用相反
     *   8) sync:是否使用异步模式
     */
    @Cacheable
    public Employee findEmployeeById(Integer id) {
        System.out.println("查询:"+id+"号的信息");
        return employeeMapper.getEmployeeById(id);
    }
}
```

3）启动SpringBoot应用：

在浏览器中输入：`http://localhost:8080/empl/1`

只有第一次会打印 输出语句。之后都不会打印输出语句，说明数据已经被缓存到缓存当中了。

---

### SpringBoot的缓存原理：

1）打开CacheAutoConfiguration：

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113171128.png"/>

2）观察导入@Import(CacheConfigurationImportSelector.class)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113171308.png"/>

3）CacheConfigurationImportSelector帮我们缓存了哪些类呢？

打上断点，debug一下：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113171503.png"/>
```
org.springframework.boot.autoconfigure.cache.GenericCacheConfiguration
org.springframework.boot.autoconfigure.cache.JCacheCacheConfiguration
org.springframework.boot.autoconfigure.cache.EhCacheCacheConfiguration
org.springframework.boot.autoconfigure.cache.HazelcastCacheConfiguration
org.springframework.boot.autoconfigure.cache.InfinispanCacheConfiguration
org.springframework.boot.autoconfigure.cache.CouchbaseCacheConfiguration
org.springframework.boot.autoconfigure.cache.RedisCacheConfiguration
org.springframework.boot.autoconfigure.cache.CaffeineCacheConfiguration
org.springframework.boot.autoconfigure.cache.GuavaCacheConfiguration
org.springframework.boot.autoconfigure.cache.SimpleCacheConfiguration
org.springframework.boot.autoconfigure.cache.NoOpCacheConfiguration
```
4)而注入的这里类，哪些会生效呢？

Application配置：debug=true.

发现：只有 SimpleCacheConfiguration 生效。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113171946.png"/>

5）SimpleCacheConfiguration给容器中注入了一个cacheManager：ConcurrentMapCacheManager
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113172101.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113172457.png"/>

6）ConcurrentMapCacheManager：实质上就是一个ConcurrentHashMap。

然后使用ConcurrentMapCache（实质ConcurrentMap）将数据保存在ConcurrentMap中。

---

### 缓存的运行流程

给 EmployeeService 的 findEmployeeById 方法 打上断点：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113173709.png"/>

给 ConcurrentMapCacheManager getCache 方法 打上断点：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113173817.png"/>

给 ConcurrentMapCache 的lookup、get、set 打上断点：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113173929.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113173941.png"/>

debug运行一下：

在浏览器中输入：`http://localhost:8080/empl/1`

进入断点处：

当首次进入该方法时，不会执行该方法，会先进入缓存中获取数据
根据 cacheNames/value 来获取cache。
这里 cacheNames='empl'
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113183208.png"/>

第一次查询，名称为empl的'cache'一定是null，所以会创建名称为'empl'的cache
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113183458.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113183641.png"/>

创建'empl'的cache成功后，这里的cache就是ConcurrentMapCache，放到ConcurrentMapCacheManager中。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113183804.png"/>

然后在ConcurrentMapCache中，寻找key等于我们默认参数值的value值：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113184208.png"/>

没有找key=1的缓存值，所以执行 findEmployeeById 方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113184329.png"/>

从数据库中获取数据，将数据放到缓存当中。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113184515.png"/>

---

当再次，刷新页面时。

name='empl'的cache已经存在了
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113184712.png"/>

然后在name='empl'的cache中寻找key=1的缓存：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113184920.png"/>

然后直接就找到了key=1的缓存了，直接返回对象，不在执行 findEmployeeById 方法了。

直接来了到控制层，return语句，返回视图。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113185435.png"/>

**总结：@cacheable标注的方法执行之前，先来检查缓存中有么有我们的定义的name的cache缓存，按照默认的key生成策略的值去查询对应的缓存，如果没有就运行该方法，并放入缓存中。以后调用就直接使用缓存中的数据。**

核心：

1）使用cacheManager[ConcurrentMapCacheManager]按照名字name来获取cache[ConcurrentMapCache]组件

2）key使用keyGenerator生成的，默认是SimpleGenerator。

3）cache使用生成的key来获取缓存或者放入缓存当中。


### @Cacheable属性的使用

1）cacheNames/value: 指定缓存组件的名字。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113192119.png"/>

是数组的属性，所以是花括号的形式：cacheNames = {"empl"} 或 value={"empl"}

2）key：缓存数据使用的key。

默认是使用方法参数的值，比如这里id的值为1的话，key就等于1
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113192337.png"/>

多个参数的话，key默认就是 SimpleKey [参数值1，参数值2]

SimpleKey [1,jack]
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113192725.png"/>


还可以使用SpEl表达式：

`#id获取的参数的值。id就是参数的名字`：key=1.

`#a0、#p0 都是获取第一个参数的值，#a1 就是获取第二参数的值`


 `#root.args[0]:也是获取第一个参数的值`

举例：如果想要生成 方法名+参数值 的 key。比如这里的 findEmployeeById[1]

key = "#root.methodName+'['+#id+']'"
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113193620.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113193828.png"/>




3）keyGenerator: key的生成器，可以自己指定key的生成器的组件的id

**key 或 keyGenerator：二选一**

现在在config下，创建CacheConfig类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113194259.png"/>
```
@Configuration
public class CacheConfig {

    @Bean("myKeyGenerator")
    public KeyGenerator keyGenerator(){
        return new KeyGenerator() {
            @Override
            public Object generate(Object o, Method method, Object... objects) {
                return method.getName()+"["+ Arrays.asList(objects)+"]";
            }
        };
    }
}
```
注意这里的 KeyGenerator：org.springframework.cache.interceptor.KeyGenerator

然后，在 keyGenerator = "myKeyGenerator" ：填写key的生成器的bean的id
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113194347.png"/>

debug下：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113194813.png"/>


4) cacheManager:指定缓存管理器

 以后整合其他缓存框架时，使用。

5) cacheResolver:指定缓存解析器。和cacheManager二选一


6) condition:指定符合条件的情况下，才缓存数据.

可以使用SpEl表达式：condition="#id>5". 当参数值大于5时，才会缓存数据。

7) unless:否定缓存，**与condition作用相反**

unless = "#id<2" 的话，就是参数值小于2时，不缓存

8) sync:是否使用异步模式

不过，当使用sync的话，unless是不能使用的。

### @CachePut的使用

@CachePut：是用来更新缓存的，始终是先执行方法，然后更新缓存。

1）在 EmployeeService 添加 更新employee的方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113204129.png"/>

2）在 EmployeeController 添加 更新employee的映射方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113203603.png"/>

3）启动程序。

首先：输入：`http://localhost:8080/empl/1` : 查询1号员工的信息
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113203724.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113203745.png"/>

再次，访问1号员工的信息：

控制台，什么也不打印，但是界面有数据，说明，我们缓存数据成功！


现在，我们修改1号员工的信息：输入：`http://localhost:8080/empl?id=1&lastName=zhangsan&gender=0`

我们就修改了性别，从1变成0.
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113204245.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113204305.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113204337.png"/>

更新成功！！！

---

现在，我们再次，访问1号员工的信息，是从缓存中取？还是从数据库中取呢？如果从缓存中取，是旧的数据，还是新的数据？

反正，我们的最终目的是现在获取更新后的1号员工的信息。

我们来，测试一下，访问1号员工的信息：`http://localhost:8080/empl/1`

发现，控制台没有打印输出语句，说明现在还是从缓存中取数据。但是好像返回的数据是旧的？
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113204707.png"/>

这是为啥呢？ 因为，虽然我们的获取缓存的名字 和 更新缓存的缓存的名字 都是empl。但是key不同呀！！！
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113204927.png"/>

所以，现在名字为'empl'的cache中，有两个缓存，一个是key=1的缓存，另一个key=employee值的缓存。所以现在获取的是key=1的缓存(旧的数据)

**要想达到我们想要的效果，必须key一致！！！**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113205251.png"/>

**注意：@Cacheable的key，不能使用#result，因为@Cacheable是先执行缓存，再执行方法，而@CachePut总是先执行方法，再执行缓存。**

---

重启应用，再次测试一次：

先访问1号员工：`http://localhost:8080/empl/1`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113205902.png"/>


再修改1号员工：`http://localhost:8080/empl?id=1&lastName=张三&gender=0&email=zhangsan@qq.com`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113205710.png"/>

再次访问1号员工：`http://localhost:8080/empl/1`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113205937.png"/>

到达，我们的效果！！！

**注意：这里我们的缓存的name是一致的，都是'empl'才行，如果你更改了name，不一致的话，效果就达不到了，原因， 你懂的**

**PS：如果张三在数据库中看是乱码的话，需要在数据库连接中添加 &characterEncoding=utf-8：**

**spring.datasource.url=jdbc:mysql://localhost:3306/spring_cache?useSSL=false&characterEncoding=utf-8**

### @CacheEvict的使用

@CacheEvict：是用来删除缓存的。

通过key：来删除指定的缓存。

allEntries = true. 删除所有的缓存，默认是为false。
当allEntries = true，就不用指定key了。

beforeInvocation = true。先清空缓存，再执行方法。默认是为false。
作用：默认情况下，当方法出现异常，缓存就不会清除。当beforeInvocation = true时，不管方法是否出现异常，都会清除缓存。 

### @Caching的使用

@Caching：组合注解：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113213321.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113213634.png"/>

### @CacheConfig的使用

@CacheConfig：是作用在**类上面的**，相当于全局配置。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181113213950.png"/>

此时，就不需要在每个方法上的缓存注解中，写cacheNames='empl'. 如果写了，就使用方法上面的cacheNames。

## 整合Redis缓存

### 搭建redis环境

1）使用我们安装的虚拟机工具安装Redis

如果不清楚的话，看之前的SpringBoot基础篇，[docker学习](https://gakkil.top/2018/11/09/SpringBoot-day-07/#%E5%AE%89%E8%A3%85linux%E8%99%9A%E6%8B%9F%E6%9C%BA)

打开虚拟机：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114100415.png"/>

打开连接虚拟机的客户端：SmarTTY
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114100537.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114100653.png"/>

在docker hub中搜索Redis的镜像
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114101037.png"/>

docker官方的镜像在国外，下载镜像会很慢，所以使用国内的docker镜像：https://www.docker-cn.com/
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114101241.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114101523.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114101749.png"/>

运行我们下载的redis镜像：
```
docker run -d -p 6379:6379 --name myredis registry.docker-cn.com/library/redis
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114102027.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114102152.png"/>

2) 打开redis的客户端：RedisDesktopManager（自行下载）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114102449.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114102754.png"/>

默认redis：16个数据库
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114102848.png"/>

3）简单试试redis的命令

在myredis上面，右键选择：Console
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114103104.png"/>

打开redis中文网：http://www.redis.cn/
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114103332.png"/>

以String类型为例：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114103450.png"/>

其他命令，请读者自行学习啦~

### 整合redis

SpringBoot，默认的配置类是：SimpleCacheConfiguration

默认使用的CacheManager：ConcurrentMapCacheManager

默认使用的Cache：ConcurrentMapCache

现在，整合redis到SpringBoot中。

1）导入redis的stars依赖

```
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
```

2) 在Application配置文件中，添加redis的连接
```
#设置redis的连接
spring.redis.host=10.6.11.17
```

这里的 host: 写你自己的虚拟机的ip地址。

3）打开RedisAutoConfiguration
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114115036.png"/>

发现：导入了两个模板类，方便我们操作。

4）在SpringBoot01CacheApplicationTests类中：
```
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringBoot01CacheApplicationTests {

	@Autowired
	private EmployeeMapper employeeMapper;

	@Autowired
	private RedisTemplate redisTemplate;  //操作k-v，都是对象的

	@Autowired
	private StringRedisTemplate stringRedisTemplate; //操作k-v：k是字符串的

	/**
	 * redis:5种数据结构：
	 * 字符串String，list（列表），hash（哈希），set（集合），ZSet（有序集合）
	 * opsForValue()：String
	 * opsForList():list
	 * opsForHash():hash
	 * opsForSet():set
	 * opsForZSet():ZSet
	 */
	@Test
	public void test01(){
		stringRedisTemplate.opsForValue().append("mgs","hello");
	}


	@Test
	public void contextLoads() {
	}

}
```

清空：redis中的数据。执行test01
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114115954.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114120032.png"/>

其他命令，自行执行测试。

现在测试RedisTemplate：

```
    @Test
    public void test02() {
        Employee employee = employeeMapper.getEmployeeById(1);
        //将对象放入到redis中
        redisTemplate.opsForValue().set("empl", employee);

    }
```

运行测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114125203.png"/>

出现无法序列化异常，因为对象保存到redis中，是以序列化的形式。而我们的Employee没有实现序列化。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114125342.png"/>

再次运行：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114125447.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114125504.png"/>

虽然成功了，但是是序列化的形式，看着不爽。

默认是jdk的序列化形式：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114125648.png"/>

我们可以自定义自己的序列化方式：

使用我们自己的redis模板，设置自己的json的序列化形式：

在config包下：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114130144.png"/>

```
@Configuration
public class RedisConfig {

    @Bean("myRedisTemplate")
    public RedisTemplate<Object, Employee> redisTemplate(
            RedisConnectionFactory redisConnectionFactory)
            throws UnknownHostException {
        RedisTemplate<Object, Employee> template = new RedisTemplate<Object, Employee>();
        template.setConnectionFactory(redisConnectionFactory);
        //使用json的序列化
        Jackson2JsonRedisSerializer<Employee> redisSerializer = new Jackson2JsonRedisSerializer<Employee>(Employee.class);
        template.setDefaultSerializer(redisSerializer);
        return template;
    }
}
```

使用自己的redis模板：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114130400.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114130459.png"/>

运行test03方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114130554.png"/>

以上我们的redis已经整合成功了。

---

### 使用redis缓存

我们知道，SpringBoot默认使用：SimpleCacheConfiguration

导入redis-starter后，就会使用 RedisAutoConfiguration。

然后默认使用：RedisTemplate模板。

现在直接启动SpringBoot应用：

在浏览器中输入：`http://localhost:8080/empl/1`

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114133854.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114133941.png"/>

再次输入：`http://localhost:8080/empl/1`

会从缓存中获取数据，控制台不会打印sql语句。

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114134141.png"/>

不是我们想要的序列化形式：

我们需要自己配置RedisCacheManager：

打开：RedisCacheConfiguration类：

发现默认的RedisCacheManager：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114194646.png"/>

现在在我们的RedisConfig类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114195041.png"/>
```
@Configuration
public class RedisConfig {

    @Bean("employeeRedisTemplate")
    public RedisTemplate<Object, Employee> employeeRedisTemplate(
            RedisConnectionFactory redisConnectionFactory)
            throws UnknownHostException {
        RedisTemplate<Object, Employee> template = new RedisTemplate<Object, Employee>();
        template.setConnectionFactory(redisConnectionFactory);
        Jackson2JsonRedisSerializer<Employee> redisSerializer = new Jackson2JsonRedisSerializer<Employee>(Employee.class);
        template.setDefaultSerializer(redisSerializer);
        return template;
    }

    @Bean
    public RedisCacheManager cacheManager(RedisTemplate<Object, Employee> employeeRedisTemplate) {
        RedisCacheManager cacheManager = new RedisCacheManager(employeeRedisTemplate);
        //设置是否使用前缀，前缀就是cacheNames。
        cacheManager.setUsePrefix(true);

        return cacheManager;
    }
}
```

我们配置了自己的RedisCacheManager，默认的就会失效，因为：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114200708.png"/>


现在，我们使用department来测试：编写departmentMapper，departmentService，departmentController：

DepartmentMapper：
```
@Mapper
public interface DepartmentMapper {

    @Select("select * from department where id=#{id}")
    public Department getDeptById(Integer id);
}
```

DepartmentService:
```
@Service
public class DepartmentService {

    @Autowired
    private DepartmentMapper departmentMapper;

    @Cacheable(cacheNames = "dept")
    public Department getDeptById(Integer id){
        return departmentMapper.getDeptById(id);
    }
}
```

DepartmentController:
```
@RestController
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @GetMapping("/dept/{id}")
    public Department getDeptById(@PathVariable("id") Integer id) {
        return departmentService.getDeptById(id);
    }
}
```

启动应用：

清空redis数据库。

在浏览器中输入：`http://localhost:8080/empl/1`

第一次查询，会从数据库中查询数据，然后放到缓存中。

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114200147.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114200157.png"/>

此时redis数据库中，是以json啦来序列化的。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114200358.png"/>

再次：访问`http://localhost:8080/empl/1`，控制台不会打印sql语句，说明是从缓存中取的。

现在，我们来测试department。在mysql客户端中，自己手动插入一条数据：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114201053.png"/>


在浏览器中输入：`http://localhost:8080/dept/1`

第一次，会从数据库中获取数据。控制台打印sql语句。将数据放到redis缓存中。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114201003.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114201147.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114201226.png"/>

当再次访问：`http://localhost:8080/dept/1`，照理应该会把department的json数据反序列化到前端，不到mysql数据库中查找。

但是出错了！！！
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114201422.png"/>

看出错的异常，是我们居然是把department的json数据反序列化到employee对象上面，当然出错呀！

打开我们的cacheConfig类：
```
@Configuration
public class RedisConfig {

    @Bean("employeeRedisTemplate")
    public RedisTemplate<Object, Employee> employeeRedisTemplate(
            RedisConnectionFactory redisConnectionFactory)
            throws UnknownHostException {
        RedisTemplate<Object, Employee> template = new RedisTemplate<Object, Employee>();
        template.setConnectionFactory(redisConnectionFactory);
        Jackson2JsonRedisSerializer<Employee> redisSerializer = new Jackson2JsonRedisSerializer<Employee>(Employee.class);
        template.setDefaultSerializer(redisSerializer);
        return template;
    }

    @Bean
    public RedisCacheManager cacheManager(RedisTemplate<Object, Employee> employeeRedisTemplate) {
        RedisCacheManager cacheManager = new RedisCacheManager(employeeRedisTemplate);
        //设置是否使用前缀，前缀就是cacheNames。
        cacheManager.setUsePrefix(true);

        return cacheManager;
    }
}
```

我们的序列化泛型就是Employee对象，所以只能对Employee反序列化成功。

现在添加新的 RedisCacheManager 和 RedisTemplate
```
@Configuration
public class RedisConfig {

    @Bean("employeeRedisTemplate")
    public RedisTemplate<Object, Employee> employeeRedisTemplate(
            RedisConnectionFactory redisConnectionFactory)
            throws UnknownHostException {
        RedisTemplate<Object, Employee> template = new RedisTemplate<Object, Employee>();
        template.setConnectionFactory(redisConnectionFactory);
        Jackson2JsonRedisSerializer<Employee> redisSerializer = new Jackson2JsonRedisSerializer<Employee>(Employee.class);
        template.setDefaultSerializer(redisSerializer);
        return template;
    }

    @Bean("departmentRedisTemplate")
    public RedisTemplate<Object, Department> departmentRedisTemplate(
            RedisConnectionFactory redisConnectionFactory)
            throws UnknownHostException {
        RedisTemplate<Object, Department> template = new RedisTemplate<Object, Department>();
        template.setConnectionFactory(redisConnectionFactory);
        Jackson2JsonRedisSerializer<Department> redisSerializer = new Jackson2JsonRedisSerializer<Department>(Department.class);
        template.setDefaultSerializer(redisSerializer);
        return template;
    }

    @Bean("employeeCacheManager")
    public RedisCacheManager employeeCacheManager(RedisTemplate<Object, Employee> employeeRedisTemplate) {
        RedisCacheManager cacheManager = new RedisCacheManager(employeeRedisTemplate);
        //设置是否使用前缀，前缀就是cacheNames。
        cacheManager.setUsePrefix(true);
        return cacheManager;
    }

    @Bean("departmentCacheManager")
    public RedisCacheManager departmentCacheManager(RedisTemplate<Object, Department> departmentRedisTemplate) {
        RedisCacheManager cacheManager = new RedisCacheManager(departmentRedisTemplate);
        //设置是否使用前缀，前缀就是cacheNames。
        cacheManager.setUsePrefix(true);
        return cacheManager;
    }
}
```

现在在EmployeeService中，设置CacheManager：

在类上面的，@CacheConfig中设置统一的CacheManager
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114202147.png"/>

在DepartmentService：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114202330.png"/>

这样，Employee 和 Department 就会使用各自的CacheManager。

删除Redis中的所有数据。再次测试一下，启动应用。

启动应用的过程中，出错了！你敢信，我们看看
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114202538.png"/>

原来是，我们设置了两个CacheManager，需要确定一个默认的CacheManager。所以我们使用默认的CacheManager当做默认的。

在redisConfig中：
```
@Configuration
public class RedisConfig {

    @Bean("employeeRedisTemplate")
    public RedisTemplate<Object, Employee> employeeRedisTemplate(
            RedisConnectionFactory redisConnectionFactory)
            throws UnknownHostException {
        RedisTemplate<Object, Employee> template = new RedisTemplate<Object, Employee>();
        template.setConnectionFactory(redisConnectionFactory);
        Jackson2JsonRedisSerializer<Employee> redisSerializer = new Jackson2JsonRedisSerializer<Employee>(Employee.class);
        template.setDefaultSerializer(redisSerializer);
        return template;
    }

    @Bean("departmentRedisTemplate")
    public RedisTemplate<Object, Department> departmentRedisTemplate(
            RedisConnectionFactory redisConnectionFactory)
            throws UnknownHostException {
        RedisTemplate<Object, Department> template = new RedisTemplate<Object, Department>();
        template.setConnectionFactory(redisConnectionFactory);
        Jackson2JsonRedisSerializer<Department> redisSerializer = new Jackson2JsonRedisSerializer<Department>(Department.class);
        template.setDefaultSerializer(redisSerializer);
        return template;
    }

    @Bean("employeeCacheManager")
    public RedisCacheManager employeeCacheManager(RedisTemplate<Object, Employee> employeeRedisTemplate) {
        RedisCacheManager cacheManager = new RedisCacheManager(employeeRedisTemplate);
        //设置是否使用前缀，前缀就是cacheNames。
        cacheManager.setUsePrefix(true);
        return cacheManager;
    }

    @Bean("departmentCacheManager")
    public RedisCacheManager departmentCacheManager(RedisTemplate<Object, Department> departmentRedisTemplate) {
        RedisCacheManager cacheManager = new RedisCacheManager(departmentRedisTemplate);
        //设置是否使用前缀，前缀就是cacheNames。
        cacheManager.setUsePrefix(true);
        return cacheManager;
    }

    //默认的CacheManager,设置优先级最高
    //即，当不配置cacheManager="xxxx"的时候，就使用这个缓存管理器
    @Primary
    @Bean
    public RedisCacheManager cacheManager(RedisTemplate<Object, Object> redisTemplate) {
        RedisCacheManager cacheManager = new RedisCacheManager(redisTemplate);
        cacheManager.setUsePrefix(true);
        return cacheManager;
    }
}
```

重启应用：

应用启动成功，没有出错。

在浏览器中输入：`http://localhost:8080/empl/1`

控制台打印sql语句，是到mysql数据库查询数据
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114203139.png"/>

再次访问：`http://localhost:8080/empl/1`

控制台不打印sql语句，是从redis缓存中取数据。


在浏览器中输入：`http://localhost:8080/dept/1`

控制台输出sql语句，是到mysql数据库中查询数据
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114203418.png"/>

再次访问：`http://localhost:8080/dept/1`

不报错了，控制台不输出sql语句，是在redi数据库中获取数据。

以上就是整合 redis 到 SpringBoot 中。

---

### 使用编码的方式来使用Redis


以上都是使用注解的方式来使用缓存，现在我们来使用编码的方式来操作缓存。

```
//@CacheConfig(cacheManager = "departmentCacheManager")
@Service
public class DepartmentService {

    @Autowired
    private DepartmentMapper departmentMapper;

    @Autowired
    private RedisTemplate departmentRedisTemplate;

    //@Cacheable(cacheNames = "dept")
    public Department getDeptById(Integer id){
        Department department = departmentMapper.getDeptById(id);
        departmentRedisTemplate.opsForValue().set("dept"+id,"department");
        return department;
    }
}

```

将cahce的注解都注释掉，然后注入departmentRedisTemplate。

自己手动操作缓存。

重启应用，在浏览器中输入：`http://localhost:8080/dept/1`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/cache/QQ截图20181114204406.png"/>



