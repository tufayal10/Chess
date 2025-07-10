import { database } from './con.js';
import { ref, set, onValue } from "firebase/database";

let roomId = '';
let playerName = '';
let moveTime = 0;
let playerColor = '';
let currentTurn = 'white';
let timerInterval;
let timer = 0;

// Elements
const createGameDiv = document.getElementById('createGameDiv');
const joinGameDiv = document.getElementById('joinGameDiv');
const gameDiv = document.getElementById('gameDiv');
const timerDiv = document.getElementById('timer');
const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');

document.getElementById('createBtn').onclick = () => {
  roomId = document.getElementById('roomIdCreate').value;
  playerName = document.getElementById('playerNameCreate').value;
  moveTime = parseInt(document.getElementById('moveTime').value);
  playerColor = 'white';
  
  set(ref(database, 'rooms/' + roomId), {
    players: { white: playerName },
    board: initialBoard(),
    currentTurn: 'white',
    timer: moveTime
  });

  startGame();
};

document.getElementById('joinBtn').onclick = () => {
  roomId = document.getElementById('roomIdJoin').value;
  playerName = document.getElementById('playerNameJoin').value;
  playerColor = 'black';

  const roomRef = ref(database, 'rooms/' + roomId);
  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      if (!data.players.black) {
        set(ref(database, 'rooms/' + roomId + '/players/black'), playerName);
      }
    }
  });

  startGame();
};

function startGame() {
  createGameDiv.style.display = 'none';
  joinGameDiv.style.display = 'none';
  gameDiv.style.display = 'block';
  statusDiv.innerText = 'Waiting for opponent...';

  const roomRef = ref(database, 'rooms/' + roomId);
  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      if (data.players.white && data.players.black) {
        statusDiv.innerText = 'Game Started!';
        renderBoard(data.board);
        currentTurn = data.currentTurn;
        timer = data.timer;
        updateTimer();
      } else {
        statusDiv.innerText = 'Waiting for opponent...';
      }
    }
  });
}

function initialBoard() {
  return [
    ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
    ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
    ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR'],
  ];
}

function renderBoard(board) {
  boardDiv.innerHTML = '';
  board.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (piece) {
        const circle = document.createElement('div');
        circle.className = 'piece';
        circle.innerText = piece;
        circle.style.backgroundColor = piece.startsWith('W') ? 'white' : 'black';
        circle.style.color = piece.startsWith('W') ? 'black' : 'white';
        circle.style.border = `2px solid ${piece.startsWith('W') ? 'black' : 'white'}`;
        cell.appendChild(circle);
      }
      boardDiv.appendChild(cell);
    });
  });
}

function updateTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    timerDiv.innerText = `Time Left: ${timer}s`;

    if (timer <= 0) {
      clearInterval(timerInterval);
      alert(`${currentTurn} loses by timeout!`);
    }
  }, 1000);
}
