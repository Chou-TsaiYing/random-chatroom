let express = require('express');
let path = require('path');
//let flash = require('connect-flash');
let session = require('express-session');
let bodyParser = require('body-parser');
let logger = require('morgan');
//set express validator

let app = express();




//set socket.io connection
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//which port you want
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});


// view engine setup
app.set('views', path.join(__dirname, 'views')); 
app.engine('ejs', require('express-ejs-extend'));
app.set('view engine', 'ejs');


app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(session({ secret: 'mysupersecret', name:'user' ,resave: true, saveUninitialized: true }));//set session 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


let router = require('./routers/user.js');
app.use('/user', router);


//set index router
//set firebase

// let firebaseDb = require('../HW5temp/connections/firebase_admin');
let firebase = require('../HW5temp/connections/firebse_client');
const { create } = require('domain');
const { userInfo } = require('os');
const { resolve } = require('path');

//login route
app.get('/user/login', function(req,res){
    res.render(__dirname+'/views/login.ejs');
})
//register route
app.get('/user/register', function(req,res){
    res.render(__dirname+'/views/register.ejs');
})

app.get('/?',function(req, res){
    req.user = req.session.user;
    res.render(__dirname+'/views/random_chat.ejs',req)
})

firebase.database().ref('friendList').on('value', function (snapshot) {
    snapshot.forEach(function(childSnapshot) {
        var room_key = childSnapshot.key;
        var friendList = childSnapshot.val();
        //console.log(room_key,friendList);

        let sender_uid = friendList.uidA;
        let receiver_uid = friendList.uidB;
        let sender_name  = friendList.nameA;
        let receiver_name = friendList.nameB;

        //set chat room route
        app.get('/'+sender_uid+'_'+receiver_uid, function(req, res){
            const promise =  new Promise((resolve, reject)=>{
                var db = firebase.database().ref('message/' + room_key);
                db.orderByChild('updatedAt').on('value', function (snapshot) {
                        var messageList = [];
                        snapshot.forEach(function(childSnapshot) {
                            var chatList = childSnapshot.val();
                            var messages = {
                                sender: chatList.sender,
                                receiver: chatList.receiver,
                                message: chatList.message,
                                time: chatList.time
                            }
                            messageList.push(messages);
                        })
                        resolve(messageList)
                })
            })
            promise.then(
                function(messageList){
                    //console.log(messageList);
                    res.render(__dirname+'/views/chat_room.ejs',{
                        sender_name: sender_name,
                        receiver_name: receiver_name,
                        room_key: room_key,
                        messageList: messageList
                    });
                }
            )
        })
        app.get('/'+receiver_uid+'_'+sender_uid, function(req, res){
            const promise =  new Promise((resolve, reject)=>{
                var db = firebase.database().ref('message/' + room_key);
                db.orderByChild('updatedAt').on('value', function (snapshot) {
                        var messageList = [];
                        snapshot.forEach(function(childSnapshot) {
                            var chatList = childSnapshot.val();
                            var messages = {
                                sender: chatList.sender,
                                receiver: chatList.receiver,
                                message: chatList.message,
                                time: chatList.time
                            }
                            messageList.push(messages);
                        })
                        resolve(messageList)
                })
            })
            promise.then(
                function(messageList){
                    console.log(messageList);
                    res.render(__dirname+'/views/chat_room.ejs',{
                        sender_name: receiver_name,
                        receiver_name: sender_name,
                        room_key: room_key,
                        messageList: messageList
                    });
                }
            )
        })    
    })
})

global.users = [];
global.NewUser = [];
var freeList = [];
var alluser = {};
var rooms = {};
var friend_request = {};
var friendList = {};

//set socket io server
io.on('connection', function (socket) {
    search_friend();
    //friend chat room
    let name = socket.handshake.query.username;
    socket.on('disconnect', () => {
        var socketid = socket.id;
        //console.log(socketid);
        for(var i=0; i<users.length; i++){
            if(users[i].id && users[i].id == socketid){
                //remove user from users array
                users.splice(i,1);
                break;
            }
        }

        var room = rooms[socketid]
        //if someone exit from random chat room
        for(var i=0; i<NewUser.length; i++){
            if(NewUser[i].id && NewUser[i].id == socketid){
                //if chat with someone leaving  random room
                io.sockets.in(room).emit('offline', {
                    exit_name: NewUser[i].name,
                });

                 //remove from freeList
                arrayRemove(freeList, NewUser[i].uid);
                 //remove from NewUser
                NewUser.splice(i,1);
                break;
            }
        }

        //exist the room
        socket.leave(room);
        if(room != undefined){
            var peerID = room.split('#');
            peerID = peerID[0] === socket.id ? peerID[1] : peerID[0];
            if(friend_request[socketid] == true){
                delete friend_request[socketid];
            }
            if(friend_request[peerID] == true){
                delete friend_request[peerID];
            }
        }
        delete rooms[socketid];
        delete alluser[socketid];
        //console.log('users',users);
        console.log('user',alluser[socketid]);
        console.log('NewUser',NewUser);
        console.log('user disconnected');
    })
    if(name){
        users.push({
            id : socket.id,
            username: name
        })
    }    
    // receive message from client
    socket.on('message',function(data){
        //console.log(data);
        var message = {
            sender: data.sender,
            receiver: data.receiver,
            message: data.msg,
            time: data.time
        }
        //svae the message to database
        firebase.database().ref('message/'+ data.room_key).push(message);
        //send message to client
        io.emit("message",data)
    })

    // random chat room
    function matching(uid){

        console.log('NewUser',NewUser);
        console.log('friends',friendList);
        freeList.push(uid);
        var Socket = return_socket(NewUser, alluser, uid);
        Socket.emit("Pairing",{
            msg: 'Pairing in progress',
            time: get_time(Date.now())
        })
        console.log('freeList',freeList);
        if(rooms[Socket.id] != undefined){
            var room = rooms[Socket.id];
            var peerID = room.split('#');
            peerID = peerID[0] === Socket.id ? peerID[1] : peerID[0];
            var peer_uid = find_uid(NewUser, peerID);
            //console.log(peer_uid);
            delete rooms[Socket.id];
        }
        //if there is someone waiting in free list
        if(freeList.length > 1){
            var sender_id = uid;
            var sender = find_name(NewUser, sender_id);
            var random_arr = random(freeList.length);
            var n="";
            for(var i=0; i<random_arr.length; i++){
                    //cannot match with oneself and cannot match with friends
                if(freeList[random_arr[i]] != sender_id && freeList[random_arr[i]] != peer_uid && freeList[random_arr[i]] != friendList[sender_id]){
                    n = freeList[random_arr[i]];
                }
            }
            if(n!=""){
                arrayRemove(freeList,sender_id);
                arrayRemove(freeList,n);
                var receiver_id = n;
                console.log(receiver_id);
                var receiver = find_name(NewUser, receiver_id);
                var room=""
                //remove pairs from freelist
                console.log(freeList)
                console.log(sender, receiver);
                        
                var receiver_socket = return_socket(NewUser, alluser, receiver_id);
                var receiver_socketid = find_socketid(NewUser, receiver_id);
                var sender_socket = return_socket(NewUser, alluser, sender_id);
                var sender_socketid = find_socketid(NewUser, sender_id);
                //the paired room
                room = receiver_socketid + '#' + sender_socketid;
                //console.log(sender_socketid,receiver_socketid,room);
    
                //join the room
                receiver_socket.join(room);
                sender_socket.join(room);
                rooms[receiver_socketid] = room;
                rooms[sender_socketid] = room;
                var pair = {
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                    sender: sender,
                    receiver: receiver,
                    room: room,
                    time: get_time(Date.now())
                }
                receiver_socket.emit('succes_pairing',pair)
                sender_socket.emit('succes_pairing',pair)
            }
        }
    }
    //add new user
    socket.on('newUser',function(data){
        var username = data.username;
        var uid = data.uid;
        NewUser.push({
            id: socket.id,
            uid: uid,
            name: username
        })
        alluser[socket.id] = socket;
        matching(uid);
    })
    
    socket.on('friend_request', function(data){
        var room = rooms[socket.id];
        if(room != undefined){
            var peerID = room.split('#');
            peerID = peerID[0] === socket.id ? peerID[1] : peerID[0];
            if(alluser[peerID] != undefined){
                friend_request[socket.id] = true;
                io.sockets.in(room).emit('request_msg', data);
        
                console.log(friend_request)
                if( friend_request[socket.id] == true && friend_request[peerID] == true){
                    var uidA = find_uid(NewUser, socket.id);
                    var uidB = find_uid(NewUser, peerID);
                    var nameA = find_name(NewUser, uidA);
                    var nameB = find_name(NewUser, uidB);
                    console.log(uidA, nameA, uidB, nameB);
                    var friend = {
                        nameA: nameA,
                        nameB: nameB,
                        uidA: uidA,
                        uidB: uidB
                    }
                    firebase.database().ref('friendList').push(friend);
                    io.sockets.in(room).emit('request_msg', {
                        sender: "server",
                        time: get_time(Date.now())
                    })
                    delete friend_request[socket.id];
                    delete friend_request[peerID];
                    console.log(friend_request)
                }
            }
        }
    })

    socket.on('rematch', function(){
        var room = rooms[socket.id];
        if(room != undefined){
            var peerID = room.split('#');
            peerID = peerID[0] === socket.id ? peerID[1] : peerID[0];
            console.log(peerID);
            if(alluser[peerID] != undefined){
                var socket_uid = find_uid(NewUser, socket.id);
                var peer_uid = find_uid(NewUser, peerID);
                var peer = alluser[peerID];
              
                socket.leave(room);
                peer.leave(room);
                console.log(rooms);
                
                matching(peer_uid);
                matching(socket_uid);
            }
            else{
                var socket_uid = find_uid(NewUser, socket.id);
                socket.leave(room);
                console.log(rooms);
                matching(socket_uid);
            }
        }
        
    })
    socket.on('chat_msg',function(data){
        //console.log(data);
        var room = rooms[socket.id];
        //send message to client
        io.sockets.in(room).emit("chat_msg",data)
    })
})

function get_time(timestamp){
	var date = new Date(timestamp);
	var time = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
	var today_date = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
	return today_date+' '+time;
}   

function arrayRemove(array, id){
    for(var i=0; i<array.length; i++){
        if(array[i] == id){
            array.splice(i, 1)
            break;
        }
    }
}

function search_friend(){
    firebase.database().ref('friendList').on('value', function (snapshot) {
        var friends = snapshot.val();
        for(var item in friends){
           friendList[friends[item].uidA] = friends[item].uidB;
           friendList[friends[item].uidB] = friends[item].uidA;
        }
    })
}
function find_name(array, id){
    for(var i=0; i<array.length; i++){
        if(array[i].uid && array[i].uid == id){
            return array[i].name;
        }
    }
}
function find_socketid(array, id){
    for(var i=0; i<array.length; i++){
        if(array[i].uid && array[i].uid == id){
            return array[i].id;
        }
    }
}
function find_uid(array, id){
    for(var i=0; i<array.length; i++){
        if(array[i].id && array[i].id == id){
            return array[i].uid;
        }
    }
}
function return_socket(array, socket_array, uid){
    var socketid;
    for(var i=0; i<array.length; i++){
        if(array[i].uid == uid){
            socketid = array[i].id;
            return socket_array[socketid];
        }
    }
}
function random(num){
    var array = [];
    for(var i=0; i<num; i++){
        array.push(i);
    }
    var newArray = [];
    for(var i=0; i<num; i++){
        var n = Math.floor(Math.random()*array.length);
        newArray.push(array[n]);
        array.splice(n,1);
    }
    return newArray;
}
