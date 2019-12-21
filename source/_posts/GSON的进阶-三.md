---
title: GSON的进阶<三>
author: gakkij
categories:
  - GSON
tags:
  - json
img: https://gakkil.gitee.io/gakkil-image/gakki_image/IMG_2874.jpg
top: false
cover: false
coverImg:
toc: true
date: 2019-12-20 23:00:53
summary: GSON的进阶三教程
password:
---

### 过滤的几种方法

字段过滤是Gson中比较常用的技巧，特别是在Android中，在处理业务逻辑时可能需要在设置的POJO中加入一些字段，但显然在序列化的过程中是不需要的，并且如果序列化还可能带来一个问题就是 **循环引用** ，那么在用Gson序列化之前为了防止这样的事件情发生，你不得不作另外的处理。

以一个商品分类`Category` 为例。

```java
{
  "id": 1,
  "name": "电脑",
  "children": [
    {
      "id": 100,
      "name": "笔记本"
    },
    {
      "id": 101,
      "name": "台式机"
    }
  ]
}
```

一个大分类，可以有很多小分类，那么显然我们在设计`Category`类时`Category`本身既可以是大分类，也可以是小分类。

```java
public class Category {
    public int id;
    public String name;
    public List<Category> children;
}
```

但是为了处理业务，我们还需要在子分类中保存父分类，最终会变成下面的情况

```java
public class Category {
    public int id;
    public String name;
    public List<Category> children;
    //因业务需要增加，但并不需要序列化
    public Category parent; 
}
```

但是上面的`parent`字段是因业务需要增加的，那么在序列化是并不需要，所以在序列化时就必须将其排除，那么在`Gson`中如何排除符合条件的字段呢?下面提供4种方法，大家可根据需要自行选择合适的方式。

---

#### 基于@Expose注解

**@Expose**提供了两个属性，且都有默认值，开发者可以根据需要设置不同的值。

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface Expose {
    boolean serialize() default true;

    boolean deserialize() default true;
}

```

**@Expose** 注解从名字上就可以看出是**暴露**的意思，所以该注解是用于对外暴露字段的。可是我们以前用Gson的时候也没有使用**@Expose** 注解，但是还不是可以正确的序列化为JSON嘛? 是的，所以<font color="red">该注解在使用`new Gson()` 时是不会发生作用</font>。毕竟最常用的API要最简单，所以该注解必须和`GsonBuilder`配合使用。

**使用方法：** 简单说来就是需要导出的字段上加上**@Expose** 注解，不导出的字段不加。注意是**不导出的不加**。

```java
@Expose //默认值是，序列化和反序列都为true
@Expose(deserialize = true,serialize = true) //序列化和反序列化都都生效，等价于上一条
@Expose(deserialize = true,serialize = false) //反序列化时生效
@Expose(deserialize = false,serialize = true) //序列化时生效
@Expose(deserialize = false,serialize = false) // 和不写注解一样
```

注：根据上面可以得出，所有值为`true`的属性都是可以不写的（默认值是true）。

---

拿上面的例子来说就是

```java
public class Category {
    @Expose public int id;
    @Expose public String name;
    @Expose public List<Category> children;
    //不需要序列化,所以不加 @Expose 注解，
    //等价于 @Expose(deserialize = false,serialize = false)
    public Category parent; 
}
```

```java
        Category category = new Category();
        Gson gson = new GsonBuilder().serializeNulls().excludeFieldsWithoutExposeAnnotation().create();
        String json = gson.toJson(category);
        System.out.println(json);
```

```java
{"id":0,"name":null,"children":null}
```

因为，parent没有加上@Expose注解，所以不会被序列化。

#### 基于版本

Gson在对基于版本的字段导出提供了两个注解 `@Since` 和 `@Until`,和`GsonBuilder.setVersion(Double double)`配合使用。`@Since` 和 `@Until`都接收一个`Double`值。

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.TYPE})
public @interface Since {
    double value();
}
```

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.TYPE})
public @interface Until {
    double value();
}
```

使用方法：当前版本(GsonBuilder中设置的版本) **大于等于Since**的值时该字段导出，**小于Until**的值时该该字段导出。

```java
class SinceUntilSample {
    @Since(4)
    public String since;
    @Until(5)
    public String until;
}

public void sineUtilTest(double version){
        SinceUntilSample sinceUntilSample = new SinceUntilSample();
        sinceUntilSample.since = "since";
        sinceUntilSample.until = "until";
        Gson gson = new GsonBuilder().setVersion(version).create();
        System.out.println(gson.toJson(sinceUntilSample));
}
//当version <4时，结果：{"until":"until"}
//当version >=4 && version <5时，结果：{"since":"since","until":"until"}
//当version >=5时，结果：{"since":"since"}
```

注：当一个字段被同时注解时，需两者同时满足条件。

#### 基于访问修饰符

什么是修饰符? `public`、`static` 、`final`、`private`、`protected` 这些就是，所以这种方式也是比较特殊的。
使用方式：

```java
class ModifierSample {
    final String finalField = "final";
    static String staticField = "static";
    public String publicField = "public";
    protected String protectedField = "protected";
    String defaultField = "default";
    private String privateField = "private";
}
```

使用`GsonBuilder.excludeFieldsWithModifiers`构建gson,支持`int`形的**可变参数**，值由`java.lang.reflect.Modifier`提供，下面的程序排除了`privateField` 、 `finalField` 和`staticField` 三个字段。

```java
ModifierSample modifierSample = new ModifierSample();
Gson gson = new GsonBuilder()
        .excludeFieldsWithModifiers(Modifier.FINAL, Modifier.STATIC, Modifier.PRIVATE)
        .create();
System.out.println(gson.toJson(modifierSample));
// 结果：{"publicField":"public","protectedField":"protected","defaultField":"default"}
```

到此为止，Gson提供的所有注解就还有一个`@JsonAdapter`没有介绍了，而`@JsonAdapter`将和`TypeAdapter`将作为该系列第4篇也是最后一篇文章的主要内容。

注意：<font color="red">使用基于修饰符的策略后，会覆盖默认的修饰词transient修饰词的座椅，即：transient将会失效！</font>

#### 基于策略（自定义规则）

上面介绍了3种排除字段的方法，说实话我除了@Expose以外，其它的都是只在Demo用上过，用得最多的就是马上要介绍的自定义规则，好处是功能强大、灵活，缺点是相比其它3种方法稍麻烦一点，但也仅仅只是想对其它3种稍麻烦一点而已。

基于策略是利用Gson提供的`ExclusionStrategy`接口，同样需要使用`GsonBuilder`,相关API 2个，分别是`addSerializationExclusionStrategy` 和`addDeserializationExclusionStrategy` 分别针对序列化和反序化时。这里以序列化为例。

```java
Gson gson = new GsonBuilder()
        .addSerializationExclusionStrategy(new ExclusionStrategy() {
            @Override
            public boolean shouldSkipField(FieldAttributes f) {
                // 这里作判断，决定要不要排除该字段,return true为排除
                if ("finalField".equals(f.getName())) return true; //按字段名排除
                Expose expose = f.getAnnotation(Expose.class); 
                if (expose != null && expose.deserialize() == false) return true; //按注解排除
                return false;
            }
            @Override
            public boolean shouldSkipClass(Class<?> clazz) {
                // 直接排除某个类 ，return true为排除
                return (clazz == int.class || clazz == Integer.class);
            }
        })
        .create();
```

Test:

```java
        Category category = new Category();
        User user = new User();
        Gson gson = new GsonBuilder().
                addSerializationExclusionStrategy(new ExclusionStrategy() {
                    @Override
                    public boolean shouldSkipField(FieldAttributes fieldAttributes) {
                        return false;
                    }

                    @Override
                    public boolean shouldSkipClass(Class<?> aClass) {
                        if (aClass.getName().equals("com.liuzhuo.gson.domain.Category")) {
                            return true;
                        }
                        return false;
                    }
                }).serializeNulls().create();
        String json = gson.toJson(category);
        String toJson = gson.toJson(user);
        System.out.println(json);
        System.out.println(toJson);
```

```java
null
{"age":0,"userName":null,"address":null,"birthday":null}
```

Category该类被排除了，而User类没有被排除掉。

```java
        Category category = new Category();
        User user = new User();
        Gson gson = new GsonBuilder().
                addSerializationExclusionStrategy(new ExclusionStrategy() {
                    @Override
                    public boolean shouldSkipField(FieldAttributes fieldAttributes) {

                        if (fieldAttributes.getName().equals("name")) {
                            return true;
                        }
                        return false;
                    }

                    @Override
                    public boolean shouldSkipClass(Class<?> aClass) {
                        return false;
                    }
                }).serializeNulls().create();
        String json = gson.toJson(category);
        String toJson = gson.toJson(user);
        System.out.println(json);
        System.out.println(toJson);
```

User 和 Category 都有name字段因此，两个类的name都被排除掉了。

---

```java
        Category category = new Category();
        User user = new User();
        Gson gson = new GsonBuilder().
                addSerializationExclusionStrategy(new ExclusionStrategy() {
                    @Override
                    public boolean shouldSkipField(FieldAttributes fieldAttributes) {

                        System.out.println(fieldAttributes.getName());
//                        if (fieldAttributes.getName().equals("id")) {
//                            return true;
//                        }
                        return false;
                    }

                    @Override
                    public boolean shouldSkipClass(Class<?> aClass) {
                        return false;
                    }
                }).serializeNulls().create();
        String json = gson.toJson(category);
        String toJson = gson.toJson(user);
        System.out.println(json);
        System.out.println(toJson);
```

```java
id
name
children
parent
age
name
address
birthday
{"id":0,"name":null,"children":null,"parent":null}
{"age":0,"userName":null,"address":null,"birthday":null}
```

fieldAttributes : 是序列化类中的每一个属性。

---

```java
        Category category = new Category();
        User user = new User();
        Gson gson = new GsonBuilder().
                addSerializationExclusionStrategy(new ExclusionStrategy() {
                    @Override
                    public boolean shouldSkipField(FieldAttributes fieldAttributes) {

                        //System.out.println(fieldAttributes.getName());
//                        if (fieldAttributes.getName().equals("id")) {
//                            return true;
//                        }
                        return false;
                    }

                    @Override
                    public boolean shouldSkipClass(Class<?> aClass) {
                        System.out.println(aClass);
                        return false;
                    }
                }).serializeNulls().create();
        String json = gson.toJson(category);
        String toJson = gson.toJson(user);
        System.out.println(json);
        System.out.println(toJson);
```

```java
class com.liuzhuo.gson.domain.Category
int
int
class java.lang.String
class java.lang.String
interface java.util.List
interface java.util.List
class com.liuzhuo.gson.domain.Category
class java.lang.Integer
class com.liuzhuo.json.domain.User
int
class java.lang.String
class java.lang.String
class java.util.Date
class java.util.Date
{"id":0,"name":null,"children":null,"parent":null}
{"age":0,"userName":null,"address":null,"birthday":null}
```

这里将所有的类型都打印出来了，但是为啥会有两个 int ，博主也不清楚，QAQ~~~。

#### 基于transient关键字

```java
public class Category {

    private transient int id;
    private String name;
    private List<Category> children;
    private Category parent;

}
```

这里：id 加上了 transient 关键字。

```java
Category category = new Category();
        Gson gson = new GsonBuilder().serializeNulls().create();
        String s = gson.toJson(category);
        System.out.println(s);
```

```java
{"name":null,"children":null,"parent":null}
```

很明显，id没有被序列化。

注意：`被transient修饰的属性，反序列化也不能成功的。`

### POJO与JSON的字段映射规则

之前在属性重命名时 介绍了`@SerializedName`这个注解的使用，本节的内容与上一次差不多的，但既然叫**映射规则**那么说的自然是有规律的情况。
 还是之前User的例子，已经去除所有注解：

```java
User user = new User("gakki", 18);
user.emailAddress = "gakkij@example.com";
```

`GsonBuilder`提供了`FieldNamingStrategy`接口和`setFieldNamingPolicy`和`setFieldNamingStrategy` 两个方法。

`setFieldNamingPolicy`: 命名政策

`setFieldNamingStrategy`：命名战略

#### 默认实现

`GsonBuilder.setFieldNamingPolicy` 方法与Gson提供的另一个枚举类`FieldNamingPolicy`配合使用，该枚举类提供了5种实现方式分别为：

| **FieldNamingPolicy**        | **结果（仅输出emailAddress字段）**    |
| ---------------------------- | ------------------------------------- |
| IDENTITY                     | {"emailAddress":"gakki@example.com"}  |
| LOWER_CASE_WITH_DASHES       | {"email-address":"gakki@example.com"} |
| LOWER_CASE_WITH_UNDERSCORES  | {"email_address":"gakki@example.com"} |
| UPPER_CAMEL_CASE             | {"EmailAddress":"gakki@example.com"}  |
| UPPER_CAMEL_CASE_WITH_SPACES | {"Email Address":"gakki@example.com"} |

注意：这里的命名规则必须是：小写开头的驼峰命名才行！！！，例如：`emailAddress`

#### 自定义实现

`GsonBuilder.setFieldNamingStrategy` 方法需要与Gson提供的`FieldNamingStrategy`接口配合使用，用于实现将POJO的字段与JSON的字段相对应。上面的`FieldNamingPolicy`实际上也实现了`FieldNamingStrategy`接口，也就是说`FieldNamingPolicy`也可以使用`setFieldNamingStrategy`方法。

用法：

```java
Gson gson = new GsonBuilder()
        .setFieldNamingStrategy(new FieldNamingStrategy() {
            @Override
            public String translateName(Field f) {
                //实现自己的规则
                return null;
            }
        })
        .create();
```

**注意：** `@SerializedName`注解拥有最高优先级，在加有`@SerializedName`注解的字段上`FieldNamingStrategy`不生效！

```java
        User user = new User();
        user.setUserAge(18);
        user.setUserName("gakki");
        user.setUserAddress("东京");
        Gson gson = new GsonBuilder().setFieldNamingStrategy(new FieldNamingStrategy() {
            @Override
            public String translateName(Field field) {
                if (field.getName().equals("userAge")) {
                    return "gakkiAge";
                } else if (field.getName().equals("userName")) {
                    return "gakkiName";
                }
                return field.getName();
            }
        }).create();
        String s = gson.toJson(user);
        System.out.println(s);
```

```java
{"gakkiAge":18,"gakkiName":"gakki","userAddress":"东京"}
```

---

```java
public class User {

    private int userAge;
    @SerializedName(value = "gakki_name")
    private String userName;
    private String userAddress;
}
```

```java
{"gakkiAge":18,"gakki_name":"gakki","userAddress":"东京"}
```

证明：@SerializedName的优先级是最高的！！！

---

### 最佳实践

GSON的排除不必要的序列化时，需要在所有的需要序列化上面加上@Expose注解，确实不方便，因为一般情况下，都是少数不需要序列化，因此会添加很多@Expose注解，麻烦！有什么方法来减少这种操作呢？

使用基于策略的方法，自己创建一个注解用来排除掉不需要序列化的字段。

```java
public class User {

    @FilterAnnotation()
    private int userAge;
    private String userName;
    private String userAddress;
}
```

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
public @interface FilterAnnotation {
    String value() default "";
}
```

```java
        User user = new User();
        user.setUserName("gakki");
        user.setUserAge(18);
        user.setUserAddress("冲绳");
        Gson gson = new GsonBuilder().addSerializationExclusionStrategy(new ExclusionStrategy() {
            @Override
            public boolean shouldSkipField(FieldAttributes fieldAttributes) {
                //根据字段上面有么有注解来过滤
                FilterAnnotation annotation = fieldAttributes.getAnnotation(FilterAnnotation.class);
                if (annotation != null) {
                    return true;
                }
                return false;
            }

            @Override
            public boolean shouldSkipClass(Class<?> aClass) {
                return false;
            }
        }).create();
        String json = gson.toJson(user);
        System.out.println(json);
```

```java
{"userName":"gakki","userAddress":"冲绳"}
```

因为，userAge上面有：FilterAnnotation因此被过滤掉了，不再被序列化了。

这样，就不需要在需要的字段上面通通加上@Expose来进行序列化了，减少了不必要的工作量。