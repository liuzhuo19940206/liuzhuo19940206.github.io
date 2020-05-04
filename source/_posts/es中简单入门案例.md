---
title: es中简单入门案例
author: gakkij
categories:
  - elasticsearch
tags:
  - elasticsearch
img: https://pic.downk.cc/item/5eaf5c5dc2a9a83be54036ef.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5eaf5c5dc2a9a83be54036ef.jpg
toc: true
date: 2020-05-04 07:52:23
summary: es中的简单入门案例
password:
---

根据前面的学习，我们已经基本上了解了es的内部原理和基本的概念了，现在就让我们开始学习吧~~~

## 案例说明

让我们来创建一个员工的目录

假设我们在XXX公司工作，这时人力资源部门出于某种目的需要让我们建立一个员工目录，这个目录用于促进人文关怀和用于实时协同工作，所以它有以下不同的需要：

- 数据能包含多个值的标签、数字和纯文本
- 检索任何员工的所有信息
- 支持结构化搜索，例如查找30岁以上的员工
- 支持简单的全文搜索和更复杂的短语（phrase）搜索
- 高亮搜索结果中的关键字
- 能够利用图表管理分析这些数据

## 索引员工文档

我们首先要做的是存储员工数据，每个文档代表一个员工。在Elasticsearch中存储数据的行为就叫做索引(indexing)，不过 在索引之前，我们需要明确数据应该存储在哪里。

在Elasticsearch中，文档归属于一种类型(type),而这些类型存在于索引(index)中，我们可以画一些简单的对比图来类比传统 关系型数据库：

```java
Relational DB -> Databases -> Tables -> Rows -> Columns
Elasticsearch -> Indices -> Types -> Documents -> Fields
```

Elasticsearch集群可以包含多个索引(indices)（数据库），每一个索引可以包含多个类型(types)（表），每一个类型包含多 个文档(documents)（行），然后每个文档包含多个字段(Fields)（列）。

「索引」含义的区分:

你可能已经注意到索引(index)这个词在Elasticsearch中有着不同的含义，所以有必要在此做一下区分: 

- 索引（名词） 如上文所述，一个索引(index)就像是传统关系数据库中的数据库，它是相关文档存储的地方， index的复数是indices 或indexes。
-  索引（动词） 「索引一个文档」表示把一个文档存储到索引（名词）里，以便它可以被检索或者查询。这很像 SQL中的 INSERT 关键字，差别是，如果文档已经存在，新的文档将覆盖旧的文档。 
- 倒排索引 : 传统数据库为特定列增加一个索引，例如B-Tree索引来加速检索。Elasticsearch和Lucene使用一种叫做 倒排索引(inverted index)的数据结构来达到相同目的。

ps: **默认情况下，文档中的所有字段都会被索引（拥有一个倒排索引），只有这样他们才是可被搜索的。**

所以为了创建员工目录，我们将进行如下操作：

- 为每个员工的文档(document)建立索引，每个文档包含了相应员工的所有信息。 
- 每个文档的类型为 employee 。 
- employee 类型归属于索引 gakkij 。
-  gakkij 索引存储在Elasticsearch集群中。

实际上这些都是很容易的（尽管看起来有许多步骤）。我们能通过一个命令执行完成的操作:

```java
PUT /gakkij/employee/1
{
"first_name" : "John",
"last_name" : "Smith",
"age" : 25,
"about" : "I love to go rock climbing",
"interests": [ "sports", "music" ]
}
```

![](https://pic.downk.cc/item/5eaf5f2fc2a9a83be5411570.jpg)

说明：这里我使用了kibana的工具来发送http请求，大家也可以使用其他工具，都是类似的效果，例如：curl等。

思考：

1）在插入这条数据之前，我们的es中只有前面博客创建的 hello，kibana索引。

2）再没有创建索引和type的情况下，直接插入文档能成功吗？成功后，该索引的分片数和副本是多少呢？mapping的设置呢？

回答：

1）通过查看该条插入语句的返回值，可以明显的发现是插入成功的，result：created。

打开es的head也能看到效果：

![](https://pic.downk.cc/item/5eaf6096c2a9a83be5417b75.jpg)

这就是es强大的地方，我们不需要任何配置，es会自动帮我们处理一切工作，透明化处理；我们也能制定化配置，后面，我们慢慢来说吧~~~

2）通过上面的截图，我们能发现，es会自动帮我们创建一个索引，分片数为5，副本为1，即：10份数据。

但是，上面的图中，为啥只是显示五份数据呢？那是，因为目前我这里es的节点只有一个，集群中不存在其他的节点，es中需要保证主分片和副本不能在一个节点上面，否则就会毫无意义，主分片和副本在同一个节点的话，该节点失效后，岂不是该数据就都丢失了嘛。

因此，此时的健康状态是 yellow，大家注意到了么；主分片都可用，部分副本不可用就是 黄色（yellow）状态啦

3）查看该索引类型的mapping结构

![](https://pic.downk.cc/item/5eaf6274c2a9a83be54216e3.jpg)

看到，es会根据我们传入的json串的类似，自动帮我们推测该字段的类型。

字符串的类型：统一是text，字符串还有一个类型是：keyword。

整形：long。

关于es的类型，后面我们再说。

---

接下来，让我们在目录中加入更多员工信息：

```java
PUT /gakkij/employee/2
{
"first_name" : "Jane",
"last_name" : "Smith",
"age" : 32,
"about" : "I like to collect rock albums",
"interests": [ "music" ]
}

POST /gakkij/employee/          #这里，我没有传入id，es会自动帮我们创建一个uuid
{
"first_name" : "Douglas",
"last_name" : "Fir",
"age" : 35,
"about": "I like to build cabinets",
"interests": [ "forestry" ]
}
```

注意上面，我们插入数据时，带有id和不带id的区别！！！

## 检索文档

现在Elasticsearch中已经存储了一些数据，我们可以根据业务需求开始工作了。

第一个需求是能够检索单个员工的信息。 这对于Elasticsearch来说非常简单。

我们只要执行HTTP GET请求并指出文档的“地址”——索引、类型和ID既可。根据这三部 分信息，我们就可以返回原始JSON文档：

```java
GET /gakkij/employee/1
```

![](https://pic.downk.cc/item/5eaf6441c2a9a83be542a82a.jpg)

ps：我们通过HTTP方法 GET 来检索文档，同样的，我们可以使用 DELETE 方法删除文档，使用 HEAD 方法检查某文档是否存 在。如果想更新已存在的文档，我们只需再 PUT 一次【**字段会全部替换**，部分替换需要：_update】。

后面，我不截图了，图片太浪费资源了。。。

---

## 简单搜索

GET 请求非常简单——你能轻松获取你想要的文档。让我们来进一步尝试一些东西，比如简单的搜索！ 我们尝试一个最简单的搜索全部员工的请求：

```java
GET /gakkij/employee/_search
```

你可以看到我们依然使用 gakkij 索引和 employee 类型，但是我们在结尾使用关键字 **_search** 来取代原来的文档ID。响应内 容的 hits 数组中包含了我们所有的三个文档。<font color="red">**默认情况下搜索会返回前10个结果。**</font>

```java
{
  "took": 3,             //查询消耗的时长，单位：毫秒
  "timed_out": false,    // false：未超时
  "_shards": {
    "total": 5,          //5个分片数
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 3,         //查询到总数
    "max_score": 1,
    "hits": [
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "6JQl3XEBkV4diPZu8bHC",
        "_score": 1,
        "_source": {
          "first_name": "Douglas",
          "last_name": "Fir",
          "age": 35,
          "about": "I like to build cabinets",
          "interests": [
            "forestry"
          ]
        }
      },
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "2",
        "_score": 1,
        "_source": {
          "first_name": "Jane",
          "last_name": "Smith",
          "age": 32,
          "about": "I like to collect rock albums",
          "interests": [
            "music"
          ]
        }
      },
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "1",
        "_score": 1,
        "_source": {
          "first_name": "John",
          "last_name": "Smith",
          "age": 25,
          "about": "I love to go rock climbing",
          "interests": [
            "sports",
            "music"
          ]
        }
      }
    ]
  }
}
```

---

接下来，让我们搜索姓氏中包含“Smith”的员工。要做到这一点，我们将在命令行中使用**轻量级的搜索方法**。这种方法常被 称作**查询字符串(query string)搜索**.

### 字符串(query string)搜索

```java
GET /gakkij/employee/_search?q=last_name:Smith
```

```java
{
  "took": 23,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "2",
        "_score": 0.2876821,      //匹配到的分数：查询的内容对于查询消息的匹配程度
        "_source": {
          "first_name": "Jane",
          "last_name": "Smith",
          "age": 32,
          "about": "I like to collect rock albums",
          "interests": [
            "music"
          ]
        }
      },
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "1",
        "_score": 0.2876821,
        "_source": {
          "first_name": "John",
          "last_name": "Smith",
          "age": 25,
          "about": "I love to go rock climbing",
          "interests": [
            "sports",
            "music"
          ]
        }
      }
    ]
  }
}
```

我们在请求中依旧使用 _search 关键字，然后将查询语句传递给参数 q= 。这样就可以得到所有姓氏为Smith的结果。

### 使用DSL语句查询

查询字符串搜索便于通过命令行完成特定(ad hoc)的搜索，但是它也有局限性。Elasticsearch提供丰 富且灵活的查询语言叫做 DSL查询(Query DSL) , 它允许你构建更加复杂、强大的查询。

DSL(Domain Specific Language特定领域语言)以JSON请求体的形式出现。我们可以这样表示之前关于“Smith”的查询:

```java
GET /gakkij/employee/_search
{
  "query" : {
    "match" : {
       "last_name" : "Smith"
    }
  }
}
```

这会返回与之前查询相同的结果。你可以看到有些东西改变了，我们不再使用查询字符串(query string)做为参数，而是使用 **请求体** 代替。这个请求体使用JSON表示，其中使用了 match 语句（查询类型之一，具体我们以后会学到）。

说明：我们知道，http请求中，get请求是无法带上请求体的，只能在请求行中传递我们的参数，post请求才能携带请求体，这里为啥GET请求可以携带请求体呢？那是因为es内部帮我们处理了，转化了一下。

## 更复杂的搜索

我们让搜索稍微再变的复杂一些。我们依旧想要找到姓氏为“Smith”的员工，但是我们只想得到年龄大于30岁的员工。我们的 语句将添加过滤器(filter),它使得我们高效率的执行一个结构化搜索：

```java
GET /gakkij/employee/_search
{
  "query" : {
  	"filtered" : {
      "filter" : {
        "range" : {
            "age" : { "gt" : 30 }  //<1> 查询大于30岁的
            }
          },
          "query" : {
            "match" : {
            "last_name" : "smith"  //<2> 名字为：smith
        }
      }
    }
  }
}
```

然后呢？一不小心就出错了？

![](https://pic.downk.cc/item/5eaf6a8bc2a9a83be544e587.jpg)

然后，查找官方的文档，原来：发现是因为过滤查询被弃用了，并在ES 5.0中删除，而我的ES版本正是6.2.1

**所以，大家需要自己多动手去操作，有可能我现在讲的知识点，以后就会弃用了，执行失败了，大家需要自己去官方文档中去查找相关的知识点来验证正确性！！！**

改用：bool查询

```java
GET /gakkij/employee/_search
{
  "query" : {
  	"bool" : {
      "filter" : {
        "range" : {
            "age" : { "gt" : 30 }  
            }
          },
          "must" : {
            "match" : {
            "last_name" : "smith"
        }
      }
    }
  }
}
```

返回结果：

```java
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "2",
        "_score": 0.2876821,
        "_source": {
          "first_name": "Jane",
          "last_name": "Smith",
          "age": 32,
          "about": "I like to collect rock albums",
          "interests": [
            "music"
          ]
        }
      }
    ]
  }
}
```

年纪大于：30岁，名字为：smith的 只有一个。

PS：现在不要担心语法太多，我们将会在以后详细的讨论。

---

## 全文搜索

到目前为止搜索都很简单：搜索特定的名字，通过年龄筛选。

现在，让我们尝试一种更高级的搜索，全文搜索：**一种传统数据库 很难实现的功能**。 我们将会搜索所有喜欢“rock climbing”的员工：

```java
GET /gakkij/employee/_search
{
  "query" : {
    "match" : {
    	"about" : "rock climbing"
    }
  }
}
```

返回结果：

```java
{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 0.5753642,
    "hits": [
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "1",
        "_score": 0.5753642,  //相关性高
        "_source": {
          "first_name": "John",
          "last_name": "Smith",
          "age": 25,
          "about": "I love to go rock climbing",
          "interests": [
            "sports",
            "music"
          ]
        }
      },
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "2",
        "_score": 0.2876821,  //相关性低
        "_source": {
          "first_name": "Jane",
          "last_name": "Smith",
          "age": 32,
          "about": "I like to collect rock albums",
          "interests": [
            "music"
          ]
        }
      }
    ]
  }
}
```

全文检索：就是在查询的字段中，查询是否有匹配的字段的内容，不是精确匹配，包含关系。

默认情况下，Elasticsearch根据结果**相关性评分**来对结果集进行排序，所谓的「结果相关性评分」就是文档与查询条件的匹 配程度。很显然，排名第一的 John Smith 的 about 字段明确的写到“rock climbing”。 但是为什么 Jane Smith 也会出现在结果里呢？原因是“rock”在她的 abuot 字段中被提及了。因为只有“rock”被提及 而“climbing”没有，所以她的 _score 要低于John。 这个例子很好的解释了Elasticsearch如何在各种文本字段中进行全文搜索，并且返回相关性最大的结果集。相关性 (relevance)的概念在Elasticsearch中非常重要，而这个概念在传统关系型数据库中是不可想象的，因为传统数据库对记录的 查询只有匹配或者不匹配。

## 短语搜索

目前我们可以在字段中搜索单独的一个词，这挺好的，但是有时候你想要**确切的匹配**若干个单词或者短语(phrases)。例如我们想要查询 **同时 包含"rock"和"climbing"（并且是相邻的）的员工记录**。

 要做到这个，我们只要将 match 查询变更为 match_phrase 查询即可:

```java
GET /gakkij/employee/_search
{
  "query" : {
    "match_phrase" : {
    	"about" : "rock climbing"
    }
  }
}
```

毫无疑问，该查询返回John Smith的文档：

```java
{
  "took": 6,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.5753642,
    "hits": [
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "1",
        "_score": 0.5753642,
        "_source": {
          "first_name": "John",
          "last_name": "Smith",
          "age": 25,
          "about": "I love to go rock climbing",
          "interests": [
            "sports",
            "music"
          ]
        }
      }
    ]
  }
}
```

## 高亮我们的搜索

很多应用喜欢从每个搜索结果中高亮(highlight)匹配到的关键字，这样用户可以知道为什么这些文档和查询相匹配。

在 Elasticsearch中高亮片段是非常容易的。 让我们在之前的语句上增加 highlight 参数：

```java
GET /gakkij/employee/_search
{
  "query" : {
    "match_phrase" : {
        "about" : "rock climbing"
        }
      },
    "highlight": {
        "fields" : {
          "about" : {
        }
     }
  }
}
```

当我们运行这个语句时，会命中与之前相同的结果，但是在返回结果中会有一个新的部分叫做 **highlight** ，这里包含了来 自 about 字段中的文本，并且用  来标识匹配到的单词。

返回：

```java
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.5753642,
    "hits": [
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "1",
        "_score": 0.5753642,
        "_source": {
          "first_name": "John",
          "last_name": "Smith",
          "age": 25,
          "about": "I love to go rock climbing",
          "interests": [
            "sports",
            "music"
          ]
        },
        "highlight": {
          "about": [
            "I love to go <em>rock</em> <em>climbing</em>"
          ]
        }
      }
    ]
  }
}
```

## 分析聚合

最后，我们还有一个需求需要完成：允许管理者在职员目录中进行一些分析聚合。

Elasticsearch有一个功能叫做**聚合 (aggregations)**，它允许你在数据上生成复杂的分析统计。

它很像SQL中的 **GROUP BY** 但是功能更强大。 举个例子，让我们找到所有职员中最大的共同点（兴趣爱好）是什么：

```java
GET /gakkij/employee/_search
{
  "aggs": {
    "all_interests": {
    	"terms": { "field": "interests" }
    }
  }
}
```

一不小心又出现错误了。。。

![](https://pic.downk.cc/item/5eaf6f75c2a9a83be5469c4c.jpg)

这里很明显，需要使用带有keyword的查询

```java
GET /gakkij/employee/_search
{
  "aggs": {
    "all_interests": {
    	"terms": { "field": "interests.keyword" }
    }
  }
}
```

返回：

```java
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 3,
    "max_score": 1,
    "hits": [
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "6JQl3XEBkV4diPZu8bHC",
        "_score": 1,
        "_source": {
          "first_name": "Douglas",
          "last_name": "Fir",
          "age": 35,
          "about": "I like to build cabinets",
          "interests": [
            "forestry"
          ]
        }
      },
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "2",
        "_score": 1,
        "_source": {
          "first_name": "Jane",
          "last_name": "Smith",
          "age": 32,
          "about": "I like to collect rock albums",
          "interests": [
            "music"
          ]
        }
      },
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "1",
        "_score": 1,
        "_source": {
          "first_name": "John",
          "last_name": "Smith",
          "age": 25,
          "about": "I love to go rock climbing",
          "interests": [
            "sports",
            "music"
          ]
        }
      }
    ]
  },
  "aggregations": {
    "all_interests": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "music",
          "doc_count": 2
        },
        {
          "key": "forestry",
          "doc_count": 1
        },
        {
          "key": "sports",
          "doc_count": 1
        }
      ]
    }
  }
}
```

这里，我们主要看：aggregations的部分，hits的查询结果可以忽悠。

我们可以看到两个职员对音乐有兴趣，一个喜欢林学，一个喜欢运动。这些数据并没有被预先计算好，它们是实时的从匹配 查询语句的文档中动态计算生成的。如果我们想知道所有姓"Smith"的人最大的共同点（兴趣爱好），我们只需要增加合适的 语句既可：

```java
GET /gakkij/employee/_search
{
  "query": {
    "match": {
    "last_name": "smith"
    }
  },
  "aggs": {
    "all_interests": {
    	"terms": { "field": "interests.keyword" }
    }
  }
}
```

返回：此时只会在名字中存在smith中聚合数据了。

```java
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "2",
        "_score": 0.2876821,
        "_source": {
          "first_name": "Jane",
          "last_name": "Smith",
          "age": 32,
          "about": "I like to collect rock albums",
          "interests": [
            "music"
          ]
        }
      },
      {
        "_index": "gakkij",
        "_type": "employee",
        "_id": "1",
        "_score": 0.2876821,
        "_source": {
          "first_name": "John",
          "last_name": "Smith",
          "age": 25,
          "about": "I love to go rock climbing",
          "interests": [
            "sports",
            "music"
          ]
        }
      }
    ]
  },
  "aggregations": {
    "all_interests": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "music",
          "doc_count": 2
        },
        {
          "key": "sports",
          "doc_count": 1
        }
      ]
    }
  }
}
```

---

聚合也允许分级汇总。例如，让我们统计每种兴趣下职员的平均年龄：

```java
GET /gakkij/employee/_search
{
  "aggs" : {
    "all_interests" : {
      "terms" : { "field" : "interests" },
        "aggs" : {
          "avg_age" : {
          	"avg" : { "field" : "age" }
        }
      }
    }
  }
}
```

返回：

```
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 3,
    "max_score": 1,
    "hits": [~]
  },
  "aggregations": {
    "all_interests": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "music",
          "doc_count": 2,
          "avg_age": {
            "value": 28.5
          }
        },
        {
          "key": "forestry",
          "doc_count": 1,
          "avg_age": {
            "value": 35
          }
        },
        {
          "key": "sports",
          "doc_count": 1,
          "avg_age": {
            "value": 25
          }
        }
      ]
    }
  }
}
```

该聚合结果比之前的聚合结果要更加丰富。我们依然得到了兴趣以及数量（指具有该兴趣的员工人数）的列表，但是现在每 个兴趣额外拥有 avg_age 字段来显示具有该兴趣员工的平均年龄。 即使你还不理解语法，但你也可以大概感觉到通过这个特性可以完成相当复杂的聚合工作，你可以处理任何类型的数据。

---

## 总结

希望这个简短的教程能够很好的描述Elasticsearch的功能。当然这只是一些皮毛，为了保持简短，还有很多的特性未提及 ——像推荐、定位、渗透、模糊以及部分匹配等。但这也突出了构建高级搜索功能是多么的容易。无需配置，只需要添加数 据然后开始搜索！