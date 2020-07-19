---
title: flink的入门
author: gakkij
categories:
  - flink
tags:
  - flink
img: https://pic.downk.cc/item/5f14526714195aa594e039d2.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5f14526714195aa594e039d2.jpg
toc: true
date: 2020-07-19 21:57:52
summary: flink的简单入门
password:
---

### Flink的简单介绍

Apache Flink 是一个框架和分布式处理引擎，用于在*无边界和有边界*数据流上进行有状态的计算。Flink 能在所有常见集群环境中运行，并能以内存速度和任意规模进行计算。

官网：https://flink.apache.org/zh/flink-architecture.html

### Java版本入门案例

**统计单词的个数，入门级别案例：**

#### 本地运行

使用idea创建maven项目：

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

java主函数：

```java
package com.liuzhuo;

import org.apache.flink.api.common.functions.FlatMapFunction;
import org.apache.flink.api.java.ExecutionEnvironment;
import org.apache.flink.api.java.operators.DataSource;
import org.apache.flink.api.java.operators.ReduceOperator;

public class Bounded {

    public static void main(String[] args) throws Exception {


        //1) 获取有界流的执行环境
        ExecutionEnvironment env = ExecutionEnvironment.getExecutionEnvironment();

        //2) 读取文件中的数据
        DataSource<String> input = env.readTextFile("/Users/liuzhuo/projects/flink/flnk-deep-study/src/main/resources/input");

        //3) 测试是否读取到了文件
        //input.print();

        //4）执行一系列算子操作
        ReduceOperator<WordCount> reduce = input.flatMap((FlatMapFunction<String, String>) (key, collector) -> {
            String[] words = key.split("\\s+");
            for (String word : words) {
                collector.collect(word);
            }
        }).returns(String.class).filter((word) -> {
            if (!word.isEmpty()) {
                return true;
            } else {
                return false;
            }
        }).map((word) -> {
            return new WordCount(word, 1);
        }).groupBy("word")
                .reduce(((value1, value2) -> {
                    return new WordCount(value1.word, value1.count + value2.count);
                }));

        reduce.print();
        //reduce.setParallelism(1).writeAsText("/Users/liuzhuo/projects/flink/flnk-deep-study/src/main/resources/output/result.txt");

        //执行任务
        //env.execute("word count task");

    }

    public static class WordCount {
        public String word;
        public int count;

        public WordCount() {
        }

        public WordCount(String word, int count) {
            this.word = word;
            this.count = count;
        }

        @Override
        public String toString() {
            return "WordCount{" +
                    "word='" + word + '\'' +
                    ", count=" + count +
                    '}';
        }
    }
}

```

运行函数：

![](https://pic.downk.cc/item/5f1453b614195aa594e0a529.jpg)

---

#### standalone模式

官网下载：flink的安装包，我这里下载的是1.7.2的版本

![](https://pic.downk.cc/item/5f14543b14195aa594e0d8e7.jpg)

**PS：flink的版本主要切割点是：1.9.0的版本。1.9.0之前的版本是无界流和有界流的API的分开的，有两套api，DataSet处理有界流，DataStream处理无界流；1.9.0和之后的版本，是将阿里的bflink的一些功能合并进去了，有界流和无界流的api合成一套。**

---

解压flink的tgz包：

`tar -zxvf flink-1.7.2-bin-hadoop24-scala_2.11.tgz`

![](https://pic.downk.cc/item/5f14558214195aa594e149e7.jpg)

bin: 一些列可执行的文件

conf: 配置文件

log：日志文件

----

启动flink官方的伪分布式集群：

在bin目录下执行：`./start-cluster.sh`

验证是否启动成功：jps

![](https://pic.downk.cc/item/5f14563014195aa594e181ea.jpg)

---

浏览器输入：

http://localhost:8081/

![](https://pic.downk.cc/item/5f14569914195aa594e19f56.jpg)

修改程序：

```java
        ....
        //reduce.print();
        reduce.setParallelism(1).writeAsText("/Users/liuzhuo/projects/flink/flnk-deep-study/src/main/resources/output/result.txt");

        //执行任务
        env.execute("word count task");
```

编译程序，打包：

clean、package：

![](https://pic.downk.cc/item/5f14572614195aa594e1c94c.jpg)

上传jar到flink集群中：

![](https://pic.downk.cc/item/5f14574f14195aa594e1d9a9.jpg)

![](https://pic.downk.cc/item/5f14577714195aa594e1e3ea.jpg)

![](https://pic.downk.cc/item/5f1457df14195aa594e203f0.jpg)

![](https://pic.downk.cc/item/5f1457fd14195aa594e20c74.jpg)

---

![](https://pic.downk.cc/item/5f14581d14195aa594e216ab.jpg)

---

细节：

![](https://pic.downk.cc/item/5f14586414195aa594e22ca1.jpg)



目前，我们还是执行的有界流，从文件从获取所有的单词数据，下篇，我们来讲解无界流的程序，奥利给~~~



