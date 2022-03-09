import { ShootMessage } from '../models/shoot-message';
import { ShootResponse } from '../models/shoot-response';
import { Vector } from '../models/vector';
import { IBattlefield } from '../battlefield/battlefield.interface';
import { IPlayer } from './player.interface';
import { IDisplay } from '../display/display.interface';
import { IMissileLauncher } from '../missile-launcher/missile-launcher.interface';

interface PlayerOptions {
  id: string;
  numberOfShips?: number;
  display: IDisplay;
  battlefield: IBattlefield;
  missileLauncher: IMissileLauncher;
}

export class Player implements IPlayer {
  private _id: string;
  private _isDead: boolean;
  private previousCoordinates: Vector[];
  private _battlefield: IBattlefield;
  private _display: IDisplay;
  private _missileLauncher: IMissileLauncher;

  constructor({ id, battlefield, missileLauncher, display }: PlayerOptions) {
    this._id = id;
    this._battlefield = battlefield;
    this._missileLauncher = missileLauncher;
    this._display = display;
    this.previousCoordinates = [];
    this._isDead = false;
  }

  public reset(): void {
    this.battlefield.reset();
    this.previousCoordinates = [];
    this._isDead = false;
  }

  public get id() {
    return this._id;
  }

  public get isDead() {
    return this._isDead;
  }

  public get battlefield() {
    return this._battlefield;
  }

  public get missileLauncher() {
    return this._missileLauncher;
  }

  public get display() {
    return this._display;
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

  public promptPlayAgain(): Promise<boolean> {
    return this.display.promptBool('Play Again?');
  }
}
