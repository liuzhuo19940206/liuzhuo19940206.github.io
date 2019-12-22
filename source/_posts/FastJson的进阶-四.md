---
title: FastJson的进阶<四>
author: gakkij
categories:
  - FastJson
tags:
  - json
img: https://pic1.superbed.cn/item/5dff793176085c32895cd975.jpg
top: false
cover: false
coverImg:
toc: true
date: 2019-12-22 22:02:58
summary: 通过ParseProcess定制反序列化,出来多余字段
password:
---

ParseProcess是编程扩展定制反序列化的接口。fastjson支持如下ParseProcess：

- ExtraProcessor 用于处理多余的字段；
- ExtraTypeProvider 用于处理多余字段时提供类型信息。

---

### **使用 ExtraProcessor 处理多余字段**

```java
public class VO {
    private int id;
    private Map<String, Object> attributes = new HashMap<String, Object>();

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

这里，使用Map来存储反序列化多余的字段，什么叫做多余的字段呢？

就是当我们使用FastJson反序列时，那些不能被匹配的字段。

```java
ExtraProcessor processor = new ExtraProcessor() {
            public void processExtra(Object object, String key, Object value) {

                System.out.println("---------------object = " + object);
                System.out.println("---------------key = " + key);
                System.out.println("---------------value = " + value);
                System.out.println();

                VO vo = (VO) object;
                vo.setId(789);// 修改一下id值
                vo.getAttributes().put(key, value);
            }
        };
        // 这里name和phone是多余的，在VO里没有
        VO vo = JSON.parseObject("{\"id\":123,\"name\":\"abc\",\"phone\":\"18603396954\"}", VO.class, processor);

        System.out.println("vo.getId() = " + vo.getId());
        System.out.println("vo.getAttributes().get(\"name\") = " + vo.getAttributes().get("name"));
        System.out.println("vo.getAttributes().get(\"phone\") = " + vo.getAttributes().get("phone"));
```

```java
---------------object = VO [id=123, attributes={}]
---------------key = name
---------------value = abc

---------------object = VO [id=789, attributes={name=abc}]
---------------key = phone
---------------value = 18603396954

vo.getId() = 789
vo.getAttributes().get("name") = abc
vo.getAttributes().get("phone") = 18603396954
```

我们可以看到，调用processExtra方法时，是FastJson已经帮我们序列化之后再进行，通过打印出来的object可以看出，id是能够匹配成功的，没有走processExtra方法。只有 name 和 phone 这些没有匹配的字段才会走：processExtra方法。

---

### **使用ExtraTypeProvider 为多余的字段提供类型**

```java
class MyExtraProcessor implements ExtraProcessor, ExtraTypeProvider {
    public void processExtra(Object object, String key, Object value) {
        VO vo = (VO) object;
        vo.getAttributes().put(key, value);
    }

    public Type getExtraType(Object object, String key) {

        System.out.println("---------------object = " + object);
        System.out.println("---------------key = " + key);
        System.out.println();

        if ("value".equals(key)) {
            return int.class;
        }
        return null;
    }
}
```

```java
ExtraProcessor processor = new MyExtraProcessor();

        VO vo = JSON.parseObject("{\"id\":123,\"value\":\"123456\"}", VO.class, processor);

        System.out.println("vo.getId() = " + vo.getId());
        System.out.println("vo.getAttributes().get(\"value\") = " + vo.getAttributes().get("value"));
        System.out.println("vo.getAttributes().get(\"value\").getClass() = " + vo.getAttributes().get("value").getClass());// value本应该是字符串类型的，通过getExtraType的处理变成Integer类型了。
```

```java
---------------object = VO [id=123, attributes={}]
---------------key = value

vo.getId() = 123
vo.getAttributes().get("value") = 123456
vo.getAttributes().get("value").getClass() = class java.lang.Integer
```

