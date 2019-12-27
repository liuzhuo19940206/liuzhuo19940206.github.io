---
title: FastJson的进阶<五>
author: gakkij
categories:
  - FastJson
tags:
  - json
img: https://pic.downk.cc/item/5e06355876085c3289d862ed.jpg
top: false
cover: false
coverImg: 
toc: true
date: 2019-12-28 00:40:16
summary: FastJson解析/反解析大文件
password:
---

当需要处理超大JSON文本时，需要Stream API，在fastjson-1.1.32版本中开始提供Stream API。

---

实例对象：

```java
public class VO {
    private int id;
    private Map<String, Object> attributes = new HashMap<String, Object>();

    public VO(int id) {
        super();
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String toString() {
        return "VO [id=" + id + ", attributes=" + attributes + "]";
    }
}
```

### 序列化

#### 超大JSON对象的序列化

如果你的JSON格式是一个巨大的JSONObject，有很多Key/Value对，则先调用startObject，然后挨个写入Key和Value，然后调用endObject。

```java
public class TestHugeObjectSerialize {

    public static void main(String[] args) throws IOException {

        JSONWriter writer = new JSONWriter(new FileWriter("hugeObject.json"));
        writer.startObject();
        for (int i = 0; i < 10; ++i) {
            writer.writeKey("x" + i);
            writer.writeValue(new VO(i));
        }
        writer.endObject();
        writer.close();
    }

}
```

文件内容：

```java
{"x0":{"attributes":{},"id":0},"x1":{"attributes":{},"id":1},"x2":{"attributes":{},"id":2},"x3":{"attributes":{},"id":3},"x4":{"attributes":{},"id":4},"x5":{"attributes":{},"id":5},"x6":{"attributes":{},"id":6},"x7":{"attributes":{},"id":7},"x8":{"attributes":{},"id":8},"x9":{"attributes":{},"id":9}}
```

#### **超大JSON数组序列化**

如果你的JSON格式是一个巨大的JSON数组，有很多元素，则先调用startArray，然后挨个写入对象，然后调用endArray。

```java
public class TestHugeArraySerialize {

    public static void main(String[] args) throws IOException {
        JSONWriter writer = new JSONWriter(new FileWriter("hugeArray.json"));
        writer.startArray();
        for (int i = 0; i < 10; ++i) {
            writer.writeValue(new VO(i));
        }
        writer.endArray();
        writer.close();
    }
}
```

文件内容：

```java
[{"attributes":{},"id":0},{"attributes":{},"id":1},{"attributes":{},"id":2},{"attributes":{},"id":3},{"attributes":{},"id":4},{"attributes":{},"id":5},{"attributes":{},"id":6},{"attributes":{},"id":7},{"attributes":{},"id":8},{"attributes":{},"id":9}]
```

---

### **反序列化**

#### **超大JSON对象反序列化**

```java
public class TestHugeObjectDeserialize {

    public static void main(String[] args) throws IOException {
        // 读入上面输出的文件
        JSONReader reader = new JSONReader(new FileReader("hugeObject.json"));
        reader.startObject();
        while (reader.hasNext()) {
            String key = reader.readString();
            VO vo = reader.readObject(VO.class);
            System.out.println(key + "：" + vo);
        }
        reader.endObject();
        reader.close();
    }
}
```

输出结果：

```java
x0：VO [id=0, attributes={}]
x1：VO [id=1, attributes={}]
x2：VO [id=2, attributes={}]
x3：VO [id=3, attributes={}]
x4：VO [id=4, attributes={}]
x5：VO [id=5, attributes={}]
x6：VO [id=6, attributes={}]
x7：VO [id=7, attributes={}]
x8：VO [id=8, attributes={}]
x9：VO [id=9, attributes={}]
```

#### **超大JSON数组反序列化**

```java
public class TestHugeArrayDeserialize {

    public static void main(String[] args) throws IOException {
        // 读入上面输出的文件
        JSONReader reader = new JSONReader(new FileReader("hugeArray.json"));
        reader.startArray();
        while (reader.hasNext()) {
            VO vo = reader.readObject(VO.class);
            System.out.println(vo);
        }
        reader.endArray();
        reader.close();
    }
}
```

输出结果：

```java
VO [id=0, attributes={}]
VO [id=1, attributes={}]
VO [id=2, attributes={}]
VO [id=3, attributes={}]
VO [id=4, attributes={}]
VO [id=5, attributes={}]
VO [id=6, attributes={}]
VO [id=7, attributes={}]
VO [id=8, attributes={}]
VO [id=9, attributes={}]
```

