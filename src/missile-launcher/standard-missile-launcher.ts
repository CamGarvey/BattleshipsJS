import { IBattlefield } from '../battlefield/battlefield.interface';
import { ShootResponse } from '../models/shoot-response';
import { Vector } from '../models/vector';
import { IShip } from '../ship/ship.interface';
import { IMissileLauncher } from './missile-launcher.interface';

export class StandardMissileLauncher implements IMissileLauncher {
  shootAt(battlefield: IBattlefield, coordinates: Vector): ShootResponse {
    let closestShip: IShip;
    let closestDistance: number;

    // only check ships that are not sunk
    battlefield.enemyCoordinates.push(coordinates);
    const aliveShips = battlefield.remainingShips();
    for (let index = 0; index < aliveShips.length; index++) {
      const distance = aliveShips[index].checkHit(coordinates);
      if (distance == 0) return new ShootResponse(0, aliveShips[index]);
      if (!closestDistance || distance < closestDistance) {
        closestDistance = distance;
        closestShip = aliveShips[index];
      }
    }
    return new ShootResponse(closestDistance, closestShip);
  }
}
