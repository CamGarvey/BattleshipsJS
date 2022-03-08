import { IBattlefield } from '../battlefield/battlefield.interface';
import { GameMode } from '../models/game-mode';
import { ShootMessage } from '../models/shoot-message';
import { Vector } from '../models/vector';
import { IShip } from '../ship/ship.interface';

export interface IDisplay {
  displayBattlefields(
    targetedBattlefield: IBattlefield,
    ownBattlefield: IBattlefield,
    drawAllShips?: boolean
  ): void;
  displayTitle(): void;
  promptBool(message: string): Promise<boolean>;
  promptGameMode(): Promise<GameMode>;
  promptCoordinates(battlefield: IBattlefield): Promise<Vector>;
  displayShootMessage(message: ShootMessage): void;
  displayResult(hasWon: boolean): void;
  displayRemaining(
    ships: IShip[],
    turnsHad: number,
    turnsAllowed: number
  ): void;
  displayMessage(message: string): void;
}
