---
title: Flink中的广播无界流
author: gakkij
categories:
  - flink
tags:
  - flink
img: https://pic.downk.cc/item/5fafd62313b6a3f6d1ff7ae4.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5fafd62313b6a3f6d1ff7ae4.jpg
toc: true
date: 2020-11-14 21:01:39
summary: Flink中的广播无界流
password:
---

今天来学习FLink中的广播无界流的变量。

### 广播变量简介

在Flink中，同一个算子可能存在若干个不同的并行实例，计算过程可能不在同一个Slot中进行，不同算子之间更是如此，因此不同算子的计算数据之间不能像Java数组之间一样互相访问，而广播变量Broadcast便是解决这种情况的。
我们可以把广播变量理解为是一个公共的共享变量，我们可以把一个dataset 数据集广播出去，然后不同的task在节点上都能够获取到，这个数据在每个节点上只会存在一份。

如果不使用broadcast，则在每个节点中的每个task中都需要拷贝一份dataset数据集，比较浪费内存(也就是一个节点中可能会存在多份dataset数据)。

**注意**：**因为广播变量是要把dataStream广播到内存中，所以广播的数据量不能太大，否则会出现OOM这样的问题**

对于有界流：

```java
Broadcast：Broadcast是通过withBroadcastSet(dataset，string)来注册的

Access：通过getRuntimeContext().getBroadcastVariable(String)访问广播变量
```

对与无界流：

```java
使用MapStateDescriptor来描述广播流
broadcastStream = dataStream1.boradcaset(mapSateDescriptor);
dataStream2.connect(broadcastStream).process(new BroadcastProcessFunction()).
```

### 案例

假设，现在有两个数据流：1）学生的基本信息的数据流；2）学生性别的数据流。

```java
学生的基本信息的数据流:
（"张三",18,1,"北京"）// 姓名：张三，年纪：18，性别：1，地址：北京
学生性别的数据流：
(1,"男") // 1：男 ，2：女，3：*
```

现在，我们需要将学生基本信息的数据流和性别数据流合并，最终输出完成的学生信息，根据上面的描述，最终的信息展示：

`（"张三",18,"男","北京"）`

#### 代码

```java
package com.liuzhuo.broadcast;

import org.apache.flink.api.common.state.MapStateDescriptor;
import org.apache.flink.api.common.typeinfo.BasicTypeInfo;
import org.apache.flink.streaming.api.datastream.BroadcastStream;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.datastream.SingleOutputStreamOperator;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.co.BroadcastProcessFunction;
import org.apache.flink.util.Collector;

public class UnBoundBroadCastDemo {

    public static void main(String[] args) throws Exception {

        //1）无界流的执行环境
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        //2) 获取学生基本信息的数据流：这里使用socket
        DataStreamSource<String> stuInfo = env.socketTextStream("localhost", 6666);


        //3) 获取学生性别的数据流
        DataStreamSource<String> genderInfo = env.socketTextStream("localhost", 7777);

        //4) 设置广播的状态变量
        MapStateDescriptor<String, String> genderState = new MapStateDescriptor("genderInfo", BasicTypeInfo.STRING_TYPE_INFO, BasicTypeInfo.STRING_TYPE_INFO);

        //5) 数据流小的变成广播流
        BroadcastStream<String> genderBroadcast = genderInfo.broadcast(genderState);

        //6) 学生基本信息流连接广播流
        SingleOutputStreamOperator<String> result = stuInfo.connect(genderBroadcast).process(new MyBroadCastFunction(genderState));

        //7) 打印
        result.print();

        //8) 执行
        env.execute("无界流的广播状态!");
    }


    static class MyBroadCastFunction extends BroadcastProcessFunction<String, String, String> {

        private MapStateDescriptor<String, String> mapStateDescriptor;

        public MyBroadCastFunction(MapStateDescriptor<String, String> mapStateDescriptor) {
            this.mapStateDescriptor = mapStateDescriptor;
        }

        @Override
        public void processElement(String s, ReadOnlyContext readOnlyContext, Collector<String> collector) throws Exception {
            if (!s.isEmpty()) {
                String[] split = s.split(",");
                String gender = split[2];
                String genderName = readOnlyContext.getBroadcastState(mapStateDescriptor).get(gender);
                if (genderName == null) {
                    genderName = "未知";
                }

                collector.collect(split[0].concat(",").concat(split[1].concat(",").concat(genderName).concat(",").concat(split[3])));
            }
        }

        @Override
        public void processBroadcastElement(String s, Context context, Collector<String> collector) throws Exception {
            //处理广播流的信息
            if (!s.isEmpty()) {
                String[] split = s.split(",");
                String gender = split[0];
                String genderName = split[1];
                context.getBroadcastState(mapStateDescriptor).put(gender, genderName);
            }
        }
    }
}

```

#### 开启socket的环境

启动两个shell环境

第一个为监听6666端口号的socket，第二个为监听7777端口的socket

![](https://pic.downk.cc/item/5fafe48401d93f4ea8fbc2c0.jpg)

#### 启动程序

如果报xxx类找不到的问题，请打开idea的运行环境，勾选如下的信息

![](https://pic.downk.cc/item/5fafe4df8d4c9a67fa6bb99d.jpg)

#### 验证

1）在端口：7777输入：`1,男`

![](https://pic.downk.cc/item/5fafe55f10e77682008b3cb4.jpg)

结果：控制台什么都不打印。

2）在端口号6666：输入：`张三,18,1,北京`

![](https://pic.downk.cc/item/5fafe62b13b6a3f6d1041064.jpg)

3）在端口号6666：输入：`王五,19,2,北京`

![](https://pic.downk.cc/item/5fafe69313b6a3f6d10438a4.jpg)

4）在端口：7777输入：`2,女`

![](https://pic.downk.cc/item/5fafe75b381403d331ef0760.jpg)

