import { Player } from './player.js';
import { Ship } from './ship.js';

let player;
let opponent;

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


      if (showShips && cell !== null) {
        square.classList.add('ship');
      }

      element.append(square);
    });
  });
}

function startNewGame() {
  player = new Player();
  opponent = new Player();

  player.gameboard.placeShip(new Ship(3), { row: 1, column: 1 }, 'horizontal');
  opponent.gameboard.placeShip(new Ship(3), { row: 4, column: 4}, 'vertical');

  renderBoard(document.querySelector('#player-board'), player.gameboard, true);
  renderBoard(document.querySelector('#opponent-board'), opponent.gameboard, false);
  document.querySelector('#game-status').textContent = "Your turn. Choose a square on the opponent's board.";
}

export function initializeDomController() {
  document.querySelector('#new-game').addEventListener('click', startNewGame);
  startNewGame();
}