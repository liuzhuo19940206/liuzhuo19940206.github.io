---
title: GSON的基础入门
author: gakkij
categories:
  - Gson
tags:
  - json
img: https://pic1.superbed.cn/item/5df4ec6ca4fbc8614a5b7088.jpg
top: false
cover: false
toc: true
date: 2019-12-14 21:59:07
summary: Gson的基础入门
password:
---

#### GSON的基础用法

GSON是google提供的java包，用来序列化和反序列化json对象的。

Gson提供了`fromJson()` 和`toJson()` 两个直接用于解析和生成的方法，前者实现反序列化，后者实现了序列化。同时每个方法都提供了重载方法，我常用的总共有5个。

```java
Gson.toJson(Object); //序列化
Gson.fromJson(Reader,Class); //反序列化
Gson.fromJson(String,Class);
Gson.fromJson(Reader,Type);
Gson.fromJson(String,Type);
```

#### GSON的基本用法

我们了解了json的官方解析中，是使用：JSONObject来表示json对象，JSONArray来表现列表即数组。

GSON也提供了这样的基础用法，我们先来学习一下基础的用法，后面再学习高级的用法。

在GSON中：JsonObject表示对象，JsonArray表示数组，JsonParser表示解析器：将json字符串解析为JsonObject或者JsonArray。

**`PS：注意和Json官方解析中对象和数组的区别`**

#### json字符串解析为Json对象

本例子都是使用的：GSON的2.8.5版本

```java
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.8.5</version>
        </dependency>
```

```javascript
        String str = "{\"id\":1234545,\"name\":\"gakki\",\"birthday\":\"2019-12-14T22:35:11.468\"}";

        JsonParser jsonParser = new JsonParser();
        JsonElement jsonElement = jsonParser.parse(str);

        JsonObject jsonObject = jsonElement.getAsJsonObject();
        JsonElement element = jsonObject.get("id");
        int id = element.getAsInt();

        String name = jsonObject.get("name").getAsString();

        String birthday = jsonObject.get("birthday").getAsString();

        LocalDateTime localDateTime = LocalDateTime.parse(birthday);
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("YYYY-MM-dd HH:mm:ss");
        String format = dateTimeFormatter.format(localDateTime);


        System.out.println("id:" + id + "\t" + "name:" + name + "\t" + "birthday:" + format);
```

说明：

通过JsonParser解析后，得到的是：JsonElement对象。

然后，我们通过观察<font color="red">：根元素是对象还是数组，来决定 JsonElement是调用：getAsJsonObjec 还是：getAsJsonArray 。</font>

我们这里是{}包裹的对象，因此使用 getAsJsonObjec 来获取对象元素。如果你使用：getAsJsonArray，会抛出异常：

```java
Exception in thread "main" java.lang.IllegalStateException: Not a JSON Array: {"id":1234545,"name":"gakki","birthday":"2019-12-14T22:35:11.468"}
	at com.google.gson.JsonElement.getAsJsonArray(JsonElement.java:107)
	at com.liuzhuo.gson.GsonUtil.parseJsonStrToJsonObj(GsonUtil.java:27)
	at com.liuzhuo.gson.GsonUtil.main(GsonUtil.java:45)
```

程序输出的结果：

```java
id:1234545	name:gakki	birthday:2019-12-14 22:35:11
```

PS: 通过使用：jsonObject的get方法得到的对象还是jsonElement对象，然后根据key对应的value类型，分别调用对应的 getAsInt 、getAsString 等方法。如果key本身不存的话，get方法返回的JsonElement对象是null，因此会出现空指针异常，所以需要确定key本身存在，或者使用之前进行判断。

---

#### json数组字符串解析为JSON数组对象

```java
        String str = "[{\"id\":123,\"name\":\"gakki\",\"birthday\":\"2019-6-11T22:35:11.468\"},{\"id\":456,\"name\":\"liuzhuo\",\"birthday\":\"2019-6-12T22:35:11.468\"}]";

        JsonParser jsonParser = new JsonParser();
        JsonArray jsonArray = jsonParser.parse(str).getAsJsonArray();

        for (int i = 0; i < jsonArray.size(); i++) {
            JsonObject jsonObject = jsonArray.get(i).getAsJsonObject();
            int id = jsonObject.get("id").getAsInt();
            String name = jsonObject.get("name").getAsString();
            String birthday = jsonObject.get("birthday").getAsString();
            System.out.println("id:" + id + "\t" + "name:" + name + "\t" + "birthday:" + birthday);
        }
```

输出结果：

```java
id:123	name:gakki	birthday:2019-6-11T22:35:11.468
id:456	name:liuzhuo	birthday:2019-6-12T22:35:11.468
```

---

#### 手动创建Json对象

```java
    public static void createJsonObj() {

        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("id", 6666);
        jsonObject.addProperty("name", "gakkij");
        jsonObject.addProperty("age", 18);
        System.out.println(jsonObject); //{"id":6666,"name":"gakkij","age":18}
    }
```

`PS: 如果后添加的 key 已经存在了，会覆盖之前的key的value值。`

JsonObject 和 JsonArray 都是 JsonElement 的 子类。

* JsonObject 通过 get方法获取 JsonElement对象后，根据相应的类型调用 getAsXXX来获取对象。
* JsonObject 可以通过：getAsJsonObject(String name) 来直接获取 JsonObject对象。
* JsonObject 可以通过：getAsJsonArray(String name) 来直接获取 JsonArray对象。

---

#### 手动创建Json数组对象

```
public static void createJsonArray() {
        JsonObject jsonObject1 = new JsonObject();
        jsonObject1.addProperty("id", 6666);
        jsonObject1.addProperty("name", "gakkij");
        jsonObject1.addProperty("age", 18);

        JsonObject jsonObject2 = new JsonObject();
        jsonObject2.addProperty("id", 8888);
        jsonObject2.addProperty("name", "liuzhuo");
        jsonObject2.addProperty("age", 20);

        JsonArray jsonArray = new JsonArray();
        jsonArray.add(jsonObject1);
        jsonArray.add(jsonObject2);

        System.out.println(jsonArray);
       //[{"id":6666,"name":"gakkij","age":18},{"id":8888,"name":"liuzhuo","age":20}]
    }
```

`注意：不是 JsonArray只能添加 JsonObject，其他的基本类型都能添加的,只是一般我们都是添加JsonObject对象，业务上好处理`

```
    public static void createJsonArray() {
        JsonObject jsonObject1 = new JsonObject();
        jsonObject1.addProperty("id", 6666);
        jsonObject1.addProperty("name", "gakkij");
        jsonObject1.addProperty("age", 18);

        JsonObject jsonObject2 = new JsonObject();
        jsonObject2.addProperty("id", 8888);
        jsonObject2.addProperty("name", "liuzhuo");
        jsonObject2.addProperty("age", 20);

        JsonArray jsonArray = new JsonArray();
        jsonArray.add(jsonObject1);
        jsonArray.add(jsonObject2);
        //添加其他类型的数据
        jsonArray.add(4355);
        jsonArray.add("address");
        jsonArray.add(true);

        System.out.println(jsonArray);
        //[{"id":6666,"name":"gakkij","age":18},{"id":8888,"name":"liuzhuo","age":20},4355,"address",true]
    }
```

---

#### 删除JsonObject中的某一个属性

```java
    public static void delJsonObjProperty() {
        String str = "{\"id\":1234545,\"name\":\"gakki\",\"birthday\":\"2019-12-14T22:35:11.468\"}";

        JsonElement parse = new JsonParser().parse(str);
        JsonObject jsonObject = parse.getAsJsonObject();
        System.out.println("删除之前：" + jsonObject);

        String name = jsonObject.remove("name").getAsString();

        System.out.println("删除：" + name + ",之后：" + jsonObject);
    }
```

输出：

```java
删除之前：{"id":1234545,"name":"gakki","birthday":"2019-12-14T22:35:11.468"}
删除：gakki,之后：{"id":1234545,"birthday":"2019-12-14T22:35:11.468"}
```

---

#### 修改Json对象中的某一个属性

```java
    public static void updateJsonObjProperty() {

        String str = "{\"id\":1234545,\"name\":\"gakki\",\"birthday\":\"2019-12-14T22:35:11.468\"}";

        JsonElement parse = new JsonParser().parse(str);
        JsonObject jsonObject = parse.getAsJsonObject();
        System.out.println("修改name属性之前：" + jsonObject);
        jsonObject.addProperty("name", "liuzhuo");
        System.out.println("修改name属性之后：" + jsonObject);
    }
```

PS: 修改属性其实就是和添加一样：使用 addProperty 方法，key存在就替换，不存在就添加。

---

#### 获取Json对象中的某一个属性

```java
    public static void getJsonObjProperty() {
        String str = "{\"id\":1234545,\"name\":\"gakki\",\"birthday\":\"2019-12-14T22:35:11.468\"}";

        JsonElement parse = new JsonParser().parse(str);
        JsonObject jsonObject = parse.getAsJsonObject();

        if (jsonObject.has("name")) {
            String name = jsonObject.get("name").getAsString();
            System.out.println("name:" + name);
        }
        System.out.println(jsonObject.has("unknow"));
        
    }
```

输出结果：

```java
name:gakki
false
```

GSON 和 json官方的 JSONObject对象一样，可以使用has方法来判断是否存在：key。

但是，GSON没有官方的optXXX方法，当key不存在时，返回默认值或者返回指定的值。

---

#### 创建复杂的Json对象

```
public static void createComplexPerson() {
    /**
     * 实际应用中：构建该json对象
     * [{"id":123,"name":"gakki","age":18,"dog":{"dName":"小黄","color":"yellow"}},
     * {"id":345,"name":"liuzhuo","age":20,"dog":{"dName":"小黑","color":"black"}}]
     */
    // 首先分析：数组中有几个对象，两个。对象下是否还有子对象：dog
    JsonObject dog1 = new JsonObject();
    dog1.addProperty("dName", "小黄");
    dog1.addProperty("color", "yellow");

    JsonObject dog2 = new JsonObject();
    dog2.addProperty("dName", "小黑");
    dog2.addProperty("color", "black");

    JsonObject person1 = new JsonObject();
    person1.addProperty("id", 123);
    person1.addProperty("name", "gakki");

    JsonObject person2 = new JsonObject();
    person2.addProperty("id", 123);
    person2.addProperty("name", "gakki");

    person1.add("dog", dog1);
    person2.add("dog", dog2);

    JsonArray jsonArray = new JsonArray();
    jsonArray.add(person1);
    jsonArray.add(person2);

    System.out.println(jsonArray);

}
```

输出结果：

```java
[{"id":123,"name":"gakki","dog":{"dName":"小黄","color":"yellow"}},{"id":123,"name":"gakki","dog":{"dName":"小黑","color":"black"}}]

Process finished with exit code 0
```

<font color="red">PS: JsonObject对象中添加基本的元素是通过：addProperty 来添加的，如果是添加复杂对象，例如：JsonObject 或 JsonArray 就是使用：add 方法来添加。</font>

---

#### 总结

GSON的基本使用方法：主要是使用：JsonParser对象、JsonObject对象、JsonArray对象。

* JsonObject 对应于json官方的：JSONObject
* JsonArray 对应于json官方的：JSONArray
* JsonParser对象解析json字符串后，得到是JsonElement对象，JsonObject的get，JsonArray的get都是得到JsonElement对象，JsonElement对象会有一系列的getAsXXX方法，例如：getAsInt , getAsString , getAsBoolean等。
* 当key不存在时，会返回null，所以需要使用 has 方法来判断是否存在该key
* `GSON没有json官方的 optXXX 方法,当key不存在时，返回默认值或指定的值。`

