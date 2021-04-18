---
title: flink中的Table的简介
author: gakkij
categories:
  - flink
tags:
  - table
img: https://img.imgdb.cn/item/607bb15e8322e6675c704bd7.jpg
top: false
cover: false
coverImg: https://img.imgdb.cn/item/607bb15e8322e6675c704bd7.jpg
toc: true
date: 2021-04-18 12:07:03
summary: flink中的Table介绍
password:
---

##Table API & SQL综述

Table API和SQL两者结合非常紧密，它们的API与关系型数据库中查询非常相似，本质上它们都依赖于一个像数据表的结构：`Table`。

在具体执行层面，Flink将Table API或SQL语句使用一个名为执行计划器（Planner）的组件将关系型查询转换为可执行的Flink作业，并对作业进行一些优化。在本书写作期间出现了阿里巴巴的Blink版本的Planner（或者称为Blink Planner）和Flink社区版本的老Planner（或者称为Flink Planner、Old Planner）并存的现象，Flink社区正在进行这方面的迭代和融合。从名称中可以看出，Blink Planner未来将逐步取代Flink Planner，读者可以根据需求来确定使用哪种Planner。同时，Table API & SQL的迭代速度较快，读者可以根据Flink官方文档查询最新的使用方法。

## Table API & SQL程序骨架结构

下面的代码展示了Table API & SQL的骨架结构：

```java
// 基于StreamExecutionEnvironment创建TableEnvironment
StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
StreamTableEnvironment tEnv = StreamTableEnvironment.create(env);

// 读取数据源，创建数据表Table
tableEnv.connect(...).createTemporaryTable("user_behavior");
// 注册输出数据表Table
tableEnv.connect(...).createTemporaryTable("output_table");

// 使用Table API查询user_behavior
Table tabApiResult = tableEnv.from("user_behavior").select(...);
// 使用SQL查询table1
Table sqlResult  = tableEnv.sqlQuery("SELECT ... FROM user_behavior ... ");

// 将查询结果输出到outputTable
tabApiResult.insertInto("output_table");
sqlResult.insertInto("output_table");

// execute
tableEnv.execute("table");
```

从程序骨架结构上来看，目前的Table API & SQL要与DataStream/DataSet API相结合来使用，主要需要以下步骤：

1. 创建执行环境（ExecutionEnvironment）和表环境（TableEnvironment）
2. 获取数据表`Table`
3. 使用Table API或SQL在`Table`上做查询等操作
4. 将结果输出到外部系统
5. 调用`execute()`，执行作业

在真正编写一个作业之前，我们还需要在Maven中添加相应的依赖。根据用户选择Java还是Scala，需要引用`flink-table-api-*-bridge`项目，这个项目是Table API与DataStream/DataSet API之间的桥梁。

```
<!-- Java -->
<dependency>
  <groupId>org.apache.flink</groupId>
  <artifactId>flink-table-api-java-bridge_${scala.binary.version}</artifactId>
  <version>${flink.version}</version>
  <scope>provided</scope>
</dependency>
<!-- Scala -->
<dependency>
  <groupId>org.apache.flink</groupId>
  <artifactId>flink-table-api-scala-bridge_${scala.binary.version}</artifactId>
  <version>${flink.version}</version>
  <scope>provided</scope>
</dependency>
```

此外，还需要添加Planner相关依赖：

```
<!-- Flink 1.9之前均采用开源社区版的Planner -->
<dependency>
  <groupId>org.apache.flink</groupId>
  <artifactId>flink-table-planner_${scala.binary.version}</artifactId>
  <version>${flink.version}</version>
  <scope>provided</scope>
</dependency>
<!-- Blink版的Planner -->
<dependency>
  <groupId>org.apache.flink</groupId>
  <artifactId>flink-table-planner-blink_${scala.binary.version}</artifactId>
  <version>${flink.version}</version>
  <scope>provided</scope>
</dependency>
```

其中，`${scala.binary.version}`是你所在环境中Scala的版本号，可以是2.11或2.12，`{flink.version}`是所采用的Flink版本号。

## 创建TableEnvironment

`TableEnvironment`是Table API & SQL编程中最基础的类，也是整个程序的入口，它包含了程序的核心上下文信息。`TableEnvironment`的核心功能包括：

- 连接外部系统
- 向目录（Catalog）中注册`Table`或者从中获取`Table`
- 执行Table API或SQL操作
- 注册用户自定义函数
- 提供一些其他配置功能

在Flink社区对未来的规划中，`TableEnvironment`将统一流批处理，兼容Java和Scala两种语言。我们在第四章Flink的骨架结构中曾提到，在Flink 1.10中，针对流处理和批处理分别使用了`StreamExecutionEnvironment`和`ExecutionEnvironment`两套执行环境，底层有些逻辑还没完全统一，加上Java和Scala两种语言的区别，仅执行环境就四种之多。在Table API & SQL中，`TableEnvironment`也没有完全将上述问题统一，再加上Blink Planner与原有老Planner的区别，**读者在编程时一定要注意如何初始化的`TableEnvironment`**。

Flink 1.10保留了5个`TableEnvironment`。其中，`TableEnvironment`是最顶级的接口，`StreamTableEnvironment`和`BatchTableEnvironment`都提供了Java和Scala两个实现：

- `org.apache.flink.table.api.TableEnvironment`：兼容Java和Scala，统一流批处理，适用于整个作业都使用 Table API & SQL 编写程序的场景。
- `org.apache.flink.table.api.java.StreamTableEnvironment`和`org.apache.flink.table.api.scala.StreamTableEnvironment`：分别用于Java和Scala的流处理场景，提供了`DataStream`和`Table`之间相互转换的接口。如果作业除了基于Table API & SQL外，还有和`DataStream`之间的转化，则需要使用`StreamTableEnvironment`。
- `org.apache.flink.table.api.java.BatchTableEnvironment`和`org.apache.flink.table.api.scala.BatchTableEnvironment`：分别用于Java和Scala的批处理场景，提供了`DataSet`和`Table`之间相互转换的接口。如果作业除了基于Table API & SQL外，还有和`DataSet`之间的转化，则使用`BatchTableEnvironment`。

### old流处理

下面的代码使用Java语言进行流处理，它基于老Planner创建`TableEnvironment`。

```java
// 使用Java和老Planner进行流处理
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.java.StreamTableEnvironment;

// 基于StreamExecutionEnvironment创建StreamTableEnvironment
StreamExecutionEnvironment fsEnv = StreamExecutionEnvironment.getExecutionEnvironment();
// 使用老Planner注意相应的Planner包要加入到Maven中
EnvironmentSettings fsSettings = EnvironmentSettings.newInstance().useOldPlanner().inStreamingMode().build();

StreamTableEnvironment fsTableEnv = StreamTableEnvironment.create(fsEnv, fsSettings);

// 或者基于TableEnvironment
TableEnvironment fsTableEnv = TableEnvironment.create(fsSettings);
```

### Blink流处理

如果想基于Blink Planner进行流处理，那么需要改为：

```java
// 使用Java和Blink Planner进行流处理
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.java.StreamTableEnvironment;

// 基于StreamExecutionEnvironment创建StreamTableEnvironment
StreamExecutionEnvironment bsEnv = StreamExecutionEnvironment.getExecutionEnvironment();
// 使用Blink Planner注意相应的Planner包要加入到Maven中
EnvironmentSettings bsSettings = EnvironmentSettings.newInstance().useBlinkPlanner().inStreamingMode().build();

StreamTableEnvironment bsTableEnv = StreamTableEnvironment.create(bsEnv, bsSettings);

// 或者基于TableEnvironment
TableEnvironment bsTableEnv = TableEnvironment.create(bsSettings);
```

### old批处理

如果想基于老Planner进行批处理：

```java
// 使用Java和老Planner进行批处理
import org.apache.flink.api.java.ExecutionEnvironment;
import org.apache.flink.table.api.java.BatchTableEnvironment;

ExecutionEnvironment fbEnv = ExecutionEnvironment.getExecutionEnvironment();
BatchTableEnvironment fbTableEnv = BatchTableEnvironment.create(fbEnv);
```

### Blink批处理

基于Blink Planner进行批处理：

```java
// 使用Java和Blink Planner进行批处理
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.TableEnvironment;

EnvironmentSettings bbSettings = EnvironmentSettings.newInstance().useBlinkPlanner().inBatchMode().build();
TableEnvironment bbTableEnv = TableEnvironment.create(bbSettings);
```

总结下来，使用Table API & SQL之前，要确定使用何种编程语言（Java/Scala），进行批处理还是流处理以及使用哪种Planner。