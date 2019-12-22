---
title: FastJson的入门
author: gakkij
categories:
  - FastJson
tags:
  - json
img: https://pic.superbed.cn/item/5dfedefa76085c32891a5905.jpg
top: false
cover: false
coverImg: 
toc: true
date: 2019-12-22 11:08:22
summary: FastJson的简单入门
password:
---

今天开始，让我们一起来学习FastJson的用法，FastJson也是一款开源的Json的解析工具，在接下来的篇章中，我们会看到它与Gson的不同之处的，FastJson号称是最快的Json解析器。

### FastJson简介

JSON协议使用方便，越来越流行,JSON的处理器有很多,这里我介绍一下FastJson,FastJson是阿里的开源框架,被不少企业使用,是一个极其优秀的Json框架,Github地址: [FastJson](https://github.com/alibaba/fastjson)

### FastJson三个核心类

- JSON：fastjson的解析器，用于json字符串和javaBean、Json对象的转换
- JSONObject：fastJson提供的json对象
- JSONArray：fastJson提供json数组对象

### Java API

这里，我使用的是Maven工程：

```java
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.58</version>
        </dependency>
```

1.2.58的版本，尽量更新到最新版本，因为，最近fastjson报出系统漏洞问题，最新版本的已经解决该漏洞，存在循环解析死循环的问题！！！

#### 反序列化

反序列化一个简单Json字符串

创建JavaBean的User类

```java
public class User {

    private int id;
    private String name;
    private String address;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                '}';
    }
}
```

```java
        String json = "{'id':18,'name':'gakki'}";
        JSONObject jsonObject = JSON.parseObject(json);
       //JSONObject jsonObject1 = JSONObject.parseObject(json);  //与上面等价

        User user = new User();
        if (jsonObject.containsKey("id")) {
            user.setId(jsonObject.getInteger("id"));
        }
        if (jsonObject.containsKey("name")) {
            user.setName(jsonObject.getString("name"));
        }
        if (jsonObject.containsKey("address")) {
            user.setAddress(jsonObject.getString("address"));
        }
        System.out.println(user);
```

```java
User{id=18, name='gakki', address='null'}
```

说明：首先我们判断json字符串的根是Json对象还是JsonArray数组，这里是Json对象，因此使用：Json.parseObject()方法 ，或者是：JSONObject.parseObject() 方法。

通过：containsKey 方法来判断是否存在key值来给JavaBean对象相应的属性赋值！

这里，因为json字符串中没有address的key，因此，最后输出的User对象中，address为null。

注意：<font color="red">JSON，JSONObject，JSONArray是：com.alibaba.fastjson.JSON，com.alibaba.fastjson.JSONObject，com.alibaba.fastjson.JSONArray。不是：官方的org.json.JSONObject，org.json.JSONArray。</font>

---

反序列化一个简单JSON字符串成Java对象组【数组中都是相同类型对象】

```java
        String json = "[{'id':18,'name':'gakki'},{'id':19,'name':'dj','address':'东京'},{'id':20,'name':'ldlove','address':'冲绳'}]";

        JSONArray jsonArray = JSON.parseArray(json);
        //JSONArray jsonArray1 = JSONArray.parseArray(json); //同上

        List<User> userList = new ArrayList<>();

        for (int i = 0; i < jsonArray.size(); i++) {
            User user = new User();
            JSONObject jsonObject = jsonArray.getJSONObject(i);
            if (jsonObject.containsKey("id")) {
                user.setId(jsonObject.getInteger("id"));
            }
            if (jsonObject.containsKey("name")) {
                user.setName(jsonObject.getString("name"));
            }
            if (jsonObject.containsKey("address")) {
                user.setAddress(jsonObject.getString("address"));
            }
            userList.add(user);
        }
        System.out.println(userList);
```

```java
[User{id=18, name='gakki', address='null'}, User{id=19, name='dj', address='东京'}, User{id=20, name='ldlove', address='冲绳'}]
```

说明：首先判断json字符串的根是Json对象还是Json数组，很明显这里是json数组，因此使用：JSON.parseArray

然后，循环遍历jsonArray，jsonArray有多个getXXXX方法，我们需要确定json数组字符串中是不是都是json对象，这里都是User对象，因此统一都使用：jsonArray.getJSONObject(i)来获取：JSONObject。如果不统一，请分开处理。

---

反序列化一个简单JSON字符串成Java对象组【数组中是不同类型对象】

```java
        String json = "[1,'gakkij',{'id':18,'name':'gakki','address':'冲绳'}]";

        JSONArray jsonArray = JSONArray.parseArray(json);

        Integer id = jsonArray.getInteger(0);
        String name = jsonArray.getString(1);
        JSONObject jsonObject = jsonArray.getJSONObject(2);
        User user = new User();
        if (jsonObject.containsKey("id")) {
            user.setId(jsonObject.getInteger("id"));
        }
        if (jsonObject.containsKey("name")) {
            user.setName(jsonObject.getString("name"));
        }
        if (jsonObject.containsKey("address")) {
            user.setAddress(jsonObject.getString("address"));
        }
        System.out.println("id:" + id);
        System.out.println("name:" + name);
        System.out.println("User:" + user);
```

```java
id:1
name:gakkij
User:User{id=18, name='gakki', address='冲绳'}
```

大家应该看出与上一个例子的差别了吧！！！

---

#### 序列化

序列化一个Java Bean对象

```java
        User user = new User();
        user.setId(18);
        user.setName("gakki");
        user.setAddress("冲绳");
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("id", user.getId());
        jsonObject.put("name", user.getName());
        jsonObject.put("address", user.getAddress());
        String json = jsonObject.toString();
        String json1 = JSONObject.toJSONString(jsonObject); //等价
        String json2 = JSON.toJSONString(jsonObject); //等价

        System.out.println(json);
        System.out.println(json1);
        System.out.println(json2);
```

```java
{"address":"冲绳","name":"gakki","id":18}
{"address":"冲绳","name":"gakki","id":18}
{"address":"冲绳","name":"gakki","id":18}
```

序列化一个对象就是使用：JSONObject来序列化。

注意：序列化的顺序不是我们put的先后顺序！！！

---

序列化一个java数组

```java
        JSONArray jsonArray = new JSONArray();
        List<User> userList = new ArrayList<>();
        User user = new User(18, "gakki", "冲绳");
        User user1 = new User(20, "jackLove", "上海");
        userList.add(user);
        userList.add(user1);
        for (int i = 0; i < userList.size(); i++) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("id", userList.get(i).getId());
            jsonObject.put("name", userList.get(i).getName());
            jsonObject.put("address", userList.get(i).getAddress());
            jsonArray.add(jsonObject);
        }

        String json = jsonArray.toJSONString();
        String json1 = JSONArray.toJSONString(jsonArray); //等价
        String json2 = JSON.toJSONString(jsonArray);      //等价

        System.out.println(json);
        System.out.println(json1);
        System.out.println(json2);
```

```java
[{"address":"冲绳","name":"gakki","id":18},{"address":"上海","name":"jackLove","id":20}]
[{"address":"冲绳","name":"gakki","id":18},{"address":"上海","name":"jackLove","id":20}]
[{"address":"冲绳","name":"gakki","id":18},{"address":"上海","name":"jackLove","id":20}]
```

#### 序列化和反序列日期

```java
Date date = new Date();

String dateString = JSON.toJSONStringWithDateFormat(date, "yyyy-MM-dd HH:mm:ss");
System.out.println(dateString);

// 输出结果 "2019-12-22 09:44:21"

String dateString1 = "{\"time\":\"2019-12-22 22:22:22\"}";
System.out.println(JSON.parseObject(dateString1));

// 输出结果 {"time":"2019-12-22 22:22:22"}
```

