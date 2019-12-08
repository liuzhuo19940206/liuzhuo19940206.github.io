---
title: RabbitMQ的简单入门
author: gakkij
categories:
  - RabbitMQ
  - 消息中间件
tags:
  - RabbitMQ
  - 消息中间件
toc: true
date: 2019-05-08 20:57:26
summary: AMQP协议的介绍、RabbitMQ的简单入门
---

在上篇博客中，我们知道了RabbitMQ的相关概念，再进行RabbitMQ的实操之前，我们还需要了解一下AMQP协议，毕竟RabbitMQ是基于AMQP协议用Erlang语言开发的。

### AMQP协议模型

![AMQP协议模型](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190508211111.png)

从上述的AMQP协议模型中，我们可以看出该协议主要是通过 生产者（Publisher）发送消息到 Server中（RabbitMQ 服务节点），具体是发送到某个虚拟主机中（Virtual host）中，一个Server中会有多个虚拟主机，每个虚拟主机都是隔离的，相互是不受影响的。在虚拟主机中，会存在多个交换器（Exchange）和 队列（Queue），生产者发送消息到某个虚拟主机中的交换器中，是与交换器打交道，不是直接与队列打交道。而消费者是与队列进行通信，不与交换器交流。即重点就在于 交换器 怎么与队列进行绑定。

### AMQP核心概念

**Server**：又称为 Broker，接受客户端的连接，实现AMQP实体服务。

**Connection**：连接，应用程序与Broker的网络连接

**Channel**：网络信道，几乎所有的操作都在Channel中进行，Channel是进行消息读写的通道。客户端可建立多个Channel，每个Channel代表一个会话任务。

**Messages**：消息。服务器和应用程序之间传递的数据，由 Properties 和 Body组成。Properties  可以对消息进行设置，比如消息的优先级、延迟等高级特性；Body则就是消息体内容。

**Virtual host**：虚拟主机，用于进行逻辑隔离，最上层的消息路由。一个Virtual host里面有若干个Exchange和Queue，同一个Virtual host里面不能有相同名称的Exchange和Queue。

**Exchange**：交换机，接受消息，根据路由键转发消息到绑定的队列中。

**Binding**：Exchange和Queue之间的虚拟连接，binding中可以包含routing key。

**RoutingKey**：一个路由规则，虚拟主机用它来确定如何路由一个特定信息。

**Queue**：也称为 Messages Queue，消息队列，保存消息并将它们转发给消费者。

### 命令行与管控台

#### 基础操作

**rabbitmq-server start &** ： 服务启动

**rabbitmqctl start_app** : 启动应用

**rabbitmqctl stop_app** ：关闭应用

**rabbitmqctl status** ：节点状态

**rabbitmqctl add_user username password** ：添加用户

**rabbitmqctl list_users** ：列出所有用户

**rabbitmqctl delete_user username** ：删除用户

**rabbitmqctl set_user_tags {username} {tag}** ：设置用户角色，tag可以为administrator, monitoring, management

**rabbitmqctl clear_permissions -p vhostpath username** ：清除用户的权限（某个虚拟主机中的）

**rabbitmqctl list_user_permissions username** ：列出用户权限

**rabbitmqctl change_password username newpassword** ：修改密码

**rabbitmqctl set_permissions -p vhostpath username ".\*" ".\*" ".\*"** ：设置用户权限

```java
权限设置：rabbitmqctl set_permissions [-p vhostpath] {user} {conf} {write} {read}
    conf:一个正则表达式match哪些配置资源能够被该用户访问。
    write:一个正则表达式match哪些配置资源能够被该用户读。
    read:一个正则表达式match哪些配置资源能够被该用户访问。
--------------------- 
举例：
rabbitmqctl set_permissions -p / root “.*” “.*” “.*”
```



**rabbitmqctl add_vhost vhostpath** ：创建虚拟主机

**rabbitmqctl list_vhost** ：列出所有虚拟主机

**rabbitmqctl list_permissions -p vhostpath** ：列出虚拟主机上所有权限

**rabbitmqctl delete_vhost vhostpath** ：删除虚拟主机

**rabbitmqctl list_queues** ：查看所有队列信息

**rabbitmqctl -p vhostpath purge_queue blue** ：清除队列里的消息

#### **获取服务器状态信息**

```java
服务器状态：rabbitmqctl status

队列信息： rabbitmqctl list_queues [-p vhostpath] [queueinfoitem …]
queueinfoitem可以为： name, durable, auto_delete, arguments, messages_ready, messages_unacknowled, messages, consumers, memory.

Exchange信息： rabbitmqctl list_exchanges [-p vhostpath] [exchangeinfoitem …]
exchangeinfoitem有：name, type, durable, auto_delete, internal, arguments.

Binding信息：rabbitmqctl list_bindings [-p vhostpath] [bindinginfoitem …]
bindinginfoitem有：source_name, source_kind, destination_name, destination_kind, routing_key, arguments.等

connection信息：rabbitmqctl list_connections [connectioninfoitem …]
connectioninfoitem有：recv_oct，recv_cnt，send_oct，send_cnt，send_pend等。

channel信息：rabbitmqctl list_channels [channelinfoitem …]
channelinfoitem有:consumer_count，messages_unacknowledged，messages_uncommitted，acks_uncommitted，messages_unconfirmed，prefetch_count，client_flow_blocked

举例：
rabbitmqctl list_queues name messages_ready pid slave_pids
--------------------- 
```



#### 高级操作

**rabbitmqctl reset** ：移除所有数据，要在rabbitmqctl stop_app 之后使用

**rabbitmqctl force_reset**：作用和 rabbitmqctl reset一样，区别是无条件重置节点

**rabbitmqctl join_cluster <clusternode\> [\--ram]** ：组成集群命令, `--ram`: 内存节点，`--disc `：磁盘节点

**rabbitmqctl cluster_status** ：查看集群状态

**rabbitmqctl change_cluster_node_type disc | ram** ：修改集群节点的存储形式

**rabbitmqctl forget_cluster_node [\--offline]** ：忘记节点（摘除节点）

**rabbitmqctl rename_cluster_node oldnode1 newnode1 [oldnode2] [newnode2 ...]** ：修改节点名称

```java
镜像队列的设置:

镜像队列的配置通过添加policy完成，policy添加的命令为：
rabbitmqctl set_policy [-p Vhost] Name Pattern Definition [Priority]

-p Vhost: 可选参数，针对指定vhost下的queue进行设置
Name: policy的名称
Pattern: queue的匹配模式（正则表达式）
Definition: 镜像定义，包括三个部分 ha-mode，ha-params，ha-sync-mode
    ha-mode: 指明镜像队列的模式，有效值为 all/exactly/nodes
            all表示在集群所有的节点上进行镜像
            exactly表示在指定个数的节点上进行镜像，节点的个数由ha-params指定
            nodes表示在指定的节点上进行镜像，节点名称通过ha-params指定
    ha-params: ha-mode模式需要用到的参数
    ha-sync-mode: 镜像队列中消息的同步方式，有效值为automatic，manually
Priority: 可选参数， policy的优先级

例如，对队列名称以hello开头的所有队列进行镜像，并在集群的两个节点上完成镜像，policy的设置命令为：
rabbitmqctl  set_policy  hello-ha  "^hello"  '{"ha-mode":"exactly","ha-params":2,"ha-sync-mode":"automatic"}'

```

#### 实战演习

rabbitmqctl status ：查看状态

![rabbitmqctl status](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509135251.png)

![查询各种信息](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509135525.png)

rabbitmqctl add_user gakkij gakkij  : 添加用户名 gakkij，密码：gakkij

![添加新用户](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509140020.png)

rabbitmqctl set_user_tags username <tag_name\> ：设置用户的标签

![设置用户的标签](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509140353.png)

其他的命令行操作，大家可以执行操作实验，就不一一列举了。

#### 管控台

在浏览器中输入：`http://192.168.69.200:15672/` 其中的ip地址是你的虚拟机的ip地址

![管控台](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509140639.png)



输入我们新增的用户：gakkij

![管控台](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509140937.png)



管控台添加用户：

![添加用户](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509141117.png)

管控台添加交换器：

![添加交换器](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509141332.png)

管控台添加队列：

![添加队列](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509141441.png)

其他的管控台操作，请大家自行学习，操作。

---

一个扩展知识点：在overview中的最下端，有着：Import 和 Export

**Export**：将我们的Rabbitmq信息导出，这样当我迁移Rabbitmq时，就不再需要我们又重新定义虚拟主机、交换器、队列的。

**Import** ：将我们导出的Rabbitmq信息，导入到我们的新的Rabbitmq服务器中。

![Rabbitmq迁移](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509142011.png)

### 急速入门-消息生产与消息

1）ConnectionFactory：获取连接工厂

2）Connection：一个连接（TCP连接）

3）Channel：数据通信信道，可发送和接收消息（TCP的复用）

4）Queue：具体的消息存储队列

5）Producer & Consumer：生产者和消费者

---

我使用的是IDEA的编辑器，大家使用Eclipse也行，编辑器无伤大雅。

使用IDEA创建一个普通的maven工程：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509150824.png)

这里，大家注意一下，我这里是已经实操过一遍了，所以会多出了很多包名和代码，大家自行忽略即可。

添加：rabbitmq的java客户端依赖：

```java
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.liuzhuo</groupId>
    <artifactId>rabbitmq</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>

        <!--rabbitmq的jave客户端-->
        <dependency>
            <groupId>com.rabbitmq</groupId>
            <artifactId>amqp-client</artifactId>
            <version>5.6.0</version>
        </dependency>

    </dependencies>


</project>
```

获取Connection：

```java
public class ConnectionUtil {

    private static String USERNAME = "gakkij"; //用户名
    private static String PASSWORD = "gakkij"; //密码
    private static String IPADDRESS = "192.168.69.200"; //虚拟机的地址
    private static int PORT = 5672; //端口号
    private static String VHOST = "/";   //虚拟主机path

    public static Connection openConnection() throws IOException, TimeoutException {
        //创建连接工厂
        ConnectionFactory connectionFactory = new ConnectionFactory();
        //设置相关的属性值
        connectionFactory.setUsername(USERNAME);
        connectionFactory.setPassword(PASSWORD);
        //设置ip地址
        connectionFactory.setHost(IPADDRESS);
        //设置端口号
        connectionFactory.setPort(PORT);
        //设置虚拟主机
        connectionFactory.setVirtualHost(VHOST);

        //根据连接工厂创建连接
        Connection connection = connectionFactory.newConnection();

        return connection;
    }
}
```

自己编写的获取Connection的工具类，放在了util包下，方便后续的生产者和消费者直接调用。

producer:

```java
public class Productor {

    public static void main(String[] args) throws Exception {

        /**
         * 注意，这里是最简单的消息队列的使用，没有使用交换机的例子。
         * 生产者直接把消息发送到队列中，发送消息时的routingKey必须与队列的名字queue相同才行。
         */

        Connection connection = null;
        Channel channel = null;
        //获取信道
        connection = ConnectionUtil.openConnection();
        channel = connection.createChannel();
        
        //消息
        String message = "hello,world!";
        //发送消息到队列中
        for (int i = 0; i < 5; i++) {
            //1.交换器，2.路由键，3.参数，4.要发送的消息体（字节数组）
            channel.basicPublish("", "simple_queue", null, message.getBytes());
        }

        System.out.println("发送消息完毕！");
        //关闭信道
        channel.close();
        //关闭连接
        connection.close();
    }
}
```

Consumer：

```java
public class Consumer {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        //声明队列
        channel.queueDeclare("simple_queue", true, false, false, null);

        while (true) {
            //1.队列的名字，2.是否自动应答，3.消费者
            channel.basicConsume("simple_queue", true, new DefaultConsumer(channel) {
                
                //重写处理消息的方法
                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                    System.out.println("==========================");
                    System.out.println("consumerTag: " + consumerTag);
                    System.out.println("envelope: " + envelope);
                    System.out.println("exchange: " + envelope.getExchange());
                    System.out.println("routingKey: " + envelope.getRoutingKey());
                    System.out.println("deliveryTag: " + envelope.getDeliveryTag());
                    System.out.println("接受到的消息为：" + new String(body, "utf-8"));
     
                }
            });
        }
    }
}
```

在没有运行生产者和消费者程序之前，观看管控台的信息：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509152944.png)

首先运行消费者：因为队列是在消费者中声明的，先运行生产者的话，因为没有队列所以会将消息丢失！

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509153237.png)

如果出现连接超时的情况，请看一下你的虚拟机中的centos的防火墙，是否开启了5672的端口号，没有的话，请开启5672的端口号：

```java
firewall-cmd --zone=public --add-port=5672/tcp --permanent

firewall-cmd --reload 
```

再次查看管控台的信息：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509154857.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509154939.png)

运行生产者：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509155039.png)

看到，生产者的控制台，输出了：发送消息完毕！

再看，消费者的控制台：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509155139.png)

看到，我们消费了五条消息。

---

以上就是简单的入门案例，大家应该有了一个初步的操作印象了。

因为，该案例中，我们的消费者是自动ack，所以，只要从队列中发送消息给消费者的话，都会从队列中删除消息，不管消费者是否已经处理好消息。

现在，我们关闭消费者的程序，再运行生产者的程序，在管控台看到：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509155619.png)

<font color="red">**注意，重点：**</font>

在之前的篇章中，我们知道在AMQP协议的模型中，生产者发送消息是不能直接发送消息到队列中的，需要发送到交换器中，让交换器将我们的消息路由到相应的队列中，消费者从队列中消费消息。

但是，在这里，我是直接发送队列中的，不知道大家有没有这么的疑惑？

`channel.basicPublish("", "simple_queue", null, message.getBytes());`

交换器，我们输入的是空字符串：""，路由键发送的是："simple_queue"。

为啥在simple_queue队列中，会接收到我们发送的数据呢？

其实，当我们不指定交换器时（即：交换器输入空字符串时），Rabbitmq会使用一个默认的交换器，如下：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509160430.png)

点击该交换器：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190509160625.png)

即：该默认的交换器，会匹配所有的队列，只要当路由键和队列的名字完全匹配时，就会将该消息转发到该队列中，如果没有与路由键相匹配的队列，就会丢弃该消息，或者返回给生产者（需要设置相关的配置和回调函数）。









