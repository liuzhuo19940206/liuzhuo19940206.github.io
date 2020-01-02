---
title: Jackson的进阶<三>
author: gakkij
categories:
  - Jackson
tags:
  - json
img: https://pic.downk.cc/item/5e0dd31f76085c328965e514.png
top: false
cover: false
coverImg: 
toc: true
date: 2020-01-02 19:08:28
summary: Jackson的注解使用
password:
---

使用jackson annotations简化和增强的json解析与生成。

Jackson-2.x通用annotations列表：[链接](https://github.com/FasterXML/jackson-annotations/wiki/Jackson-Annotations)

Jackson-1.x通用annotations列表：[链接](http://wiki.fasterxml.com/JacksonAnnotations)

---

### Jackson - Annotations

想要了解更多内容，请查看annotations列表。下面只列出一些常用的Json注解。

- **@JsonProperty**

它关联json字符串中的字段到java属性的映射。可以标记属性，也可以用来标记属性的getter/setter方法。当标记属性时，可以对属性字段重命名。当标记方法时，可以把json字段关联到java属性的getter或setter方法。

- **@JsonCreator**

json反序列化为java对象时，该注解用于定义构造函数。当从json创建java时，@JsonCreator注解的构造函数被会调用，如果没有@JsonCreator注解，则默认调用java类的无参构造函数，此时，如果java类中只有有参构造函数，而无默认的无参构造函数，在反序列化时会抛出这样的异常：com.fasterxml.jackson.databind.JsonMappingException，所以，当我们不使用@JsonCreator指定反序列化的构造函数，而又在java类中重载了构造函数时，一定要记得编写类的无参构造函数。

- **@JsonAnyGetter**和**@JsonAnySetter**

用于标记类方法，设置和读取json字段作为键值对存储到map中，这两个注解标记的方法不会处理任何java类中已经定义过的属性变量，只对java中未定义的json字段作处理。

- **@JsonIgnoreProperties**和**@JsonIgnore**

用于标记属性，在json与java之间相互转化时，将忽略被此注解标记的属性。@JsonIgnoreProperties是类级别注解，可以忽略多个属性，@JsonIgnore用来标注单个属性。

- **@JsonTypeInfo**和**@JsonSubTypes**

于维持java类的子类信息，将子类对象类型信息嵌入到json中，以便反序列化创建具体的对象。

---

### @JsonProperty

```java
@Target({ElementType.ANNOTATION_TYPE, ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotation
public @interface JsonProperty {
    String USE_DEFAULT_NAME = "";
    int INDEX_UNKNOWN = -1;

    String value() default "";  //更改json对应pojo的属性的别名

    boolean required() default false; //是否是必须的属性

    int index() default -1;     //序列化的顺序

    String defaultValue() default "";  //json字符串中没有对应的属性时的默认值

    JsonProperty.Access access() default JsonProperty.Access.AUTO;

    public static enum Access {
        AUTO,
        READ_ONLY,
        WRITE_ONLY,
        READ_WRITE;

        private Access() {
        }
    }
}
```

User:

```java
public class User {

        private String name;
        private int age;
        private String address;
        private Date birthday;
   
     //省略set、get、无参构造函数
}
```

没使用注解之前：

```java
        String json = "{\"name\":\"gakki\",\"age\":18,\"address\":\"东京\"}";

        ObjectMapper mapper = new ObjectMapper();
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

输出：

```java
User{name='gakki', age=18, address='东京', birthday=null}
{"name":"gakki","age":18,"address":"东京","birthday":null}
```

使用注解JsonProperty：value

```java
public class User {

    @JsonProperty("MyName")
    private String name;
    private int age;

    private String address;

    private Date birthday;
```

```java
        String json = "{\"MyName\":\"gakki\",\"address\":\"东京\",\"birthday\":\"2020-01-01\"}";

        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        mapper.setDateFormat(dateFormat);
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

输出：

```java
User{name='gakki', age=0, address='东京', birthday=Wed Jan 01 00:00:00 CST 2020}
{"age":0,"address":"东京","birthday":"2020-01-01","MyName":"gakki"}
```

注意：这里配置忽略不存在的属性：DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES，否则会出错，

而且name改成了MyName。

---

一般，我只使用value来修改json字符串与pojo属性的名字的对应关系，该注解的其它属性使用的少，大家可以去尝试。

### @JsonAlias

别名。

```java
public class AliasBean {
    @JsonAlias({ "fName", "f_name" })
    private String firstName;   
    private String lastName;
}
```

```java
    String json = "{\"fName\": \"John\", \"lastName\": \"Green\"}";
    AliasBean aliasBean = new ObjectMapper().readerFor(AliasBean.class).readValue(json);
    assertEquals("John", aliasBean.getFirstName());
```



### @JsonGetter

该注解主要用来单独改变序列化的属性名称

作用在get方法上面

User:

```java
public class User {

    @JsonProperty(value = "MyName")
    private String name;

    private int age;

    private String address;

    private Date birthday;
    
    // 省略get、set、toString方法
 }
```

```java
        String json = "{\"MyName\":\"gakki\",\"xxxx\":\"yyyy\",\"birthday\":\"2020-01-01\"}";

        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        mapper.setDateFormat(dateFormat);
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

```java
User{name='gakki', age=0, address='null', birthday=Wed Jan 01 00:00:00 CST 2020}
{"age":0,"address":null,"birthday":"2020-01-01","MyName":"gakki"}
```

此时，序列化的属性名称，除了name改变了，其它的都没有改变，使用@JsonProperty是将反序列和序列化都改变了。

现在给address的get方法添加该注解：

```java
    @JsonGetter(value = "myAddress")
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
```

```java
        String json = "{\"MyName\":\"gakki\",\"xxxx\":\"yyyy\",\"address\":\"冲绳\",\"birthday\":\"2020-01-01\"}";

        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        mapper.setDateFormat(dateFormat);
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

```java
User{name='gakki', age=0, address='null', birthday=Wed Jan 01 00:00:00 CST 2020}
{"age":0,"birthday":"2020-01-01","MyName":"gakki","myAddress":null}
```

此时，address确实名称改成了myAddress了，但是反序列化的值没了？？？

需要添加：@JsonSetter注解了。

```java
    @JsonGetter(value = "myAddress")
    public String getAddress() {
        return address;
    }

    @JsonSetter(value = "address")
    public void setAddress(String address) {
        this.address = address;
    }
```

```java
User{name='gakki', age=0, address='冲绳', birthday=Wed Jan 01 00:00:00 CST 2020}
{"age":0,"birthday":"2020-01-01","MyName":"gakki","myAddress":"冲绳"}
```

### @JsonSetter

该注解用于反序列化时给属性命名

作用与：set方法上面。

上面已经给出了案例，就不演示了。

### @JsonPropertyOrder

定制序列化的顺序：

```java
@Target({ElementType.ANNOTATION_TYPE, ElementType.TYPE, ElementType.METHOD, ElementType.CONSTRUCTOR, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotation
public @interface JsonPropertyOrder {
    String[] value() default {};
    boolean alphabetic() default false;
}
```

```java
@JsonPropertyOrder(value = {"birthday","myAddress","age","MyName"})
public class User {
···
}
```

```java
User{name='gakki', age=0, address='冲绳', birthday=Wed Jan 01 00:00:00 CST 2020}
{"birthday":"2020-01-01","myAddress":"冲绳","age":0,"MyName":"gakki"}
```

看到，序列化的顺序，全部都是按照注解中的顺序来的。

注意：书写注解中的顺序时，如果属性名字改了，请换成改后的名称，例如这里的name，改成了MyName。

### @JsonRawValue

该注解用于序列化时，原样输出。

```java
public class User {

    @JsonProperty(value = "MyName")
    private String name;

    private int age;

    private String address;

    private Date birthday;

    @JsonRawValue
    public String json;
    
        public User(String name, String json) {
        this.name = name;
        this.json = json;
    }
}
```

```java
        ObjectMapper mapper = new ObjectMapper();
        User user = new User("gakki","{\"name\":\"jacklove\"}");
        System.out.println(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

```java
User{name='gakki', age=0, address='null', birthday=null, json='{"name":"jacklove"}'}
{"birthday":null,"myAddress":null,"age":0,"MyName":"gakki","json":{"name":"jacklove"}}
```

这里的json本身也是一个json对象字符串。

### @JsonRootName

给序列化后的字符串添加一个根名字：

```java
@JsonRootName(value = "user")
public class User {

    @JsonProperty(value = "MyName")
    private String name;

    private int age;

    private String address;

    private Date birthday;
    
}
```

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);   //序列化成漂亮的格式
        mapper.enable(SerializationFeature.WRAP_ROOT_VALUE); //允许添加根名称
        User user = new User();
        user.setName("gakkij");
        user.setAge(18);
        user.setAddress("冲绳");
        System.out.println(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

```java
User{name='gakkij', age=18, address='冲绳', birthday=null}
{
  "user" : {
    "age" : 18,
    "birthday" : null,
    "MyName" : "gakkij",
    "myAddress" : "冲绳"
  }
}
```



### @JsonIgnore

该注解用于忽略属性是否该序列化和反序列化。

可以修饰属性，也可以修饰set和get方法。

User:

```java
public class User {

    @JsonProperty(value = "MyName", index = 4)
    private String name;

    private int age;

    @JsonIgnore
    private String address;

    private Date birthday;
}
```

输出：

```java
User{name='gakki', age=0, address='null', birthday=Wed Jan 01 00:00:00 CST 2020}
{"age":0,"birthday":"2020-01-01","MyName":"gakki"}
```

可以看出，address属性没有被反序列，而且也没有序列化。

---

修改：get方法

```java
    @JsonIgnore
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
```

输出：

```java
User{name='gakki', age=0, address='null', birthday=Wed Jan 01 00:00:00 CST 2020}
{"age":0,"birthday":"2020-01-01","MyName":"gakki"}
```

反序列化和序列化都忽略了。

---

修饰：set方法

```java
    //@JsonIgnore
    public String getAddress() {
        return address;
    }
    @JsonIgnore
    public void setAddress(String address) {
        this.address = address;
    }
```

输出：

```java
User{name='gakki', age=0, address='null', birthday=Wed Jan 01 00:00:00 CST 2020}
{"age":0,"birthday":"2020-01-01","MyName":"gakki"}
```

效果一样！！！

### **@JsonIgnoreProperties**

该注解与**@JsonIgnore**类似，但是它是作用于类的。

```java
@Target({ElementType.ANNOTATION_TYPE, ElementType.TYPE, ElementType.METHOD, ElementType.CONSTRUCTOR, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotation
public @interface JsonIgnoreProperties {
    String[] value() default {};

    boolean ignoreUnknown() default false;

    boolean allowGetters() default false;

    boolean allowSetters() default false;
```

User:

```java
@JsonIgnoreProperties(value = {"MyName","birthday"})
public class User {

    @JsonProperty(value = "MyName", index = 4)
    private String name;

    private int age;

    private String address;

    private Date birthday;
```

输出：

```java
User{name='null', age=0, address='东京', birthday=null}
{"age":0,"address":"东京"}
```

---

我们知道，当json串中有pojo没有匹配的属性时，就会报错！需要我们配置：

```java
        ObjectMapper mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);//忽略不匹配的属性
```

这样比较麻烦，我们可以使用：**@JsonIgnoreProperties**的`ignoreUnknown`为true来到达相同的效果：

```java
@JsonIgnoreProperties(value = {"MyName", "birthday"}, ignoreUnknown = true)
public class User {

    @JsonProperty(value = "MyName", index = 4)
    private String name;

    private int age;

    private String address;

    private Date birthday;
```

```java
        String json = "{\"MyName\":\"gakki\",\"unknow\":\"unknow\",\"address\":\"东京\",\"birthday\":\"2020-01-01\"}";

        ObjectMapper mapper = new ObjectMapper();
        //mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        mapper.setDateFormat(dateFormat);
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

```java
User{name='null', age=0, address='东京', birthday=null}
{"age":0,"address":"东京"}
```

现在添加了，unknown属性，依然没有报错！！！

---

使用：allowGetters 和 allowSetters。

```java
@JsonIgnoreProperties(ignoreUnknown = true, allowGetters = true)
public class User {

····
    @JsonIgnore
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
```

输出：

```java
User{name='gakki', age=0, address='null', birthday=Wed Jan 01 00:00:00 CST 2020}
{"age":0,"birthday":"2020-01-01","MyName":"gakki"}
```

```java
@JsonIgnoreProperties(ignoreUnknown = true, allowSetters = true)
public class User {

···
    //@JsonIgnore
    public String getAddress() {
        return address;
    }

    @JsonIgnore
    public void setAddress(String address) {
        this.address = address;
    }
 }
```

```java
User{name='gakki', age=0, address='null', birthday=Wed Jan 01 00:00:00 CST 2020}
{"age":0,"birthday":"2020-01-01","MyName":"gakki"}
```

一样的效果···

### **@JsonCreator**

User：

```java
public class User {

    @JsonProperty(value = "MyName", index = 4)
    private String name;

    private int age;

    private String address;

    private Date birthday;
    
    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

去掉了无参的构造函数

运行：

```java
Exception in thread "main" com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Cannot construct instance of `com.liuzhuo.jackson.domain.User` (no Creators, like default construct, exist): cannot deserialize from Object value (no delegate- or property-based Creator)
 at [Source: (String)"{"MyName":"gakki","unknow":"unknow","address":"东京","birthday":"2020-01-01"}"; line: 1, column: 2]
```

报：没有无参的构造函数问题！

---

修改：User

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class User {


    private String name;

    private int age;

    private String address;

    private Date birthday;

    @JsonCreator
    public User(@JsonProperty("MyName") String name) {
        this.name = name;
    }
}
```

```java
        String json = "{\"MyName\":\"gakki\",\"unknow\":\"unknow\",\"address\":\"东京\",\"birthday\":\"2020-01-01\"}";

        ObjectMapper mapper = new ObjectMapper();
        //mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        mapper.setDateFormat(dateFormat);
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

输出：

```java
User{name='gakki', age=0, address='东京', birthday=Wed Jan 01 00:00:00 CST 2020}
{"name":"gakki","age":0,"address":"东京","birthday":"2020-01-01"}
```

---

### **@JsonAnySetter**

User:

```java
public class User {

    @JsonProperty(value = "MyName")
    private String name;

    private int age;

    private String address;

    private Date birthday;

    @JsonAnySetter
    private Map<String,Object> unknow = new HashMap<>();
```

```java
        String json = "{\"MyName\":\"gakki\",\"xxxx\":\"yyyy\",\"address\":\"东京\",\"birthday\":\"2020-01-01\"}";

        ObjectMapper mapper = new ObjectMapper();
        //mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        mapper.setDateFormat(dateFormat);
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

输出：

```java
User{name='gakki', age=0, address='东京', birthday=Wed Jan 01 00:00:00 CST 2020, unknow={xxxx=yyyy}}
{"age":0,"address":"东京","birthday":"2020-01-01","MyName":"gakki"}
```

可以看到，即使我们没有配置：

- mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
- @JsonIgnoreProperties( ignoreUnknown = true)

也不会报错了，会把不匹配的属性放到使用@JsonAnySetter注解的map中。

<font color="red">注意：这里的map请直接初始化，不需要添加get和set方法，否则会序列化出去的。</font>

### **@JsonInclude**

例如：**@JsonInclude(JsonInclude.Include.NON_NULL)**

这个注解表示，如果**值为null，则不返回**，还可以在类上添加这个注释，当实体类与json互相转换的时候，**属性值为null的不参与序列化**。

```java
        String json = "{\"MyName\":\"gakki\",\"xxxx\":\"yyyy\",\"birthday\":\"2020-01-01\"}";

        ObjectMapper mapper = new ObjectMapper();
        //mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        mapper.setDateFormat(dateFormat);
        User user = mapper.readValue(json, User.class);
        System.out.println(user);
        String userStr = mapper.writeValueAsString(user);
        System.out.println(userStr);
```

输出：

```java
User{name='gakki', age=0, address='null', birthday=Wed Jan 01 00:00:00 CST 2020, unknow={xxxx=yyyy}}
{"age":0,"address":null,"birthday":"2020-01-01","MyName":"gakki"}
```

此时，address为null也序列化出来了。

给address添加该注解后：

```java
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String address;
```

```java
User{name='gakki', age=0, address='null', birthday=Wed Jan 01 00:00:00 CST 2020, unknow={xxxx=yyyy}}
{"age":0,"birthday":"2020-01-01","MyName":"gakki"}
```

此时，address也为null，但是不再序列化出来了。

给age添加该注解后：

```java
    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    private int age;
```

```java
User{name='gakki', age=0, address='null', birthday=Wed Jan 01 00:00:00 CST 2020, unknow={xxxx=yyyy}}
{"birthday":"2020-01-01","MyName":"gakki"}
```

此时，age=0也不被序列化出来了。

Include是一个枚举类型：

```java
    public static enum Include {
        ALWAYS,
        NON_NULL,    // 不序列化null值
        NON_ABSENT,
        NON_EMPTY,   // null 和 "" 都不序列化
        NON_DEFAULT, // 不序列化默认值
        CUSTOM,
        USE_DEFAULTS;

        private Include() {
        }
    }
```

### 参考文档

[jackson的注解使用](https://www.baeldung.com/jackson-annotations)





 



