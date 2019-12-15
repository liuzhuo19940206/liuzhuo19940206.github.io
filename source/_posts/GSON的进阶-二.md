---
title: GSON的进阶<二>
author: gakkij
categories:
  - GSON
tags:
  - json
img: https://pic2.superbed.cn/item/5df61fcfa4fbc8614a940313.jpg
top: false
cover: false
coverImg: /images/1.jpg
toc: true
date: 2019-12-15 19:53:49
summary: GSON的进阶教程《二》
password:
---

#### GSON的流式反序列化

##### 自动方式

```java
Gson提供了fromJson()和toJson() 两个直接用于解析和生成的方法，前者实现反序列化，后者实现了序列化。同时每个方法都提供了重载方法，我常用的总共有5个。
```

```java
Gson.toJson(Object);
Gson.fromJson(Reader,Class);
Gson.fromJson(String,Class);
Gson.fromJson(Reader,Type);
Gson.fromJson(String,Type);
```

自动方式就是使用：多个formJson的重载方法而已，就是这么简单，粗暴。

##### 手动方式

手动的方式就是使用`stream`包下的`JsonReader`类来手动实现反序列化，和Android中使用pull解析XML是比较类似的。

```java
    private static void parseJsonStr() throws IOException {

        String json = "{\"name\":\"gakki\",\"age\":18,\"address\":\"冲绳岛\"}";

        JsonReader jsonReader = new JsonReader(new StringReader(json));

        jsonReader.beginObject();  //throws IOException
        User user = new User();
        while (jsonReader.hasNext()) {
            String name = jsonReader.nextName();
            switch (name) {
                case "name":
                    user.setName(jsonReader.nextString());
                    break;
                case "age":
                    user.setAge(jsonReader.nextInt());
                    break;
                case "address":
                    user.setAddress(jsonReader.nextString());
                    break;
                default:
                    break;
            }
        }
        jsonReader.endObject();
        System.out.println(user);
    }
```

结果：

```java
User{name='gakki', age=18, address='冲绳岛'}
```

数组的例子：

```java
    private static void parseJsonStrArray() throws IOException {

        String json = "[{\"name\":\"gakki\",\"age\":18,\"address\":\"冲绳岛\"}," +
                "{\"name\":\"liuzhuo\",\"age\":20,\"address\":\"梦幻岛\"}," +
                "{\"name\":\"gakkij\",\"age\":22,\"address\":\"东京\"}]";

        JsonReader jsonReader = new JsonReader(new StringReader(json));

        jsonReader.beginArray();  //throws IOException
        List<User> userList = new ArrayList<>();

        while (jsonReader.hasNext()) {
            User user = new User();
            jsonReader.beginObject();
            while (jsonReader.hasNext()) {
                String name = jsonReader.nextName();
                switch (name) {
                    case "name":
                        user.setName(jsonReader.nextString());
                        break;
                    case "age":
                        user.setAge(jsonReader.nextInt());
                        break;
                    case "address":
                        user.setAddress(jsonReader.nextString());
                        break;
                    default:
                        break;
                }
            }
            jsonReader.endObject();
            userList.add(user);
        }
        jsonReader.endArray();
        System.out.println(userList);
    }
```

结果：

```java
[User{name='gakki', age=18, address='冲绳岛'}, User{name='liuzhuo', age=20, address='梦幻岛'}, User{name='gakkij', age=22, address='东京'}]
```

注意：每个一个begin都必须在最后接一个end结束，beginObject 对应：endObject；beginArray 对应endArray。

通过hasNext来判断是否有下一个元素，nextName取出当前的key，nextXXX来取出对应类型的value值【必须先nextName，才能nextXXX】。

---

其实自动反序列化最终也是采用：JsonReader的方式：

![](https://pic1.superbed.cn/item/5df6262ca4fbc8614a955800.jpg)

#### GSON的流式序列化

##### 自动方式

```java
toJson()
```

![](https://pic1.superbed.cn/item/5df627aba4fbc8614a959d72.jpg)

提示：`PrintStream`(System.out) 、`StringBuilder`、`StringBuffer`和`*Writer`都实现了`Appendable`接口。

```java
        User user = new User("gakki",18,"冲绳岛");
        Gson gson = new Gson();
        gson.toJson(user,new PrintStream(System.out));
```

```java
这样就是直接把序列化的结果打印到控制台上：
{"age":18,"userName":"gakki","address":"冲绳岛"}
```

##### 手动方式

```java
JsonWriter writer = new JsonWriter(new OutputStreamWriter(System.out));
writer.beginObject() // throws IOException
        .name("name").value("怪盗kidou")
        .name("age").value(24)
        .name("email").nullValue() //演示null
        .endObject(); // throws IOException
writer.flush(); // throws IOException
//{"name":"怪盗kidou","age":24,"email":null}
```

---

#### GsonBuilder的简单使用

##### 序列化null值

serializeNulls()

```java
    public static void parsePojoForNull() {
        Gson gson1 = new Gson();
        Gson gson = new GsonBuilder().serializeNulls().create();
        User user = new User();
        String user1 = gson1.toJson(user);
        String user2 = gson.toJson(user);
        System.out.println(user1);
        System.out.println(user2);
    }
```

```java
{"age":0}
{"age":0,"userName":null,"address":null}
```

age 是 int，默认值是0，不是 null。

##### 序列化格式化

setPrettyPrinting()

```java
    public static void formatJsonStr() {

        User user = new User("gakki", 18, "冲绳岛");
        Gson gson = new Gson();
        String user1 = gson.toJson(user);
        Gson gson2 = new GsonBuilder().setPrettyPrinting().create();
        String user2 = gson2.toJson(user);
        System.out.println(user1);
        System.out.println(user2);

    }
```

```java
{"age":18,"userName":"gakki","address":"冲绳岛"}
{
  "age": 18,
  "userName": "gakki",
  "address": "冲绳岛"
}
```

##### 时间格式化

setDateFormat()

```java
    public static void formatJsonStrDate() {

        User user = new User("gakki", 18, "冲绳岛", new Date());
        Gson gson = new Gson();
        String user1 = gson.toJson(user);
        Gson gson2 = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").setPrettyPrinting().create();
        String user2 = gson2.toJson(user);
        System.out.println(user1);
        System.out.println(user2);

    }
```

```java
{"age":18,"userName":"gakki","address":"冲绳岛","birthday":"Dec 15, 2019 8:47:03 PM"}
{
  "age": 18,
  "userName": "gakki",
  "address": "冲绳岛",
  "birthday": "2019-12-15 20:47:03"
}
```

时间的反序列化：

```java
    public static void parseJsonStrDate() {
        String json = "{\"age\":18,\"userName\":\"gakki\",\"address\":\"冲绳岛\",\"birthday\":\"Dec 15, 2019 8:47:03 PM\"}";
        String json2 = "{\"age\":18,\"userName\":\"gakki\",\"address\":\"冲绳岛\",\"birthday\":\"2019-06-11 11:11:11\"}";
        Gson gson = new Gson();
        User user = gson.fromJson(json, User.class);
        System.out.println(user);
        Gson gson2 = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
        User user1 = gson2.fromJson(json2, User.class);
        System.out.println(user1);

    }
```

```java
User{age=18, name='gakki', address='冲绳岛', birthday=Sun Dec 15 20:47:03 CST 2019}
User{age=18, name='gakki', address='冲绳岛', birthday=Tue Jun 11 11:11:11 CST 2019}
```

注意：json1 和 json2 的birthday的字符串格式的区别！！！

---

其他类似的，就不一一列举了：

```java
Gson gson = new GsonBuilder()
        //序列化null
        .serializeNulls()
        // 设置日期时间格式，另有2个重载方法
        // 在序列化和反序化时均生效
        .setDateFormat("yyyy-MM-dd")
        // 禁此序列化内部类
        .disableInnerClassSerialization()
        //生成不可执行的Json（多了 )]}' 这4个字符）
        .generateNonExecutableJson()
        //禁止转义html标签
        .disableHtmlEscaping()
        //格式化输出
        .setPrettyPrinting()
        .create();
```

注意：内部类(Inner Class)和嵌套类(Nested Class)的区别