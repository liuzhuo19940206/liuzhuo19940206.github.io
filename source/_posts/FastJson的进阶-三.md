---
title: FastJson的进阶<三>
author: gakkij
categories:
  - FastJson
tags:
  - json
img: https://pic2.superbed.cn/item/5dff6b2d76085c328957c771.jpg
top: false
cover: false
coverImg:
toc: true
date: 2019-12-22 21:01:34
summary: 通过SerializeFilter定制序列化
password:
---

通过SerializeFilter可以使用扩展编程的方式实现定制序列化。fastjson提供了多种SerializeFilter：

```
PropertyFilter 根据PropertyName和PropertyValue来判断是否序列化；
PropertyPreFilter 根据PropertyName判断是否序列化；
NameFilter 可以修序列化后的Key;
ValueFilter 可以修改序列化后的Value；
BeforeFilter 序列化时在最前添加内容；
AfterFilter 序列化时在最后添加内容。
```

### PropertyFilter

根据PropertyName和PropertyValue来判断是否序列化；

PropertyFilter 接口：

```java
 public interface PropertyFilter extends SerializeFilter {
      boolean apply(Object object, String propertyName, Object propertyValue);
 }
```

可以通过扩展实现根据object或者属性名称或者属性值进行判断是否需要序列化。例如：

```java
public class User {

    private int id;
    private String name;
    private String address;

    public User() {
    }
    省略：get、set、toString方法
 }
```

```java
        PropertyFilter filter = new PropertyFilter() {

            @Override
            public boolean apply(Object object, String name, Object value) {
                System.out.println("source:" + object);
                System.out.println("name:" + name);
                System.out.println("value:" + value);
                System.out.println("---------------------");
                if (name != null && name.equals("id")) {
                   int id = ((Integer) value).intValue();
                    return id >= 20;
                }
                return false;
            }
        };

        User user = new User();
        user.setId(18);
        user.setName("gakki");
        user.setAddress("冲绳");

        String json = JSON.toJSONString(user, filter);
        System.out.println(json);
        user.setId(21);
        json = JSON.toJSONString(user, filter);
        System.out.println(json);
```

```java
source:User{id=18, name='gakki', address='冲绳'}
name:address
value:冲绳
---------------------
source:User{id=18, name='gakki', address='冲绳'}
name:id
value:18
---------------------
source:User{id=18, name='gakki', address='冲绳'}
name:name
value:gakki
---------------------
{}
source:User{id=21, name='gakki', address='冲绳'}
name:address
value:冲绳
---------------------
source:User{id=21, name='gakki', address='冲绳'}
name:id
value:21
---------------------
source:User{id=21, name='gakki', address='冲绳'}
name:name
value:gakki
---------------------
{"id":21}
```

说明：PropertyFilter中的apply方法中，第一个参数：Object就是原始数据，这里指代User对象，第二个参数就是序列化时属性的名字，如果使用@JSONField注解的话，就是name中的指定的名字，没有的话，就是属性本身的名字，第三个参数就是属性的值。

这里，我只序列化了name为：id的属性 并且 id的值大于20，最终输出：{"id":21}。

---

### PropertyPreFilter

根据PropertyName判断是否序列化

PropertyPreFilter接口：

```java
public interface NameFilter extends SerializeFilter {
   public boolean apply(JSONSerializer serializer, Object object, String propertyName);
}
```

```java
        PropertyPreFilter filter = new PropertyPreFilter() {
            @Override
            public boolean apply(JSONSerializer serializer, Object object, String name) {
                System.out.println("source:" + object);
                System.out.println("name:" + name);
                if (name.equals("name")) {
                    return true;
                }
                return false;
            }
        };
        User user = new User(19, "jackoflove", "东京");
        String json = JSON.toJSONString(user, filter);
        System.out.println(json);
```

```java
source:User{id=19, name='jackoflove', address='东京'}
name:address
source:User{id=19, name='jackoflove', address='东京'}
name:id
source:User{id=19, name='jackoflove', address='东京'}
name:name
{"name":"jackoflove"}
```

这里，通过只序列化name的属性。

---

### NameFilter 

序列化时修改Key

NameFilter 接口：

```java
public interface NameFilter extends SerializeFilter {
    String process(Object object, String propertyName, Object propertyValue);
}
```

```java
        NameFilter filter = new NameFilter() {
            @Override
            public String process(Object object, String name, Object value) {
                System.out.println("source:" + object);
                System.out.println("name:" + name);
                System.out.println("value:" + value);
                if (name.equals("id")) {
                    return "xxx_id";
                } else if (name.equals("name")) {
                    return "My_name";
                }
                return name;
            }
        };
        User user = new User(19, "jackoflove", "东京");
        String json = JSON.toJSONString(user, filter);
        System.out.println(json);
```

```java
source:User{id=19, name='jackoflove', address='东京'}
name:address
value:东京
source:User{id=19, name='jackoflove', address='东京'}
name:id
value:19
source:User{id=19, name='jackoflove', address='东京'}
name:name
value:jackoflove
{"address":"东京","xxx_id":19,"My_name":"jackoflove"}
```

PS： fastjson内置一个PascalNameFilter，用于输出将首字符大写的Pascal风格

```java
String json = JSON.toJSONString(user, new PascalNameFilter()); // 序列化的时候传入filter
System.out.println("PascalNameFilter序列化：" + json);
```

### **ValueFilter**

序列化时修改Value

ValueFilter 接口：

```java
public interface ValueFilter extends SerializeFilter {
      Object process(Object object, String propertyName, Object propertyValue);
  }
```

```java
        ValueFilter filter = new ValueFilter() {
            @Override
            public Object process(Object object, String name, Object value) {
                System.out.println("source:" + object);
                System.out.println("name:" + name);
                System.out.println("value:" + value);
                if (name.equals("id")) {
                    int i = (int) value;
                    return i + 5;
                } else if (name.equals("name")) {
                    String nameValue = value.toString();
                    return nameValue + "_gakkij";
                } else {
                    return value;
                }
            }
        };
        User user = new User(19, "jackoflove", "东京");
        String json = JSON.toJSONString(user, filter);
        System.out.println(json);
```

```java
source:User{id=19, name='jackoflove', address='东京'}
name:address
value:东京
source:User{id=19, name='jackoflove', address='东京'}
name:id
value:19
source:User{id=19, name='jackoflove', address='东京'}
name:name
value:jackoflove
{"address":"东京","id":24,"name":"jackoflove_gakkij"}
```

### **BeforeFilter**

序列化时在最前添加内容

BeforeFilter 接口：

```java
public abstract class BeforeFilter implements SerializeFilter {
      protected final void writeKeyValue(String key, Object value) { ... }
      // 需要实现的抽象方法，在实现中调用writeKeyValue添加内容
      public abstract void writeBefore(Object object);
  }
```

在序列化对象的所有属性之前执行某些操作，例如调用 writeKeyValue 添加内容：

```java
        BeforeFilter filter = new BeforeFilter() {
            @Override
            public void writeBefore(Object object) {
                //System.out.println("source:" + object);
                User user = (User) object;
                System.out.println("id:"+user.getId());
                System.out.println("name:"+user.getName());
                System.out.println("address:"+user.getAddress());
                //修改id的值
                user.setId(28);
            }
        };
        User user = new User(19, "jackoflove", "东京");
        String json = JSON.toJSONString(user, filter);
        System.out.println(json);
```

```java
id:19
name:jackoflove
address:东京
{"address":"东京","id":28,"name":"jackoflove"}
```

在序列化之前，我们打印出了要序列化的对象的属性，然后修改了id的值。

### **AfterFilter**

序列化时在最后添加内容

AfterFilter 接口：

```java
public abstract class AfterFilter implements SerializeFilter {
      protected final void writeKeyValue(String key, Object value) { ... }
      // 需要实现的抽象方法，在实现中调用writeKeyValue添加内容
      public abstract void writeAfter(Object object);
  }
```

```java
        AfterFilter filter = new AfterFilter() {
            @Override
            public void writeAfter(Object object) {
                User user = (User) object;
                user.setId(28);
                user.setName("老女人");
                user.setAddress("你猜ya!");
            }
        };
        User user = new User(19, "jackoflove", "东京");
        System.out.println(user);
        String json = JSON.toJSONString(user, filter);
        System.out.println(json);
        System.out.println(user);
```

```java
User{id=19, name='jackoflove', address='东京'}
{"address":"东京","id":19,"name":"jackoflove"}
User{id=28, name='老女人', address='你猜ya!'}
```

修改的是要序列化的对象本身，序列化是不会变的。

