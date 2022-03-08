import { Marray } from '../util';
import { BattleshipsState } from '../models/battleship-state';
import { ShootResponse } from '../models/shoot-response';
import { IPlayerManager } from './player-manager.interface';
import { IPlayer } from '../player/player.interface';

interface PlayerManagerOptions {
  players: IPlayer[];
  numberOfTurns?: number;
}

export class PlayerManager implements IPlayerManager {
  private _shooter: IPlayer;
  private _target: IPlayer;

  private _players: IPlayer[];
  private playCount: number;
  private numberOfTurns: number;

  private lastPlayer: IPlayer;

  constructor({ players, numberOfTurns = 20 }: PlayerManagerOptions) {
    this._players = players;
    this.numberOfTurns = numberOfTurns;
  }

  init(): void {
    this.playCount = 0;
    this.players.forEach((p) => p.battlefield.createShips());
  }

  public get players() {
    return this._players;
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

  private showBattlefields() {
    this.shooter.displayBattlefields(
      this.target.battlefield,
      this.shooter.battlefield,
      true
    );
    this.target.displayBattlefields(
      this.shooter.battlefield,
      this.target.battlefield,
      true
    );
  }

  public endTurn(response: ShootResponse) {
    this.playCount++;
    this.shooter.handleShooterResponse(response);
    this.target.handleTargetedResponse(response);
    if (this.target.isDead) {
      this.showBattlefields();
      this.target.displayMessage('You Lose!');
      this.shooter.displayMessage('You Win!');
      return BattleshipsState.GameOver;
    }
    if (this.playCount == this.numberOfTurns * this.players.length) {
      this.showBattlefields();
      this.displayMessage('No winners!');
      return BattleshipsState.GameOver;
    }
    this.cyclePlayers();
    return BattleshipsState.Playing;
  }

  public displayMessage(message: string): void {
    this.players.forEach((player) => player.displayMessage(message));
  }
}
