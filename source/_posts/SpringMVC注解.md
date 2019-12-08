---
title: SpringMVC注解
date: 2018-10-24 17:07:31
categories: SpringMVC
tags: SpringMVC
summary: SpringMVC注解的详细解答
---
**SpringMVC注解**

SpringMVC注解的详细解答

### 注解概观

**Spring2.5 引入注解式处理器**

@Controller：用于标识是处理器类；

@RequestMapping：请求到处理器功能方法的映射规则；

@RequestParam：请求参数到处理器功能处理方法的方法参数上的绑定；

@ModelAttribute：请求参数到命令对象的绑定；

@SessionAttributes：用于声明session级别存储的属性，放置在处理器类上，通常列出模型属性（如@ModelAttribute）对应的名称，则这些属性会透明的保存到session中；

@InitBinder：自定义数据绑定注册支持，用于将请求参数转换到命令对象属性的对应类型；

---

**Spring3.0 引入RESTful架构风格支持(通过@PathVariable注解和一些其他特性支持),且又引入了更多的注解支持**

@CookieValue：cookie数据到处理器功能处理方法的方法参数上的绑定；

@RequestHeader：请求头（header）数据到处理器功能处理方法的方法参数上的绑定；

@RequestBody：请求的body体的绑定（通过HttpMessageConverter进行类型转换）；

@ResponseBody：处理器功能处理方法的返回值作为响应体（通过HttpMessageConverter进行类型转换）；

@ResponseStatus：定义处理器功能处理方法/异常处理器返回的状态码和原因；

@ExceptionHandler：注解式声明异常处理器；

@PathVariable：请求URI中的模板变量部分到处理器功能处理方法的方法参数上的绑定

### 类与方法注解

@Controller @RestController

@RestContrller注解相当于@ResponseBody和@Controller的结合 :

#### @ResponseBody

通过HttpMessageConverter接口转换为指定格式的数据

#### @InitBinder-局部转换器

如果希望某个属性编辑器仅作用于特定的 Controller ，

可以在 Controller 中定义一个标注 @InitBinder 注解的方法，

可以在该方法中向 Controller 了注册若干个属性编辑器

例如:
```java
@InitBinder
public void initBinder(WebDataBinder binder) {
    SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    dateFormat.setLenient(false);
    binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
}
```

#### @RequestMapping-请求路径映射

RequestMapping是一个用来处理请求地址映射的注解（将请求映射到对应的控制器方法中），可用于类或方法上。用于类上，表示类中的所有响应请求的方法都是以该地址作为父路径。

RequestMapping请求路径映射，如果标注在某个controller的类级别上，则表明访问此类路径下的方法都要加上其配置的路径；最常用是标注在方法上，表明哪个具体的方法来接受处理某次请求。

属性:
```java
RequestMapping注解有六个属性，下面我们把她分成三类进行说明（下面有相应示例）。
1、 value， method；
value：   指定请求的实际地址，指定的地址可以是URI Template 模式（后面将会说明）；
method：  指定请求的method类型， GET、POST、PUT、DELETE等；
2、consumes，produces
consumes： 指定处理请求的提交内容类型（Content-Type），例如application/json, text/html;
produces:  指定返回的内容类型，仅当request请求头中的(Accept)类型中包含该指定类型才返回；
3、params，headers
params：  指定request中必须包含某些参数值是，才让该方法处理。
headers： 指定request中必须包含某些指定的header值，才能让该方法处理请求。
```

派生的子类：
```
Ø  @GetMapping

Ø  @PostMapping

Ø  @PutMapping

Ø  @DeleteMapping

Ø  @PatchMapping
```

属性详解：

##### <font size=4>value</font>的用法

(1)普通的具体值。如前面的 value="/book"。
```java
@RequestMapping(value="/get/{bookId}")
public String getBookById(@PathVariable String bookId,Model model){
  model.addAttribute("bookId", bookId);
  return "book";
} 
```

(2)含某变量的一类值。

(3)ant风格
```java
  @RequestMapping(value="/get/id?")：可匹配“/get/id1”或“/get/ida”，但不匹配“/get/id”或“/get/idaa”;
  @RequestMapping(value="/get/id*")：可匹配“/get/idabc”或“/get/id”，但不匹配“/get/idabc/abc”;
  @RequestMapping(value="/get/id/*")：可匹配“/get/id/abc”，但不匹配“/get/idabc”;
  @RequestMapping(value="/get/id/**/{id}")：可匹配“/get/id/abc/abc/123”或“/get/id/123”，也就是Ant风格和URI模板变量风格可混用。
```

(4)含正则表达式的一类值
```java
@RequestMapping(value="/get/{idPre:\d+}-{idNum:\d+}")：
可以匹配“/get/123-1”，但不能匹配“/get/abc-1”，这样可以设计更加严格的规则。
可以通过@PathVariable 注解提取路径中的变量(idPre,idNum)
```

(5)或关系
```java
@RequestMapping(value={"/get","/fetch"} ) 即 /get或/fetch都会映射到该方法上。
```

##### <font size=4>method</font>

指定请求的method类型， GET、POST、PUT、DELETE等；

用法:
```java
@RequestMapping(value="/get/{bookid}",method={RequestMethod.GET,RequestMethod.POST})
```

##### <font size=4>params：</font>

**指定request中必须包含某些参数值是，才让该方法处理。**

@RequestMapping(params="action=del")，请求参数包含"action=del",如：

`http://localhost:8080/book?action=del`

```java
@Controller
@RequestMapping("/owners/{ownerId}")
public class RelativePathUriTemplateController {
    
    @RequestMapping(value = "/pets/{petId}", method = RequestMethod.GET, params="myParam=myValue")
    public void findPet(@PathVariable String ownerId, @PathVariable String petId, Model model) {    
        // implementation omitted
    }
}
仅处理请求中包含了名为“myParam”，值为“myValue”的请求
```

##### <font size=4>headers：</font>

指定request中必须包含某些指定的header值，才能让该方法处理请求。

@RequestMapping(value="/header/id", headers = "Accept=application/json")：

表示请求的URL必须为“/header/id 且请求头中必须有“Accept =application/json”参数即可匹配。
```java
@Controller
@RequestMapping("/owners/{ownerId}")
public class RelativePathUriTemplateController {

	@RequestMapping(value = "/pets", method = RequestMethod.GET, headers="Referer=http://www.ifeng.com/")
	public void findPet(@PathVariable String ownerId, @PathVariable String petId, Model model) {    
	  // implementation omitted
	}

}
    仅处理request的header中包含了指定“Refer”请求头和对应值为“http://www.ifeng.com/”的请求。
```

##### <font size=4>consumes：</font>

指定处理请求的提交内容类型（Content-Type），例如application/json, text/html。

用法:

@RequestMapping(value = "/pets", method = RequestMethod.POST, consumes="application/json")
```java
@Controller
@RequestMapping(value = "/pets", method = RequestMethod.POST, consumes="application/json")
public void addPet(@RequestBody Pet pet, Model model) {    
  // implementation omitted
}
  该方法仅处理request Content-Type为“application/json”类型的请求。
```

