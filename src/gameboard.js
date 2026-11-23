export class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.ships = [];
    this.hitShots = [];
    this.missedShots = [];
  }

  #isValidCell({ row, column }) {
    return Number.isInteger(row)
      && Number.isInteger(column)
      && 0 <= row && row < 10
      && 0 <= column && column < 10;
  }

  #isValidShipPlacement(ship, position) {
    for (let i = 0; i < ship.length; i++) {
      const nextPosition = {
        row: position.row,
        column: position.column + i,
      };

      if (!this.#isValidCell(nextPosition) || this.grid[nextPosition.row][nextPosition.column] !== null) {
        return false;
      }
    }

    return true;
  }

  #hasAlreadyBeenAttacked({ row, column }) {
    const wasAttacked = (shot) => shot.row === row && shot.column === column;
    return this.hitShots.some(wasAttacked) || this.missedShots.some(wasAttacked);
  }

  placeShip(ship, position) {
    if (!this.#isValidShipPlacement(ship, position)) {
      throw new RangeError('Ship placement is out of bounds or overlaps another ship.');
    }

    for (let i = 0; i < ship.length; i++) {
      this.grid[position.row][position.column + i] = ship;
    }

    this.ships.push(ship);
  }

  receiveAttack(position) {
    if (!this.#isValidCell(position)) {
      throw new RangeError('Attack coordinates are out of bounds.');
    }

    const target = this.grid[position.row][position.column];
    const attack = { row: position.row, column: position.column };
    const hit = target !== null;

    if (this.#hasAlreadyBeenAttacked(attack)) {
      return { hit: false, alreadyAttacked: true };
    }

    if (target === null) {
      this.missedShots.push(attack);
    } else {
      target.hit();
      this.hitShots.push(attack);
    }

    return { hit, alreadyAttacked: false };
  }

  areAllShipsSunk() {
    return this.ships.every((ship) => ship.isSunk());
  }
}