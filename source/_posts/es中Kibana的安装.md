---

title: es中Kibana的安装
author: gakkij
categories:
  - elasticsearch
tags:
  - elasticsearch
img: https://pic.downk.cc/item/5ead8951c2a9a83be5e4a176.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5ead8951c2a9a83be5e4a176.jpg
toc: true
date: 2020-05-02 22:45:20
summary: es中kibana的安装与使用
password:
---

根据上篇博客，我们已经了解了es的基本概念和es的安装环境和启动命令，以及简单的crud指令操作。

现在，让我们开始学习kibana的安装与使用。

Kibana是专门用来为ElasticSearch设计开发的，可以提供数据查询，数据可视化等功能。

## 下载

[kibana的各种下载版本](https://www.elastic.co/cn/downloads/past-releases#kibana)

博主这里下载的是6.2.1的，各位可以选择与自己安装es的版本一致就行。

## 安装

安装步骤比较简单。

1. 下载完后解压到任意目录。
2. 启动es
3. 配置config目录下的kibana.yml的elasticsearch.url指向es地址
4. 运行bin目录下的kibana
5. 如果没有修改配置文件的端口，那么在浏览器中输入http://localhost:5601
6. 启动Kibana后，Kibana会自动在配置的es中创建一个名为.kibana的索引，用来存储数据，注意不要删除了。

---

修改kibana的配置文件：

![](https://pic.downk.cc/item/5ead8cc6c2a9a83be5e7bc86.jpg)

![](https://pic.downk.cc/item/5ead8e39c2a9a83be5e95cdd.jpg)

`./bin/kibana`启动kibana

![](https://pic.downk.cc/item/5ead91a4c2a9a83be5edee22.jpg)

ps：后台启动：`nohup ./bin/kibana &`

验证kibana是否启动成功：

在浏览器中输入：`http://localhost:5601/`

![](https://pic.downk.cc/item/5ead95c8c2a9a83be5f2e59c.jpg)

![](https://pic.downk.cc/item/5ead9632c2a9a83be5f34bce.jpg)

那，我们来创建一个索引pattern吧：

![](https://pic.downk.cc/item/5ead9798c2a9a83be5f4ca07.jpg)

![](https://pic.downk.cc/item/5ead97fdc2a9a83be5f52f43.jpg)

![](https://pic.downk.cc/item/5ead99e2c2a9a83be5f6c54f.jpg)

创建成功后：

![](https://pic.downk.cc/item/5ead9a1fc2a9a83be5f6efe1.jpg)

再次点击Discover：

![](https://pic.downk.cc/item/5ead9a4dc2a9a83be5f70de9.jpg)

能直观的看到hello索引中的数据。

## Kibana中执行restAPI

点击：Dev Tools

### 查看es索引的mapping结构

GET index/_mapping

![](https://pic.downk.cc/item/5ead9b0cc2a9a83be5f7c6fb.jpg)

### es中插入数据

```java
POST hello/people
{
  "id":"34567",
  "name":"li's"
}
```

![](https://pic.downk.cc/item/5ead9b75c2a9a83be5f83145.jpg)

### es中查询数据

1) 查询指定的 _id

```java
GET hello/people/MGcn1nEB9ShQhk7DF0Ql
  
这里的 MGcn1nEB9ShQhk7DF0Ql 是 文档的_id，该字段是唯一的标识符
```

![](https://pic.downk.cc/item/5ead9bfcc2a9a83be5f8c2b0.jpg)

2) 查询所有的数据

```java
GET hello/people/_search
```

![](https://pic.downk.cc/item/5ead9c8dc2a9a83be5f970a6.jpg)

3) es中的match查询（匹配）

```java
GET hello/people/_search
{
  "query": {
    "match": {
      "name": "张"
    }
  }
}
```

![](https://pic.downk.cc/item/5ead9ce7c2a9a83be5f9dec9.jpg)

可以看到，只查询到了name中包含张的数据，match后续会解释，现在只需要懂得match是匹配一个字符串中是否包含指定的parse即可。

---

ps：使用Kibana的工具中的Dev Tools时，输入restAPI时会有提示！

最终打开es-head，你会发现多了一个索引：.kibana

![](/Users/liuzhuo/Library/Application Support/typora-user-images/image-20200503001957825.png)