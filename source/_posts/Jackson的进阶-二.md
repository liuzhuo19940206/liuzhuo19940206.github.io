---
title: Jackson的进阶<二>
author: gakkij
categories:
  - Jackson
tags:
  - json
img: https://pic.downk.cc/item/5e084ad376085c32893a3460.jpg
top: false
cover: false
coverImg: 
toc: true
date: 2019-12-29 14:39:45
summary: Jackson中的DataBinding
password:
---

### readValue

#### POJO对象

User：

```java
public class User {

    private String name;
    private int age;
    
    //省略get、set、toString方法   
 }
```

```java
        ObjectMapper mapper = new ObjectMapper();
        String json = "{'name':'gakkij','age':18}";
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
```

运行：

```java
Exception in thread "main" com.fasterxml.jackson.core.JsonParseException: Unexpected character (''' (code 39)): was expecting double-quote to start field name
 at [Source: (String)"{'name':'gakkij','age':18}"; line: 1, column: 3]
```

报错：因为好像Jackson的json字符串必须要符合标准的形式，字符串中的key、vlaue如果是String类型，必须是双引号！！！

之前，我们使用Gson或FastJson时，因为不想写转义符：`\`，因此都是使用单引号来表示字符串的。

Jackson必须使用双引号：

```java
        ObjectMapper mapper = new ObjectMapper();
        String json = "{\"name\":\"gakkij\",\"age\":18}";
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
```

输出：

```java
User{name='gakkij', age=18}
```

---

当反序列化的字符串中有POJO中不存在的属性时：

```java
        ObjectMapper mapper = new ObjectMapper();
        String json = "{\"name\":\"gakkij\",\"age\":18,\"address\":\"东京\"}";
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
```

这里，添加了address的key，但是User中是没有address的属性的。

运行后：

```java
Exception in thread "main" com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException: Unrecognized field "address" (class com.liuzhuo.jackson.domain.User), not marked as ignorable (2 known properties: "name", "age"])
 at [Source: (String)"{"name":"gakkij","age":18,"address":"东京"}"; line: 1, column: 38] (through reference chain: com.liuzhuo.jackson.domain.User["address"])
```

出现，不能解析address属性的异常！！！

这里，我们需要配置mapper的特性，来控制当出现无法解析的属性时，不需要抛出异常！

- `mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);`

- `mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);`

```java
        ObjectMapper mapper = new ObjectMapper();
        //mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);//和上面等价
        String json = "{\"name\":\"gakkij\",\"age\":18,\"address\":\"东京\"}";
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
```

---

#### List类型

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        String json = "[{\"name\":\"gakkij\",\"age\":18,\"address\":\"东京\"},{\"name\":\"jackLove\",\"age\":20,\"address\":\"冲绳\"}]";
        List list = mapper.readValue(json, List.class);
        User[] users = mapper.readValue(json, User[].class);
        System.out.println(list);
        System.out.println(users);
```

输出：

```java
[{name=gakkij, age=18, address=东京}, {name=jackLove, age=20, address=冲绳}]
[Lcom.liuzhuo.jackson.domain.User;@91161c7
```

这里看来没有问题，当我们使用带有泛型的List集合呢？

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        String json = "[{\"name\":\"gakkij\",\"age\":18,\"address\":\"东京\"},{\"name\":\"jackLove\",\"age\":20,\"address\":\"冲绳\"}]";
        List<User> userList = mapper.readValue(json, List.class);
        System.out.println(userList);
```

输出：

```java
[{name=gakkij, age=18, address=东京}, {name=jackLove, age=20, address=冲绳}]
```

看似没有出错，但是你们注意到了吗？此时的User对象居然打印出了address！！！颠覆了我们的认知，我们的User对象里面是没有address属性的。

```java
        List<User> userList = mapper.readValue(json, List.class);
        userList.forEach(user -> {
            System.out.println(user);
        });
```

当我们遍历List集合来打印时，问题就出来了：

```java
Exception in thread "main" java.lang.ClassCastException: java.util.LinkedHashMap cannot be cast to com.liuzhuo.jackson.domain.User
	at java.util.ArrayList.forEach(ArrayList.java:1257)
	at com.liuzhuo.jackson.jacksonDataBindTest02.testDataBindListPOJO2(jacksonDataBindTest02.java:48)
	at com.liuzhuo.jackson.jacksonDataBindTest02.main(jacksonDataBindTest02.java:59)
```

说明，此时`List<user> `根本不是我们想象中的`List<User>`。

**带泛型的集合，必须使用：**

- objectMapper.getTypeFactory().constructParametricType(collectionClass, elementClasses);
- TypeReference<>的子类

1）使用：constructParametricType

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        String json = "[{\"name\":\"gakkij\",\"age\":18,\"address\":\"东京\"},{\"name\":\"jackLove\",\"age\":20,\"address\":\"冲绳\"}]";
        JavaType javaType = mapper.getTypeFactory().constructParametricType(List.class, User.class);
        List<User> userList = mapper.readValue(json, javaType);
        userList.forEach(user -> {
            System.out.println(user);
        });
        System.out.println(userList);
```

2）使用：TypeReference<>的子类

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        String json = "[{\"name\":\"gakkij\",\"age\":18,\"address\":\"东京\"},{\"name\":\"jackLove\",\"age\":20,\"address\":\"冲绳\"}]";
        TypeReference<List<User>> type = new TypeReference<List<User>>() {
        };
        List<User> userList = mapper.readValue(json, type);
        userList.forEach(user -> {
            System.out.println(user);
        });
        System.out.println(userList);
```

输出：

```java
User{name='gakkij', age=18}
User{name='jackLove', age=20}
[User{name='gakkij', age=18}, User{name='jackLove', age=20}]
```

---

#### Map类型

1）不带泛型的Map解析

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        String json = "{\"a\":\"1\",\"b\":2,\"c\":true}";
        Map map = mapper.readValue(json, Map.class);
        System.out.println(map);
```

```java
{a=1, b=2, c=true}
```

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        String json = "{\"a\":\"1\",\"b\":2,\"c\":true}";
        Map map = mapper.readValue(json, Map.class);
        Object a = map.get("a");
        System.out.println(a.getClass());
        System.out.println(a);
        Object b = map.get("b");
        System.out.println(b.getClass());
        System.out.println(b);
        Object c = map.get("c");
        System.out.println(c.getClass());
        System.out.println(c);
        System.out.println(map);
```

```java
class java.lang.String
1
class java.lang.Integer
2
class java.lang.Boolean
true
{a=1, b=2, c=true}
```

2）带泛型的Map解析

- mapper.getTypeFactory().constructParametricType(MapClass, keyClass, valueClass)

- new TypeReference<>() {}

方法一：

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        String json = "{\"a\":\"1\",\"b\":2,\"c\":true}";
        JavaType javaType = mapper.getTypeFactory().constructParametricType(HashMap.class, String.class, String.class);
        HashMap<String, String> map = mapper.readValue(json, javaType);
        Object a = map.get("a");
        System.out.println(a.getClass());
        System.out.println(a);
        Object b = map.get("b");
        System.out.println(b.getClass());
        System.out.println(b);
        Object c = map.get("c");
        System.out.println(c.getClass());
        System.out.println(c);
        System.out.println(map);
```

输出：

```java
class java.lang.String
1
class java.lang.String
2
class java.lang.String
true
{a=1, b=2, c=true}
```

此时，都是Map中的key和value都是字符串类型。

---

方法二：

```java
        TypeReference<HashMap<String, String>> type = new TypeReference<HashMap<String, String>>() {
        };
        HashMap<String, String> map = mapper.readValue(json, type);
```

#### 总结

Jackson处理一般的JavaBean和Json之间的转换只要使用ObjectMapper 对象的**readValue**和**writeValueAsString**两个方法就能实现。

但是如果要转换复杂类型Collection如` List<YourBean>`，那么就需要先反序列化复杂类型为泛型的Collection Type。

如果是`ArrayList<YourBean>`那么使用ObjectMapper 的getTypeFactory().constructParametricType(collectionClass, yourBean.class);

如果是`HashMap<String,YourBean>`那么 ObjectMapper 的getTypeFactory().constructParametricType(MapClass,String.class, YourBean.class);

带泛型的 List  和 Map ，也可以统一使用：new TypeReference<>() {}的子类来实现。

例如：`new TypeReference<List<youBean>(){} `  和  `new TypeReference<HashMap<String,youBean>(){}`

---

### writeValue

#### 默认序列化：

```java
        ObjectMapper mapper = new ObjectMapper();
        User user = new User("gakki", 18);
        byte[] bytes = mapper.writeValueAsBytes(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(bytes);
        System.out.println(userStr);
```

输出：

```java
[B@2669b199
{"name":"gakki","age":18}
```

当POJO对象中存在null值时：

```java
        ObjectMapper mapper = new ObjectMapper();
        User user = new User();
        user.setName("jacklove");
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

```java
{"name":"jacklove","age":0}
```

这里因为，age是基本类型int，有默认值：0。

---

User：

```java
public class User {
    private String name;
    private int age;
    private String address;  //多加一个引用属性
    ···
}
```

```java
{"name":"jacklove","age":0,"address":null}
```

**Jackson默认是会帮我们序列化null的属性值的，Gson和FastJson默认是不会帮我们序列化null值！**

#### 不序列化null

不想序列化null值呢？使用如下配置：

```java
mapper.setDefaultPropertyInclusion(JsonInclude.Include.NON_NULL);
mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
```

```java
        ObjectMapper mapper = new ObjectMapper();
        //设置属性特性，不包括null的值
        mapper.setDefaultPropertyInclusion(JsonInclude.Include.NON_NULL);
        //mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        User user = new User();
        user.setName("jacklove");
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

输出：

```java
{"name":"jacklove","age":0}
```

---

Incluede的参数配置：

```java
Include.Include.ALWAYS 默认   
Include.NON_DEFAULT 属性为默认值不序列化   
Include.NON_EMPTY 属性为 空（""） 或者为 null 都不序列化   
Include.NON_NULL 属性为NULL 不序列化  
```

---

#### 日期格式化：

User

```java
public class User {

    private String name;
    private int age;
    private String address;
    private Date birthday;  //添加一个时间类型
    ···  
 }
```

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.setSerializationInclusion(JsonInclude.Include.NON_DEFAULT);
        User user = new User();
        user.setName("jacklove");
        user.setBirthday(new Date()); //日期默认序列化为时间戳，不够友好。
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

```java
{"name":"jacklove","birthday":1577606398838}
```

---

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.setSerializationInclusion(JsonInclude.Include.NON_DEFAULT);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        //设置日期的格式
        mapper.setDateFormat(dateFormat);
        User user = new User();
        user.setName("jacklove");
        user.setBirthday(new Date()); //日期默认序列化为时间戳，不够友好。
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

输出：

```java
{"name":"jacklove","birthday":"2019-12-29"}
```

#### 格式化序列化

将序列化后的字符串以人为友好的形式：

```java
        ObjectMapper mapper = new ObjectMapper();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        mapper.setDateFormat(dateFormat);
        //友好的形式
        mapper.enable(SerializationFeature.INDENT_OUTPUT);

        User user = new User();
        user.setName("jacklove");
        user.setBirthday(new Date()); //日期默认序列化为时间戳，不够友好。
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

输出：

```java
{
  "name" : "jacklove",
  "age" : 0,
  "address" : null,
  "birthday" : "2019-12-29"
}
```

---

### readTree

1）使用：mapper.readTree();  //构建JsonNode

```java
        ObjectMapper mapper = new ObjectMapper();
        User user = new User("gakki", 18);
        String json = mapper.writeValueAsString(user);
        System.out.println(json);

        //根节点
        JsonNode jsonNode = mapper.readTree(json);
        System.out.println(jsonNode.getNodeType());
        System.out.println(jsonNode);
        boolean name = jsonNode.has("name");
        System.out.println(name);
        JsonNode name1 = jsonNode.get("name");
        System.out.println(name1);
        System.out.println(jsonNode.get("age"));
        System.out.println(jsonNode.has("address"));//虽然addrss为null，但是返回true
        System.out.println(jsonNode.get("address"));//address存在，但是值为null
        System.out.println(jsonNode.has("notExit"));//不存在，返回false
        System.out.println(jsonNode.get("notExit"));//返回null，是本身不存在，返回null
```

输出：

```java
{"name":"gakki","age":18,"address":null,"birthday":null}
OBJECT
{"name":"gakki","age":18,"address":null,"birthday":null}
true
"gakki"
18
true
null
false
null
```

2）使用JsonNodeFactory来创建ObjectNode和ArrayNode节点

```java
        ObjectMapper mapper = new ObjectMapper();
        JsonNodeFactory nodeFactory = mapper.getNodeFactory();

        ObjectNode objNode = nodeFactory.objectNode();
        objNode.put("name", "gakki");
        objNode.put("age", 18);
        ObjectNode boyfriend = objNode.putObject("boyfriend"); // "boyfriend":{
        boyfriend.put("name", "liuzhuo");
        boyfriend.put("age", 20);
        ArrayNode hobby = objNode.putArray("hobby"); // "hobby":[
        hobby.add("看电影");
        hobby.add("爬山");
        hobby.add("游泳");
        hobby.add("读书");
        String value = mapper.writeValueAsString(objNode);
        System.out.println(value);
```

```java
{"name":"gakki","age":18,"boyfriend":{"name":"liuzhuo","age":20},"hobby":["看电影","爬山","游泳","读书"]}
```

### 总结

- 平时一般使用readValue，将json字符串反序列化为POJO对象，注意，json字符串有多余的属性默认会报错，必须配置：`mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)`。POJO的属性如果要反序列化成功，要么使用public修饰，要么配上相应的get和set方法。
- readValue带泛型的POJO：方法一：TypeReference<>的子类，方法二：mapper.getTypeFactory().constructParametricType(collectionClass, yourBean.class);
- writerValue: 序列化POJO对象，默认会序列化值为null、空字符串等，想去掉使用：`mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);`
- readTree：是比较底层的用法了，更加灵活一些，可以自己组建要序列化的JsonNode。