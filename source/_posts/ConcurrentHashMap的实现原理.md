---
title: ConcurrentHashMap的实现原理
categories:
  - ConcurrentHashMap
  - 面试
tags:
  - ConcurrentHashMap
  - 面试
date: 2019-01-14 14:16:34
summary: ConcurrentHashMap的实现原理
---

接着上篇的HashMap的原理分析后，今天来学ConcurrentHashMap的实现原理

在现实开发中，不可避免地会碰到一些多线程并发访问的情况。为了解决这个问题，HashTable 和 HashMap 先后诞生。

问题也随之而来，使用后发现HashTable 虽然能保证线程安全但是效率低下，而HashMap 虽然效率高于hashTable 但是是非线程安全的。这个很像一个鱼与熊掌的问题，真的不可兼得吗？

于是人们就考虑有没有一种及支持并发有能保证线程安全的方法。终于，在JDK1.5中，伟大的Doug Lea 给我们带来了concurrent 包，从此Map 也有安全的了，这就是ConcurrentHashMap。安全且高效，像一条长了熊掌的鱼。

为了更好的理解ConcurrentHashMap的优点，我们先了解下它的两个前辈HashTable 和HashMap。

**HashMap**：它根据键的hashCode值存储数据，大多数情况下可以直接定位到它的值，因而具有很快的访问速度，但遍历顺序却是不确定的。HashMap最多只允许一条记录的键为null，允许多条记录的值为null。

**HashMap**：非线程安全，即任一时刻可以有多个线程同时写HashMap，可能会导致数据的不一致。如果需要满足线程安全，可以用 Collections的synchronizedMap方法使HashMap具有线程安全的能力，或者使用ConcurrentHashMap。

**HashMap的线程安全问题如下：**

在hashmap 做put 操作的时候，假如A线程和B线程同时对同一个数组位置调用addEntry，两个线程会同时得到现在的头结点，然后A写入新的头结点之后，B也写入新的头结点，那B的写入操作就会覆盖A的写入操作造成A的写入操作丢失。同理，当多线程对同一数组位置进行remove操作时也会产生覆盖。

因此如果不进行额外的外同步操作，HashMap 是非线程安全的。如果加锁必然导致效率低下，而且竞争越激烈，效率越低下。

---

**Hashtable：**Hashtable是遗留类，很多映射的常用功能与HashMap类似，不同的是它承自Dictionary类，并且是**线程安全**的，任一时间只有一个线程能写Hashtable，并发性不如ConcurrentHashMap，因为ConcurrentHashMap引入了分段锁。Hashtable不建议在新代码中使用，不需要线程安全的场合可以用HashMap替换，需要线程安全的场合可以用ConcurrentHashMap替换。

<img src="https://gakkil.gitee.io/gakkil-image/interview/QQ截图20190114142923.png"/>

HashTable 只有一把锁，当一个线程访问HashTable的同步方法时，会将整张table 锁住，当其他线程也想访问HashTable 同步方法时，就会进入阻塞或轮询状态。也就是确保同一时间只有一个线程对同步方法的占用，避免多个线程同时对数据的修改，确保线程的安全性。

但HashTable 对 get，put，remove 方法都使用了同步操作，这就造成如果两个线程都只想使用get 方法去读取数据时，因为一个线程先到进行了锁操作，另一个线程就不得不等待，这样必然导致效率低下，而且竞争越激烈，效率越低下。

---

### 并发又安全的ConcurrentHashMap

ConcurrentHashMap 保证线程安全的方法是：**分段锁技术**

<img src="https://gakkil.gitee.io/gakkil-image/interview/QQ截图20190114143134.png"/>

ConcurrentHashMap采用了非常精妙的"分段锁"策略，ConcurrentHashMap的主干是个Segment数组。

如上图，在hashMap 的基础上，ConcurrentHashMap 将数据分为多个segment（默认16个），然后每次操作对一个segment 加锁，HashTable 在竞争激烈的并发环境下表现出效率低下的原因是，由于所有访问HashTable的线程都必须竞争同一把锁，而ConcurrentHashMap 将数据分到多个segment 中（默认16，也可在申明时自己设置，不过一旦设定就不能更改，扩容都是扩充各个segment 的容量），每个segment 都有一个自己的锁，只要多个线程访问的不是同一个segment 就没有锁争用，就没有堵塞，也就是允许16个线程并发的更新而尽量没有锁争用。

ConcurrentHashMap 的 segment 就类似一个HashTable，但比HashTable 更加优化，前面说过HashTable对get，put，remove 方法都会使用锁，而ConcurrnetHashMap 中get 方法是不涉及到锁的。

在并发读取时，除了key 对应的value 为null 外，并没有用到锁，所以对于读操作无论多少线程并发都是安全高效的。

举个日常生活中的例子（背景是你在网上订好了一家旅店，然后拿着材料来入住，map就相当于这个旅店，你就相当于是操作map的线程）：上述这家旅店（Collections.synchronizedMap）如果只有一个前台，所有人要登记入住都得在前台办理手续，如果只有你一个人，那么你可以马上入住，如果有一群人，那你就得等着，这样效率不高。而ConcurrentHashMap在每层都有一个前台，你根据你的楼层号（哈希值）去相应的楼层办理入住手续，这样就减少排队等待的概率及时间。

---

### ConcurrentHashMap源码分析


ConcurrentHashMap采用了非常精妙的"分段锁"策略，ConcurrentHashMap的主干是个Segment数组。

```
 final Segment<K,V>[] segments;
```
Segment继承了 **ReentrantLock**，所以它就是一种可重入锁（ReentrantLock)。在ConcurrentHashMap，一个Segment就是一个子哈希表，Segment里维护了一个HashEntry数组，并发环境下，对于不同Segment的数据进行操作是不用考虑锁竞争的。（就按默认的ConcurrentLeve为16来讲，理论上就允许16个线程并发执行，有木有很酷）

<font color="red">所以，对于同一个Segment的操作才需考虑线程同步，不同的Segment则无需考虑。</font>

Segment类似于HashMap，一个Segment维护着一个HashEntry数组:
```
 transient volatile HashEntry<K,V>[] table;
```

HashEntry是目前我们提到的最小的逻辑处理单元了。一个ConcurrentHashMap维护一个Segment数组，一个Segment维护一个HashEntry数组。

```
 static final class HashEntry<K,V> {
        final int hash;
        final K key;
        volatile V value;
        volatile HashEntry<K,V> next;
        //其他省略
}    
```

我们说Segment类似哈希表，那么一些属性就跟我们之前提到的HashMap差不离，比如负载因子loadFactor，比如阈值threshold等等，看下Segment的构造方法
```
Segment(float lf, int threshold, HashEntry<K,V>[] tab) {
            this.loadFactor = lf;//负载因子
            this.threshold = threshold;//阈值
            this.table = tab;//主干数组即HashEntry数组
        }
```

我们来看下ConcurrentHashMap的构造方法:
```
   public ConcurrentHashMap(int initialCapacity , float loadFactor, int concurrencyLevel) {
          if (!(loadFactor > 0) || initialCapacity < 0 || concurrencyLevel <= 0)
                throw new IllegalArgumentException();
          //MAX_SEGMENTS 为1<<16=65536，也就是最大并发数为65536
          if (concurrencyLevel > MAX_SEGMENTS)
               concurrencyLevel = MAX_SEGMENTS;
          //2的sshif次方等于ssize，例:ssize=16,sshift=4;ssize=32,sshif=5
          int sshift = 0;
          //ssize 为segments数组长度，根据concurrentLevel计算得出
          int ssize = 1;
          while (ssize < concurrencyLevel) {
              ++sshift;
              ssize <<= 1;
          }
          //segmentShift和segmentMask这两个变量在定位segment时会用到，后面会详细讲
          this.segmentShift = 32 - sshift;
          this.segmentMask = ssize - 1;
          if (initialCapacity > MAXIMUM_CAPACITY)
              initialCapacity = MAXIMUM_CAPACITY;
          //计算cap的大小，即Segment中HashEntry的数组长度，cap也一定为2的n次方.
          int c = initialCapacity / ssize;
          if (c * ssize < initialCapacity)
              ++c;
          int cap = MIN_SEGMENT_TABLE_CAPACITY;
          while (cap < c)
              cap <<= 1;
          //创建segments数组并初始化第一个Segment，其余的Segment延迟初始化
          Segment<K,V> s0 =
              new Segment<K,V>(loadFactor, (int)(cap * loadFactor),
                               (HashEntry<K,V>[])new HashEntry[cap]);
          Segment<K,V>[] ss = (Segment<K,V>[])new Segment[ssize];
          UNSAFE.putOrderedObject(ss, SBASE, s0); 
          this.segments = ss;
      }
```

初始化方法有三个参数，如果用户不指定则会使用默认值，initialCapacity为16，loadFactor为0.75（负载因子，扩容时需要参考），concurrentLevel为16。

从上面的代码可以看出来,Segment数组的大小ssize是由concurrentLevel来决定的，但是却不一定等于concurrentLevel，ssize一定是大于或等于concurrentLevel的最小的2的次幂。比如：默认情况下concurrentLevel是16，则ssize为16；若concurrentLevel为14，ssize为16；若concurrentLevel为17，则ssize为32。为什么Segment的数组大小一定是2的次幂？其实主要是便于通过按位与的散列算法来定位Segment的index。

#### put的过程分析：
```
 public V put(K key, V value) {
        Segment<K,V> s;
        //concurrentHashMap不允许key/value为空
        if (value == null)
            throw new NullPointerException();
        //hash函数对key的hashCode重新散列，避免差劲的不合理的hashcode，保证散列均匀
        int hash = hash(key);
        //返回的hash值无符号右移segmentShift位与段掩码进行位运算，定位segment
        int j = (hash >>> segmentShift) & segmentMask;
        if ((s = (Segment<K,V>)UNSAFE.getObject          // nonvolatile; recheck
             (segments, (j << SSHIFT) + SBASE)) == null) //  in ensureSegment
            s = ensureSegment(j);
        return s.put(key, hash, value, false);
    }
```

从源码看出，put的主要逻辑也就两步：1.定位segment并确保定位的Segment已初始化 2.调用Segment的put方法。

关于segmentShift和segmentMask：

segmentShift 和 segmentMask 这两个全局变量的主要作用是用来定位Segment，int j =(hash >>> segmentShift) & segmentMask。

**segmentMask：**段掩码，假如segments数组长度为16，则段掩码为16-1=15；segments长度为32，段掩码为32-1=31。这样得到的所有bit位都为1，可以更好地保证散列的均匀性。

**segmentShift：**2的sshift次方等于ssize，segmentShift=32-sshift。若segments长度为16，segmentShift=32-4=28;若segments长度为32，segmentShift=32-5=27。而计算得出的hash值最大为32位，**无符号右移segmentShift，则意味着只保留高几位**（其余位是没用的），然后与段掩码segmentMask位运算来定位Segment。

---

#### get的过程分析：
```
 public V get(Object key) {
        Segment<K,V> s; 
        HashEntry<K,V>[] tab;
        int h = hash(key);
        long u = (((h >>> segmentShift) & segmentMask) << SSHIFT) + SBASE;
        //先定位Segment，再定位HashEntry
        if ((s = (Segment<K,V>)UNSAFE.getObjectVolatile(segments, u)) != null &&
            (tab = s.table) != null) {
            for (HashEntry<K,V> e = (HashEntry<K,V>) UNSAFE.getObjectVolatile
                     (tab, ((long)(((tab.length - 1) & h)) << TSHIFT) + TBASE);
                 e != null; e = e.next) {
                K k;
                if ((k = e.key) == key || (e.hash == h && key.equals(k)))
                    return e.value;
            }
        }
        return null;
    }
```

<font color="red">get方法无需加锁，由于其中涉及到的共享变量都使用volatile修饰，volatile可以保证内存可见性，所以不会读取到过期数据。<font>

来看下concurrentHashMap代理到Segment上的put方法，Segment中的put方法是要加锁的。只不过是锁粒度细了而已。
```
final V put(K key, int hash, V value, boolean onlyIfAbsent) {

            //tryLock不成功时会遍历定位到的HashEnry位置的链表（遍历主要是为了使CPU缓存链表)
            //若找不到，则创建HashEntry。tryLock一定次数后（MAX_SCAN_RETRIES变量决定）则lock。
            //若遍历过程中，由于其他线程的操作导致链表头结点变化，则需要重新遍历。
            HashEntry<K,V> node = tryLock() ? null :scanAndLockForPut(key, hash, value);
            V oldValue;
            try {
                HashEntry<K,V>[] tab = table;
                //定位HashEntry，可以看到，这个hash值在定位Segment时和在Segment中定位HashEntry都会用到
                //只不过定位Segment时只用到高几位。
                int index = (tab.length - 1) & hash;
                HashEntry<K,V> first = entryAt(tab, index);
                for (HashEntry<K,V> e = first;;) {
                    if (e != null) {
                        K k;
                        if ((k = e.key) == key ||
                            (e.hash == hash && key.equals(k))) {
                            oldValue = e.value;
                            if (!onlyIfAbsent) {
                                e.value = value;
                                ++modCount;
                            }
                            break;
                        }
                        e = e.next;
                    }
                    else {
                        if (node != null)
                            node.setNext(first);
                        else
                            node = new HashEntry<K,V>(hash, key, value, first);
                        int c = count + 1;
　　　　　　　　　　　　 //若c超出阈值threshold，需要扩容并rehash。扩容后的容量是当前容量的2倍。
                        if (c > threshold && tab.length < MAXIMUM_CAPACITY)
                            rehash(node);
                        else
                            setEntryAt(tab, index, node);
                        ++modCount;
                        count = c;
                        oldValue = null;
                        break;
                    }
                }
            } finally {
                unlock();
            }
            return oldValue;
        }
```

### 总结

ConcurrentHashMap作为一种线程安全且高效的哈希表的解决方案，尤其其中的"分段锁"的方案，相比HashTable的全表锁在性能上的提升非常之大。本文对ConcurrentHashMap的实现原理进行了详细分析，并解读了部分源码，希望能帮助到有需要的童鞋。