import { Marray } from '../util';
import { IPlayer } from './player';
import { ShootResponse } from './shoot-response';

export interface IPlayerManager {
  players: IPlayer[];
  shooter: IPlayer;
  target: IPlayer;
  init(): void;
  addPlayer(player: IPlayer): void;
  handleResponse(response: ShootResponse): void;
  displayMessage(message: string): void;
}

export class PlayerManager implements IPlayerManager {
  private _shooter: IPlayer;
  private _target: IPlayer;

  private lastPlayer: IPlayer;

  constructor(public players: IPlayer[] = []) {}

  init(): void {
    this.players.forEach((p) => p.battlefield.createShips());
  }

  public addPlayer(player: IPlayer) {
    this.players.push(player);
  }

  public get shooter() {
    if (this._shooter == undefined) {
      this._shooter = Marray.randomChoice(this.players);
    }
    return this._shooter;
  }

  public get target() {
    if (this._target == undefined) {
      this._target = this.getNextPlayer(this.shooter);
    }
    return this._target;
  }

  private getNextPlayer(player: IPlayer) {
    const currentIndex = this.players.indexOf(player);
    const nextIndex = (currentIndex + 1) % this.players.length;
    return this.players[nextIndex];
  }

  private cyclePlayers() {
    this._shooter = this.getNextPlayer(this.shooter);
    this._target = this.getNextPlayer(this.target);
  }

  public handleResponse(response: ShootResponse) {
    this.shooter.handleShooterResponse(response);
    this.target.handleShooterResponse(response);
    this.cyclePlayers();
  }

  public displayMessage(message: string): void {
    this.players.forEach((player) => player.displayMessage(message));
  }
}
