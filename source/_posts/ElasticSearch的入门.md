---
title: ElasticSearch的入门
author: gakkij
categories:
  - elasticsearch
tags:
  - elasticsearch
img: https://pic.downk.cc/item/5eac303ac2a9a83be59f8da9.png
top: false
cover: false
coverImg: https://pic.downk.cc/item/5eac303ac2a9a83be59f8da9.png
toc: true
date: 2020-05-01 22:13:16
summary: elasticsearch的简单入门
password:
---

## 简介

Elasticsearch是一个高度可扩展的开源的分布式Restful全文搜索和分析引擎。它允许用户快速的（近实时的）存储、搜索和分析海量数据。它通常用作底层引擎技术，为具有复杂搜索功能和要求的应用程序提供支持。
以下是ES可用于的一些场景：
1. 电商网站提供搜索功能：可使用ES来存储产品的目录和库存，并为它们提供搜索和自动填充建议。
2. 收集日志和交易数据，并进行分析：可使用Logstash来收集、聚合和解析数据， 然后让Logstash将此数据提供给ES。然后可在ES中搜索和聚合开发者感兴趣的信息。
3. 需要快速调查、分析、可视化查询大量数据的特定问题：可以使用ES存储数据，然后使用Kibana构建自定义仪表板，来可视化展示数据。还可以使用ES的聚合功能针对这些数据进行复杂的商业分析。

## 安装

本文章主要介绍在mac上面安装的过程，其他操作系统类似。

下载地址如下：

[es的中文官方文档](https://www.elastic.co/cn/downloads/elasticsearch)

![](https://pic.downk.cc/item/5eac316fc2a9a83be5a3325a.jpg)

可以看到最新的版本是：7.6.2.

es每个版本改动很大，7版本中去掉了es中的type类型，博主还没有去研究7的版本，因此，我下载的是6的版本，6.2.1的。

下载历史版本：

![](https://pic.downk.cc/item/5eac31f8c2a9a83be5a4084a.jpg)

### 解压

![](https://pic.downk.cc/item/5eac326fc2a9a83be5a4ff3b.jpg)

es的安装目录简单介绍：

1）bin目录：主要是es的启动，停止，安装插件的可执行程序

2）config目录：es的配置文件，修改es启动的ip地址，端口号等

3）lib目录：es执行依赖的jar包

4）logs目录：es运行过程中产生的日志文件

5）plugins目录：es可以自定义插件来扩展es的功能，此目录就是用来安装es插件的。



## 启动

1）前台运行

在es的解压后的目录下：

`./bin/elasticsearch`

![](/Users/liuzhuo/Library/Application Support/typora-user-images/image-20200501223708875.png)

2) 后台运行

`nohup ./bin/elasticsearhc &`

执行后，在当前目录下，可以看到 nohup的文件，`tail -f nohup` 来实时查看es的运行情况。

3）验证是否启动成功

在浏览器中输入：`http://localhost:9200/`

![](https://pic.downk.cc/item/5eac34a5c2a9a83be5a8d37f.jpg)

可以看到此时es的启动情况：

节点的name：node-1

集群的名字：gakki

es的版本号，lucene的版本号等。

## es的head插件

博主下载了es的head的谷歌浏览器的插件，可以很方便的查看es的健康、集群、索引的情况

![](https://pic.downk.cc/item/5eac3570c2a9a83be5aae685.jpg)

## es的简单restAPI介绍

今天，这里博主首先使用postman工具来发送http请求，后面会使用Kibana来操作。

### es启动验证

![](https://pic.downk.cc/item/5eac3700c2a9a83be5ad142b.jpg)

可以看到，使用get请求，输入：`http://localhost:9200/`

返回的结果和我们直接使用浏览器访问的结果一致。

### es中创建索引

![](https://pic.downk.cc/item/5eac3a44c2a9a83be5b0cb70.jpg)

这里，创建了一个名称为：hello，type：people，主分片数为：1，副本为：0的索引。因为，我这里只有一个节点，不再集群的环境，因此就一个主分配数，没有副本，如果后期搭建集群环境，创建索引时，可以合理安排这两个值。

验证：

在我们的es-head的插件中，可以非常直观的看到索引的信息，这也是我安装这个插件的原因

![](https://pic.downk.cc/item/5eac3b19c2a9a83be5b18f41.jpg)

### es中往索引中插入数据

![](https://pic.downk.cc/item/5eac3c6ac2a9a83be5b2fcd9.jpg)

根据我们创建的索引中的type类型来插入数据，上面我们创建了people类型，字段有id和name，类型都是String类型，String类型分为：keyword 和 text 类型，这个后面会介绍，现在只要知道是String类型即可。

### es中的查询

1）查询所有文档

`http://localhost:9200/hello/people/_search`

![](https://pic.downk.cc/item/5eac3e9ec2a9a83be5b5902f.jpg)

2) 查询指定的id的文档

`http://localhost:9200/hello/people/${_id}`

![](https://pic.downk.cc/item/5eac3f18c2a9a83be5b625d1.jpg)

3) 高级查询

根据name字段来查询

![](https://pic.downk.cc/item/5eac404ec2a9a83be5b76fb9.jpg)

es-head插件中也能直接看到数据：

![](https://pic.downk.cc/item/5eac40abc2a9a83be5b7e823.jpg)