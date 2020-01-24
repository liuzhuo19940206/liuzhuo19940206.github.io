---
title: ProtoBuffer的简介
author: gakkij
categories:
  - protobuffer
tags:
  - protobuffer
img: https://pic.downk.cc/item/5e2ab7032fb38b8c3c5fc9af.png
top: false
cover: false
coverImg: /images/1.jpg
toc: true
date: 2020-01-24 17:16:37
summary: protobuffer的简单使用
password:
---

### 什么是protocol buffers

 protocol buffers是一个灵活的、高效的、自动化的用于对结构化数据进行序列化的协议，与json、xml相比，protocol buffers序列化后的码流更小、速度更快、操作更简单。你只需要将要被序列化的数据结构定义一次(使用.proto文件定义)，便可以使用特别生成的源代码(使用protobuf提供的生成工具protoc)轻松的使用不同的数据流完成对这些结构数据的读写操作，即使你使用不同的语言（protobuf的跨语言支持特性）。你甚至可以更新你的数据结构的定义（就是更新.proto文件内容）而不会破坏依“老”格式编译出来的程序。

### protobuffer的安装

#### 下载源码

下面是在mac的电脑上安装protobuf步骤,如下

```java
git clone https://github.com/google/protobuf

git checkout 版本号
```

[*下载地址*](https://github.com/protocolbuffers/protobuf/releases)

![](https://pic.downk.cc/item/5e2ab7fb2fb38b8c3c5fdad7.jpg)

![](https://pic.downk.cc/item/5e2ab8692fb38b8c3c5fe2a3.jpg)

---

#### 安装automake和libtool

```java
brew install automake

brew install libtool
```

前提：你的Mac需要先安装了brew！！！

如果没有安装的话，请自行百度解决，安装如果很慢，需要切换成清华的源。

[macOS安装Homebrew太慢，换用清华镜像](https://blog.csdn.net/sinat_38184748/article/details/99450330)

#### 运行自动生成脚本

```java
./autogen.sh
```

#### 安装protobuf

```java
./configure
make check
make
sudo make install 
```

#### 查看安装版本

```java
protoc --version
```

![](https://pic.downk.cc/item/5e2aba9f2fb38b8c3c600887.jpg)

---

### 定义Message

首先看一个简单的例子，比如说你定义一个搜索请求的message，每一个搜索请求会包含一个搜索的字符串，返回第几页的结果，以及结果集的大小。在`.proto`文件中定义如下：

#### proto3的格式

```java
syntax = "proto3";  //必须是文件中非空非注释行的第一行

message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
}
```

- `.proto`文件的第一行指定了使用`proto3`语法。如果省略protocol buffer编译器默认使用`proto2`语法。<font color="red">**它必须是文件中非空非注释行的第一行**。</font>
- `SearchRequest`定义中指定了三个字段(name/value键值对)，每个字段都会有名称和类型。

---

#### proto2的格式

```java
message Person {
  required string name = 1;  //required：表示必须字段
  required int32 id = 2;
  optional string email = 3; //optional：表示可选字段
 
  enum PhoneType {           //枚举类型
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }
  message PhoneNumber {      // 嵌套message
    required string number = 1;
    optional PhoneType type = 2 [default = HOME];
  }
  repeated PhoneNumber phone = 4;
}
```

第一行不写，或者写：`syntax = "proto2" `才是proto2.0协议。

#### proto3和proto2的区别

- 在第一行非空白非注释行，必须写：`syntax = "proto3"`;

- 字段规则移除了 `“required”`，并把` “optional”` 改名为 `“singular”` ；

  在 proto2 中 required 也是不推荐使用的。proto3 直接从语法层面上移除了 required 规则。其实可以做的更彻底，把所有字段规则描述都撤销，原来的 repeated 改为在类型或字段名后加一对中括号。这样是不是更简洁？

- `“repeated”`字段默认采用 `packed` 编码 [ proto3.0]

​       在 proto2 中，需要明确使用 `[packed=true]` 来为字段指定比较紧凑的 `packed` 编码方式。

- 语言增加 Go、Ruby、JavaNano 支持

- 移除了 default 选项

  在 proto2 中，可以使用 default 选项为某一字段指定默认值。在 proto3 中，字段的默认值只能根据字段类型由系统决定。也就是说，**默认值全部是约定好的，而不再提供指定默认值的语法**。

  在字段被设置为默认值的时候，该字段不会被序列化，这样可以节省空间，提高效率。

  但这样就无法区分某字段是根本没赋值，还是赋值了默认值。这在 proto3 中问题不大，但在 proto2 中会有问题。

  比如，在更新协议的时候使用 default 选项为某个字段指定了一个与原来不同的默认值，旧代码获取到的该字段的值会与新代码不一样。

- 枚举类型的第一个字段必须为 0。

  这也是一个约定。

- 移除了对分组的支持

  分组的功能完全可以用消息嵌套的方式来实现，并且更清晰。在 proto2 中已经把分组语法标注为『过期』了。这次也算清理垃圾了。

- 旧代码在解析新增字段时，会把不认识的字段丢弃，再序列化后新增的字段就没了；

  在 proto2 中，旧代码虽然会忽视不认识的新增字段，但并不会将其丢弃，再序列化的时候那些字段会被原样保留。

  我觉得还是 proto2 的处理方式更好一些。能尽量保持兼容性和扩展能力，或许实现起来也更简单。proto3 现在的处理方式，没有带来明显的好处，但丢掉了部分兼容性和灵活性。

  **[2017-06-15 更新]**：经过漫长的[讨论](https://github.com/google/protobuf/issues/272)，官方终于同意在 proto3 中恢复 proto2 的处理方式了。 可以通过[这个文档](https://docs.google.com/document/d/1KMRX-G91Aa-Y2FkEaHeeviLRRNblgIahbsk4wA14gRk/view)了解前因后果及时间线。

- 移除了对扩展的支持，新增了 Any 类型。

  Any 类型是用来替代 proto2 中的扩展的。目前还在开发中。

  proto2 中的扩展特性很像 Swift 语言中的扩展。理解起来有点困难，使用起来更是会带来不少混乱。

  相比之下，proto3 中新增的 Any 类型有点像 C/C++ 中的 void* ，好理解，使用起来逻辑也更清晰。

- 增加了 JSON 映射特性

  语言的活力来自于与时俱进。当前，JSON 的流行有其充分的理由。很多『现代化』的语言都内置了对 JSON 的支持，比如 Go、PHP 等。而 C++ 这种看似保罗万象的学院派语言，因循守旧、故步自封，以致于现出了式微的苗头。

---

#### message数据格式中需要知道的

```java
proto2.0

required: 必须赋值，不能为空，否则该条message会被认为是“uninitialized”。build一个“uninitialized” message会抛出一个RuntimeException异常，解析一条“uninitialized” message会抛出一条IOException异常。除此之外，“required”字段跟“optional”字段并无差别。

optional: 字段可以赋值，也可以不赋值。假如没有赋值的话，会被赋上默认值。

repeated: 该字段可以重复任意次数，包括0次。重复数据的顺序将会保存在protocol buffer中，将这个字段想象成一个可以自动设置size的数组就可以了。
---------------------------------------------------------------
  
proto3.0

去掉了 required。
  
singular：一个遵循singular规则的字段，在一个结构良好的message消息体(编码后的message)可以有0或1个该字段（但是不可以有多个）。这是proto3语法的默认字段规则。（这个理解起来有些晦涩，举例来说上面例子中三个字段都是singular类型的字段，在编码后的消息体中可以有0或者1个query字段，但不会有多个。）
  
repeated：遵循repeated规则的字段在消息体重可以有任意多个该字段值，这些值的顺序在消息体重可以保持（就是数组类型的字段）

```

#### 指定字段类型

protobuffer支持的数据类型如下： 

![](https://pic.downk.cc/item/5e2acc362fb38b8c3c613db0.jpg)

#### 指定字段编号

在message定义中每个字段都有一个**唯一的编号**，这些编号被用来在二进制消息体中识别你定义的这些字段，一旦你的message类型被用到后就不应该在修改这些编号了。注意在将message编码成二进制消息体时字段编号1-15将会占用1个字节，16-2047将占用两个字节。所以在一些频繁使用用的message中，你应该总是先使用前面1-15字段编号。

你可以指定的最小编号是1，最大是2E29 - 1（536,870,911）。<font color="red">**其中19000到19999是给protocol buffers实现保留的字段标号，定义message时不能使用**</font>。**同样的你也不能重复使用任何当前message定义里已经使用过和预留的字段编号。**

#### 添加注释

`.proto`文件中的注释和C，C++的注释风格相同，使用// 和 /* ... */

```java
/* SearchRequest represents a search query, with pagination options to
 * indicate which results to include in the response. */

message SearchRequest {
  string query = 1;
  int32 page_number = 2;  // Which page number do we want?
  int32 result_per_page = 3;  // Number of results to return per page.
}

```

#### 保留字段

当你删掉或者注释掉message中的一个字段时，未来其他开发者在更新message定义时就可以重用之前的字段编号。如果他们意外载入了老版本的`.proto`文件将会导致严重的问题，比如数据损坏、隐私泄露等。一种避免问题发生的方式是**指定保留的字段编号和字段名称**。如果未来有人用了这些字段标识那么在编译时protocol buffer的编译器会报错。

```java
message Foo {
  reserved 2, 15, 9 to 11;  // 定义字段编号为保留字段。2、15 和 9 到 11 都是保留字段，不许使用
  reserved "foo", "bar";    // 定义字段名称为保留字段
}
```

#### 默认值

当时一个被编码的message体中不存在某个message定义中的singular字段时，在message体解析成的对象中，相应字段会被设置为message定义中该字段的默认值。默认值依类型而定：

- 对于字符串，默认值为空字符串。
- 对于字节，默认值为空字节。
- 对于bools，默认值为false。
- 对于数字类型，默认值为零。
- 对于枚举，默认值是第一个定义的枚举值，该值必须为0。
- 对于消息字段，未设置该字段。它的确切值取决于语言。有关详细信息。

---

#### 枚举类型

在定义消息类型时，您可能希望其中一个字段只有一个预定义的值列表中的值。例如，假设您要为每个`SearchRequest`添加`corpus`字段，其中`corpus`可以是UNIVERSAL，WEB，IMAGES，LOCAL，NEWS，PRODUCTS或VIDEO。您可以非常简单地通过向消息定义添加枚举，并为每个可能的枚举值值添加常量来实现。

在下面的例子中，我们添加了一个名为`Corpus`的枚举类型，和一个`Corpus`类型的字段：

```java
message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
  enum Corpus {
    UNIVERSAL = 0;
    WEB = 1;
    IMAGES = 2;
    LOCAL = 3;
    NEWS = 4;
    PRODUCTS = 5;
    VIDEO = 6;
  }
  Corpus corpus = 4;
}
```

如你所见，`Corpus`枚举的第一个常量映射到了0：所有枚举定义都需要包含一个常量映射到0并且作为定义的首行，这是因为：

- 必须有0值，这样我们就可以将0作为枚举的默认值。
- proto2语法中首行的枚举值总是默认值，为了兼容0值必须作为定义的首行。

---

#### 使用其他Message类型

可以使用其他message类型作为字段的类型，假设你想在每个`SearchResponse`消息中携带类型为`Result`的消息，

你可以在同一个`.proto`文件中定义一个`Result`消息类型，然后在`SearchResponse`中指定一个`Result`类型的字段。

```java
message SearchResponse {
  repeated Result results = 1;
}

message Result {
  string url = 1;
  string title = 2;
  repeated string snippets = 3;
}
```

#### 导入消息定义

在上面的示例中，`Result`消息类型在与`SearchResponse`相同的文件中定义 - 如果要用作字段类型的消息类型已在另一个`.proto`文件中定义，该怎么办？

您可以通过导入来使用其他.proto文件中的定义。要导入另一个.proto的定义，请在文件顶部添加一个import语句：

```java
import "myproject/other_protos.proto";
```

默认情况下，您只能使用直接导入的`.proto`文件中的定义。但是，有时你可能需要将`.proto`文件移动到新位置。现在，你可以在旧位置放置一个虚拟`.proto`文件，在文件中使用`import public`语法将所有导入转发到新位置，而不是直接移动`.proto`文件并在一次更改中更新所有调用点。任何导入包含`import public`语句的`proto`文件的人都可以**传递依赖**导入公共依赖项。例如:

```java
// new.proto
// All definitions are moved here
```

```java
// old.proto
// This is the proto that all clients are importing.
import public "new.proto";
import "other.proto";
```

```java
// client.proto
import "old.proto";
// You use definitions from old.proto and new.proto, but not other.proto
```

编译器会在通过命令行参数`-I`或者`--proto-path`中指定的文件夹中搜索`.proto`文件，如果没有提供编译器会在唤其编译器的目录中进行搜索。通常来说你应该将`--proto-path`的值设置为你项目的根目录，并对所有导入使用完全限定名称。

#### 嵌套消息类型

消息类型可以被定义和使用在其他消息类型中，下面的例子里`Result`消息被定义在`SearchResponse`消息中:

```java
message SearchResponse {
  message Result {
    string url = 1;
    string title = 2;
    repeated string snippets = 3;
  }
  repeated Result results = 1;
}
```

如果你想在外部使用定义在父消息中的子消息，使用`Parent.Type`引用他们

```java
message SomeOtherMessage {
  SearchResponse.Result result = 1;
}
```

你可以嵌套任意多层消息:

```java
message Outer {       // Level 0
  message MiddleAA {  // Level 1
    message Inner {   // Level 2
      int64 ival = 1;
      bool  booly = 2;
    }
  }
  message MiddleBB {  // Level 1
    message Inner {   // Level 2
      int32 ival = 1;
      bool  booly = 2;
    }
  }
}
```

#### 更新Message

如果一个现存的消息类型不再满足你当前的需求--比如说你希望在消息中增加一个额外的字段--但是仍想使用由旧版的消息格式生成的代码，不用担心！只要记住下面的规则，在更新消息定义的同时又不破坏现有的代码就非常简单。

- 不要更改任何已存字段的字段编号。
- 如果添加了新字段，任何由旧版消息格式生成的代码所序列化的消息，仍能被依据新消息格式生成的代码所解析。你应该记住这些元素的默认值这些新生成的代码就能够正确地与由旧代码序列化创建的消息交互了。类似的，新代码创建的消息也能由旧版代码解析：旧版消息（二进制）在解析时简单地忽略了新增的字段.
- 只要在更新后的消息类型中不再重用字段编号，就可以删除该字段。你也可以重命名字段，比如说添加`OBSOLETE_`前缀或者将字段编号设置为`reserved`，这些未来其他用户就不会意外地重用该字段编号了。

---

#### 未知字段

未知字段是格式良好的协议缓冲区序列化数据，表示解析器无法识别的字段。例如，当旧二进制文件解析具有新字段的新二进制文件发送的数据时，这些新字段将成为旧二进制文件中的未知字段。

最初，proto3消息在解析期间总是丢弃未知字段，但在3.5版本中，我们重新引入了未知字段的保留以匹配proto2行为。在版本3.5及更高版本中，未知字段在解析期间保留，并包含在序列化输出中。

#### 映射类型

如果你想创建一个映射作为message定义的一部分，protocol buffers提供了一个简易便利的语法。

```java
map<key_type, value_type> map_field = N;
```

`key_type`可以是任意整数或者字符串（除了浮点数和bytes以外的所有标量类型）。注意`enum`不是一个有效的`key_type`。`value_type`可以是除了映射以外的任意类型（意思是protocol buffers的消息体中不允许有嵌套map）。

举例来说，假如你想创建一个名为projects的映射，每一个`Project`消息关联一个字符串键，你可以像如下来定义：

```java
map<string, Project> projects = 3;
```

- 映射里的字段不能是follow repeated规则的（意思是映射里字段的值不能是数组）。

- 映射里的值是无序的，所以不能依赖映射里元素的顺序。

- 生成.proto的文本格式时，映射按键排序。数字键按数字排序。

- 从线路解析或合并时，如果有重复的映射键，则使用最后看到的键。从文本格式解析映射时，如果存在重复键，则解析可能会失败。

- 如果未给映射的字段指定值，字段被序列化时的行为依语言而定。在C++， Java和Python中字段类型的默认值会被序列化作为字段值，而其他语言则不会。

#### 给Message加包名

你可以在`.proto`文件中添加一个可选的`package`符来防止消息类型之前的名称冲突。

```java
package foo.bar;
message Open { ... }
```

在定义message的字段时像如下这样使用package名称

```java
message Foo {
  ...
  foo.bar.Open open = 1;
  ...
}
```

package：对生成代码的影响视编程语言而定。

### 生成代码

要生成：Java，Python，C ++，Go，Ruby，Objective-C 或 C＃代码，你需要使用`.proto`文件中定义的消息类型，你需要在`.proto`上运行protocol buffer编译器`protoc`。如果尚未安装编译器，请下载[该软件包](https://developers.google.com/protocol-buffers/docs/downloads.html)并按照README文件中的说明进行操作。对于Go，还需要为编译器安装一个特殊的代码生成器插件：你可以在GitHub上的[golang/protobuf](https://github.com/golang/protobuf/)项目中找到这个插件和安装说明。

编译器像下面这样唤起：

```java
protoc --proto_path=IMPORT_PATH --cpp_out=DST_DIR --java_out=DST_DIR --python_out=DST_DIR --go_out=DST_DIR --ruby_out=DST_DIR --objc_out=DST_DIR --csharp_out=DST_DIR path/to/file.proto
```

`IMPORT_PATH`指定了在解析`import`命令时去哪里搜索`.proto`文件，如果忽略将在当前工作目录进行查找，可以通过传递多次`--proto_path`参数来指定多个import目录，他们将会按顺序被编译器搜索。`-I=IMPORT_PATH`是`--proto_path`的简短形式。

---

你可以提供一个或多个输出命令：

````java
--cpp_out generates C++ code in DST_DIR. See the C++ generated code reference for more.

--java_out generates Java code in DST_DIR. See the Java generated code reference for more.

--python_out generates Python code in DST_DIR. See the Python generated code reference for more.

--go_out generates Go code in DST_DIR. See the Go generated code reference for more.

--ruby_out generates Ruby code in DST_DIR. Ruby generated code reference is coming soon!

--objc_out generates Objective-C code in DST_DIR. See the Objective-C generated code reference for more.

--csharp_out generates C# code in DST_DIR. See the C# generated code reference for more.

--php_out generates PHP code in DST_DIR. See the PHP generated code reference for more.

````











