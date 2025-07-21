// script.js (MUST be saved as a real file, not inline)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-database.js";

// Replace these with your real Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyCiOKjtAT4Ho4_E8pB6OPKcA8W8v6-99-g",
  authDomain: "portfolio-views-e5193.firebaseapp.com",
  databaseURL: "https://portfolio-views-e5193-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portfolio-views-e5193",
  storageBucket: "portfolio-views-e5193.firebasestorage.app",
  messagingSenderId: "987390022667",
  appId: "1:987390022667:web:61e6b91680f94c0084a30e",
  measurementId: "G-B3T570VTWC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Counter logic
const counterRef = ref(database, 'viewCount');

get(counterRef).then(snapshot => {
  let count = 1;
  if (snapshot.exists()) {
    count = snapshot.val() + 1;
  }
  set(counterRef, count);
  document.getElementById("visitCount").innerText = `${count} views`;
}).catch(error => {
  console.error("Firebase error:", error);
  document.getElementById("visitCount").innerText = "N/A";
});



