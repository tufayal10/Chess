// Firebase Setup (Already initialized in con.js)
const db = firebase.database();

let playerName = "";
let roomId = "";
let moveTime = 30;
let playerRole = ""; // 'creator' or 'joiner'

function createGame() {
  playerName = document.getElementById("creatorName").value.trim();
  roomId = document.getElementById("creatorRoomId").value.trim();
  moveTime = parseInt(document.getElementById("moveTime").value.trim(), 10);

  if (!playerName || !roomId || isNaN(moveTime) || moveTime < 5) {
    alert("Please fill all fields correctly (min 5 sec for timer).");
    return;
  }

  playerRole = "creator";

  db.ref("games/" + roomId).set({
    creator: playerName,
    joiner: "",
    timer: moveTime,
    board: {}, // Empty for now, will set later
    turn: "creator",
    winner: "",
  });

  waitForJoiner();
}

function joinGame() {
  playerName = document.getElementById("joinerName").value.trim();
  roomId = document.getElementById("joinerRoomId").value.trim();

  if (!playerName || !roomId) {
    alert("Please fill all fields.");
    return;
  }

  playerRole = "joiner";

  db.ref("games/" + roomId + "/joiner").set(playerName);
  startGameAfterJoin();
}

function waitForJoiner() {
  document.getElementById("status").innerText = "Waiting for opponent to join...";
  
  db.ref("games/" + roomId + "/joiner").on("value", (snapshot) => {
    if (snapshot.exists() && snapshot.val()) {
      startGameAfterJoin();
    }
  });
}

function startGameAfterJoin() {
  document.getElementById("status").innerText = "Game Starting!";
  
  db.ref("games/" + roomId).once("value").then((snapshot) => {
    const gameData = snapshot.val();
    moveTime = gameData.timer;

    document.getElementById("playerNames").innerText = 
      `You: ${playerName} | Opponent: ${playerRole === "creator" ? gameData.joiner : gameData.creator}`;

    // Initialize board, timer, etc. here
    // [You’ll insert your chessboard + timer logic here in the next steps]
  });
}
