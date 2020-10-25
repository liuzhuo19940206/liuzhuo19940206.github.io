---
title: Flink的UDF函数
author: gakkij
categories:
  - flink
tags:
  - flink
img: https://pic.downk.cc/item/5f9533391cd1bbb86b8e52ee.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5f9533391cd1bbb86b8e52ee.jpg
toc: true
date: 2020-10-25 16:06:36
summary: Flink的UDF函数介绍
password:
---

### FLink中的UDF函数

UDF函数：flink中提供了很多自带的函数给用户使用，比如：MapFunction、FLatMapFunction、FilterFunction等，今天以FilterFunction为例子来说明。

### 定义MapFunction的实现类

背景：一批旅客去北京旅游，现在过安检的时候，我们需要将体温不正常的旅客信息打印出来，正常的体温为：36.3~37.2

pom文件：

```java
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>flnk-deep-study</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>

        <!-- https://mvnrepository.com/artifact/org.apache.flink/flink-java -->
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-java</artifactId>
            <version>1.9.0</version>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.apache.flink/flink-streaming-java -->
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-streaming-java_2.12</artifactId>
            <version>1.9.0</version>
            <scope>provided</scope>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.apache.flink/flink-clients -->
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-clients_2.12</artifactId>
            <version>1.9.0</version>
        </dependency>

    </dependencies>


    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <version>3.0.0</version>
                <configuration>
                    <descriptorRefs>
                        <descriptorRef>jar-with-dependencies</descriptorRef>
                    </descriptorRefs>
                </configuration>
                <executions>
                    <execution>
                        <id>make-assembly</id>
                        <phase>package</phase>
                        <goals>
                            <goal>single</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <!-- 资源文件拷贝插件 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-resources-plugin</artifactId>
                <version>2.7</version>
                <configuration>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
            <!-- java编译插件 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.2</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>2.7</version>
            </plugin>
        </plugins>
    </build>

</project>
```

主函数：

```java
package com.liuzhuo.udf;

import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;

public class MyFilterFunction {

    public static void main(String[] args) throws Exception {

        //1) 获取执行环境
        StreamExecutionEnvironment environment = StreamExecutionEnvironment.getExecutionEnvironment();

        //2) 从socket中获取数据:监听本地的端口号：9000
        DataStreamSource<String> streamSource = environment.socketTextStream("localhost", 9000);

        //3) 执行过滤的功能
        streamSource.filter(new UserFliterFunction())
                .print();

        environment.execute("自定义过滤函数！");

    }
}
```

运行后：出现类找不到的异常的话：

```java
Exception in thread "main" java.lang.NoClassDefFoundError: org/apache/flink/streaming/api/environment/StreamExecutionEnvironment
	at com.liuzhuo.udf.MyFilterFunction.main(MyFilterFunction.java:11)
Caused by: java.lang.ClassNotFoundException: org.apache.flink.streaming.api.environment.StreamExecutionEnvironment
	at java.net.URLClassLoader.findClass(URLClassLoader.java:382)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:418)
	at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:355)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:351)
	... 1 more
```

打开idea的run，选择Edit Configuration

![](https://pic.downk.cc/item/5f9539dd1cd1bbb86b8fa4f7.jpg)

![](https://pic.downk.cc/item/5f953a121cd1bbb86b8fae10.jpg)

再次运行即可！！！

----

打开终端，输入：`nc -lk 9000`

![](https://pic.downk.cc/item/5f953a7d1cd1bbb86b8fc15b.jpg)

该命令会往本地的端口号：9000发送数据。

现在，输入格式：姓名,体温,地点

![](https://pic.downk.cc/item/5f953b1b1cd1bbb86b8fdb52.jpg)

说明：

当输入gakki的体温正常时，是没有打印的，输入张三的体温不属于正常体温时，将该信息打印出来了！

### 匿名函数来实现

修改主函数：

```java
package com.liuzhuo.udf;

import org.apache.flink.api.common.functions.FilterFunction;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;

public class MyFilterFunction {

    public static void main(String[] args) throws Exception {

        //1) 获取执行环境
        StreamExecutionEnvironment environment = StreamExecutionEnvironment.getExecutionEnvironment();

        //2) 从socket中获取数据:监听本地的端口号：9000
        DataStreamSource<String> streamSource = environment.socketTextStream("localhost", 9000);

        //3) 执行过滤的功能
        streamSource.filter(new FilterFunction<String>() {
            @Override
            public boolean filter(String value) throws Exception {
                if (value == null || "".equals(value)) {
                    return false;
                }
                //根据逗号分隔
                String[] text = value.split(",");
                String tempStr = text[1];
                float temp = Float.parseFloat(tempStr);
                if (temp >= 36.3 && temp <= 37.2) {
                    return false;
                } else {
                    //过滤出体温异常的旅客
                    return true;
                }
            }
        }).print();

        environment.execute("自定义过滤函数！");
    }
}

```

### Lamda表达式

主函数：

```java
package com.liuzhuo.udf;

import org.apache.flink.api.common.functions.FilterFunction;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;

public class MyFilterFunction {

    public static void main(String[] args) throws Exception {

        //1) 获取执行环境
        StreamExecutionEnvironment environment = StreamExecutionEnvironment.getExecutionEnvironment();

        //2) 从socket中获取数据:监听本地的端口号：9000
        DataStreamSource<String> streamSource = environment.socketTextStream("localhost", 9000);

        //3) 执行过滤的功能
        streamSource.filter(value ->{
                if (value == null || "".equals(value)) {
                    return false;
                }
                //根据逗号分隔
                String[] text = value.split(",");
                String tempStr = text[1];
                float temp = Float.parseFloat(tempStr);
                if (temp >= 36.3 && temp <= 37.2) {
                    return false;
                } else {
                    //过滤出体温异常的旅客
                    return true;
                }
        }).print();

        environment.execute("自定义过滤函数！");
    }
}

```

