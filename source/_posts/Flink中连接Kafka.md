---
title: Flink中连接Kafka
author: gakkij
categories:
  - flink
tags:
  - flink
img: https://img.imgdb.cn/item/6056edda524f85ce2952e7f6.jpg
top: false
cover: false
coverImg: https://img.imgdb.cn/item/6056edda524f85ce2952e7f6.jpg
toc: true
date: 2021-03-21 14:51:58
summary: flink中连接Kafka
password:
---

前面的文章，我们已经了解过了Kafka的搭建，所以今天，我们要来使用flink连接kafka消费数据，然后处理后，发送数据到Kafka中。

## 背景

1）消费topic：person中的数据

2）将person中的数据解析后，封装成Person对象

3）将Person对象，吐出到topic：gakki中进行展示。

## 环境

### kafka

1）先启动zookeeper

```shell
./zkServer.sh start ../conf/zoo.cfg
```

2）再启动kafka

```shell
#后台启动kafka
./kafka-server-start.sh -daemon ../config/server.properties
```

3）创建topic

```shell
1) 创建person的topic
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic person

2）创建gakki的topic
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic gakki
```

4）显示已创建的topic

```shell
./bin/kafka-topics.sh --list --zookeeper localhost:2181
```

## Flink

### pom文件

```java
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>flnk-deep-study</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <java.version>1.8</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <flink.version>1.12.2</flink.version>
        <scala.binary.version>2.12</scala.binary.version>
    </properties>

    <dependencies>

        <!-- flink：客户端的api -->
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-clients_${scala.binary.version}</artifactId>
            <version>${flink.version}</version>
            <scope>provided</scope>
        </dependency>

        <!-- flink-java：用于DataSet，批处理 -->
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-java</artifactId>
            <version>${flink.version}</version>
            <scope>provided</scope> <!--编译后：不打包，因为集群中包含-->
        </dependency>

        <!-- flink-streaming-java：用于DataStream：流出来 -->
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-streaming-java_${scala.binary.version}</artifactId>
            <version>${flink.version}</version>
            <scope>provided</scope> <!--编译后：不打包，因为集群中包含-->
        </dependency>

        <!-- flink:scala的依赖：学习使用       -->
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-scala_${scala.binary.version}</artifactId>
            <version>${flink.version}</version>
            <scope>provided</scope>
        </dependency>

        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-streaming-scala_${scala.binary.version}</artifactId>
            <version>${flink.version}</version>
            <scope>provided</scope>
        </dependency>

        <!--flink的kafka连接器-->
        <!-- https://mvnrepository.com/artifact/org.apache.flink/flink-connector-kafka -->
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-connector-kafka_${scala.binary.version}</artifactId>
            <version>${flink.version}</version>
        </dependency>


        <!--日志文件-->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>1.7.7</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.17</version>
            <scope>runtime</scope>
        </dependency>

    </dependencies>


    <build>
        <plugins>
            <!--            <plugin>-->
            <!--                <groupId>org.apache.maven.plugins</groupId>-->
            <!--                <artifactId>maven-shade-plugin</artifactId>-->
            <!--                <version>3.0.0</version>-->
            <!--                <executions>-->
            <!--                    <execution>-->
            <!--                        <phase>package</phase>-->
            <!--                        <goals>-->
            <!--                            <goal>shade</goal>-->
            <!--                        </goals>-->
            <!--                        <configuration>-->
            <!--                            <artifactSet>-->
            <!--                                <excludes>-->
            <!--                                    <exclude>com.google.code.findbugs:jsr305</exclude>-->
            <!--                                    <exclude>org.slf4j:*</exclude>-->
            <!--                                    <exclude>log4j:*</exclude>-->
            <!--                                </excludes>-->
            <!--                            </artifactSet>-->
            <!--                            <filters>-->
            <!--                                <filter>-->
            <!--                                    &lt;!&ndash; Do not copy the signatures in the META-INF folder.-->
            <!--                                    Otherwise, this might cause SecurityExceptions when using the JAR. &ndash;&gt;-->
            <!--                                    <artifact>*:*</artifact>-->
            <!--                                    <excludes>-->
            <!--                                        <exclude>META-INF/*.SF</exclude>-->
            <!--                                        <exclude>META-INF/*.DSA</exclude>-->
            <!--                                        <exclude>META-INF/*.RSA</exclude>-->
            <!--                                    </excludes>-->
            <!--                                </filter>-->
            <!--                            </filters>-->
            <!--                            <transformers>-->
            <!--                                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">-->
            <!--                                    <mainClass>com.liuzhuo.Bounded</mainClass>-->
            <!--                                </transformer>-->
            <!--                            </transformers>-->
            <!--                        </configuration>-->
            <!--                    </execution>-->
            <!--                </executions>-->
            <!--            </plugin>-->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <version>3.0.0</version>
                <configuration>
                    <descriptorRefs>
                        <descriptorRef>jar-with-dependencies</descriptorRef>
                    </descriptorRefs>
                </configuration>
                <executions>
                    <execution>
                        <id>make-assembly</id>
                        <phase>package</phase>
                        <goals>
                            <goal>single</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <!-- 资源文件拷贝插件 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-resources-plugin</artifactId>
                <version>2.7</version>
                <configuration>
                    <encoding>${project.build.sourceEncoding}</encoding>
                </configuration>
            </plugin>
            <!-- java编译插件 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.2</version>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                    <encoding>${project.build.sourceEncoding}</encoding>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

### 驱动类

```java
public class KafkaSource {

    public static void main(String[] args) throws Exception {

        //1) 创建环境
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        //2) 获取kafka的source连接器

        Properties properties = new Properties();
        properties.setProperty("bootstrap.servers", "localhost:9092");
        properties.setProperty("group.id", "consumer-group");
        properties.setProperty("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        properties.setProperty("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

        FlinkKafkaConsumer kafkaConsumer = new FlinkKafkaConsumer<String>("person", new SimpleStringSchema(), properties);
        DataStream<String> dataStream = env.addSource(kafkaConsumer);

        //4) map
        SingleOutputStreamOperator<String> results = dataStream.map(value -> {
            if (value != null && !value.isEmpty()) {
                String[] split = value.split(",");
                Person person = new Person(split[0], Integer.parseInt(split[1]), split[2]);
                return person.toString();
            } else {
                return "";
            }
        }).returns(new TypeHint<String>() {
        });

        //3) sink
        //dataStream.print();
        Properties properties2 = new Properties();
        properties2.setProperty("bootstrap.servers", "localhost:9092");
        properties2.setProperty("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        properties2.setProperty("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        properties2.setProperty("auto.offset.reset", "latest");
        FlinkKafkaProducer<String> gakki = new FlinkKafkaProducer<>("gakki", new SimpleStringSchema(), properties2);
        results.addSink(gakki);

        //4) execute
        env.execute("kafka source!");

    }
}
```

### Person类

```java
public class Person implements Serializable {

    private String name;
    private Integer age;
    private String address;

    public Person() {
    }

    public Person(String name, Integer age, String address) {
        this.name = name;
        this.age = age;
        this.address = address;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", address='" + address + '\'' +
                '}';
    }
}
```

## 测试

1）运行程序：

编辑run的环境：

![](https://img.imgdb.cn/item/6056f359524f85ce29560f5f.jpg)

因为：pom文件中flink的依赖scope是provided模式，就是不会将其打成jar包中，所以本地运行时，需要打开。

![](https://img.imgdb.cn/item/6056f499524f85ce2956dc24.jpg)

2）打开person的topic的生产者

```shell
./kafka-console-producer.sh --broker-list localhost:9092 --topic person
```

![](https://img.imgdb.cn/item/6056f505524f85ce29571ce3.jpg)

3）打开gakki的topic的消费者

```shell
./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic gakki
```

![](https://img.imgdb.cn/item/6056f54f524f85ce29574975.jpg)

4）使用person的topic来发数

![](https://img.imgdb.cn/item/6056f601524f85ce2957a79f.jpg)

说明：

我们使用person的topic的控制台生产者来发数：

`gakki,18,beijing来发数据`

使用gakki的topic的控制台消费者来消费数据：

`Person{name='gakki', age=18, address='beijing'}`

