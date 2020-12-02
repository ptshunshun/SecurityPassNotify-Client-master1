// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";
// Add the Firebase services that you want to use
import "firebase/firestore";
// TODO: Replace the following with your app's Firebase project configuration
import {firebaseConfig} from './config';
  // Initialize Firebase
firebase.initializeApp({
            apiKey: firebaseConfig.apiKey,
            authDomain: firebaseConfig.authDomain,
            databaseURL: firebaseConfig.databaseURL,
            projectId: firebaseConfig.projectId,
            storageBucket: firebaseConfig.storageBucket,
            messagingSenderId: firebaseConfig.messagingSenderId,
            appId:firebaseConfig.appId,
            measurementId:firebaseConfig.measurementId
});

const db = firebase.firestore();

const saveToFirestore =  (document, payload, collection) => {
    const dayOfWeekStr = [ "日", "月", "火", "水", "木", "金", "土" ]
    const date = new Date();
    const formattedDate = `
    ${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}(${dayOfWeekStr[date.getDay()]})`.replace(/\n|\r/g, '');
    payload['checkedAt'] = formattedDate;
    payload['timestamp']=new Date().toDateString();

    return db
      .collection(collection)
      .doc(document)
      .set(payload)
      .then(resp => true)
      .catch(e => {
        console.log(e.message);
      });
};
const saveIfNotExist=(document,payload,collection)=>{
  return db
    .collection(collection)
    .doc(document)
    .get()
    .then(doc=>{
      if(doc.exists){
        return false;
      }else{
        return saveToFirestore(document,payload,collection);
      }
    })
}

const getAllRecordsInFirestoreCollection = (collection) => {
    return db
        .collection(collection)
        .get()
        .then(records => records)
        .catch(e => {
        console.log('Error retrieving records', e);
        });
    }

export { saveIfNotExist,getAllRecordsInFirestoreCollection };