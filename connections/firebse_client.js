const firebase = require('firebase');
require('dotenv').config();
 
const config = {
 apiKey: process.env.FIREBASE_API_KEY,
 authDomain: process.env.FIREBASE_AUTH_DOMAIN,
 databaseURL: process.env.FIREBASE_DATABASEURL,
 projectId: process.env.FIREBASE_PROJECT_ID,
 storageBucket: "project-24e50.appspot.com",
 messagingSenderId: "288682563378",
 appId: "1:288682563378:web:8f74f738e7eae9fa2c292b",
 measurementId: "G-L0YNSVDTCD"
};
 
firebase.initializeApp(config);
module.exports = firebase;