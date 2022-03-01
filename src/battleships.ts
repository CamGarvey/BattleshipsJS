import { Ship } from './models/ship';
import { ShootResponse } from './models/shoot-response';
import { MatrixHelper, randomChoice } from './util';
import { GameMode } from './models/game-mode';
import { ConsoleDisplay, IDisplay } from './display';
import { Vector } from './types';
import { BattleshipsState } from './models/battleship-state';
import { BattleshipsOptions } from './models/battleships-options';
import { BattleshipsError } from './models/errors';

export class Battleships {
  private state: BattleshipsState;

  private playerManager: IPlayerManager;

  private positionsInMatrix: Vector[];
  private gameMode: GameMode;
  private display: IDisplay;

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
    display: IDisplay = null
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

    this.display = display;
    this.state = BattleshipsState.Idle;

    this.positionsInMatrix =
      MatrixHelper.allPositionsInMatrixShape(matrixShape);
  }

  /**
   * Shoot at the given target, returns at ShootResponse
   * @param target
   */
  private shoot(target: Vector) {
    let closestShip: Ship;
    let closestDistance: number;

    // only check ships that are not sunk
    const aliveShips = this.aliveShips();
    for (let index = 0; index < aliveShips.length; index++) {
      const distance = aliveShips[index].checkHit(target);
      if (distance == 0) return new ShootResponse(0, aliveShips[index]);
      if (!closestDistance || distance < closestDistance) {
        closestDistance = distance;
        closestShip = aliveShips[index];
      }
    }
    return new ShootResponse(closestDistance, closestShip);
  }

  /**
   * Returns number of ships that are not sunk
   */
  private shipsRemaining() {
    return this.ships.filter((ship) => !ship.sunk).length;
  }

  private hasWon() {
    return this.shipsRemaining() == 0;
  }

  private async playLoop(debug = false) {
    let count = 0;
    while (this.state == BattleshipsState.Playing) {
      // Get Target
      const target = await this.display.promptTarget(
        this.matrixShape,
        this.targets
      );
      // Add new target to previous targets
      this.targets.push(target);
      // Shoot at target
      const response = this.shoot(target);
      // Print out response message
      this.display.displayShootMessage(response.message());
      // Draw Battlefield to console
      this.draw(debug);
      // Print Ships remaining
      // console.log(`${this.ships.length - l[s for s in self._ships if s.sunk])}/{len(self._ships)} ships remaining')
      count++;
      this.display.displayRemaining(this.ships, count, this.numberOfTurns);
      // Print turns remains

      // print(f'{self._number_of_turns - count}/{self._number_of_turns} turns remaining')

      if (count == this.numberOfTurns) this.state = BattleshipsState.Lost;
      if (this.hasWon()) this.state = BattleshipsState.Won;
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
    this.display.displayTitle();
    this.state = BattleshipsState.Playing;
    while (this.state != BattleshipsState.Exit) {
      this.gameMode = await this.display.promptGameMode();
      this.resetBattlefield();
      this.draw(debug);
      await this.playLoop(debug);
      // Draw final battlefield to console
      this.draw(true);
      // Display if won or lose
      this.display.displayResult(this.state == BattleshipsState.Won);
      const playAgain = await this.display.promptPlayAgain();
      if (!playAgain) {
        this.state = BattleshipsState.Exit;
      }
    }
  }
}
