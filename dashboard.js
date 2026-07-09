let currentUserId = null;

// 1. Check if the user is logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUserId = user.uid;
        loadUserData(user.uid);
        loadCharacters(user.uid);
        loadCampaigns(user.uid);
    } else {
        // If not logged in, kick them back to the login page
        window.location.href = 'index.html';
    }
});

// 2. Fetch and display the user's profile name
function loadUserData(uid) {
    database.ref('users/' + uid).once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data && data.username) {
                document.getElementById('user-display-name').innerText = `Hail, ${data.username}`;
            }
        });
}

// 3. Load characters belonging to this user
function loadCharacters(uid) {
    const charListEl = document.getElementById('characters-list');
    
    // Listen to data from your specific Firebase URL path
    database.ref('characters').orderByChild('userId').equalTo(uid)
        .on('value', (snapshot) => {
            charListEl.innerHTML = ''; // Clear loading text
            
            if (!snapshot.exists()) {
                charListEl.innerHTML = '<p class="loading-text">No heroes forged yet. Go create one!</p>';
                return;
            }

            snapshot.forEach((childSnapshot) => {
                const charId = childSnapshot.key;
                const char = childSnapshot.val();
                
                // Create a card for each character sheet found
                const charCard = document.createElement('div');
                charCard.className = 'auth-box'; // re-using styles for clean look
                charCard.innerHTML = `
                    <h3>${char.name}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">
                        STR: ${char.stats.str} | DEX: ${char.stats.dex} | CON: ${char.stats.con}<br>
                        INT: ${char.stats.int} | WIS: ${char.stats.wis} | CHA: ${char.stats.cha}
                    </p>
                `;
                charListEl.appendChild(charCard);
            });
        });
}

// 4. Load Campaigns the user is a part of
function loadCampaigns(uid) {
    const campListEl = document.getElementById('campaigns-list');
    
    database.ref('campaigns').on('value', (snapshot) => {
        campListEl.innerHTML = ''; // Clear loading text
        let foundCampaign = false;

        snapshot.forEach((childSnapshot) => {
            const campId = childSnapshot.key;
            const camp = childSnapshot.val();

            // Show campaign if user is the DM or listed as a player
            if (camp.dmId === uid || (camp.players && camp.players[uid])) {
                foundCampaign = true;
                const role = camp.dmId === uid ? '👑 DM' : '⚔️ Player';
                
                const campCard = document.createElement('div');
                campCard.className = 'auth-box';
                campCard.innerHTML = `
                    <h3>${camp.campaignName}</h3>
                    <p style="color: var(--accent); font-size: 0.85rem; margin-bottom: 10px;">Role: ${role}</p>
                    <button class="btn-mini" onclick="enterCampaign('${campId}')">Enter Table</button>
                `;
                campListEl.appendChild(campCard);
            }
        });

        if (!foundCampaign) {
            campListEl.innerHTML = '<p class="loading-text">You are not in any active campaigns yet.</p>';
        }
    });
}

// 5. Campaign Creation Modal Logic
const modal = document.getElementById('campaign-modal');
document.getElementById('create-campaign-btn').addEventListener('click', () => modal.classList.remove('hidden'));
document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));

document.getElementById('confirm-create-campaign').addEventListener('click', () => {
    const campName = document.getElementById('new-campaign-name').value.trim();
    if (!campName) return alert("Please name your campaign!");

    const newCampRef = database.ref('campaigns').push();
    newCampRef.set({
        campaignName: campName,
        dmId: currentUserId,
        players: {
            [currentUserId]: true // The DM is added as a player automatically
        }
    }).then(() => {
        modal.classList.add('hidden');
        document.getElementById('new-campaign-name').value = '';
    });
});

// Navigation router function
window.enterCampaign = function(campaignId) {
    window.location.href = `campaign.html?id=${campaignId}`;
};

// 6. Handle Logging Out
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
});