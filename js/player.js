let player = {
    name: "Guest",
    health: 100,
    mana : 10,
    strength: 10,
    defense: 10,
    xp: 0,
    level: 1,
    items: [],
    glyphs: [],
    steps: 0,
    currentworld: "Overworld",
    money: 0,
    items: [],
    energy : 200,
    maxenergy : 200,
    maxhealth: 100,
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
function updatePlayerUI() {
    document.getElementById("playername").innerText = player.name;
    document.getElementById("playerhealth").innerText = `XP: ${player.xp}/100`;
    document.getElementById("playerlevel").innerText = `Level: ${player.level}`;
}
function updateGameData() {
    document.getElementById("type").innerText = `Type: ${player.currentworld}`;
    document.getElementById("steps").innerText = `Steps: ${player.steps}`;
}


setInterval(() => {
    saveplayerdata();
    updatePlayerUI();
    updateGameData();
}, 1000); // Update every second