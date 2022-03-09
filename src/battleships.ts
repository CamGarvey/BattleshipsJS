import { ShootResponse } from './models/shoot-response';
import { BattleshipsState } from './models/battleship-state';
import { Vector } from './models/vector';
import { IPlayerManager } from './player-manager/player-manager.interface';
import { IBattlefield } from './battlefield/battlefield.interface';
import { IShip } from './ship/ship.interface';

export class Battleships {
  private state: BattleshipsState;

  constructor(private playerManager: IPlayerManager) {
    this.state = BattleshipsState.Idle;
  }

  private async playLoop(debug = false) {
    while (this.state == BattleshipsState.Playing) {
      const shooter = this.playerManager.shooter;
      const target = this.playerManager.target;

      shooter.displayMessage('Your turn!');
      target.displayMessage(`${shooter.id}'s turn`);

      // Display the battlefields to the shooter
      shooter.displayBattlefields(
        target.battlefield,
        shooter.battlefield,
        debug
      );

      // Prompt shooter for coordinates
      const coordinates = await shooter.promptCoordinates(target.battlefield);

      // Shoot at the target's battlefield
      const response = shooter.missileLauncher.shootAt(
        target.battlefield,
        coordinates
      );

      // Handle response
      this.state = this.playerManager.endTurn(response);
    }
  }

  public async run(debug = false) {
    this.playerManager.displayMessage('Battleships!!');

    this.state = BattleshipsState.Playing;
    while (this.state != BattleshipsState.Exit) {
      await this.playLoop(debug);
      const isPlayingAgain = await this.playerManager.promptPlayAgain();
      if (isPlayingAgain) {
        this.state = BattleshipsState.Playing;
        this.playerManager.reset();
      } else {
        this.state = BattleshipsState.Exit;
      }
    }
  }
}
