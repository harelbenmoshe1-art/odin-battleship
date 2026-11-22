import { Ship } from './ship.js';

describe('Ship', () => {
  test('tracks hits and sinks after taking its length in hits', () => {
    const ship = new Ship(2);

    expect(ship.isSunk()).toBe(false);

    ship.hit();
    expect(ship.numHits).toBe(1);
    expect(ship.isSunk()).toBe(false);

    ship.hit();
    expect(ship.numHits).toBe(2);
    expect(ship.isSunk()).toBe(true);
  });
});
