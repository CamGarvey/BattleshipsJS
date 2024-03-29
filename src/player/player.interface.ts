import { IBattlefield } from '../battlefield/battlefield.interface';
import { IMissileLauncher } from '../missile-launcher/missile-launcher.interface';
import { ShootResponse } from '../models/shoot-response';
import { Vector } from '../models/vector';

export interface IPlayer {
  id: string;
  isDead: boolean;
  battlefield: IBattlefield;
  missileLauncher: IMissileLauncher;
  reset(): void;
  promptCoordinates(battlefield: IBattlefield): Promise<Vector>;
  promptPlayAgain(): Promise<boolean>;
  handleTargetedResponse(response: ShootResponse): void;
  handleShooterResponse(response: ShootResponse): void;
  displayMessage(message: string): void;
  displayBattlefields(
    targetedBattlefield: IBattlefield,
    ownBattlefield: IBattlefield,
    drawAllShips?: boolean
  ): void;
}
