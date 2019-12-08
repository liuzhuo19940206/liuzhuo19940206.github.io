---
title: Spring Boot与消息
categories:
  - SpringBoot
  - 消息
tags:
  - SpringBoot
  - 消息
date: 2018-11-15 12:50:02
summary: JMS、AMQP、RabbitMQ的消息处理机制
---

JMS、AMQP、RabbitMQ的消息处理机制

## 概述

1）大多应用中，可通过消息服务中间件来提升系统异步通信、扩展解耦能力

2）消息服务中两个重要概念：<font color="red">消息代理（message broker）</font> 和 <font color="red">目的地（destination）</font>

　 当消息发送者发送消息以后，将由消息代理接管，消息代理保存消息并且传递消息到指定目的地。

3）消息队列主要有两种形式的目的地

　　1）<font color="red">队列</font>：点对点消息通信（point-to-point）
　　2）<font color="red">主题</font>：发布（publish）/订阅（subscribe）消息通信

4）点对点式

　　消息发送者发送消息，消息代理将其放入一个队列中，消息接收者从队列中获取消息内容，消息读取后被移出队列
　　**消息只有唯一的发送者和接受者，但并不是说只能有一个接收者。**

5）发布订阅式

　　发送者（发布者）发送消息到主题，多个接收者（订阅者）监听（订阅）这个主题，那么就会在消息到达时同时收到消息。

6）JMS（Java Message Service）JAVA消息服务

　　基于JVM消息代理的规范。**ActiveMQ**、HornetMQ是JMS实现。

7）AMQP（Advanced Message Queuing Protocol）

　　高级消息队列协议，也是一个消息代理的规范，兼容JMS。**RabbitMQ**是AMQP的实现。

## 应用场景

### 异步处理
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115131013.png"/>

### 应用解耦
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115131131.png"/>

### 流量削峰
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115131347.png"/>

## JMS与AMQP的区别
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115131921.png"/>

主要区别：JMS是基于javaEE规范的，所以不跨语言，不跨平台，如果你的系统都是基于java开发的，那么使用JMS没有问题。
AMQP：跨语言，跨平台。

---

## Spring支持消息服务

　　spring-jms提供了对JMS的支持

　　spring-rabbit提供了对AMQP的支持

　　需要ConnectionFactory的实现来连接消息代理

　　**提供JmsTemplate、RabbitTemplate来发送消息**

　　**@JmsListener（JMS）、@RabbitListener（AMQP）注解在方法上监听消息代理发布的消息**

　　**@EnableJms、@EnableRabbit开启支持**

## Springboot自动配置消息服务

　　**JmsAutoConfiguration**

　　**RabbitAutoConfiguration**

## RabbitMQ简介

**RabbitMQ简介：**

RabbitMQ是一个由erlang开发的AMQP(Advanved Message Queue Protocol)的开源实现。

**核心概念**

<font color="blue">Message：</font>
消息，消息是不具名的，它由消息头和消息体组成。消息体是不透明的，而消息头则由一系列的可选属性组成，这些属性包括routing-key（路由键）、priority（相对于其他消息的优先权）、delivery-mode（指出该消息可能需要持久性存储）等。

<font color="blue">Publisher:</font>
消息的生产者，也是一个向交换器发布消息的客户端应用程序。

<font color="blue">Exchange:</font>
交换器，用来接收生产者发送的消息并将这些消息路由给服务器中的队列。Exchange有4种类型：direct(默认)，fanout, topic, 和headers，不同类型的Exchange转发消息的策略有所区别.

<font color="blue">Queue：</font>
消息队列，用来保存消息直到发送给消费者。它是消息的容器，也是消息的终点。一个消息可投入一个或多个队列。消息一直在队列里面，等待消费者连接到这个队列将其取走。

<font color="blue">Binding：</font>
绑定，用于消息队列和交换器之间的关联。一个绑定就是基于路由键将交换器和消息队列连接起来的路由规则，所以可以将交换器理解成一个由绑定构成的路由。Exchange 和Queue的绑定可以是多对多的关系。

<font color="blue">Connection：</font>
网络连接，比如一个TCP连接。

<font color="blue">Channel：</font>
信道，多路复用连接中的一条独立的双向数据流通道。信道是建立在真实的TCP连接内的虚拟连接，AMQP 命令都是通过信道发出去的，不管是发布消息、订阅队列还是接收消息，这些动作都是通过信道完成。因为对于操作系统来说建立和销毁 TCP 都是非常昂贵的开销，所以引入了信道的概念，以复用一条 TCP 连接。

<font color="blue">Consumer：</font>
消息的消费者，表示一个从消息队列中取得消息的客户端应用程序。

<font color="blue">Virtual Host：</font>
虚拟主机，表示一批交换器、消息队列和相关对象。虚拟主机是共享相同的身份认证和加密环境的独立服务器域。每个 vhost 本质上就是一个 mini 版的 RabbitMQ 服务器，拥有自己的队列、交换器、绑定和权限机制。vhost 是 AMQP 概念的基础，必须在连接时指定，RabbitMQ 默认的 vhost 是 / 。

<font color="blue">Broker：</font>
表示消息队列服务器实体。

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115133357.png"/>

## RabbitMQ运行机制

AMQP 中的消息路由：

　　AMQP 中消息的路由过程和 Java 开发者熟悉的 JMS 存在一些差别，AMQP 中增加了**Exchange** 和 **Binding** 的角色。生产者把消息发布到 Exchange 上，消息最终到达队列并被消费者接收，而 Binding 决定交换器的消息应该发送到那个队列。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115135917.png"/>

Exchange 类型：

　　 Exchange分发消息时根据类型的不同分发策略有区别，目前共四种类型：**direct、fanout、topic**、headers 。headers 匹配 AMQP 消息的 header，而不是路由键， headers 交换器和 direct 交换器完全一致，但性能差很多，目前几乎用不到了，所以直接看另外三种类型：

### direct：

消息中的路由键（routing key）如果和 Binding 中的 bindingkey 一致， 交换器就将消息发到对应的队列中。路由键与队列名完全匹配，如果一个队列绑定到交换机要求路由键为“dog”，则只转发 routing key 标记为“dog”的消息，不会转发“dog.puppy”，也不会转发“dog.guard”等等。**它是完全匹配、单播的模式。**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115140202.png"/>

### fanout：

每个发到 fanout 类型交换器的消息都会分到所有绑定的队列上去。fanout 交换器不处理路由键，只是简单的将队列绑定到交换器上，每个发送到交换器的消息都会被转发到与该交换器绑定的所有队列上。很像子网**广播**，每台子网内的主机都获得了一份复制的消息。**fanout 类型转发消息是最快的。**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115140400.png"/>

### topic：

topic 交换器通过**模式匹配**分配消息的路由键属性，将路由键和某个模式进行匹配，此时队列需要绑定到一个模式上。它将路由键和绑定键的字符串切分成单词，这些 单词之间用点隔开。它同样也会识别两个通配符：符号“ `#` ”和符号“ `*` ”。 # 匹配 0 个或多个单词， * 匹配一个单词。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115140644.png"/>

## RabbitMQ整合

全局整合步骤：

1. **引入 spring-boot-starter-amqp**

2. **application.yml配置**

3. **测试RabbitMQ**
   1. AmqpAdmin：管理组件
   
   2. RabbitTemplate：消息发送处理组件

---

### 安装rabbitmq：docker镜像

打开虚拟机，连接虚拟机：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115143023.png"/>

在docker hub中：搜索rabbitmq：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115143549.png"/>

点击tags：选择带有manager的标签，因为这样的rabbitmq会带有管理消息队列的界面。

我这里就选择：3.6-management
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115143811.png"/>

在虚拟机客户端：输入 `docker pull registry.docker-cn.com/library/rabbitmq:3.6-management`

前缀：registry.docker-cn.com/library/   是加速的功能！！！

下载完成：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115144251.png"/>

运行rabbitmq镜像：

输入：`docker run -d -p 5672:5672 -p 15672:15672 --name myrabbitmq registry.docker-cn.com/library/rabbitmq:3.6-management`

**注意：这里有两个端口号，5672是rabbitmq的默认端口号，15672是rabbitmq的界面管理的端口号**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115175455.png"/>

验证是否启动成功：

在浏览器中输入：`http://10.6.11.17:15672/` 这里的ip地址是你的虚拟机的ip地址。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115145020.png"/>

用户名和密码都是：guest
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115145130.png"/>

这里，我们主要关注 Exchanges 和 Queues。

现在我们来根据下图的 Exchange 和 Queue 来设置、验证。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115145557.png"/>

图中，我们有三个类型的Exchange：

exchange.direct ：direct类型的Exchange

exchange.fanout：fanout类型的Exchange

exchange.topic：topic类型的Exchange

四个Queue：

liuzhuo、liuzhuo.news、liuzhuo.emps、gakki.news

---

现在，我们在rabbitmq管理界面中，添加上诉的 Exchange 和 Queue

点击：Exchanges，然后点击：Add a new exchange
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115150037.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115150358.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115150454.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115150521.png"/>

三个类型的Exchange添加成功后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115150616.png"/>

---

点击：Queues，然后点击：Add a new queue
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115150740.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115150835.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115150916.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115150941.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115151007.png"/>

四个queue添加成功后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115151047.png"/>

---

现在，将Exchange和queue绑定在一起：

点击：exchange.direct，再点击Bindings：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115151512.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115151546.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115151612.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115151639.png"/>

exchange.direct 绑定四个队列成功后：

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115151828.png"/>

现在，在exchange.direct下，发送消息：（点击Publish message）
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115152200.png"/>

direct类型的Exchange，是一对一的形式，虽然exchange.direct绑定了四个队列，但是只要liuzhuo路由键的队列才能收到消息：

点击Queues
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115152416.png"/>
点击liuzhuo队列，查看具体的消息
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115152548.png"/>

---

给 exchange.fanout 也绑定 四个队列：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115152858.png"/>
类推：四个队列绑定成功后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115153100.png"/>

现在，在exchange.fanout下，发送消息：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115153320.png"/>

发送消息之后，四个消息队列都会收到消息：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115153426.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115153536.png"/>

---

给 exchange.topic 绑定模式匹配的消息队列：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115153958.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115154107.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115154137.png"/>

最后：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115154227.png"/>

在 exchange.topic 下 ，发送消息：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115154442.png"/>

查看消息队列：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115154546.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115154656.png"/>

**大家有可能看不到topic的消息，因为你们没有移除消息，看到都是第一条消息，看不到后面的消息。**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115155028.png"/>

改为false后，点击Get Message(s)后，会 **获取当前消息** 并 **移除当前消息**。

### 整合rabbitmq到Springboot中

1）创建新的Springboot工程：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115163556.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115163639.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115170221.png"/>

只要导入了amqp的starter，Springboot就会自动帮我们配置rabbitmq。

原理：

打开：RabbitAutoConfiguration
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115170518.png"/>

1. 帮我们创建了RabbitConnectionFactoryCreator：rabbitmq的工厂连接器。
2. 使用RabbitProperties类，来配置rabbitmq。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115170755.png"/>

3. 创建rabbitTemplate来操作rabbitmq
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115170904.png"/>

4. 创建了AmqpAdmin：来管理rabbitmq的组件
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115171113.png"/>

---

现在，我们来使用Springboot帮我们注入的rabbitTemplate来操作rabbitmq：

在application配置文件中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115172810.png"/>
```
#配置rabbitmq的信息
spring.rabbitmq.host=10.6.11.17
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest

#spring.rabbitmq.port=5672        //默认就是5672，可以不配置
#spring.rabbitmq.virtual-host=/   //默认就是/的虚拟主机，可以不配置
```


在test包下，测试我们的rabbitTemplate：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115171844.png"/>
```
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringBoot02AmqpApplicationTests {

	@Autowired
	private RabbitTemplate rabbitTemplate;

	@Test
	public void test01(){
                //exchange:Exchange交换机
		//routingKey:路由键
		//message:消息体，需要自己实现。
		//rabbitTemplate.send(exchange,routingKey,message);

		//object:消息的内容，我们不需要自己写消息头，消息体了，自动帮我们
		//解析。所以一般我们使用：convertAndSend
		//rabbitTemplate.convertAndSend(exchange,routingKey,object);

		Map<String,Object> map = new HashMap<>();
		map.put("id","1");
		map.put("name","zhangsan");
		rabbitTemplate.convertAndSend("exchange.direct","liuzhuo.news",map);
	}


	@Test
	public void contextLoads() {
	}

}
```
清空，我们消息队列中的消息：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115172310.png"/>

执行test01：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115175833.png"/>

打开：Queues
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115180117.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115180249.png"/>

消息发送成功，只是是以jdk序列化的形式序列化消息的。

从消息队列中，获取消息：

再写一个测试方法：
```
@Test
public void test02(){
	//参数：队列的名字
	Object o = rabbitTemplate.receiveAndConvert("liuzhuo.news");
	System.out.println(o.getClass());
	System.out.println(o);
}
```
执行该测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115180643.png"/>

---

现在，我们修改一下，序列化的方式：

默认的序列化的是：
```
private volatile MessageConverter messageConverter = new SimpleMessageConverter();
```

在config下：创建RabbitmqConfig配置类：

配置：json的序列化器：
org.springframework.amqp.support.converter.MessageConverter
在MessageConverter上，ctrl+H：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115184655.png" style="width:50%"/>
Springboot已经帮我们，创建好了json的序列化器。

直接注册到容器即可：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115184554.png"/>

现在，容器就会使用Jackson2JsonMessageConverter()，不会使用默认的new SimpleMessageConverter()。

---

再次运行test01():
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115185107.png"/>

再次运行test02():
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115185214.png"/>

---

在bean包下，创建person类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115185350.png"/>

**注意：提供get和set方法**

修改test01方法：
```
	@Test
	public void test01(){
		Person person = new Person("dengjie",18);
		rabbitTemplate.convertAndSend("exchange.direct","liuzhuo.news",person);

	}
```

修改test02方法：
```
@Test
public void test02(){
	//参数：队列的名字
	Person person = (Person) rabbitTemplate.receiveAndConvert("liuzhuo.news");
	System.out.println(person.getClass());
	System.out.println(person);
}
```

运行test01：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115190126.png"/>

运行test02：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115190228.png"/>

json序列化成功！！！

---

以上都是我们发送消息，然后手动获取消息。现在我们使用rabbitmq的注解监听器来自动帮我们获取消息队列中的消息。

在service包下，创建PersonService：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115191858.png"/>

在启动类中，开启rabbitmq的注解启动功能：
@EnableRabbit
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115191955.png"/>

启动Springboot应用：

然后运行test01：给liuzhuo.news队列中，发送一个消息。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115192156.png"/>

打开控制台：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115192236.png"/>

监听liuzhuo.news队列成功。

如果，我们想要获取消息的更多信息，比如消息头、消息体。

在PersonService中：(使用Message参数)
```
    //监听liuzhuo队列中的消息
    @RabbitListener(queues = "liuzhuo")
    public void messager(Message message){
        //获取消息头的信息
        System.out.println(message.getMessageProperties());
        //获取消息体的内容
        System.out.println(message.getBody());
    }
```

打开queues的界面:(查看liuzhuo队列)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115192855.png"/>

里面已经有两个数据了，现在我们重启Springboot应用：
在启动的过程中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115193013.png"/>

---

以上的操作，都是基于：Exchange 和 queue 存在的情况下。这么组件的创建都是基于rabbitmq的界面操作，如果我们想要在代码中创建呢？

这样，我们可以使用Springboot帮自动注入的AmqpAdmin组件，AmqpAdmin可以创建、删除、绑定：Exchange 和 queue。

在test包下的测试类中：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115194641.png"/>
```
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringBoot02AmqpApplicationTests {

	@Autowired
	private RabbitTemplate rabbitTemplate;

	@Autowired
	private AmqpAdmin rabbitAmqpAdmin;


	@Test
	public void testRabbitAdmin(){
		//创建exchange
		rabbitAmqpAdmin.declareExchange(new DirectExchange("amqp.exchange"));

		//创建queue
		rabbitAmqpAdmin.declareQueue(new Queue("amqp.queue"));

	}
    ····
}
```

运行测试方法：testRabbitAdmin()
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115194827.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115194855.png"/>

test:
```
	@Test
	public void bing(){
		//绑定exchange与queue
		rabbitAmqpAdmin.declareBinding(new Binding("amqp.queue", Binding.DestinationType.QUEUE,"amqp.exchange","amqp.key",null));
	}
```

运行该测试方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/mq/QQ截图20181115195315.png"/>