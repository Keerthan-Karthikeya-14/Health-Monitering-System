// Import Firebase modules (for module-based environments, otherwise use CDN scripts in HTML)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzFQgQYx3GZmP7hPsrLWSzZtNvp2H4yTI",
  authDomain: "login-63d94.firebaseapp.com",
  projectId: "login-63d94",
  storageBucket: "login-63d94.firebasestorage.app",
  messagingSenderId: "623510738701",
  appId: "1:623510738701:web:51c55754d44437cd458244",
  measurementId: "G-G5W4LXXJL1",
  databaseURL: "https://login-63d94-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// -------------------- GOOGLE SIGN-IN LOGIC --------------------
const provider = new GoogleAuthProvider();

document.getElementById('googleSignInBtn').addEventListener('click', function () {
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;
      const userRef = ref(db, 'users/' + user.uid);

      // Check if user exists in Realtime Database
      try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          // New user: store basic details
          await set(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            provider: "google"
          });
        }
        // Redirect to dashboard/home page
        window.location.href = "dashboard.html"; // Change to your dashboard/home page
      } catch (dbError) {
        alert("Database error: " + dbError.message);
      }
    })
    .catch((error) => {
      alert('Google sign-in failed: ' + error.message);
    });
});

// -------------------- EMAIL/PASSWORD LOGIN LOGIC --------------------
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    alert('Please enter both username and password.');
    return;
  }

  // You may need to fetch the email from the database if you use username instead of email
  // For this example, let's assume username is the email
  signInWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
      // Signed in
      window.location.href = "dashboard.html"; // Change to your dashboard/home page
    })
    .catch((error) => {
      alert('Login failed: ' + error.message);
    });
});

// -------------------- REGISTER BUTTON (Dummy) --------------------
document.getElementById('registerBtn').addEventListener('click', function () {
  alert('Register button clicked! (Implement registration logic)');
});

// -------------------- PASSWORD EYE TOGGLE --------------------
document.getElementById('togglePassword').addEventListener('click', function () {
  const passwordInput = document.getElementById('password');
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  this.classList.toggle('fa-eye-slash');
});
