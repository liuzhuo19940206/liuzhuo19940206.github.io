---
title: RabbitMQ的基础实战<二>
author: gakkij
categories:
  - RabbitMQ
  - 消息中间件
tags:
  - RabbitMQ
  - 消息中间件
img: http://ww1.sinaimg.cn/large/c5582837gy1g2w7x3xnsjj21hc0u0q7t.jpg
toc: true
date: 2019-05-11 14:35:58
summary: RabbitMQ的基础实战二，开始coding吧~
---

在上一篇文章中，我们已经了解到了RabbitMQ中的基本操作了，现在让我们开始实战演习吧！

### 最简单的模型

![最简单的模型](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511145315.png)

从上图可以看出，最简单的模型就是：一个生产者、一个队列、一个消费者。

<font color="red">注意：</font>

其实，在Rabbitmq中，生产者是不能直接发送消息到队列中的，当发送消息时，不指定交换器的话，Rabbitmq会默认使用一个交换器来路由消息到队列中。（前面的博客中，我已经解释过了，不清楚的，可以再去看看！）

（1）获取连接

```java
/**
 * 描述:
 *
 * @author liuzhuo
 * @create 2019-04-25 15:31
 */
public class ConnectionUtil {

    private static String USERNAME = "gakkij";
    private static String PASSWORD = "gakkij";
    private static String IPADDRESS = "192.168.69.200";
    private static int PORT = 5672;
    private static String VHOST = "/";

    public static Connection openConnection() throws IOException, TimeoutException {
        //创建连接工厂
        ConnectionFactory connectionFactory = new ConnectionFactory();
        //设置相关的属性值
        connectionFactory.setUsername(USERNAME);
        connectionFactory.setPassword(PASSWORD);
        //设置地址
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

（2）生产者

```java
package com.liuzhuo.rabbitmq.simplest;

import com.liuzhuo.rabbitmq.util.ConnectionUtil;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;

/**
 * 描述:
 *
 * @author liuzhuo
 * @create 2019-04-25 15:45
 */
public class Productor {

    public static void main(String[] args) throws Exception {

        /**
         * 注意，这里是最简单的消息队列的使用，没有使用交换机的例子。
         * 生产者"直接"把消息发送到队列中，发送消息时的routingKey必须与队列queue的名字相同才行。
         */

        Connection connection = null;
        Channel channel = null;
        //获取信道
        connection = ConnectionUtil.openConnection();
        channel = connection.createChannel();

        //消息
        String message = "simplest queue!";
        //发送消息到队列中
        for (int i = 0; i < 5; i++) {
            //没有指定交换器，使用的的空字符串，路由键是："simple_queue"
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

（3）消费者

```java
package com.liuzhuo.rabbitmq.simplest;

import com.liuzhuo.rabbitmq.util.ConnectionUtil;
import com.rabbitmq.client.*;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

/**
 * 描述:
 *
 * @author liuzhuo
 * @create 2019-04-25 15:57
 */
public class Consumer {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        //声明队列
        //持久化队列、非排他队列、非自动删除队列，队列参数为null
        channel.queueDeclare("simple_queue", true, false, false, null);

        while (true) {
            //不是自动应答，需要手动应答
            Boolean autoAck = false;
            channel.basicConsume("simple_queue", autoAck, new DefaultConsumer(channel) {

                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                    System.out.println("==========================");
                    System.out.println("consumerTag: " + consumerTag);
                    System.out.println("envelope: " + envelope);
                    System.out.println("exchange: " + envelope.getExchange());
                    System.out.println("routingKey: " + envelope.getRoutingKey());
                    System.out.println("deliveryTag: " + envelope.getDeliveryTag());

                    System.out.println("接受到的消息为：" + new String(body, "utf-8"));

                    //确认应对，如果不确认消息的话，队列里面的消息是不会消除的！！！
                    //envelope.getDeliveryTag()：消息的标识。
                    //multiple：false,只应答该条消息。true的话，应答所有比当前消息标识小的消息
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            });
        }
    }
}

```

（4）运行结果

先运行消费者：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511153422.png)

查看Rabbitmq的管控台：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511153545.png)

运行生产者：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511153641.png)

再看消费者的控制台：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511153721.png)

五条消息已经从生产者发送到队列中，然后消费者从队列中将消息给消费了。

---

上述中，我们提到了，自动应答和手动应答的作用，如果是手动应答的话，需要我们人工来应答已经成功消费的消息，否则消息是不会从队列中删除的，如果在生产中，忘记了人工应答的话，会导致消息重复消费的，这里需要重点提醒大家！

现在，我们将手动应答的那条代码注释掉：

```java
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                    System.out.println("==========================");
                    System.out.println("consumerTag: " + consumerTag);
                    System.out.println("envelope: " + envelope);
                    System.out.println("exchange: " + envelope.getExchange());
                    System.out.println("routingKey: " + envelope.getRoutingKey());
                    System.out.println("deliveryTag: " + envelope.getDeliveryTag());

                    System.out.println("接受到的消息为：" + new String(body, "utf-8"));

                    //确认应对，如果不确认消息的话，队列里面的消息是不会消除的！！！
                    //将这条手动应答的代码注释掉！！！
                    //channel.basicAck(envelope.getDeliveryTag(), false);
        }
      
```

再次运行，消费者，和生产者：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511154310.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511154403.png)

**似乎和刚刚没有什么区别**？其实有很大的区别，现在的这五条消息根本没有删除，不信打开Rabbitmq的管控台：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511154553.png)

<font color="red">**所以，请大家注意**：当你使用手动应答时，不要忘记主动编写应答的代码，不要忘记了，否则会重复消费消息的！！！</font>

### 工作队列模型

上面的简单模式，只有一个消费者，现在我们尝试多个消费者的情况：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511155231.png)

工作队列模型时，生产者发送到队列中的消息，会<font color="red">**均摊**</font>到各个消费者中，而不是将队列中的每个消息都发给所有的消费者。意思就是，如果现在队列中有：3，2，1，三条消息，1这条首先发送的消息，要么被Consumer1消费，要么被Consumer2消费，不会同时被这两个消费者消费！

（1）生产者：

```java
public class Productor {

    public static void main(String[] args) throws IOException, TimeoutException {

        /**
         * work模式的消息队列，会存在多个消费者，每个消费者是均摊来消费消息的
         * 即：每个消费者轮询来消费一个消息，不会考虑消费者的性能问题，会导致
         * 性能强的消费者会空闲，性能差的消费者一直忙于消费消息。
         *
         * 我们可以通过设置： channel.basicQos(prefetchCount);来控制消费者的强度。
         * prefetchCount：越大说明这个消费者的消费能力越强，否则，反之。
         */

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        channel.queueDeclare("work_queue", true, false, false, null);

        //循环十次来发送消息。
        for (int i = 0; i < 10; i++) {
            String message = "work_queue_" + i;
            channel.basicPublish("", "work_queue", null, message.getBytes());
        }

        channel.close();
        connection.close();
    }
}

```

（2）消费者1：

```java
public class Worker01 {

    public static void main(String[] args) throws IOException, TimeoutException {

            Connection connection = ConnectionUtil.openConnection();
            Channel channel = connection.createChannel();


        channel.basicConsume("work_queue", false, new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(
                String consumerTag, 
                Envelope envelope, 
                AMQP.BasicProperties properties, 
                byte[] body) throws IOException 
            {

                System.out.println("接受到的消息为：" + new String(body, "utf-8"));
                //确认应答
                channel.basicAck(envelope.getDeliveryTag(), false);

                //故意让这个消费者耗时，来代表这个消费者的业务难度高！！！
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}

```

（3）消费者2：

```java
public class Worker02 {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        channel.basicConsume("work_queue", false, new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                System.out.println("接受到的消息为：" + new String(body, "utf-8"));
                channel.basicAck(envelope.getDeliveryTag(), false);

                //故意让这个消费者耗时短，来代表这个消费者的业务难度低
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
```

我们能看到，消费者1的业务逻辑复杂些，通过睡眠时间来代表的！按照我们之前的理论，多个消费者连接同一个队列的话，队列中的消息会均摊到每个消费者中，由于消费者1的业务处理花的时间交久些，消费者2的业务逻辑简单些，那样的话，消费者2处理的消息照理应该消费更多的消息，因为处理速度更快，接受到的消息会更多，下面我们来运行程序，看看是否符合我们的推理

如果先运行消费者的话，会出现异常，因为队列是在生产者中声明的，所以先运行生产者，声明："work_queue"成功后，再运行两个消费者，最后再运行一次生产者：

首先看到管控台：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511161348.png)

再运行两个消费者：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511161524.png)

最后运行生产者：

查看两个消费者的控制台：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511161736.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511161822.png)

我们发现，为啥消费者1和消费者2，都是消费五条消息，而不是消费者2消费更多的消息呢？

这是因为，在Rabbitmq中，还有一个 **basicQos**属性，当不指定 basicQos属性的时候，Rabbitmq不管消费者的性能多强，队列中的消息都会均摊到每个消费者中，不管你是否是消费完毕了当前的消息。

---

现在，我们在消费者1中，添加：channel.basicQos(1); 

```java
public class Worker01 {

    public static void main(String[] args) throws IOException, TimeoutException {

            Connection connection = ConnectionUtil.openConnection();
            Channel channel = connection.createChannel();

            //这个消费者的性能差，我们就让它消费的慢一些。
            //说明最多发给这个消费者的消息就是一个，必须等这个消息消费完毕后，才会发送第二个。
            channel.basicQos(1);

        channel.basicConsume("work_queue", false, new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                System.out.println("接受到的消息为：" + new String(body, "utf-8"));
                channel.basicAck(envelope.getDeliveryTag(), false);

                //故意让这个消费者耗时，来代表这个消费者的业务难度高
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}

```

`channel.basicQos(1)`：表示当前的消费者，只能处理一个消息，当前的消息没有处理完的话，Rabbitmq是不会将队列中的消息再发给这个消费者的，怎么衡量消费者是否已经消费当前消息呢？就是应答处理，当Broker收到了消息应答，那么表示当前的消息已经处理完了，就可以发送下一条消息了。

在消费者2中，添加：channel.basicQos(3)

```java
public class Worker02 {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        //这个消费者的性能强，我们就让它消费的快一些。
        //说明最多发给这个消费者的消息是三条，不管当前消费者是否消费完毕当前消息。
        channel.basicQos(3);

        channel.basicConsume("work_queue", false, new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                System.out.println("接受到的消息为：" + new String(body, "utf-8"));
                channel.basicAck(envelope.getDeliveryTag(), false);

                //故意让这个消费者耗时，来代表这个消费者的业务难度低
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}

```

`channel.basicQos(3)`：表示Rabbitmq发送给这个消费者的**没有应答**的消息为三条，消费者可以慢慢处理这三条消息，当处理完当前的消息后，Rabbitmq会继续发送下一条消息，意思就是这个消费者中可以暂存三条消息。

---

再次，测试：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511162957.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511163057.png)

现在，大家应该明白了，`channel.basicQos(prefetchCount)`的作用了。

### 发布与订阅模型

上面的演示中，都没有涉及到交换器（其实涉及到了默认的交换器），在我们平时的开发中，都是需要涉及到交换器的，现在开始我们的交换器的旅途吧。

发布与订阅模型，为了解决队列不能广播的问题，上述中，队列中的消息只能均摊到每个消费者中，不能将队列中的消息广播到与之有关联的消费者中，而交换器可以实现广播的功能。

这里就需要使用：**"fanout"类型的交换器**了。

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511165948.png)



（1）生产者

```java
public class Productor {


    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        //声明交换机,fanout类型的交换器，持久化
        channel.exchangeDeclare("fanout_exchange", "fanout", true);

        String message = "fanout_message";
        //fanout类型的交换机，不需要指定routingKey，因为是广播的方式。
        channel.basicPublish("fanout_exchange", "", null, message.getBytes());

        System.out.println("发出消息：" + message);

        channel.close();
        connection.close();
    }
}
```

（2）消费者1

```java
public class Consumer01 {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        //声明队列
        channel.queueDeclare("fanout_queue01", true, false, false, null);
        
        //绑定交换机与队列，不需要指定路由键！！！
        //将fanout_queue01队列 与 fanout_exchange交换器 绑定到了一起。
        channel.queueBind("fanout_queue01", "fanout_exchange", "");

        while (true) {
            //自动应答，false，不会自动应答，即不会自动消除消息。
            Boolean autoAck = false;
            channel.basicConsume("fanout_queue01", autoAck, new DefaultConsumer(channel) {

                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                    System.out.println("=================");
                    System.out.println("fanout_queue01_接受到的消息为：" + new String(body, "utf-8"));
                    System.out.println("=================");

                    //确认应对，如果不确认消息的话，队列里面的消息是不会消除的！！！
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            });
        }
    }
}
```

（3）消费者2

```java
public class Consumer02 {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        final Channel channel = connection.createChannel();

        //声明队列
        channel.queueDeclare("fanout_queue02", true, false, false, null);
        
        //绑定交换机与队列，不需要指定路由键！！！
        channel.queueBind("fanout_queue02", "fanout_exchange", "");

        while (true) {
            //自动应答，false，不会自动应答，即不会自动消除消息。
            Boolean autoAck = false;
            channel.basicConsume("fanout_queue02", autoAck, new DefaultConsumer(channel) {

                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                    System.out.println("=================");
                    System.out.println("fanout_queue02_接受到的消息为：" + new String(body, "utf-8"));
                    System.out.println("=================");

                    //确认应对，如果不确认消息的话，队列里面的消息是不会消除的！！！
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            });
        }
    }
}
```

（4）测试：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511164905.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511164940.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511164955.png)

能看到，两个队列中都收到了 "fanout_message" 这条消息。

总结：

1）发送消息到 fanout类型的交换器时，不需要指定路由键。

2）绑定队列到 fanout类型的交换器时，不需要指定绑定键。

3）fanout类型的交换器，实现了交换器级别的广播，将消息发送到所有与之绑定的队列中。


### 路由模型

路由模型是使用：**direct类型的交换器**来实现的，路由键必须与绑定键完全匹配才行。

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511170212.png)

（1）生产者

```java
public class Productor {

    public static void main(String[] args) throws IOException, TimeoutException {


        /**
         *  使用交换机的模式：direct。
         *  direc：一个交换机的一个routingKey匹配一个队列，是一对一的关系。
         *  注意交换机还是可以绑定多个队列的，只是通过routingKey匹配唯一的队列而已。
         *
         *  生产者只需声明交换机即可，消费者那里声明队列，然后设置routingKye来匹配队列。
         *
         *  生产者发送消息时，需要指定routingKey。发送的消息经过交换机后，会转发消息到与
         *  routingKey匹配的队列中
         *
         *  发送消息时，使用不同的routingKey就可以发送消息到不同的队列中。
         */

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        //声明交换机
        channel.exchangeDeclare("direct_exchange", "direct",true);
        String message = "gakki_message";

        //发送消息，指定 交换机 和 路由键。
        channel.basicPublish("direct_exchange", "gakki", null, message.getBytes());
        System.out.println("发送消息：" + message);

        channel.close();
        connection.close();
    }
}
```

（2）消费者1

```java
public class Consumer01 {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        //声明队列
        channel.queueDeclare("gakki_queue", true, false, false, null);
        //绑定交换机与队列
        channel.queueBind("gakki_queue", "direct_exchange", "gakki");

        while (true) {
            Boolean autoAck = false;
            channel.basicConsume("gakki_queue", autoAck, new DefaultConsumer(channel) {

                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                    System.out.println("=================");
                    System.out.println("gakki_queue队列接受到的消息为：" + new String(body, "utf-8"));
                    System.out.println("=================");

                    //确认应对，如果不确认消息的话，队列里面的消息是不会消除的！！！
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            });
        }
    }
}
```

（3）消费者2

```java
public class Consumer02 {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        final Channel channel = connection.createChannel();

        //声明队列
        channel.queueDeclare("liuzhuo_queue", true, false, false, null);
        //绑定交换机与队列
        channel.queueBind("liuzhuo_queue", "direct_exchange", "liuzhuo");

        while (true) {
            //自动应答，false，不会自动应答，即不会自动消除消息。
            Boolean autoAck = false;
            channel.basicConsume("liuzhuo_queue", autoAck, new DefaultConsumer(channel) {

                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                    System.out.println("=================");
                    System.out.println("liuzhuo_queue队列接受到的消息为：" + new String(body, "utf-8"));
                    System.out.println("=================");

                    //确认应对，如果不确认消息的话，队列里面的消息是不会消除的！！！
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            });
        }
    }
}
```

（4）测试：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511171334.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511171523.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511171637.png)

---

修改生产者的代码：

```java
        //声明交换机
        channel.exchangeDeclare("direct_exchange", "direct", true);

        String message = "liuzhuo_message";

        //发送消息，指定 交换机 和 路由键。
        channel.basicPublish("direct_exchange", "liuzhuo", null, message.getBytes());
        System.out.println("发送消息：" + message);
```

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511171822.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511172034.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511172105.png)

---

总结：

1）direct类型的交换器，需要路由键与绑定键完全匹配才行。

2）direct类型的交换器，可以连接多个队列，指定不同的绑定键即可。

### 主题模型

前面讲到direct类型的Exchange路由规则是完全匹配binding key与routing key，但这种严格的匹配方式在很多情况下不能满足实际业务需求。topic类型的Exchange在匹配规则上进行了扩展，它与direct类型的Exchage相似，也是将消息路由到binding key与routing key相匹配的Queue中，但这里的匹配规则有些不同，它约定：

* routing key为一个句点号“. ”分隔的字符串（我们将被句点号“. ”分隔开的每一段独立的字符串称为一个单词），如“stock.usd.nyse”、“nyse.vmw”、“quick.orange.rabbit”

* binding key与routing key一样也是句点号“. ”分隔的字符串

* binding key中可以存在两种特殊字符“\*”与“#”，用于做模糊匹配，其中“\*”用于匹配一个单词，“#”用于匹配多个单词（可以是零个）

主题模型就是使用 **topic类型的交换器**，如下所示：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190508160433.png)

（1）生产者

```java
public class Productor {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        //创建topic类型的交换机
         channel.exchangeDeclare("topic_exchange", "topic", true);
        //创建消息
        String message = "news.liuzhuo.djtopic";
        //发送消息,需要路由键
        channel.basicPublish("topic_exchange", "news.liuzhuo.djtopic", null, message.getBytes());
        System.out.println("发送的消息为：" + message);

        channel.close();
        connection.close();

    }
}
```

（2）消费者1

```java
public class Consumer01 {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        //声明队列
        channel.queueDeclare("topic_queue01", true, false, false, null);
        //绑定交换机与队列，需要指定路由键，路由键可以设置通配符: *.liuzhuo.*
        channel.queueBind("topic_queue01", "topic_exchange", "*.liuzhuo.*");

        while (true) {
            //自动应答，false，不会自动应答，即不会自动消除消息。
            Boolean autoAck = false;
            channel.basicConsume("topic_queue01", autoAck, new DefaultConsumer(channel) {

                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                    System.out.println("=================");
                    System.out.println("topic_queue01:接受到的消息为：" + new String(body, "utf-8"));
                    System.out.println("=================");

                    //确认应对，如果不确认消息的话，队列里面的消息是不会消除的！！！
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            });
        }
    }
}
```

（3）消费者2

```java
public class Consumer02 {

    public static void main(String[] args) throws IOException, TimeoutException {

        Connection connection = ConnectionUtil.openConnection();
        Channel channel = connection.createChannel();

        //声明队列
        channel.queueDeclare("topic_queue02", true, false, false, null);
        //绑定交换机与队列，需要指定路由键
        channel.queueBind("topic_queue02", "topic_exchange", "*.*.client");
        channel.queueBind("topic_queue02", "topic_exchange", "com.#");

        while (true) {
            //自动应答，false，不会自动应答，即不会自动消除消息。
            Boolean isAsk = false;
            channel.basicConsume("topic_queue02", isAsk, new DefaultConsumer(channel) {

                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                    System.out.println("=================");
                    System.out.println("topic_queue02:接受到的消息为：" + new String(body, "utf-8"));
                    System.out.println("=================");

                    //确认应对，如果不确认消息的话，队列里面的消息是不会消除的！！！
                    channel.basicAck(envelope.getDeliveryTag(), false);
                }
            });
        }
    }
}
```

（4）测试：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511174027.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511174135.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511174159.png)

---

修改生产者代码：

```java
        //创建消息
        String message = "news.liuzhuo.client";
        //发送消息,需要路由键
        channel.basicPublish("topic_exchange", "news.liuzhuo.client", null, message.getBytes());

```

运行测试：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511174606.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511174632.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511174646.png)

---

修改生产者代码：

```java
String message = "news.gakki.client";
        //发送消息,需要路由键
        channel.basicPublish("topic_exchange", "news.gakki.client", null, message.getBytes());
```

运行测试：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511174826.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511174852.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511174907.png)

---

修改生产者代码：

```java
String message = "com.xxxx";
//发送消息,需要路由键
channel.basicPublish("topic_exchange", "com.xxxx", null, message.getBytes());
```

运行测试：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511175320.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511175351.png)

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511175405.png)

---

topic类型的交换器，我就演示到这里了，大家可以自行测试~~~

### RPC模型

Remote procedure call (RPC)：**远程过程调用**。

MQ本身是基于异步的消息处理，前面的示例中所有的生产者（P）将消息发送到RabbitMQ后不会知道消费者（C）处理成功或者失败（甚至连有没有消费者来处理这条消息都不知道）。

但实际的应用场景中，我们很可能需要一些同步处理，需要同步等待服务端将我的消息处理完成后再进行下一步处理。这相当于RPC（Remote Procedure Call，远程过程调用）。在RabbitMQ中也支持RPC。

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511175828.png)

RabbitMQ中实现RPC的机制是：

* 客户端发送请求（消息）时，在消息的属性（MessageProperties，在AMQP协议中定义了14种properties，这些属性会随着消息一起发送）中设置两个值 **replyTo**（一个Queue名称，用于告诉服务器处理完成后将通知我的消息发送到这个Queue中）和 **correlationId**（此次请求的标识号，服务器处理完成后需要将此属性返还，客户端将根据这个id了解哪条请求被成功执行了或执行失败）
* 服务器端收到消息并处理
* 服务器端处理完消息后，将生成一条应答消息到 replyTo 指定的 Queue，同时带上correlationId属性
* 客户端之前已订阅 replyTo指定的 Queue，从中收到服务器的应答消息后，根据其中的 correlationId属性分析哪条请求被执行了，根据执行结果进行后续业务处理。



服务器：

```java
public class Consumer {

    public static void main(String[] args) {

        Connection connection = null;

        try {
            connection = ConnectionUtil.openConnection();
            Channel channel = connection.createChannel();
            //声明队列
            channel.queueDeclare("rpc_queue", true, false, false, null);

            channel.basicConsume("rpc_queue", true, new DefaultConsumer(channel) {

                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {

                    System.out.println("=================");
                    System.out.println("rpc_queue中接收到的信息:" + new String(body, "utf-8"));
                    System.out.println("=================");

                    System.out.println("发送应答信息之前：");
                    System.out.println("ReplyTo:" + properties.getReplyTo());
                    System.out.println("CorrelationId:" + properties.getCorrelationId());
                    //发送应答的信息
                    AMQP.BasicProperties props = new AMQP.BasicProperties().builder().correlationId(properties.getCorrelationId()).build();
                    String replytoMessage = "服务端消费完消息后，向客户端发送自己的应答信息！！！";
                    channel.basicPublish("", properties.getReplyTo(), props, replytoMessage.getBytes());

                    System.out.println("发送应答信息之后：");
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            //连接不关闭，一直处于打开状态!
        }
    }
}
```

客户端：

```java
public class Productor {


    public static void main(String[] args) {

        Connection connection = null;
        Channel channel = null;
        
        try {
            connection = ConnectionUtil.openConnection();
            channel = connection.createChannel();
            //声明反馈队列
            channel.queueDeclare("replyTo_queue", true, false, false, null);
            //UUID
            String uuid = UUID.randomUUID().toString();

            String message = "rpc_message";
            AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder().
                    replyTo("replyTo_queue").
                    correlationId(uuid).build();
            channel.basicPublish("", "rpc_queue", properties, message.getBytes());

            System.out.println("发出消息：" + message);

            //接收应答信息
            channel.basicConsume("replyTo_queue", true, new DefaultConsumer(channel) {
                @Override
                public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                    while (true) {
                        if (properties.getCorrelationId().equals(uuid)) {
                            System.out.println(new String(body, "utf-8"));
                            break;
                        }
                        System.out.println("correlationId:" + properties.getCorrelationId());
                        System.out.println("correlationId不是我声明的!!!");
                    }
                }
            });

            Thread.sleep(30000L);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                channel.close();
                connection.close();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (TimeoutException e) {
                e.printStackTrace();
            }
        }
    }
}
```

先运行服务器端，再运行客户端：

最开始的服务器端：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511194018.png)

客户端：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511194132.png)

再看服务器端：

![](https://gakkil.gitee.io/gakkil-image/rabbitmq/QQ截图20190511194202.png)

---

在我们的客户端中：

`handleDelivery ` 函数中使用了 死循环来同步，如果没有接收到 我们一开始发送的 correlationId的话，就会一直死循环，不会进行其他操作了，只要返回回来的correlationId和当初设置的correlationId相等的话，就会跳出死循环，进行下一步操作，强行让异步的消息中间件变成了同步的处理流程。