import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';

describe('Gameboard and Ship', () => {
  test('attacks on a placed ship register hits and update whether all ships are sunk', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(2);
    gameboard.placeShip(ship, { row: 3, column: 4 });

    expect(gameboard.areAllShipsSunk()).toBe(false);

    const firstAttack = gameboard.receiveAttack({ row: 3, column: 4 });
    expect(firstAttack).toEqual({ hit: true, alreadyAttacked: false });
    expect(ship.numHits).toBe(1);
    expect(ship.isSunk()).toBe(false);
    expect(gameboard.areAllShipsSunk()).toBe(false);

    const secondAttack = gameboard.receiveAttack({ row: 3, column: 5 });
    expect(secondAttack).toEqual({ hit: true, alreadyAttacked: false });
    expect(ship.numHits).toBe(2);
    expect(ship.isSunk()).toBe(true);
    expect(gameboard.areAllShipsSunk()).toBe(true);
    expect(gameboard.hitShots).toEqual([
      { row: 3, column: 4 },
      { row: 3, column: 5 },
    ]);
  });

  test('missed attacks are recorded without hitting a placed ship', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(2);
    gameboard.placeShip(ship, { row: 3, column: 4 });

    const result = gameboard.receiveAttack({ row: 2, column: 4 });
    const repeatedAttack = gameboard.receiveAttack({ row: 2, column: 4 });

    expect(result).toEqual({ hit: false, alreadyAttacked: false });
    expect(repeatedAttack).toEqual({ hit: false, alreadyAttacked: true });
    expect(gameboard.missedShots).toEqual([{ row: 2, column: 4 }]);
    expect(ship.numHits).toBe(0);
    expect(ship.isSunk()).toBe(false);
  });

  test('does not count the same attack more than once', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(2);
    gameboard.placeShip(ship, { row: 3, column: 4 });

    gameboard.receiveAttack({ row: 3, column: 4 });
    const repeatedAttack = gameboard.receiveAttack({ row: 3, column: 4 });

    expect(repeatedAttack).toEqual({ hit: false, alreadyAttacked: true });
    expect(ship.numHits).toBe(1);
    expect(gameboard.hitShots).toEqual([{ row: 3, column: 4 }]);
  });

  test('rejects ship placements out of bounds and non-integer coordinates', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(2);

    expect(() => gameboard.placeShip(ship, { row: 3, column: 9 }))
      .toThrow(RangeError);
    expect(() => gameboard.placeShip(ship, { row: 3.5, column: 4 }))
      .toThrow(RangeError);
    expect(() => gameboard.receiveAttack({ row: 1.5, column: 4 }))
      .toThrow(RangeError);
  });
});
