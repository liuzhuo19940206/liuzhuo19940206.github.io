---
title: SpringMVC-参数绑定
date: 2018-10-24 16:35:51
categories: SpringMVC
tags: SpringMVC
summary: SpringMVC-参数绑定
---
**SpringMVC-参数绑定**

探究SpringMVC中控制层的方法中的参数绑定

#### Model/ModelMap/ModelAndView

ModelMap是Model接口的实现类，通过Model或ModelMap向页面传递数据，如下
```java
    @RequestMapping("/itemEdit")
    public String itemEdit(Integer id, Model model) {
        Items items = itemService.getItemById(id);
        //向jsp传递数据
        model.addAttribute("item", items);
        //设置跳转的jsp页面
        return "editItem";
    }
    /*@RequestMapping("/itemEdit")
    public String editItem(HttpServletRequest request, 
            HttpServletResponse response, HttpSession session, Model model) {
        //从request中取参数
        String strId = request.getParameter("id");
        int id = new Integer(strId);
        //调用服务
        Items items = itemService.getItemById(id);
        //把结果传递给页面
        //ModelAndView modelAndView = new ModelAndView();
        //modelAndView.addObject("item", items);
        //设置逻辑视图
        //modelAndView.setViewName("editItem");
        //return modelAndView;
        //设置返回结果
        model.addAttribute("item", items);
        //返回逻辑视图
        return "editItem";
    }
    */
```
#### Any other argument原始参数

当请求的参数名称和处理器形参**名称一致时**会将请求参数与形参进行绑定。从Request取参数的方法可以进一步简化。
```java
      @RequestMapping("/itemEdit")
      public String itemEdit(Integer id, Model model) {
          Items items = itemService.getItemById(id);
          //向jsp传递数据
          model.addAttribute("item", items);
          //设置跳转的jsp页面
          return "editItem";
      }
  参数类型推荐使用包装数据类型，因为基础数据类型不可以为null
  整形：  Integer、int
  字符串：String
  单精度：Float、float
  双精度：Double、double
  布尔型：Boolean、boolean
  说明：对于布尔类型的参数，请求的参数值为true或false。
  处理方法：
  public String editItem(Model model,Integer id,Boolean status) throws Exception
  请求url：
  http://localhost:8080/xxx.action?id=2&status=false
  处理器形参中添加如下类型的参数处理适配器会默认识别并进行赋值。 
```

### 注解形式：

下面是具体使用说明，几乎都是下面这种格式：Public String (@RequestParam int id){..}

#### @RequestParam

@RequestParam用来接收路径后面的参数 
`http:www.lifeibai.com?petId = 1.  `
 一般用来处理接收的参数和形参的参数不一致的情况
```java
@RequestParam(value = "id",defaultValue = "10",required = false)
defaultValue 表示设置默认值，
required     通过boolean设置是否是必须要传入的参数，
value        值表示接受的传入的参数名称
使用@RequestParam常用于处理简单类型的绑定。
```

例子：
```java
@Controller
@RequestMapping("/pets")
public class EditPetForm {
  // ...
  @GetMapping
  public String setupForm(@RequestParam("petId") int Id, Model model) {
      Pet pet = this.clinic.loadPet(petId);
      model.addAttribute("pet", pet);
      return "petForm";
  }
  // ...
}
```

#### @RequestHeader

@RequestHeader用来接收指定参数的请求头信息
```java
@GetMapping("/demo")
public void handle(
      @RequestHeader("Accept-Encoding") String encoding,
      @RequestHeader("Keep-Alive") long keepAlive) {
  //...
}
```

#### @CookieValue

用来接收指定名称的cookie的值
```java
public void handle(@CookieValue("JSESSIONID") String cookie) {
  //...
}
```

#### <font color="red">@ModelAttribute</font>

ModelAttribute可以应用在**方法参数上**或**方法上**，他的作用主要是当注解在方法参数上时会将注解的参数对象添加到Model中；

当注解在请求处理方法Action上时会将该方法变成一个非请求处理的方法，但其它Action被调用时会**首先**调用该方法。

<font color="#FF3E96">被@ModelAttribute注释的方法会在此controller每个方法执行前被执行，下面访问 http:localhost:8080/test_project/test.action</font>
```java
  @RestController
  @SessionAttributes("user")
  public class TestController {
      @ModelAttribute("age2")
      public String mdoeltest1(){
          System.out.println("This is ModelAttribute1 !");
          return "33";
      }
      @ModelAttribute("age1")
      public String mdoeltestrrr(){
          System.out.println("This is ModelAttributee1 !");
          return "22";
      }
      @RequestMapping("/test.action")
      public String test(User user , 
                         @ModelAttribute("age1") String age1 ,
                         @ModelAttribute("age2") String age2 ,
                         HttpSession session){
          Object user2 = session.getAttribute("user");
          System.out.println(user2);
          System.out.println(user);
          System.out.println("age1:"+age1);
          System.out.println("age2:"+age2);
          return "test";
      }
  }
  结果：
  This is ModelAttributee1 !
  This is ModelAttribute1 !
  User{name='李四', age=22}
  User{name='李四', age=22}
  age1:22
  age2:33
```

#### @SessionAttributes

Value={“name”,“age”} 取出name或者value、或者把model中的name，age扔到session中
Type=User.Class   将一个实体类扔到session中
这个玩意加在 类上面，然后所有的方法的参数都可以在sesssion中找，找到了就赋值。
@SessionAttributes需要清除时，使用SessionStatus.setComplete();来清除。

1、  将model中的值，扔到session中

```java
@Controller
@SessionAttributes(types = User.class)
public class LoginController {
  @RequestMapping("/login")
  public String login(HttpServletRequest req,Model model,SessionStatus status){
      User user = new User();
      user.setName("李四");
      user.setAge(22);
      model.addAttribute("user" , user);
      return "forward:test.action";
  }
}
```

2、  从session取出来
```java
@RestController
@SessionAttributes("user")
public class TestController {
  @RequestMapping("/test.action")
  public String  test(User user, HttpSession session){
      Object user2 = session.getAttribute("user");
      System.out.println(user2);
      System.out.println(user);
      return "test";
  }
}

```

#### @SessionAttribute

这玩意是加在方法上的参数的，将session中的数据赋值给参数 。但是4.3以后的版本才支持
```java
@RequestMapping("/")
public String handle(@SessionAttribute User user) {
    // ...
}
```

#### @RequestBody

@RequestBody注解用于读取http请求的内容(字符串)，通过springmvc提供的HttpMessageConverter接口将读到的内容转换为json、xml等格式的数据并绑定到controller方法的参数上
```java
List.action?id=1&name=zhangsan&age=12
本例子应用：
@RequestBody注解实现接收http请求的json数据，将json数据转换为java对象
// 商品修改提交json信息，响应json信息
  @RequestMapping("/editItemSubmit_RequestJson")
  public @ResponseBody Items editItemSubmit_RequestJson(@RequestBody Items items) throws Exception {
      System.out.println(items);
      //itemService.saveItem(items);
      return items;
  }
```

#### @ResponseBody

该注解用于将Controller的方法返回的对象，通过HttpMessageConverter接口转换为指定格式的数据如：json,xml等，通过Response响应给客户端

@ResponseBody注解实现将controller方法返回对象转换为json响应给客户端

**<font color=red>使用这个注解 ，sessionAttributes注解将会失效</font>**

#### @PathVariable（RESTful）
```java
用法:
     @RequestMapping(value="/users/{userId}/topics/{topicId}")
     public String test(
     @PathVariable(value="userId") int userId, 
     @PathVariable(value="topicId") int topicId) 
     如请求的URL为“控制器URL/users/123/topics/456”，
     则自动将URL中模板变量{userId}和{topicId}绑定到
     通过@PathVariable注解的同名参数上，即入参后userId=123、topicId=456。
```

