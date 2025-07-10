
const db = firebase.database();
let roomId = '';
let playerName = '';
let myRole = '';
let currentPlayer = '';
let timerInterval;
let moveTimeLimit = 30;

function createGame() {
  roomId = document.getElementById('roomId').value.trim();
  playerName = document.getElementById('playerName').value.trim();
  moveTimeLimit = parseInt(document.getElementById('moveTime').value);
  if (!roomId || !playerName) {
    alert("Room ID and Name required!");
    return;
  }
  myRole = 'Player 1';
  setupGame();
  db.ref('games/' + roomId).set({
    board: createInitialBoard(),
    turn: 'Player 1',
    timer: moveTimeLimit,
    players: { 'Player 1': playerName }
  });
}

function joinGame() {
  roomId = document.getElementById('roomId').value.trim();
  playerName = document.getElementById('playerName').value.trim();
  moveTimeLimit = parseInt(document.getElementById('moveTime').value);
  if (!roomId || !playerName) {
    alert("Room ID and Name required!");
    return;
  }
  myRole = 'Player 2';
  setupGame();
  db.ref('games/' + roomId + '/players/Player 2').set(playerName);
}

function setupGame() {
  document.querySelector('.setup-screen').style.display = 'none';
  document.querySelector('.game-screen').style.display = 'block';
  document.getElementById('roomName').innerText = roomId;
  document.getElementById('myRole').innerText = myRole;

  db.ref('games/' + roomId).on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    renderBoard(data.board);
    document.getElementById('currentTurn').innerText = data.turn;
    document.getElementById('timeLeft').innerText = data.timer;
    currentPlayer = data.turn;
    if (data.winner) {
      document.getElementById('winner').innerText = "Winner: " + data.winner;
      clearInterval(timerInterval);
    }
  });

  startTimer();
}

function createInitialBoard() {
  return [
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];
}

function renderBoard(board) {
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = '';
  board.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      const square = document.createElement('div');
      square.className = 'square ' + ((rowIndex + colIndex) % 2 === 0 ? 'white' : 'black');
      if (piece) {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'piece';
        pieceDiv.innerText = piece;
        square.appendChild(pieceDiv);
      }
      boardDiv.appendChild(square);
    });
  });
}

function startTimer() {
  timerInterval = setInterval(() => {
    db.ref('games/' + roomId).once('value').then((snapshot) => {
      const data = snapshot.val();
      if (data && data.timer > 0) {
        db.ref('games/' + roomId).update({ timer: data.timer - 1 });
      } else if (data && data.timer === 0) {
        clearInterval(timerInterval);
        alert("Time up for " + data.turn);
        const otherPlayer = data.turn === 'Player 1' ? 'Player 2' : 'Player 1';
        const continueGame = confirm(otherPlayer + ", do you want to continue the game?");
        if (continueGame) {
          db.ref('games/' + roomId).update({
            turn: otherPlayer,
            timer: moveTimeLimit
          });
          startTimer();
        } else {
          db.ref('games/' + roomId).update({ winner: otherPlayer });
        }
      }
    });
  }, 1000);
}
