import { IShip, Ship } from './models/ship';
import { ShootResponse } from './models/shoot-response';
import { MatrixHelper, Marray } from './util';
import { GameMode } from './models/game-mode';
import { ConsoleDisplay, IDisplay } from './display';
import { BattleshipsState } from './models/battleship-state';
import { BattleshipsError } from './models/errors';
import { IPlayerManager } from './models/player-manager';
import { IPlayer, Player } from './models/player';
import { IBattlefield } from './models/battlefield';
import { Vector } from './models/vector';

export class Battleships {
  private state: BattleshipsState;

  constructor(private playerManager: IPlayerManager) {
    this.state = BattleshipsState.Idle;
  }

  private shootAt(battlefield: IBattlefield, coordinates: Vector) {
    let closestShip: IShip;
    let closestDistance: number;

    // only check ships that are not sunk
    battlefield.enemyCoordinates.push(coordinates);
    const aliveShips = battlefield.remainingShips();
    for (let index = 0; index < aliveShips.length; index++) {
      const distance = aliveShips[index].checkHit(coordinates);
      if (distance == 0) return new ShootResponse(0, aliveShips[index]);
      if (!closestDistance || distance < closestDistance) {
        closestDistance = distance;
        closestShip = aliveShips[index];
      }
    }
    return new ShootResponse(closestDistance, closestShip);
  }

  private async playLoop(debug = false) {
    this.playerManager.init();
    while (this.state == BattleshipsState.Playing) {
      const shooter = this.playerManager.shooter;
      const target = this.playerManager.target;

      shooter.displayMessage('Your turn!');
      target.displayMessage(`${shooter.id}'s turn`);

      // Display the battlefields to the shooter
      shooter.displayBattlefields(target.battlefield, shooter.battlefield);

      // Prompt shooter for coordinates
      const coordinates = await shooter.promptCoordinates(target.battlefield);

      // Shoot at the target's battlefield
      const response = this.shootAt(target.battlefield, coordinates);

      // Handle response
      this.state = this.playerManager.endTurn(response);
    }
  }

  public async run(debug = false) {
    this.playerManager.displayMessage('Battleships!!');

    this.state = BattleshipsState.Playing;
    while (this.state != BattleshipsState.Exit) {
      await this.playLoop(debug);
    }
  }
}
