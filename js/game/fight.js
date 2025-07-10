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
            damagetype: "physical", // Corrected typo here
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
    // Initialize currentWorld after player data is loaded
    currentWorld = player.currentworld;
    console.log("Current world:", currentWorld);
};
let killed = false;
let gotkilled = false;
let enemy = {
    enemyname: "Unknown",
    enemyhealth: 100,
    enemylevel: 1,
    enemyattack: 10,
    enemydefense: 10,
    enemyresistance: "none",
    enemydamagetype: "physical",
    enemyimg: "../assets/enemy/img/standard.png", // Fallback image
    world: "Overworld", // Default world
    resistance: "none", // Default resistance
    damagetype: "physical", // Default damage type
    weakness: "none", // Default weakness
    special: { // Changed to an object to match player.special structure
        name: "none",
        description: "No special abilities",
        damage: 0,
        damagetype: "none", // Corrected typo here
        manaCost: 0 // Added manaCost for consistency, even if 0 for enemy
    },
    enemyIsQueing: false // Flag to indicate if the enemy is currently queued for an action
};
let playerIsQueing = false; // Flag to indicate if the player is currently queued for an action
let currentWorld = "Overworld"; // Initialize with a default, will be overwritten by player.currentworld
let enemyspecial = {}; // Declared at a higher scope
let enemyrewards = {}; // Declared at a higher scope


window.addEventListener("load", function() {
    try {
        // loadEnemy is now called after player data is confirmed loaded (in window.onload)
        // so `player.currentworld` will be accurate.
        async function loadEnemy (world) { // Changed parameter name to avoid conflict
            const manifest = await fetch("../assets/enemy/list.json");
            const enemyfiles = await manifest.json();
            const allenemies = await Promise.all(enemyfiles.map(file => fetch(`../assets/enemy/${file}`).then(res => res.json())));
            const enemies = allenemies.filter(e => e.world === world); // Use `world` parameter
            if (enemies.length === 0) {
                console.error(`No enemies found for the current world: ${world}.`);
                return null;
            }
            const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
            console.log("Loaded enemy:", randomEnemy);
            
            enemy.enemyname = randomEnemy.name;
            enemy.enemyhealth = randomEnemy.health;
            enemy.enemyhealthmax = randomEnemy.health; // Ensure max health is set
            enemy.enemylevel = randomEnemy.level;
            enemy.enemyimg = randomEnemy.image || "../assets/enemy/img/standard.png";
            enemy.resistance = randomEnemy.resistance || "none";
            enemy.damagetype = randomEnemy.damagetype || "physical";
            enemy.attack = randomEnemy.attack || 0;
            enemy.defense = randomEnemy.defense || 0;
            enemy.weakness = randomEnemy.weakness || "none";
            
            // Assign to the global enemyspecial variable
            enemyspecial = randomEnemy.special || {
                name: "none",
                description: "No special abilities",
                damage: 0,
                damagetype: "none",
                usage: 0 // Added usage for enemy special
            }; 
            
            // Assign to the global enemyrewards variable
            enemyrewards = randomEnemy.rewards[0] || { xp: 0, money: 0 }; 
            
            console.log("Enemy data loaded:", enemy);
            console.log("Enemy image:", randomEnemy.image);
            console.log("Enemy special abilities:", enemyspecial);
            updateUI();
        }
        loadEnemy(player.currentworld); // Call with the player's current world
    } catch (error) {
        
        console.error("Error loading enemy data:", error);
    }
    
});

setInterval(() => {
    updateUI(); // Update UI every second
}, 100);

function updateUI() {
    // Update enemy UI elements
    document.getElementById("enemyname").innerText = enemy.enemyname;
    document.getElementById("enemylevel").innerText = `Level: ${enemy.enemylevel}`;
    
    // Calculate enemy health percentage for the health bar image
    const enemyHealthPercentage = (enemy.enemyhealth / enemy.enemyhealthmax) * 100;
    let enemyHealthBarImage = `../assets/healthbar/health_0.png`; // Default to 0
    if (enemyHealthPercentage > 90) enemyHealthBarImage = `../assets/healthbar/health_10.png`;
    else if (enemyHealthPercentage > 80) enemyHealthBarImage = `../assets/healthbar/health_9.png`;
    else if (enemyHealthPercentage > 70) enemyHealthBarImage = `../assets/healthbar/health_8.png`;
    else if (enemyHealthPercentage > 60) enemyHealthBarImage = `../assets/healthbar/health_7.png`;
    else if (enemyHealthPercentage > 50) enemyHealthBarImage = `../assets/healthbar/health_6.png`;
    else if (enemyHealthPercentage > 40) enemyHealthBarImage = `../assets/healthbar/health_5.png`;
    else if (enemyHealthPercentage > 30) enemyHealthBarImage = `../assets/healthbar/health_4.png`;
    else if (enemyHealthPercentage > 20) enemyHealthBarImage = `../assets/healthbar/health_3.png`;
    else if (enemyHealthPercentage > 10) enemyHealthBarImage = `../assets/healthbar/health_2.png`;
    else if (enemyHealthPercentage > 0) enemyHealthBarImage = `../assets/healthbar/health_1.png`;

    document.getElementById("enemy_health").src = enemyHealthBarImage;
    document.getElementById("enemy_health").title = `Health: ${enemy.enemyhealth}/${enemy.enemyhealthmax}`;
    document.getElementById("enemy").src = enemy.enemyimg;
    document.getElementById("enemy").title = `Attack: ${enemy.attack}, Defense: ${enemy.defense}, Resistance: ${enemy.resistance}, Damage Type: ${enemy.damagetype}, Weakness: ${enemy.weakness}`;
    
    // Check if enemyspecial exists and has a name property
    if (enemyspecial && enemyspecial.name) {
        document.getElementById("enemyspecial").innerText = `Special: ${enemyspecial.name}`;
        document.getElementById("enemyspecial").title = `Description: ${enemyspecial.description}, Damage: ${enemyspecial.damage}, Damage Type: ${enemyspecial.damagetype}`;
    } else {
        document.getElementById("enemyspecial").innerText = `Special: None`;
        document.getElementById("enemyspecial").title = `No special abilities`;
    }

    // Update player UI elements
    document.getElementById("mana").innerText = `Mana: ${player.mana}/${player.maxmana}`;
    document.getElementById("playerlevel").innerText = `Level: ${player.level}`;
    document.getElementById("playername").innerText = player.name;
    
    // Calculate player health percentage for the health bar image
    const playerHealthPercentage = (player.health / player.maxhealth) * 100;
    let playerHealthBarImage = `../assets/healthbar/health_0.png`; // Default to 0
    if (playerHealthPercentage > 90) playerHealthBarImage = `../assets/healthbar/health_10.png`;
    else if (playerHealthPercentage > 80) playerHealthBarImage = `../assets/healthbar/health_9.png`;
    else if (playerHealthPercentage > 70) playerHealthBarImage = `../assets/healthbar/health_8.png`;
    else if (playerHealthPercentage > 60) playerHealthBarImage = `../assets/healthbar/health_7.png`;
    else if (playerHealthPercentage > 50) playerHealthBarImage = `../assets/healthbar/health_6.png`;
    else if (playerHealthPercentage > 40) playerHealthBarImage = `../assets/healthbar/health_5.png`;
    else if (playerHealthPercentage > 30) playerHealthBarImage = `../assets/healthbar/health_4.png`;
    else if (playerHealthPercentage > 20) playerHealthBarImage = `../assets/healthbar/health_3.png`;
    else if (playerHealthPercentage > 10) playerHealthBarImage = `../assets/healthbar/health_2.png`;
    else if (playerHealthPercentage > 0) playerHealthBarImage = `../assets/healthbar/health_1.png`;

    document.getElementById("healthbar").src = playerHealthBarImage;
    document.getElementById("healthbar").title = `Health: ${player.health}/${player.maxhealth}`;
    document.getElementById("playerimg").title = `Attack: ${player.attack}, Defense: ${player.defense}, Speed: ${player.speed}, Weakness: ${player.weakness}, Resistance: ${player.resistance}, Damage Type: ${player.damagetype}`;
    if (playerIsQueing) {
        document.getElementById("special").innerText = "special (use)";
    } else {
        document.getElementById("special").innerText = "special";
    }
}

function attack(mode) {
    if (player.blocked) {
        return;
    }
    player.blocked = true;
    document.getElementById("output").style.color = "white";

    if (mode === 4) { // Retreat
        if (speedcheck()) {
            document.getElementById("output").innerText = "You successfully retreated!";
            setTimeout(() => {
                localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
                window.location.href = "../game/game_hub.html";
            }, 1000);
        } else {
            if (Math.random() > 0.9) {
                document.getElementById("output").innerText = "You barely escaped!";
                setTimeout(() => {
                    localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
                    window.location.href = "../game/game_hub.html";
                }, 1000);
            } else {
                document.getElementById("output").innerText = "You failed to retreat!";
                setTimeout(() => {
                    document.getElementById("output").innerText = "";
                    player.blocked = false;
                    enemyattack();
                }, 2000);
            }
        }
    } else if (mode === 2) { // Dodge
        let dodgeChance = speedcheck() ? 0.8 : 0.2;
        if (Math.random() < dodgeChance) {
            document.getElementById("output").innerText = "You dodged the attack!";
            setTimeout(() => {
                document.getElementById("output").innerText = "";
                player.blocked = false;
            }, 1500);
        } else {
            document.getElementById("output").innerText = "You failed to dodge the attack!";
            setTimeout(() => {
                document.getElementById("output").innerText = "";
                player.blocked = false;
                enemyattack();
            }, 2000);
        }
    } else if (mode === 3) { // Special Attack
        if (playerIsQueing === false) {
            if (player.mana >= player.special.manaCost) {
                player.mana -= player.special.manaCost;
                playerIsQueing = true;
                document.getElementById("output").innerText = `You get ready to use your special attack: ${player.special.name}!`;
                setTimeout(() => {
                    document.getElementById("output").innerText = "";
                    player.blocked = false;
                    enemyattack();
                }, 2000);
            } else {
                document.getElementById("output").innerText = "Not enough mana!";
                player.blocked = false;
            }
        } else {
            playerspecial();
            playerIsQueing = false;
            // The winCheck inside playerspecial will handle setting killed and redirection.
            // Only proceed to enemy attack if the enemy is NOT killed by the special attack.
            setTimeout(() => {
                if(killed === false && gotkilled === false) { // Ensure neither player nor enemy is dead
                    enemyattack();
                } else {
                    player.blocked = false; // Unblock if game ends (handled by winCheck/PlayerDeathCheck)
                }
            }, 1000);
        }
    } else { // Normal Attack (mode 1)
        if (speedcheck()){ // Player goes first
            playerattack();
            // The winCheck inside playerattack will handle setting killed and redirection.
            // Only proceed to enemy attack if the enemy is NOT killed by the player attack.
            setTimeout(() => {
                if (killed === false && gotkilled === false){ // Ensure neither player nor enemy is dead
                    enemyattack();
                } else {
                    player.blocked = false; // Unblock if game ends (handled by winCheck/PlayerDeathCheck)
                }
            }, 1500);
        } else { // Enemy goes first
            enemyattack();
            // The PlayerDeathCheck inside enemyattack will handle setting gotkilled and redirection.
            // Only proceed to player attack if the player is NOT killed by the enemy attack.
            setTimeout(() => {
                if (gotkilled === false && killed === false){ // Ensure neither player nor enemy is dead
                    playerattack();
                } else {
                    player.blocked = false; // Unblock if game ends (handled by winCheck/PlayerDeathCheck)
                }
            }, 1500);
        }
    }
}

function speedcheck() {
    if (player.speed > enemy.speed) {
        return true;
    } else if (player.speed < enemy.speed) {
        return false;
    } else {
        // If speeds are equal, use a random chance to determine who goes first
        return Math.random() < 0.5; // 50% chance for either player or enemy
    }
}

function pause(buttonenabled = true) {
    // This function's original implementation was problematic due to its fixed timeout
    // and attempt to control button blocking.
    // The blocking logic is now handled more directly within the `attack` and `enemyattack` functions
    // based on when actions complete.
    // For now, this function can be simplified or removed if its sole purpose was the timeout.
    // For demonstration, let's just make it clear its original intent:
    // console.log("Pausing for UI update/message display.");
    // No longer directly setting player.blocked here as it's managed by the calling functions.
}

function enemyattack() {
    let damage;
    if (enemy.enemyIsQueing === true) {
        enemy.enemyIsQueing = false; // Reset the flag after the special attack
        document.getElementById("output").innerText = `${enemy.enemyname} uses ${enemyspecial.name}!`;
        enemyattackspecial();
        // After special, if player isn't dead, unblock
        setTimeout(() => {
            if (gotkilled === false) {
                player.blocked = false;
            }
        }, 1500); // Adjust timing as needed
    } else {
        // Check if enemyspecial has a 'usage' property and apply random chance
        if (enemyspecial.usage && Math.random() < enemyspecial.usage) {
            enemy.enemyIsQueing = true;
            document.getElementById("output").innerText = `${enemy.enemyname} gets ready to use their special attack: ${enemyspecial.name}!`;
            setTimeout(() => {
                document.getElementById("output").innerText = "";
                player.blocked = false; // Unblock after enemy queues
            }, 2000);
        } else {
            // Normal enemy attack
            if (player.resistance === enemy.damagetype){ // Corrected enemy.enemydamagetype to enemy.damagetype
                damage = (enemy.attack * 0.5) - (player.defense * 1.5);
            } else if (player.weakness === enemy.damagetype){ // Corrected enemy.enemydamagetype to enemy.damagetype
                damage = (enemy.attack * 1.5) - (player.defense * 0.5);
            } else {
                damage = enemy.attack - player.defense;
            }
            if (damage < 0) {
                damage = 0;
            }
            player.health -= damage;
            document.getElementById("output").innerText = `You took ${Math.floor(damage)} damage!`; // Ensure damage is an integer
            PlayerDeathCheck();
            setTimeout(() => {
                if (gotkilled === false) {
                    player.blocked = false; // Unblock if player is still alive
                }
            }, 1500); // Allow message to display
        }
    }
}

function playerattack() {
    let damage;
    console.log("Player damage type:", player.damagetype);
    console.log("Enemy weakness:", enemy.weakness);
    console.log("Enemy resistance:", enemy.resistance);
    console.log("Player attack:", player.attack);
    console.log("Enemy defense:", enemy.defense);

    if (enemy.resistance === player.damagetype){
        damage = (player.attack * 0.5) - (enemy.defense * 1.5);
    } else if (enemy.weakness === player.damagetype){
        damage = (player.attack * 1.5) - (enemy.defense * 0.5);
    } else {
        damage = player.attack - enemy.defense;
    }
    if (damage < 0) {
        damage = 0;
    }
    console.log("Calculated player damage:", damage);
    enemy.enemyhealth -= damage;
    document.getElementById("output").innerText = `${enemy.enemyname} took ${Math.floor(damage)} damage!`;

    setTimeout(() => {
        // winCheck will set 'killed' to true if the enemy health is <= 0
        winCheck();
        // Do NOT set player.blocked = false here.
        // The game flow will be handled by the 'attack' function's
        // subsequent enemyattack() call, or by winCheck's redirection.
    }, 1500);
}

function playerspecial() {
    let damage;
    if (enemy.resistance === player.special.damagetype){
        damage = (player.special.damage * 0.5) - (enemy.defense * 1.5);
    } else if (enemy.weakness === player.special.damagetype){
        damage = (player.special.damage * 1.5) - (enemy.defense * 0.5);
    } else {
        damage = player.special.damage - enemy.defense;
    }
    if (damage < 0) {
        damage = 0;
    }
    enemy.enemyhealth -= damage;
    document.getElementById("output").innerText = `You used ${player.special.name} and dealt ${Math.floor(damage)} damage to ${enemy.enemyname}!`;
    setTimeout(() => {
        // winCheck will set 'killed' to true if the enemy health is <= 0
        winCheck();
        // Do NOT set player.blocked = false here.
        // The game flow will be handled by the 'attack' function's
        // subsequent enemyattack() call, or by winCheck's redirection.
    }, 1500);
}

function enemyattackspecial(){
    let damage;
    if (player.resistance === enemyspecial.damagetype){
        damage = (enemyspecial.damage * 0.5) - (player.defense * 1.5);
    } else if (player.weakness === enemyspecial.damagetype){
        damage = (enemyspecial.damage * 1.5) - (player.defense * 0.5);
    } else {
        damage = enemyspecial.damage - player.defense;
    }
    if (damage < 0) {
        damage = 0;
    }
    player.health -= damage;
    document.getElementById("output").innerText = `${enemy.enemyname} used ${enemyspecial.name} and dealt ${Math.floor(damage)} damage to you!`;
    PlayerDeathCheck();
    setTimeout(() => {
        if (gotkilled === false) {
            player.blocked = false; // Unblock if player is still alive
        }
    }, 1500);
}

function PlayerDeathCheck() {
    if (player.health <= 0) {
        gotkilled = true;
        player.health = player.maxhealth;
        player.mana = player.maxmana;
        player.energy = player.maxenergy;
        player.money = Math.floor(player.money / 2); // Ensure money is integer
        if (player.level > 1){
            player.level = player.level - 1;
        }
        player.xp = 0;
        player.maxxp = 100;
        playerIsQueing = false;
        saveplayerdata(); // Save updated player data
        document.getElementById("output").style.color = "red";
        document.getElementById("output").innerText = "You Died!";
        
        setTimeout(() => {
            window.location.href = "../game/game_hub.html"; // Redirect to hub
        }, 2000); // Give time for "You Died" message
    }
}

function winCheck() {
    if (enemy.enemyhealth <= 0) {
        killed = true;
        playerIsQueing = false;
        
        // Ensure enemyrewards are numbers for calculation

        const moneyReward = Math.floor(Math.random() * (enemyrewards.money * 1.5 - enemyrewards.money * 0.5 + 1)+ enemyrewards.money * 0.5)
        const xpReward = Math.floor(Math.random() * (enemyrewards.xp * 1.5 - enemyrewards.xp * 0.5 + 1)+ enemyrewards.xp * 0.5)
        
        player.xp += xpReward;
        player.money += moneyReward;
        
        // Level up check
        if (player.xp >= player.maxxp) {
            player.level += 1;
            player.maxxp *= 2; // Double maxxp for next level
            player.health = player.maxhealth; // Restore health on level up
            player.mana = player.maxmana; // Restore mana on level up
            document.getElementById("output").innerText = `You leveled up to Level ${player.level}!`;
            setTimeout(() => {
                document.getElementById("output").innerText = `You won! You gained ${xpReward} XP and ${moneyReward} coins!`;
                saveplayerdata(); // Save updated player data
                setTimeout(() => {
                    window.location.href = "../game/game_hub.html";
                }, 2000);
            }, 1500);
        } else {
            document.getElementById("output").innerText = `You won! You gained ${xpReward} XP and ${moneyReward} coins!`;
            saveplayerdata(); // Save updated player data
            setTimeout(() => {
                window.location.href = "../game/game_hub.html";
            }, 2000);
        }
        document.getElementById("output").style.color = "green";
    }
}