---
title: FastJson的进阶<一>
author: gakkij
categories:
  - FastJson
tags:
  - json
img: https://pic1.superbed.cn/item/5dfef04d76085c3289204d92.jpg
top: false
cover: false
coverImg: 
toc: true
date: 2019-12-22 12:19:47
summary: FastJson的进阶一教程
password:
---

该篇，会总结FastJson中的一些常用API

### **FastJson主要的API**

fastjson入口类是com.alibaba.fastjson.JSON, 主要API是**JSON.toJSONString**和**parseObject**，使用fastjson要注意要转换的类必须有默认的无参构造方法。

- 序列化:
  `String jsonString = JSON.toJSONString(obj);`

- 反序列化:
  `VO vo = JSON.parseObject("jsonString", VO.class);`

- 泛型反序列化:

  ```java
  List<VO> list = JSON.parseObject("jsonString", new TypeReference<List<VO>>(){});
  
  注意：VO必须有默认无参构造方法
  ```

- 其他主要API:

  ```java
  public static final Object parse(String text); // 把JSON文本parse为JSONObject或者JSONArray 
  public static final JSONObject parseObject(String text)； // 把JSON文本parse成JSONObject    
  public static final <T> T parseObject(String text, Class<T> clazz); // 把JSON文本parse为JavaBean 
  public static final JSONArray parseArray(String text); // 把JSON文本parse成JSONArray 
  public static final <T> List<T> parseArray(String text, Class<T> clazz); //把JSON文本parse成JavaBean集合 
  public static final String toJSONString(Object object); // 将JavaBean序列化为JSON文本 
  public static final String toJSONString(Object object, boolean prettyFormat); // 将JavaBean序列化为带格式的JSON文本 
  public static final Object toJSON(Object javaObject); //将JavaBean转换为JSONObject或者JSONArray。
  ```

  说明：
  SerializeWriter：相当于StringBuffer
  JSONArray：相当于List
  JSONObject：相当于Map

```java
JSON.DEFFAULT_DATE_FORMAT = "yyyy-MM-dd";  
JSON.toJSONString(obj, SerializerFeature.WriteDateUseDateFormat);
```

- 反序列化能够自动识别如下日期格式：

```java
ISO-8601日期格式
yyyy-MM-dd
yyyy-MM-dd HH:mm:ss
yyyy-MM-dd HH:mm:ss.SSS
毫秒数字
毫秒数字字符串
NET JSON日期格式
new Date(198293238)
```

- SerializerFeature序列化属性

```java
DisableCheckSpecialChar：一个对象的字符串属性中如果有特殊字符如双引号，将会在转成json时带有反斜杠转移符。如果不需要转义，可以使用这个属性。默认为false 
QuoteFieldNames———-输出key时是否使用双引号,默认为true 
WriteMapNullValue——–是否输出值为null的字段,默认为false 
WriteNullNumberAsZero—-数值字段如果为null,输出为0,而非null 
WriteNullListAsEmpty—–List字段如果为null,输出为[],而非null 
WriteNullStringAsEmpty—字符类型字段如果为null,输出为"",而非null 
WriteNullBooleanAsFalse–Boolean字段如果为null,输出为false,而非null

WriteClassName:
支持序列化时写入类型信息，从而使得反序列化时不丢失类型信息。例如：
Color color = Color.RED; String text = JSON.toJSONString(color,SerializerFeature.WriteClassName); System.out.println(text); 
输出结果：
{"@type":"java.awt.Color","r":255,"g":0,"b":0,"alpha":255}
由于序列化带了类型信息，使得反序列化时能够自动进行类型识别，例如：
String text = ...; //{"@type":"java.awt.Color","r":255,"g":0,"b":0,"alpha":255}
Color color = (Color) JSON.parse(text);
```

### 反序列化

反序列一个javaBean对象：

```java
public class User {

    private int id;
    private String name;
    private String address;

    public User() {
    }
}
```

````java
        String json = "{'id':18,'name':'gakki'}";
        User user = JSON.parseObject(json, User.class);
        System.out.println(user);
````

```java
User{id=18, name='gakki', address='null'}
```

说明：这里我们直接将json字符串反序列了javaBean对象：user，使用是带有Class参数的parseObject方法，不需要再操作JSOObject对象了，方便了很多。

---

反序列化json数组《一》：

```java
        String json = "[{'id':18,'name':'gakki'},{'id':19,'name':'dj','address':'东京'},{'id':20,'name':'ldlove','address':'冲绳'}]";

        List<User> userList = JSON.parseArray(json, User.class);

        System.out.println(userList);
```

```java
[User{id=18, name='gakki', address='null'}, User{id=19, name='dj', address='东京'}, User{id=20, name='ldlove', address='冲绳'}]
```

看到这里，小伙伴们，是否发现了FastJson对于GSON的区别，GSON反序列化数组类型时，需要使用TypeToken来保存泛型类型，这里FastJson直接使用User.class即可，不过使用的是：parseArray 方法，注意区别 parseObejc。

---

反序列化json数组《二》：

```java
        String json = "[{'id':18,'name':'gakki'},{'id':19,'name':'dj','address':'东京'},{'id':20,'name':'ldlove','address':'冲绳'}]";
        List<User> userList = JSON.parseObject(json, new TypeReference<List<User>>(){});
        System.out.println(userList)
```

这里，我们使用的是：parseObject方法，但是第二个参数不再是User.class，而是: TypeReference对象，这里就和GSON中的：TypeToken对象类似了，都是创建匿名子类对象来保存泛型信息。

### 序列化

序列化一个javaBean对象：

```java
        User user = new User(18,"gakki","冲绳");
        String json = JSON.toJSONString(user);
        System.out.println(json);
```

```java
{"address":"冲绳","id":18,"name":"gakki"}
```

说明：直接使用：toJSONString方法，不再使用JSONObject对象来put一系列操作了，方便了很多。

---

序列化javaBean数组或List集合

```java
        List<User> userList = new ArrayList<>();
        userList.add(new User(18, "gakki", "冲绳"));
        userList.add(new User(19, "gakkij", "东京"));
        userList.add(new User(20, "gakkil", "上海"));

        String json = JSON.toJSONString(userList);
        System.out.println(json);
```

```java
[{"address":"冲绳","id":18,"name":"gakki"},{"address":"东京","id":19,"name":"gakkij"},{"address":"上海","id":20,"name":"gakkil"}]
```

---

当序列化的javaBean对象中，有null值的情况：

```java
        User user = new User(18, "gakki", null);
        System.out.println(user);
        String json = JSON.toJSONString(user);
        System.out.println(json);
```

```java
User{id=18, name='gakki', address='null'}
{"id":18,"name":"gakki"}
```

默认情况是：不序列化值为null，如果我们也想序列化值为null的情况呢? 就和GSON中使用GsonBuilder一样。

```java
        User user = new User(18, "gakki", null);
        System.out.println(user);
        String json = JSON.toJSONString(user, SerializerFeature.WriteMapNullValue);
        System.out.println(json);
```

```java
User{id=18, name='gakki', address='null'}
{"address":null,"id":18,"name":"gakki"}
```

我们只需要使用 toJSONString的其他重载的方法，带上：SerializerFeature的参数即可，比GSON中需要使用GsonBuilder来的方便有没有！

SerializerFeature.WriteMapNullValue：将值为null的也输出为 null。

SerializerFeature还有很多选择的类型，大家可以自己去试试：

```java
        User user = new User(18, "gakki", null);
        System.out.println(user);
        String json = JSON.toJSONString(user, SerializerFeature.WriteNullStringAsEmpty);
        System.out.println(json);
```

```java
User{id=18, name='gakki', address='null'}
{"address":"","id":18,"name":"gakki"}
```

SerializerFeature.WriteNullStringAsEmpty：输出为：" " ，不再是 null 。

```java
        User user = new User(18, "gakki", null);
        System.out.println(user);
        String json = JSON.toJSONString(user,SerializerFeature.PrettyFormat,SerializerFeature.WriteNullStringAsEmpty);
        System.out.println(json);
```

```java
User{id=18, name='gakki', address='null'}
{
	"address":"",
	"id":18,
	"name":"gakki"
}
```

SerializerFeature.PrettyFormat：输出为漂亮的格式。

PS：JSON.toJSONString中的SerializerFeature.XXXX 可以是多个。

```java
    public static String toJSONString(Object object, SerializerFeature... features) {
        return toJSONString(object, DEFAULT_GENERATE_FEATURE, features);
    }
```

人家是可变参数！！！