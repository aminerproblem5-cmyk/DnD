// Your web app's Firebase configuration
const firebaseConfig = {
    // Paste your Realtime Database URL here
    databaseURL: "https://dnd-4058a-default-rtdb.firebaseio.com/",
    
    // IMPORTANT: Get these remaining keys from your Firebase Project Console:
    // Project Settings -> General -> Your Apps (Web App)
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase once for the entire application
firebase.initializeApp(firebaseConfig);

// Make global shortcuts for our database and auth services
const auth = firebase.auth();
const database = firebase.database();