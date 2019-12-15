---
title: GSON的进阶<一>
author: gakkij
categories:
  - GSON
tags:
  - json
img: https://pic1.superbed.cn/item/5df5af70a4fbc8614a7e380b.jpg
top: false
cover: false
coverImg:
toc: true
date: 2019-12-15 11:51:19
summary: GSON的进阶教程
password:
---

### GSON的说明

Gson（又称Google Gson）是Google公司发布的一个开放源代码的Java库，主要用途为序列化Java对象为JSON字符串，或反序列化JSON字符串成Java对象。而JSON(JavaScript Object Notation) 是一种轻量级的数据交换格式，易于人阅读和编写，同时也易于机器解析和生成，广泛应用于各种数据的交互中，尤其是服务器与客户端的交互。


### GSON的创建

#### 直接new Gson对象

```java
// 使用new方法
Gson gson = new Gson();
 
// toJson 将bean对象转换为json字符串
String jsonStr = gson.toJson(user, User.class);
 
// fromJson 将json字符串转为bean对象
Student user= gson.fromJson(jsonStr, User.class);
 
// 序列化List
String jsonStr2 = gson.toJson(list);
 
// 反序列化成List时需要使用到TypeToken getType()
List<User> retList = gson.fromJson(jsonStr2,new TypeToken<List<User>>(){}.getType());
 
//type的使用，User代表解析出来的Bean对象，result为后台返回的json格式字符串，
//List<UserBean>代表通过Gson按照type格式解析json格式字符串后返回的对象列表
   如：Type type = new TypeToken<List<User>>() {
                        }.getType();
 List<UserBean> UserBeans = gson.fromJson(result, type);
```

#### 使用GsonBuilder

使用new Gson()，此时会创建一个带有**默认配置**选项的Gson实例，如果不想使用默认配置，那么就可以使用GsonBuilder。

```java
//serializeNulls()是GsonBuilder提供的一种配置，当字段值为空或null时，依然对该字段进行转换
Gson gson = new GsonBuilder().serializeNulls().create(); 
```

使用GsonBuilder创建Gson实例的步骤：

首先创建GsonBuilder,然后调用GsonBuilder提供的各种配置方法进行配置，

最后调用GsonBuilder的create方法，将基于当前的配置创建一个Gson实例。

GsonBuilder的一些配置：

```java
Gson gson = new GsonBuilder()
         .excludeFieldsWithoutExposeAnnotation() //不对没有用@Expose注解的属性进行操作
         .enableComplexMapKeySerialization() //当Map的key为复杂对象时,需要开启该方法
         .serializeNulls() //当字段值为空或null时，依然对该字段进行转换
         .setDateFormat("yyyy-MM-dd HH:mm:ss:SSS") //时间转化为特定格式
         .setPrettyPrinting() //对结果进行格式化，增加换行
         .disableHtmlEscaping() //防止特殊字符出现乱码
         .registerTypeAdapter(User.class,new UserAdapter()) //为某特定对象设置固定的序列或反序列方式，自定义Adapter需实现JsonSerializer或者JsonDeserializer接口
         .create();
```

### GSON的基本使用

Gson提供了fromJson() 和toJson() 两个直接用于解析和生成的方法，前者实现反序列化，后者实现了序列化；同时每个方法都提供了重载方法

#### 基本类型的解析

```java
    public static void parseBasicType() {
        Gson gson = new Gson();

        Integer id = gson.fromJson("1", int.class);  // int
        Float aFloat = gson.fromJson("13.89", float.class);  //float
        Float aFloat2 = gson.fromJson("\"13.89\"", float.class);
        Double aDouble = gson.fromJson("78.89", double.class);  //double
        Boolean aTrue = gson.fromJson("true", boolean.class);   //boolean
        String gakkki = gson.fromJson("gakkki", String.class);  //String
        Color red = gson.fromJson("RED", Color.class); //枚举

        System.out.println(id + "\t" + aFloat + "\t" + aDouble + "\t" + aTrue + "\t" + gakkki + "\t" + red.getFieldName());
        System.out.println(aFloat2);
    }
```

`注意：aFloat 和 aFloat2的区别！`

输出结果：

```java
1	13.89	78.89	true	gakkki	red
13.89
```

Color枚举类型：

```java
public enum Color {

    RED("red"),
    BLUE("blue"),
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

PS: 通过ide我们可以看到 fromJson的7种重载方法。(目前使用的是第5个重载的方法)

![](https://pic1.superbed.cn/item/5df5b394a4fbc8614a7f14f8.jpg)

---

#### 基本类型的生成

```java
    public static void createBasicType() {
        Gson gson = new Gson();
        String intType = gson.toJson(1); //int
        String floatType = gson.toJson(12.56);// float
        String booleanType = gson.toJson(true);  // boolean
        String string = gson.toJson("gakki");  //String
        Color blue = Color.getColorByFieldName("blue");
        String enumType = gson.toJson(blue);  // enum

        System.out.println(intType + "\t" + floatType + "\t" + booleanType + "\t" + string + "\t" + enumType);
    }
```

输出结果：

```java
1	12.56	true	"gakki"	"BLUE"
```

PS: toJson有8中重载方法。（目前，使用的是第四种）

![](https://pic.superbed.cn/item/5df5b8f4a4fbc8614a7febf5.jpg)

---

#### POJO的生成与解析

User

```java
public class User {

    private String name;
    private int age;
    private String address;

    public User() {
    }

    public User(String name, int age, String address) {
        this.name = name;
        this.age = age;
        this.address = address;
    }

    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", address='" + address + '\'' +
                '}';
    }
}
```

create:

```java
    public static void parsePojo() {
        Gson gson = new Gson();
        User user = new User();
        String userStr1 = gson.toJson(user);

        User user2 = new User("gakki", 18, "冲绳岛");
        String userStr2 = gson.toJson(user2);

        System.out.println(userStr1);
        System.out.println(userStr2);
    }
```

输出结果：

```java
{"age":0}
{"name":"gakki","age":18,"address":"冲绳岛"}
```

<font color="red">说明：通过new Gson得到的 gson实例 是不会帮我们序列化值为null的key。这里user1就是因为没有给属性赋值，age是int基本类型，默认值是0，因此，最后只是序列化了age。</font>

parse：

```java
    public static void parsePojo() {
        String json = "{\"name\":\"gakki\",\"age\":18,\"address\":\"冲绳岛\"}";
        Gson gson = new Gson();
        User user = gson.fromJson(json, User.class);
        System.out.println(user);
    }
```

结果：

```java
User{name='gakki', age=18, address='冲绳岛'}
```

---

如果，我们想序列化key的值为null呢？

此时，我们需要使用：GsonBuilder，构造出我们自定义的Gson实例，不再使用默认的Gson实例。

```java
    public static void parsePojoForNull() {
        Gson gson = new GsonBuilder().serializeNulls().create();
        User user = new User();
        String userSer = gson.toJson(user);
        System.out.println(userSer);
    }
```

结果：

```java
{"name":null,"age":0,"address":null}
```

serializeNulls() 就是帮助我们序列化value为null的意思。

---

PS：Gson序列化的顺序是什么呢？是书写POJO的属性的顺序，还是与POJO的toString()方法有关呢？

修改User中，属性字段的顺序，将age排在第一位，之前是name排在第一位。

```java
public class User {
    
    private int age;
    private String name;
    private String address;
    
    省略set、get，toString方法
}
```

```java
{"age":0,"name":null,"address":null}
```

说明：Gson默认的序列化是根据POJO属性的书写顺序来序列化的。

如果，我们去掉toString方法呢？

```java
{"age":0,"name":null,"address":null}
```

说明：Gson的序列化与POJO的 toString方法没有关系，它是根据POJO的属性自己构造序列化的格式。

---

#### 属性重命名：@SerializedName 注解

我们有时收到的json字符串中的key的命名不符合我们java的规范该怎么呢？

上一节，我们了解到了，POJO的属性命名必须要与json字符串中key命名一致才能反序列化成功的，比如：

```java
    public static void parsePojo() {
        String json = "{\"user_name\":\"gakki\",\"age\":18,\"address\":\"冲绳岛\"}";
        Gson gson = new Gson();
        User user = gson.fromJson(json, User.class);
        System.out.println(user);
    }
```

这里，我将json字符串中的 name ，改成了：user_name，然后反序列化，结果如下：

```java
User{name='null', age=18, address='冲绳岛'}
```

发现，User的name字段是null，说明反序列化是失败的，因为我们知道json的反序列化是通过反射来完成的，因此字段名必须一致才能反序列化成功。

---

一般，前端的命名，或者 数据库中的命名都是 ：下划线来拼接的 ，例如：msg_type、msg_action等。

我们java的命名一般都是：驼峰命名法，msgType 、msgAction。我们不能为了反序列化成功，把命名规则改了吧，因此，Gson提供了相应的注解来帮助我们解决该类问题：

@SerializedName 注解

User:

```java
public class User {

    private int age;
    @SerializedName(value = "user_name") 
    private String name;
    private String address;
```

Parse：

```java
    public static void parsePojo() {
        String json = "{\"user_name\":\"gakki\",\"age\":18,\"address\":\"冲绳岛\"}";
        Gson gson = new Gson();
        User user = gson.fromJson(json, User.class);
        System.out.println(user);
    }
```

结果：

```java
User{name='gakki', age=18, address='冲绳岛'}
```

说明：使用：@SerializedName(value = "user_name") 注解，将json字符串中的 user_name 与 User的name联系起来了。

---

我们看看使用：@SerializedName(value = "user_name") 注解后的，序列化的结果：

```java
    public static void parsePojoForNull() {
        Gson gson = new GsonBuilder().serializeNulls().create();
        User user = new User();
        String userSer = gson.toJson(user);
        System.out.println(userSer);
    }
```

```java
{"age":0,"user_name":null,"address":null}
```

<font color="red">我们看到，序列化的结果也是把 **name**换成了**user_name**。</font>

---

测试：将@SerializedName注解放到 get、set方法上面：

```java
    @SerializedName(value = "user_name")
    public String getName() {
        return name;
    }

    @SerializedName(value = "user_name")
    public void setName(String name) {
        this.name = name;
    }
```

```java
        String json = "{\"user_name\":\"gakki\",\"age\":18,\"address\":\"冲绳岛\"}";
        Gson gson = new Gson();
        User user = gson.fromJson(json, User.class);
        System.out.println(user);
        
        Gson gson = new GsonBuilder().serializeNulls().create();
        User user = new User();
        String userSer = gson.toJson(user);
        System.out.println(userSer);
```

```java
User{name='null', age=18, address='冲绳岛'}
{"age":0,"name":null,"address":null}
```

发现并不好使，但是@SerializedName注解却又能在方法上注解，这点我不明白，我此处 Gson是：2.8.5版本的。

因此：<font color="red">@SerializedName注解：只能放在属性级别，不能放到getter /setter</font>

`PS: 还有，User的属性，即使没有get、set方法也能序列化和反序列化成功！！`

#### @SerializedName注解的别名

有时，我们获取到的json字符串中，key的命名有多种该怎么办呢？

例如：User中的name 属性 需要对应多个 json字符串中的 key值，name 、user_name 、userName 、Name等

我们点开：@SerializedName注解

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
public @interface SerializedName {
    String value();

    String[] alternate() default {};
}
```

能看到，除了 默认的 value字段外，还有一个 alternate字段，alternate就用来取别名的，可以取多个，匹配多个的话，以最后一个为准！

测试：

```java
public class User {

    private int age;
    @SerializedName(value = "name", alternate = {"user_name", "userName", "Name"})
    private String name;
    private String address;
  }
```

 注解中的数组是使用 {} 来表示的，此处的 alternate是 String[] 数组。

```java
    public static void parsePojo() {
        String json1 = "{\"name\":\"gakki1\",\"age\":18,\"address\":\"冲绳岛\"}";
        String json2 = "{\"user_name\":\"gakki2\",\"age\":18,\"address\":\"冲绳岛\"}";
        String json3 = "{\"userName\":\"gakki3\",\"age\":18,\"address\":\"冲绳岛\"}";
        String json4 = "{\"Name\":\"gakki4\",\"age\":18,\"address\":\"冲绳岛\"}";
        Gson gson = new Gson();
        User user1 = gson.fromJson(json1, User.class);
        User user2 = gson.fromJson(json2, User.class);
        User user3 = gson.fromJson(json3, User.class);
        User user4 = gson.fromJson(json4, User.class);
        System.out.println(user1);
        System.out.println(user2);
        System.out.println(user3);
        System.out.println(user4);
    }
```

```java
User{name='gakki1', age=18, address='冲绳岛'}
User{name='gakki2', age=18, address='冲绳岛'}
User{name='gakki3', age=18, address='冲绳岛'}
User{name='gakki4', age=18, address='冲绳岛'}
```

说明：此时，不管json字符串中的 name是哪种都能反序列化成功。

如果，同一个json字符串中，有多个匹配的别名呢？

```
    public static void parsePojo() {
        String json1 = "{\"name\":\"gakki1\",\"user_name\":\"gakki2\",\"userName\":\"gakki3\",\"age\":18,\"address\":\"冲绳岛\"}";
        //String json2 = "{\"user_name\":\"gakki2\",\"age\":18,\"address\":\"冲绳岛\"}";
        //String json3 = "{\"userName\":\"gakki3\",\"age\":18,\"address\":\"冲绳岛\"}";
        //String json4 = "{\"Name\":\"gakki4\",\"age\":18,\"address\":\"冲绳岛\"}";
        Gson gson = new Gson();
        User user1 = gson.fromJson(json1, User.class);
        //User user2 = gson.fromJson(json2, User.class);
        //User user3 = gson.fromJson(json3, User.class);
        //User user4 = gson.fromJson(json4, User.class);
        System.out.println(user1);
        //System.out.println(user2);
        //System.out.println(user3);
        //System.out.println(user4);
    }
```

```java
User{name='gakki3', age=18, address='冲绳岛'}
```

说明：json1字符串中，同时存在：name、user_name 、userName的情况，是以：json1中最后一个匹配的为主，此处是：userName。不是以：@SerializedName(value = "name", alternate = {"user_name", "userName", "Name"})中最后一个匹配为主！！！

比如：现在修改成：

```java
@SerializedName(value = "userName", alternate = {"user_name", "name", "Name"})
```

```java
User{name='gakki3', age=18, address='冲绳岛'}
```

结果还是：gakki3，和@SerializedName注解编写的顺序无关的，是以json字符串最后一个匹配的为主。

---

现在，修改json1中的顺序：

```java
    public static void parsePojo() {
        String json1 = "{\"userName\":\"gakki3\",\"user_name\":\"gakki2\",\"name\":\"gakki1\",\"age\":18,\"address\":\"冲绳岛\"}";
        //String json2 = "{\"user_name\":\"gakki2\",\"age\":18,\"address\":\"冲绳岛\"}";
        //String json3 = "{\"userName\":\"gakki3\",\"age\":18,\"address\":\"冲绳岛\"}";
        //String json4 = "{\"Name\":\"gakki4\",\"age\":18,\"address\":\"冲绳岛\"}";
        Gson gson = new Gson();
        User user1 = gson.fromJson(json1, User.class);
        //User user2 = gson.fromJson(json2, User.class);
        //User user3 = gson.fromJson(json3, User.class);
        //User user4 = gson.fromJson(json4, User.class);
        System.out.println(user1);
        //System.out.println(user2);
        //System.out.println(user3);
        //System.out.println(user4);
    }
```

```java
User{name='gakki1', age=18, address='冲绳岛'}
```

此时输出的结果就是：name中的value值。

---

#### @SerializedName最佳实践

现在，我们想重命名：序列化和反序列化，怎么办呢？

使用：@SerializedName注解的 value 来 控制 序列化的名字，alternate 来控制反序列化的名字：

反序列化：user_name

POJO: name

序列化：userName

```java
public class User {

    private int age;
    @SerializedName(value = "userName", alternate = {"user_name"})
    private String name;
    private String address;
}
```

```java
    public static void parsePojo() {
        String json = "{\"user_name\":\"gakki\",\"age\":18,\"address\":\"冲绳岛\"}";
        Gson gson = new Gson();
        User user = gson.fromJson(json, User.class);
        System.out.println(user);
        String userStr = gson.toJson(user);
        System.out.println(userStr);
    }
```

```java
User{name='gakki', age=18, address='冲绳岛'}
{"age":18,"userName":"gakki","address":"冲绳岛"}
```

#### @SerializedName总结

<font color="red">@SerializedName(value="序列化、反序列化默认名称",alternate={"反序列化名称备选"})</font>

#### GSON中泛型的使用

上面了解的JSON中的Number、boolean、Object和String，现在说一下Array。

例：JSON字符串数组

```java
["Android","Java","PHP"]
```

当我们要通过Gson解析这个json时，一般有两种方式：使用数组，使用List。而List对于增删都是比较方便的，所以实际使用是还是List比较多。

* 数组

```java
    public static void parseArrayJson() {
        String json = "[\"java\",\"c++\",\"PHP\"]";
        Gson gson = new Gson();
        String[] strings = gson.fromJson(json, String[].class);
        Arrays.stream(strings).forEach(System.out::println);
    }
```

```java
java
c++
PHP
```

* List

```java
    public static void parseListJson() {
        String json = "[\"java\",\"c++\",\"PHP\"]";
        Gson gson = new Gson();
        List strings = gson.fromJson(json, List.class);
        strings.forEach(System.out::println);
    }
```

```java
java
c++
PHP
```

如果把List带上泛型呢？

![](https://pic2.superbed.cn/item/5df5def1a4fbc8614a86decc.jpg)

直接编译器就出错了！！！！

为啥呢？

因为，对于Java来说`List<String>` 和`List<User>` 这俩个的字节码文件只有一个，那就是`List.class`，这是Java泛型使用时要注意的问题 **泛型擦除**。

为了解决的上面的问题，Gson为我们提供了`TypeToken`来实现对泛型的支持，所以当我们希望使用将以上的数据解析为`List<String>`时需要这样写。

```java
    public static void parseListFanJson() {
        String json = "[\"java\",\"c++\",\"PHP\"]";
        Gson gson = new Gson();
        Type type = new TypeToken<List<String>>() {
        }.getType();
        List<String> strings = gson.fromJson(json,type);
        strings.forEach(System.out::println);
    }
```

注意：`TypeToken`的构造方法是`protected`修饰的,所以上面才会写成`new TypeToken>() {}.getType()` 而不是  `new TypeToken>().getType()`

其实就是创建了TypeToken的匿名子类，和Thread线程一样，我们一般创建的都是Thread的匿名子类。

#### 泛型的好处

例如：我们处理完数据后，需要返回到前端：

```java
{"code":"0","message":"success","data":{}}
{"code":"0","message":"success","data":[]}
```

我们真正需要的`data`所包含的数据，而`code`只使用一次，`message`则几乎不用。如果Gson不支持泛型或不知道Gson支持泛型的同学一定会这么定义POJO。

```java
public class UserResponse {
    public int code;
    public String message;
    public User data;
}
```

当要返回其他接口的时候又重新定义一个`XXResponse`将`data`的类型改成XX，很明显`code`，和`message`被重复定义了多次，通过泛型的话我们可以将`code`和`message`字段抽取到一个`Result`的类中，这样我们只需要编写`data`字段所对应的POJO即可，更专注于我们的业务逻辑。如：

```java
public class Result<T> {
    public int code;
    public String message;
    public T data;
}
```

那么对于`data`字段是`User`时则可以写为 `Result<User>` ,当是个列表的时候为 `Result<List<User>>`，其它同理。

例子：

不使用泛型时：

```java
public class UserResult {
    public int code;
    public String message;
    public User data;
}
//=========
public class UserListResult {
    public int code;
    public String message;
    public List<User> data;
}
//=========
String json = "{..........}";
Gson gson = new Gson();
UserResult userResult = gson.fromJson(json,UserResult.class);
User user = userResult.data;

UserListResult userListResult = gson.fromJson(json,UserListResult.class);
List<User> users = userListResult.data;

```

上面有两个类`UserResult`和`UserListResult`，有两个字段重复，一两个接口就算了，如果有上百个怎么办?不得累死?所以引入泛型。

```java
//不再重复定义Result类
Type userType = new TypeToken<Result<User>>(){}.getType();
Result<User> userResult = gson.fromJson(json,userType);
User user = userResult.data;

Type userListType = new TypeToken<Result<List<User>>>(){}.getType();
Result<List<User>> userListResult = gson.fromJson(json,userListType);
List<User> users = userListResult.data;
```

看出区别了么?引入了泛型之后虽然要多写一句话用于获取泛型信息，但是返回值类型很直观，也少定义了很多无关类。