const SHIP_DIRECTIONS = {
  horizontal: { row: 0, column: 1 },
  vertical: { row: 1, column: 0 },
};

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

  #isValidShipPlacement(ship, position, direction) {
    for (let i = 0; i < ship.length; i++) {
      const nextPosition = {
        row: position.row + i * direction.row,
        column: position.column + i * direction.column,
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

  placeShip(ship, position, orientation) {
    if (orientation !== 'horizontal' && orientation !== 'vertical') {
      throw new RangeError('Ship orientation must be horizontal or vertical.');
    }
    const direction = SHIP_DIRECTIONS[orientation];

    if (!this.#isValidShipPlacement(ship, position, direction)) {
      throw new RangeError('Ship placement is out of bounds or overlaps another ship.');
    }

    for (let i = 0; i < ship.length; i++) {
      const row = position.row + i * direction.row;
      const column = position.column + i * direction.column;
      this.grid[row][column] = ship;
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