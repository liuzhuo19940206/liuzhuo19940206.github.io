---
title: Tomcat的总体框架设计
categories:
  - tomcat
  - 源码
tags:
  - tomcat
  - 源码
date: 2019-01-16 16:35:23
summary: tomcat的总体框架设计
---

今天来学习tomcat的总体框架设计，帮助大家理解web的执行流程，fighting~~~

tomcat的总体架构如下图所示：

<img src="https://gakkil.gitee.io/gakkil-image/tomcat/QQ截图20190116163946.png"/>

如上图所示，tomcat由：Server、Service、Engine、Connerctor、Host、Context组件组成，其中带有s的代表在一个tomcat实例上可以存在多个组件，比如Context(s)，tomcat允许我们部署多个应用，每个应用对应一个Context。这些组件在tomcat的**conf/server.xml**文件中可以找到，对tomcat的调优需要改动该文件。

`server.xml:`

```
<Server port="8005" shutdown="SHUTDOWN">
<Service name="Catalina">
    <Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443" />

    <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />

    <Engine name="Catalina" defaultHost="localhost">

      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">
        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t "%r" %s %b" />
      </Host>
    </Engine>
</Service>
</Server>
```
Tomcat加载时，相应组件（容器）的配置参数都是从这个文件读进去的，这个文件也是Tomcat性能优化的关键。接下来我们就根据上图以及conf/server.xml的内容来一步步描述一下上面所说的各种组件吧。

---

### Server

Server是Tomcat中最顶层的组件，它可以包含多个Service组件。在Tomcat源代码中Server组件对应源码中的  org.apache.catalina.core.StandardServer 类。StandardServer的继承关系图如下图所示：
<img src="https://gakkil.gitee.io/gakkil-image/tomcat/QQ截图20190116165355.png"/>

Lifecycle是Tomcat的生命周期接口。保持组件启动和停止一致的的机制通过实现org.apache.catalina.Lifecycle接口来实现。

* Server继承至LifeCycle，LifeCycle是一个非常重要的接口，各大组件都继承了这个接口，用于管理tomcat的生命周期，比如init、start、stop、destory；另外，它使用了观察者模式，LifeCycle是一个监听者，它会向注册的LifecycleListener观察者发出各种事件

* Server提供了findService、getCatalina、getCatalinaHome、getCatalinaBase等接口，支持查找、遍历Service组件，这里似乎看到了和Serivce组件的些许联系。

```
public interface Server extends Lifecycle {

    public NamingResourcesImpl getGlobalNamingResources();

    public void setGlobalNamingResources(NamingResourcesImpl globalNamingResources);

    public javax.naming.Context getGlobalNamingContext();

    public int getPort();

    public void setPort(int port);

    public String getAddress();

    public void setAddress(String address);

    public String getShutdown();

    public void setShutdown(String shutdown);

    public ClassLoader getParentClassLoader();

    public void setParentClassLoader(ClassLoader parent);

    public Catalina getCatalina();

    public void setCatalina(Catalina catalina);

    public File getCatalinaBase();

    public void setCatalinaBase(File catalinaBase);

    public File getCatalinaHome();

    public void setCatalinaHome(File catalinaHome);

    public void await();

    public Service findService(String name);

    public Service[] findServices();

    public void removeService(Service service);

    public Object getNamingToken();
}
```

---

### Service

Service的默认实现类是StardardService，类结构和StardardServer很相似，也是继承至LifecycleMBeanBase，实现了Service接口。

Service组件相当于Connetor和Engine组件的包装器，它将一个或者多个Connector组件和一个Engine建立关联。上述配置文件中，定义一个叫Catalina的服务，并将Http,AJP（定向包的协议）这两个Connector关联到了一个名为Catalina的Service，注意一个Connetor对应处理一种协议。Service组件对应Tomcat源代码中的org.apache.catalina.core.StandardService,StandardService的继承关系图如下图所示：

<img src="https://gakkil.gitee.io/gakkil-image/tomcat/QQ截图20190116170002.png"/>

由Service接口不难发现Service组件的内部结构 

* 持有Engine实例

* 持有Server实例 

* 可以管理多个Connector实例

* 持有Executor引用

```
public class StandardService extends LifecycleMBeanBase implements Service {
    // 省略若干代码
}

public interface Service extends Lifecycle {

    public Engine getContainer();

    public void setContainer(Engine engine);

    public String getName();

    public void setName(String name);

    public Server getServer();

    public void setServer(Server server);

    public ClassLoader getParentClassLoader();

    public void setParentClassLoader(ClassLoader parent);

    public String getDomain();

    public void addConnector(Connector connector);

    public Connector[] findConnectors();

    public void removeConnector(Connector connector);

    public void addExecutor(Executor ex);

    public Executor[] findExecutors();

    public Executor getExecutor(String name);

    public void removeExecutor(Executor ex);

    Mapper getMapper();
}
```

---

### Connector

Connector是tomcat中监听TCP端口的组件，server.xml默认定义了两个Connector，分别用于监听http、ajp端口。对应的代码是org.apache.catalina.connector.Connector，它是一个实现类，并且实现了Lifecycle接口。

```
<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />
```
* HTTP/1.1
<Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" /> 上面定义了一个Connector，它缺省监听端口8080,这个端口我们可以根据具体情况进行改动。connectionTimeout定义了连接超时时间，单位是毫秒，redirectPort定义了ssl的重定向接口，根据缺省的配置，Connector会将ssl请求重定向到8443端口。

```
<Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />
```
* AJP/1.3
AJP表示Apache Jserv Protocol,此连接器将处理Tomcat和Apache http服务器之间的交互，这个连接器是用来处理我们将Tomcat和Apache http服务器结合使用的情况。假如在同样的一台物理Server上面部署了一台Apache http服务器和多台Tomcat服务器，通过Apache服务器来处理静态资源以及负载均衡的时候，针对不同的Tomcat实例需要AJP监听不同的端口。**但是，在实际的项目应用中，AJP协议并不常用，大多数应用场景会使用 nginx + tomcat 实现负载均衡。**

Connector对应源代码中的org.apache.catalina.connector.Connector,它的继承关系图如下所示：

<img src="https://gakkil.gitee.io/gakkil-image/tomcat/QQ截图20190116170422.png"/>

---

### Container

org.apache.catalina.Container接口定义了容器的api，它是一个处理用户servlet请求并返回对象给web用户的模块，它有四种不同的容器： 

* Engine，表示整个Catalina的servlet引擎 

* Host，表示一个拥有若干个Context的虚拟主机 

* Context，表示一个Web应用，一个context包含一个或多个wrapper 

* Wrapper，表示一个独立的servlet

<img src="https://gakkil.gitee.io/gakkil-image/tomcat/QQ截图20190116171006.png"/>

Engine、Host、Context、Wrapper都有一个默认的实现类StandardXXX，均继承至ContainerBase。此外，一个容器还包含一系列的Lodder、Logger、Manager、Realm和Resources等

一个容器可以有一个或多个低层次上的子容器，并且一个Catalina功能部署并不一定需要全部四种容器。一个Context有一个或多个wrapper，而wrapper作为容器层次中的最底层，不能包含子容器。从一个容器添加到另一容器中可以使用在Container接口中定义的addChild()方法义：

```
public void addChild(Container child);
```

删除一个容器可以使用Container接口中定义的removeChild()方法：
```
public void removeChild(Container child);
```

另外容器接口支持子接口查找和获得所有子接口集合的方法findChild和findChildren方法：
```
public Container findChild(String name);
public Container[] findChildren();
```

---

#### Engine

Tomcat中有一个容器的概念，而Engine,Host,Context,Wrapper都属于Contanier，我们先来说说最顶层的容器Engine.
一个Engine可以包含一个或者多个Host,也就是说我们一个Tomcat的实例可以配置多个虚拟主机。

缺省的情况下`<Engine name="Catalina" defaultHost="localhost">`定义了一个名称为 Cataline 的 Engine。

Engine对应源代码中的org.apache.catalina.core.StandardEngine，它的继承关系图如下图所示：

<img src="https://gakkil.gitee.io/gakkil-image/tomcat/QQ截图20190116171521.png"/>

Engine表示Catalina的Servlet引擎，如果使用了Engine的话，则它是Catalina的**顶层容器**，因此在StardardCataline的setParent()方法中是直接抛出异常的。
```
public interface Engine extends Container {

    public String getDefaultHost();

    public void setDefaultHost(String defaultHost);

    public String getJvmRoute();

    public void setJvmRoute(String jvmRouteId);

    public Service getService();

    public void setService(Service service);
}

public class StandardEngine extends ContainerBase implements Engine {

    // other code...

    public void setParent(Container container) {
        throw new IllegalArgumentException(sm.getString("standardEngine.notParent"));
    }
}
```
`server.xml:`
```
<Engine name="Catalina" defaultHost="localhost">
  <Realm className="org.apache.catalina.realm.LockOutRealm">
    <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
           resourceName="UserDatabase"/>
  </Realm>

  <Host name="localhost" appBase="webapps" unpackWARs="true" autoDeploy="true">
    <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
           prefix="localhost_access_log" suffix=".txt"
           pattern="%h %l %u %t "%r" %s %b" />
  </Host>
</Engine>
```

---

#### Host

Host定义了一个虚拟主机，正所谓虚拟主机，当然是可以用来部署应用程序的，Tomcat的Host也是如此。它在server.xml中定义了一个localhost的Host，应用根目录在webapps下面，默认是支持解压重新部署的。

```
<Host name="localhost" appBase="webapps" unpackWARs="true" autoDeploy="true">...</Host>
```

其中appBase为webapps，也就是<CATALINA_HOME>\webapps目录，unpackingWARS属性指定在appBase指定的目录中的war包都自动的解压，缺省配置为true，autoDeploy属性指定是否对加入到appBase目录的war包进行自动的部署，缺省为true.

Host对应源代码中的org.apache.catalina.core.StandardHost,它的继承关系图如下所示：

<img src="https://gakkil.gitee.io/gakkil-image/tomcat/QQ截图20190116172108.png"/>

---

#### Context

Context代表一个独立的web应用，针对每个Context，tomcat都是使用不同的Classloader避免类冲突。如果我们希望使用一个自定义的目录作为部署路径的话，可以在server.xml中新增Context即可。

在Tomcat中，每一个运行的webapp其实最终都是以Context的形成存在，**每个Context都有一个根路径和请求URL路径**，Context对应源代码中的org.apache.catalina.core.StandardContext,它的继承关系图如下图所示：

<img src="https://gakkil.gitee.io/gakkil-image/tomcat/QQ截图20190116172254.png"/>

```
<Context path="/static" docBase="D:/static" reloadable="true"></Context>
```

在Tomcat中我们通常采用如下的两种方式创建一个Context.下面分别描述一下：

1. 在<CATALINA-HOME>\webapps目录中创建一个目录，这个时候将自动创建一个context，默认context的访问url为`http://host:port/dirname`,你也可以通过在ContextRoot\META-INF中创建一个context.xml的文件，其中包含如下的内容来指定应用的访问路径。`<Context path="/yourUrlPath" />`

2. conf\server.xml文件中增加context元素。 第二种创建context的方法，我们可以选择在server.xml文件的<Host>元素，比如我们在server.xml文件中增加如下内容：

```
<Context path="/mypath" docBase="/Users/xxx" reloadable="true"></Context>
```

这样的话，我们就可以通过 `http://host:port/mypath` 访问上面配置的 context 了。

---

**Valve:**

Valve中文意思是阀门，Valve是Tomcat中责任链模式的实现，通过链接多个Valve对请求进行处理。每个容器都有一个流水线Pipeline（过滤器链），每个流水线至少有一个阀门。其中Valve可以定义在任何的Container中，上面说的Engine,Host,Context都属于容器。tomcat 默认定义了一个名为org.apache.catalina.valves.AccessLogValve的Valve,这个Valve负责拦截每个请求，然后记录一条访问日志。

通过上面的分析，我们发现Server,Service,Engine,Host,Context都实现了org.apache.catalina.Lifecycle接口，通过这个接口管理了这些核心组件的生命周期，关于这些组件的生命周期，我们在下一篇文章描述。