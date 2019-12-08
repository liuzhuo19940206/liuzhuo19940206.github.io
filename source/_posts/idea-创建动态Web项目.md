---
title: idea 创建动态Web项目
categories: [web]
tags: [web]
date: 2018-10-28 18:15:11
summary: idea创建动态Web项目
---

intellij idea这个开发工具功能强大，但是大部分人都习惯eclipse 开发，所以对这个工具还不是太了解。今天就使用idea来创建动态web项目。


### idea 创建动态Web项目

打开idea

我使用的是2017版本的。

(1)点击左上角的File--> new --> Project 
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028182054.png"/>

(2)之后会弹出一个选择框，选择Java Enterprise ，网上有的会说选择第一个java 当然也是可行的 ，两者之间有一点点细微的差别啦，当然别忘记**勾选Web Application**,点击Next。
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028191302.png"/>

(3)填好项目名称，和项目路径，Finish。
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028191740.png"/>

(4)完成后，需要添加web.xml文件。在**idea201703版本之前**。在第二步的选择Web Application时，可以选择版本号，并创建web.xml文件。但是之后的版本没有。我们可以手工创建，但是麻烦，教大家另外的创建方法。

打开 Project Structure（Ctrl+Alt+Shift+S），在 facets 里**选中次级的 web 或者 在Modules 中选中web**，在deployment Descriptors面板里，点击 +号选择web.xml以及版本号。然后在弹出的对话框中修改xml默认的目录，加上web就可以了。 
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028194446.png" style="width:50%"/>
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028194836.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028195525.png" style="width:50%"/>

这样就把 WEB-INF web.xml 添加上了 。
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028195719.png" style="width:50%"/>

.idea文件夹和webapp.iml是IDEA自动创建的，包含了工程和模块的配置数据 
src文件夹是源码目录 
web文件夹相当于eclipse创建的web工程WebContent文件夹，包含了WEB-INF/web.xml及index.jsp 
External Libraries包含了JDK及Tomcat带的jsp-api、servlet-api jar文件

(4)完善工程目录，点击WEF-INF  ,右键，NEW-->Directory  创建两个文件夹，``classes`` 和 ``lib``  **这两个名字不要改哦！**

4.1 创建classes文件夹
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028200211.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028200344.png" style="width:50%"/>

4.2 同理，创建lib文件夹
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028200618.png" style="width:50%"/>

(5) 完成后再点击File , 选择Project Structure  

点击Modules , 选择Paths , 选中 Use module compile output path , 将Outputpath 和 Test output path 都设置为刚刚创建的classes文件夹。
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028201015.png"/>

**点击apply就行，接着第六步。**

(6) 点击path旁边的``Dependencies``, 点击"+"号，选择: 1 JARs or directories 
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028201526.png"/>

选择刚刚创建的lib。
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028201634.png"/>

选择第三个，jar Directory。一路ok到底！
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028201803.png" style="width:50%"/>

(7) 配置servlet容器：Tomcat
点击右上角的tomcat的向下的小三角，然后点击Edit Configurations
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028202512.png" style="width:30%"/>

看tomcat已经有啦，这是java Enterprise的好处啦，点击Deployment。
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028203004.png"/>
1，设置On frame deactivation : Update classes and resources     
2，设置自己的jre位置路径。（jdk对应的jre）

Application context可以填也可以不填，配置后，访问网站就必须加上这个路径了。
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028203156.png"/>
点击ok。

(8) 点击index.jsp，随便写一段话，比如helloworld。
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028203422.png"/>

(9) 运行程序，就点击右上角的绿色图标
<img src="https://gakkil.gitee.io/gakkil-image/idea/web/QQ%E6%88%AA%E5%9B%BE20181028203713.png"/>

### WEB-INF目录与META-INF目录的作用

1) /WEB-INF/web.xml

Web应用程序配置文件，描述了 servlet 和 其他的应用组件配置及命名规则。

2) /WEB-INF/classes/

包含了站点所有的 class 文件，包括 servlet.class 和 非servlet.class，他们不能包含在 .jar文件中。

3) /WEB-INF/lib/

存放web应用需要的各种JAR文件，放置仅在这个应用中要求使用的jar文件,如数据库驱动jar文件。

4) /WEB-INF/src/

源码目录，按照包名结构放置各个Java文件。

5) /WEB-INF/database.properties

数据库配置文件

6) /WEB-INF/tags/

存放了自定义标签文件，该目录并不一定为 tags，可以根据自己的喜好和习惯为自己的标签文件库命名，当使用自定义的标签文件库名称时，在使用标签文件时就必须声明正确的标签文件库路径。例如：当自定义标签文件库名称为 simpleTags 时，在使用 simpleTags 目录下的标签文件时，就必须在 jsp 文件头声明为：<%@ taglibprefix="tags" tagdir="/WEB-INF/simpleTags" % >。

7) /WEB-INF/jsp/

jsp 1.2 以下版本的文件存放位置。改目录没有特定的声明，同样，可以根据自己的喜好与习惯来命名。此目录主要存放的是 jsp 1.2 以下版本的文件，为区分 jsp 2.0 文件，通常使用 jsp 命名，当然你也可以命名为 jspOldEdition 。

8) /WEB-INF/jsp2/

与 jsp 文件目录相比，该目录下主要存放 Jsp 2.0 以下版本的文件，当然，它也是可以任意命名的，同样为区别 Jsp 1.2以下版本的文件目录，通常才命名为 jsp2。

9) META-INF

相当于一个信息包，目录中的文件和目录获得Java 2平台的认可与解释，用来配置应用程序、扩展程序、类加载器和服务manifest.mf文件，在用jar打包时自动生成。

### META-INF有什么用？它跟WEB-INF有什么区别？

WEB-INF是在使用web 项目才会有这个文件夹,普通的j2se项目是没有这个文件夹的。

META-INF 存放程序入口相关信息, 每个jar 都会有这个文件夹,里面的 MANIFEST文件 记录下面这些信息。我们把MANIFEST中的配置信息进行分类，可以归纳出下面几个大类：
```
一. 一般属性　　
1. Manifest-Version　　用来定义manifest文件的版本，例如：Manifest-Version: 1.0　　
2. Created-By　　	声明该文件的生成者，一般该属性是由jar命令行工具生成的，例如：Created-By: Apache Ant 1.5.1　　
3. Signature-Version　　定义jar文件的签名版本　　
4. Class-Path　　应用程序或者类装载器使用该值来构建内部的类搜索路径　　
二. 应用程序相关属性　　
1. Main-Class　　定义jar文件的入口类，该类必须是一个可执行的类，一旦定义了该属性即可通过 java -jar x.jar来运行该jar文件。　　
三. 小程序(Applet)相关属性　　
1. Extendsion-List　　该属性指定了小程序需要的扩展信息列表，列表中的每个名字对应以下的属性　　
2. <extension>-Extension-Name　　
3. <extension>-Specification-Version　　
4. <extension>-Implementation-Version　　
5. <extension>-Implementation-Vendor-Id　　
6. <extension>-Implementation-URL　　
四. 扩展标识属性　　
1. Extension-Name　　该属性定义了jar文件的标识，例如Extension-Name: Struts Framework　　
五. 包扩展属性　　
1. Implementation-Title 定义了扩展实现的标题　　
2. Implementation-Version 定义扩展实现的版本　　
3. Implementation-Vendor 定义扩展实现的组织 　　
4. Implementation-Vendor-Id 定义扩展实现的组织的标识　　
5. Implementation-URL : 定义该扩展包的下载地址(URL)　　
6. Specification-Title 定义扩展规范的标题　　
7. Specification-Version 定义扩展规范的版本　　
8. Specification-Vendor 声明了维护该规范的组织　　
9. Sealed 定义jar文件是否封存，值可以是true或者false (这点我还不是很理解)　　
六. 签名相关属性　　
签名方面的属性我们可以来参照JavaMail所提供的mail.jar中的一段　　
Name: javax/mail/Address.class　　
Digest-Algorithms: SHA MD5 　　
SHA-Digest: AjR7RqnN//cdYGouxbd06mSVfI4=　　
MD5-Digest: ZnTIQ2aQAtSNIOWXI1pQpw==　　
这段内容定义类签名的类名、计算摘要的算法名以及对应的摘要内容(使用BASE64方法进行编码)
```

### 为什么需要把页面放在WEB-INF文件夹下面？

1. 基于不同的功能 JSP 被放置在不同的目录下

这种方法的问题是这些页面文件容易被偷看到源代码，或被直接调用。某些场合下这可能不是个大问题，可是在特定情形中却可能构成安全隐患。用户可以绕过Struts的controller直接调用JSP同样也是个问题。

为了减少风险，可以把这些页面文件移到WEB-INF 目录下。基于Servlet的声明，WEB-INF不作为Web应用的公共文档树的一部分。因此，WEB-INF 目录下的资源不是为客户直接服务的。我们仍然可以使用WEB-INF目录下的JSP页面来提供视图给客户，客户却不能直接请求访问JSP。

 

2. JSP存放在 WEB-INF 目录下更为安全

如果把这些JSP页面文件移到WEB-INF 目录下，在调用页面的时候就必须把"WEB-INF"添加到URL中。

我们知道，实现页面的跳转有两种方式，一种是通过redirect的方式，一种是通过forward的方式。redirect方式的跳转，系统会在一个新的页面打开要跳转的网页；而forward方式跳转，系统会在原来的页面上打开一个要跳转的网页。所以放到WEB-INF目录下的文件是不允许采用redirect方式的跳转来访问的.

WEB-INF文件夹是受保护的文件夹，外部无法访问这个文件夹内的文件，只有服务器内部才能访问。

重要的服务器初始化核心文件web.xml就这在个文件夹内。

为了达到服务器端访问的目的，我们可以使用action进行转向，我们先去请求一个action，然后由这个action转发到WEB-INF下的页面，这样客户端就可以访问了。