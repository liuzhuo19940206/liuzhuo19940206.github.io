---
title: Json的官方解析
author: gakkij
categories:
  - json
tags:
  - json
img: https://pic2.superbed.cn/item/5df442341f8f59f4d6f21ebd.jpg
top: false
cover: false
coverImg:
toc: true
date: 2019-12-14 09:54:38
summary: json的官方解析
password:
---

### JSON介绍

JSON(JavaScript Object Notation) 是一种轻量级的数据交换格式。 易于人阅读和编写。同时也易于机器解析和生成。 它基于JavaScript Programming Language, Standard ECMA-262 3rd Edition - December 1999的一个子集。 JSON采用完全独立于语言的文本格式，但是也使用了类似于C语言家族的习惯（包括C, C++, C#, Java, JavaScript, Perl, Python等）。 这些特性使JSON成为理想的数据交换语言。

#### JSON的两种格式

- ​	“名称/值”对的集合（A collection of name/value pairs）。
- 值的有序列表（An ordered list of values）。在大部分语言中，它被理解为数组（array）。

#### JSON的具体格式

* 对象是一个**`无序`**的“‘名称/值’对”集合。一个对象以“{”（左括号）开始，“}”（右括号）结束。每个“名称”后跟一个“:”（冒号）；“‘名称/值’ 对”之间使用“,”（逗号）分隔。
* 值的**`有序`**列表（An ordered list of values）。在大部分语言中，它被实现为数组（array），矢量（vector），列表（list），序列（sequence）。

#### JSON的例子

```java
对象的格式：
{
  "name":"xxxx",
  "age":18,
  "address":"yyyyy"
}
列表的格式：
[
  {
  "name":"xxxx",
  "age":18,
  "address":"yyyyy"
  },
  {
  "name":"xxxx",
  "age":18,
  "address":"yyyyy"
  }
]
```

ps:

JSONObject是无序的
JSONArray是有序的

标准的json格式：key都是字符串且使用双引号包裹，value可以是任意的数据类型，例如：整形，字符串，对象，数组等。

[JSON中国](http://www.json.org.cn/)	

---

### JSON官方的解析

#### jsonObject的例子

在resource下的user.json文件

```java
{
  "name": "gakkij",
  "age": 18,
  "address": "东京"
}
```

博主创建的maven项目，可以自行选择IDE。

pom：

```java
<dependencies>
        <!-- https://mvnrepository.com/artifact/org.springframework/spring-core -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>5.2.1.RELEASE</version>
        </dependency>

        <!-- https://mvnrepository.com/artifact/commons-io/commons-io -->
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.4</version>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.json/json -->
        <dependency>
            <groupId>org.json</groupId>
            <artifactId>json</artifactId>
            <version>20160810</version>
        </dependency>

        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>3.1</version>
        </dependency>

        <dependency>
            <groupId>commons-beanutils</groupId>
            <artifactId>commons-beanutils</artifactId>
            <version>1.8.3</version>
        </dependency>

        <dependency>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
            <version>1.1.1</version>
        </dependency>

        <dependency>
            <groupId>commons-collections</groupId>
            <artifactId>commons-collections</artifactId>
            <version>3.2.1</version>
        </dependency>

        <dependency>
            <groupId>net.sf.ezmorph</groupId>
            <artifactId>ezmorph</artifactId>
            <version>1.0.6</version>
        </dependency>

</dependencies>

```

##### 程序

```java
        File jsonFile = ResourceUtils.getFile("classpath:user.json");
        String json = FileUtils.readFileToString(jsonFile);

        JSONObject jsonObject = new JSONObject(json);
        String name = jsonObject.getString("name");
        int age = jsonObject.getInt("age");
        String address = jsonObject.getString("address");
        User user = new User(name, age, address);
        System.out.println(user);
```

```java
public class User {

    private String name;
    private int age;
    private String address;
    
    省略： set,get 方法
}
```



说明：首先判断你的json文件的根是对象，还是列表，是对象就使用：JSONObject，是列表就使用：JSONArray。

jsonObject对象，可以通过各种：getXXX方法来获取 key 对应的 value 值，int类型就是：getInt；String类型就是：getString，如果value是 {}对象，就是：getJSONObject；如果是[] 列表类型，就是：getJSONArray。

---

#### jsonArray的例子

在resource目录下：

section.json

```javascript
[
    {
        "id": 1580615,
        "name": "皮的嘛",
        "packageName": "com.renren.mobile.android",
        "iconUrl": "app/com.renren.mobile.android/icon.jpg",
        "stars": 2,
        "size": 21803987,
        "downloadUrl": "app/com.renren.mobile.android/com.renren.mobile.android.apk",
        "des": "2011-2017 你的铁头娃一直在这儿。中国最大的实名制SNS网络平台，嫩头青"
    },
    {
        "id": 1540629,
        "name": "不存在的",
        "packageName": "com.ct.client",
        "iconUrl": "app/com.ct.client/icon.jpg",
        "stars": 2,
        "size": 4794202,
        "downloadUrl": "app/com.ct.client/com.ct.client.apk",
        "des": "斗鱼271934走过路过不要错过，这里有最好的鸡儿"
    }
]
```

##### 程序

```java
File jsonFile = ResourceUtils.getFile(s);
        String json = FileUtils.readFileToString("classpath:section.json");
        System.out.println(json);
        System.out.println("===========");
        JSONArray jsonArray = new JSONArray(json);
        List<Section> sectionList = new ArrayList<>();
        for (int i = 0; i < jsonArray.length(); i++) {
            JSONObject jsonObject = jsonArray.getJSONObject(i);
            String des = jsonObject.getString("des");
            int size = jsonObject.getInt("size");
            String name = jsonObject.getString("name");
            String downloadUrl = jsonObject.getString("downloadUrl");
            int id = jsonObject.getInt("id");
            String packageName = jsonObject.getString("packageName");
            String iconUrl = jsonObject.getString("iconUrl");
            int stars = jsonObject.getInt("stars");
            Section section = new Section(id, name, packageName, iconUrl, stars, size, downloadUrl, des);
            sectionList.add(section);
        }
        sectionList.forEach(section -> {
            System.out.println(section);
        });
```

说明：

json文件的根是：[] 开头的话，就使用 ：JSONArray 来解析。

通过遍历 JSONArray 对象来 获取其中的值，注意：JSONArray是有序的。

jsonArray的各种 get 方法，是需要判断 json文件中[]列表的value具体的类型，这里因为都是{}对象，因此，我统一都是使用：jsonArray.getJSONObject(i) 来解析的，如果[]中的类型不一致，那就需要分开处理了。

---

```javascript
[
  12,
  "gakkj",
  {
    "name": "jacklove",
    "age": 18,
    "address": "北京"
  }
]
```

```java
        File jsonFile = ResourceUtils.getFile(s);
        String json = FileUtils.readFileToString(jsonFile);

        JSONArray jsonArray = new JSONArray(json);

        int id = jsonArray.getInt(0);
        String love = jsonArray.getString(1);
        JSONObject jsonObject = jsonArray.getJSONObject(2);
        String name = jsonObject.getString("name");
        int age = jsonObject.getInt("age");
        String address = jsonObject.getString("address");

        System.out.println("id:"+id+",love:"+love+",  
                           ["+"name:"+name+",age:"+age+",address:"+address+"]");
```

---

#### 案例

当json文件中，没有出现该key时，解析会出现什么呢？

```java
{
  "name": "gakki",
  "age": 18,
  "address": "东京"
}
```

```java
File jsonFile = ResourceUtils.getFile(s);
String json = FileUtils.readFileToString(jsonFile);

JSONObject jsonObject = new JSONObject(json);

String name = jsonObject.getString("name");
System.out.println(name);
String nokown = jsonObject.getString("unkown");
System.out.println(nokown);
```

![](https://pic2.superbed.cn/item/5df44e131f8f59f4d6faf363.jpg)

能看到：gakki解析出来了，但是不存在：unknow，就会直接抛出异常了。

---

因此，为了提供程序的鲁棒性，解析之前请先判断是否存在：

```java
        File jsonFile = ResourceUtils.getFile(s);
        String json = FileUtils.readFileToString(jsonFile);

        JSONObject jsonObject = new JSONObject(json);
        
        if(jsonObject.has("name")){
            String name = jsonObject.getString("name");
            System.out.println(name);
        }
        boolean unknow1 = jsonObject.has("unknow");
        System.out.println(unknow1);
```

![](https://pic2.superbed.cn/item/5df44f421f8f59f4d6fbc0a8.jpg)

可以看到，我们可以使用：has("xxx") 来判断是否存在该key。

---

```java
{
  "name": "gakki",
  "age": 18,
  "address": "东京",
  "host": null
}
```

当前：host是null。

```java
        File jsonFile = ResourceUtils.getFile(s);
        String json = FileUtils.readFileToString(jsonFile);

        JSONObject jsonObject = new JSONObject(json);

        boolean host = jsonObject.has("host");
        System.out.println(host);
        boolean aNull = jsonObject.isNull("host");
        System.out.println(aNull);
```

执行：

```java
true
true
```

说明：只有key存在，has函数就返回true，不管value是不是null，isNull函数来判断value是不是null。

---

有没有更好的方法，不需要判断key是否存在，如果key存在就返回value，不存在就返回Null，不抛出异常呢？

```java
        JSONObject jsonObject = new JSONObject(json);

        String unknow = jsonObject.optString("unknow");
        System.out.println(unknow == null);
        System.out.println(unknow);
        String host = jsonObject.optString("host");
        System.out.println(host == null);
        System.out.println(host);
        int size = jsonObject.optInt("size");
        System.out.println(size);
```

![](https://pic3.superbed.cn/item/5df4516e1f8f59f4d6fdbb59.jpg)

说明：使用optXXX() 方法，当key不存在，返回默认值，例如：optString()就是返回："", 注意不是null。optInt()：返回0；optBoolean：返回：false。

ps：optXXX() 方法还有一个重载的方法，optSting("xxx","default") ，第二个参数就是当xxx不存在时，返回的值，不再是默认的空字符串！！！

```java
        JSONObject jsonObject = new JSONObject(json);

        String unknow = jsonObject.optString("unknow","you know");
        System.out.println(unknow);
        String host = jsonObject.optString("host","皇家");
        System.out.println(host);
        int size = jsonObject.optInt("size",17);
        System.out.println(size);
        System.out.println(jsonObject.optBoolean("sss",true));
```

```java
you know
皇家
17
true
```

---

枚举类型的解析：

```java
{
  "color": "RED"
}
```

```java
package com.liuzhuo.json.domain;

/**
 * @Author liuzhuo
 * @Date 2019/12/14 11:20 上午
 * @Version 1.0
 */
public enum Color {
    RED,
    BULE,
    YELLOW
}

```

```java
JSONObject jsonObject = new JSONObject(json);

Color color = jsonObject.getEnum(Color.class, "color");
System.out.println(color);
```

```java
RED

Process finished with exit code 0
```

---

枚举定义自己的字段时：

```java
package com.liuzhuo.json.domain;

/**
 * @Author liuzhuo
 * @Date 2019/12/14 11:20 上午
 * @Version 1.0
 */
public enum Color {

    RED("red"),
    BULE("bule"),
    YELLOW("yyyy");

    private String fieldName;

    Color(String fieldName) {
        this.fieldName = fieldName;
    }

    public static Color getColorByFieldName(String fieldName) {
        for (Color value : Color.values()) {
            if (value.fieldName.equals(fieldName)) {
                return value;
            }
        }
        return null;
    }

    public String getFieldName() {
        return fieldName;
    }
}

```

```java
{
  "color": "red"  // 这里是我自己定义的field字段的值
}
```

```java
Exception in thread "main" org.json.JSONException: JSONObject["color"] is not an enum of type "Color".
	at org.json.JSONObject.getEnum(JSONObject.java:495)
	at com.liuzhuo.json.JsonParse.parseJson3(JsonParse.java:46)
	at com.liuzhuo.json.JsonParse.main(JsonParse.java:36)

Process finished with exit code 1
```

运行抛出异常，说明不能使用自己定义 的字段 来获取，枚举类型。

### 总结

* 解析之前，请观看根是对象还是列表（数组），对象使用：JSONObject，数组使用：JSONArray。

* 对象解析时，根据value的类型，调用相应的 getXXX() 方法来获取value值。

* 数组解析时，因为数组是有序的，因此请注意，每个数组中元素类型是否是一致的，如果是就使用for循环遍历来解析，否则就必须根据数组中，不同的坐标下的元素来分开解析。

* 当key不存在时，使用：getXXX() 方法会抛出异常，可以使用：has() 方法提前判断是否存在，isNull()方法来判断值是不是null。

* 当key不存在时，不想抛出异常，请使用 optXXX() 方法，不存在会返回相应类型的默认值，String：空字符串，int：0，boolean：false。也可以使用 带有两个参数的optXXX(,) 方法，指定需要返回的值。

* 缺点：没有直接将json字符串解析出javaBean对象，这个 不太方便，每个javaBean的属性需要我们自己解析出来后，手动拼接。

  

  后续，我会陆续介绍：GSON、fastJSON，jackSon， 并且分析这些json解析的优缺点。