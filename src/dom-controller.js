import { Player } from './player.js';
import { Ship } from './ship.js';

const SHIP_LENGTHS = [1, 2, 3, 4, 5];

let player;
let opponent;
let shipsToPlace = [];
let gameOver = false;
let isPlayerTurn = true;
let computerTurnTimer;

function renderShipFleet(element, ships) {
  element.replaceChildren();

  for (const shipModel of ships) {
    const shipElement = document.createElement('div');
    shipElement.classList.add('fleet-ship');
    shipElement.draggable = true;
    shipElement.dataset.length = shipModel.length;

    const cells = document.createElement('div');
    cells.classList.add('fleet-ship-cells');

    for (let i = 0; i < shipModel.length; i++) {
      const cell = document.createElement('span');
      cell.classList.add('fleet-cell');
      cells.append(cell);
    }

    shipElement.append(cells);
    element.append(shipElement);
  }
}

// This function is used to create each player's board.
function renderBoard(element, gameboard, showShips, disabled = false) {
  element.replaceChildren(); // Remove a player's child nodes (clear the board).

  gameboard.grid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const square = document.createElement('button');
      square.type = 'button';
      square.disabled = disabled;
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

function handleShipDragStart(event) {
  const shipElement = event.target.closest('.fleet-ship');
  if (shipElement === null) return;

  event.dataTransfer.setData('text/plain', shipElement.dataset.length);
  event.dataTransfer.effectAllowed = 'move';
}

function handlePlayerBoardDragOver(event) {
  if (gameOver || shipsToPlace.length === 0 || event.target.closest('.cell') === null) return;

  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

function handlePlayerBoardDrop(event) {
  const square = event.target.closest('.cell');
  if (square === null || gameOver) return;

  event.preventDefault();

  const length = Number(event.dataTransfer.getData('text/plain'));
  const ship = shipsToPlace.find((shipToPlace) => shipToPlace.length === length);
  if (ship === undefined) return;

  const position = {
    row: Number(square.dataset.row),
    column: Number(square.dataset.column),
  };

  try {
    player.gameboard.placeShip(ship, position);
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    document.querySelector('#game-status').textContent =
      'That ship does not fit there. Try another position.';
    return;
  }

  shipsToPlace = shipsToPlace.filter((shipToPlace) => shipToPlace !== ship);
  renderBoard(document.querySelector('#player-board'), player.gameboard, true);
  renderShipFleet(document.querySelector('#ship-fleet'), shipsToPlace);

  const status = document.querySelector('#game-status');
  if (shipsToPlace.length === 0) {
    renderBoard(document.querySelector('#opponent-board'), opponent.gameboard, false);
    status.textContent = "Your turn. Choose a square on the opponent's board.";
  } else {
    status.textContent = 'Place the remaining ships on your board.';
  }
}

function placeComputerFleet() {
  const availableRows = Array.from({ length: 10 }, (_, row) => row);

  for (const length of SHIP_LENGTHS) {
    const randomRowIndex = Math.floor(Math.random() * availableRows.length);
    const [row] = availableRows.splice(randomRowIndex, 1);
    const maxColumn = opponent.gameboard.grid[row].length - length;
    const column = Math.floor(Math.random() * (maxColumn + 1));

    opponent.gameboard.placeShip(new Ship(length), { row, column });
  }
}

function handleOpponentBoardClick(event) {
  if (gameOver || !isPlayerTurn || shipsToPlace.length > 0) return;

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
  shipsToPlace = SHIP_LENGTHS.map((length) => new Ship(length));

  placeComputerFleet();

  renderBoard(document.querySelector('#player-board'), player.gameboard, true);
  renderBoard(document.querySelector('#opponent-board'), opponent.gameboard, false, true);
  renderShipFleet(document.querySelector('#ship-fleet'), shipsToPlace);
  document.querySelector('#game-status').textContent = 'Drag each ship onto your board to place your fleet.';
}

export function initializeDomController() {
  document.querySelector('#new-game').addEventListener('click', startNewGame);
  document.querySelector('#opponent-board').addEventListener('click', handleOpponentBoardClick);
  document.querySelector('#ship-fleet').addEventListener('dragstart', handleShipDragStart);
  document.querySelector('#player-board').addEventListener('dragover', handlePlayerBoardDragOver);
  document.querySelector('#player-board').addEventListener('drop', handlePlayerBoardDrop);
  startNewGame();
}