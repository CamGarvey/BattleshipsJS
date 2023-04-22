import { IShip } from '../ship/ship.interface';
import { ShootMessage } from './shoot-message';

export class ShootResponse {
  distance: number;
  sunk: boolean;

  constructor(distance: number, ship: IShip) {
    this.distance = Math.abs(distance);
    this.sunk = ship.sunk;
  }

  public message() {
    if (this.distance > 4) return ShootMessage.Cold;
    if (this.distance >= 3) return ShootMessage.Warm;
    if (this.distance >= 1) return ShootMessage.Hot;
    return ShootMessage.Hit;
  }
}
