import { BattleshipsState } from '../models/battleship-state';
import { ShootResponse } from '../models/shoot-response';
import { IPlayer } from '../player/player.interface';

export interface IPlayerManager {
  players: IPlayer[];
  shooter: IPlayer;
  target: IPlayer;
  init(): void;
  addPlayer(player: IPlayer): void;
  endTurn(response: ShootResponse): BattleshipsState;
  displayMessage(message: string): void;
}
