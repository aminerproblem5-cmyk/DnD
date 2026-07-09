// 1. Parse the Campaign ID from the website URL string (e.g., campaign.html?id=-Nxyz...)
const urlParams = new URLSearchParams(window.location.search);
const campaignId = urlParams.get('id');

let currentUserId = null;
let isDM = false;

if (!campaignId) {
    alert("No active campaign session found!");
    window.location.href = 'dashboard.html';
}

// 2. Track Auth & Load the Tabletop Game Room
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUserId = user.uid;
        initializeCampaignRoom();
    } else {
        window.location.href = 'index.html';
    }
});

function initializeCampaignRoom() {
    // Listen for campaign data changes on your Firebase link
    database.ref(`campaigns/${campaignId}`).on('value', (snapshot) => {
        const camp = snapshot.val();
        if (!camp) {
            alert("This campaign has been closed or deleted by the DM.");
            window.location.href = 'dashboard.html';
            return;
        }

        // Set Title
        document.getElementById('campaign-title-display').innerText = camp.campaignName;

        // Check if the current logged-in user is the Dungeon Master
        if (camp.dmId === currentUserId) {
            isDM = true;
            // Reveal secret layout elements marked specifically for DM use
            document.querySelectorAll('.dm-controls').forEach(el => el.classList.remove('hidden'));
        }

        // Load specific layout elements
        loadNPCs(camp.npcs);
    });

    // Sync Live Chat Stream Room
    listenToChat();
}

// 3. Built-In Dice Roller Logic
window.rollDice = function(sides) {
    const roll = Math.floor(Math.random() * sides) + 1;
    sendChatMessage(`🎲 rolled a d${sides}: ${roll}`);
};

// 4. Real-time Text Chat Syncing
function sendChatMessage(text) {
    if (!text.trim()) return;
    
    // Push message structure straight to Firebase
    database.ref(`campaigns/${campaignId}/chat`).push({
        userId: currentUserId,
        text: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

// Listen for enter key or send button click
document.getElementById('send-chat-btn').addEventListener('click', () => {
    const input = document.getElementById('chat-msg');
    sendChatMessage(input.value);
    input.value = '';
});

function listenToChat() {
    database.ref(`campaigns/${campaignId}/chat`).limitToLast(20).on('child_added', (snapshot) => {
        const msg = snapshot.val();
        const chatStream = document.getElementById('chat-stream');
        
        const msgElement = document.createElement('div');
        msgElement.innerText = msg.text;
        
        // Format layout style if it's a dice roll or normal text
        if (msg.text.includes('🎲')) {
            msgElement.className = 'system-msg';
        }
        
        chatStream.appendChild(msgElement);
        chatStream.scrollTop = chatStream.scrollHeight; // Auto-scroll downward
    });
}

// 5. Sidebar Navigation Tab Selector Logic
window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    event.currentTarget.classList.add('active');
};

// 6. Enforce Dungeon Master Rule: Delete Campaign option
document.getElementById('delete-campaign-btn').addEventListener('click', () => {
    if (!isDM) return;
    
    const confirmation = confirm("Are you sure you want to permanently erase this campaign map and logs?");
    if (confirmation) {
        database.ref(`campaigns/${campaignId}`).remove()
            .then(() => {
                alert("Campaign deleted successfully.");
                window.location.href = 'dashboard.html';
            });
    }
});

// 7. NPC Loader Placeholder Logic
function loadNPCs(npcData) {
    const npcList = document.getElementById('npc-list');
    npcList.innerHTML = '';
    if (!npcData) {
        npcList.innerHTML = '<p class="loading-text">No NPCs registered in this zone yet.</p>';
        return;
    }
    // Dynamic iteration through your database map tree can be added right here later
}