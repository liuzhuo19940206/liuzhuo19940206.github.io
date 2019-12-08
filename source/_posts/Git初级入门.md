---
title: Git初级入门
date: 2018-10-25 09:02:40
categories: git
tags: git
summary: git的基本使用方法
---
### Git的下载

git的官网：https://git-scm.com/

点击右下角的：Downloade xxxx for Windows

由于是国外的网站，下载速度或许会很慢，请耐心等待~~

下载完后，直接安装就行。

安装完成，在桌面会创建Git Bash快捷方式。

**在任意目录下右击鼠标：会看到Git GUI Here 和 Git Bash Here 两个命令**

### Git的初步设置

1. 首先复制git的安装路径，追加到高级环境变量的PATH之后。确定保存退出。
2. 打开cmd命令窗口（可用win+r,输入cmd确定即可）, 输入``git --version``命令（version前是两杠),显示版本号：

```
C:\Users\liuzhuo>git --version
git version 2.15.0.windows.1

C:\Users\liuzhuo>
```
3. 进入Git界面，就是在任意目录下，右键，点击Git Bash Here
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025091705.png"/>

4. 配置全局的用户名和密码：

``git config --global user.name`` 你的用户名 #用户名 
``git config --global user.email`` 你的邮箱 #邮箱 

这里加了 ``--global``的选项，说明是全局配置，意思是在当前windows下，使用的git都是在这个用户下，也可以给一个项目配置单独的用户名和邮箱。

5. 查看配置信息

使用 ``git config --list``
```
liuzhuo@Gakki MINGW64 ~/Desktop
$ git config --list
core.symlinks=false
core.autocrlf=true
core.fscache=true
color.diff=auto
color.status=auto
color.branch=auto
color.interactive=true
help.format=html
rebase.autosquash=true
http.sslcainfo=D:/Git/mingw64/ssl/certs/ca-bundle.crt
http.sslbackend=openssl
diff.astextplain.textconv=astextplain
filter.lfs.clean=git-lfs clean -- %f
filter.lfs.smudge=git-lfs smudge -- %f
filter.lfs.process=git-lfs filter-process
filter.lfs.required=true
credential.helper=manager
user.name=liuzhuo
user.email=575920824@qq.com
```
使用``git config --global --list``:查看全局配置信息
```
liuzhuo@Gakki MINGW64 ~/Desktop
$ git config --global --list
user.name=liuzhuo
user.email=575920824@qq.com
```

6. 常用的配置命令

```
//查
git config --global --list
 
git config --global user.name
 
//增
git config  --global --add user.name jianan
 
//删
git config  --global --unset user.name
 
//改
git config --global user.name zhangsan

```



7. 全局配置文件的地方

`~/.gitconfig`

例如Windows下，则是

`C:\Users\用户名\.gitconfig`

8. 各个仓库的配置

`.git/config`

例如orange仓库目录下

`/home/lanyang/orange/.git/config`

### Git的GUI界面

这里，我使用SourceTree

官网：https://www.sourcetreeapp.com

点击：Downloade for Windows

### Git 仓库

1) 初始化版本库

git init

2) 添加文件到版本库

git add

git commit

3) 查看仓库状态

git status

---

#### 使用SourceTree来操作

首先，使用SourceTree来创建本地仓库：

1）打开SourceTree
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025103910.png"/>

左上角：

Local： 代表本地仓库

Remote：代表远程仓库

右边：

Clone：代表克隆其他人的仓库

Add： 在原有仓库的基础上添加新的仓库

Create：创建新的仓库

2）点击Local和Create来创建本地仓库
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025104307.png"/>

第一行：仓库的路径

第二行：仓库的名字
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025104441.png"/>

这里：选择了E盘下的gitdemo\demo1目录。

点击创建

3）在demo1目录下，创建一个新的文件(.txt)，并随便写入几句话。

demo test······

4）观察SourceTree界面：
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025104851.png"/>

此时，在未暂存区域出现了我们刚刚创建的文件。

说明，刚刚创建的文件现在只是在我们的工作目录下，还没有提交到本地仓库中。

**ps：此时，有三个区域，第一个是我们的工作目录，第二个是暂存区域，第三个是本地仓库区域**

我们一般在自己的工作目录下，编写自己的代码，然后提加到暂存区域，最后没有问题后，再提交到本地仓库保存起来。

5）点击text.txt，然后点击暂存所选
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025105356.png"/>

此时，我们的文件就保存到暂存区域了。

6）提交到本地仓库中

在最下面，填写我们的提交信息，然后点击提交。
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025105612.png"/>

7) 提交成功后，查看仓库的状态

第一次添加都是在主分支下面的，即master分支。

点击master分支
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025105822.png"/>

我们，就看到了，自己刚刚提交到本地仓库中的记录了。

---

#### 使用命令行来操作

现在，使用命令行界面来操作：

在一个目录下，右键，点击Git Bush：

我选择的是：E:\gitdemo
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025110804.png"/>

1) git init demo2
```
liuzhuo@Gakki MINGW64 /e/gitdemo
$ git init demo2
Initialized empty Git repository in E:/gitdemo/demo2/.git/
```

2) 进入仓库的目录
```
liuzhuo@Gakki MINGW64 /e/gitdemo
$ cd demo2

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$
```
**ps:上面的右边的括号(master)，代表现在是主分支。**

3) 创建新的文件

```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ echo "demo2 text~~~~" >> text2.txt

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$
```

此时，在demo2工作目录下，就会出现一个新的文件，text2.txt文件。

4）查看状态

git status
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        text2.txt

nothing added to commit but untracked files present (use "git add" to track)

```

说明，当前是在主分支下，新建的text2.txt文件还没有提交。

5）先添加到暂存区

git add text2.txt

```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git add text2.txt
warning: LF will be replaced by CRLF in text2.txt.
The file will have its original line endings in your working directory.

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)

        new file:   text2.txt

```

此时，文件已经加入到暂存区域了，最后，需要提交到本地仓库中

6）提交到本地仓库

git commit -m "repo2 first commit"
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git commit -m "repo2 first commit"
[master (root-commit) 8f22147] repo2 first commit
 1 file changed, 1 insertion(+)
 create mode 100644 text2.txt

```
7) 查看本地仓库的状态

git status
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master
nothing to commit, working tree clean

```
---

### Git 工作流

现在，模拟一下，你上班的情况。第一天上班，创建自己的本地仓库，提交自己的完成的代码需求。

#### SourceTree

1）新建一个本地仓库

这里，我选择的是 E:\gitdemo\demo3，大家可以根据自己的喜好自由创建。
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025113245.png"/>

2) 添加新的文件

点击中间的：在文件管理器中打开

然后，创建demo3.txt文件，并输入：第一天的需要，已经完成

再回到SourceTree中：

<img src="https://gakkil.gitee.io/gakkil-image/git/20181025113527.png"/>

3）add + commit
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025114112.png"/>

4) 提交成功
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025114212.png"/>

---

现在，快到下班了，产品经理提了一个临时的需求，所以，我们快马加鞭的写完，但是还没有自测，就只将先写的代码，保存到暂存区域中，不提交到本地仓库中。

1）打开，demo3.txt 文件，先加入一句话：临时需求已做完！
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025114518.png"/>

2) 在SourceTree中，将先修改的demo3文件，保存到暂存区域中：

<img src="https://gakkil.gitee.io/gakkil-image/git/20181025114641.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/git/20181025114717.png"/>

此时，拿起我们的背包，下班回家。

第二天，上班，那个该死的产品经理，说昨天的临时需求不要了，内心一万个曹尼玛~~~

所以，我们需要将暂存区域的代码和工作区域的代码，回滚到上一个阶段。

3）点击demo3.text，右键：丢弃
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025115021.png"/>

4) 点击确定丢弃
<img src="https://gakkil.gitee.io/gakkil-image/git/20181025115425.png"/>

5) 点击demo3.txt文件
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025115532.png"/>

**发现，demo3.txt文件中，回滚到了上一次提交的状态。**

**删除了：临时需求已做完**

---

第二天，继续codeing，编写产品经理提出的新需求。

1）打开demo3.txt文件

添加：第二天的需要已经完成！
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025115902.png"/>

2) add + commit
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025120045.png" />

<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025120147.png" />

能看到，有两次的提交记录。

3）突然，产品经理说，这个需要不要了。内心无话可说

所以，我们需要回滚到上一次提交的状态。

点击 first commit ，**右键：重置当前分支到此次提交**

<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025124253.png"/>

要回到哪个状态，就点击哪个状态，然后右键重置当前分支到此次提交：

<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025124921.png"/>

点击确定。

4）现在在工作区域下，能看到，上次修改后的没有提交的代码。
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025125125.png"/>

5) 丢弃修改的demo3.txt
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025125317.png"/>

6）打开demo3.txt文件：
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025125416.png"/>

回滚到第一次提交成功的状态了。

---

现在，产品经理，说第一次提交的需求，也不需要了，需要删除这个文件。

1）直接在工作目录下，直接删除demo3.txt文件
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025125817.png"/>

2）add + commit
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025125922.png"/>

<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025125959.png"/>

3) 此时，工作目录，暂存区域，本地仓库都删除了demo3.txt文件了。

---

#### 命令行模式

现在使用命令行来操作：

1）打开命令行
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025130301.png"/>

2）在demo2下，创建bash_demo.txt文件

在文件中，输入：bash_demo 第一次提交成功.
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025130624.png"/>

3) 在命令行查看状态

 git status
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)

        bash_demo.txt

no changes added to commit (use "git add" and/or "git commit -a")

```

4) 报存到暂存区：
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git add bash_demo.txt

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        new file:   bash_demo.txt

```

5) 提交到本地仓库中：
```

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git commit -m "bash_demo first commit"
[master 136ecd0] bash_demo first commit
 1 file changed, 1 insertion(+)
 create mode 100644 bash_demo.txt

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master
nothing to commit, working tree clean

```
---

6) 产品经理提出了临时的需要

打开bash_demo.txt文件，添加：产品经理临时变更需要。
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025131337.png"/>

7) 查看 + add到暂存区域中：
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   bash_demo.txt

no changes added to commit (use "git add" and/or "git commit -a")


liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git add bash_demo.txt

```

下班走人。

8）产品经理说，临时需要不要了

使用 ``git reset head xxx.txt`` （重置）
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git reset head bash_demo.txt
Unstaged changes after reset:
M       bash_demo.txt

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   bash_demo.txt

no changes added to commit (use "git add" and/or "git commit -a")

```

此时，只是将本地仓库的文件替换了暂存区域中的bash_demo文件。我们工作区域的文件还没有替换。

需要使用：``git checkout -- bash_demo.txt``
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git checkout -- bash_demo.txt

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master

```

打开bash_demo.txt文件。发现：产品经理临时变更需要。删除了

9）第二天继续开发

修改bash_demo.txt 文件。

添加：第二天的需要已经完成
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025132555.png"/>

10) 将修改后的文件，add + commit
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git add bash_demo.txt

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   bash_demo.txt


liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git commit -m "second commit"
[master b8412ec] second commit
 1 file changed, 3 insertions(+), 1 deletion(-)

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master
nothing to commit, working tree clean

```

不幸的是，产品经理说，第二天的需要不需要了。

11）查看提交日志

``git log``

```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git log
commit b8412ec81784d6be4a5097fca881a811fe1b1a58 (HEAD -> master)
Author: liuzhuo <575920824@qq.com>
Date:   Thu Oct 25 13:27:36 2018 +0800

    second commit


commit 136ecd07ab2b0742dff45dcdcfbde1d51da2df42
Author: liuzhuo <575920824@qq.com>
Date:   Thu Oct 25 13:10:32 2018 +0800

    bash_demo first commit


```

找到：bash_demo第一次提交的序列号：

commit 136ecd07ab2b0742dff45dcdcfbde1d51da2df42
Author: liuzhuo <575920824@qq.com>
Date:   Thu Oct 25 13:10:32 2018 +0800

bash_demo first commit

这里，就是：``136ecd07ab2b0742dff45dcdcfbde1d51da2df42``

12）回滚

``git reset --hard 136ecd07ab2b0742dff45dcdcfbde1d51da2df42``

```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git reset --hard 136ecd07ab2b0742dff45dcdcfbde1d51da2df42
HEAD is now at 136ecd0 bash_demo first commit

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master
nothing to commit, working tree clean

```

查看，bash_demo.txt文件：
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025133411.png"/>

bash_demo文件就回滚到第一次提交的状态了。

13）现在产品经理说，所做的工作都不需要了。

删除bash_demo文件

git rm bash_demo
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git rm bash_demo.txt
rm 'bash_demo.txt'

```

git commit -m "delete bash demo"
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git commit -m "delete bash demo"
[master 6d7eacc] delete bash demo
 1 file changed, 1 deletion(-)
 delete mode 100644 bash_demo.txt

liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ git status
On branch master
nothing to commit, working tree clean

```

这样工作目录和本地仓库都删除了bash_demo文件了。

---

#### 总结
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025134253.png"/>

1) 在工作区，先创建的文件，使用add，添加到暂存区，然后commit提交到本地仓库中。

2）reset head命令：head是指向本地仓库的指针。  
``reset head file`` 就是重置本地仓库中版本文件到暂存区中。  
然后使用``checkout -- file`` 命令，将暂存区中的版本文件，重写到工作区中。

3）``rm -- file``: 直接删除暂存区中的文件。然后commit提交，就更新到本地仓库中了。

4）``checkout head file``: 一般不用，比较危险，因为使用这个命令，会把本地仓库中的版本文件，直接覆写到暂存区和工作区中。

---

图中左侧为工作区，右侧为版本库。在版本库中标记为 "index" 的区域是暂存区（stage/index），标记为 "master" 的是 master 分支所代表的目录树。

图中我们可以看出此时 "HEAD" 实际是指向 master 分支的一个“指针”。所以，图示的命令中出现 HEAD 的地方可以用 master 来替换。

图中的 objects 标识的区域为 Git 的对象库，实际位于 ".git/objects" 目录下。

当对工作区新增或修改的文件执行 "git add" 命令时，暂存区的目录树被更新，同时工作区新增或修改的文件内容被写入到对象库中的一个新的对象中，而该对象的ID被记录在暂存区的文件索引中。（如上图）

当执行提交操作 "git commit" 时，暂存区的目录树写到版本库的对象库（objects）中，master 分支会做相应的更新。即 master 指向的目录树就是提交时暂存区的目录树。（如上图）

当执行 "git reset HEAD" 命令时，暂存区的目录树会被重写，被 master 分支指向的目录树所替换，但是工作区不受影响。 当执行 ``git rm --cached <file>`` 命令时，会直接从暂存区删除文件，工作区则不做出改变。

当执行 "git checkout " 或者 ``git checkout -- <file>`` 命令时，会用暂存区全部或指定的文件替换工作区的文件。这个操作很危险，会清除工作区中未添加到暂存区的改动。

当执行 "git checkout HEAD ." 或者  ``git checkout HEAD <file>``  命令时，会用 HEAD 指向的 master 分支中的全部或者部分文件替换暂存区和以及工作区中的文件。这个命令也是极具危险性的，因为不但会清除工作区中未提交的改动，也会清除暂存区中未提交的改动。

---

### 创建ssh key

1）我们如果需要使用ssh来连接远程仓库的话，这里使用github当做远程仓库。

首先，生成我们的ssh的公钥：
ssh -keygen -t rsa -C "youremail@exmple.com"

在github上面，创建我们的账号。在setting里面，找到 SSH and GPG keys
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025144339.png"/>

点击右上角的：New SSH key
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025144438.png"/>

填写title，自己定义。key，需要使用命令来生成。

在Git bash界面下，输入生成ssh的命令：
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ ssh-keygen -t rsa -C "575920824@qq.com"
Generating public/private rsa key pair.
Enter file in which to save the key (/c/Users/liuzhuo/.ssh/id_rsa):

```

直接回车，覆盖以前的就好了。

这样就会在c盘的用户目录生成一个.ssh文件夹

C:\Users\liuzhuo\.ssh

打开**id_rsa.pub**文件，将里面的key复制到github的ssh中key中：
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025145015.png"/>

2) 测试是否连接github成功：

使用命令：ssh -T git@github.com
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo2 (master)
$ ssh -T git@github.com
Hi liuzhuo19940206! You've successfully authenticated, but GitHub does not provide shell access.

```
连接成功！！

---

### 添加远程仓库

#### 使用命令行的方式

在自己的github上面的，添加新的远程仓库
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025145915.png" style="width:50%"/>

点击 New repository
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025150029.png" />

填写  

Repository name:仓库的名字

Description：仓库的描述信息

public：公共的仓库

private：私有的仓库
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025150238.png"/>

点击：Create repository
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025150341.png"/>

上面的两块部分，描述了，将本地仓库和这个远程仓库连接起来的方法！

第一种：
```
…or create a new repository on the command line
echo "# gitDemo" >> README.md
git init
git add README.md
git commit -m "first commit"
git remote add origin https://github.com/liuzhuo19940206/gitDemo.git
git push -u origin master
```

按照上面的步骤来，就行了。

在E:\gitdemo\demo4目录下，启动git的命令行界面
```

liuzhuo@Gakki MINGW64 /e/gitdemo/demo4
$ echo "# gitDemo" >> README.md      //创建一个文件

liuzhuo@Gakki MINGW64 /e/gitdemo/demo4
$ git init                          //创建一个本地仓库
Initialized empty Git repository in E:/gitdemo/demo4/.git/

liuzhuo@Gakki MINGW64 /e/gitdemo/demo4 (master)
$ git add README.md                 //添加文件到暂存区
warning: LF will be replaced by CRLF in README.md.
The file will have its original line endings in your working directory.

liuzhuo@Gakki MINGW64 /e/gitdemo/demo4 (master)
$ git commit -m "first commit"      //提交信息到本地仓库
[master (root-commit) e1e56e5] first commit
 1 file changed, 1 insertion(+)
 create mode 100644 README.md

```

接下来，连接本地仓库和远程仓库：
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo4 (master)
$ git remote add origin https://github.com/liuzhuo19940206/gitDemo.git

```
最后，将本地仓库的提交到远程仓库中：
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo4 (master)
$ git push -u origin master

```

第一次提交会出现验证信息的弹窗：
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025151356.png" style="width:50%"/>

输入用户名和密码即可。

出现了 fatal: HttpRequestException encountered.

解决：Github 禁用了TLS v1.0 and v1.1，必须更新Windows的git凭证管理器 

通过此网址 https://github.com/Microsoft/Git-Credential-Manager-for-Windows/releases/
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025152916.png"/>

点击GCMW-1.14.0.exe，下载并安装。

重启git窗口：
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo4 (master)
$ git push -u origin master
Counting objects: 3, done.
Writing objects: 100% (3/3), 217 bytes | 217.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0)
remote:
remote: Create a pull request for 'master' on GitHub by visiting:
remote:      https://github.com/liuzhuo19940206/gitDemo/pull/new/master
remote:
To https://github.com/liuzhuo19940206/gitDemo.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.

```

就可以了，说明你的git和github已经可以同步了

在github上面，刷新你刚刚创建的项目：
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025154108.png"/>

---

现在，修改README.md文件
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025154259.png"/>


然后  

git add README.md

git commit -m "second commit"

最后

将本地仓库同步到远程仓库

git push

这里不用指明远程仓库的名字，因为第一次同步后，就不需要了。

```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo4 (master)
$ git push
Counting objects: 3, done.
Writing objects: 100% (3/3), 277 bytes | 277.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0)
To https://github.com/liuzhuo19940206/gitDemo.git
   e1e56e5..39e3593  master -> master

```

刷新远程仓库：
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025154719.png"/>

说明，本地仓库和远程仓库同步成功!!!!

---

#### 使用SourceTree

1）创建新的远程仓库
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025155615.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025155703.png"/>

2) 打开SourceTree创建本地仓库
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025155817.png"/>

在本地仓库中，新建文件sourcetree.txt文件
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025160003.png"/>

3）使用SourceTree添加到本地仓库中
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025160104.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025160120.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025160210.png"/>

4）将本地仓库和远程仓库连接起来

点击master，然后点击右上角的设置
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025160348.png"/>

点击添加远程仓库：
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025160430.png"/>

填写信息：

远程仓库名称：origin（自定义）

URL：在github中远程仓库复制。  
这里是：https://github.com/liuzhuo19940206/gitDemo_SourceTree.git

用户名：提交的用户名
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025160716.png"/>

点击确认。

在SourceTree中的左边的**远程中**：出现origin。
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025160844.png"/>

到此，我们就将远程仓库和本地仓库连接起来了。还没有同步！

5) 将本地仓库和远程仓库同步

点击菜单栏的推送
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025161056.png"/>

选好推送的远程仓库，添上加号，点击推送！

6）刷新远程仓库
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025161257.png"/>

发现，同步成功，点击sourcetree.txt文件
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025161359.png"/>

7）修改本地仓库中的sourcetree.txt文件
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025161447.png"/>

8）使用SourceTree提交
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025161550.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025174045.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025174124.png"/>

9）推送到远程仓库

此时，会发现推送上面会出现一个 1
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025174248.png"/>

点击推送
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025174319.png"/>

10）刷新远程仓库
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025174433.png"/>

这里出现了乱码，不影响我们的操作。

---

### 克隆仓库


克隆仓库：将远程的仓库克隆到本地当中。

使用的命令是：  
git clone htt或ssh地址  
git clone https://github.com/liuzhuo19940206/clone_repo_demo.git

1）在github上创建一个新的仓库
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025175600.png"/>

2) 直接在github上面创建一个README.md文件
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025175832.png"/>

上面两个步骤，就是假设刚刚创建的项目是别人的远程仓库，我们需要克隆别人的远程仓库，来进行多人开发。

#### 使用命令行来克隆

1）在E:\gitdemo\demo6下，启动git窗口
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025180055.png"/>

使用 ls -a
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo6
$ ls -a
./  ../

```
如果没有出现.git文件，说明此目录才能克隆仓库。不能在已经是本地仓库下的情况下克隆远程仓库

2）执行克隆命令

git clone https://github.com/liuzhuo19940206/clone_repo_demo.git
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo6
$ git clone https://github.com/liuzhuo19940206/clone_repo_demo.git
Cloning into 'clone_repo_demo'...
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (3/3), done.

```

此时，打开demo6目录：在该目录下面会出远程仓库的名称和README.md文件
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025183824.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025183908.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025183938.png"/>

到此，克隆成功。

---

#### 使用SourceTree来克隆

1）打开SourceTree，新建窗口
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025184546.png"/>

2）点击Clone按钮
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025184631.png"/>

第一行：远程仓库的地址  
https://github.com/liuzhuo19940206/clone_repo_demo.git

第二行：本地仓库的地址  
E:\gitdemo\demo7

<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025184839.png"/>

点击克隆
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025184925.png"/>

3）打开E:\gitdemo\demo7目录
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025185035.png"/>

---

### 标签管理

标签的作用是，给某个时刻的版本加上一个标签，然后，可以回滚到指定的标签。

标签的命令：

1) 查看所有标签 　　　　 git tag

2) 创建标签 　　　　　　 git tag name

3) 指定提交信息 　　　　 git tag -a name -m "comment"

4) 删除标签 　　　　　　 git tag -d name

5) 标签发布 　　　　　 　git push origin name

**ps:markdown中使用空格**

**1) 手动输入空格 （&nbsp；）。注意！此时的分号为英文分号，但是不推荐使用此方法，太麻烦！**

**2) 使用全角空格。即：在全角输入状态下直接使用空格键就ok了**

#### 使用命令行创建标签

现在是在E:\gitdemo\demo7目录下。
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025192253.png"/>

1）git tag 查看标签
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo7 (master)
$ git tag

liuzhuo@Gakki MINGW64 /e/gitdemo/demo7 (master)
$

```

发现，没有标签

2）创建标签
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo7 (master)
$ git tag v1.0.1

liuzhuo@Gakki MINGW64 /e/gitdemo/demo7 (master)
$ git tag
v1.0.1

```

3) push标签
```
liuzhuo@Gakki MINGW64 /e/gitdemo/demo7 (master)
$ git push origin v1.0.1
Total 0 (delta 0), reused 0 (delta 0)
To https://github.com/liuzhuo19940206/clone_repo_demo.git
 * [new tag]         v1.0.1 -> v1.0.1

```
4) 在远程仓库中验证标签是否推送成功
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025192912.png"/>

---

#### 使用SourceTree创建标签

1) 现在修改一下E:\gitdemo\demo7下的README.md文件，为了和命令行创建的标签形成对比.
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025193635.png"/>

使用SourceTree，add + commit + push
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025193833.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025193850.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025193916.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025194050.png"/>

2) 在SourceTree下创建新的标签

在SourceTree的菜单栏上面有一个标签的按钮，点击
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025194223.png"/>

第一行：标签的名称

提交：点击指定的提交
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025194327.png"/>

此时，可以选择在哪个提交的版本上面，创建新的标签，因为first commit上面有一个v1.0.1的标签了，为了区别，现在选择second commit的提交。点击确认

点击推送标签前面的方格，会将本地的标签推送到远程仓库上面。
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025194613.png"/>

3）点击添加标签
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025194731.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025194804.png"/>

4）在远程仓库上面验证
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025194853.png"/>

5）切换标签

点击v1.0.1标签：
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025195005.png"/>
**下面的README.md文件中，没有second commit。**

点击v2.0.1标签：
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025195110.png"/>
**下面的README.md文件中，有second commit。**

<font color="red">**以后，就可以切换标签，来回滚到自己想要的版本。**</font>

---

### 分支管理
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025200337.png"/>

一般是，在我们开发的过程中，在主分支master上面写。但是，每个人都有自己的任务，这个任务，不能短时间内完成，不能只完成一部分就提交到master主分支上面，这样会使的其他人无法使用master主分支了。我们也不能等到我们开发完后，一次性提交代码到master主分支上面。因为我们想记录我们的每一个开发流程。

所以，需要创建子分支来记录我们的开发流程。最后与主分支合并。

#### 使用命令行的方式

1）新建一个目录：E:\gitdemo\branch_demo

2）在该目录下，打开git窗口
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025201915.png"/>

3) 添加一个新的文件，模拟开发流程。

```
liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo
$ echo "branch first" >> branch_demo.txt            //创建新的文件

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo 
$ git init                                         //创建本地仓库
Initialized empty Git repository in E:/gitdemo/branch_demo/.git/

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git status
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        branch_demo.txt

nothing added to commit but untracked files present (use "git add" to track)

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git add branch_demo.txt                         //添加到暂存区
warning: LF will be replaced by CRLF in branch_demo.txt.
The file will have its original line endings in your working directory.

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git status
On branch master

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)

        new file:   branch_demo.txt


liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git commit -m "branch first commit"           //提交到本地仓库中
[master (root-commit) ac97673] branch first commit
 1 file changed, 1 insertion(+)
 create mode 100644 branch_demo.txt

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git status
On branch master
nothing to commit, working tree clean

```

4）开启新的分支
git brach  : 查看所有分支
git brach 分支名称 ：创建新的分支
```
liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git branch
* master

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git branch new_branch

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git branch
* master
  new_branch

```

5）切换分支
git checkout 分支名称
```
liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git checkout new_branch
Switched to branch 'new_branch'

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (new_branch)

```

切换成功后，右边的括号内就是分支的名称。

6）在新分支继续开发
```
liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (new_branch)
$ echo " new_branch" >> branch_demo.txt

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (new_branch)
$ git status
On branch new_branch
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   branch_demo.txt

no changes added to commit (use "git add" and/or "git commit -a")

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (new_branch)
$ git add branch_demo.txt
warning: LF will be replaced by CRLF in branch_demo.txt.
The file will have its original line endings in your working directory.

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (new_branch)
$ git status
On branch new_branch
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   branch_demo.txt


liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (new_branch)
$ git commit -m "new_branch commit"
[new_branch 25fe8ff] new_branch commit
 1 file changed, 2 insertions(+), 1 deletion(-)

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (new_branch)
$ git status
On branch new_branch
nothing to commit, working tree clean

```

7) 分别在每个分支查看branch_demo.txt文件

在新的分支下查看：
cat branch_demo.txt
```
liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (new_branch)
$ git branch
  master
* new_branch

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (new_branch)
$ cat branch_demo.txt
branch first
new_branch

```

切换到主分支查看：
```
liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (new_branch)
$ git checkout master
Switched to branch 'master'

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ cat branch_demo.txt
branch first

```

8) 合并分支

git merge 子分支的名字

<font color="red">在主分支(master)下，执行该命令</font>

```
liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git merge new_branch
Updating ac97673..25fe8ff
Fast-forward
 branch_demo.txt | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

```
9）查看主分支中的文件
```
liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ cat branch_demo.txt
branch first
new_branch

```

**现在，主分支与子分支合并成功，文件中出现了new_branch的信息。**

10）删除分支

当我们的项目接着开发，之前的new_brach分子不需要，浪费空间，所有需要删除。

git branch -d 分支的名称

```
liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git branch -d new_branch
Deleted branch new_branch (was 25fe8ff).

liuzhuo@Gakki MINGW64 /e/gitdemo/branch_demo (master)
$ git branch
* master

```

此时，new_branch分支删除成功。

#### 使用SourceTree的方式

1）打开SourceTree

在E:\gitdemo\branch_sourcetree_demo下创建本地仓库
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025205416.png"/>

2）在E:\gitdemo\branch_sourcetree_demo下创建branch_demo.txt文件：
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025205522.png"/>

3）add + commit
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025205642.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025205658.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025205724.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025205758.png"/>

4) 创建新的分支

在SourceTree的菜单栏上面有一个分支的按钮
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025205849.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025205950.png"/>

创建分支成功后，在SourceTree左边，会出现新的分支
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025210021.png"/>

**选中的分支前面会有一个圆圈**

5）在新的分支下，修改branch_demo.txt文件
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025210235.png"/>

6) 在新的分支下，add + commit
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025210332.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025210426.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025210509.png"/>

7）切换到master分支下

双击master主分支，就切换成功了。
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025210659.png"/>

8）打开E:\gitdemo\branch_sourcetree_demo下的branch_demo.txt文件
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025210750.png"/>

发现文件里面，没有new_branch second信息。

9）将子分支合并到主分支中

在主分支的情况下，点击菜单栏下的合并按钮
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025211021.png"/>

点击我们要合并的分支。然后点击确定。
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025211223.png"/>

现在，再打开E:\gitdemo\branch_sourcetree_demo下的branch_demo.txt文件。
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025211400.png"/>

现在，合并成功了。

10）删除分支

直接在要删除的分支上面右键
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025211604.png"/>
<img src="https://gakkil.gitee.io/gakkil-image/git/QQ%E6%88%AA%E5%9B%BE20181025211636.png"/>

---




