---
title: SpringMVC-Return Values返回值
date: 2018-10-24 15:44:17
categories: SpringMVC
tags: SpringMVC
summary: SpringMVC-Return Values返回值
---
**SpringMVC-Return Values返回值**

本篇文章，主要讲解SpringMVC的返回值的使用。



---

### Handler-Return Values返回值

#### @ResponseBody

 返回值通过HttpMessageConverters转换并写入响应。   请参阅@ResponseBody。     
 处理器功能处理方法的返回值作为响应体（通过HttpMessageConverter进行类型转换）；   
 作用： 该注解用于将Controller的方法返回的对象，通过适当的HttpMessageConverter转换为指定格式后，写入到Response对象的body数据区。    
 使用时机：返回的数据不是html标签的页面，而是其他某种格式的数据时（如json、xml等）使用；

#### HttpEntity,ResponseEntity

返回值:指定完整响应，包括HTTP标头和正文通过HttpMessageConverters转换并写入响应。 请参阅ResponseEntity。

#### HttpHeaders

为了返回一个响应头和没有正文。

#### String

一个视图名称，用ViewResolver解决，并与隐式模型一起使用 - 通过命令对象和@ModelAttribute方法确定。 处理程序方法也可以通过声明一个Model参数来以编程方式丰富模型。

#### View

用于与隐式模型一起渲染的View实例 - 通过命令对象和@ModelAttribute方法确定。 处理程序方法也可以通过声明一个Model参数来以编程方式丰富模型。

#### java.util.Map,org.springframework.ui.Model

要通过RequestToViewNameTranslator隐式确定的视图名称添加到隐式模型的属性。

#### @ModelAttribute

要通过RequestToViewNameTranslator隐式确定的视图名称添加到模型的属性。   请注意@ModelAttribute是可选的。

#### ModelAndView ，object

要使用的视图和模型属性，以及可选的响应状态。

#### void

具有void返回类型（或返回值为null）的方法如果还有ServletResponse，OutputStream参数或@ResponseStatus注释，则认为它已完全处理响应。  
如果控制器进行了积极的ETag或lastModified时间戳检查（请参阅@Controller缓存了解详细信息），情况也是如此。  
如果以上都不是这样，那么void返回类型也可能指示REST控制器的“无响应主体”，或HTML控制器的默认视图名称选择。

#### <font color="red">DeferredResult</font>

从任何线程异步生成任何上述返回值 - 例如 可能是由于某些事件或回调。

#### <font color="red">Callable</font>

Produce any of the above return values asynchronously in a Spring MVC managed thread. See Async Requests and Callable.使用异步线程来执行请求，然后返回给handler。

#### ListenableFuture, java.util.concurrent.CompletionStage,   java.util.concurrent.CompletableFuture

在Spring MVC托管线程中异步生成上述任何返回值。

#### ResponseBodyEmitter,   SseEmitter

用HttpMessageConverter's异步发出一个对象流写入响应; 也支持作为ResponseEntity的主体。

#### StreamingResponseBody

异步写入响应的OutputStream; 也支持作为ResponseEntity的主体。

#### Reactive   types — Reactor, RxJava, or others via ReactiveAdapterRegistry

具有多值流的DeferredResult（例如Flux，Observable）的替代方法被收集到列表中。    
对于流式场景 - 例如 text / event-stream，application / json +   stream - 使用SseEmitter和ResponseBodyEmitter，而在Spring MVC托管线程上执行ServletOutputStream阻塞I / O，并在每次写入完成时施加背压。

#### Any other return  value

 如果返回值与以上任何一个不匹配，默认情况下它被视为视图名称，如果它是String或void（通过RequestToViewNameTranslator应用的默认视图名称选择）; 或者作为要添加到模型的模型属性，除非它是一个简单的类型，由BeanUtils＃isSimpleProperty确定，在这种情况下，它仍然未解决。

---

### 返回ModelAndView/Model

controller方法中定义ModelAndView对象并返回，对象中可添加model数据、指定view。

Model与ModelAndView的传递效果是一样的，且传递是数据不能是引用类型。
重定向时，会把数据拼接到Url后面

@返回void 

啥也不做 - -

---

返回字符串

这玩意需要用到@ResponseBody注解

```java
@RestController
public class TestController {
  @RequestMapping("/test.action")
  public String  test( int ids){
      System.out.println("id:"+ids);
      return "this is test";
  }
}
```

逻辑视图名

这玩意需要你配置视图解析器

```java
INF/jsp/item/editItem.jsp
return "item/editItem";
```

Redirect重定向

Contrller方法返回结果重定向到一个url地址，如下商品修改提交后重定向到商品查询方法，参数无法带到商品查询方法中.
```java
//重定向到queryItem.action地址,request无法带过去
return "redirect:queryItem.action";
```
redirect方式相当于“response.sendRedirect()”，转发后浏览器的地址栏变为转发后的地址，因为转发即执行了一个新的request和response。


由于新发起一个request原来的参数在转发时就不能传递到下一个url，如果要传参数可以/item/queryItem.action后边加参数，如下：

/item/queryItem?…&…..

对于model设置的值，重定向会拼接到？key=value…. 版本4.3以后好像改了，记不太清了，你们可以自己去玩一下

---

forward转发

跟Redirect一样的用法，不同的是 转发可以传递参数
```java
//结果转发到editItem.action，request可以带过去
return "forward:editItem.action";
forward方式相当于“request.getRequestDispatcher().forward(request,response)”，转发后浏览器地址栏还是原来的地址。转发并没有执行新的request和response，而是和转发前的请求共用一个request和response。所以转发前请求的参数在转发后仍然可以读取到。
带域的返回
```