---
title: SpringBoot_day_08
categories:
  - SpringBoot
  - Spring
tags:
  - SpringBoot
  - Spring
date: 2018-11-11 10:29:04
---
SpringBoot与数据访问
<!--more-->

## JDBC(默认支持的数据源)

1）创建新的Springboot项目，添加web模块、mysql模块、jdbc模块
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111110045.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111110143.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111110336.png"/>

2) 连接我们的数据库：

打开我们的虚拟机，然后启动mysql的容器
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111110542.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111110735.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111110811.png"/>

3）在我们的项目中，添加数据源的配置信息。

这里使用yml文件，properties文件也一样。
在resources下：创建application.yml文件。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111111923.png"/>
```
spring:
  datasource:
    username: root
    password: 123456
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://10.6.11.17:3306/jdbc
```

在mysql的客户端上面，创建jdbc数据库：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111111412.png"/>

4）测试数据源是否配置成功
在test包下：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111112125.png"/>

效果：

默认是用org.apache.tomcat.jdbc.pool.DataSource作为数据源

数据源的相关配置都在DataSourceProperties里面。
```
@ConfigurationProperties(prefix = "spring.datasource")
public class DataSourceProperties
		implements BeanClassLoaderAware, EnvironmentAware, InitializingBean {
```

5) 自动配置的原理

org.springframework.boot.autoconfigure.jdbc：

1、参考DataSourceConfiguration，根据配置创建数据源，默认使用Tomcat连接池；可以使用
spring.datasource.type指定自定义的数据源类型；


2、SpringBoot默认支持的数据源：
```
org.apache.tomcat.jdbc.pool.DataSource、HikariDataSource、BasicDataSource
```

3、自定义数据源类型
```
	/**
	 * Generic DataSource configuration.
	 */
	@ConditionalOnMissingBean(DataSource.class)
	@ConditionalOnProperty(name = "spring.datasource.type")
	static class Generic {

		@Bean
		public DataSource dataSource(DataSourceProperties properties) {
			return properties.initializeDataSourceBuilder().build();
		}

	}
```

4、自动运行sql语句的原理

DataSourceAutoConfiguration:中有一个**DataSourceInitializer**对象。

```
@Configuration
@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class })
@EnableConfigurationProperties(DataSourceProperties.class)
@Import({ Registrar.class, DataSourcePoolMetadataProvidersConfiguration.class })
public class DataSourceAutoConfiguration {

	@Bean
	@ConditionalOnMissingBean
	public DataSourceInitializer dataSourceInitializer(DataSourceProperties properties,
			ApplicationContext applicationContext) {
		return new DataSourceInitializer(properties, applicationContext);
	}
  ···
}
```
**DataSourceInitializer：ApplicationListener**
```
class DataSourceInitializer implements ApplicationListener
```

作用：
1）、runSchemaScripts();运行建表语句；

2）、runDataScripts();运行插入数据的sql语句；

默认只需要将文件命名为：
```
schema‐*.sql、data‐*.sql
默认规则：schema.sql，schema‐all.sql；

自定义名字：
在配置文件中：
   schema:
      ‐ classpath:department.sql
      指定位置
```

验证：
在resources下：创建默认命名规则的：schema-all.sql文件：
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111113520.png"/>

现在jdbc中还没有department表：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111113648.png"/>

运行我们的Springboot项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111113737.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111113833.png"/>

刷新jdbc数据库：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111113923.png"/>

---

使用自定义的命名规则：
修改schema-all.sql 的名字为：department.sql
在application.yml文件中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111114934.png"/>

删除jdbc中的department表，然后再次启动Springboot项目：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111115013.png"/>

5、操作数据库：Springboot自动配置了JdbcTemplate操作数据库
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111115134.png" style="width:50%"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111115401.png"/>

说明Springboot已经帮我们配置好了JdbcTemplate模板引擎，我们可以直接使用：
创建HelloController：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111120407.png"/>
```
@Controller
public class HelloController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @ResponseBody
    @RequestMapping("/query")
    public Map<String, Object> queryDepartment() {
        List<Map<String, Object>> mapList = jdbcTemplate.queryForList("select * from department");
        //返回第一条数据
        return mapList.get(0);
    }
}
```

启动应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111120130.png"/>

打开mysql的客户端：
添加一条数据：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111120217.png"/>

打开浏览器：输入：`http://localhost:8080/query`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111120509.png"/>

---

## 整合Druid数据源(阿里的数据源连接池)

1）导入druid的依赖
```
		<!--导入druid的数据源-->
		<!-- https://mvnrepository.com/artifact/com.alibaba/druid -->
		<dependency>
			<groupId>com.alibaba</groupId>
			<artifactId>druid</artifactId>
			<version>1.1.10</version>
		</dependency>
```

2) 切换数据源：
使用type来切换数据源
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111123613.png"/>
```
spring:
  datasource:
    username: root
    password: 123456
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://10.6.11.17:3306/jdbc
    type: com.alibaba.druid.pool.DruidDataSource
#    schema:
#      - classpath:department.sql
```
3) 运行测试类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111123753.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111123907.png"/>
数据源切换成功。

4）添加druid的独有配置
```
spring:
  datasource:
    username: root
    password: 123456
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://10.6.11.17:3306/jdbc
    type: com.alibaba.druid.pool.DruidDataSource

    #数据源其他配置
    initialSize: 5
    minIdle: 5
    maxActive: 20
    maxWait: 60000
    timeBetweenEvictionRunsMillis: 60000
    minEvictableIdleTimeMillis: 300000
    validationQuery: SELECT 1 FROM DUAL
    testWhileIdle: true
    testOnBorrow: false
    testOnReturn: false
    poolPreparedStatements: true

    #配置监控统计拦截的filters，去掉后监控界面sql无法统计，'wall'用于防火墙
    filters: stat,wall,log4j
    maxPoolPreparedStatementPerConnectionSize: 20
    useGlobalDataSourceStat: true
    connectionProperties: druid.stat.mergeSql=true;druid.stat.slowSqlMillis=500
    
#    schema:
#      - classpath:department.sql
```

dubug一下，看是否是其他属性配置成功：

给contextLoads中的System.out.println(dataSource);打上断点
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111124326.png"/>

dubug运行该测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111124538.png"/>

因为我们在application配置文件中配置的：spring-datasource:开头的配置信息，都是DataSourceProperties中的
```
@ConfigurationProperties(prefix = "spring.datasource")
public class DataSourceProperties
```

而DataSourceProperties类中，根本没有druid那些独有的配置信息：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111124846.png"/>

5）自己配置druid数据源

在config包下，创建MyDruidConfig类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111125255.png"/>

这样就能将application配置文件中的druid的独有配置信息调入到我们的druid数据源当中了。

如果没有添加@ConfigurationProperties(prefix = "spring.datasource")的话：
需要自己手动一个一个的配置
```
    @Bean
    DataSource druid() {
        DruidDataSource druidDataSource = new DruidDataSource();
        druidDataSource.setInitialSize(5);
        druidDataSource.setMaxActive(10);
        ···
        return druidDataSource;
    }
```

再次dubug测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111125737.png"/>

6）配置druid的监控

在MyDruidConfig类中：
```java
    //配置Druid的监控
    //1、配置一个管理后台的Servlet
    @Bean
    public ServletRegistrationBean statViewServlet() {
        ServletRegistrationBean bean = new ServletRegistrationBean(new StatViewServlet(), "/druid/*");

        Map<String, String> initParams = new HashMap<>();
        initParams.put("loginUsername","admin");
        initParams.put("loginPassword","123456");
        initParams.put("allow","");//默认就是允许所有访问
        initParams.put("deny","192.168.15.21");//不然访问

        bean.setInitParameters(initParams);
        return bean;
    }

    //2、配置一个web监控的filter
    @Bean
    public FilterRegistrationBean webStatFilter() {
        FilterRegistrationBean bean = new FilterRegistrationBean();
        bean.setFilter(new WebStatFilter());

        Map<String, String> initParams = new HashMap<>();
        initParams.put("exclusions","*.js,*.css,/druid/*");//排除静态资源

        bean.setInitParameters(initParams);
        bean.setUrlPatterns(Arrays.asList("/*"));
        
        return bean;
    }
```
启动Springboot应用：

在浏览器中输入：`http://localhost:8080/druid`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111130651.png"/>

输入自己配置的用户名与密码：
```
        initParams.put("loginUsername","admin");
        initParams.put("loginPassword","123456");
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111130816.png"/>

在浏览器中输入：`http://localhost:8080/query`

然后点击SQL监控：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111131006.png"/>

点击Web应用：就是我们的配置WebAppStat List过滤器
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111131202.png"/>

监控成功！！！

---

## 整合MyBatis

### 前期准备阶段

1）创建新的项目，添加web、mysql、mybatis模块：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111141702.png"/>

导入druid依赖：
```
		<!--导入druid的数据源-->
		<!-- https://mvnrepository.com/artifact/com.alibaba/druid -->
		<dependency>
			<groupId>com.alibaba</groupId>
			<artifactId>druid</artifactId>
			<version>1.1.10</version>
		</dependency>
```

2）创建application.yml文件：
```java
spring:
  datasource:
    username: root
    password: 123456
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://10.6.11.17:3306/mybatis
    type: com.alibaba.druid.pool.DruidDataSource

    #数据源其他配置
    initialSize: 5
    minIdle: 5
    maxActive: 20
    maxWait: 60000
    timeBetweenEvictionRunsMillis: 60000
    minEvictableIdleTimeMillis: 300000
    validationQuery: SELECT 1 FROM DUAL
    testWhileIdle: true
    testOnBorrow: false
    testOnReturn: false
    poolPreparedStatements: true

    #配置监控统计拦截的filters，去掉后监控界面sql无法统计，'wall'用于防火墙
    filters: stat,wall,log4j
    maxPoolPreparedStatementPerConnectionSize: 20
    useGlobalDataSourceStat: true
    connectionProperties: druid.stat.mergeSql=true;druid.stat.slowSqlMillis=500

    schema:
      - classpath:sql/department.sql
      - classpath:sql/employee.sql
```

3) 创建新的数据库mybatis：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111142149.png"/>

4）在resours下：参加过sql文件夹
里面放入：department.sql 和 employee.sql文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111142335.png" style="width:50%"/>

department.sql:
```
/*
Navicat MySQL Data Transfer

Source Server         : 本地
Source Server Version : 50528
Source Host           : 127.0.0.1:3306
Source Database       : restful_crud

Target Server Type    : MYSQL
Target Server Version : 50528
File Encoding         : 65001

Date: 2018-03-05 10:41:40
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for department
-- ----------------------------
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `departmentName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


```

employee.sql文件:
```
/*
Navicat MySQL Data Transfer

Source Server         : 本地
Source Server Version : 50528
Source Host           : 127.0.0.1:3306
Source Database       : restful_crud

Target Server Type    : MYSQL
Target Server Version : 50528
File Encoding         : 65001

Date: 2018-03-05 10:41:58
*/

SET FOREIGN_KEY_CHECKS=0;

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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

```

5) 创建config：DruidConfig配置类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111142702.png"/>

```java
@Configuration
public class DruidConfig {

    @ConfigurationProperties(prefix = "spring.datasource")
    @Bean
    DataSource druid() {
        return new DruidDataSource();
    }

    //配置Druid的监控
    //1、配置一个管理后台的Servlet
    @Bean
    public ServletRegistrationBean statViewServlet() {
        ServletRegistrationBean bean = new ServletRegistrationBean(new StatViewServlet(), "/druid/*");

        Map<String, String> initParams = new HashMap<>();
        initParams.put("loginUsername", "admin");
        initParams.put("loginPassword", "123456");
        initParams.put("allow", "");//默认就是允许所有访问
        initParams.put("deny", "192.168.15.21");//不然访问

        bean.setInitParameters(initParams);
        return bean;
    }

    //2、配置一个web监控的filter
    @Bean
    public FilterRegistrationBean webStatFilter() {
        FilterRegistrationBean bean = new FilterRegistrationBean();
        bean.setFilter(new WebStatFilter());

        Map<String, String> initParams = new HashMap<>();
        initParams.put("exclusions", "*.js,*.css,/druid/*");//排除静态资源

        bean.setInitParameters(initParams);
        bean.setUrlPatterns(Arrays.asList("/*"));

        return bean;
    }
}

```

6) 启动Springboot应用：

打开mysql的客户端：生成了两个表：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111142926.png"/>

注释掉，application配置文件中的schema：(防止再次启动应用，表又归零！)
```
#    schema:
#      - classpath:sql/department.sql
#      - classpath:sql/employee.sql
```

7）创建bean对象：

根据数据库mybatis中的两个表，创建对应的JavaBean对象。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111143428.png"/>

Employee：
```java
public class Employee {

    private Integer id;
    private String lastName;
    private Integer gender;
    private String email;
    private Integer dId;

   ··· get和set方法
}
```
Department:
```java
public class Department {

    private Integer id;
    private String departmentName;

    ··· get和set方法
}
```

---

### mybatis的使用

#### 注解版

1）创建mapper文件夹：DepartmentMapper（接口）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111145746.png"/>

```java
@Mapper
public interface DepartmentMapper {

    @Select("select * from department where id=#{id}")
    public Department getDeptById(Integer id);

    @Delete("delete from department where id=#{id}")
    public int deleteDeptById(Integer id);

    //回显主键的id。
    @Options(useGeneratedKeys = true, keyProperty = "id")
    @Insert("insert into department(departmentName) values(#{departmentName})")
    public int insertDept(Department department);

    @Update("update department set departmentName=#{departmentName} where id=#{id}")
    public int updateDept(Department department);

}
```

2) 创建一个DepartmentController：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111150310.png"/>
```java
@RestController
public class DepartmentController {

    @Autowired
    private DepartmentMapper departmentMapper;

    @GetMapping("/dept/{id}")
    public Department findDepartmentById(@PathVariable("id") Integer id) {
        return departmentMapper.getDeptById(id);
    }

    @GetMapping("/dept")
    public Department addDepartment(Department department) {
        departmentMapper.insertDept(department);
        return department;
    }
}
```

3) 启动Springboot应用：

在浏览器中输入：`http://localhost:8080/dept/1`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111151409.png"/>

在浏览器中输入：`http://localhost:8080/dept?departmentName=aa`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111151555.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111151633.png"/>

问题：

我们将mysql中的departmentName改为：department_name.
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111151808.png"/>

修改我们的DepartmentMapper中的departmentName为：department_name。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111151946.png"/>

再次启动Springboot应用：

在浏览器中输入：`http://localhost:8080/dept?departmentName=bb`

如果你的mybat的依赖版本的1.3.2以上，会执行成功，因为默认支持驼峰命名了。如果失败的话，我们需要自定义mybatis的规则：

创建MybatisConfig配置类:
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111152708.png"/>

```java
@Configuration
public class MybatisConfig {

    @Bean
    public ConfigurationCustomizer customizer() {
        return new ConfigurationCustomizer() {
            @Override
            public void customize(org.apache.ibatis.session.Configuration configuration) {
                //使用驼峰命名规则
                configuration.setMapUnderscoreToCamelCase(true);
            }
        };
    }
}
```

或者使用在配置文件中，配置驼峰命名规则。

---

4）扫描多个mapper类：

在配合类上面加上：
@MapperScan(value = "com.liuzhuo.springboot.mapper")

```java
使用MapperScan批量扫描所有的Mapper接口；
@MapperScan(value = "com.liuzhuo.springboot.mapper")
@SpringBootApplication
public class SpringBoot06DataMybatisApplication {
    
    public static void main(String[] args) {  
        
        SpringApplication.run(SpringBoot06DataMybatisApplication.class, args); 
        
    }    
}
```

这样，我们就不必须要在每个mapper类上，加@Mapper注解了

#### 配置文件版

1）创建EmployeeMapper接口：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111154909.png"/>
```java
//必须使用@Mapper或者@MapperScan。二者其一即可
public interface EmployeeMapper {

    public Employee findEmplById(Integer id);

    public void insertEmpl(Employee employee);
}
```

2) 创建mybatis的全局配置文件：

在resours下创建mybatis/mapper文件夹：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111155138.png" style="width:50%"/>

在mybatis文件夹下，创建mybatis的全局配置文件：
不会写的话，看mybatis的官网文档，mybatis已经被整合到github上面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111155348.png" />
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111155424.png" />
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111155456.png" />

[mybatis-3的官方文档](http://www.mybatis.org/mybatis-3/)

其中的什么数据源，mapper的文件扫描，我们全部删除，我们已经使用application.yml文件配置了。

最终mybatis-config.xml：

就设置了一个使用驼峰命名法
```java
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
<settings>
    <setting name="mapUnderscoreToCamelCase" value="true"/>
</settings>
</configuration>
```

3）创建mapper.xml文件：

在mapper文件夹下，创建employee-mapper.xml
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111160017.png" style="width:50%"/>

文件不会写，看官方文档：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111160123.png" />

最终employee-mapper.xml：
```java
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.liuzhuo.springboot.mapper.EmployeeMapper">
    <!--
        public Employee findEmplById(Integer id);
        public Employee insertEmpl(Employee employee);
    -->
    <select id="findEmplById" resultType="com.liuzhuo.springboot.bean.Employee">
        select * from employee where id = #{id}
    </select>

    <insert id="insertEmpl" >
        INSERT INTO employee(lastName,email,gender,d_id) VALUES (#{lastName},#{email},#{gender},#{dId})
    </insert>
</mapper>
```

4) 在application.yml文件中，制定全局mybatis.xml和mapper.xml的映射：
```java
mybatis:
  config-location: classpath:mybatis/mybatis-config.xml 指定全局配置文件的位置
  mapper-locations: classpath:mybatis/mapper/*.xml 指定sql映射文件的位置
```

5) 创建EmployeeController：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111161700.png" />

```java
@RestController
public class EmployeeController {

    @Autowired
    private EmployeeMapper employeeMapper;

    @GetMapping("/empl/{id}")
    public Employee findEmplById(@PathVariable("id") Integer id) {
        return employeeMapper.findEmplById(id);
    }

    @GetMapping("/empl")
    public Employee insertEmpl(Employee employee) {
        employeeMapper.insertEmpl(employee);
        return employee;
    }
}
```

6) 启动Springboot应用

在浏览器中输入：`http://localhost:8080/empl/1`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111161941.png" />

在浏览器中输入：`http://localhost:8080/empl?lastName=jack&&email=4324324@qq.com&&gender=1&&dId=2`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111163225.png" />

再次浏览器中输入：`http://localhost:8080/empl/1`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111163307.png" />


最主要的就是在application配置文件中：
```java
mybatis:
  config-location: classpath:mybatis/mybatis-config.xml
  mapper-locations: classpath:mybatis/mapper/*.xml
```

更多使用参照:
[mybatis-spring-boot-autoconfigure](http://www.mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/)

---

## 整合SpringData JPA

### SpringData简介
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111165834.png" />


### 整合SpringData JPA

JPA:ORM（Object Relational Mapping）

1）创建新的Springboot项目，添加web、mysql、jpa模块：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111170202.png" />

2）在application.yml配置文件中：
```java
spring:
  datasource:
    username: root
    password: 123456
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://10.6.11.17:3306/jpa
  jpa:
#  自动创建数据库的表
    hibernate:
      ddl-auto: update
#  显示sql语句
    show-sql: true
```

3) 在mysql客户端中创建jpa数据库：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111170624.png" />

4）**编写一个实体类（bean）和数据表进行映射，并且配置好映射关系**

在bean包下，创建User类:
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111171609.png" />

```java
//使用JPA注解配置映射关系
@Entity  //表明是一个实体与数据库中的某个表对应的注解
@Table(name = "t_user") //表示User类与t_user表对象，不写的话，默认就类名小写的表名
public class User {

    @Id //这是一个主键：javax.persistence.Id;
    @GeneratedValue(strategy = GenerationType.IDENTITY)//自增主键
    private Integer id;

    @Column(name = "last_name", length = 50)//这是和数据表对应的一个列
    private String lastName;

    @Column //省略默认列名就是属性名
    private String email;
    
   ····get和set方法
}
```

5）编写一个Dao接口来操作实体类对应的数据表（Repository）：

继承JpaRepository类就行：<T,U>: T : 实体类， U : 主键类型
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111171846.png" />

6）基本的配置（JpaProperties）
```java
spring: 
 jpa:
    hibernate:
#     更新或者创建数据表结构
      ddl‐auto: update
#    控制台显示SQL
    show‐sql: true
```

7) 编写UserController类
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111172435.png" />
```java
@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;


    @GetMapping("/user/{id}")
    public User findUserById(@PathVariable("id") Integer id) {
        User user = userRepository.findOne(id);
        return user;
    }

    @GetMapping("/user")
    public User insertUser(User user) {
        User save = userRepository.save(user);
        return save;
    }

}
```

8) 启动Springboot应用：
打开mysql的客户端：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111172613.png" />
自动帮我们创建了t_user表

在浏览器中输入：`http://localhost:8080/user/1`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111172801.png" />


在浏览器中输入：`http://localhost:8080/user?lastName=zhangsan&email=89028394@qq.com`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111172917.png" />

控制台：（打印出了sql语句）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111173008.png" />

mysql客户端：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/day08/QQ截图20181111173129.png" />

其他博客：

https://blog.csdn.net/oChangWen/article/details/52788274?locationNum=3

https://blog.csdn.net/suo082407128/article/details/60963161