---
title: RabbitMQ的基础实战
author: gakkij
categories:
  - RabbitMQ
  - 消息中间件
tags:
  - RabbitMQ
  - 消息中间件
img: http://ww1.sinaimg.cn/large/c5582837gy1g2w7trzjbkj20sg0g0jvy.jpg
toc: true
date: 2019-05-10 14:35:25
summary: RabbitMQ的基础实战，让大家明白基础的操作
---

通过前面几篇博客的介绍，大家应该对RabbitMQ有了基础的认识了，现在开始带着大家进入RabbitMQ的基础实战，让大家体验一把RabbitMQ消息中间件的基础操作。

### 连接RabbitMQ

#### 指定各种参数

使用下面的代码来连接RabbitMQ，通过指定各种参数（IP地址、端口号、用户名、密码等）

```java
        //创建连接工厂
        ConnectionFactory connectionFactory = new ConnectionFactory();
        //设置用户名和密码
        connectionFactory.setUsername(USERNAME); //默认值：guest
        connectionFactory.setPassword(PASSWORD); //默认值：guest
        //设置ip地址
        connectionFactory.setHost(IPADDRESS);
        //设置端口号
        connectionFactory.setPort(PORT); //默认值：5672
        //设置虚拟主机
        connectionFactory.setVirtualHost(VHOST); //默认值：/
        //根据连接工厂创建连接
        Connection connection = connectionFactory.newConnection();
```

#### 使用URI的方式

```java
        //创建连接工厂
        ConnectionFactory connectionFactory = new ConnectionFactory();
        connectionFactory.setUri("amqp://USERNAME:PASSWORD@IPADDRESS:PORT/VHOST");
        Connection connection = connectionFactory.newConnection();   
```

###  创建信道

```java
        Channel channel = connection.createChannel();
```

在创建之后， Channel 可以用来发送或者接收消息了。

<font color="red">注意事项：</font>

Connection 可以用来创建多个 Channel 实例，但是 Channel 实例不能在线程间共享，应用程序应该为每一个线程新开辟一个 Channel 。某些情况下 Channel 的操作可以并发运行，但是在其他情况下会导致在网络上出现错误的通信帧交错，同时也会影响**发送方确认( publisher confirm)机制**的运行，所以多线程问共享 Channel 实例是非线程安全的。

### 交换器与队列

交换器和队列是 AMQP 中 high-level 层面的构建模块，应用程序需确保在使用它们的时候就已经存在了，在使用之前需要**先声明 declare 它们**。

我们再一次看一下AMQP协议的架构模型：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190510150917.png)

#### 交换器属性

1）Name：交换器名称

2）Type：交换器类型：direct、fanout、topic、headers

3）Durability：是否需要持久化，true为持久化

4）Auto Delete：当最后一个绑定到Exchange上的队列删除后，自动删除该Exchange

5）Internal：当前Exchange是否用于Rabbitmq内部使用，默认是false，我们基本上不使用这个属性，都设置为false

6）Arguments：扩展参数，用于扩展AMQP协议自定化使用

生产者和消费者都可以声明一个交换器或者队列。如果尝试声明一个已经存在的交换器或者队列 ，只要声明的参数完全匹配现存的交换器或者队列， RabbitMQ 就可以什么都不做 ，并成功返回 。如果声明的参数不匹配则会抛出异常。

#### exchangeDeclare 方法详解

exchangeDeclare 有多个重载方法，这些重载方法都是由下面这个方法中缺省的某些参数构成的。

```java
Exchange.DeclareOk exchangeDeclare(String exchange, 
            String type , boolean durable , 
            boolean autoDelete , boolean internal, 
            Map<String, Object> arguments) throws IOException;

//不常用，不阻塞的方法，有风险！
void exchangeDeclareNoWait(String exchange, 
            String type , boolean durable , 
            boolean autoDelete , boolean internal, 
            Map<String, Object> arguments) throws IOException;
```

 各个参数的含义，上面我已经解释了，这里就不再解释了，不过重点的参数还是再说一遍：

* durable：设置是否持久化。true：表示持久化，反之是非持久化。持久化可以将交换器存盘，在服务器重启的时候不会丢失相关信息。
* autoDelete：设置是否自动删除。autoDelete 设置为 true ，则表示自动删除。自动删除的前提是至少有 一个队列或者交换器 与 该交换器绑定之后，然后所有与这个交换器绑定的队列或者交换器都与 其解绑了，才会自动删除。**注意**：不能错误地 把这个参数理解为 "当与此交换器连接的客户端都断开时 ，RabbitMQ会自动 删除本交换器 " 。
* internal：设置是否为内置的。如果设置为 true，则表示是内置的交换器，客户端程序无法直接发送消息到这个交换器中，只能通过交换器 路由 到这个交换器中。
* arguments：其他一些结构化参数，比如 alternate-exchange。

#### 队列属性

1）Name：队列的名字

2）durable：是否持久化，true：持久化，反之非持久化

3）exclusive：是否排他，true：排他队列，只能在同一个连接下才能使用

4）autoDelete：是否自动删除，true：自动删除

5）arguments：其他一些参数

#### queueDeclare 方法详解

queueDeclare 相对于 exchangeDeclare 方法而言，重载方法的个数就少很多 ，它只有两个重载方法:

```java
(1) Queue.DeclareOk queueDec1are() throws IOException

(2) Queue.DeclareOk queueDec1are(String queue , boolean durable , boolean exclusive , 
boolean autoDelete , Map<String Object> arguments) throws IOException;

//不常用
(3) void queueDec1areNoWait(String queue , boolean durable , boolean exclusive , boolean autoDelete , Map<String Object> arguments) throws IOException;
```

参数详解：

* queue：队列的名字
* durable：设置是否持久化。为 true 则设置队列为持久化。持久化的队列会存盘，在服务器重启的时候可以保证不丢失相关信息。
* exclusive：设置是否排他。为 true 则设置队列为排他的。如果一个队列被声明为排队列，该队列仅对首次声明它的连接可见，**并在连接断开时自动删除**。<font color="red">这里需要注意三点</font>: 排他队列是基于连接( Connection) 可见的，同一个连接的不同信道 (Channel)也是可以同时访问排他队列的；首次是指如果一个连接已经声明了一个排他队列，其他连接是不允许建立同名的排他队列的，这个与普通队列不同；即使该队列是持久化的，一旦连接关闭或客户端退出，该排他队列都会被自动删除，这种队列适用于一个客户端同时发送和接收消息的应用场景。
* autoDelete：设置是否自动删除。为 true 则设置队列为自动删除。自动删除的前提是: **至少有一个**消费者连接到这个队列，之后所有与这个队列连接的消费者都断开时，才会自动删除。不能把这个参数错误地理解为: "当连接到此队列的所有客户端断开时，这个队列自动删除 "，因为生产者客户端创建这个队列，或者没有消费者客户端与这个队列连接时，都不会自动删除这个队列。
* arguments：设置队列的其他一些参数，如 ：x-message-ttl 、 x-expires 、x-max-length 、x-max-length-bytes 、x-dead-letter-exchange 、x-dead-letter-routing-key 、x-max-priority 等。

<font color="red">**注意要点：**</font>

生产者和消费者都能够使用 queueDeclare 来声明一个队列，但是如果消费者在同一个信道上订阅了另一个队列，就无法再声明队列了。必须先取消订阅，然后将信道直为"传输"模式，之后才能声明队列。

#### queueBind 方法详解

将队列和交换器绑定 方法如下 ，可以与前两节中的方法定义进行类比

```java
(1) Queue.BindOk queueBind(String queue , String exchange , String routingKey)throws IOException;

(2) Queue.BindOk queueBind(String queue , String exchange , String routingKey, 
Map<String, Object> arguments) throws IOException;

//不常用
(3) void queueBindNoWait(String queue , String exchange , String routingKey, 
Map<String, Object> arguments) throws IOException;
```

方法中涉及的参数详解：

* queue：队列的名称
* exchange：交换器的名称
* routingKey：用来绑定队列和交换器的路由键（也是BindingKey：绑定键！！！）
* arguments：定义绑定的一些参数

不仅可以将队列和交换器绑定起来，也可以将已经被绑定的队列和交换器进行解绑。

```java
(1) Queue.UnbindOk queueUnbind (String queue , String exchange , String routingKey) 
throws IOException;

(2) Queue.UnbindOk queueUnbind (String queue , String exchange , String routingKey, 
Map<String , Object> arguments) throws IOException;
```

#### exchangeBind 方法详解

我们不仅可以将交换器与队列绑定，也可以**将交换器与交换器绑定**，后者和前者的用法如出一辙，相应的方法如下:

```java
(1) Exchange.BindOk exchangeBind(String destination , String source , String 
routingKey) throws IOException;

(2) Exchange.BindOk exchangeBind(String destination, String source , String 
routingKey, Map<String , Object> arguments) throws IOException;

//不常用
(3) void exchangeBindNoWait(String destination, String sour ce , String routingKey, 
Map<String, Object> arguments) throws IOException;
```

交换器与交换器绑定之后 ，消息由 source交换器 转发到 destination交换器中，某种程度上来 destination交换器可以 看作是一个队列 。示例代码如下：

```java
channel.exchangeDeclare( "source" , "direct" , false , true , null); 
channel.exchangeDeclare( "destination" , "fanout" , false , true , null); 
channel.exchangeBind( "destination" , "source" , "exKey"); 

channel.queueDeclare( "queue" , false , false , true , null); 
channel.queueBind( "queue" , "destination"); 

channel.basicPublish( "source" , "exKey" , null , "exToExDemo".getBytes() );
```

生产者发送消息至交换器 source 中，交换器 source 根据 路由键："exkey" 找到与其匹配 另一个交换器destination 井把消息转发到 destination中，进而存储到与destination 进行绑定的队列 "queue" 中。参考如下：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190510163729.png)

这里声明了 fanout 和 direct 的两个交换器，一个队列，direct 是完全匹配的路由规则，fanout是广播的路由规则，这里大家简单看看，后面会陆续讲解交换器的类型的。

### 发送消息

如果要发送一条消息，可以使用 Channel 类的 **basicPublish** 方法，比如发送一条内容为："Hello World! " 消息

```java
byte[] messageBodyBytes = "Hello,world!". getBytes(); 
channel.basicPublish(exchangeName , routingKey , null , messageBodyBytes);
```

为了更好地控制发送，可以使用 **mandatory** 这个参数 或者 可以发送一些特定属性的信息:

```java
channe1.basicPub1ish(exchangeName , routingKey , mandatory, 
                    MessageProperties.PERSISTENT_TEXT_PLAIN , 
                    messageBodyBytes ) ;
```

 MessageProperties.PERSISTENT_TEXT_PLAIN：这个属性的意思是，这条消息的投递模式 （delivery mode） 设置为2 ，即消息会被持久化(即存入磁盘)在服务器中。同时这条消息的优先级（ priority ) 设置为 1，content-type设置为 "text/plain" 。和下面自定义设置属性一模一样：

```java
channe1.basicPub1ish(exchangeName , routingKey , 
            new AMQP.BasicProperties.Builder() 
            .contentType("text/plain") 
            .deliveryMode(2)
            .priority(1) 
            .userId("hidden") 
            .build()) , 
            messageBodyBytes);
```

也可以发送 一条带有 headers 的消息：

```java
Map<String , Object> headers = new HashMap<String, Object>(); 
headers.put( "localtion" , "here" ); 
headers.put( "time" , "today" ); 

channel.basicPublish(exchangeName，routingKey，
            new AMQP.BasicProperties.Builder() 
            .headers(headers) 
            .build()),
            messageBodyBytes) ;
```

还可以发送一条带有过期时间 ( expiration ）的消息：

```java
channel.basicPublish(exchangeName , routingKey, 
            new AMQP.BasicProperties.Builder() 
            .expiration( "60000" ) 
            .build()) , 
            messageBodyBytes) ;
```

以上只是举例，由于篇幅关系，这里就不一一列举所有的可能情形了。对于 basicPublish 而言，有几个重载方法

```java
(1) void basicPublish (String exchange , String routingKey, BasicProperties props, 
byte[] body) throws IOException;

(2) void basicPublish(String exchange，String routingKey, boolean mandatory,BasicProperties props, byte[] body) throws IOException;

(3) void basicPublish(String exchange , String routingKey, boolean mandatory, 
boolean immediate , BasicProperties props, byte[] body) throws IOException;
```

对应的具体参数解释如下所述：

* exchange：交换器的名称，指明消息需要发送到哪个交换器中 ，如果设置为**空字符串**，则消息会被发送到 RabbitMQ 默认的交换器中。

* routingKey：路由键，交换器根据路由键将消息存储到相应的队列之中。

* props：消息的基本属性集，其包含 14 个属性成员，分别有 contentType、
  contentEncoding 、headers (Map<String Object\>)、 deliveryMode 、priority 、correlationld 、replyTo、 expiration 、messageld 、timestamp、 type 、userld、 appld 、clusterId 。其中常用的几种都在上面的示例中进行了演示。

* body：消息体 （payload） ，真正需要发送的消息。

* mandatory 和  immediate 会在后面的高级操作中讲到。

### 消费消息

RabbitMQ的消费模式分两种：推（Push）模式 和 拉（Pull）模式。推模式采用：**Basic.Consume** 进行消费，而拉模式：则是调用 **Basic.Get** 进行消费。

#### 推模式

在推模式中，可以通过持续订阅的方式来消费消息，使用到的相关类有：

```java
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
```

接收消息一般通过实现 Consumer 接口 或者 继承 DefaultConsumer 类来实现。

当调用与Consumer相关的API方法时，不同的订阅采用不同的消费者标签 (consumerTag) 来区分彼此 ，在同一个 Channel 中的消费者 也需要通过唯一的消费者标签以作区分，关键消费代码如下：

```java
            Boolean autoAck = false;
            channel.basicConsume("queueName", autoAck, "myConsumerTag" ,
                  new DefaultConsumer(channel) {

                @Override
                public void handleDelivery(String consumerTag, 
                                           Envelope envelope, 
                                           AMQP.BasicProperties properties, 
                                           byte[] body) 
                    throws IOException {

                    System.out.println("consumerTag: " + consumerTag);
                    System.out.println("envelope: " + envelope);
                    System.out.println("exchange: " + envelope.getExchange());
                    System.out.println("routingKey: " + envelope.getRoutingKey());
                    System.out.println("deliveryTag: " + envelope.getDeliveryTag());

                    System.out.println("接受到的消息为：" + new String(body, "utf-8"));

                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            });
```

注意，上面代码中显示地设置 autoAck 为 false，然后在接收到消息之后进行显示 ack操作（channel.basicAck），对于消费者来说这个设置是非常必要的，可以防止消息不必要地丢失。

Channel 类中 basicConsume 方法如下几种形式：

```java
(1) String basicConsume(String queue , Consumer callback) throws IOException;

(2) String basicConsume(String queue , boolean autoAck, Consumer callback) throws 
IOException;

(3) String basicConsume(String queue , boolean autoAck, Map<String, Object> 
arguments, Consumer callback) throws IOException;

(4) String basicConsume(String queue , boolean autoAck, String consumerTag, 
Consumer callback) throws IOException;

(5) String basicConsume(String queue , boolean autoAck, String consumerTag, 
boolean noLocal , boolean exclusive , Map<String , Object> arguments, Consumer callback) 
throws IOException;
```

其对应的参数说明如下所述：

* queue：队列的名称
* autoAck：设置是否自动确认。建议设成false，即不自动确认
* consumerTag：消费者标签，用来区分多个消费者
* noLocal：设置为 true 则表示不能将同一个 Connection 中生产者发送的消息传送给
  这个 Connection 中的消费者:
* exclusive：设置是否排他
* arguments：设置消费者的其他参数
* callback：设置消费者的回调函数。用来处理 RabbitMQ 推送过来的消息，比如
  DefaultConsumer 使用时需要客户端重写 (override) 其中的方法。

每个 Channel 都拥有自己独立的线程。最常用的做法是一 个Channel 对应一个消费者，也就是意味着消费者彼此之间没有任何关联。当然也可以在一个 Channel 中维持多个消费者，但是要注意一个问题，如果 Channel 中的 一个消费者一直在运行，那么其他消费者的 callback 会被 "耽搁" 。

#### 拉模式

这里讲一下拉模式的消费方式。通过 channel.basicGet 方法可以**单条地获取消息**，其返回值是 GetRespone。Channel 类的 basicGet 方法没有其他重载方法，只有：

```java
GetResponse basicGet(String queue , boolean autoAck) throws IOException;
```

其中 queue 代表队列的名称，如果设置 autoAck 为 false ，那么同样需要调用 channel.basicAck 来确认消息己被成功接收。

拉模式的关键代码为：

```java
GetResponse response = channel.basicGet(QUEUE_NAME , false) ; 
System.out.println(new String(response.getBody())); 
channel.basicAck(response.getEnvelope().getDeliveryTag() , false);
```

<font color="red">**注意要点：**</font>

Basic.Consume 将信道 (Channel) 设置为接收模式，直到取消队列的订阅为止。在接收模式期间， RabbitMQ 会不断地推送消息给消费者，当然推送消息的个数还是会受到 Basic.Qos的限制。如果只想从队列获得单条消息而不是持续订阅，建议还是使用 Basic.Get 进行消费。但是不能将 Basic.Get 放在一个循环里来代替 Basic.Consume ，这样做会严重影响 RabbitMQ 的性能。如果要实现高吞吐量，消费者理应使用 Basic.Consume 方法。

### 消费端的确认与拒绝

#### 消息确认

为了保证消息从队列可靠地达到消费者， RabbitMQ 提供了**消息确认机制**( message acknowledgement)， 消费者在订阅队列时，可以指定 autoAck 参数，当 autoAck 等于 false 时， RabbitMQ 会等待消费者显式地回复确认信号后才从内存(或者磁盘)中移去消息(实质上是先打上删除标记，之后再删除) 。当 autoAck 等于 true 时， RabbitMQ 会自动把发送出去的消息设置为确认，然后从内存(或者磁盘)中删除，而不管消费者是否真正地消费到了这些消息。

采用消息确认机制后，只要设置 **autoAck 参数为 false** ，消费者就有足够的时间来处理消息(任务) ，不用担心处理消息过程中消费者进程挂掉后消息丢失的问题 ，因为 RabbitMQ 会一直等待持有消息直到消费者显式调Basic.Ack 命令为止。

当 autoAck 参数置为 false ，对于 RabbitMQ 服务端而言，队列中的消息分成了两个部分：一部分是等待投递给消费者的消息；一部分是己经投递给消费者，但是还没有收到消费者确认信号的消息。 如果 RabbitMQ 一直没有收到消费者的确认信号，并且消费此消息的消费者己经断开连接，则 RabbitMQ 会安排该消息重新进入队列，等待投递给下一个消费者，当然也有可能还是原来的那个消费者。

RabbitMQ 不会为未确认的消息设置过期时间，它判断此消息是否需要重新投递给消费者的依据是消费该消息的消费者连接是否己经断开，这么设计的原因是 RabbitMQ 允许消费者消费这条消息的时间可以很久很久。

RabbtiMQ Web 管理平台上可以看到当前队列中的 **"Ready" 状态** 和 **"Unacknowledged" 状态** 的消息数，分别对应上文中的等待投递给消费者的消息数 和 己经投递给消费者但是未收到确认信号的消息数。

#### 消息拒绝

在消费者接收到消息后，如果想明确拒绝当前的消息而不是确认，那么应该怎么做呢? RabbitMQ在 2.0.0 版本开始引入了 **Basic.Reject** 这个命令，消费者客户端可以调用与其对应的 **channel.basicReject** 方法来告RabbitMQ 拒绝这个消息。

Channel 类中的 basicReject 方法定义如下:

`void basicReject(long deliveryTag, boolean requeue) throws IOException;`

其中 deliveryTag 可以看作消息的编号 ，它是 一个 64 位的长整型值，最大值是9223372036854775807 。如果 requeue 参数设置为 true ，则 RabbitMQ 会重新将这条消息存入队列，以便可以发送给下一个订阅的消费者；如果 requeue 参数设置为 false ，则 RabbitMQ立即会把消息从队列中移除，而不会把它发送给新的消费者。

Basic.Reject 命令一次只能拒绝一条消息 ，如果想要批量拒绝消息 ，则可以使用
Basic.Nack 这个命令 。消费者客户端可以调用 **channel.basicNack** 方法来实现，方法定义如下:

`void basicNack(long deliveryTag , boolean multiple , boolean requeue) throws IOException;`

其中 deliveryTag  和 requeue 的含义可以参考 basicReject 方法。 **multiple 参数** 设置为 false 则表示拒绝编号为 deliveryTag 的这一条消息，这时候 basicNack 和 basicReject 方法一样；multiple 参数设置为 true 则表示拒绝 deliveryTag 编号之前所有未被当前消费者确认的消息。

---

对于 requeue， AMQP 中还有一个命令 Basic.Recover 具备可入队列的特性 。其对应的客户端方法为:

```java
(1) Basic.RecoverOk basicRecover() throws IOException;

(2) Basic.RecoverOk basicRecover(boolean requeue) throws IOException;
```

这个 channel.basicRecover 方法用来请求 RabbitMQ 重新发送还未被确认的消息。如果 requeue 参数设置为 true ，则未被确认的消息会被重新加入到队列中，这样对于同一条消息来说，可能会被分配给与之前不同的消费者。如果 requeue 参数设置为 false ，那么同一条消息会被分配给与之前相同的消费者。默认情况下，如果不设置 requeue 这个参数，相当于channel.basicRecover(true) ，即 requeue 默认为 true。

### 关闭连接

在应用程序使用完之后，需要关闭连接，释放资源:

```java
channel.close(); 
conn.close() ;
```

显式地关闭 Channel 是个好习惯，但这不是必须的，在 Connection 关闭的时候，Channel 也会自动关闭。

AMQP 协议中的 Connection  和 Channel 采用同样的方式来管理：网络失败、内部错误 和 显式地关闭连接。 Connection 和 Channel 所具备的生命周期如下所述。

* Open：开启状态，代表当前对象可以使用。
* Closing：正在关闭状态。当前对象被显式地通知调用关闭方法( shutdown) ，这样
  就产生了一个关闭请求让其内部对象进行相应的操作， 并等待这些关闭操作的完成。
* Closed：已经关闭状态。当前对象己经接收到其所有的内部对象己完成关闭动作的通知，
  并且其也关闭了自身。

Connection 和 Channel 最终都是会成为 Closed 的状态，不论是程序正常调用的关闭方法，或者是客户端的异常，再或者是发生了网络异常。

在 Connection 和 Channel 中，与关闭相关的方法有 ：**addShutdownListener(ShutdownListener listener)** 和 **removeShutdownListener (ShutdownListner listener)** 。当 Connection 或者 Channel 的状态转变为 Closed 的时候会调用ShutdownListener 。而且如果将一个 ShutdownListener 注册到一个己经处于Closed状态的对象(这里特指 Connection Channel 对象) 时，会立刻调用 ShutdownListener。

getCloseReason 方法可以让你知道对象关闭的原因 ；isOpen 方法检测对象当前是否处于开启状态；close(int closeCode , String closeMessage ) 方法 显式地通知当前对象执行关闭操作。

---

有关 ShutdownListener 的使用可以参考代码如下：

```java
import com.rabbitmq.client.ShutdownSignalException; 
import com.rabbitmq.client.ShutdownListener;

connection.addShutdownListener(new ShutdownListener() { 
    public void shutdownCompleted (ShutdownSignalException cause)
    {
        ...
    } 
});
```

当触发 ShutdownListener 的时候，就可以获取到 ShutdownSignalException，这个 ShutdownSignalException 包含了关闭 原因 ，这里原因 也可以通过调用前面所提及的 getCloseReason 方法获取。






