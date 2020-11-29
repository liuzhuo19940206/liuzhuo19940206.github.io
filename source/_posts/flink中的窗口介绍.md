---
title: flink中的窗口介绍
author: gakkij
categories:
  - flink
tags:
  - flink
img: https://pic.downk.cc/item/5fc32edfd590d4788ab02fa5.jpg
top: false
cover: false
coverImg: https://pic.downk.cc/item/5fc32edfd590d4788ab02fa5.jpg
toc: true
date: 2020-11-29 13:13:52
summary: flink中的窗口介绍
password:
---

### FLink中的窗口简介

Window是无限数据流处理的核心，Window将一个无限的stream拆分成有限大小的”buckets”桶，我们可以在这些桶上做计算操作。

窗口化的Flink程序的一般结构如下，第一个代码段中是分组的流，而第二段是非分组的流。

正如我们所见，唯一的区别是分组的stream调用`keyBy(…)`和`window(…)`，而非分组的stream中`window()`换成了`windowAll(…)`，这些也将贯穿都这一页的其他部分中。

Keyed Windows：

```java
stream.keyBy(...)           <-  keyed versus non-keyed windows
       .window(...)         <-  required: "assigner"
      [.trigger(...)]       <-  optional: "trigger" (else default trigger)
      [.evictor(...)]       <-  optional: "evictor" (else no evictor)
      [.allowedLateness()]  <-  optional, else zero
       .reduce/fold/apply() <-  required: "function"
```

Non-Keyed Windows:

```java
stream.windowAll(...)       <-  required: "assigner"
      [.trigger(...)]       <-  optional: "trigger" (else default trigger)
      [.evictor(...)]       <-  optional: "evictor" (else no evictor)
      [.allowedLateness()]  <-  optional, else zero
       .reduce/fold/apply() <-  required: "function"
```

在上面的例子中，方括号[]内的命令是可选的，这表明Flink允许你根据最符合你的要求来定义自己的window逻辑。

###  Window 的生命周期

简单地说，当一个属于window的元素到达之后这个window就创建了，而当当前时间(事件或者处理时间)为window的创建时间跟用户指定的延迟时间相加时，窗口将被彻底清除。Flink 确保了只清除基于时间的window，其他类型的window不清除，例如：全局窗口；例如:对于一个每5分钟创建无覆盖的(即 翻滚窗口)窗口，允许一个1分钟的时延的窗口策略，Flink将会在12:00到12:05这段时间内第一个元素到达时创建窗口，当水印通过12:06时，移除这个窗口。
　　此外，每个 Window 都有一个**Trigger(触发器)** 和一个附属于 **Window 的函数**(例如: `WindowFunction`, `ReduceFunction` 及 `FoldFunction`)。函数里包含了应用于窗口(Window)内容的计算，而Trigger(触发器)则指定了函数在什么条件下可被应用(函数何时被触发),一个触发策略可以是 "当窗口中的元素个数超过4个时" 或者 "当水印达到窗口的边界时"。触发器还可以决定在窗口创建和删除之间的任意时刻清除窗口的内容，本例中的清除仅指清除窗口的内容而不是窗口的元数据,也就是说新的数据还是可以被添加到当前的window中。
　　除了上面的提到之外，你还可以指定一个驱逐者(Evictor), Evictor将在触发器触发之后或者在函数被应用之前或者之后，清楚窗口中的元素。

### Window的分类

#### Global Window 和 keyed Window

```kotlin
概述:
    在运用窗口计算时,Flink根据上游数据集是否为KeyedStream类型,对应的Window也会有所不同.

Keyed Window :
    上游数据集如果是KeyedStream类型,则调用DataStream API 的Window()方法,数据会根据Key在不同的Task实例中并行分别计算,最后得出针对每个Key统计的结果.

Global Window:
    如果是Non-Keyey类型,则调用WindowsAll()方法,所有的数据都会在窗口算子中汇到一个Task中计算,并得出全局统计结果
eg:
    // Global Window
    data.windowAll(自定义的WindowAssigner)
    //KeyedWindow
    data.keyBy(_.sid)
    .window(自定义的WindowAssigner)
```

#### 窗口分配器(Window Assingers)

​    指定完你的数据流是分组的还是非分组的之后，接下来你需要定义一个**窗口分配器(`window assigner`)**，窗口分配器定义了元素如何分配到窗口中，这是通过在分组数据流中调用`window(...)`或者非分组数据流中调用`windowAll(...)`时你选择的窗口分配器(`WindowAssigner`)来指定的。`WindowAssigner`是负责将每一个到来的元素分配给一个或者多个窗口(window),Flink 提供了一些常用的预定义窗口分配器，即:**滚动窗口、滑动窗口、会话窗口和全局窗口**；你也可以通过**继承`WindowAssigner`类来自定义自己的窗口**。所有的内置窗口分配器(除了全局窗口 `global window`)都是通过时间来分配元素到窗口中的，这个时间要么是处理的时间，要么是事件发生的时间。

#### 计时窗口和计数窗口

Time Window 和Count Window

概述:
    基于业务数据的方面考虑,Flink又支持两种类型的窗口,一种是基于时间的窗口叫Time Window，还有一种基于输入数据量的窗口叫Count Window。

```java
根据不同的业务场景,Time Window也可以分为三种类型,分别是滚动窗口(Tumbling Window)、滑动窗口(Sliding Window)和会话窗口叫(Session Window)。Count Window 也是类似的
```

#### 滚动窗口(Tumbling Window)

概述:
    滚动窗口是根据**固定时间**进行切分,且窗口和窗口之间的**元素互不重叠**,这种类型的窗口最大特点是比较简单,只需要指定一个窗口长度(window size)。

滚动窗口分配器将每个元素分配的一个指定窗口大小的窗口中，滚动窗口有一个固定的大小，并且不会出现重叠。例如:如果你指定了一个5分钟大小的滚动窗口，当前窗口将被评估并每5分钟创建一个新的窗口。

<img src="https://pic.downk.cc/item/5fc3340dd590d4788ab17925.jpg" style="zoom:30%;" />

```cpp
    // 每个5s统计每个基站的日志数量
    data.map((_.sid,1))
    .keyBy(_._1)
    .timeWindow(Time.seconds(5))
    //window(TumblingEventTImeWindows.of(Time.seconds(5)))
    .sum(1)//聚合
    其中时间间隔可以是Time.milliseconds(x),Time.seconds(x)或Time.minutes(x)
```

PS：`timeWindow`是一种简写。当我们在执行环境设置了`TimeCharacteristic.EventTime`时，Flink对应调用`TumblingEventTimeWindows`；如果我们基于`TimeCharacteristic.ProcessingTime`，Flink使用`TumblingProcessingTimeWindows`。

---

滚动事件时间窗口( tumbling event-time windows )

```cpp
input
    .keyBy(<key selector>)
    .window(TumblingEventTimeWindows.of(Time.seconds(5)))
    .<windowed transformation>(<window function>);
```

滚动处理时间窗口(tumbling processing-time windows)

```
input
    .keyBy(<key selector>)
    .window(TumblingProcessingTimeWindows.of(Time.seconds(5)))
    .<windowed transformation>(<window function>);
```

每日偏移8小时的滚动事件时间窗口(daily tumbling event-time windows offset by -8 hours. )

```
input
    .keyBy(<key selector>)
    .window(TumblingEventTimeWindows.of(Time.days(1), Time.hours(-8)))
    .<windowed transformation>(<window function>);
```

​      在上面最后的例子中，滚动窗口分配器还接受了一个**可选的偏移参数**，可以用来改变窗口的排列。例如，没有偏移的话按小时的滚动窗口将按时间纪元来对齐，也就是说你将一个如: 1:00:00.000~1:59:59.999,2:00:00.000~2:59:59.999等，如果你想改变一下，你可以指定一个偏移，如果你指定了一个15分钟的偏移，你将得到1:15:00.000~2:14:59.999,2:15:00.000~3:14:59.999等。时间偏移一个很大的用处是用来调准非0时区的窗口，例如:在中国你需要指定一个8小时的时间偏移。

#### 滑动窗口(Sliding Window)

概述:
    滑动窗口也是一种比较常见的窗口类型,其特点是在滚动窗口基础上增加了窗口滑动时间(Slide TIme),且允许窗口数据发生重叠,当Windows size固定之后,窗口并不像滚动窗口按照windows Size向前移动,而是根据设定的Slide Time向前滑动.
    窗口之间的数据重叠大小根据Windows Size和Slide Time决定,当SlideTime小于Windows size 便会发生窗口重叠.

例如，你有10分钟的窗口和5分钟的滑动，那么每个窗口中5分钟的窗口里包含着上个10分钟产生的数据，如下图所示:

![](https://pic.downk.cc/item/5fc335d5d590d4788ab1eae8.jpg)

```cpp
    //每隔5s计算最近10s内,每个基站的日志数量
    data.map((_,1))
    .keyBy(_._1)
    .timeWindow(Time.seconds(10),Time.seconds(5))
    //window(SlidingEventTimeWindows.of(Time.seconds(5)))
    .sum(1)
```

滑动事件时间窗口

```
input
    .keyBy(<key selector>)
    .window(SlidingEventTimeWindows.of(Time.seconds(10), Time.seconds(5)))
    .<windowed transformation>(<window function>);
```

滑动处理时间窗口

```
input
    .keyBy(<key selector>)
    .window(SlidingProcessingTimeWindows.of(Time.seconds(10), Time.seconds(5)))
    .<windowed transformation>(<window function>);
```

偏移8小时的滑动处理时间窗口(sliding processing-time windows offset by -8 hours)

```
input
    .keyBy(<key selector>)
    .window(SlidingProcessingTimeWindows.of(Time.hours(12), Time.hours(1), Time.hours(-8)))
    .<windowed transformation>(<window function>);
```

​      正如上述例子所示，滑动窗口分配器也有一个可选的偏移参数来改变窗口的对齐。例如，没有偏移参数，按小时的窗口，有30分钟的滑动，将根据时间纪元来对齐，也就是说你将得到如下的窗口1:00:00.001:59:59.999,1:30:00.0002:29:59.999等。而如果你想改变窗口的对齐，你可以给定一个偏移，如果给定一个15分钟的偏移，你将得到如下的窗口:1:15:00.000~2:14.59.999,　1:45:00.000~2:44:59.999等。时间偏移一个很大的用处是用来调准非0时区的窗口，例如:在中国你需要指定一个8小时的时间偏移。

---

#### 会话窗口(Session Window)

概述:
    会话窗口主要是将某段时间内活跃度较高的数据聚合成一个窗口进行计算,窗口的触发的条件是`Session Gap`,是指在规定
    的时间内如果没有数据活跃接入,则认为窗口结束,然后触发窗口计算结果。
注意:
    需要注意的是：如果数据一直不间断地进入窗口,会导致窗口始终不触发。
    与滑动窗口不同的是,Session Windows不需要有固定Window size和slide time ,
    需要定义Session gap,来规定不活跃数据的时间上限即可。

```cpp
    //3s内如果没有数据接入,则计算每个基站的日志数量
    data.map((_.sid,1))
    .keyBy(_._1)
    .window(EventTimeSessionWindows.withGap(Time.seconds(3))))
    .sum(1)
```

会话窗口（SESSION）通过SESSION活动来对元素进行分组。会话窗口与滚动窗口和滑动窗口相比，没有窗口重叠，没有固定窗口大小。相反，当它在一个固定的时间周期内不再收到元素，即会话断开时，该窗口就会关闭。

会话窗口通过一个间隔时间（Gap）来配置，这个间隔定义了非活跃周期的长度。例如，一个表示鼠标单击活动的数据流可能具有长时间的空闲时间，并在两段空闲之间散布着高浓度的单击。如果数据在指定的间隔（Gap）之后到达，则会开始一个新的窗口。

会话窗口示例如下图，每个Key由于不同的数据分布，形成了不同的Window。

![](https://pic.downk.cc/item/5fc33979d590d4788ab2e0ed.jpg)

事件时间会话窗口(event-time session windows)

```
input
    .keyBy(<key selector>)
    .window(EventTimeSessionWindows.withGap(Time.minutes(10)))
    .<windowed transformation>(<window function>);
```

处理时间会话窗口(processing-time session windows)

```
input
    .keyBy(<key selector>)
    .window(ProcessingTimeSessionWindows.withGap(Time.minutes(10)))
    .<windowed transformation>(<window function>);
```

**注意**: 因为session窗口没有一个固定的开始和结束，他们的评估与滑动窗口和滚动窗口不同。在内部，session操作为每一个到达的元素创建一个新的窗口，并合并间隔时间小于指定非活动间隔的窗口。为了进行合并，session窗口的操作需要指定一个**合并触发器**(Trigger)和一个**合并窗口函数**(Window Function),如:ReduceFunction或者WindowFunction(FoldFunction不能合并)。

---

计数的窗口也有相应的：滚动、滑动等

### Window 的 API

```dart
概述:
    在实际案例中Keyed Window 使用最多,所以我们需要掌握Keyed Window的算子,在每个窗口算子中包含了 
    Windows Assigner、Windows Trigger(窗口触发器)、Evictor(数据剔除器)、Lateness(时延设定)、
    Output (输出标签)以及Windows Function,其中Windows Assigner和Windows Functions是所有窗口算子
    必须指定的属性,其余的属性都是根据实际情况选择指定.
code:
    stream.keyBy(...)是Keyed类型数据集
    .window(...)//指定窗口分配器类型
    [.trigger(...)]//指定触发器类型(可选)
    [.evictor(...)] // 指定evictor或者不指定(可选)
    [.allowedLateness(...)] //指定是否延迟处理数据(可选)
    [.sideOutputLateData(...)] // 指定Output lag(可选)
    .reduce/aggregate/fold/apply() //指定窗口计算函数
    [.getSideOutput(...)] //根据Tag输出数据(可选)
intro:
    Windows Assigner : 指定窗口的类型,定义如何将数据流分配到一个或多个窗口
    Windows Trigger : 指定窗口触发的时机,定义窗口满足什么样的条件触发计算
    Evictor : 用于数据剔除
    allowedLateness : 标记是否处理迟到数据,当迟到数据达到窗口是否触发计算
    Output Tag: 标记输出标签,然后在通过getSideOutput将窗口中的数据根据标签输出
    Windows Function: 定义窗口上数据处理的逻辑,例如对数据进行Sum操作
```

#### 窗口聚合函数

```dart
概述:
    如果定义了Window Assigner ,下一步就可以定义窗口内数据的计算逻辑,这也就是Window Function的定义,
    Flink提供了四种类型的Window Function,分别为 ReduceFunction、FoldFunction、AggregateFunction以及ProcessWindowFunction,(sum和max)等.
      
前4种类型的Window Function按照计算原理的不同可以分为两大类：
1. 一类是增量聚合函数: 对应有ReduceFunction、FoldFunction、AggregateFunction;
2. 另一类是全量窗口函数,对应有ProcessWindowFunction(WindowFunction)
  
差异:
    1. 增量聚合函数计算性能较高,占用内存空间少,主要因为基于中间状态的计算结果,窗口中只维护中间结果状态值,
    不需要缓存原始数据.
    2. 全量窗口函数使用的代价相对较高,性能比较弱,主要因为此时算子需要对所有属于该窗口的接入数据进行缓存,
    然后等到窗口触发的时候,对所有的原始数据进行汇总计算.
```

#### ReduceFunction

```dart
概述
    ReduceFunction 定义了对输入的两个相同类型的数据元素按照指定的计算方法进行聚合的逻辑,
    然后输出类型相同的一个结果元素。
      
code:
    // 每隔5s统计每个基站的日志数量
    data.map((_.sid,1))
    .keyBy(_._1)
    .window(TumblingEventTimeWindows.of(TIme.seconds(5)))
    .reduce((v1,v2)=>(v1._1,v1._2+v2._2))
      
code2：
      DataStream<Tuple2<String, Long>> input = ...;
 input
    .keyBy(<key selector>)
    .window(<window assigner>)
    .reduce(new ReduceFunction<Tuple2<String, Long>> {
      public Tuple2<String, Long> reduce(Tuple2<String, Long> v1, Tuple2<String, Long> v2) {
        return new Tuple2<>(v1.f0, v1.f1 + v2.f1);
      }
    });
```

#### FoldFunction

`FoldFunction` 指定了一个输入元素如何与一个输出类型的元素合并的过程，这个`FoldFunction` 会被每一个加入到窗口中的元素和当前的输出值增量地调用，第一个元素是与一个预定义的类型为输出类型的初始值合并。

```
DataStream<Tuple2<String, Long>> input = ...;
 input
    .keyBy(<key selector>)
    .window(<window assigner>)
    .fold("", new FoldFunction<Tuple2<String, Long>, String>> {
       public String fold(String acc, Tuple2<String, Long> value) {
         return acc + value.f1;
       }
    });
```

#### AggregateFunction

```kotlin
概述:
    AggregateFunction也是基于中间状态计算结果的增量计算函数,但AggregateFunction在窗口
    计算上更加通用,AggregateFunction接口相对ReduceFunction更加灵活.实现复杂度也相对较高. 
    AggregateFunction接口中定义了三个需要复写的方法,其中
    add()定义数据添加的逻辑,
    getResult()定义了根据accmulator计算结果的逻辑,
    merge()方法定义合并accumulator的逻辑
code:
    //每隔3s内计算最近5s内,每个基站的日志数量
        val data = env.readTextFile("D:\\Workspace\\IdeaProjects\\F1Demo\\src\\FlinkDemo\\functions\\station.log")
          .map { line =>
            var arr = line.split(",")
            StationLog(arr(0).trim, arr(1).trim, arr(2).trim, arr(3).trim, arr(4).trim.toLong, arr(5).trim.toLong)
          }
        val result = data.map(stationLog => (stationLog.sid, 1))
          .keyBy(_._1)
          .timeWindow(Time.seconds(5), Time.seconds(3))
          // new AggregateFunction[In,Acc,Out]
          .aggregate(new AggregateFunction[(String, Int), (String, Long), (String, Long)] {
          override def createAccumulator(): (String, Long) = ("", 0)
    
          override def add(in: (String, Int), acc: (String, Long)): (String, Long) = {
            (in._1, acc._2 + in._2)
          }
    
          override def getResult(acc: (String, Long)): (String, Long) = {
            print(acc)
            acc
          }
    
          override def merge(acc: (String, Long), acc1: (String, Long)): (String, Long) = {
            (acc._1, acc1._2 + acc._2)
          }
        })
    
        env.execute()
      }
```

#### ProcessWindowFunction

```dart
概念:
    前面提到的ReduceFunction和AggregateFunction都是基于中间状态实现增量计算的窗口函数,虽然已经满足绝大
    多数场景,但在某些情况下,统计更复杂的指标可能需要依赖于窗口中所有的数据元素,或需要操作窗口中的状态数据
    和窗口元数据,这时就需要使用到ProcessWindowsFunction,ProcessWindowsFunction能够更加灵活地支持基于窗口
    全部数据元素的结果计算,例如对整个窗口数据排序取TopN,这样的需要就必须使用ProcessWindowFunction.
code:
    val result = data.map(stationLog => ((stationLog.sid, 1)))
  .keyBy(_._1)
  //.timeWindow(Time.seconds(5))
  .window(TumblingProcessingTimeWindows.of(Time.seconds(5)))
  // ProcessWindowFunction[In,Out,Key,Window]
  .process(new ProcessWindowFunction[(String, Int), (String, Long), String, TimeWindow] {
  //一个窗口结束的时候调用一次(一个分组执行一次)
  override def process(key: String, context: Context, elements: Iterable[(String, Int)], out: Collector[(String, Long)]): Unit = {
    print("----")
    //注意：整个窗口的数据保存到Iterable，里面有很多行数据。Iterable的size就是日志的总条数
    out.collect((key, elements.size))
  }
}).print()
env.execute()
```

#### 有增量聚合功能的WindowFunction

`WindowFunction`可以跟`ReduceFunction`或者`FoldFunction`结合来增量地对到达`window`中的元素进行聚合，当`window`关闭之后，`WindowFunction`就能提供聚合结果。当获取到`WindowFunction`额外的`window`元信息后就可以进行增量计算窗口了。
*标注:*你也可以使用`ProcessWindowFunction`替换`WindowFunction`来进行增量窗口聚合。

1.使用FoldFunction 进行增量窗口聚合(Incremental Window Aggregation with FoldFunction)

下面的例子展示了一个增量的`FoldFunction`如何跟一个`WindowFunction`结合，来获取窗口的事件数，并同时返回窗口的`key`和窗口的最后时间。

```
DataStream<SensorReading> input = ...;
input
  .keyBy(<key selector>)
  .timeWindow(<window assigner>)
  .fold(new Tuple3<String, Long, Integer>("",0L, 0), new MyFoldFunction(), new MyWindowFunction())
// Function definitions
private static class MyFoldFunction
    implements FoldFunction<SensorReading, Tuple3<String, Long, Integer> > {
  public Tuple3<String, Long, Integer> fold(Tuple3<String, Long, Integer> acc, SensorReading s) {
      Integer cur = acc.getField(2);
      acc.setField(2, cur + 1);
      return acc;
  }
}
private static class MyWindowFunction
    implements WindowFunction<Tuple3<String, Long, Integer>, Tuple3<String, Long, Integer>, String, TimeWindow> {
  public void apply(String key,
                    TimeWindow window,
                    Iterable<Tuple3<String, Long, Integer>> counts,
                    Collector<Tuple3<String, Long, Integer>> out) {
    Integer count = counts.iterator().next().getField(2);
    out.collect(new Tuple3<String, Long, Integer>(key, window.getEnd(),count));
  }
}
```

2.使用ReduceFunction进行增量窗口聚合(Incremental Window Aggregation with ReduceFunction)

下面例子展示了一个增量额`ReduceFunction`如何跟一个`WindowFunction`结合，来获取窗口中最小的事件和窗口的开始时间。

```
DataStream<SensorReading> input = ...;
input
  .keyBy(<key selector>)
  .timeWindow(<window assigner>)
  .reduce(new MyReduceFunction(), new MyWindowFunction());
// Function definitions
private static class MyReduceFunction implements ReduceFunction<SensorReading> {
  public SensorReading reduce(SensorReading r1, SensorReading r2) {
      return r1.value() > r2.value() ? r2 : r1;
  }
}
private static class MyWindowFunction
    implements WindowFunction<SensorReading, Tuple2<Long, SensorReading>, String, TimeWindow> {
  public void apply(String key,
                    TimeWindow window,
                    Iterable<SensorReading> minReadings,
                    Collector<Tuple2<Long, SensorReading>> out) {
      SensorReading min = minReadings.iterator().next();
      out.collect(new Tuple2<Long, SensorReading>(window.getStart(), min));
  }
}
```

#### Trigger

触发器（Trigger）决定了何时启动Window Function来处理窗口中的数据以及何时将窗口内的数据清理。增量计算窗口函数对每个新流入的数据直接进行聚合，Trigger决定了在窗口结束时将聚合结果发送出去；全量计算窗口函数需要将窗口内的元素缓存，Trigger决定了在窗口结束时对所有元素进行计算然后将结果发送出去。每个窗口都有一个默认的Trigger，比如前文这些例子都是基于Processing Time的时间窗口，当到达窗口的结束时间时，Trigger以及对应的计算被触发。如果我们有一些个性化的触发条件，比如窗口中遇到某些特定的元素、元素总数达到一定数量或窗口中的元素到达时满足某种特定的模式时，我们可以自定义一个Trigger。我们甚至可以在Trigger中定义一些提前计算的逻辑，比如在Event Time语义中，虽然Watermark还未到达，但是我们可以定义提前计算输出的逻辑，以快速获取计算结果，获得更低的延迟。

我们先看Trigger返回一个什么样的结果。当满足某个条件，Trigger会返回一个名为`TriggerResult`的结果：

- CONTINUE：什么都不做。
- FIRE：启动计算并将结果发送给下游，不清理窗口数据。
- PURGE：清理窗口数据但不执行计算。
- FIRE_AND_PURGE：启动计算，发送结果然后清理窗口数据。

在继续介绍Trigger的使用之前，我们可以先了解一下定时器（Timer）的使用方法。我们可以把Timer理解成一个闹钟，使用前先注册未来一个时间，当时间到达时，就像闹钟会响一样，程序会启用一个回调函数，来执行某个时间相关的任务。对于自定义Trigger来说，我们需要考虑注册时间的逻辑，当到达这个时间时，Flink会启动Window Function，清理窗口数据。

`WindowAssigner`都有一个默认的`Trigger`。比如基于Event Time的窗口会有一个`EventTimeTrigger`，每当窗口的Watermark时间戳到达窗口的结束时间，Trigger会发送`FIRE`。此外，`ProcessingTimeTrigger`对应Processing Time窗口，`CountTrigger`对应Count-based窗口。

当这些已有的Trigger无法满足我们的需求时，我们需要自定义Trigger，接下来我们看一下Flink的Trigger源码。

```java
/**
    * T为元素类型
    * W为窗口
  */
public abstract class Trigger<T, W extends Window> implements Serializable {

    /**
     * 当某窗口增加一个元素时调用onElement方法，返回一个TriggerResult
     */
    public abstract TriggerResult onElement(T element, long timestamp, W window, TriggerContext ctx) throws Exception;

    /**
     * 当一个基于Processing Time的Timer触发了FIRE时调用onProcessTime方法
     */
    public abstract TriggerResult onProcessingTime(long time, W window, TriggerContext ctx) throws Exception;

    /**
     * 当一个基于Event Time的Timer触发了FIRE时调用onEventTime方法
     */
    public abstract TriggerResult onEventTime(long time, W window, TriggerContext ctx) throws Exception;

    /**
     * 如果这个Trigger支持状态合并，则返回true
     */
    public boolean canMerge() {
        return false;
    }

    /**
     * 当多个窗口被合并时调用onMerge
     */
    public void onMerge(W window, OnMergeContext ctx) throws Exception {
        throw new UnsupportedOperationException("This trigger does not support merging.");
    }

    /**
     * 当窗口数据被清理时，调用clear方法来清理所有的Trigger状态数据
     */
    public abstract void clear(W window, TriggerContext ctx) throws Exception

    /**
     * 上下文，保存了时间、状态、监控以及定时器
     */
    public interface TriggerContext {

        /**
         * 返回当前Processing Time
         */
        long getCurrentProcessingTime();

        /**
         * 返回MetricGroup 
         */
        MetricGroup getMetricGroup();

        /**
         * 返回当前Watermark时间
         */
        long getCurrentWatermark();

        /**
         * 将某个time注册为一个Timer，当系统时间到达time这个时间点时，onProcessingTime方法会被调用
         */
        void registerProcessingTimeTimer(long time);

        /**
         * 将某个time注册为一个Timer，当Watermark时间到达time这个时间点时，onEventTime方法会被调用
         */
        void registerEventTimeTimer(long time);

        /**
         * 将注册的Timer删除
         */
        void deleteProcessingTimeTimer(long time);

        /**
         * 将注册的Timer删除
         */
        void deleteEventTimeTimer(long time);

        /**
         * 获取该窗口Trigger下的状态
         */
        <S extends State> S getPartitionedState(StateDescriptor<S, ?> stateDescriptor);

    }

    /**
     * 将多个窗口下Trigger状态合并
     */
    public interface OnMergeContext extends TriggerContext {
        <S extends MergingState<?, ?>> void mergePartitionedState(StateDescriptor<S, ?> stateDescriptor);
    }
}
```

接下来我们以一个提前计算的案例来解释如何使用自定义的Trigger。在股票或任何交易场景中，我们比较关注价格急跌的情况，默认窗口长度是60秒，如果价格跌幅超过5%，则立即执行Window Function，如果价格跌幅在1%到5%之内，那么10秒后触发Window Function。

```java
class MyTrigger extends Trigger[StockPrice, TimeWindow] {

  override def onElement(element: StockPrice,
                         time: Long,
                         window: TimeWindow,
                         triggerContext: Trigger.TriggerContext): TriggerResult = {
    val lastPriceState: ValueState[Double] = triggerContext.getPartitionedState(new ValueStateDescriptor[Double]("lastPriceState", classOf[Double]))

    // 设置返回默认值为CONTINUE
    var triggerResult: TriggerResult = TriggerResult.CONTINUE

    // 第一次使用lastPriceState时状态是空的,需要先进行判断
    // 状态数据由Java端生成，如果是空，返回一个null
    // 如果直接使用Scala的Double，需要使用下面的方法判断是否为空
    if (Option(lastPriceState.value()).isDefined) {
      if ((lastPriceState.value() - element.price) > lastPriceState.value() * 0.05) {
        // 如果价格跌幅大于5%，直接FIRE_AND_PURGE
        triggerResult = TriggerResult.FIRE_AND_PURGE
      } else if ((lastPriceState.value() - element.price) > lastPriceState.value() * 0.01) {
        val t = triggerContext.getCurrentProcessingTime + (10 * 1000 - (triggerContext.getCurrentProcessingTime % 10 * 1000))
        // 给10秒后注册一个Timer
        triggerContext.registerProcessingTimeTimer(t)
      }
    }
    lastPriceState.update(element.price)
    triggerResult
  }

  // 我们不用EventTime，直接返回一个CONTINUE
  override def onEventTime(time: Long, window: TimeWindow, triggerContext: Trigger.TriggerContext): TriggerResult = {
    TriggerResult.CONTINUE
  }

  override def onProcessingTime(time: Long, window: TimeWindow, triggerContext: Trigger.TriggerContext): TriggerResult = {
    TriggerResult.FIRE_AND_PURGE
  }

  override def clear(window: TimeWindow, triggerContext: Trigger.TriggerContext): Unit = {
    val lastPrice: ValueState[Double] = triggerContext.getPartitionedState(new ValueStateDescriptor[Double]("lastPrice", classOf[Double]))
    lastPrice.clear()
  }
}

senv.setStreamTimeCharacteristic(TimeCharacteristic.ProcessingTime)

val input: DataStream[StockPrice] = ...

val average = input
      .keyBy(s => s.symbol)
      .timeWindow(Time.seconds(60))
      .trigger(new MyTrigger)
      .aggregate(new AverageAggregate)
```

在自定义Trigger时，如果使用了状态，一定要使用`clear`方法将状态数据清理，否则随着窗口越来越多，状态数据会越积越多。

#### Evictor

清除器（Evictor）是在`WindowAssigner`和`Trigger`的基础上的一个可选选项，用来清除一些数据。我们可以在Window Function执行前或执行后调用Evictor。

```java
/**
    * T为元素类型
    * W为窗口
  */
public interface Evictor<T, W extends Window> extends Serializable {

    /**
     * 在Window Function前调用
   */
    void evictBefore(Iterable<TimestampedValue<T>> elements, int size, W window, EvictorContext evictorContext);

    /**
     * 在Window Function后调用
     */
    void evictAfter(Iterable<TimestampedValue<T>> elements, int size, W window, EvictorContext evictorContext);


    /**
     * Evictor的上下文
     */
    interface EvictorContext {

        long getCurrentProcessingTime();

        MetricGroup getMetricGroup();

        long getCurrentWatermark();
    }
}
```

`evictBefore`和`evictAfter`分别在Window Function之前和之后被调用，窗口的所有元素被放在了`Iterable<TimestampedValue<T>>`，我们要实现自己的清除逻辑。当然，对于增量计算的`ReduceFunction`和`AggregateFunction`，我们没必要使用Evictor。

Flink提供了几个实现好的Evictor：

- `CountEvictor`保留一定数目的元素，多余的元素按照从前到后的顺序先后清理。
- `TimeEvictor`保留一个时间段的元素，早于这个时间段的元素会被清理。

