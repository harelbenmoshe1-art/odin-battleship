import { Player } from './player.js';
import { Ship } from './ship.js';

let player;
let opponent;
let gameOver = false;
let isPlayerTurn = true;
let computerTurnTimer;

function renderShipFleet(element) {
  element.replaceChildren();

  for (let length = 1; length <= 5; length++) {
    const ship = document.createElement('div');
    ship.classList.add('fleet-ship');

    const cells = document.createElement('div');
    cells.classList.add('fleet-ship-cells');

    for (let i = 0; i < length; i++) {
      const cell = document.createElement('span');
      cell.classList.add('fleet-cell');
      cell.setAttribute('aria-hidden', 'true');
      cells.append(cell);
    }

    ship.append(cells);
    element.append(ship);
  }
}

// This function is used to create each player's board.
function renderBoard(element, gameboard, showShips) {
  element.replaceChildren(); // Remove a player's child nodes (clear the board).

  gameboard.grid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const square = document.createElement('button');
      square.type = 'button';
      square.classList.add('cell');
      square.dataset.row = rowIndex;
      square.dataset.column = columnIndex;

      const wasHit = gameboard.hitShots.some((shot) => shot.row === rowIndex && shot.column === columnIndex);
      const wasMissed = gameboard.missedShots.some((shot) => shot.row === rowIndex && shot.column === columnIndex);

      if (wasHit) square.classList.add('hit');
      if (wasMissed) square.classList.add('miss');

      if (showShips && cell !== null) {
        square.classList.add('ship');
      }

      element.append(square);
    });
  });
}

function handleOpponentBoardClick(event) {
  if (gameOver || !isPlayerTurn) return;

  const square = event.target.closest('.cell');
  if (square === null) return;

  const position = {
    row: Number(square.dataset.row),
    column: Number(square.dataset.column),
  };

  const result = opponent.gameboard.receiveAttack(position);
  if (result.alreadyAttacked) return;

  renderBoard(document.querySelector('#opponent-board'), opponent.gameboard, false);

  const status = document.querySelector('#game-status');
  if (opponent.gameboard.areAllShipsSunk()) {
    gameOver = true;
    status.textContent = 'You win! Game over.';
    return;
  }

  isPlayerTurn = false;
  status.textContent = "Opponent's turn. Waiting...";
  computerTurnTimer = setTimeout(computerTurn, 500);
}

function wasAttacked(gameboard, position) {
  const isSamePosition = (shot) => shot.row === position.row && shot.column === position.column;
  return gameboard.hitShots.some(isSamePosition) || gameboard.missedShots.some(isSamePosition);
}

function getRandomAvailablePosition(gameboard) {
  const availablePositions = [];

  for (let row = 0; row < gameboard.grid.length; row++) {
    for (let column = 0; column < gameboard.grid[row].length; column++) {
      const position = { row, column };

      if (!wasAttacked(gameboard, position)) {
        availablePositions.push(position);
      }
    }
  }

  const randomIndex = Math.floor(Math.random() * availablePositions.length);
  return availablePositions[randomIndex];
}

function computerTurn() {
  computerTurnTimer = undefined;

  const position = getRandomAvailablePosition(player.gameboard);
  player.gameboard.receiveAttack(position);
  renderBoard(document.querySelector('#player-board'), player.gameboard, true);

  const status = document.querySelector('#game-status');
  if (player.gameboard.areAllShipsSunk()) {
    gameOver = true;
    status.textContent = 'You lose! Game over.';
  } else {
    isPlayerTurn = true;
    status.textContent = "Your turn. Choose a square on the opponent's board.";
  }
}

function startNewGame() {
  clearTimeout(computerTurnTimer);
  computerTurnTimer = undefined;
  gameOver = false;
  isPlayerTurn = true;

  player = new Player();
  opponent = new Player();

  player.gameboard.placeShip(new Ship(3), { row: 1, column: 1 }, 'horizontal');
  opponent.gameboard.placeShip(new Ship(3), { row: 4, column: 4}, 'vertical');

  renderBoard(document.querySelector('#player-board'), player.gameboard, true);
  renderBoard(document.querySelector('#opponent-board'), opponent.gameboard, false);
  renderShipFleet(document.querySelector('#ship-fleet'));
}

export function initializeDomController() {
  document.querySelector('#new-game').addEventListener('click', startNewGame);
  document.querySelector('#opponent-board').addEventListener('click', handleOpponentBoardClick);
  startNewGame();
}