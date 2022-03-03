import { IShip, Ship } from './models/ship';
import { ShootResponse } from './models/shoot-response';
import { MatrixHelper, Marray } from './util';
import { GameMode } from './models/game-mode';
import { ConsoleDisplay, IDisplay } from './display';
import { Vector } from './types';
import { BattleshipsState } from './models/battleship-state';
import { BattleshipsOptions } from './models/battleships-options';
import { BattleshipsError } from './models/errors';
import { IPlayerManager } from './models/player-manager';
import { IPlayer, Player } from './models/player';
import { IBattlefield } from './models/battlefield';

export class Battleships {
  private state: BattleshipsState;

  private positionsInMatrix: Vector[];
  private gameMode: GameMode;

  private matrixShape: Vector;
  private lengthOfShips: number;
  private numberOfShips: number;
  private numberOfTurns: number;

  constructor(
    {
      matrixShape,
      lengthOfShips,
      numberOfShips,
      numberOfTurns = 5,
    }: BattleshipsOptions,
    private playerManager: IPlayerManager
  ) {
    if (lengthOfShips <= 0) {
      throw new BattleshipsError('Ship must be at least 1 in length');
    }
    if (lengthOfShips > matrixShape[0] && lengthOfShips > matrixShape[1]) {
      throw new BattleshipsError('Ships too big');
    }
    this.matrixShape = matrixShape;
    this.lengthOfShips = lengthOfShips;
    this.numberOfShips = numberOfShips;
    this.numberOfTurns = numberOfTurns;
    this.state = BattleshipsState.Idle;

    this.positionsInMatrix =
      MatrixHelper.allPositionsInMatrixShape(matrixShape);
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
    let count = 0;
    while (this.state == BattleshipsState.Playing) {
      // Get Target
      this.playerManager.shooter.displayBattlefield(
        this.playerManager.target.battlefield
      );

      const coordinates = await this.playerManager.shooter.promptCoordinates(
        this.playerManager.target.battlefield
      );

      const response = this.shootAt(
        this.playerManager.target.battlefield,
        coordinates
      );

      this.playerManager.endTurn(response);

      // Add new target to previous targets
      // this.targets.push(target);
      // // Shoot at target
      // const response = this.shoot(target);
      // // Print out response message
      // this.display.displayShootMessage(response.message());
      // // Draw Battlefield to console
      // this.draw(debug);
      // Print Ships remaining
      // console.log(`${this.ships.length - l[s for s in self._ships if s.sunk])}/{len(self._ships)} ships remaining')
      count++;
      if (count == this.numberOfTurns) this.state = BattleshipsState.Lost;
      // if (this.hasWon()) this.state = BattleshipsState.Won;
    }
  }

  private resetBattlefield() {
    // this.createShips();
  }

  private draw(drawShips: boolean) {
    // this.display.displayBattlefield(
    //   this.matrixShape,
    //   // this.targets,
    //   // this.ships,
    //   drawShips
    // );
  }

  public async run(debug = false) {
    this.playerManager.init();
    this.playerManager.displayMessage('Battleships!!');

    this.state = BattleshipsState.Playing;
    while (this.state != BattleshipsState.Exit) {
      const shooter = this.playerManager.shooter;
      const target = this.playerManager.target;
      this.playerManager.displayMessage(`${shooter.id}'s turn`);
      // this.gameMode = await this.display.promptGameMode();
      this.resetBattlefield();
      this.draw(debug);
      await this.playLoop(debug);
      // Draw final battlefield to console
      this.draw(true);
      // Display if won or lose
      // this.display.displayResult(this.state == BattleshipsState.Won);
      // const playAgain = await this.display.promptPlayAgain();
      // if (!playAgain) {
      //   this.state = BattleshipsState.Exit;
      // }
    }
  }
}
