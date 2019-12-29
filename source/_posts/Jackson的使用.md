---
title: Jackson的使用
author: gakkij
categories:
  - Jackson
tags:
  - json
img: https://pic.downk.cc/item/5e07674a76085c328912a6a3.jpg
top: false
cover: false
coverImg:
toc: true
date: 2019-12-28 22:28:04
summary: Jackson的简单使用
password:
---

Json已经成为当前服务器与 WEB 应用之间数据传输的公认标准。Java 中常见的 Json 类库有 **JSON-lib 、Gson、FastJson和 Jackson **等。相比于其他的解析工具，Jackson 简单易用，不依赖于外部jar 包，而且更新速度比较快。其也是 SpringMVC 框架 json 格式化输出的默认实现。

---

### jackson的版本

- codehaus
- fasterxml

他们是 Jackson 的两大分支。从 2.0 版本开始，Jackson 开始改用新的包名 `com.fasterxml.jackson`；其源代码也托管到了 Github([FasterXML/Jackson](https://github.com/FasterXML/jackson))。1.x 版本现在只提供 bug-fix 。另外版本 1 和版本 2 的 `artifactId` 也不相同。 在使用的过程中需要注意！

### fasterxml

Jackson 主要有三部分组成，除了三个模块之间存在依赖，不依赖任何外部 jar 包。三个模块的 作用及 `artifactId` 如下：

- `jackson-core`: 核心包
- `jackson-annotations` : 注解包
- `jackson-databind` : 数据绑定（依赖 `core` 和 `annotations`）

---

### 使用方式

Jackson 提供了三种 json 处理方式：

- Streaming API : 其他两种方式都依赖于它而实现，如果要从底层细粒度控制 json 的解析生成，可以使用这种方式;
- Tree Model : 通过基于内存的树形结构来描述 json 数据。json 结构树由 JsonNode 组成。不需要绑定任何类和实体，可以方便的对 JsonNode 来进行操作。
- Data Binding : 最常用的方式，基于属性的 get 和 set方法以及注解来实现 JavaBean 和 json 的互转，底层实现还是 Streaming API.

---

### Streaming API

```java
public class JackSonDemo {

    private static JsonFactory factory;
    private static JsonGenerator jsonGenerator;

    public static void main(String[] args) throws IOException {
        init();
    }
    private static void init() throws IOException {
        factory = new JsonFactory();
        // 工厂全局设置
        factory.disable(JsonFactory.Feature.CANONICALIZE_FIELD_NAMES);
        // 设置解析器
        factory.enable(JsonParser.Feature.ALLOW_SINGLE_QUOTES);
        // 设置生成器
        factory.enable(JsonGenerator.Feature.WRITE_NUMBERS_AS_STRINGS);
    }
}
```

说明：使用jsonFactory来配置一些序列化和反序列化的特性。

#### jsonGenerator

jsonGenerator主要用来生成json字符串的，即：所谓的序列化操作。

1) 输出基本类型

```java
    private static void testJsonGenerator() throws IOException {

        jsonGenerator = factory.createGenerator(System.out, JsonEncoding.UTF8);

        String str = "hello,world!jackson!";
        // 输出字节
        jsonGenerator.writeBinary(str.getBytes());
        // 输出布尔型
        jsonGenerator.writeBoolean(true);
        // null
        jsonGenerator.writeNull();
        // 输出字符型
        jsonGenerator.writeNumber(2.2f);
        // 使用Raw方法会执行字符中的特殊字符
        jsonGenerator.writeRaw("\tc");
        // 输出换行符
        jsonGenerator.writeRaw("\r\n");

        //输出构造的pojo对象
        jsonGenerator.writeStartObject();
        jsonGenerator.writeObjectField("name", "gakki");
        jsonGenerator.writeObjectField("age", 18);
        jsonGenerator.writeObjectField("address", "冲绳岛");
        jsonGenerator.writeEndObject();

        jsonGenerator.close();  //注意这里必须关闭，否则不会输出。

    }
```

输出：

```java
"aGVsbG8sd29ybGQhamFja3NvbiE=" true null "2.2"	c
 {"name":"gakki","age":"18","address":"冲绳岛"}
```

---

2）输出POJO对象和数组类型的POJO

```java
    private static void testJsonGenerator2() throws IOException {

        User user = new User();
        user.setName("gakkij");
        user.setAge(18);

        jsonGenerator = factory.createGenerator(System.out, JsonEncoding.UTF8);
        jsonGenerator.writeObject(user);

        User[] users = new User[]{new User("jack", 18), new User("rose", 20)};
        jsonGenerator.writeObject(users);

        List<User> userList = new ArrayList<>();
        userList.add(new User("aaa", 12));
        userList.add(new User("bbb", 16));
        jsonGenerator.writeObject(userList);
    }
```

输出：

```java
Exception in thread "main" java.lang.IllegalStateException: No ObjectCodec defined for the generator, can only serialize simple wrapper types (type passed com.liuzhuo.jackson.domain.User)
	at com.fasterxml.jackson.core.JsonGenerator._writeSimpleObject(JsonGenerator.java:2168)
	at com.fasterxml.jackson.core.base.GeneratorBase.writeObject(GeneratorBase.java:391)
	at com.liuzhuo.jackson.JackSonDemo.testJsonGenerator2(JackSonDemo.java:38)
	at com.liuzhuo.jackson.JackSonDemo.main(JackSonDemo.java:26)
```

**报错了？**

**这里，我们必须使用ObjectMapper。**

```java
    private static void testJsonGenerator2() throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        JsonGenerator jsonGenerator = mapper.getJsonFactory().createJsonGenerator(System.out, JsonEncoding.UTF8);

        User user = new User();
        user.setName("gakkij");
        user.setAge(18);

        jsonGenerator.writeObject(user);
        jsonGenerator.writeRaw("\r\n");

        User[] users = new User[]{new User("jack", 18), new User("rose", 20)};
        jsonGenerator.writeObject(users);
        jsonGenerator.writeRaw("\r\n");

        List<User> userList = new ArrayList<>();
        userList.add(new User("aaa", 12));
        userList.add(new User("bbb", 16));
        jsonGenerator.writeObject(userList);
    }
```

输出：

```java
{"name":"gakkij","age":18}
 [{"name":"jack","age":18},{"name":"rose","age":20}]
 [{"name":"aaa","age":12},{"name":"bbb","age":16}]
```

#### jsonParse

1) 简单的解析

```java
public class User {

    private String name;
    private int age;
  
    //省略：set、get、toString方法
}
```

```java
    private static void testParse() throws IOException {
        String json = "{'name':'jacklove','age':18}";
        JsonParser parser = factory.createParser(json);
        JsonToken jsonToken = parser.nextToken();
        if (jsonToken != JsonToken.START_OBJECT) {  // {
            //说明json字符串格式有问题
            System.out.println("json格式有问题！！！");
            return;
        }
        User user = new User();
        while (jsonToken != JsonToken.END_OBJECT) {  // }
            if (jsonToken == JsonToken.FIELD_NAME && parser.currentName().equals("name")) {
                parser.nextToken(); // jacklove
                String name = parser.getText();
                user.setName(name);
            } else if (jsonToken == JsonToken.FIELD_NAME && parser.currentName().equals("age")) {
                parser.nextToken();
                int age = parser.getIntValue();
                user.setAge(age);
            }
            jsonToken = parser.nextToken();
        }
        System.out.println(user);
        parser.close();
    }
```

输出：

```java
User{name='jacklove', age=18}
```

---

2）复杂的解析

```java
    private static void testParse2() throws IOException {

        String json = "{'name':'gakki','age':18,'hobby':['aaa','bbb','ccc'],'boyfriend':{'name':'liuzhuo','age':18}}";
        JsonParser parser = factory.createParser(json);

        JsonToken token = parser.nextToken();

        while (token != JsonToken.END_OBJECT) {
            if (token == JsonToken.FIELD_NAME && parser.currentName().equals("name")) {
                parser.nextToken();
                String name = parser.getText();
                System.out.println("name:" + name);
            } else if (token == JsonToken.FIELD_NAME && parser.currentName().equals("age")) {
                parser.nextToken();
                int age = parser.getIntValue();
                System.out.println("age:" + age);
            } else if (token == JsonToken.FIELD_NAME && parser.currentName().equals("hobby")) {
                token = parser.nextToken();
                System.out.println("hobby:");
                while (token != JsonToken.END_ARRAY) {
                    if (token == JsonToken.VALUE_STRING){
                        String hobby = parser.getValueAsString();
                        System.out.println(hobby);
                    }
                    token = parser.nextToken();
                }
            } else if (token == JsonToken.FIELD_NAME && parser.currentName().equals("boyfriend")) {
                token = parser.nextToken();
                while (token != JsonToken.END_OBJECT) {
                    if (token == JsonToken.FIELD_NAME && parser.currentName().equals("name")) {
                        parser.nextToken();
                        String name = parser.getText();
                        System.out.println("bf_name:" + name);
                    } else if (token == JsonToken.FIELD_NAME && parser.currentName().equals("age")) {
                        parser.nextToken();
                        int age = parser.getIntValue();
                        System.out.println("bf_age:" + age);
                    }
                    token = parser.nextToken();
                }
            }
            token = parser.nextToken();
        }
        parser.close();
    }
```

输出：

```java
name:gakki
age:18
hobby:
aaa
bbb
ccc
bf_name:liuzhuo
bf_age:18
```

这样的解析恶心到我了！！！！

注意：这里解析数组结构时的判断条件：`token == JsonToken.VALUE_STRING`

---

### TreeMode

```java
    private static void init() {
        objectMapper = new ObjectMapper();
        // 如果为空则不输出
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
        // 对于空的对象转json的时候不抛出错误
        objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        // 禁用序列化日期为timestamps
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // 禁用遇到未知属性抛出异常
        objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        // 视空字符传为null
        objectMapper.enable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT);

        // 低层级配置
        objectMapper.configure(JsonParser.Feature.ALLOW_COMMENTS, true);
        // 允许属性名称没有引号
        objectMapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
        // 允许单引号
        objectMapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
        // 取消对非ASCII字符的转码
        objectMapper.configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, false);
    }
```

```java
    public static void testTreeModel() throws Exception {
        JsonNodeFactory nodeFactory = objectMapper.getNodeFactory();
        // 创建一个model
        ObjectNode node = nodeFactory.objectNode();
        node.put("age", 18);
        // 新增
        node.put("name", "周杰伦");
        // 如果存在同名的则是替换操作
        node.put("age", 19);
        ArrayNode coursesNode = node.putArray("courses");
        coursesNode.add("思想政治");
        coursesNode.add("高等数学");
        // 获取节点类型
        System.out.println(node.getNodeType());
        System.out.println(coursesNode.getNodeType());
        // 移除第一个
        coursesNode.remove(0);
        // 输出
        System.out.println(node.toString());

        String jsonStr = "{\"age\":19,\"name\":\"周杰伦\",\"courses\":[\"高等数学\"]}";
        JsonNode jsonNode = objectMapper.readTree(jsonStr);
        ArrayNode arrayNode = (ArrayNode) jsonNode.withArray("courses");
        arrayNode.add("马列");
        for (int i = 0; i < arrayNode.size(); i++) {
            System.out.println(arrayNode.get(i).asText());
        }
        System.out.println(jsonNode.toString());
    }
```

输出：

```java
OBJECT
ARRAY
{"age":19,"name":"周杰伦","courses":["高等数学"]}
高等数学
马列
{"age":19,"name":"周杰伦","courses":["高等数学","马列"]}
```

---

### DataBinding

```java
public class JacksonDataBindTest {

    private static ObjectMapper baseMapper;
    private static ObjectMapper prettyMapper1;
    private static ObjectMapper prettyMapper2;
    private static ObjectMapper nonEmptyMapper;

    public static void main(String[] args) throws IOException {
        init();
    }    
    private static void init() {
        baseMapper = new ObjectMapper();
        // 对于空的对象转json的时候不抛出错误
        baseMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        // 禁用遇到未知属性抛出异常
        baseMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        baseMapper.enable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT);
        // 低层级配置
        baseMapper.configure(JsonParser.Feature.ALLOW_COMMENTS, true);
        baseMapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
        baseMapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
        // 配置两个副本
        prettyMapper1 = baseMapper.copy();
        prettyMapper2 = baseMapper.copy();
        // 高级配置
        prettyMapper1.enable(SerializationFeature.INDENT_OUTPUT);
        prettyMapper1.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
        prettyMapper1.enable(SerializationFeature.WRITE_ENUMS_USING_TO_STRING);
        // 禁用序列化日期为timestamps
        prettyMapper1.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        prettyMapper1.configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, false);
        // Json格式化展示
        prettyMapper2.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        prettyMapper2.enable(SerializationFeature.INDENT_OUTPUT);
        prettyMapper2.configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
        prettyMapper2.enable(SerializationFeature.WRITE_ENUMS_USING_INDEX);

        nonEmptyMapper = new ObjectMapper();
        nonEmptyMapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
        nonEmptyMapper.enable(SerializationFeature.INDENT_OUTPUT);
        nonEmptyMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
    }
}
```

TessBean:

```java
public class TestBean {
    private String name;
    private String course;
    private Date now;
    private Sexy sexy;
  // 省略set、get、toString方法
}
```

Sexy：

```java
public enum Sexy {
    MEN("男", "M"), WOMEN("女", "W");
    private String text;
    private String code;

    private Sexy(String text, String code) {
        this.text = text;
        this.code = code;
    }

    public String getText() {
        return text;
    }

    public String getCode() {
        return code;
    }

    @Override
    public String toString() {
        return "{\"text\":\"" + getText() + "\",\"code\":\"" + getCode() + "\"}";
    }
}
```

```java
    public static void testReadValue() throws IOException {
        String json = "{\n" +
                "  \"name\" : \"发如雪\",\n" +
                "  \"now\" : \"2015-12-17 17:25:13\",\n" +
                "  \"sexy\" : \"MEN\"\n" +
                "}";
        TestBean testBean = nonEmptyMapper.readValue(json, TestBean.class);
        System.out.println(testBean.toString());
    }
```

输出：

```java
TestBean{name='发如雪', course='null', now=Thu Dec 17 17:25:13 CST 2015, sexy={"text":"男","code":"M"}}
```

---

```java
    public static void testWriteValue() throws IOException {
        TestBean testBean = new TestBean("发如雪", Sexy.MEN);
        System.out.println(baseMapper.writeValueAsString(testBean));
        System.out.println(prettyMapper1.writeValueAsString(testBean));
        System.out.println(prettyMapper2.writeValueAsString(testBean));
        System.out.println(nonEmptyMapper.writeValueAsString(testBean));
    }
```

输出：

```java
{"name":"发如雪","course":null,"now":1577587336749,"sexy":"MEN"}
{
  "name" : "发如雪",
  "course" : null,
  "now" : "2019-12-29 10:42:16",
  "sexy" : "{\"text\":\"男\",\"code\":\"M\"}"
}
{
  "name" : "\u53D1\u5982\u96EA",
  "now" : 1577587336749,
  "sexy" : 0
}
{
  "name" : "发如雪",
  "now" : "2019-12-29 10:42:16",
  "sexy" : "MEN"
}
```



