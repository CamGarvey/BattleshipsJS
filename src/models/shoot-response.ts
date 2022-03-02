import { IPlayer } from './player';
import { IShip, Ship } from './ship';
import { ShootMessage } from './shoot-message';

export class ShootResponse {
  distance: number;

  constructor(distance: number, private ship: IShip) {
    this.distance = Math.abs(distance);
  }

  public message() {
    if (this.distance > 4) return ShootMessage.Cold;
    if (this.distance >= 3) return ShootMessage.Warm;
    if (this.distance >= 1) return ShootMessage.Hot;
    return ShootMessage.Hit;
  }
}
