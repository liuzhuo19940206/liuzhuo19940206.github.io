---
title: Java中的父子类的执行顺序
date: 2019-01-22 14:06:36
categories:
  - 父子类
  - 面试
tags:
  - 父子类
  - 面试
summary: Java中的父子类执行顺序
---

Java中的父子类执行顺序

### 结论

类的加载顺序。

(1) 父类静态代码块(包括静态初始化块，静态属性，但不包括静态方法)

(2) 子类静态代码块(包括静态初始化块，静态属性，但不包括静态方法 )

(3) 父类非静态代码块( 包括非静态初始化块，非静态属性 )

(4) 父类构造函数

(5) 子类非静态代码块 ( 包括非静态初始化块，非静态属性 )

(6) 子类构造函数

### 例子1

根据以上结论，运行下面代码，输出的结果是：

```
class A {
   public A() {//构造函数
       System.out.println("class A");
   }
   { //代码块
       System.out.println("I'm A class"); 
   }
   static { //静态代码块
       System.out.println("class A static"); 
   }
}
public class B extends A {
   public B() {//构造函数
       System.out.println("class B");
   }
   { //代码块
       System.out.println("I'm B class"); 
   }
   static { System.out.println("class B static"); 
   }   //静态代码块
   public static void main(String[] args) {
        new B();
   }
}
```

答案：
```
class A static 
class B static 
I'm A class 
class A
I'm B class 
class B
```

---

### 例子2

那，父类中的既有静态属性，又有静态代码块的话，谁先执行呢？

```
class Print{
   Print(){
       System.out.println("haha");
   }
}
public class Cats {
   static {
       System.out.println("static Casts");
   }
   static Print test1 = new Print();
}
class qiaoGeli extends Cats{
   public static void main(String [] args)
   {
       qiaoGeli t1 = new qiaoGeli();
   }
}
```

以上输出：
```
static Casts
haha
```
换一下静态变量和静态代码块的执行顺序。

```
class Print{
   Print(){
       System.out.println("haha");
   }
}
public class Cats {
   static Print test1 = new Print();
   static {
       System.out.println("static Casts");
   }
}
class qiaoGeli extends Cats{
   public static void main(String [] args)
   {
       qiaoGeli t1 = new qiaoGeli();
   }
}
```

以上输出：
```
haha
static Casts
```

**结论：**静态代码块和静态属性的执行顺序，取决于它两在代码中的位置。

### 例子3

那，类中非静态属性与非静态代码块的顺序呢？

```
class Print{
   Print(){
       System.out.println("haha");
   }
}

public class Cats {
   Print test = new Print();      //非静态属性

   Cats(){                        //构造函数
       System.out.println("I'm qiaoGeLi");
   }
                                  
   {                              //非静态代码块
       System.out.println("I'm xiaoMeng");
   }

   public static void main(String [] args)
   {
       Cats cat = new Cats();
   }
}
```

以上输出：
```
haha              //非静态属性
I'm xiaoMeng      //非静态代码块
I'm qiaoGeLi      //构造方法
```

那是不是：非静态属性 > 非静态代码块 > 构造器 呢 ？

<font color="red">不是哦!</font>

### 例子4

```
class Print{
   Print(){
       System.out.println("haha");
   }
}
public class Cats {
   Cats(){
       System.out.println("I'm qiaoGeLi");
   }
   {
       System.out.println("I'm xiaoMeng");
   }
   Print test = new Print();

   public static void main(String [] args)
   {
       Cats cat = new Cats();
   }
}
```

以上输出结果：
```
I'm xiaoMeng
haha
I'm qiaoGeLi
```

<font color="red">故意将构造器放在最上面，但是它还是最后执行的，可是非静态属性与非静态代码块的执行顺序变了。</font>

**结论：**非静态属性和非静态代码块谁在前谁先执行，构造器在最后执行！

### 总结

类的执行顺序。

(1)父类静态变量 和 静态代码块（先声明的先执行）;

(2)子类静态变量 和 静态代码块（先声明的先执行）;

(3)父类的非静态属性（变量）和 非静态代码块（先声明的先执行）；

(4)父类构造函数

(5)子类的非静态属性（变量）和 非静态代码块（先声明的先执行）；

(6)子类构造函数


