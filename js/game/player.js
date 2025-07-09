let player = {
    name: "Wanderer",
    health: 100,
    mana : 10,
    maxmana : 10,
    attack: 10,
    defense: 10,
    speed: 1,
    xp: 0,
    maxxp: 100,
    level: 1,
    glyphs: [],
    steps: 0,
    currentworld: "Overworld",
    money: 0,
    items: [],
    energy : 200,
    maxenergy : 200,
    maxhealth: 100,
    blocked: false,
};

function saveplayerdata() {
    localStorage.setItem("playerData", JSON.stringify(player));
}
function loadplayerdata() {
    const data = localStorage.getItem("playerData");
    if (data) {
        player = JSON.parse(data);
    } else {
        saveplayerdata();
    }
}

window.onload = function() {
    localStorage.removeItem("playerData"); // Clear player data on load for testing
    loadplayerdata();
};

function showLevelUpAnimation() {
    const outputEl = document.getElementById("output");
    const levelEl = document.getElementById("playerlevel");
    // It's safer to convert the HTMLCollection to an array before using forEach
    const actionButtons = Array.from(document.getElementsByClassName("action"));

    outputEl.style.color = "green";
    levelEl.style.color = "green";
    outputEl.innerText = `You leveled up! You are now level ${player.level}.`;

    player.blocked = true; // Block player actions during the animation

    // Use setTimeout for a one-time delayed action to reset the UI. This fixes the memory leak.
    setTimeout(() => {
        outputEl.style.color = "white";
        levelEl.style.color = "white";
        player.blocked = false; // Unblock player actions
    }, 2000); // Give the player 2 seconds to read the message
}

// This function should be called any time the player gains XP.
function checkLevelUp() {
    // Use a 'while' loop in case the player gains enough XP for multiple levels at once.
    while (player.xp >= player.maxxp) {
        player.level++;
        player.xp -= player.maxxp; // Carry over the remaining XP
        // A more gradual and predictable increase for max XP.
        player.maxxp = Math.floor(player.maxxp * 1.5);
        player.strength += Math.floor(Math.random() * 5) + 1;
        player.defense += Math.floor(Math.random() * 5) + 1;
        player.maxhealth += Math.floor(Math.random() * 10) + 5;
        player.health = player.maxhealth; // Restore health on level up
        showLevelUpAnimation(); // Trigger the visual effect
    }
}

setInterval(() => {
    saveplayerdata();
}, 1000); // Save player data every second


setInterval(() => {
    document.getElementById("healthbar").title = `Health: ${player.health}/${player.maxhealth}`;
    if (player.health >= player. maxhealth) {
        document.getElementById("healthbar").src = "../assets/healthbar/health_10.png"; // Full health
    } else if (player.health >= player.maxhealth / 10*9) {
        document.getElementById("healthbar").src = "../assets/healthbar/health_9.png"; // 90% health
    } else if (player.health >= player.maxhealth / 10*8) {
        document.getElementById("healthbar").src = "../assets/healthbar/health_8.png"; // 80% health
    } else if (player.health >= player.maxhealth / 10*7) {
        document.getElementById("healthbar").src = "../assets/healthbar/health_7.png"; // 70% health
    } else if (player.health >= player.maxhealth / 10*6) {
        document.getElementById("healthbar").src = "../assets/healthbar/health_6.png"; // 60% health
    } else if (player.health >= player.maxhealth / 2) {
        document.getElementById("healthbar").src = "../assets/healthbar/health_5.png"; // 50% health
    } else if (player.health >= player.maxhealth / 10*4) {
        document.getElementById("healthbar").src = "../assets/healthbar/health_4.png"; // 40% health
    } else if (player.health >= player.maxhealth / 10*3) {
        document.getElementById("healthbar").src = "../assets/healthbar/health_3.png"; // 30% health
    } else if (player.health >= player.maxhealth / 10*2) {
        document.getElementById("healthbar").src = "../assets/healthbar/health_2.png"; // 20% health
    } else if (player.health >= player.maxhealth / 10) {
        document.getElementById("healthbar").src = "../assets/healthbar/health_1.png"; // 10% health
    }else {
        document.getElementById("healthbar").src = "../assets/healthbar/health_0.png"; // No health
    }
    
}, 100); // Update every 100 ms