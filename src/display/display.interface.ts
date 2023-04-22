import { IBattlefield } from '../battlefield/battlefield.interface';
import { Vector } from '../models/vector';

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
