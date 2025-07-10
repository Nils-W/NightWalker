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
        enemy.enemyhealthmax = randomEnemy.health;
        enemy.enemylevel = randomEnemy.level;
        enemy.enemyimg = randomEnemy.image || "../assets/enemy/img/standard.png"; // Fallback image if not provided
        enemy.resistance = randomEnemy.resistance || "none"; // Default resistance if not provided
        enemy.damagetype = randomEnemy.damagetype || "physical"; // Default damage type if not provided
        enemy.attack = randomEnemy.attack || 0; // Default attack if not provided
        enemy.defense = randomEnemy.defense || 0; // Default defense if not provided
        enemy.weakness = randomEnemy.weakness || "none"; // Default weakness if not provided
        enemyspecial = randomEnemy.special || "none"; // Default special if not provided
        enemyrewards = randomEnemy.rewards || "none"; // Default special if not provided
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
}, 100);

function updateUI() {
    // Update enemy UI elements
    document.getElementById("enemyname").innerText = enemy.enemyname;
    document.getElementById("enemylevel").innerText = `Level: ${enemy.enemylevel}`;
    document.getElementById("enemy_health").src = `../assets/healthbar/health_10.png`;
    document.getElementById("enemy_health").title = `Health: ${enemy.enemyhealth}/${enemy.enemyhealthmax}`; // Assuming enemy health is static for now
    document.getElementById("enemy").src = enemy.enemyimg; // Set the enemy image
    document.getElementById("enemy").title = `Attack: ${enemy.attack}, Defense: ${enemy.defense}, Resistance: ${enemy.resistance}, Damage Type: ${enemy.damagetype}, Weakness: ${enemy.weakness}`; // Set the title for the enemy image
    document.getElementById("enemyspecial").innerText = `Special: ${enemyspecial[0].name}`;
    document.getElementById("enemyspecial").title = `Description: ${enemyspecial[0].description}, Damage: ${enemyspecial[0].damage}, Damage Type: ${enemyspecial[0].damagetype}`;
    // Update player UI elements
    
    document.getElementById("mana").innerText = `Mana: ${player.mana}/${player.maxmana}`;
    document.getElementById("playerlevel").innerText = `Level: ${player.level}`;
    document.getElementById("playername").innerText = player.name;
    document.getElementById("healthbar").title = `Health: ${player.health}/${player.maxhealth}`;
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
                setTimeout(() => {
                    document.getElementById("output").innerText = ""; // Clear output message
                    document.getElementById("output").style.color = "white";
                    localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
                    enemyattack();
                }, 2000); // Delay for 1 second before allowing further actions
                
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
                setTimeout(() => {
                    document.getElementById("output").innerText = ""; // Clear output message
                    document.getElementById("output").style.color = "white";
                    localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
                    enemyattack();
                }, 2000); // Delay for 1 second before allowing further actions
            }
        } else {
            if (Math.random() < 0.2) { // 20% chance to dodge
                document.getElementById("output").innerText = "You dodged the attack!";
                pause(true); // Pause for 1 second
            }else {
                document.getElementById("output").innerText = "You failed to dodge the attack!";
                setTimeout(() => {
                    document.getElementById("output").innerText = ""; // Clear output message
                    document.getElementById("output").style.color = "white";
                    localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
                    enemyattack();
                }, 2000); // Delay for 1 second before allowing further actions
            }
        }
    }else if (mode === 3) {
        // Handle special attack logic
        if (speedcheck()) {
            if (playerIsQueing === false) {
                if (player.mana >= player.special.manaCost) {
                    player.mana -= player.special.manaCost;
                    playerIsQueing = true; // Set the flag to indicate the player is queuing for a special attack
                    document.getElementById("output").innerText = `You get ready to use your special attack: ${player.special.name}!`;
                    setTimeout(() => {
                        document.getElementById("output").innerText = ""; // Clear output message
                        document.getElementById("output").style.color = "white";
                        localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
                        enemyattack();
                    }, 2000); // Delay for 1 second before allowing further actions
                }
            }else{
                playerspecial();
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
                playerspecial();
            }
        }
    }else {
        if(speedcheck){
            playerattack();
            enemyattack();
        }else{
            enemyattack();
            playerattack();
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
        document.getElementById("output").style.color = "white";
        localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
    }, 2000); // Delay for 1 second before allowing further actions
    if(buttonenabled){
        player.blocked = false; // Unblock player actions after the transition
    }else {
        player.blocked = true; // Block player actions during the transition
    }
    
}

function enemyattack() {
    var damage;
    if (enemy.enemyIsQueing === true) {
        enemy.enemyIsQueing = false; // Reset the flag after the special attack
        document.getElementById("output").innerText = "${enemy.enemyname} uses ${enemyspecial.name}!"
        pause(false);
        enemyattackspecial();
    }else{
        if(Math.random() < enemyspecial.usage){
        enemy.enemyIsQueing = true; // Set the flag to indicate the enemy is queuing for a special attack
        document.getElementById("output").innerText = "`${enemy.enemyname} get ready to use your special attack: ${enemyspecial.name}!`"
        pause(true);
        }else{
            if (player.resistance === enemy.enemydamagetype){
                damage = (enemy.enemyattack*0.5)-(player.defense*1.5);
            }else if (player.weakness === enemy.enemydamagetype){
                damage = (enemy.enemyattack*1.5)-(player.defense*0.5);
            }else{
                damage = enemy.enemyattack-player.defense;

            }
            if (damage < 0) {
                damage = 0;
            }
            player.health -= damage;
            document.getElementById("output").innerText = `You took ${damage} damage)`;
            pause(true);
            PlayerDeathCheck();
        }
    }
}

function playerattack() {
    var damage;
    console.log(player.damagetype);
    console.log(enemy.weakness);
    console.log(enemy.resistance);
    console.log(player.attack);
    console.log(enemy.defense);
    if (enemy.resistance === player.damagetype){
                damage = (player.attack*0.5)-(enemy.defense*1.5);
            }else if (enemy.weakness === player.damagetype){
                damage = (player.attack*1.5)-(enemy.defense*0.5);
            }else{
                damage = player.attack-enemy.defense;

            }
            if (damage < 0) {
                damage = 0;
            }
            console.log(damage);
            enemy.enemyhealth -= damage;
            document.getElementById("output").innerText = `${enemy.enemyname} took ${damage} damage)`;
            pause(true);
            winCheck();

}

function playerspecial() {

}

function enemyattackspecial(){

}

function PlayerDeathCheck() {
    if (player.health <= 0) {
        player.health = player.maxhealth;
        player.mana = player.maxmana;
        player.energy = player.maxenergy;
        player.money = player.money / 2;
        if (player.level > 1){
            player.level = player.level - 1;
        }
        player.xp = 0;
        player.maxxp = 100;
        playerIsQueing = false;
        localStorage.setItem("playerData", JSON.stringify(player)); // Save player data
        document.getElementById("output").style.color = "red";
        document.getElementById("output").innerText = "You Died";
        pause(true); // Pause for 1 second
        window.location.href = "../game/game_hub.html"; // Redirect to hub
    }
}

function winCheck() {
    if (enemy.enemyhealth <= 0) {
        playerIsQueing = false;
        rewardXp = Math.floor(Math.random() * enemyrewards.xp) /2 + 1;
        player.xp += rewardXp + Math.floor(Math.random() * enemyrewards.xp);
        rewardMoney = Math.floor(Math.random() * enemyrewards.money) /2 + 1;
        player.money += rewardMoney + Math.floor(Math.random() * enemyrewards.money)
        document.getElementById("output").style.color = "green";
        document.getElementById("output").innerText = "You Won";
        pause(false); // Pause for 1 second
        document.getElementById("output").innerText = "You got";
        window.location.href = "../game/game_hub.html"; // Redirect to hub
    }
}