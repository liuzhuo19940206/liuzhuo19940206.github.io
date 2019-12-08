---
title: RabbitMQ的概念介绍
author: gakkij
categories:
  - RabbitMQ
  - 消息中间件
tags:
  - RabbitMQ
  - 消息中间件
toc: true
date: 2019-05-07 20:15:43
summary: RabbitMQ的概念介绍
---

上一篇文章，主要讲述了消息中间件的基本概念，消息中间件的作用、功能，以及各种消息中间件的对比，接下来会主要讲述RabbitMQ消息队列。

### 相关概念

RabbitMQ整体上是一个生产者与消费者模型，主要负责接收、存储和转发消息。可以把消息传递的过程想像成：当你将一个包裹送到邮局，邮局会使用邮箱来暂存包裹并最终将包裹通过邮递员送到收件人的手上，RabbitMQ就好比由**邮局、邮箱 和 邮递员**组成的一个系统。从计算机术语层面来说，RabbitMQ模型更像是一种交换机模型。

RabbitMQ模型如下：

![RabbitMQ模型架构图](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190507204209.png)

#### 生产者与消费者

**Producer**：生产者，就是投递消息的一方。

生产者创建消息，然后发布到RabbitMQ中。消息一般可以包含2个部分：消息体和标签（Label）。消息体也可以称之为：payload，在实际应用中，消息体一般是一个带有业务逻辑结构的数据，比如一个Json字符串。当然可以进一步对这个消息体进行序列化操作。消息的标签用来描述这条消息，比如这个消息要投递哪个交换器和投递时的路由键。生产者把消息交由给RabbitMQ，RabbitMQ之后会根据标签把消息发送到相应的队列中，然后由消费者来消费消息。

**Consumer**：消费者，就是接收消息的一方。

消费者连接到RabbitMQ服务器，并订阅到队列上。当消费者消费一条消息时，只是消费消息的消息体（payload）。在消息路由的过程中，消息的标签会丢弃，存入到队列中的消息只有消息体，消费者也只会消费到消息体，也就不知道消息的生产者是谁，当然消费者也不需要知道消息的生产者是谁。

**Broker**：消息中间件的服务节点。

对于RabbitMQ来说，一个RabbitMQ Broker可以简单地看作是一个RabbitMQ服务节点，或者RabbitMQ服务实例。大多数情况下也可以将一个RabbitMQ Broker看作是一台RabbitMQ服务器。

下图展示了一个完整的消息运转过程：

![消息队列的运转过程](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190507211857.png)

首先生产者将业务方数据进行可能的包装，之后封装成消息，发送（AMQP协议里这个动作对应的命令为Basic.Publish）到Broker中。消费者订阅并接收消息（AMQP协议里这个动作对应的命令为Basic.Consume或者Basic.Get），经过可能的解包处理得到原始的数据，之后再进行业务处理逻辑。这个业务处理逻辑并不一定需要和接收消息的逻辑使用同一个线程。消费者进程可以使用一个线程去接收消息，存入到内存中，比如使用Java中的BlockingQueue。业务处理逻辑使用另一个线程从内存中读取数据，这样可以将应用进一步解耦，提高整个应用的处理效率。

#### 队列

**Queue**：队列，是 RabbitMQ的内部对象，用于存储消息。如下所示：

![队列](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190507213351.png)

RabbitMQ中的消息都只能存储在队列中，这一点和Kafka这种消息中间件相反。Kafka将消息存储在topic（主题）这个逻辑层面，而相对应的队列逻辑只是topic实际存储文件中的位移标识。RabbitMQ的生产者生产消息并最终投递到队列中，消费者可以从队列中获取信息并消费。

多个消费者可以订阅同一个队列，这时队列中的消息会被<font color="red">**平均分摊（Round-Robin，即轮询）**</font>给多个消费者进行处理，**而不是每个消费者都收到所有的消息并处理**，意思就是说：队列中的某条消息，只能被一个消费者消费，而不是队列中的一条消息同时给多个消费者消费。如下所示：

![队列轮询消费](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190508134003.png)

一个队列可以连接多个消费者，但是队列中的消息只能被一个消费者消费，即5这条消费有可能被Consumer1消费，也有可能被Consumer2消费，但是5这条消息不会同时被Consumer1和Consumer2消费。

RabbitMQ不支持队列层面的广播消费，如果需要广播消费，需要在其上进行二次开发，处理逻辑会变得异常复杂，同时也不建议这么做。可以使用交换器（Exchange）来广播消息到多个队列中来完成相应的功能。

#### 交换器、路由键、绑定

**Exchange：**交换器。在介绍消息中间件的队列时，我们暂时可以理解成生产者将消息投递到队列中，实际上这个在RabbitMQ中不会发生。真实的情况是，生产者将消息发送到 Exchange中，由交换器将消息路由到一个或者多个队列中。如果路由不到，或许会返回给生产者，或许直接丢弃。默认情况下，如果没有指定交换器的话，直接发送消息到队列中时，系统会使用一个默认的交换器帮我们转换到队列中，匹配规则是：路由键要和队列名完全匹配。

交换器的具体示意图如下：

![交换器示意图](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190508140016.png)

**RoutingKey：**路由键。生产者将消息发给交换器的时候，一般需要指定一个RoutingKey（路由键），用来

指定这个消息的路由规则，而这个RoutingKey需要与交换器类型和绑定键（BindingKey）联合使用才能最终生效。

在交换器类型和绑定键固定的情况下，生产者可以在发送消息给交换器时，通过指定RoutingKey来决定消息流向

哪个队列或哪些队列。

**Binding：**绑定。RabbitMQ中通过绑定将交换器与队列关联起来，在绑定的时候一般会指定一个绑定键（BindingKey），这样RabbitMQ就知道如何正确地将消息路由到队列中了，如下所示：

![绑定队列示意图](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190508140931.png)

生产者将消息发送给交换器时，需要一个RoutingKey，当BindingKey和RoutingKey相匹配时，消息会被路由到对应的队列中。在绑定多个队列到同一个交换器的时候，这些绑定允许使用相同的BindingKey。BindingKey并不是在所有的情况下都生效，它依赖于交换器的类型，比如：fanout类型的交换器就会无视BindingKey，而是将消息路由到所有绑定到该交换器的队列中。

有经验的读者可能会发现，在某些情况下，RoutingKey与BindingKey可以看做是同一个东西。

简单看一个例子：

```java
//声明交换器
channel.exchangeDeclare(EXCHANGE_NAME,"direct",true,false,null);
//声明队列
channel.queueDeclare(QUEUE_NAME,true,false,false,null);
//绑定队列与交换器，使用BindingKey，可以看出RoutingKey与BindingKey是同一个东西！！！
channel.queueBind(QUEUE_NAME,EXCHANGE_NAME,ROUTING_KEY);
//要发送的消息内容
String message = "Hello World!";
//发送消息
channel.basicPublish(EXCHANGE_NAME,ROUTING_KEY,null,message.getBytes());
```

以上代码声明了一个 "direct"类型的交换器，然后将交换器和队列绑定起来。注意这里使用的字样是 "ROUTING_KEY"，在本该使用BindingKey的地方却使用了RoutingKey，java客户端这样做的潜台词就是：这里的RoutingKey和BindingKey是同一个东西。在direct交换器类型下，RoutingKey和BindingKey需要完全匹配才能使用，所以上面代码中采用了此种写法会显得方便许多。

为了避免混淆，可以这么理解：

* 在使用绑定的时候，其中需要的路由键是BindingKey。

* 在发送消息的时候，其中需要的路由键是RoutingKey。

由于某些历史的原因，包括现存能搜集到的资料显示：大多数情况下习惯性地将BindingKey写成RoutingKey，尤其是在使用direct类型的交换器的时候。本文后面的篇幅中也会将两者合称为路由键，读者需要注意区分其中的不同，可以根据上面的辨别方法进行有效的区分。

#### 交换器类型

RabbitMQ中常用的交换器类型有：fanout、direct、topic、headers 这四种。AMQP协议里还提到另外两种类型：System和自定义，这里不予描述。

**fanout**

它会把所有发送到该交换器的消息路由到所有与该交换器绑定的队列中。（即路由键没什么作用）

**direct**

direct类型的交换器路由规则也很简单，它会把消息路由到那些 BindingKey 和 RoutingKey完全匹配的队列中。

以下图所示，交换器类型为：direct，如果我们发送一条消息，并在发送消息的时候设置路由键为 "warning"，则

消息会路由到 Queue1 和 Queue2中。

![direct类型的交换器](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190508154120.png)

如果在发送消息的时候设置路由键为 "info" 或者 "debug"，消息只会路由到 Queue2。如果以其他的路由键发送消息，则消息不会路由到这两个队列中。

**topic**

前面讲到 direct类型的交换器路由规则是完全匹配 BindingKey 和 RoutingKey，但是这种严格的匹配方式在很多情况下不能满足实际业务的需求。topic类型的交换器在匹配规则上进行了扩展，它与direct类型的交换器相似，也是将消息路由到 BindingKey 和 RoutingKey 相匹配的队列中，但这里的匹配规则有些不同，它约定：

* RoutingKey 为一个点号 "." 分隔的字符串（被点号 "." 分隔开的每一段独立的字符串称为一个单词），如 "com.rabbitmq.client" 、"com.hidden.client"
* BindingKey 和 RoutingKey 一样也是点号 "." 分隔的字符串
* BindingKey 中可以存在两种特殊字符串 "\*" 和 "#" ，用于做模糊匹配，其中 "\*" 用于匹配一个单词， "#" 用于匹配多个单词（可以是零个）。

以下图所示的配置中：

* 路由键为 "com.liuzhuo.client" 的消息会同时路由到 Queue1 和 Queue 2
* 路由键为 "com.gakki.client" 的消息只会路由到 Queue2中
* 路由键为 "com.gakki.demo" 的消息只会路由到 Queue2中
* 路由键为 "java.liuzhuo.demo" 的消息只会路由到 Queue1中
* 路由键为 "java.util.concurrent" 的消息将会被丢弃或者返回给生产者（需要设置mandatory参数），因为它没有匹配任何路由键。

![direct类型的交换器](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190508160433.png)

**headers**

headers类型的交换器不依赖与路由键的匹配规则来路由消息，而是根据发送的消息内容中的headers属性进行匹配。在绑定队列和交换器时制定一组键值对，当发送消息到交换器时，RabbitMQ会获取到该消息的headers（也是一个键值对的形式），对比其中的键值对是否完全匹配队列和交换器绑定时指定的键值对，如果完全匹配则消息会路由到该队列，否则不会路由到该队列。headers类型的交换器性能会很差，而且也不实用，基本上不会看到它的存在。

#### RabbitMQ运转流程

了解了以上的RabbitMQ架构模型及相关术语，再来回顾整个消息队列的使用过程。在最初状态下：

**生产者发送消息的时候：**

（1）生产者连接到 **RabbitMQ Broker** 建立一个连接 ( Connection ) ，开启 一个信道  ( Channel )

（2）生产者声明一个交换器 ，并设置相关属性，比如：交换机类型、是否持久化等

（3）生产者声明 一个队列，井设置相关属性，比如：是否排他、是否持久化、是否自动删除等

（4）生产者通过路由键 (BindingKey) 将交换器和队列绑定起来

（5）生产者发送消息至 RabbitMQ Broker ，其中包含 路由键 (RoutingKey)、交换器 等信息

（6）相应的交换器根据接收到的路由键查找相匹配的队列

（7）如果找到 ，则将从生产者发送过来的消息存入相应的队列中

（8）如果没有找到 ，则根据生产者配置的属性选择丢弃还是回退给生产者

（9）关闭信道

（10）关闭连接

**消费者接收消息的过程:**

（1）消费者连接到 RabbitMQ Broker ，建立一个连接(Connection ) ，开启 一个信道 (Channel)

（2）消费者向 RabbitMQ Broker 请求消费相应队列中的消息，可能会设置相应的回调函数，
以及做 一些准备工作

（3）等待 RabbitMQ Broker 回应并投递相应队列中的消息给消费者， 消费者接收消息

（4）消费者消费消息 并 发送确认 应答(ack) 给 RabbitMQ Broker （可以自动应答或手动应答）

（5）RabbitMQ 将收到应答的消息从队列中删除

（6）关闭信道

（7）关闭连接

---

如下图所示，我们又引入了两个新的概念: Connection  和 Channel 。我们知道无论是生产者还是消费者，都需要和 RabbitMQ Broker 建立连接，这个连接就是一条 TCP 连接，也就是Connection 。一旦TCP 连接建立起来，客户端紧接着可以创建一个 AMQP 信道 (Channel) ，每个信道都会被指派 一个唯一的ID 。信道是建立在Connection 之上的虚拟连接， RabbitMQ 处理的每条 AMQP 指令都是通过信道完成的。

![Connection与Channel](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190508162857.png)

我们完全可以直接使用 Connection 就能完成信道的工作，为什么还要引入信道呢? 试想这样一个场景， 一个应用程序中有很多个线程需要从 RabbitMQ 中消费消息，或者生产消息，那么必然需要建立很多个 Connection ，也就是许多个 TCP 连接。然而对于操作系统而言，建立和销毁 TCP 连接是非常昂贵的开销，如果遇到使用高峰，性能瓶颈也随之显现。 RabbitMQ 采用类似 NIO' (Non-blocking 1/0) 的做法，选择 TCP 连接复用，不仅可以减少性能开销，同时也便于管理。





