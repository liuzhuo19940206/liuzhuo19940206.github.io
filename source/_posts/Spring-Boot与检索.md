---
title: Spring Boot与检索
categories:
  - SpringBoot
  - 检索
tags:
  - SpringBoot
  - 检索
date: 2018-11-16 14:35:48
summary: Springboot与ElasticSearch整合使用
---

ElasticSearch

## 检索

我们的应用经常需要添加检索功能，开源的 ElasticSearch 是目前全文搜索引擎的首选。他可以快速的存储、搜索和分析海量数据。Spring Boot通过整合SpringData ElasticSearch为我们提供了非常便捷的检索功能支持；

Elasticsearch是一个分布式搜索服务，提供Restful API，底层基于Lucene，采用多shard（分片）的方式保证数据安全，并且提供自动resharding的功能，github等大型的站点也是采用了ElasticSearch作为其搜索服务。

## 概念

以 <font color="red">**员工文档**</font> 的形式存储为例：一个<font color="red">**文档**</font>代表一个员工数据。存储数据到ElasticSearch 的行为叫做 <font color="red">**索引**</font> ，但在索引一个文档之前，需要确定将文档存储在哪里。

一个 ElasticSearch 集群可以 包含多个 <font color="red">**索引**</font> ，相应的每个索引可以包含多个 <font color="red">**类型**</font> 。 这些不同的类型存储着多个 <font color="red">**文档** </font>，每个文档又有 多个 <font color="red">**属性** </font>

类似关系：
– 索引-数据库
– 类型-表
– 文档-表中的记录
– 属性-列

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116154034.png"/>

打开官网 [ElasticSearch](https://www.elastic.co/cn/products/elasticsearch)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116155202.png"/>

[《Elasticsearch: 权威指南》中文版](https://www.elastic.co/guide/cn/elasticsearch/guide/current/index.html)

## 安装ElasticSearch

打开我们的虚拟机，下载ElasticSearch镜像

```
docker pull registry.docker-cn.com/library/elasticsearch
```

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116161527.png"/>

elasticsearch:默认是使用2g的堆内存，直接启动的话，我们的虚拟机有可能不够，所以，我们需要设置elasticsearch的堆内存的大小：

使用 -e ES_JAVA_OPTS="-Xms256m -Xmx256m" 来设置堆的最大、最小都是256兆。

完整的启动命令：
elasticsearch的默认端口号是9200，和分布式的节点之间通信的端口号：9300
```
docker run -e ES_JAVA_OPTS="-Xms256m -Xmx256m" -d -p 9200:9200 -p 9300:9300 --name ESO1 elasticsearch的镜像id
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116161744.png"/>

打开浏览器，输入：`http://10.6.11.17:9200/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116162123.png"/>

以上，说明ElasticSearch启动成功！

---

## ElasticSearch简单操作

ElasticSearch：使用 RESTful API 通过端口 9200 进行通信，使用 JavaScript Object Notation 或者 JSON 作为文档的序列化格式。

考虑一下这个 JSON 文档，它代表了一个 user 对象：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116162822.png"/>

---

打开我们的postman工具
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116162539.png"/>

在Elasticsearch: 权威指南的基础入门中：适应新环境

例子为：创建一个雇员目录
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116163020.png"/>

对于雇员目录，我们将做如下操作：

- 每个雇员索引一个文档，包含该雇员的所有信息。

- 每个文档都将是 employee 类型 。

- 该类型位于 索引 megacorp 内。

- 该索引保存在我们的 Elasticsearch 集群中。

实践中这非常简单（尽管看起来有很多步骤），我们可以通过一条命令完成所有这些动作：

### 创建雇员信息

在postman中：输入 `10.6.11.17:9200/megacorp/employee/1`

选择：PUT请求 --> Body --> raw --> JSON:
```
{
    "first_name" : "John",
    "last_name" :  "Smith",
    "age" :        25,
    "about" :      "I love to go rock climbing",
    "interests": [ "sports", "music" ]
}
```
点击Send发送：
响应数据：
```
{
    "_index": "megacorp",
    "_type": "employee",
    "_id": "1",
    "_version": 1,
    "result": "created",
    "_shards": {
        "total": 2,
        "successful": 1,
        "failed": 0
    },
    "created": true
}
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116163804.png"/>

以上：我们就插入数据成功了。

注意，路径 /megacorp/employee/1 包含了三部分的信息：

megacorp：索引名称

employee：类型名称

1：特定雇员的ID

请求体 —— JSON 文档 —— 包含了这位员工的所有详细信息，他的名字叫 John Smith ，今年 25 岁，喜欢攀岩。

很简单！无需进行执行管理任务，如创建一个索引或指定每个属性的数据类型之类的，可以直接只索引一个文档。Elasticsearch 默认地完成其他一切，因此所有必需的管理任务都在后台使用默认设置完成。

进行下一步前，让我们增加更多的员工信息到目录中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116164222.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116164537.png"/>

---

### 简单检索

目前我们已经在 Elasticsearch 中存储了一些数据， 接下来就能专注于实现应用的业务需求了。第一个需求是可以检索到单个雇员的数据。

这在 Elasticsearch 中很简单。简单地执行 一个 HTTP GET 请求并指定文档的地址——索引库、类型和ID。 使用这三个信息可以返回原始的 JSON 文档：

GET /megacorp/employee/1
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116164722.png"/>

返回结果包含了文档的一些元数据，以及 _source 属性，内容是 John Smith 雇员的原始 JSON 文档：
```
{
  "_index" :   "megacorp",
  "_type" :    "employee",
  "_id" :      "1",
  "_version" : 1,
  "found" :    true,
  "_source" :  {
      "first_name" :  "John",
      "last_name" :   "Smith",
      "age" :         25,
      "about" :       "I love to go rock climbing",
      "interests":  [ "sports", "music" ]
  }
}
```

**PS:将 HTTP 命令由 PUT 改为 GET 可以用来检索文档，同样的，可以使用 DELETE 命令来删除文档，以及使用 HEAD 指令来检查文档是否存在。如果想更新已存在的文档，只需再次 PUT 。**

### 轻量检索

一个 GET 是相当简单的，可以直接得到指定的文档。 现在尝试点儿稍微高级的功能，比如一个简单的搜索！

第一个尝试的几乎是最简单的搜索了。我们使用下列请求来搜索所有雇员：

GET /megacorp/employee/_search

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116165326.png"/>

可以看到，我们仍然使用索引库 megacorp 以及类型 employee，但与指定一个文档 ID 不同，这次使用 _search 。返回结果包括了所有三个文档，放在数组 hits 中。一个搜索默认返回十条结果。

注意：返回结果不仅告知匹配了哪些文档，还包含了整个文档本身：显示搜索结果给最终用户所需的全部信息。

接下来，尝试下搜索姓氏为 ``Smith`` 的雇员。为此，我们将使用一个 高亮 搜索，很容易通过命令行完成。这个方法一般涉及到一个 查询字符串 （_query-string_） 搜索，因为我们通过一个URL参数来传递查询信息给搜索接口：

GET /megacorp/employee/_search?q=last_name:Smith

我们仍然在请求路径中使用 _search 端点，并将查询本身赋值给参数 q= 。返回结果给出了所有的 Smith：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116165612.png"/>

---

### 使用查询表达式搜索

Query-string 搜索通过命令非常方便地进行临时性的即席搜索 ，但它有自身的局限性（参见 轻量 搜索 ）。Elasticsearch 提供一个丰富灵活的查询语言叫做 查询表达式 ， 它支持构建更加复杂和健壮的查询。

领域特定语言 （DSL）， 指定了使用一个 JSON 请求。我们可以像这样重写之前的查询所有 Smith 的搜索 
```
GET /megacorp/employee/_search
{
    "query" : {
        "match" : {
            "last_name" : "Smith"
        }
    }
}
```

因为 GET请求，无法带这样格式的json请求参数，所以我们使用POST请求即可：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116170032.png"/>

返回结果与之前的查询一样，但还是可以看到有一些变化。其中之一是，不再使用 query-string 参数，而是一个请求体替代。这个请求使用 JSON 构造，并使用了一个 match 查询（属于查询类型之一，后续将会了解）。

**更多的查询操作，请看ElasticSearch的官方文档即可**：https://www.elastic.co/guide/cn/elasticsearch/guide/current/index.html

## 整合Springboot与ElasticSearch

1）创建Springboot的项目，添加web、ElasticSearch模块：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116170704.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116170735.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116172604.png"/>

2）在autoconfig包下：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116172848.png" style="width:50%"/>

发现有两处ElasticSearch：

1. data包下，有一个ElasticSearch

2. 直接在ElasticSearch包，有一个jest包

即：Springboot提供了两种方式来使用ElasticSearch。

data包下的ElasticSearch是Springboot默认提供的。 

jest默认不支持的，需要jest的工具包(io.searchbox.client.JestClient)

### 使用jest

1）注释掉:spring-boot-starter-data-elasticsearch
```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-data-elasticsearch</artifactId>
</dependency>
```

添加jest的依赖包：
在mave中央仓库：搜索：jest
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116173628.png"/>

因为我的ElasticSearch的版本是：5.6.12
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116173725.png"/>

所以，jest的版本选择5.x.x的即可：
```
<!-- https://mvnrepository.com/artifact/io.searchbox/jest -->
<dependency>
    <groupId>io.searchbox</groupId>
    <artifactId>jest</artifactId>
    <version>5.3.3</version>
</dependency>
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116173907.png"/>

2) 打开：JestAutoConfiguration类
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116174005.png"/>

导入了一个：jestClient类
```
	@Bean(destroyMethod = "shutdownClient")
	@ConditionalOnMissingBean
	public JestClient jestClient() {
		JestClientFactory factory = new JestClientFactory();
		factory.setHttpClientConfig(createHttpClientConfig());
		return factory.getObject();
	}
```

3）给application配置文件中，添加ElasticSearch的相关配置：

查看JestProperties类，了解需要配置哪些信息：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116174251.png"/>

application：
```
#ElasticSearch的相关配置
spring.elasticsearch.jest.uris=http://10.6.11.17:9200  #虚拟机的ip地址
```

4) 启动Springboot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116174615.png"/>

5）在测试类中测试：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116174851.png"/>

6）编写一个POJO类：

在bean包，创建一个Article类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116175201.png"/>
```
public class Article {

    //标记id为ElasticSearch中的id
    @JestId
    private Integer id;
    private String author;
    private String title;
    private String content;

    set 和 get 方法
}
```

7）创建一个测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116175854.png"/>

```
	@Test
	public void testInsert(){

		Article article = new Article();
		article.setId(1);
		article.setAuthor("zhangsan");
		article.setTitle("好消息");
		article.setContent("Hello world!");

		//创建一个：索引：liuzhuo , 类型：news ,id：使用了@JestId标记了id，这里可以不用设置了
		Index index = new Index.Builder(article).index("liuzhuo").type("news").build();

		try {
			//执行
			jestClient.execute(index);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
```

执行testInsert()方法后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116184113.png"/>

在浏览器中，输入：`http://10.6.11.17:9200/liuzhuo/news/1`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116184216.png"/>

插入数据成功！

---

现在，测试搜索功能：

使用：搜索content内容为：hello
```
{
    "query" : {
        "match" : {
            "content" : "hello"
        }
    }
}
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116185001.png"/>
```
	@Test
	public void search(){
		String json ="{\n" +
				"    \"query\" : {\n" +
				"        \"match\" : {\n" +
				"            \"content\" : \"hello\"\n" +
				"        }\n" +
				"    }\n" +
				"}";
		//构建搜索功能
		Search search = new Search.Builder(json).addIndex("liuzhuo").addType("news").build();
		try {
			SearchResult result = jestClient.execute(search);
			System.out.println(result.getJsonString());
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
```

运行测试：search()方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116185155.png"/>

更多：jest的操作，可以看jest的文档。

打开github的官网，搜索 jest
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116185510.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116185604.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116185712.png"/>

### 使用SpringData

1）在pom文件中：放开spring-boot-starter-data-elasticsearch的注释
```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-data-elasticsearch</artifactId>
</dependency>
```

打开：ElasticsearchAutoConfiguration类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116190656.png"/>

再看：ElasticsearchDataAutoConfiguration类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116190900.png"/>

导入了一个：ElasticsearchTemplate 来操作ElasticSearch的模板类

使用：ElasticsearchProperties 来配置相关信息：

Client：节点的信息 clusterName：名字，clusterNodes：操作的节点ip地址

编写了一个ElasticSearchRepository的子接口来操作ES。

2）在application配置文件中：添加SpringData的ES信息
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116195934.png"/>
```
#使用SprigData的ES配置信息
spring.data.elasticsearch.cluster-name=elasticsearch #默认也elasticsearch
#使用9300端口通信，与jest不同！！！
spring.data.elasticsearch.cluster-nodes=10.6.11.17:9300
```
spring.data.elasticsearch.cluster-name:怎么确定的呢？

在浏览器中输入：`http://10.6.11.17:9200/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116191639.png"/>

3) 启动Springboot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116200034.png"/>

出现了异常！！！异常错误，连接超时！！！

why？ 这是因为我们的ElasticSearch是5.6.12，而导入的SpringData的ElasticSearch依赖是2.4.6
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116192036.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116192001.png" style="width:50%"/>

版本不一致产生的异常。

怎样确定 SpringData-ElasticSearch 与 ElasticSearch 的版本对应关系呢？

打开Spring的官网，找到Spring data模块
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116193409.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116193435.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116193714.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116193935.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116194020.png"/>

所以，现在有两种方案：

1）升级Springboot的版本，将Springboot升级到3.0.x以后。

2）下载2.x.x的ElasticSearc

我这里选择下载第二种方案：

打开docker的hub仓库，搜索ElasticSearch
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116194312.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116194414.png"/>

打开虚拟机的客户端：

输入：
```
docker pull registry.docker-cn.com/library/elasticsearch:2.4.6
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116194702.png"/>

启动 2.4.6 版本的ElasticSearch。

因为 9200 和 9300 的docker端口号已经被 5版本的ElasticSearch占领了，所以选择 9201 和 9301端口号

```
docker run -e ES_JAVA_OPTS="-Xms256m -Xmx256m" -d -p 9201:9200 -p 9301:9300 --name ESO2 elasticsearch的镜像id
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116195123.png"/>

在浏览器中输入：`http://10.6.11.17:9201/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116195248.png"/>

以上，2.4.6 的ElasticSearch启动成功。

4）修改application配置文件：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116200335.png"/>
```
#ElasticSearch的相关配置
spring.elasticsearch.jest.uris=http://10.6.11.17:9200

#使用SprigData的ES配置信息
spring.data.elasticsearch.cluster-name=elasticsearch
#使用9300端口通信，与jest不同！！！
spring.data.elasticsearch.cluster-nodes=10.6.11.17:9301
```

5）启动Springboot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116200556.png"/>

两种使用ElasticSearch的配置，都启动成功了。现在我们只使用SpringData操作ElasticSearch的方式。


SpringData：提供了两种方式来操作ElasticSearc：

1）使用 ElasticsearchRepository

2）使用 ElasticsearchTemplate

---

6）使用 ElasticsearchRepository

在bean包下，创建Book类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116200928.png"/>

在repository包下，创建bookRepository接口，继承ElasticsearchRepository：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116201218.png"/>

在test类下，注入bookRepository
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116201453.png"/>

但是，发现index方法，没法设置 索引，类型，id。其实我们需要在Book类上，添加@Document注解，来设置索引和类型
```
@Document(indexName = "liuzhuo",type = "book")
public class Book {
```

启动测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116201909.png"/>

在浏览器中输入：`http://10.6.11.17:9201/liuzhuo/book/_search` 查询索引是liuzhuo，类型是book的所有数据：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116202042.png"/>

修改测试方法：
```
    @Test
    public void test() {
        Book book = new Book();
        book.setId(1);
        book.setBookName("西游记");
        book.setAuthor("罗贯中");
        bookRepository.index(book);
    }
```

运行测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116202244.png"/>

我们还有可以直接在BookRepository接口中，编写接口，就和JPA一样：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116202524.png"/>

```
//泛型上面的参数：查找的类型 和 id的类型
public interface BookRepository extends ElasticsearchRepository<Book,Integer> {

    //根据book的名字来模糊匹配所有的book
    public List<Book> findByBookNameLike(String bookName);

}
```
```
    @Test
    public void searchBook(){
        List<Book> bookList = bookRepository.findByBookNameLike("游");
        for (Book book : bookList) {
            System.out.println(book);
        }
    }
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116202952.png"/>

更多用法：请看官方文档：https://docs.spring.io/spring-data/elasticsearch/docs/2.1.16.RELEASE/reference/html/
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116203116.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/search/QQ截图20181116203245.png"/>



