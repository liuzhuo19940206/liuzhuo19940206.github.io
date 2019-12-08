---
title: Spring Boot与任务
categories:
  - SpringBoot
  - 任务
tags:
  - SpringBoot
  - 任务
date: 2018-11-17 10:12:03
summary: 异步任务、定时任务、邮件任务
---

异步任务、定时任务、邮件任务

## 异步任务

异步任务，是Spring帮我们开启线程池，创建一个新的线程来执行我们的方法，就不会有卡顿的现象。

在Java应用中，绝大多数情况下都是通过同步的方式来实现交互处理的；但是在处理与第三方系统交互的时候，容易造成响应迟缓的情况，之前大部分都是使用多线程来完成此类任务，其实，在Spring 3.x之后，就已经内置了@Async来完美解决这个问题。

<font color="red">**两个注解：**</font>
@EnableAysnc、@Aysnc

1）创建Springboot项目，添加Web模块。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117105809.png"/>

2) 创建service、controller模块
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117110232.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117110258.png"/>

3）启动Springboot应用

在浏览器中输入：`http://localhost:8080/async`
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117110457.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117110539.png"/>

4) 修改成异步执行

添加@Async注解：表示是异步方法。
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117110723.png"/>

在启动类上，添加@EnableAsync注解
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117110835.png"/>

5）重启应用

在浏览器中输入：`http://localhost:8080/async`

会发现，页面会瞬速响应，而控制台的执行任务的输出会停顿三秒。起到了异步的效果！

---

## 定时任务

项目开发中经常需要执行一些定时任务，比如需要在每天凌晨时候，分析一次前一天的日志信息。Spring为我们提供了异步执行任务调度的方式，提供**TaskExecutor 、TaskScheduler 接口**。

<font color="red">**两个注解**：</font>**@EnableScheduling、@Scheduled**

**cron表达式：**
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117111444.png" style="width:50%"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117111511.png" style="width:50%"/>

1）在service包：创建ScheduledService：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117113534.png"/>
```
@Service
public class ScheduledService {

    /**
     * second(秒) , minute(分), hour(时), day of month(日), month(月) , day of week.(周几)
     * 例子：[0 * * * * MON-SAT]:代表每月，每日，每时，每分每秒的周一到周六的0秒执行
     */
    @Scheduled(cron ="0 * * * * MON-SAT")
    public void hello(){
        System.out.println("hello ···");
    }
}
```

2）在启动类上，添加@EnableScheduling：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117113223.png"/>

3）启动应用
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117113757.png"/>

更多写法：参考上面的**cron表达式**

```
,(逗号)：枚举的意思，[0,1,2,3,4 * * * * *]:就是0、1、2、3、4秒执行一次

-(减号):区间的意思，[0-4 * * * * *] : 和上面的意思一样

/(斜杆):步长的意思，[0/4 * * * * *]:就是0秒开始执行，每隔4秒执行一次

当每日与周几冲突时，请使用 ？代替 *。
```

案例：
```
[0 0/5 14,18 * * ?]:每天14整点，和18整点，每隔5分钟执行一次。

[0 15 10 ? * 1-6]: 每个月的周一到周六10:15:00执行一次

[0 0 2 ？* 6L]:每个月的最后一个周六凌晨两点执行一次

[0 0 2 LW * ?]:每个月的最后一个工作日凌晨两点执行一次

[0 0 2-4 ? * 1#1]:每一个月的第一个周一凌晨2点到4点期间，每个整点，整秒执行一次。（ps：1#4 就是每个月的第四个周一）
```

---

## 邮件任务

• 邮件发送需要引入spring-boot-starter-mail
• Spring Boot 自动配置MailSenderAutoConfiguration
• 定义MailProperties内容，配置在application.yml中
• 自动装配JavaMailSender
• 测试邮件发送

接下来，我们演示：使用QQ邮箱给163邮箱发送邮件的案例

1）导入spring-boot-starter-mail依赖：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117120605.png"/>


2）配置邮件的信息：

spring.mail.username：设置发送者的邮箱的用户名

spring.mail.password：不是登入邮箱的密码，而是你的邮箱的服务器的生成的密码。

如果使用的是qq邮箱的话，打开qq邮箱，点击设置：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117121032.png"/>

然后点击**账号**，找到POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117121208.png"/>

将POP3/SMTP服务开启，点击开启：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117121406.png"/>

发送短信：点击我已发送：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117121551.png"/>

看到下面的密码了，就是你的设置密码了。

spring.mail.password=eaqltjcbbababcje

spring.mail.host：配置的是你的邮箱服务器的SMTP地址
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117121909.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117121941.png"/>

spring.mail.host=smtp.qq.com

完整的application配置文件内容：
```
#qq邮箱的用户名
spring.mail.username=575920824@qq.com
#你的服务器生成的POP3安全密码
spring.mail.password=eaqltjcbbababcje
#配置的是你的邮箱服务器的SMTP
spring.mail.host=smtp.qq.com
```

3) 在测试类下，编写发送邮件的测试方法
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117123107.png"/>
```
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringBoot04TaskApplicationTests {

	@Autowired
	private JavaMailSenderImpl javaMailSender;

	@Test
	public void sendSimpleMail(){
		SimpleMailMessage mailMessage = new SimpleMailMessage();
		//设置主题
		mailMessage.setSubject("今天下午7点到9点开会");
		//设置正文
		mailMessage.setText("关于XXX的会议");
		//设置接受者：你的163邮箱的账号
		mailMessage.setTo("18896991176@163.com");
		//设置发送者
		mailMessage.setFrom("575920824@qq.com");
		javaMailSender.send(mailMessage);
	}

}
```
4) 测试运行：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117123236.png"/>

发送成功：如果你的出现异常，请在application配置文件中：

添加：spring.mail.properties.mail.smtp.sst.enable=true

打开你的163邮箱：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117123535.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117123558.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117123648.png"/>

以上就是发送简单邮箱的方法，现在我们来发送复杂邮件，携带附件的邮箱：

```
	@Test
	public void sendMail() throws Exception{
		//创建复杂邮件
		MimeMessage mimeMessage = javaMailSender.createMimeMessage();
         //new一个复杂邮件的工具类
		//第二个参数：true，表示发送附件的邮箱
		MimeMessageHelper message = new MimeMessageHelper(mimeMessage,true);
		//设置主题
		message.setSubject("今天下午7点到9点开会");
		//设置正文,第二个参数：表示发送的是html的文本
		message.setText("<b style='color:red'>关于XXX的会议</b>",true);
		//设置接受者
		message.setTo("18896991176@163.com");
		//设置发送者
		message.setFrom("575920824@qq.com");

		//上传附件
		message.addAttachment("1.jpg",new File("C:\\Users\\liuzhuo\\Pictures\\Saved Pictures\\123.jpg"));
		message.addAttachment("2.jpg",new File("C:\\Users\\liuzhuo\\Pictures\\Saved Pictures\\gakki.jpg"));

		//发送邮件
		javaMailSender.send(mimeMessage);
	}
```

测试：
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117125016.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117125041.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/SpringBoot/renwu/QQ截图20181117125238.png"/>
