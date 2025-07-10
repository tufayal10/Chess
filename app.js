// Firebase Setup (Already initialized in con.js)
const db = firebase.database();

let playerName = "";
let roomId = "";
let moveTime = 30;
let playerRole = ""; // 'creator' or 'joiner'
let timerInterval = null;
let timeLeft = 0;
let currentTurn = '';
let boardState = [];
let selectedPiece = null;

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
    board: getInitialBoard(),
    turn: "creator",
    winner: ""
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

  db.ref("games/" + roomId).get().then((snapshot) => {
    if (!snapshot.exists()) {
      alert("Room ID not found!");
      return;
    }

    db.ref("games/" + roomId + "/joiner").set(playerName);
    startGameAfterJoin();  // Start listening right after joining
  });
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
  
  db.ref("games/" + roomId).on("value", (snapshot) => {
    const gameData = snapshot.val();
    if (!gameData) return;
    if (!gameData.board) return;  // Prevent error before board is ready

    document.getElementById("playerNames").innerText = 
      `You: ${playerName} | Opponent: ${playerRole === "creator" ? gameData.joiner : gameData.creator}`;

    boardState = gameData.board;
    currentTurn = gameData.turn;
    moveTime = gameData.timer;

    renderBoard();

    if (gameData.winner) {
      alert(`${gameData.winner} wins the game!`);
      clearInterval(timerInterval);
      return;
    }

    if (currentTurn === playerRole) {
      startTimer();
    } else {
      stopTimer();
    }
  });
}

function startTimer() {
  stopTimer();
  timeLeft = moveTime;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  document.getElementById("timer").innerText = "";
}

function updateTimerDisplay() {
  document.getElementById("timer").innerText = `Time Left: ${timeLeft}s`;
}

function handleTimeout() {
  alert("You lost your move due to timeout!");
  switchTurn();
}

function switchTurn() {
  const nextTurn = currentTurn === "creator" ? "joiner" : "creator";
  db.ref("games/" + roomId + "/turn").set(nextTurn);
}

function getInitialBoard() {
  return [
    ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
    ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
    ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]
  ];
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  boardState.forEach((row, i) => {
    row.forEach((piece, j) => {
      const tile = document.createElement("div");
      tile.className = "tile " + ((i + j) % 2 === 0 ? "white-tile" : "black-tile");
      tile.dataset.row = i;
      tile.dataset.col = j;

      if (piece) {
        const pieceDiv = document.createElement("div");
        pieceDiv.className = `piece ${piece.startsWith('w') ? "white-piece" : "black-piece"}`;
        pieceDiv.innerText = pieceName(piece);
        pieceDiv.onclick = () => selectPiece(i, j);
        tile.appendChild(pieceDiv);
      }

      board.appendChild(tile);
    });
  });
}

function pieceName(code) {
  const map = {
    "P": "Pawn", "R": "Rook", "N": "Knight", "B": "Bishop", "Q": "Queen", "K": "King"
  };
  return map[code[1]];
}

function selectPiece(row, col) {
  if (currentTurn !== playerRole) return;
  const piece = boardState[row][col];
  if (!piece || (playerRole === "creator" && piece[0] !== 'w') || (playerRole === "joiner" && piece[0] !== 'b')) return;

  selectedPiece = { row, col };
  highlightPossibleMoves(row, col);
}

function highlightPossibleMoves(row, col) {
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach(tile => tile.classList.remove("highlight"));
  
  const moves = getPossibleMoves(row, col);
  moves.forEach(move => {
    const tile = document.querySelector(`.tile[data-row='${move.row}'][data-col='${move.col}']`);
    if (tile) tile.classList.add("highlight");
    tile.onclick = () => movePiece(move.row, move.col);
  });
}

function getPossibleMoves(row, col) {
  const moves = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

  directions.forEach(([dr, dc]) => {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const target = boardState[nr][nc];
      if (!target || target[0] !== boardState[row][col][0]) {
        moves.push({ row: nr, col: nc });
      }
    }
  });

  return moves;
}

function movePiece(toRow, toCol) {
  const fromRow = selectedPiece.row;
  const fromCol = selectedPiece.col;
  const target = boardState[toRow][toCol];

  if (target && target[1] === "K") {
    db.ref("games/" + roomId + "/winner").set(playerName);
  }

  boardState[toRow][toCol] = boardState[fromRow][fromCol];
  boardState[fromRow][fromCol] = "";

  db.ref("games/" + roomId + "/board").set(boardState);
  selectedPiece = null;
  switchTurn();
}
