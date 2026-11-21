export class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.ships = [];
    this.missedShots = [];
  }

  #isValidCell(row, column) {
    return ((0 <= row && row < 10) && (0 <= column && column < 10))
  }

  #isCellOccupied(row, column) {
    return (this.grid[row][column] !== null)
  }

  #isValidShipPlacement(ship, row, column, orientation) {
    const rowStep = orientation === 'vertical' ? 1 : 0;
    const columnStep = orientation === 'horizontal' ? 1 : 0;

    for (let i = 0; i < ship.length; i++) {
      const nextRow = row + i * rowStep;
      const nextColumn = column + i * columnStep;

      if (!this.#isValidCell(nextRow, nextColumn) || this.#isCellOccupied(nextRow, nextColumn)) {
        return false;
      }
    }

    return true;
  }

  placeShip(ship, row, column, orientation) {
    if (!this.#isValidShipPlacement(ship, row, column, orientation)) {
      throw new RangeError('Ship placement is out of bounds or overlaps another ship.');
    }

    for (let i = 0; i < ship.length; i++) {
      if (orientation === 'horizontal') {
        this.grid[row][column + i] = ship;
      } else {
        this.grid[row + i][column] = ship;
      }
    }

    this.ships.push(ship);
  }

  receiveAttack(row, column) {
    if (!this.#isValidCell(row, column)) {
      throw new RangeError('Attack coordinates are out of bounds.');
    }

    const target = this.grid[row][column];
    if (target === null) {
      this.missedShots.push([row, column]);
    } else {
      target.hit();
    }
  }

  areAllShipsSunk() {
    return this.ships.every((ship) => ship.isSunk());
  }
}