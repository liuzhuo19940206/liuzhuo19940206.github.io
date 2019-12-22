---
title: FastJson的进阶<二>
author: gakkij
categories:
  - FastJson
tags:
  - json
img: https://pic1.superbed.cn/item/5dff3bee76085c328944382a.jpg
top: false
cover: false
coverImg: 
toc: true
date: 2019-12-22 17:44:09
summary: FastJson的进阶二教程
password:
---

根据前面的FastJson的学习，我们已经掌握了FastJson的基础用法了，可以完成我们的日常开发了，今天我们来学习FastJson中的几个注解的用法

### **JSONField 介绍**

注意：1、若属性是私有的，必须有set*方法。否则无法反序列化。

JSONField注解：

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER})
public @interface JSONField {
    // 配置序列化和反序列化的顺序，1.1.42版本之后才支持
    int ordinal() default 0;
    // 指定字段的名称
    String name() default "";
    // 指定字段的格式，对日期格式有用
    String format() default "";
    // 是否序列化
    boolean serialize() default true;
    // 是否反序列化
    boolean deserialize() default true;
    // 指定对该字段的特性
    SerializerFeature[] serialzeFeatures() default {};

    Feature[] parseFeatures() default {};

    String label() default "";

    boolean jsonDirect() default false;
    // 指定使用的序列化类
    Class<?> serializeUsing() default Void.class;
    // 指定使用的反序列化的类
    Class<?> deserializeUsing() default Void.class;
    // 别名
    String[] alternateNames() default {};

    boolean unwrapped() default false;
}
```

### **JSONField 配置方式**

可以配置在getter/setter方法或者字段上。例如：

#### **配置在getter/setter上**

```java
    public class User {

    private int id;
    private String name;
    private String address;
    @JSONField(name = "My_id")
    public int getId() {
        return id;
    }
    @JSONField(name = "My_id")
    public void setId(int id) {
        this.id = id;
    }
    省略了其他字段的set、get方法,toString方法
  }
```

```java
        String json = "{'My_id':18,'name':'gakki'}";
        User user = JSON.parseObject(json, User.class);
        System.out.println(user);

        String userStr = JSON.toJSONString(user);
        System.out.println(userStr);
```

```java
User{id=18, name='gakki', address='null'}
{"My_id":18,"name":"gakki"}
```

这里的@JSONField注解，就和GSON中的@SerializedName(value = "My_id")一样，修改了反序列化的key。

@JSONField注解在set方法上：是反序列化的作用，@JSONField注解在get方法上：是序列化的作用。

---

去掉id的set上面的注解后：

```java
    public class User {

    private int id;
    private String name;
    private String address;
    @JSONField(name = "My_id")
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
    省略了其他字段的set、get方法，toString方法
  }
```

```java
User{id=0, name='gakki', address='null'}
{"My_id":0,"name":"gakki"}
```

反序列化失败，因为json字符串中是My_id，不能和User中的id想匹配！

---

去掉id的get上面的注解后：

```java
    public class User {

    private int id;
    private String name;
    private String address;

    public int getId() {
        return id;
    }
    @JSONField(name = "My_id")
    public void setId(int id) {
        this.id = id;
    }
    省略了其他字段的set、get方法，toString方法
  }
```

```java
User{id=18, name='gakki', address='null'}
{"id":18,"name":"gakki"}
```

可以看到，反序列化成功，序列化时还是使用的id！！！

---

#### **配置在field上**

和配置在set、get方法一样，只是配置在field上，相当于在set、get上面配置了，即：反序列化和序列化都起作用。

```java
public class User {

    @JSONField(name = "My_id")
    private int id;
    private String name;
    private String address;
    省略字段的set、get方法，toString方法
}
```

```java
        String json = "{'My_id':18,'name':'gakki'}";
        User user = JSON.parseObject(json, User.class);
        System.out.println(user);

        String userStr = JSON.toJSONString(user);
        System.out.println(userStr);
```

```java
User{id=18, name='gakki', address='null'}
{"My_id":18,"name":"gakki"}
```

---

验证：当我们javaBean对象的属性使用：private修饰时，不配置set、get方法，看FastJson是否能正确的反序列化和序列化成功。

```java
public class Person {

    private int id;
    private String name;
    private String address;

    @Override
    public String toString() {
        return "Person{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                '}';
    }
}
```

```java
        String json = "{'id':18,'name':'gakki'}";
        Person person = JSON.parseObject(json, Person.class);
        System.out.println(person);
        String s = JSON.toJSONString(person);
        System.out.println(s);
```

```java
Person{id=0, name='null', address='null'}
{}
```

发现，不配置私有属性的get和set方法，反序列化和序列化是失败的！！！

---

我们加上构造方法呢？

```java
public class Person {

    private int id;
    private String name;
    private String address;

    public Person(int id, String name, String address) {
        this.id = id;
        this.name = name;
        this.address = address;
    }

    @Override
    public String toString() {
        return "Person{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                '}';
    }
}
```

```java
Person{id=18, name='gakki', address='null'}
{}
```

发现，反序列化成功了，但是序列化失败了，加上构造方法后，就会使用构造方法来反序列化了，和加上set方法是同样的作用。

#### **使用format配置日期格式化**

```java
public class Person {

    private int id;
    private String name;
    private String address;
    @JSONField(format="yyyyMMdd")
    private Date birthday;
    
    ···
}
```

```java
        String json = "{'id':18,'name':'gakki','birthday':'20191222'}";
        Person person = JSON.parseObject(json, Person.class);
        System.out.println(person);
        String s = JSON.toJSONString(person);
        System.out.println(s);
```

```java
Person{id=18, name='gakki', address='null', birthday=Sun Dec 22 00:00:00 CST 2019}
{"birthday":"20191222","id":18,"name":"gakki"}
```

可以看到，json字符串中的birthday字符串格式的日期，反序列化成功为Person对象中的Date类型，序列化时又变成了我们配置的格式。

#### **使用serialize/deserialize指定字段不序列化**

```java
public class Person {

    @JSONField(serialize = false)
    private int id;
    @JSONField(deserialize = false)
    private String name;
    private String address;
    @JSONField(format = "yyyyMMdd")
    private Date birthday;

    public Person() {
    }
    
    ···
 }
```

```java
        String json = "{'id':18,'name':'gakki','birthday':'20191222'}";
        Person person = JSON.parseObject(json, Person.class);
        System.out.println(person);
        String s = JSON.toJSONString(person,SerializerFeature.WriteMapNullValue);
        System.out.println(s);
```

```java
Person{id=18, name='null', address='null', birthday=Sun Dec 22 00:00:00 CST 2019}
{"address":null,"birthday":"20191222","name":null}
```

说明：id反序列化成功为18，但是禁止序列化，没有输出，name反序列化失败，允许序列化。

默认情况下：serialize 和 deserialize 都是 true。

注意：<font color="red">**当你写了javaBean的有参的构造函数后，必须补全无参的构造函数**！！！</font>

---

如果，我们想指定某些属性为null序列化，其他为null的属性不序列化，该怎么办呢？

```java
public class Person {

    @JSONField(serialize = false)
    private int id;
    @JSONField(deserialize = false,serialzeFeatures = {SerializerFeature.WriteMapNullValue})
    private String name;
    private String address;
    @JSONField(format = "yyyyMMdd")
    private Date birthday;

    public Person() {
    }
    ···
 }
```

```java
    public static void testPerson() {

        String json = "{'id':18,'name':'gakki','birthday':'20191222'}";
        Person person = JSON.parseObject(json, Person.class);
        System.out.println(person);
        String s = JSON.toJSONString(person);
        System.out.println(s);
    }
```

```java
Person{id=18, name='null', address='null', birthday=Sun Dec 22 00:00:00 CST 2019}
{"birthday":"20191222","name":null}
```

这里，我们在name属性上，配置了：serialzeFeatures = {SerializerFeature.WriteMapNullValue 。

在JSON.toJSONString()时，没有配置SerializerFeature.WriteMapNullValue。此时只会当name为null时，才会输出null，address为null，不会输出。

JSON.toJSONString() 配置：SerializerFeature 是全局的作用，即所有的属性都起作用，对当个属性使用@JSONField注解来配置SerializerFeature只对当前的属性起作用。

---

#### **使用ordinal指定字段的顺序**

```java
public class Person {
    
    private int id;
    private String name;
    private String address;
    @JSONField(format = "yyyyMMdd")
    private Date birthday;

    public Person() {
    }
}
```

```java
        String json = "{'id':18,'name':'gakki','birthday':'20191222'}";
        Person person = JSON.parseObject(json, Person.class);
        System.out.println(person);
        String s = JSON.toJSONString(person);
        System.out.println(s);
```

```java
Person{id=18, name='gakki', address='null', birthday=Sun Dec 22 00:00:00 CST 2019}
{"birthday":"20191222","id":18,"name":"gakki"}
```

此时序列化的顺序，应该是按照英文字母的顺序，birthday因为是b开头是最早的，所以序列化时排在第一位。

```java
public class Person {

    @JSONField(ordinal = 1)
    private int id;
    @JSONField(ordinal = 2)
    private String name;
    @JSONField(ordinal = 3)
    private String address;
    @JSONField(ordinal = 4,format = "yyyyMMdd")
    private Date birthday;

    public Person() {
    }
 }
```

```java
Person{id=18, name='gakki', address='null', birthday=Sun Dec 22 00:00:00 CST 2019}
{"id":18,"name":"gakki","birthday":"20191222"}
```

此时，按照：ordinal给定的顺序来序列化，ordinal值越小越先被序列化。

<font color="red">这是：FastJson相对于GSON的优势，GSON中没有注解来配置序列化的顺序，必须重新配置序列化解析器来自定义顺序，比较麻烦。</font>

---

#### **使用serializeUsing制定属性的序列化类**

```java
public class Person {

    @JSONField(ordinal = 1)
    private int id;
    @JSONField(ordinal = 2, serializeUsing = NameSerialized.class)
    private String name;
    @JSONField(ordinal = 3)
    private String address;
    @JSONField(ordinal = 4, format = "yyyyMMdd")
    private Date birthday;

    public Person() {
    }
}
```
单独给name属性配置序列化类：NameSerialized 【实现ObjectSerializer接口】

```java
public class NameSerialized implements ObjectSerializer {
    @Override
    public void write(JSONSerializer jsonSerializer, Object object, Object fieldName, Type fieldType, int features) throws IOException {
        System.out.println(object);
        System.out.println(fieldName);
        System.out.println(fieldType.getTypeName());
        System.out.println(features);

        jsonSerializer.write("你名字是");
    }
}
```

```java
        String json = "{'id':18,'name':'gakki','birthday':'20191222'}";
        Person person = JSON.parseObject(json, Person.class);
        System.out.println(person);
        String s = JSON.toJSONString(person);
        System.out.println(s);
```

```java
Person{id=18, name='gakki', address='null', birthday=Sun Dec 22 00:00:00 CST 2019}
gakki
name
java.lang.String
0
{"id":18,"name":"你名字是","birthday":"20191222"}
```

说明：write函数中，第一个参数是：jsonSerializer 序列化器，使用其来进行序列化的，第二个参数就是 name属性的值，第三个Object是 name属性的名字，第四个参数是name属性的类型，此处是String类型，第五个参数，features是序列化时的顺序，即：第几个被序列化的，此处是对name单独进行序列化的，所以是0。（默认是从0开始的）。

#### **使用deserializeUsing制定属性的反序列化类**

```java
public class Person {

    @JSONField(ordinal = 1, deserializeUsing = IdDeserialized.class)
    private int id;
    @JSONField(ordinal = 2)
    private String name;
    @JSONField(ordinal = 3)
    private String address;
    @JSONField(ordinal = 4, format = "yyyyMMdd")
    private Date birthday;

    public Person() {
    }
  }
```

IdDeserialized 实现：ObjectDeserializer 接口

```java
public class IdDeserialized implements ObjectDeserializer {

    @Override
    public <T> T deserialze(DefaultJSONParser parser, Type type, Object fieldName) {
        System.out.println(type.getTypeName());
        System.out.println(fieldName);
        Object o = parser.parse(fieldName);
        System.out.println(o);
        Integer value = null;
        if (o instanceof Integer) {
            value = (Integer) o;
            value += 20;
        }
        return (T) value;

    }

    @Override
    public int getFastMatchToken() {
        return 0;
    }

}
```

```java
        String json = "{'id':20,'name':'gakki','birthday':'20191222'}";
        Person person = JSON.parseObject(json, Person.class);
        System.out.println(person);
        String s = JSON.toJSONString(person);
        System.out.println(s);
```

```java
int
id
20
Person{id=40, name='gakki', address='null', birthday=Sun Dec 22 00:00:00 CST 2019}
{"id":40,"name":"gakki","birthday":"20191222"}
```

此时：id原来的值为：20，我们自定义的反序列化类将其加了20，最后反序列的值为：40。

一般，我们开发的过程中是不会随便修改传递过来的值，这里只是为了演示反序列化类的作用。

---

#### alternateNames 别名

```java
public class Person {

    @JSONField(alternateNames = {"my_id","My_id","MyId"})
    private int id;
    @JSONField()
    private String name;
    @JSONField()
    private String address;
    @JSONField(format = "yyyyMMdd")
    private Date birthday;
  }
```

```java
        String json = "{'id':18,'MyId':22,'My_id':24,'name':'gakki','birthday':'20191222'}";
        Person person = JSON.parseObject(json, Person.class);
        System.out.println(person);
        String s = JSON.toJSONString(person);
        System.out.println(s);
```

```java
Person{id=24, name='gakki', address='null', birthday=Sun Dec 22 00:00:00 CST 2019}
{"birthday":"20191222","id":24,"name":"gakki"}
```

多个匹配时，以最后一个匹配为准，这里就是匹配了：My_id，最后输出为：24。