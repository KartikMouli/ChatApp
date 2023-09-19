import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';



export const auth = firebase.initializeApp(
    {
        apiKey: "AIzaSyAmeaCW7aMVRdtVG6EDzrcYOC4FVq8qpuU",
        authDomain: "unichat-ef435.firebaseapp.com",
        projectId: "unichat-ef435",
        storageBucket: "unichat-ef435.appspot.com",
        messagingSenderId: "706369097877",
        appId: "1:706369097877:web:5c795b230c62668b3d4b9c"
    }
).auth();

