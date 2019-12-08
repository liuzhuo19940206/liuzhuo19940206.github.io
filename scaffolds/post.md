---
title: {{ title }}
date: {{ date }}
author: gakkij
categories: [类别1,类别2] #文章类别
tags: [标签1,标签2]       #文章标签
img: /source/images/xxx.jpg #文章特色图片，没有使用默认的，推荐使用图床(腾讯云、七牛云、又拍云等)来做图片
top: true #推荐文章（文章是否置顶）
cover: true #表示该文章是否需要加入到首页轮播封面中
coverImg: /images/1.jpg 表示该文章在首页轮播封面需要显示的图片路径，如果没有，则默认使用文章的特色图片
summary: #这是你自定义的文章摘要内容，否则程序会自动截取文章的部分内容作为摘要
password: #文章阅读密码,不想设置就删除
toc: true #是否开启toc，可以针对某篇文章单独关闭 TOC 的功能。
---

这里是正文，用markdown写，你可以选择写一段显示在首页的简介后，加上
<!--more-->，在<!--more-->之前的内容会显示在首页，之后的内容会被隐藏，当游客点击Read more 才能看到。