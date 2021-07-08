One to One Random Chatroom  
with Nodejs Socket.io Firebase
===


## Beginners Guide

If you are a total beginner to this, start here!
## About the project

### Introduction
---
![](https://i.imgur.com/8ILnVPz.png)

This project can chat with friends realtime. Enter the random chat room, and you can chat with others in real time as well as send friend request.

### Built with
----
* FrontEnd: Use EJS with Bootstrap  
* BackEnd: Use Node.js framework
* Use the Socket.io to establish the connection
* Database: Firebase

## The feature of the project

### Login and Register
---

![](https://i.imgur.com/JqlZzaL.png)

Login  
* cannot use dumplicate email address
* the password must not be less than 6 digits
* password and confirm password must be the same

Register 
* need to use an email address as a registered account 
* If you type the password correctly, you will enter the friend list page

### Friend list page
---

Chat histoy  
* The friend list page can show the chat history with friends

<img src="https://i.imgur.com/AApuUUt.gif" width="500">

Chat with friend in realtime
* click a friend on the friend list to enter an exclusive chat room

<a href="https://drive.google.com/uc?export=view&id=1TXdzlAL_ZmlTbWhpy2MQKmcgfH3EtKX2"><img src="https://drive.google.com/uc?export=view&id=1TXdzlAL_ZmlTbWhpy2MQKmcgfH3EtKX2" style="width: 650px; max-width: 100%; height: auto;" title="Click to enlarge picture" />

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








