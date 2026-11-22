import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';

describe('Gameboard and Ship', () => {
  test('attacks on a placed ship register hits and update whether all ships are sunk', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(2);
    gameboard.placeShip(ship, { row: 3, column: 4 }, 'horizontal');

    expect(gameboard.areAllShipsSunk()).toBe(false);

    gameboard.receiveAttack({ row: 3, column: 4 });
    expect(ship.numHits).toBe(1);
    expect(ship.isSunk()).toBe(false);
    expect(gameboard.areAllShipsSunk()).toBe(false);

    gameboard.receiveAttack({ row: 3, column: 5 });
    expect(ship.numHits).toBe(2);
    expect(ship.isSunk()).toBe(true);
    expect(gameboard.areAllShipsSunk()).toBe(true);
  });

  test('missed attacks are recorded without hitting a placed ship', () => {
    const gameboard = new Gameboard();
    const ship = new Ship(2);
    gameboard.placeShip(ship, { row: 3, column: 4 }, 'vertical');

    gameboard.receiveAttack({ row: 2, column: 4 });

    expect(gameboard.missedShots).toEqual([{ row: 2, column: 4 }]);
    expect(ship.numHits).toBe(0);
    expect(ship.isSunk()).toBe(false);
  });
});
