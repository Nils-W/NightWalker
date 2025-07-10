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
    special: {
        name: "none",
        description: "No special abilities",
        damage: 0,
        dmagametype: "none"
    },
    enemyIsQueing: false // Flag to indicate if the enemy is currently queued for an action
};
let playerIsQueing = false; // Flag to indicate if the player is currently queued for an action
let currentWorld = player.currentworld;
console.log("Current world:", currentWorld);

window.addEventListener("load", function() {
    try {
    async function loadEnemy (currentWorld) {
        const manifest = await fetch("../assets/enemy/list.json");
        const enemyfiles = await manifest.json();
        const allenemies = await Promise.all(enemyfiles.map(file => fetch(`../assets/enemy/${file}`).then(res => res.json())));
        const enemies = allenemies.filter(enemy => enemy.world === currentWorld);
        if (enemies.length === 0) {
            console.error("No enemies found for the current world.");
            return null;
        }
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        console.log("Loaded enemy:", randomEnemy);
        
        enemy.enemyname = randomEnemy.name;
        enemy.enemyhealth = randomEnemy.health;
        enemy.enemylevel = randomEnemy.level;
        enemy.enemyattack = randomEnemy.attack;
        enemy.enemydefense = randomEnemy.defense;
        enemy.enemyresistance = randomEnemy.resistance;
        enemy.enemydamagetype = randomEnemy.damagetype;
        enemy.enemyimg = randomEnemy.image || "../assets/enemy/img/standard.png"; // Fallback image if not provided
        enemy.resistance = randomEnemy.resistance || "none"; // Default resistance if not provided
        enemy.damagetype = randomEnemy.damagetype || "physical"; // Default damage type if not provided
        enemy.attack = randomEnemy.attack || 0; // Default attack if not provided
        enemy.defense = randomEnemy.defense || 0; // Default defense if not provided
        enemy.weakness = randomEnemy.weakness || "none"; // Default weakness if not provided
        enemyspecial = randomEnemy.special || "none"; // Default special if not provided
        console.log("Enemy data loaded:", enemy);
        console.log("Enemy image:", randomEnemy.image);
        console.log("Enemy special abilities:", enemyspecial);
        updateUI();
    }
    loadEnemy(player.currentworld);
    } catch (error) {
        
        console.error("Error loading enemy data:", error);
    }
    
});

setInterval(() => {
    updateUI(); // Update UI every second
}, 100); // Save player data 100 second

function updateUI() {
    // Update enemy UI elements
    document.getElementById("enemyname").innerText = enemy.enemyname;
    document.getElementById("enemylevel").innerText = `Level: ${enemy.enemylevel}`;
    document.getElementById("enemy_health").src = `../assets/healthbar/health_10.png`;
    document.getElementById("enemy_health").title = `Health: ${enemy.enemyhealth}/${enemy.enemyhealth}`; // Assuming enemy health is static for now
    document.getElementById("enemy").src = enemy.enemyimg; // Set the enemy image
    document.getElementById("enemy").title = `Attack: ${enemy.attack}, Defense: ${enemy.defense}, Resistance: ${enemy.resistance}, Damage Type: ${enemy.damagetype}, Weakness: ${enemy.weakness}`; // Set the title for the enemy image
    document.getElementById("enemyspecial").innerText = `Special: ${enemyspecial[0].name}`;
    document.getElementById("enemyspecial").title = `Description: ${enemyspecial[0].description}, Damage: ${enemyspecial[0].damage}, Damage Type: ${enemyspecial[0].damagetype}`;
    // Update player UI elements
    
    document.getElementById("mana").innerText = `Mana: ${player.mana}/${player.maxmana}`;
    document.getElementById("playerlevel").innerText = `Level: ${player.level}`;
    document.getElementById("playername").innerText = player.name;
    document.getElementById("playerimg").title = `Attack: ${player.attack}, Defense: ${player.defense}, Speed: ${player.speed}, Weakness: ${player.weakness}, Resistance: ${player.resistance}, Damage Type: ${player.damagetype}`;
    if (playerIsQueing) {
        document.getElementById("special").innerText = "special (use)";
    }else {
        document.getElementById("special").innerText = "special";
    }
}

function attack(mode) {
    player.blocked = true; // Block player actions during the attack
    if (mode === 4){
        // Handle retreat logic
        if (speedcheck()){
            document.getElementById("output").innerText = "You successfully retreated!";
            window.location.href = "../game/game_hub.html"; // Redirect to hub
            pause(true); // Pause for 1 second
            
        }else{
            if (Math.random()> 0.9){
                window.location.href = "../game/game_hub.html"; // Redirect to hub
                pause(true); // Pause for 1 second
            }else{
                document.getElementById("output").innerText = "You failed to retreat!";
                pause(false); // Pause for 1 second
                enemyattack();
            }
        }
    } else if (mode === 2) {
        // Handle dodge logic
        if (speedcheck()) {
            if (Math.random() < 0.8) { // 80% chance to dodge
                document.getElementById("output").innerText = "You dodged the attack!";
                pause(true); // Pause for 1 second
            }else {
                document.getElementById("output").innerText = "You failed to dodge the attack!";
                pause(false); // Pause for 1 second
                enemyattack();
            }
        } else {
            if (Math.random() < 0.2) { // 20% chance to dodge
                document.getElementById("output").innerText = "You dodged the attack!";
                pause(true); // Pause for 1 second
            }else {
                document.getElementById("output").innerText = "You failed to dodge the attack!";
                pause(false); // Pause for 1 second
                enemyattack();
            }
        }
    }else if (mode === 3) {
        // Handle special attack logic
        if (speedcheck()) {
            if (playerIsQueing === false) {
                if (player.mana >= player.special.manaCost) {
                    player.mana -= player.special.manaCost;
                    document.getElementById("output").innerText = `You get ready to use your special attack: ${player.special.name}!`;
                    pause(true);
                    playerIsQueing = true; // Set the flag to indicate the player is queuing for a special attack
                    enemyattack(); // Call enemy attack after the player's special attack
                }
            }else{
                // use special attack calc and stuff
                enemyattack();
            }
        }else{
            enemyattack()
            if (playerIsQueing === false) {
                if (player.mana >= player.special.manaCost)
                    player.mana -= player.special.manaCost;
                    document.getElementById("output").innerText = `You get ready to use your special attack: ${player.special.name}!`;
                    pause(true);
                    playerIsQueing = true; // Set the flag to indicate the player is queuing for a special attack
             }else{
                // use special attack calc and stuff
            }
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
    setTimeout(() => {
        document.getElementById("output").innerText = ""; // Clear output message
    }, 2000); // Delay for 1 second before allowing further actions
    if(buttonenabled){
        player.blocked = true; // Unblock player actions after the transition
    }else {
        player.blocked = false; // Block player actions during the transition
    }
    
}