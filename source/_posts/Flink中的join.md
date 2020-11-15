---
title: Flink中的join
author: gakkij
categories:
  - flink
tags:
  - flink
img: https://pic.downk.cc/item/5fb0e4aa01d2c6816c435485.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5fb0e4aa01d2c6816c435485.jpg
toc: true
date: 2020-11-15 16:13:33
summary: flink中的join操作
password:
---

### 介绍

上篇文章，我们知道了flink中的广播流变量，今天我们来学习flink中的Join操作，只不过Flink是在一个时间窗口上面进行两个表的Join。

目前，Flink支持了两种Join：Window Join（窗口连接）和 Interval Join （时间间隔连接）。

Window Join：主要在Flink的窗口上进行操作，它将两个流中落在相同窗口的元素按照某个key进行Join。

一个Window Join的大致过程如下：

```java
input1.join(input2)
  .where(<KeySelector>)     // input1使用哪个字段作为Key
  .equalTo(<KeySelector>)   // input2使用哪个字段作为Key
  .window(<WindowAssigner>) // 指定WindowAssigner
  [.trigger(<Trigger>)]     // 指定Trigger（可选）
  [.evictor(<Evictor>)]     // 指定Evictor（可选）
  .apply(<JoinFunction>)    // 指定JoinFunction
```

### 案例

#### 背景

现在，我们有两个无界流，进行Join，第一个无界流学生的性别流，第二个无界流是学生的基本流；合并两个流后进行Join。

#### 代码

```java
package com.liuzhuo.join;

import org.apache.flink.api.common.functions.FlatJoinFunction;
import org.apache.flink.api.common.typeinfo.TypeHint;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.java.tuple.Tuple2;
import org.apache.flink.api.java.tuple.Tuple4;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.datastream.SingleOutputStreamOperator;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.source.RichSourceFunction;
import org.apache.flink.streaming.api.windowing.assigners.TumblingProcessingTimeWindows;
import org.apache.flink.streaming.api.windowing.time.Time;
import org.apache.flink.util.Collector;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class UnboundedJoinStream {

    public static void main(String[] args) throws Exception {


        //1) 无界流的执行环境
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        //2) 添加无界流的数据流：自定义一个数据流，每两秒进行发送一个数据
        DataStreamSource<Tuple2<Integer, String>> genderStream = env.addSource(new MySourceFunction());

        //3) socket无界流
        SingleOutputStreamOperator<Tuple4<String, Integer, Integer, String>> stuInfoStream = env.socketTextStream("localhost", 8888)
                .filter(stuInfo -> !stuInfo.isEmpty())
                .map(stuInfo -> {
                    String[] split = stuInfo.split(",");
                    return new Tuple4<String, Integer, Integer, String>(split[0], Integer.valueOf(split[1]), Integer.valueOf(split[2]), split[3]);
                }).returns(TypeInformation.of(new TypeHint<Tuple4<String,Integer, Integer,String>>(){}));

        //4）Join操作
        DataStream<String> result = stuInfoStream.join(genderStream)
                .where(stuInfo -> stuInfo.f2)
                .equalTo(genderInfo -> genderInfo.f0)
                .window(TumblingProcessingTimeWindows.of(Time.seconds(3)))
                .apply(new MyFlatJoinFunction());


        //5) 打印
        result.print("两个stream的Join：");

        //6) 执行
        env.execute("两个stream的Join");
    }

    static class MySourceFunction extends RichSourceFunction<Tuple2<Integer, String>> {

        private volatile boolean isRunning = true;

        @Override
        public void run(SourceContext<Tuple2<Integer, String>> sourceContext) throws Exception {

            List<Tuple2<Integer, String>> sources = Arrays.asList(new Tuple2<Integer, String>(1, "男"), new Tuple2<Integer, String>(2, "女"), new Tuple2<Integer, String>(3, "*"));
            int i = 0;
            while (isRunning) {

                Tuple2<Integer, String> data = sources.get(i++);

                sourceContext.collect(data);

                if (i >= sources.size()) {
                    i = 0;
                }

                //休眠两秒钟
                TimeUnit.SECONDS.sleep(3);
            }
        }

        @Override
        public void cancel() {
            this.isRunning = false;
        }
    }

    static class MyFlatJoinFunction implements FlatJoinFunction<Tuple4<String, Integer, Integer, String>, Tuple2<Integer, String>, String> {

        @Override
        public void join(Tuple4<String, Integer, Integer, String> first, Tuple2<Integer, String> second, Collector<String> out) throws Exception {
            String name = first.f0;
            Integer age = first.f1;
            String gender = second.f1;
            String address = first.f3;
            out.collect(name.concat(",").concat(String.valueOf(age)).concat(",").concat(gender).concat(",").concat(address));
        }
    }
}

```

#### 效果

![](https://pic.downk.cc/item/5fb0f68ca1742a58a817ab5a.jpg)

这里，我设置的是两秒钟来发送数据，两秒的滚动窗口。

每两秒钟，发送一次性别的数据，此时，我们在终端输入相应的性别序号来印证即可，输入的性别序号不对等就不会打印出来数据的。



