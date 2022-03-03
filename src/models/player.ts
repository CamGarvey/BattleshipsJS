import { IDisplay } from '../display';
import { Vector } from '../types';
import { Marray, MatrixHelper } from '../util';
import { Battlefield, IBattlefield } from './battlefield';
import { BattleshipsError } from './errors';
import { Ship } from './ship';
import { ShootResponse } from './shoot-response';

export interface IPlayer {
  id: string;
  dead: boolean;
  battlefield: IBattlefield;
  promptCoordinates(battlefield: IBattlefield): Promise<Vector>;
  handleTargetedResponse(response: ShootResponse): void;
  handleShooterResponse(response: ShootResponse): void;
  displayMessage(message: string): void;
  displayBattlefields(
    targetedBattlefield: IBattlefield,
    ownBattlefield: IBattlefield
  ): void;
}

interface PlayerOptions {
  id: string;
  numberOfShips?: number;
  display: IDisplay;
  battlefield: IBattlefield;
}

export class Player implements IPlayer {
  id: string;
  dead: boolean;
  private previousCoordinates: Vector[];
  public battlefield: IBattlefield;
  private display: IDisplay;

  constructor({ id, battlefield, display }: PlayerOptions) {
    this.id = id;
    this.battlefield = battlefield;
    this.display = display;
  }

  promptCoordinates(battlefield: IBattlefield) {
    return this.display.promptCoordinates(battlefield);
  }

  public handleTargetedResponse(response: ShootResponse): void {}

  public handleShooterResponse(response: ShootResponse): void {
    this.display.displayMessage('Shooter bitch');
  }

  public displayMessage(message: string): void {
    this.display.displayMessage(message);
  }

  public displayBattlefields(
    targetedBattlefield: IBattlefield,
    ownBattlefield: IBattlefield
  ): void {
    this.display.displayBattlefields(targetedBattlefield, ownBattlefield);
  }
}
