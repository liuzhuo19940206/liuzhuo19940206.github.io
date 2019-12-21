---
title: GSON的进阶<四>
author: gakkij
categories:
  - GSON
tags:
  - json
img: https://pic2.superbed.cn/item/5dfce51f76085c328950fcd4.jpg
top: false
cover: false
coverImg:
toc: true
date: 2019-12-21 10:07:34
summary: GSON的进阶四教程
password:
---

### TypeAdapter

`TypeAdapter` 是GSON自2.0（源码注释上说的是2.1）开始版本提供的一个抽象类，用于**接管某种类型的序列化和反序列化过程**，包含两个注要方法 `write(JsonWriter,T)` 和 `read(JsonReader)` 其它的方法都是`final`方法并最终调用这两个抽象方法。

```java
public abstract class TypeAdapter<T> {
    public abstract void write(JsonWriter out, T value) throws IOException;
    public abstract T read(JsonReader in) throws IOException;
    //其它final 方法就不贴出来了，包括`toJson`、`toJsonTree`、`toJson`和`nullSafe`方法。
}
```

**注意：**TypeAdapter 以及 JsonSerializer 和 JsonDeserializer 都需要与 `GsonBuilder.registerTypeAdapter` 或`GsonBuilder.registerTypeHierarchyAdapter`配合使用，下面将不再重复说明。

使用示例：

```java
        User user = new User();
        user.setUserName("gakki");
        user.setUserAge(18);
        user.setUserAddress("冲绳");

        Gson gson = new GsonBuilder().registerTypeAdapter(User.class, new UserTypeAdapter()).create();
        String json = gson.toJson(user);
        System.out.println(json);
```

UserTypeAdapter:

```java
public class UserTypeAdapter extends TypeAdapter<User> {

    @Override
    public void write(JsonWriter jsonWriter, User user) throws IOException {
        int userAge = user.getUserAge();
        String userName = user.getUserName();
        String userAddress = user.getUserAddress();
        jsonWriter.beginObject();
        jsonWriter.name("xxxx_age")
                .value(userAge + 3)
                .name("xxx_name")
                .value(userName + " love dj")
                .name("xxxx_address")
                .value(userAddress + " 东京");
        jsonWriter.endObject();
        jsonWriter.flush();

    }

    @Override
    public User read(JsonReader jsonReader) throws IOException {
        return null;
    }
}
```

```java
{"xxxx_age":21,"xxx_name":"gakki love dj","xxxx_address":"冲绳 东京"}
```

大家感受到了，TypeAdapter的强大的吧！[完全自定义，序列化和反序列化的过程，顺序，重命名，修改value值]。

注意：当我们为`User.class` 注册了 `TypeAdapter`之后，只要是操作`User.class` 那些之前介绍的`@SerializedName` 、`FieldNamingStrategy`、`@Since`、`@Until`、`@Expose`通通都黯然失色，失去了效果，只会调用我们实现的`UserTypeAdapter.write(JsonWriter, User)` 方法，我想怎么写就怎么写。

---

再说一个场景，在该系列的第一篇文章就说到了Gson有一定的容错机制，比如将字符串 `"24"` 转成int 的`24`,但如果有些情况下给你返了个空字符串怎么办（有人给我评论问到这个问题）?虽然这是服务器端的问题，但这里我们只是做一个示范。

int型会出错是吧，根据我们上面介绍的，我注册一个TypeAdapter 把 序列化和反序列化的过程接管不就行了?

```java
    public static void testInteger() {
        Gson gson = new Gson();
        Integer integer = gson.fromJson("''", int.class); // 和下面等同，都是空字符串的意思
        //Integer integer = gson.fromJson("\"\"", int.class); 
        System.out.println(integer);
    }
```

```java
Exception in thread "main" com.google.gson.JsonSyntaxException: java.lang.NumberFormatException: empty String
	at com.google.gson.internal.bind.TypeAdapters$7.read(TypeAdapters.java:228)
	at com.google.gson.internal.bind.TypeAdapters$7.read(TypeAdapters.java:218)
	at com.google.gson.Gson.fromJson(Gson.java:927)
	at com.google.gson.Gson.fromJson(Gson.java:892)
	at com.google.gson.Gson.fromJson(Gson.java:841)
	at com.google.gson.Gson.fromJson(Gson.java:813)
	at com.liuzhuo.gson.GsonDemo3.testInteger(GsonDemo3.java:135)
	at com.liuzhuo.gson.GsonDemo3.main(GsonDemo3.java:148)
Caused by: java.lang.NumberFormatException: empty String
	at sun.misc.FloatingDecimal.readJavaFormatString(FloatingDecimal.java:1842)
	at sun.misc.FloatingDecimal.parseDouble(FloatingDecimal.java:110)
	at java.lang.Double.parseDouble(Double.java:538)
	at com.google.gson.stream.JsonReader.nextInt(JsonReader.java:1201)
	at com.google.gson.internal.bind.TypeAdapters$7.read(TypeAdapters.java:226)
	... 7 more
```

报错了，说明默认反序列空串到int类型时是出错的，我们该怎么办呢？我们完全可以自定义int类型的序列化和反序列化。

```java
        Gson gson = new GsonBuilder().registerTypeAdapter(Integer.class, new TypeAdapter<Integer>() {

            @Override
            public void write(JsonWriter jsonWriter, Integer integer) throws IOException {

                //System.out.println(integer);
                if (integer == -1) {
                    jsonWriter.value(String.valueOf(integer + 10));
                } else {
                    jsonWriter.value(String.valueOf(integer));
                }
            }

            @Override
            public Integer read(JsonReader jsonReader) throws IOException {
                String s = jsonReader.nextString();
                try {
                    return Integer.parseInt(s);
                } catch (NumberFormatException e) {
                    return -1;
                }
            }
        }).create();

        Integer integer = gson.fromJson("\"\"", Integer.class);
        System.out.println(integer);
        String json = gson.toJson(-1);
        System.out.println(json);
```

```java
-1
"9"
```

当反序化的int类型是空串时，我进行Integer.parseInt解析时就出抛出异常，然后返回-1。

当序列化-1时，我们直接加了10。

完全自控有没有！！！这里注意的是：jsonWriter使用时，如果没有name的要求，就不需要写，如果你写了begin，就必须写name！！！

---

注：测试空串的时候一定是`"\"\""`而不是`""`，`""`代表的是没有json串，`"\"\""`才代表json里的`""`。

你说这一接管就要管两样好麻烦呀，我明明只想管序列化（或反列化）的过程的，另一个过程我并不关心，难道没有其它更简单的方法么? 当然有！就是接下来要介绍的 **JsonSerializer与JsonDeserializer**。

### JsonSerializer与JsonDeserializer

`JsonSerializer` 和`JsonDeserializer` 不用像`TypeAdapter`一样，必须要实现序列化和反序列化的过程，你可以据需要选择，如只接管序列化的过程就用 `JsonSerializer` ，只接管反序列化的过程就用 `JsonDeserializer` ，如上面的需求可以用下面的代码。

```java
Gson gson = new GsonBuilder()
        .registerTypeAdapter(Integer.class, new JsonDeserializer<Integer>() {
            @Override
            public Integer deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
                try {
                    return json.getAsInt();
                } catch (NumberFormatException e) {
                    return -1;
                }
            }
        })
        .create();
System.out.println(gson.toJson(100)); //结果：100
System.out.println(gson.fromJson("\"\"", Integer.class)); //结果-1
```

下面是所有数字都转成序列化为字符串的例子:

```java
JsonSerializer<Number> numberJsonSerializer = new JsonSerializer<Number>() {
    @Override
    public JsonElement serialize(Number src, Type typeOfSrc, JsonSerializationContext context) {
        return new JsonPrimitive(String.valueOf(src));
    }
};
Gson gson = new GsonBuilder()
        .registerTypeAdapter(Integer.class, numberJsonSerializer)
        .registerTypeAdapter(Long.class, numberJsonSerializer)
        .registerTypeAdapter(Float.class, numberJsonSerializer)
        .registerTypeAdapter(Double.class, numberJsonSerializer)
        .create();
System.out.println(gson.toJson(100.0f));//结果："100.0"
```

注：`registerTypeAdapter`必须使用包装类型，所以`int.class`,`long.class`,`float.class`和`double.class`是行不通的。同时不能使用父类来替上面的子类型，这也是为什么要分别注册而不直接使用`Number.class`的原因。

上面特别说明了`registerTypeAdapter`不行，那就是有其它方法可行咯?当然！换成**`registerTypeHierarchyAdapter` **就可以使用`Number.class`而不用一个一个的当独注册啦！

**registerTypeAdapter与registerTypeHierarchyAdapter的区别：**

|          | **registerTypeAdapter** | **registerTypeHierarchyAdapter** |
| -------- | ----------------------- | -------------------------------- |
| 支持泛型 | 是                      | 否                               |
| 支持继承 | 否                      | 是                               |

---

注：如果一个被序列化的对象本身就带有泛型，且注册了相应的`TypeAdapter`，那么必须调用`Gson.toJson(Object,Type)`，明确告诉Gson对象的类型。

### TypeAdapterFactory

TypeAdapterFactory,见名知意，用于创建TypeAdapter的工厂类，通过对比`Type`，确定有没有对应的`TypeAdapter`，没有就返回null，与`GsonBuilder.registerTypeAdapterFactory`配合使用。

```java
Gson gson = new GsonBuilder()
    .registerTypeAdapterFactory(new TypeAdapterFactory() {
        @Override
        public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> type) {
            return null;
        }
    })
    .create();
```

**注意：**`JsonAdapter`的优先级比`GsonBuilder.registerTypeAdapter`的优先级更高。

### @JsonAdapter注解

`JsonAdapter`相较之前介绍的`SerializedName` 、`FieldNamingStrategy`、`Since`、`Until`、`Expos`这几个注解都是比较特殊的，其它的几个都是用在POJO的字段上，而这一个是用在POJO类上的，接收一个参数，且必须是`TypeAdpater`，`JsonSerializer`或`JsonDeserializer`这三个其中之一。

上面说`JsonSerializer`和`JsonDeserializer`都要配合`GsonBuilder.registerTypeAdapter`使用，但每次使用都要注册也太麻烦了，`JsonAdapter`就是为了解决这个痛点的。

使用方法（以User为例）：

```java
@JsonAdapter(UserTypeAdapter.class) //加在类上
public class User {
    public User() {
    }
    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }
    public User(String name, int age, String email) {
        this.name = name;
        this.age = age;
        this.email = email;
    }
    public String name;
    public int age;
    @SerializedName(value = "emailAddress")
    public String email;
}
```

使用时不用再使用 `GsonBuilder`去注册`UserTypeAdapter`了。
 **注：** `@JsonAdapter` 仅支持 `TypeAdapter`或`TypeAdapterFactory`( 2.7开始已经支持 JsonSerializer/JsonDeserializer)

```java
Gson gson = new Gson();
User user = new User("怪盗kidou", 24, "ikidou@example.com");
System.out.println(gson.toJson(user));
//结果：{"name":"怪盗kidou","age":24,"email":"ikidou@example.com"}
//为区别结果，特意把email字段与@SerializedName注解中设置的不一样
```

**注意：**`@JsonAdapter`的优先级比`GsonBuilder.registerTypeAdapter`的优先级更高。

### TypeAdapter实例

注：这里的TypeAdapter泛指`TypeAdapter`、`JsonSerializer`和`JsonDeserializer`。
 这里的TypeAdapter 上面讲了一个自动将 字符串形式的数值转换成int型时可能出现 空字符串的问题，下面介绍一个其它读者的需求：

服务器返回的数据中data字段类型不固定，比如请求成功data是一个List,不成功的时候是String类型，这样前端在使用泛型解析的时候，怎么去处理呢？

其实这个问题的原因主要由服务器端造成的，接口设计时没有没有保证数据的一致性，正确的数据返回姿势：**同一个接口任何情况下不得改变返回类型，要么就不要返，要么就返空值，如`null`、`[]`,`{}`**。

方案一：

```java
Gson gson = new GsonBuilder().registerTypeHierarchyAdapter(List.class, new JsonDeserializer<List<?>>() {
    @Override
    public List<?> deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
        if (json.isJsonArray()){
            //这里要自己负责解析了
            Gson newGson = new Gson();
            return newGson.fromJson(json,typeOfT);
        }else {
            //和接口类型不符，返回空List
            return Collections.EMPTY_LIST;
        }
    }
}).create();
```

方案二：

```java
 Gson gson = new GsonBuilder().registerTypeHierarchyAdapter(List.class, new JsonDeserializer<List<?>>() {
    @Override
    public List<?> deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
        if (json.isJsonArray()) {
            JsonArray array = json.getAsJsonArray();
            Type itemType = ((ParameterizedType) typeOfT).getActualTypeArguments()[0];
            List list = new ArrayList<>();
            for (int i = 0; i < array.size(); i++) {
                JsonElement element = array.get(i);
                Object item = context.deserialize(element, itemType);
                list.add(item);
            }
            return list;
        } else {
            //和接口类型不符，返回空List
            return Collections.EMPTY_LIST;
        }
    }
}).create();
```

要注意的点：

- 必须使用`registerTypeHierarchyAdapter`方法，不然对List的子类无效，但如果POJO中都是使用List，那么可以使用`registerTypeAdapter`。
- 于是数组的情况，需要创建一个新的Gson，不可以直接使用context,不然gson又会调我们自定义的`JsonDeserializer`造成递归调用，方案二没有重新创建Gson，那么就需要提取出List<E>中E的类型，然后分别反序列化适合为E手动注册了TypeAdaper的情况。
- 从效率上推荐方案二，免去重新实例化Gson和注册其它TypeAdapter的过程。