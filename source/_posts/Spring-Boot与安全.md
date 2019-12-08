---
title: Spring Boot与安全
categories:
  - SpringBoot
  - 安全
tags:
  - SpringBoot
  - 安全
date: 2018-11-18 10:32:55
summary: SpringSecurity的安全认证
---

安全、Spring Security. 比如身份认证，用户权限等，市面上有两大主流安全框架：第一个是Apache的 **Shiro**，第二个就是Spring的**Security**。

## 安全

**Spring Security**是针对Spring项目的安全框架，也是Spring Boot底层安全模块默认的技术选型。他可以实现强大的web安全控制。对于安全控制，我们仅需引入spring-boot-starter-security模块，进行少量的配置，即可实现强大的安全管理。

几个类：

- WebSecurityConfigurerAdapter：自定义Security策略
- AuthenticationManagerBuilder：自定义认证策略
- @EnableWebSecurity：开启WebSecurity模式

应用程序的两个主要区域是“认证”和“授权”（或者访问控制）。这两个主要区域是Spring Security 的两个目标。

• “认证”（Authentication），是建立一个他声明的主体的过程（一个“主体”一般是指用户，设备或一些可以在你的应用程序中执行动作的其他系统）。

• “授权”（Authorization）指确定一个主体是否允许在你的应用程序执行一个动作的过程。为了抵达需要授权的店，主体的身份已经有认证过程建立。

• 这个概念是通用的而不只在Spring Security中。

1) 创建新的Springboot项目，添加Web、Themleaf模块：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118110926.png"/>

2) 在resources中书写页面：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118111136.png"/>

3）书写一个java类：(KungfuController)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118111658.png"/>
```
@Controller
public class KungfuController {
    private final String PREFIX = "pages/";

    /**
     * 欢迎页
     *
     * @return
     */
    @GetMapping("/")
    public String index() {
        return "welcome";
    }

    /**
     * 登陆页
     *
     * @return
     */
    @GetMapping("/userlogin")
    public String loginPage() {
        return PREFIX + "login";
    }


    /**
     * level1页面映射
     *
     * @param path
     * @return
     */
    @GetMapping("/level1/{path}")
    public String level1(@PathVariable("path") String path) {
        return PREFIX + "level1/" + path;
    }

    /**
     * level2页面映射
     *
     * @param path
     * @return
     */
    @GetMapping("/level2/{path}")
    public String level2(@PathVariable("path") String path) {
        return PREFIX + "level2/" + path;
    }

    /**
     * level3页面映射
     *
     * @param path
     * @return
     */
    @GetMapping("/level3/{path}")
    public String level3(@PathVariable("path") String path) {
        return PREFIX + "level3/" + path;
    }
}
```

这里，大家可以有自己的页面，和controller类，只是简单的访问页面而已，没有什么业务逻辑。

4）启动Springboot应用：

在浏览器中输入：`http://localhost:8080/`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118112006.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118112040.png"/>

这里是，thymeleaf的版本比较低。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118112604.png"/>

我们要切换成3版本以上的。切换thymeleaf的时候，不要忘记thymeleaf-layout的版本。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118113001.png"/>

5）重启Springboot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118113131.png"/>

页面解析成功。

---

上面，是没有使用Spring Security的功能，页面上的所有超链接都能访问。

### 整合Spring Security模块
现在，我们加入Spring Security模块。

1）导入：spring-boot-starter-security
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118122302.png"/>

2）打开Spring的官网，找到Spring Security模块：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118122433.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118122802.png"/>

[官方参考文档](https://docs.spring.io/spring-security/site/docs/4.2.8.RELEASE/guides/html5/helloworld-boot.html)

说明，第一步，我们需要写一个Spring Security的配置类，标记@EnableWebSecurity注解，并且继承 WebSecurityConfigurerAdapter

在我们的项目中，添加config包，并创建MySecurityConfig类：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118140618.png"/>
```
@EnableWebSecurity
public class MySecurityConfig extends WebSecurityConfigurerAdapter {

    //设置访问权限的
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //super.configure(http);
        http.authorizeRequests().mvcMatchers("/").permitAll()
                .mvcMatchers("/level1/**").hasRole("VIP1")
                .mvcMatchers("/level2/**").hasRole("VIP2")
                .mvcMatchers("/level3/**").hasRole("VIP3");
    }
}
```

以上的方法的，就是访问"/": 所有的人都可以访问，而访问"/level1/**"下的请求，必须是"VIP1"用户，其他类似。

现在重启Springboot应用：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118140836.png"/>

访问普通武功秘籍下的超链接：罗汉拳、武当长拳、全真剑法其中的任意一个。

**PS：普通武功秘籍是level1，高级武功秘籍是level2，绝世武功秘籍是level3**

比如访问：罗汉拳(/level1/1)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118141225.png"/>

现在出现了，403：拒绝访问，即没有访问权限！

接下来，我们配置授权的用户：

修改configure方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118141803.png"/>

此时重启，访问罗汉拳的话，会重定向到/login请求，请求登入：(Spring Security 自动帮我们配合的)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118141855.png"/>

此时，还没有配置用户信息，在MySecurityConfig类：添加新的方法：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118142152.png"/>
```
    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication()
                .withUser("zhangsan").password("123456").roles("VIP1","VIP2")
                .and()
                .withUser("lisi").password("123456").roles("VIP2","VIP3")
                .and()
                .withUser("wangwu").password("123456").roles("VIP1","VIP3");
    }
```

**注意：**使用inMemoryAuthentication：是在内存中配合用户的信息，这里是简单起见，我们一般需要将配置保存到数据库中。

这里，配置了用户名：zhangsan，密码：123456，用户的角色是:VIP1,VIP2. 其他类似。

重启应用，访问罗汉拳：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118142453.png"/>
登入用户和密码：zhangsan，123456
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118142545.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118142639.png"/>
访问成功，有level1的权限。

点击返回，访问**普通武功秘籍** 和 **高级武功秘籍** 下的，**其他秘籍**，此时都不会被拦截了。

因为张三用户，有level1 和 level2 的访问权限。如果访问 **绝世武功秘籍(level3)**，就会出现403.

### 注销登入

现在，我们只能登入用户，还不能注销，怎么注销用户呢？

1）修改MySecurityConfig的：configure(HttpSecurity http)
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118144712.png"/>
```
    //设置访问权限的
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //super.configure(http);
        http.authorizeRequests().mvcMatchers("/").permitAll()
                .mvcMatchers("/level1/**").hasRole("VIP1")
                .mvcMatchers("/level2/**").hasRole("VIP2")
                .mvcMatchers("/level3/**").hasRole("VIP3")
                .and()
                //自动配置了授权的,当没有权限的时候，会让你登入
                //自动重定向到/login请求，请求登陆。
                .formLogin();

        //自动帮我们注销登入。
        //1.需要在页面发一个/logout的post请求
        //2.注销成功后，会重定向到：login?logout，会让你重新登入。
        http.logout();
    }
```

2）在welcome页面中，添加注销的按钮：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118144334.png"/>

3）启动程序

先登入用户成功，访问能访问的权限，都可以！然后点击注销按钮：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118144520.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118144648.png"/>

注销成功。

如果，我们不想让注销成功后，返回登入页面呢？那可以修改配置：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118144937.png"/>

此时，注销成功后会跳转到主页了。

### 完成我们的security模块

现在，我们想让登入成功后，显示XX登入成功，给他看见能够访问的页面信息，不能访问的就不显示出来。

1）这里我们需要thymeleaf提供的安全的标签功能，需要导入相关的模块：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118150104.png"/>

2）在我们的welcome页面中。添加安全的命名空间：
```
xmlns:sec="http://www.thymeleaf.org/thymeleaf-extras-springsecurity4"
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118150442.png"/>

接下来：我们就可以使用 sec 前缀的标签了。

给 登入 和 注销 添加 div 然后判断是否有权限：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118150837.png"/>

给三大武功秘籍，添加用户权限：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118151321.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118151330.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118151342.png"/>

重启应用：

观察我们的应用效果！

### 记住我

只要在：MySecurityConfig 类中的：configure(HttpSecurity http)方法中：
```
http.rememberMe();
```
这样的话，spring Security就会记住密码，下次不需要登入，直接进入。原理就是发了一个remember-me的cookie而已。

---

如果，想要修改登入界面，使用我们自己定义的登入页面：
```
http.formLogin().loginPage("/userlogin");
```

这样的话，就是发送这个/userlogin请求，跳转到我们自定义的页面，然后：使用 post请求的：/userlogin来登入。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118164447.png"/>

这里的 用户名 和 密码的 name属性怎么设置呢？

使用：usernameParameter 和 passwordParameter 来修改。

默认是：username 和 password

即：不配置的话
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118164712.png"/>

配置的话：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118164847.png"/>
```
        //自动配置了授权的,当没有权限的时候，会让你登入
        //自动重定向到/login请求，请求登陆。
        http.formLogin().loginPage("/userlogin")
                        .usernameParameter("uName")
                        .passwordParameter("pName");
```
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/security/QQ截图20181118164936.png"/>

