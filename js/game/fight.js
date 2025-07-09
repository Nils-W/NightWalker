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
}


let currentWorld = player.currentworld;

window.onload = function() {
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
        console.log("Enemy data loaded:", enemy);
        console.log("Enemy image:", randomEnemy.image);
        updateEnemyUI();
    }
    loadEnemy(player.currentworld);
    } catch (error) {
        
        console.error("Error loading enemy data:", error);
    }
    
};

function updateEnemyUI() {
    document.getElementById("enemyname").innerText = enemy.enemyname;
    document.getElementById("enemylevel").innerText = `Level: ${enemy.enemylevel}`;
    document.getElementById("enemy_health").src = `../assets/healthbar/health_10.png`;
    document.getElementById("enemy").src = enemy.enemyimg;
}