// button actions
window.addEventListener("beforeunload", saveplayerdata);


let player = {}; // Just an empty object
function getDefaultPlayer() {
    return {
        name: "Wanderer",
        health: 20,
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
        itemsInUse: [],
        energy : 200,
        maxenergy : 200,
        maxhealth: 20,
        blocked: false,
        weakness: "none",
        resistance: "none",
        damagetype: "physical",
        special: {
            name: "Hard Strike",
            description: "Full power attack",
            damage: 10,
            dmagametype: "physical",
            manaCost: 5
        },
    };
}


function saveplayerdata() {
    localStorage.setItem("playerData", JSON.stringify(player));
}
function loadplayerdata() {
    const data = localStorage.getItem("playerData");
    if (data) {
        Object.assign(player, getDefaultPlayer(), JSON.parse(data)); // merge with defaults for safety
    } else {
        Object.assign(player, getDefaultPlayer()); // brand new player
        console.warn("No player data found. Using defaults.");
    }
}


window.onload = function() {
    loadplayerdata();
    console.log("Player data loaded:", player);
};


function walk() {
    if (player.energy <= 0) {
        document.getElementById("output").innerText = "You are too tired to walk. Rest to regain energy.";
        return;
    }
    // Muss in alle button funktionen und so

    if (player.blocked) {
        return; // Prevent walking if blocked
    }

    player.energy--;
    player.steps++;
    const random = Math.random();

    // The conditional logic has been fixed and simplified for clarity.
    if (random < 0.5) { // 50% chance: No event
        document.getElementById("output").innerText = "You walk peacefully down the path.";
    } else if (random < 0.7) { // 20% chance: Gain resource
        if (Math.random() < 0.5) { // Gain money
            const money = Math.floor(Math.random() * 10) + 1;
            player.money += money;
            document.getElementById("output").innerText = `You found ${money} coins.`;
        } else { // Gain xp
            const xp = Math.floor(Math.random() * 10) + player.level;
            player.xp += xp;
            document.getElementById("output").innerText = `You gained ${xp} XP.`;
            checkLevelUp(); // Call the level up check immediately after gaining XP
        }
    } else if (random < 0.9) { // 20% chance: Fight
        document.getElementById("output").style.color = "red";
        document.getElementById("output").innerText = "You encountered a monster! Prepare for battle!";
        player.blocked = true; // Block player actions during the transition
        setTimeout(() => {
            
            window.location.href = "../game/fight.html";
            document.getElementById("output").style.color = "white";
            player.blocked = false; // Unblock player actions after the transition
            localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
        }, 1000);
    } else { // 10% chance: No event
        document.getElementById("output").innerText = "The path is quiet.";
    }
    localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
}

//UI update functions

function updatePlayerUI() {
    document.getElementById("playername").innerText = player.name;
    document.getElementById("xp").innerText = `XP: ${player.xp}/${player.maxxp}`;
    document.getElementById("playerlevel").innerText = `Level: ${player.level}`;
}
function updateGameData() {
    document.getElementById("type").innerText = `Type: ${player.currentworld}`;
    document.getElementById("steps").innerText = `Steps: ${player.steps}`;
    document.getElementById("energy").title = `Energy: ${player.energy}`;

}

// Interval for updates

setInterval(() => {
    updatePlayerUI();
    updateGameData();
    if (player.energy > player.maxenergy/4*3) {
        document.getElementById("energy").src = "../assets/game/Energy_100.png"; // Full energy
    } else if (player.energy > player.maxenergy/2) {
        document.getElementById("energy").src = "../assets/game/energy_75.png"; // 75% energy
    } else if (player.energy > player.maxenergy/4) {
        document.getElementById("energy").src = "../assets/game/energy_50.png"; // 50% energy
    } else if (player.energy > 0) {
        document.getElementById("energy").src = "../assets/game/energy_25.png"; // 25% energy
    } else {
        document.getElementById("energy").src = "../assets/game/energy_0.png"; // No energy
    }
    
}, 100); // Update every 100 ms

setInterval(() => {
    if (player.energy < player.maxenergy) {
        player.energy += 1; // Regain 1 energy every second
    }
    
}, 10000); // Regain energy every ten seconds


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
    localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
}