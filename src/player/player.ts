import { Marray, MatrixHelper } from '../util';
import { BattleshipsError } from '../models/errors';
import { Ship } from '../ship/ship';
import { ShootMessage } from '../models/shoot-message';
import { ShootResponse } from '../models/shoot-response';
import { Vector } from '../models/vector';
import { IBattlefield } from '../battlefield/battlefield.interface';
import { IPlayer } from './player.interface';
import { IDisplay } from '../display/display.interface';

interface PlayerOptions {
  id: string;
  numberOfShips?: number;
  display: IDisplay;
  battlefield: IBattlefield;
}

export class Player implements IPlayer {
  id: string;
  _isDead: boolean;
  private previousCoordinates: Vector[];
  public battlefield: IBattlefield;
  private display: IDisplay;

  constructor({ id, battlefield, display }: PlayerOptions) {
    this.id = id;
    this.battlefield = battlefield;
    this.display = display;
    this.previousCoordinates = [];
    this._isDead = false;
  }

  public get isDead() {
    return this._isDead;
  }

  async promptCoordinates(battlefield: IBattlefield) {
    const coordinates = await this.display.promptCoordinates(battlefield);
    this.previousCoordinates.push(coordinates);
    return coordinates;
  }

  public handleTargetedResponse(response: ShootResponse): void {
    if (response.message() == ShootMessage.Hit) {
      this.display.displayMessage('You were hit!');
      this._isDead = this.battlefield.remainingShips().length == 0;
    } else {
      this.display.displayMessage('They missed!');
    }
  }

  public handleShooterResponse(response: ShootResponse): void {
    this.display.displayMessage(response.message());
  }

  public displayMessage(message: string): void {
    this.display.displayMessage(message);
  }

  public displayBattlefields(
    targetedBattlefield: IBattlefield,
    ownBattlefield: IBattlefield,
    drawAllShips = false
  ): void {
    this.display.displayBattlefields(
      targetedBattlefield,
      ownBattlefield,
      drawAllShips
    );
  }

  public promptPlayAgain() {
    return this.display.promptBool('Play Again?');
  }
}
