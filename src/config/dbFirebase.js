// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

const firebase = {  //DB ก้อนหลัก เก็บข้อมูลทั้งหมดของ 
    apiKey: "AIzaSyCHwoYAZSdptkNHsBiB1kz742-n1rMEikU",
    authDomain: "appcheckin-68c4a.firebaseapp.com",
    projectId: "appcheckin-68c4a",
    storageBucket: "appcheckin-68c4a.appspot.com",
    messagingSenderId: "124659242456",
    appId: "1:124659242456:web:dd6152b58e6c15d2cc8ead",
    measurementId: "G-TNR9Y7HVW5"
};
const app = initializeApp(firebase);
const auth = getAuth(app);
const imagedb = getStorage(app);
const db = getFirestore(app);

module.exports = { app, auth, imagedb, db };