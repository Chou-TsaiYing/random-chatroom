---
title: 'One to One Random Chatroom with Nodejs Socket.io Firebase'
disqus: hackmd
---

One to One Random Chatroom  
with Nodejs Socket.io Firebase
===


## Beginners Guide

If you are a total beginner to this, start here!
## About the project

### Introduction
---
![](https://i.imgur.com/8ILnVPz.png)

This project can chat with friends realtime. Enter the random chat room, and you can chat with others in real time as well as send make friend request.

### Built with
----
* FrontEnd: Use EJS with Bootstrap  
* BackEnd: Use Node.js framework
* Use the Socket.io to establish the connection
* Database: Firebase

## The feature of the project

### Login and Signin
---

![](https://i.imgur.com/JqlZzaL.png)

Signin  
* cannot use dumplicate email address
* the password must not be less than 6 digits
* password and confirm password must be the same

Login  
* need to use an email address as a registered account 
* If you type the password correctly, you will enter the friend list page

### Friend list page
---

Chat histoy  
* The friend list page can show the chat history with friends

<img src="https://i.imgur.com/AApuUUt.gif" width="450">

Chat with friend in realtime
* click a friend on the friend list to enter an exclusive chat room

<img src="https://github.com/Chau-TsaiYing/Random_Chatroom/blob/main/LINE_P2021629_232955.gif" width="650">

### Random chat room
---

Random chat
* Enter the random chat room, you will be in waiting queue and wait for matching with others 
* Someone who is your friend in waiting queue cannot match with you

Send friend request
* In the random chat room, if both users send friend request, they become friends
* If one of the users in the chat room is offline, and the other one cannot send friend request

Rematch
* In the random chat room, if one of users click the rematch button, two users will be paired with a different online user, respectively








