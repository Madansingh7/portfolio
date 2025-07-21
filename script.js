// ✅ Your Firebase config
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

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const viewRef = db.ref("viewCount");

// 🔁 Increment and Display View Count
viewRef.transaction(current => {
  return (current || 0) + 1;
}, (error, committed, snapshot) => {
  if (error) {
    console.error("Firebase error:", error);
    document.getElementById("visitCount").innerText = "N/A";
  } else {
    document.getElementById("visitCount").innerText = snapshot.val() + " views";
  }
});


