const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult} = require('express-validator');
const router = express.Router();
//set firebase
var firebase = require('../connections/firebse_client');
// var firebaseDb = require('../connections/firebase_admin');

//const urlencodedParser = bodyParser.urlencoded({extended:false});
/*此文件下的路徑皆為user/....*/

//friend list route
router.get('/friend', function(req,res){
    if(req.session.user !== null){
        req.user=req.session.user;
        let uid = req.user.uid;
        //console.log(uid);
        const promise =  new Promise((resolve, reject)=>{
            firebase.database().ref('friendList').on('value', function (snapshot) {
                var friendList = snapshot.val();
                var friends = []
                for(var item in friendList){
                    if(friendList[item].uidA == uid || friendList[item].uidB == uid ){
                        if( friendList[item].uidA == uid ){
                            friends.push(friendList[item].uidB)
                            friends.push(friendList[item].nameB)
                        }
                        else if( friendList[item].uidB == uid ){
                            friends.push(friendList[item].uidA)
                            friends.push(friendList[item].nameA)
                        }
                    }
                }
                resolve(friends);
            })
        })
        promise.then(
            function(friends){
                //console.log(friends);
                req.user.friends = friends;
                console.log(req.user)
                res.render('friend',req);
            }
        )
    }
})
//register finish
router.post('/register',
    check('username','Username cannot be empty').notEmpty(),
    check('email','The email address is badly formatted').isEmail(),
    check('password', 'The password is invalid').isLength({ min: 6 }),
    check('email').custom((value)=>{
        return new Promise((resolve, reject)=>{
            firebase.database().ref('users').on('value', function (snapshot) {
                var users = snapshot.val();
                for(var item in users){
                    if(users[item].email == value){
                         reject(new Error('The email address is in use by another account.'))
                         console.log('Email address already exists');
                    }
                }
                resolve()
             })
        })
    }),
    check('confirm_password').custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Password and confirm password dose not matched');
        }
        return true
    }),
    function (req, res) {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;
        let confirm_password = req.body.confirm_password;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
                res.status(422).render('register', {
                alert: errors.array(),
            });
        }
        else{
            firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
                loginUser = firebase.auth().currentUser;
                var user_information = {
                    username: username,
                    email: email,
                    password: password,
                    uid: loginUser.uid
                }
                var users = firebase.database().ref('users/'+loginUser.uid);
                users.set(user_information);
            })
            res.render('register', {
                show : true
            });
        }
        //console.log(username, email, password, confirm_password);
})
// check login 
router.post('/login', 
    check('email','The email address is badly formatted').isEmail(),
    check('password', 'The password is invalid').isLength({ min: 6 }),
    check('password').custom((value,{req})=>{
        return new Promise((resolve, reject)=>{
            firebase.database().ref('users').on('value', function (snapshot) {
                var users = snapshot.val();
                var tag = 0;
                for(var item in users){
                    if(users[item].email == req.body.email){
                        tag = 1;
                        if(users[item].password != value){
                            reject(new Error('Failed login'))
                            //console.log('Failed login');
                            break;
                        }
                        else{
                            resolve();
                            break;
                        }
                    }
                }
                if(tag == 0){
                    reject(new Error('You should be register first.'))
                    //console.log('You should be register first');
                }
                resolve()
            })
        })
    }),
    function(req, res){
        let email = req.body.email;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('login', {
                alert: errors.array()
            });
        }
        else{
            const promise =  new Promise((resolve, reject)=>{
                //console.log(email);
                firebase.database().ref('users').on('value', function (snapshot) {
                    var users = snapshot.val();
                    for(var item in users){
                        if(users[item].email == email){
                            var value = {
                                username: users[item].username,
                                uid: users[item].uid
                            }
                            resolve(value);
                        }
                    }
                })
            })
            promise.then(
                function(value){
                    req.session.user =  { username: value.username, uid: value.uid}
                    res.redirect('/user/friend')
                }
            )
        }
    })




module.exports = router;