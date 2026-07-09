// --- TOGGLE BETWEEN LOGIN & REGISTER FORMS ---
const loginBox = document.getElementById('login-box');
const registerBox = document.getElementById('register-box');

document.getElementById('to-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginBox.classList.add('hidden');
    registerBox.classList.remove('hidden');
});

document.getElementById('to-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerBox.classList.add('hidden');
    loginBox.classList.remove('remove'); // Typo correction from html layout safely handled:
    loginBox.classList.remove('hidden');
});

// --- NEW ACCOUNT REGISTRATION ---
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    // 1. Create user credential profile in Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // 2. Save their custom display name/username into your Realtime Database tree
            return database.ref('users/' + user.uid).set({
                username: username,
                email: email
            });
        })
        .then(() => {
            alert("Account created successfully! Welcome to the realm.");
            window.location.href = 'dashboard.html'; // Send them to the dashboard
        })
        .catch((error) => {
            alert("Error signing up: " + error.message);
        });
});

// --- RETURNING USER LOGIN ---
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'dashboard.html'; // Access granted, head to dashboard
        })
        .catch((error) => {
            alert("Login failed: " + error.message);
        });
});