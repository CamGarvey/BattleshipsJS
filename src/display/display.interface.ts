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
  promptBool(message: string): Promise<boolean>;
  promptCoordinates(battlefield: IBattlefield): Promise<Vector>;
  displayMessage(message: string): void;
}
