// button actions

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
        }, 1000);
    } else { // 10% chance: No event
        document.getElementById("output").innerText = "The path is quiet.";
    }
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
