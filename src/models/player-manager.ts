export interface IPlayerManager {
  players: IPlayer[];
  addPlayer(player: IPlayer): void;
  getNextPlayer(): IPlayer;
}

export class PlayerManager implements IPlayerManager {
  private lastPlayer: IPlayer;

  constructor(public players: IPlayer[] = []) {}

  public addPlayer(player: IPlayer) {
    this.players.push(player);
  }

  public getNextPlayer(): IPlayer {
    if (this.lastPlayer == undefined) {
      this.lastPlayer = randomChoice(this.players);
      return this.lastPlayer;
    }
    const currentIndex = this.players.indexOf(this.lastPlayer);
    const nextIndex = (currentIndex + 1) % this.players.length;
    this.lastPlayer = this.players[nextIndex];
    return this.lastPlayer;
  }
}
