export class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.ships = [];
    this.missedShots = [];
  }

  #isValidCell({ row, column }) {
    return ((0 <= row && row < 10) && (0 <= column && column < 10))
  }

  #isCellOccupied({ row, column }) {
    return (this.grid[row][column] !== null)
  }

  #isValidShipPlacement(ship, position, orientation) {
    const rowStep = orientation === 'vertical' ? 1 : 0;
    const columnStep = orientation === 'horizontal' ? 1 : 0;

    for (let i = 0; i < ship.length; i++) {
      const nextPosition = {
        row: position.row + i * rowStep,
        column: position.column + i * columnStep,
      };

      if (!this.#isValidCell(nextPosition) || this.#isCellOccupied(nextPosition)) {
        return false;
      }
    }

    return true;
  }

  placeShip(ship, position, orientation) {
    if (!this.#isValidShipPlacement(ship, position, orientation)) {
      throw new RangeError('Ship placement is out of bounds or overlaps another ship.');
    }

    for (let i = 0; i < ship.length; i++) {
      if (orientation === 'horizontal') {
        this.grid[position.row][position.column + i] = ship;
      } else {
        this.grid[position.row + i][position.column] = ship;
      }
    }

    this.ships.push(ship);
  }

  receiveAttack(position) {
    if (!this.#isValidCell(position)) {
      throw new RangeError('Attack coordinates are out of bounds.');
    }

    const target = this.grid[position.row][position.column];
    if (target === null) {
      this.missedShots.push({ row: position.row, column: position.column });
    } else {
      target.hit();
    }
  }

  areAllShipsSunk() {
    return this.ships.every((ship) => ship.isSunk());
  }
}