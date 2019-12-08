---
title: SpringBoot_day_02
categories:
  - SpringBoot
  - Spring
tags:
  - SpringBoot
  - Spring
date: 2018-11-03 10:33:31
summary: Springboot的配置文件
---

Springboot的配置文件

### 配置文件

SpringBoot使用一个全局的配置文件，配置文件名是**固定的**；

- application.properties
- application.yml

配置文件的作用：修改SpringBoot自动配置的默认值；SpringBoot在底层都给我们自动配置好；

xxx.properties文件，我们见的比较多，比较熟悉。

这里讲解yml文件。

YAML（YAML Ain't Markup Language）  
YAML A Markup Language：是一个标记语言  
YAML isn't Markup Language：不是一个标记语言；  

标记语言：  
以前的配置文件；大多都使用的是 xxxx.xml文件；  
YAML：以数据为中心，比json、xml等更适合做配置文件； 

YAML：配置例子  
```
server:
  port: 8081
```

XML：
```
<server>
   <port>8081</port>    
</server>
```

---

1）创建新的Springboot项目，添加web模块即可：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103104435.png"/>

2）在resources下，创建application.yml文件
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103104633.png"/>

3）启动项目
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103104821.png"/>

项目的端口号，修改成为8081.

### YAML语法：

#### 基本语法

``k:(空格)v``：表示一对键值对（**空格必须有**）；

以**空格的缩进**来控制层级关系；只要是左对齐的一列数据，都是同一个层级的

例子：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103105623.png"/>

注意：属性和值也是大小写敏感。

#### 值的写法

##### 字面量：普通的值（数字，字符串，布尔）

k: v：字面量直接来写；

字符串默认不用加上单引号或者双引号；

""：双引号；不会转义字符串里面的特殊字符；特殊字符会作为本身想表示的意思

name: "zhangsan \n lisi"：输出；zhangsan 换行 lisi

''：单引号；会转义特殊字符，特殊字符最终只是一个普通的字符串数据

name: ‘zhangsan \n lisi’：输出；zhangsan \n lisi

##### 对象、Map（属性和值）（键值对）：

k: v：在下一行来写对象的属性和值的关系；注意缩进

对象还是k: v的方式
```
friends:
	lastName: zhangsan        
	age: 20 
```

行内写法：
```
friends: {lastName: zhangsan,age: 18}
```

##### 数组（List、Set）：

用- 值表示数组中的一个元素
```
pets:
 ‐ cat
 ‐ dog
 ‐ pig
```

行内写法:
```
pets: [cat,dog,pig]
```

### 配置文件值注入

#### 使用@ConfigurationProperties注解

1) 在根包下，创建bean包，并创建Person和Dog类：
```java
public class Person {

    private String lastName;
    private Integer age;
    private Boolean boss;
    private Date birth;
    private Map<String, Object> maps;
    private List<Object> lists;
    private Dog dog;

   ····
}
```

```java
public class Dog {

    private String name;
    private Integer age;

    ····
}
```

其中省略了，get、set、tostring的方法。

2）给application.yml文件赋值：
```
person:
  lastName: zhangSan
  age: 18
  boss: true
  birth: 2018/11/11
  maps: {k1: v1,k2: v2}
  lists:
    - list1
    - list2
  dog:
    name: 小狗
    age: 2
```

3) 给Person类添加@ConfigurationProperties注解
```java
/**
 * 描述:
 *
 * @ConfigurationProperties: 配置文件的属性映射
 * prefix：前缀。
 */
@ConfigurationProperties(prefix = "person")
public class Person {
```

4) 测试：
在test包下，有一个测试类：
SpringBoot02ConfigApplicationTests

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringBoot02ConfigApplicationTests
```
@RunWith(SpringRunner.class):使用Spring的测试驱动
@SpringBootTest：使用Springboot的测试

不再使用Junit测试，Spring的测试驱动，更加方便，可以使用自动注入什么的。

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringBoot02ConfigApplicationTests {

    @Autowired
    private Person person;

    @Test
    public void contextLoads() {
        System.out.println(person);
    }

}
```

这里：`private Person person;` 会报错，因为我们的Person类没有注入到容器中，所以，我们还需要在Person类上面，加上@Component注解。
```java
@Component
@ConfigurationProperties(prefix = "person")
public class Person 
```

运行测试：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103114614.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103114704.png"/>

在控制台，看到到了Person类的属性注入成功了。

**PS：想要在yml文件中书写时，有提示，我们可以加入配置文件处理器依赖：**
```java
        <!--配置文件处理器，会给出提示-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103115009.png"/>

在yml配置文件中，person属性下：Alt+/ 会出Person类中还没有配置的属性。

**使用提示出现的属性，比如lastName，会是last-name的样子，都是一样的。-n 就相当于大写的N。**

---

接下来，使用properties文件配置Person类：

将yml文件中的Person配置注释掉

在properties文件中：
```
#idea中的properties文件是UTF-8的编码，而我们需要转换成ASCII编码
#给person配置属性值
person.last-name=张三
person.age=20
person.boss=false
person.birth=2018/11/03
person.maps.k1=v1
person.maps.k2=v2
person.lists=a,b,c
person.dog.name=dog
person.dog.age=2
```

运行测试：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103120508.png"/>
此时出现了中文乱码的现象。

这是因为idea默认是使用utf-8的编码，不会转义成ascii。

打开idea的settings：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103120858.png"/>

再次运行测试：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103120952.png"/>

---

#### 使用@Value注解

除了使用@ConfigurationProperties注解来给属性赋值，我们还知道可以使用Spring的@Value注解。

```java
@Component
public class Person {
    /**
     * <bean class="Person">
     *      <property name="lastName" value="字面量/${key}从环境变量、配置文件中获取值/#{SpEL}"></property>
     * <bean/>
     */
    @Value("${person.last‐name}")
    private String lastName;
    @Value("#{11*2}")
    private Integer age;
    @Value("true")
    private Boolean boss;
    private Date birth;
    private Map<String,Object> maps;
    private List<Object> lists;
    private Dog dog;
```
**@Value获取值 和 @ConfigurationProperties获取值比较**

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103122845.png"/>

这里的松散绑定的意思是，lastName，last-name,last_name都可以在@ConfigurationProperties中使用，但是在@Value中，必须一模一样，比如：

在Person类中：
@Value("${person.last-name}")

在properties配置文件中，必须是：
person.last-name=张三

JSR303数据校验的意思是：
```java
@Component
@ConfigurationProperties(prefix = "person")
@Validated
public class Person {

    @Email
    private String lastName;
```

在Person类上，添加@Validated注解，开启数据校验的功能，然后在Person的属性上面，添加@Email、等其他注解，就可以提供数据校验的功能。

复杂类型封装的意思是：
比如：
使用@ConfigurationProperties(prefix = "person")后，map类型的数据：
在配置文件中：maps: {k1: v1,k2: v2} 或者 person.maps.k1=v1，person.maps.k2=v2

然后自动就绑定上了，但是使用@Value注解，就不行。

@Value注入复杂的属性值：

1）使用util标签
```java
@Component
public class Properties {
 
	@Value("#{testPro}")
	private Properties pros;
 
	@Value("#{testList}")
	private List<String> myList;
 
	@Value("#{testMap}")
	private Map<Integer, String> myMap;

```
```
<!-- applicationContext.xml -->	
<!-- 扫描测试属性包中的类，要注入属性类需要被Spring管理 -->
<context:component-scan base-package="com.xy.test2" />
 
<!-- properties -->
<util:properties id="testPro" location="classpath:info/info2.properties" />
 
<!-- list -->
<util:list id="testList" list-class="java.util.ArrayList">
	<value>first</value>
	<value>second</value>
	<value>third</value>
</util:list>
 
<!-- map -->
<util:map id="testMap" map-class="java.util.HashMap">
	<entry key="1" value="first" />
	<entry key="2" value="second" />
	<entry key="3" value="third" />
</util:map>

```

2) 直接使用xml的形式来注入复杂的数据类型：

下边的一个java类包含了所有Map、Set、List、数组、属性集合等这些容器，主要用于演示Spring的注入配置；
```

package com.lc.collection;
 
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
 
public class Department {
 
	private String name;
	private String [] empName;//数组
	private List<Employee> empList;//list集合
	private Set<Employee> empsets;//set集合
	private Map<String,Employee> empMaps;//map集合
	private Properties pp;//Properties的使用
 
	
	public Set<Employee> getEmpsets() {
		return empsets;
	}
	public void setEmpsets(Set<Employee> empsets) {
		this.empsets = empsets;
	}
	public String[] getEmpName() {
		return empName;
	}
	public void setEmpName(String[] empName) {
		this.empName = empName;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<Employee> getEmpList() {
		return empList;
	}
	public void setEmpList(List<Employee> empList) {
		this.empList = empList;
	}
	public Map<String, Employee> getEmpMaps() {
		return empMaps;
	}
	public void setEmpMaps(Map<String, Employee> empMaps) {
		this.empMaps = empMaps;
	}
	public Properties getPp() {
		return pp;
	}
	public void setPp(Properties pp) {
		this.pp = pp;
	}
 
}
```

Spring配置文件beans.xml文件:
```
<?xml version="1.0" encoding="utf-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xmlns:context="http://www.springframework.org/schema/context"
		xmlns:tx="http://www.springframework.org/schema/tx"
		xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
				http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-2.5.xsd
				http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-2.5.xsd">
 
<bean id="department" class="com.hsp.collection.Department">
<property name="name" value="财务部"/>
 
<!-- 给数组注入值 -->
<property name="empName">
	<list>
		<value>小明</value>
		<value>小明小明</value>
		<value>小明小明小明小明</value>
	</list>
</property>
 
<!-- 给list注入值 ，list中可以有相同的对象 -->
<property name="empList">
	<list>
		<ref bean="emp2" />
		<ref bean="emp1"/>
		<ref bean="emp1"/>
		<ref bean="emp1"/>
		<ref bean="emp1"/>
		<ref bean="emp1"/>
		<ref bean="emp1"/>
	</list>
</property>
 
<!-- 给set注入值， set不能有相同的对象 -->
<property name="empsets">
	<set>
		<ref bean="emp1" />
		<ref bean="emp2"/>
		<ref bean="emp2"/>
		<ref bean="emp2"/>
		<ref bean="emp2"/>
	</set>
</property>
 
<!-- 给map注入值 ，map只有key不一样，就可以装配value -->
<property name="empMaps">
	<map>
		<entry key="11" value-ref="emp1" /> 
		<entry key="22" value-ref="emp2"/>
		<entry key="22" value-ref="emp1"/>
	</map>
</property>
 
<!-- 给属性集合配置 -->
<property name="pp">
	<props>
		<prop key="pp1">abcd</prop>
		<prop key="pp2">hello</prop>
	</props>
</property>
</bean>
 
<bean id="emp1" class="com.hsp.collection.Employee">
	<property name="name" value="北京"/>
	<property name="id" value="1"/>
</bean>
<bean id="emp2" class="com.hsp.collection.Employee">
	<property name="name" value="天津"/>
	<property name="id" value="2"/>
</bean>
 
</beans>
```

---

配置文件yml还是properties他们都能获取到值；

总结：

如果说，我们只是在某个业务逻辑中需要获取一下配置文件中的某项值，使用@Value；
如果说，我们专门编写了一个javaBean来和配置文件进行映射，我们就直接使用@ConfigurationProperties；

#### @PropertySource & @ImportResource & @Bean

@ConfigurationProperties默认加载默认的全局配置中的内容。

但是，我们并不想将所有的配置内容都放在全局的配置文件中，则使用@PropertySource注解。

@PropertySource：加载指定的配置文件。

```java
/**
 * 将配置文件中配置的每一个属性的值，映射到这个组件中
 * @ConfigurationProperties：告诉SpringBoot将本类中的所有属性和配置文件中相关的配置进行绑定；
 *      prefix = "person"：配置文件中哪个下面的所有属性进行一一映射
 *
 * 只有这个组件是容器中的组件，才能使用容器提供的@ConfigurationProperties功能；
 *  @ConfigurationProperties(prefix = "person")默认从全局配置文件中获取值；
 *
 */
@PropertySource(value = {"classpath:person.properties"})
@Component
@ConfigurationProperties(prefix = "person")
public class Person {
   ···
｝
```

@PropertySource(value = {"classpath:person.properties"})：这里指定了在类路径下的person.properties文件中内容映射到本类的属性中。

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103141521.png"/>

**注意：**
再将默认的全局配置文件中的person属性注释掉，因为全局的配置文件的优先级高于自定义的配置文件的优先级。

运行测试类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103141730.png"/>

此时，我们加载的就是自定义person.properties文件中的内容了。


@**ImportResource**：导入Spring的xml配置文件，让配置文件里面的内容生效；

Spring Boot里面没有Spring的xml配置文件，我们自己编写的配置文件，也不能自动识别；
想让Spring的配置文件生效，加载进来；@ImportResource标注在一个配置类上。

在resources下，创建beans.xml文件。
在service下，创建HellService类

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103142248.png"/>

修改测试类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103142451.png"/>

运行测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103142633.png"/>

在Springboot启动类上，加上@ImportResource注解：

因为@SpringBootApplication注解本身也是一个配置类
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103142813.png"/>

再次运行测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103142947.png"/>

**@Bean**

SpringBoot推荐给容器中添加组件的方式；推荐使用全注解的方式

不来编写Spring的xml配置文件。

1）配置类@Configuration------>Spring配置文件

2）使用@Bean给容器中添加组件

在config下，创建一个配置类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103143527.png"/>

去掉SpringBootApplication启动类上的@ImportResource注解；

运行测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103142947.png"/>

---

#### 配置文件占位符

1）随机数

```
${random.value}、${random.int}、${random.long}
${random.int(10)}、${random.int[1024,65536]}
```
比如：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103144510.png"/>

2）占位符获取之前配置的值，如果没有可以是用:指定默认值

```
person.last‐name=张三${random.uuid}
person.age=${random.int}
person.birth=2017/12/15
person.boss=false
person.maps.k1=v1
person.maps.k2=14
person.lists=a,b,c
person.dog.name=${person.hello:hello}_dog
person.dog.age=15
```
这里的person.dog.name使用了${person.hello:hello}_dog，如果${person.hello:hello}之前没有配置，就会使用冒号后面的默认值hello。如果没有写冒号后面的值，即：person.dog.name=${person.hello}_dog。则原样输出。（没有配置${person.hello}的话）。

#### Profile

##### 多Profile文件

我们在主配置文件编写的时候，文件名可以是 application-{profile}.properties/yml

**默认使用application.properties的配置。**

默认的配置文件application.properties：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103150324.png"/>

创建dev配置文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103150535.png"/>

创建prod配置文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103150641.png"/>

启动SpringBoot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103150737.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103150805.png"/>

可以看出，默认启动，application.properties的配置。端口号：8081

##### 激活指定profile

1）在默认配置文件中指定 spring.profiles.active=dev
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103151018.png"/>

启动SpringBoot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103151137.png"/>

端口号：8082.

2）命令行：

java -jar spring-boot-02-config-0.0.1-SNAPSHOT.jar  ``--spring.profiles.active=dev``


<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103151355.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103151622.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103151704.png"/>

端口号是：8083

**激活的是prod，说明命令行参数的优先级 高于 配置文件的激活的优先级。**

3) 虚拟机参数；

``-Dspring.profiles.active=dev``
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103152038.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103152205.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103152225.png"/>

端口号：8082

**激活的是dev。说明虚拟机参数的优先级 高于 配置文件的优先级**

---

**当命令行参数与虚拟机参数同时存在时，以命令行参数为准。**

即：命令行的优先级最高。

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103152736.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103152756.png"/>

端口号是：8083

激活的是prod。

##### yml支持多文档块方式

在yml文件中，支持多文档块方式，即在一个yml文件中，书写多个文件配置。

使用``---``隔开。

首先，注释掉所有的properties文件和启动的命令行与虚拟机参数。

修改yml文件：

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103153342.png"/>

启动SpringBoot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103153506.png"/>

端口号：8084

激活的是dev文件。

#### 配置文件加载位置


springboot 启动会扫描以下位置的application.properties或者application.yml文件作为Spring boot的默认配置文件。

``–file:./config/``
``–file:./``
``–classpath:/config/``
``–classpath:/``

**优先级由高到底，高优先级的配置会覆盖低优先级的配置；**

SpringBoot会从这四个位置全部加载主配置文件；**互补配置。**

**file：代表的是项目的根路径下。**

**classpath：代表的是resources下。**

1）application.properties中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103155025.png"/>
端口号：8081

启动项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103155147.png"/>
端口号启动的也是8081.

2）在resources下创建config包，并创建application.properties文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103155312.png"/>
端口号是：8082

启动项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103155414.png"/>
启动的端口号：8082

3）在项目的根路径下创建application.properties文件：

即：在spring-boot-02-config右键创建文件。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103155603.png"/>
端口号：8083

启动项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103155649.png"/>
启动的端口号：8083

4）在项目的根路径下创建config文件夹，并application.properties文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103155800.png"/>
端口号：8084

启动项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103155859.png"/>
启动的端口号：8084

印证了SpringBoot加载配置文件的优先级。

当四个位置都有配置文件时，是**互补配置的**。

即当高优先级的配置文件中存在低优先级的配置文件中的内容时会覆盖低优先级中的内容，但是当高优先级的配置文件中，没有低优先级文件中的内容时，会直接加载低优先级文件中的内容。

**注意：我们还可以通过spring.config.location来改变默认的配置文件位置**

项目打包好以后，我们可以使用命令行参数的形式，启动项目的时候来指定配置文件的新位置；指定配置文件和默
认加载的这些配置文件共同起作用形成互补配置；

java -jar spring-boot-02-config-02-0.0.1-SNAPSHOT.jar  --spring.config.location=G:/application.properties

此时：G:/application.properties文件的优先级最高，然后互补配置。

#### 外部配置加载顺序

**SpringBoot也可以从以下位置加载配置； 优先级从高到低；高优先级的配置覆盖低优先级的配置，所有的配置会形成互补配置**

<font color="red">1.命令行参数</font>
所有的配置都可以在命令行上进行指定
java -jar spring-boot-02-config-02-0.0.1-SNAPSHOT.jar  ``--server.port=8087  --server.context-path=/abc``

多个配置用空格分开； ``--配置项 = 值`` 

2.来自java:comp/env的JNDI属性

3.Java系统属性（System.getProperties()）

4.操作系统环境变量

5.RandomValuePropertySource配置的random.*属性值

**由jar包外向jar包内进行寻找；**

**优先加载带profile**

<font color="red">6.jar包外部的application-{profile}.properties或application.yml(带spring.profile)配置文件</font>
<font color="red">7.jar包内部的application-{profile}.properties或application.yml(带spring.profile)配置文件</font>

**再来加载不带profile**

<font color="red">8.jar包外部的application.properties或application.yml(不带spring.profile)配置文件</font>
<font color="red">9.jar包内部的application.properties或application.yml(不带spring.profile)配置文件</font>


10.@Configuration注解类上的@PropertySource
11.通过SpringApplication.setDefaultProperties指定的默认属性

所有支持的配置加载来源；

[参考官方文档](https://docs.spring.io/spring-boot/docs/1.5.9.RELEASE/reference/htmlsingle/#boot-features-external-config)

#### 自动配置原理

配置文件到底能写什么？怎么写？自动配置原理；

[配置文件能配置的属性参照](https://docs.spring.io/spring-boot/docs/1.5.9.RELEASE/reference/htmlsingle/#common-application-properties)

##### 自动配置原理：

1）、SpringBoot启动的时候加载主配置类，开启了自动配置功能 **@EnableAutoConfiguration**

2）、@EnableAutoConfiguration 作用：

- 利用EnableAutoConfigurationImportSelector给容器中导入一些组件？
- 可以查看selectImports()方法的内容；
- List configurations = getCandidateConfigurations(annotationMetadata, attributes);获取候选的配置
```java
SpringFactoriesLoader.loadFactoryNames()
扫描所有jar包类路径下  META‐INF/spring.factories
把扫描到的这些文件的内容包装成properties对象
从properties中获取到EnableAutoConfiguration.class类（类名）对应的值，然后把他们添加在容器
中
```

**将类路径下 META-INF/spring.factories 里面配置的所有EnableAutoConfiguration的值加入到了容器中；**

```
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.admin.SpringApplicationAdminJmxAutoConfiguration,\
org.springframework.boot.autoconfigure.aop.AopAutoConfiguration,\
org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration,\
org.springframework.boot.autoconfigure.batch.BatchAutoConfiguration,\
org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration,\
org.springframework.boot.autoconfigure.cassandra.CassandraAutoConfiguration,\
org.springframework.boot.autoconfigure.cloud.CloudAutoConfiguration,\
org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration,\
org.springframework.boot.autoconfigure.context.MessageSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration,\
org.springframework.boot.autoconfigure.couchbase.CouchbaseAutoConfiguration,\
org.springframework.boot.autoconfigure.dao.PersistenceExceptionTranslationAutoConfiguration,\
org.springframework.boot.autoconfigure.data.cassandra.CassandraDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.cassandra.CassandraRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.couchbase.CouchbaseDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.couchbase.CouchbaseRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchAutoConfiguration,\
org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchRepositoriesAutoConfi
guration,\
org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.ldap.LdapDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.ldap.LdapRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.mongo.MongoRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.neo4j.Neo4jRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.solr.SolrRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,\
org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.rest.RepositoryRestMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.data.web.SpringDataWebAutoConfiguration,\
org.springframework.boot.autoconfigure.elasticsearch.jest.JestAutoConfiguration,\
org.springframework.boot.autoconfigure.freemarker.FreeMarkerAutoConfiguration,\
org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration,\
org.springframework.boot.autoconfigure.h2.H2ConsoleAutoConfiguration,\
org.springframework.boot.autoconfigure.hateoas.HypermediaAutoConfiguration,\
org.springframework.boot.autoconfigure.hazelcast.HazelcastAutoConfiguration,\
org.springframework.boot.autoconfigure.hazelcast.HazelcastJpaDependencyAutoConfiguration,\
org.springframework.boot.autoconfigure.info.ProjectInfoAutoConfiguration,\
org.springframework.boot.autoconfigure.integration.IntegrationAutoConfiguration,\
org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.JdbcTemplateAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.JndiDataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.XADataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration,\
org.springframework.boot.autoconfigure.jms.JmsAutoConfiguration,\
org.springframework.boot.autoconfigure.jmx.JmxAutoConfiguration,\
org.springframework.boot.autoconfigure.jms.JndiConnectionFactoryAutoConfiguration,\
org.springframework.boot.autoconfigure.jms.activemq.ActiveMQAutoConfiguration,\
org.springframework.boot.autoconfigure.jms.artemis.ArtemisAutoConfiguration,\
org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration,\
org.springframework.boot.autoconfigure.groovy.template.GroovyTemplateAutoConfiguration,\
org.springframework.boot.autoconfigure.jersey.JerseyAutoConfiguration,\
org.springframework.boot.autoconfigure.jooq.JooqAutoConfiguration,\
org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration,\
org.springframework.boot.autoconfigure.ldap.embedded.EmbeddedLdapAutoConfiguration,\
org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration,\
org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration,\
org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration,\
org.springframework.boot.autoconfigure.mail.MailSenderValidatorAutoConfiguration,\
org.springframework.boot.autoconfigure.mobile.DeviceResolverAutoConfiguration,\
org.springframework.boot.autoconfigure.mobile.DeviceDelegatingViewResolverAutoConfiguration,
\
org.springframework.boot.autoconfigure.mobile.SitePreferenceAutoConfiguration,\
org.springframework.boot.autoconfigure.mongo.embedded.EmbeddedMongoAutoConfiguration,\
org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration,\
org.springframework.boot.autoconfigure.mustache.MustacheAutoConfiguration,\
org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,\
org.springframework.boot.autoconfigure.reactor.ReactorAutoConfiguration,\
org.springframework.boot.autoconfigure.security.SecurityAutoConfiguration,\
org.springframework.boot.autoconfigure.security.SecurityFilterAutoConfiguration,\
org.springframework.boot.autoconfigure.security.FallbackWebSecurityAutoConfiguration,\
org.springframework.boot.autoconfigure.security.oauth2.OAuth2AutoConfiguration,\
org.springframework.boot.autoconfigure.sendgrid.SendGridAutoConfiguration,\
org.springframework.boot.autoconfigure.session.SessionAutoConfiguration,\
org.springframework.boot.autoconfigure.social.SocialWebAutoConfiguration,\
org.springframework.boot.autoconfigure.social.FacebookAutoConfiguration,\
org.springframework.boot.autoconfigure.social.LinkedInAutoConfiguration,\
org.springframework.boot.autoconfigure.social.TwitterAutoConfiguration,\
org.springframework.boot.autoconfigure.solr.SolrAutoConfiguration,\
org.springframework.boot.autoconfigure.thymeleaf.ThymeleafAutoConfiguration,\
org.springframework.boot.autoconfigure.transaction.TransactionAutoConfiguration,\
org.springframework.boot.autoconfigure.transaction.jta.JtaAutoConfiguration,\
org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration,\
org.springframework.boot.autoconfigure.web.DispatcherServletAutoConfiguration,\
org.springframework.boot.autoconfigure.web.EmbeddedServletContainerAutoConfiguration,\
org.springframework.boot.autoconfigure.web.ErrorMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.web.HttpEncodingAutoConfiguration,\
org.springframework.boot.autoconfigure.web.HttpMessageConvertersAutoConfiguration,\
org.springframework.boot.autoconfigure.web.MultipartAutoConfiguration,\
org.springframework.boot.autoconfigure.web.ServerPropertiesAutoConfiguration,\
org.springframework.boot.autoconfigure.web.WebClientAutoConfiguration,\
org.springframework.boot.autoconfigure.web.WebMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.websocket.WebSocketAutoConfiguration,\
org.springframework.boot.autoconfigure.websocket.WebSocketMessagingAutoConfiguration,\
org.springframework.boot.autoconfigure.webservices.WebServicesAutoConfiguration
```

每一个这样的 xxxAutoConfiguration类都是容器中的一个组件，都加入到容器中；用他们来做自动配置；

3）、每一个自动配置类进行自动配置功能；

4）、以HttpEncodingAutoConfiguration（Http编码自动配置）为例解释自动配置原理；
```
@Configuration   //表示这是一个配置类，和以前编写的配置文件一样，也可以给容器中添加组件
@EnableConfigurationProperties(HttpEncodingProperties.class)  //启动指定类的
ConfigurationProperties功能；将配置文件中对应的值和HttpEncodingProperties绑定起来；并把
HttpEncodingProperties加入到ioc容器中
@ConditionalOnWebApplication //Spring底层@Conditional注解（Spring注解版），根据不同的条件，如果
满足指定的条件，整个配置类里面的配置就会生效；    判断当前应用是否是web应用，如果是，当前配置类生效
@ConditionalOnClass(CharacterEncodingFilter.class)  //判断当前项目有没有这个类
CharacterEncodingFilter；SpringMVC中进行乱码解决的过滤器；
@ConditionalOnProperty(prefix = "spring.http.encoding", value = "enabled", matchIfMissing =
true)  //判断配置文件中是否存在某个配置  spring.http.encoding.enabled；如果不存在，判断也是成立的
//即使我们配置文件中不配置pring.http.encoding.enabled=true，也是默认生效的；
public class HttpEncodingAutoConfiguration {
 
   //他已经和SpringBoot的配置文件映射了  
   private final HttpEncodingProperties properties;

   //只有一个有参构造器的情况下，参数的值就会从容器中拿
   public HttpEncodingAutoConfiguration(HttpEncodingProperties properties) {  
      this.properties = properties;        
   }    
 
@Bean   //给容器中添加一个组件，这个组件的某些值需要从properties中获取
@ConditionalOnMissingBean(CharacterEncodingFilter.class) //判断容器没有这个组件？    
public CharacterEncodingFilter characterEncodingFilter() {    
	CharacterEncodingFilter filter = new OrderedCharacterEncodingFilter();        
	filter.setEncoding(this.properties.getCharset().name());        
	filter.setForceRequestEncoding(this.properties.shouldForce(Type.REQUEST));        
	filter.setForceResponseEncoding(this.properties.shouldForce(Type.RESPONSE));        
	return filter;        
} 
```

根据当前不同的条件判断，决定这个配置类是否生效？

一旦这个配置类生效；这个配置类就会给容器中添加各种组件；这些组件的属性是从对应的properties类中获取的，这些类里面的每一个属性又是和配置文件绑定的；

5）、所有在配置文件中能配置的属性都是在xxxxProperties类中封装者；配置文件能配置什么就可以参照某个功能对应的这个属性类

```
@ConfigurationProperties(prefix = "spring.http.encoding")  //从配置文件中获取指定的值和bean的属
性进行绑定
public class HttpEncodingProperties {
   public static final Charset DEFAULT_CHARSET = Charset.forName("UTF‐8");
```

**精髓：
1）、SpringBoot启动会加载大量的自动配置类
2）、我们看我们需要的功能有没有SpringBoot默认写好的自动配置类；
3）、我们再来看这个自动配置类中到底配置了哪些组件；（只要我们要用的组件有，我们就不需要再来配置了）
4）、给容器中自动配置类添加组件的时候，会从properties类中获取某些属性。我们就可以在配置文件中指定这
些属性的值.**

xxxxAutoConfigurartion：自动配置类；给容器中添加组件

xxxxProperties:封装配置文件中相关属性；

##### 细节

1、@Conditional派生注解（Spring注解版原生的@Conditional作用）

作用：必须是@Conditional指定的条件成立，才给容器中添加组件，配置里面的所有内容才生效；

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day02/QQ%E6%88%AA%E5%9B%BE20181103170857.png"/>

**自动配置类必须在一定的条件下才能生效；**

我们怎么知道哪些自动配置类生效；

<font color="#EE2C2C">我们可以通过启用 debug=true属性；来让控制台打印自动配置报告，这样我们就可以很方便的知道哪些自动配置类生效；</font>

```java
=========================
AUTO‐CONFIGURATION REPORT
=========================
Positive matches:（自动配置类启用的）
‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
   DispatcherServletAutoConfiguration matched:
 ‐ @ConditionalOnClass found required class
'org.springframework.web.servlet.DispatcherServlet'; @ConditionalOnMissingClass did not find
unwanted class (OnClassCondition)
      ‐ @ConditionalOnWebApplication (required) found StandardServletEnvironment
(OnWebApplicationCondition)
       
   
Negative matches:（没有启动，没有匹配成功的自动配置类）
‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐‐
   ActiveMQAutoConfiguration:
      Did not match:
         ‐ @ConditionalOnClass did not find required classes 'javax.jms.ConnectionFactory',
'org.apache.activemq.ActiveMQConnectionFactory' (OnClassCondition)
   AopAutoConfiguration:
      Did not match:
         ‐ @ConditionalOnClass did not find required classes
'org.aspectj.lang.annotation.Aspect', 'org.aspectj.lang.reflect.Advice' (OnClassCondition)
```

