---
title: Mybatis的开发的第一天
categories:
  - mybatis
tags:
  - mybatis
date: 2019-03-08 13:33:50
summary: 讲述原始的jdbc，与orm的区别
---
 这是Mybatis的开发的第一天，我将讲述原始的jdbc，与orm的区别。

### jdbc的概述

  Java程序都是通过JDBC（Java DataBase Connectivity）连接数据库的，这样，我们就能通过SQL对数据库编程了。JDBC是由SUN公司提出的一系列规范，但是它只定义了接口规范，而具体的实现是通过各个数据库厂商来实现的，因为每个数据库都有其特殊性，这些是Java规范没有办法来确定的，所以JDBC就是一种典型的桥接模式。

### jdbc的使用

  传统的jdbc编程的使用给我们带来了连接数据库的功能，但是也引起了巨大的问题。

  传统的代码如下：
  我使用的的编辑器是：idea
  打开idea，创建java普通项目即可：

  <img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190308135115.png"/>

  创建com.liuzhuo.jdbc包
  然后，创建jdbcTempate类
  然后编写jdbc的固定代码：

  `1.创建connection：连接器`
 ```
     private Connection getConnection() {
        Connection connection = null;
        try {
            Class.forName("com.mysql.jdbc.Driver");
            String url = "jdbc:mysql://localhost:3306/school?useUnicode=true&useSSL=true";
            String user = "root";
            String password = "123456";
            connection = DriverManager.getConnection(url, user, password);
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
            return null;
        }
        return connection;
    }
 ```

 `2.编写获取用户的SQL代码`：
 ```
     public User getUser(Long id) {

        Connection connection = getConnection();
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;
        try {
            preparedStatement = connection.prepareStatement("SELECT userId,user_age,user_name from user WHERE userId=?");
            preparedStatement.setLong(1, id);
            resultSet = preparedStatement.executeQuery();
            while (resultSet.next()) {
                String userId = resultSet.getString("userId");
                long user_age = resultSet.getLong("user_age");
                String user_name = resultSet.getString("user_name");

                User user = new User();
                user.setUserId(userId);
                user.setUserAge(user_age);
                user.setUserName(user_name);

                return user;
            }
        } catch (SQLException e) {
            e.printStackTrace();

        } finally {
            this.close(resultSet, preparedStatement, connection);
        }
        return null;
    }
 ```

 `3.编写关闭资源的方法：`
 ```
     private void close(ResultSet resultSet, PreparedStatement preparedStatement, Connection connection) {

        try {
            if (resultSet != null && !resultSet.isClosed()) {
                resultSet.close();
            }
            if (preparedStatement != null && !preparedStatement.isClosed()) {
                preparedStatement.close();
            }
            if (connection != null && !connection.isClosed()) {
                connection.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
 ```

 上面的关闭资源，我就简单的使用最大的异常来接受了，生产环境就不要这样了。

 `4.编写主函数main：`

 ```
     public static void main(String[] args) {

        JdbcExample jdbcExample = new JdbcExample();
        User user = jdbcExample.getUser(1L);
        System.out.println(user);
    }
 ```

---

 以上成功的前提是，我们的mysql数据库中有数据呀，我的school数据库中，有user的表：
   <img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190308142223.png"/>

 现在，运行我们的main函数：

 发现出现了ClassNotFound异常：

 因为项目中还必须要包含mysql-connection的jar。

 在我们的idea中，点击file：
 <img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190308142504.png" style="width: 50%"/>

点击：Modules，然后点击Dependencies，再点击右边的绿色的加号：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190308142758.png"/>

然后，在出现的选项中，选择第一项，添加jar包：

选中你的电脑中，下载的mysql-connector-java：jar包
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190308142926.png"/>

点击确定后，在我们的项目中，会在External Libraries中出现相应的jar包：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190308143135.png" style="width: 50%"/>

再次运行main函数：
<img src="https://gakkil.gitee.io/gakkil-image/mybatis/QQ截图20190308143240.png"/>

输出了我们的数据库中的数据！！！

### jdbc的总结

1. 使用jdbc编程需要连接数据库，注册驱动和数据库信息

2. 操作Connection，打开Statement对象

3. 通过Statement执行SQL，返回结果到ResultSet对象。

4. 使用ResultSet对象读取数据，然后通过代码转化为POJO对象。

5. 关闭数据库相关的资源。

---

### ORM模型

由于jdbc存在缺陷，在实际工作中我们很少使用JDBC来进行编程，于是提出了对象关系映射（Object Relational Mapping，简称ORM）

ORM模型就是 将数据库中的表 和 简单的java对象（Plain Ordinary Java Object）进行关系映射。它主要解决了数据库中数据和POJO对象的相互映射。我们通过这层映射关系就可以简单迅速地把数据库表的数据转化为POJO对象，以便程序员更加容易理解和应用java程序。

ORM映射模型，有Hibernate和Mybatis等，这里，我主要讲解Mybatis的映射，至于HIbernate的使用，大家可以自行的去学习，类似。只不过Hibernate是全表映射，Mybatis是半自动映射的框架。

Mybatis所需要提供的映射文件包含以下三个部分：

1. POJO

2. 映射规则

3. SQL

在Mybatis中，你需要自己编写SQL语句，虽然比Hibernate配置得多，但是Mybatis可以配置动态的SQL，这解决了Hibernate的表名根据时间变化，不同的条件下列名不一样的问题。同时你也可以优化SQL语句，通过配置决定你的SQl映射规则，也能支持存储过程，所以对于一些复杂的和需要优化性能的SQL的查询它更加方便，Mybatis几乎能做到JDBC所能做到的所有事情。Mybatis具有自动映射功能。换句话说，在注意一些规则的基础上，Mybatis可以给我们自动完成自动映射，而无需写任何的映射规则，这大大提高了开发效率和灵活性。