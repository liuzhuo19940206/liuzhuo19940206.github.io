---
title: Jackson的进阶<一>
author: gakkij
categories:
  - Jackson
tags:
  - json
img: https://pic.downk.cc/item/5e08201176085c328930fbe9.jpg
top: false
cover: false
coverImg: 
toc: true
date: 2019-12-29 11:36:18
summary: Jackson的常用用法，ObjectMapper
password:
---

### 处理Json

Jackson提供了三种可选的Json处理方法：流式API(Streaming API) 、树模型(Tree Model)、数据绑定(Data Binding)。三种处理Json的方式的特性：

- Streaming API：是效率最高的处理方式(开销低、读写速度快，但程序编写复杂度高) 
- Tree Model：是最灵活的处理方式
- Data Binding：是最常用的处理方式

---

Tree Model 和 Data Binding 的底层都是使用：Streaming API 来完成的，就是Streaming API的编程特别麻烦，通过之前的文章也体会到， 主要使用：JsonGenerator 和 JsonParser 来操作。

```java
JsonFactory factory = new JsonFactory();

JsonGenerator jsonGenerator = factory.createGenerator(System.out, JsonEncoding.UTF8);
JsonParser parser = factory.createParser(json);
```

![](https://pic.downk.cc/item/5e0821b876085c32893142f6.jpg)

可以看到：createGenerator主要有6中重载方法。

File、DataOutput、OutputStream、Writer。

解析后的文件，可以存储到文件File中，也可以解析到输出流中或控制台中。

---

![](https://pic.downk.cc/item/5e0822ba76085c3289317095.jpg)

可以看到：createParser主要有10中重载的方法。

分别从，字符串、文件、URL、reader，byte数组、DataInput、char[]、InputStream等

---

#### jsonGenerator

主要通过各种writerXXX方法来序列化：

```java
        jsonGenerator = factory.createGenerator(System.out, JsonEncoding.UTF8);

        String str = "hello,world!jackson!";
        //输出字符串
        jsonGenerator.writeString(str);
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
```

<font color="red">**注意：使用工厂创建的jsonGenerator，注意序列化自己构造的POJO对象，不能直接使用：jsonGenerator.writeObject(new User()) ,这里会出现错误！！！**</font>

必须使用：

```java
 ObjectMapper mapper = new ObjectMapper();
        JsonGenerator jsonGenerator = mapper.getJsonFactory().createJsonGenerator(System.out, JsonEncoding.UTF8);
```

上述方法已经过期了，建议我们序列化POJO对象，直接使用objectMapper的各种wirterValue方法：

```java
// 第一个参数：File、OutputStream、JsonGenerator、Writer等，第二个参数：需要序列化的对象。      
mapper.writeValue();  
mapper.writeValueAsBytes();  //序列化为byte[]数组
mapper.writeValueAsString(); //序列化为String字符串
```

#### jsonParser

jsonParser的各种，nextToken、getXXX来反序列化

```java
JsonParser parser = factory.createParser(json);
parser.nextToken();
parser.getText();
parser.getIntValue();
```

和解析XML文件一样，比较繁琐，需要判断当前的：JsonToken 类型来做出处理。

JsonToken的类型：

```java
public enum JsonToken {
    NOT_AVAILABLE((String)null, -1),
    START_OBJECT("{", 1),
    END_OBJECT("}", 2),
    START_ARRAY("[", 3),
    END_ARRAY("]", 4),
    FIELD_NAME((String)null, 5),
    VALUE_EMBEDDED_OBJECT((String)null, 12),
    VALUE_STRING((String)null, 6),
    VALUE_NUMBER_INT((String)null, 7),
    VALUE_NUMBER_FLOAT((String)null, 8),
    VALUE_TRUE("true", 9),
    VALUE_FALSE("false", 10),
    VALUE_NULL("null", 11);
    
    ····
}
```

#### TreeModel

1）TreeModel的序列化：

```java
//创建一个节点工厂,为我们提供所有节点
JsonNodeFactory factory = new JsonNodeFactory(false);
// "{"
ObjectNode objNode = factory.objectNode();
objNode.put("country_id", "China");
objNode.put("birthDate", "1949-10-01");
//在Java中，List和Array转化为json后对应的格式符号都是"obj:[]"
ArrayNode arrayNode = factory.arrayNode();
arrayNode.add("Han").add("Meng").add("Hui").add("WeiWuEr").add("Zang");
objNode.set("nation", nation);


//创建一个json factory来写tree modle为json
JsonFactory jsonFactory = new JsonFactory();
//创建一个json生成器
JsonGenerator generator = jsonFactory.createGenerator(new FileWriter(new File("country.json")));
//注意，默认情况下对象映射器不会指定根节点，下面设根节点为country
ObjectMapper mapper = new ObjectMapper();

mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
mapper.writeTree(generator, objNode);

```

2）TreeModel的反序列化：

```java
ObjectMapper mapper = new ObjectMapper();
// Jackson提供一个树节点被称为"JsonNode",ObjectMapper提供方法来读json作为树的JsonNode根节点
JsonNode node = mapper.readTree(new File("country.json"));

// as.Text的作用是有值返回值，无值返回空字符串
JsonNode country_id = node.get("country_id");
System.out.println("country_id:"+country_id.asText() + " JsonNodeType:"+country_id.getNodeType());

JsonNode nation = node.get("nation");
System.out.println("nation:"+ nation+ " JsonNodeType:"+nation.getNodeType());
```

PS: 当node不存在时,get方法返回null,而path返回MISSING类型的JsonNode

```java
		ObjectMapper mapper = new ObjectMapper();
		JsonNode node = mapper.readTree(new File("country.json"));
		//path方法获取JsonNode时，当对象不存在时，返回MISSING类型的JsonNode
		JsonNode missingNode = node.path("test");
		if(missingNode.isMissingNode()){
			System.out.println("JsonNodeType : " + missingNode.getNodeType());
		}
```

---

### DataBinding

这是jackson最常用的方法，即：使用 ObjectMapper。

1）java对象转化成json:

Province.java

```java
public class Province {
	public String name;
	public int population;
	public String[] city;	
}
```

Country.java

```java
public class Country {
	// 注意：被序列化的bean的private属性字段需要创建getter方法或者属性字段应该为public
	private String country_id;
	private Date birthDate;
	private List<String> nation = new ArrayList<String>();
	private String[] lakes;
	private List<Province> provinces = new ArrayList<Province>();
	private Map<String, Integer> traffic = new HashMap<String, Integer>();
 
 //省略：set、get、toString方法
}
```

main：

```java
public class JavaBeanSerializeToJson {
 
	public static void convert() throws Exception {
		// 使用ObjectMapper来转化对象为Json
		ObjectMapper mapper = new ObjectMapper();
		// 添加功能，让时间格式更具有可读性
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		mapper.setDateFormat(dateFormat);
 
		Country country = new Country("China");
		country.setBirthDate(dateFormat.parse("1949-10-01"));
		country.setLakes(new String[] { "Qinghai Lake", "Poyang Lake",
				"Dongting Lake", "Taihu Lake" });
 
		List<String> nation = new ArrayList<String>();
		nation.add("Han");
		nation.add("Meng");
		nation.add("Hui");
		nation.add("WeiWuEr");
		nation.add("Zang");
		country.setNation(nation);
 
		Province province = new Province();
		province.name = "Shanxi";
		province.population = 37751200;
		Province province2 = new Province();
		province2.name = "ZheJiang";
		province2.population = 55080000;
		List<Province> provinces = new ArrayList<Province>();
		provinces.add(province);
		provinces.add(province2);
		country.setProvinces(provinces);
		
		country.addTraffic("Train(KM)", 112000);
		country.addTraffic("HighWay(KM)", 4240000);
    
		// 为了使JSON视觉上的可读性，增加一行如下代码，注意，在生产中不需要这样，因为这样会增大Json的内容
		mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
		// 配置mapper忽略空属性
		mapper.setSerializationInclusion(Include.NON_EMPTY);
		// 默认情况，Jackson使用Java属性字段名称作为 Json的属性名称,也可以使用Jackson annotations(注解)改变Json属性名称
		mapper.writeValue(new File("country.json"), country);
	}
 
	public static void main(String[] args) throws Exception {
		convert();
	}
}
```

输出：

```java
{
  "country_id" : "China",
  "birthDate" : "1949-10-01",
  "nation" : [ "Han", "Meng", "Hui", "WeiWuEr", "Zang" ],
  "lakes" : [ "Qinghai Lake", "Poyang Lake", "Dongting Lake", "Taihu Lake" ],
  "provinces" : [ {
    "name" : "Shanxi",
    "population" : 37751200
  }, {
    "name" : "ZheJiang",
    "population" : 55080000
  } ],
  "traffic" : {
    "HighWay(KM)" : 4240000,
    "Train(KM)" : 112000
  }
}
```

2）Json字符串反序列化为java对象：

```java
public class JsonDeserializeToJava {
	
	public static void main(String[] args) throws Exception {
		//ObjectMapper类用序列化与反序列化映射器
		ObjectMapper mapper = new ObjectMapper();
		File json = new File("country.json");
		//当反序列化json时，未知属性会引起的反序列化被打断，这里我们禁用未知属性打断反序列化功能，
		//因为，例如json里有10个属性，而我们的bean中只定义了2个属性，其它8个属性将被忽略
		mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
		
		//从json映射到java对象，得到country对象后就可以遍历查找,下面遍历部分内容，能说明问题就可以了
		Country country = mapper.readValue(json, Country.class);
		System.out.println("country_id:"+country.getCountry_id());
		//设置时间格式，便于阅读
		SimpleDateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd");
		String birthDate = dateformat.format(country.getBirthDate());
		System.out.println("birthDate:"+birthDate);
		
		List<Province> provinces = country.getProvinces();
		for (Province province : provinces) {
			System.out.println("province:"+province.name + "\n" + "population:"+province.population);
		}
	}
}
```

输出：

```java
country_id:China
birthDate:1949-10-01
province:Shanxi
population:37751200
province:ZheJiang
population:55080000
```

---

### 总结

1）Stream API方式是开销最低、效率最高，但编写代码复杂度也最高，在生成Json时，需要逐步编写符号和字段拼接json,在解析Json时，需要根据token指向也查找json值，生成和解析json都不是很方便，代码可读性也很低。

2）TreeModel处理Json，是以树型结构来生成和解析json，生成json时，根据json内容结构，我们创建不同类型的节点对象，组装这些节点生成json。解析json时，它不需要绑定json到java bean，根据json结构，使用path或get方法轻松查找内容。

3）Databinding处理Json是最常用的json处理方式，生成json时，创建相关的java对象，并根据json内容结构把java对象组装起来，最后调用writeValue方法即可生成json,解析时，就更简单了，直接把json映射到相关的java对象，然后就可以遍历java对象来获取值了。