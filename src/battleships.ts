import { Ship } from './models/ship';
import { ShootResponse } from './models/shoot-response';
import { allPositionsInMatrixShape, randomChoice } from './util';
import { GameMode } from './models/game-mode';
import { ConsoleDisplay, IDisplay } from './display';
import { Vector } from './types';

enum BattleShipsState {
  Exit,
  Idle,
  Playing,
  Lost,
  Won,
}

class BattleShipsError extends Error {}

export class Battleships {
  private state: BattleShipsState;
  private ships: Ship[];
  private targets: Vector[];
  private positionsInMatrix: Vector[];
  private gameMode: GameMode;
  private display: IDisplay;

  constructor(
    private matrixShape: Vector,
    private numberOfShips: number,
    private lengthOfShips: number,
    private sinkInOneHit = true,
    private numberOfTurns = 20,
    display: IDisplay = null
  ) {
    if (lengthOfShips <= 0) {
      throw new BattleShipsError('Ship must be at least 1 in length');
    }
    if (lengthOfShips > matrixShape[0] && lengthOfShips > matrixShape[1]) {
      throw new BattleShipsError('Ships too big');
    }
    this.display = display || new ConsoleDisplay(this.matrixShape);
    this.state = BattleShipsState.Idle;
    this.ships = [];
    this.targets = [];
    this.positionsInMatrix = allPositionsInMatrixShape(matrixShape);
  }

  private createShips() {
    for (let _ = 0; _ < this.numberOfShips; _++) {
      const ship = this.createShip();
      this.ships.push(ship);
    }
  }

  /**
   * Finds free place for a new ship and creates a new one at that position
   * @param takenSpots
   * @param length
   * @param sinkInOneHit
   * @returns
   */
  private createShip() {
    let tries = 0;
    const takenSpots = this.allShipVectors();
    while (
      tries <
      this.matrixShape[0] * this.matrixShape[1] - takenSpots.length
    ) {
      const head = this.pickShipHead(takenSpots);
      if (this.lengthOfShips == 1) {
        return new Ship([head], this.sinkInOneHit);
      }
      const potentialBodies: Vector[][] = this.findNeighbours(
        head,
        this.lengthOfShips - 1
      );
      // filter out bodies that have positions taken
      const validBodies = potentialBodies.filter((body) => {
        // make sure that bodies are not in take positions
        return !body.find((vector) =>
          takenSpots.find((x) => x[0] == vector[0] && x[1] == vector[1])
        );
      });
      if (validBodies.length != 0)
        return new Ship(
          [head, ...randomChoice(validBodies)],
          this.sinkInOneHit
        );
      tries = tries + 1;
    }
    throw new BattleShipsError('Failed to create ship - no room');
  }

  /**
   * Finds the neighbours of the given position
   * @param vector
   * @param size
   * @returns
   */
  private findNeighbours(vector: Vector, size = 1): Vector[][] {
    const col = vector[0];
    const row = vector[1];

    let top: Vector[] = [];
    let bottom: Vector[] = [];
    let left: Vector[] = [];
    let right: Vector[] = [];

    // Find top neighbours
    if (row - size >= 0) {
      for (let index = row - size; index < row; index++) {
        top.push([col, index]);
      }
    } else {
      top = [];
    }
    // Find bottom neighbours
    if (row + size < this.matrixShape[1]) {
      for (let index = 1; index < size + 1; index++) {
        bottom.push([col, row + index]);
      }
    } else {
      bottom = [];
    }

    // Find left neighbours
    if (col - size >= 0) {
      for (let index = col - size; index < col; index++) {
        left.push([index, row]);
      }
    } else {
      left = [];
    }

    // Find right neighbours
    if (col + size < this.matrixShape[0]) {
      for (let index = 1; index < size + 1; index++) {
        right.push([col + index, row]);
      }
    } else {
      right = [];
    }
    // filter out empty arrays and return list
    return [top, bottom, left, right].filter((x) => x.length !== 0);
  }

  /**
   * Picks a pos in the in battlefield that is not in the taken spots list
   * @param takenSpots
   */
  private pickShipHead(takenSpots: Vector[] = []): Vector {
    const availablePositions = this.positionsInMatrix.filter((vec) => {
      return !takenSpots.find((x) => x[0] == vec[0] && x[1] == vec[1]);
    });
    if (availablePositions.length == 0) {
      throw new BattleShipsError('Too many ships');
    }
    return randomChoice(availablePositions);
  }

  private allShipVectors(): Vector[] {
    return this.ships.map((ship) => ship.allVectors()).flat();
  }

  private aliveShips() {
    return this.ships.filter((ship) => !ship.sunk);
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
    while (this.state == BattleShipsState.Playing) {
      // Get Target
      const target = await this.display.promptTarget(this.targets);
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

      if (count == this.numberOfTurns) this.state = BattleShipsState.Lost;
      if (this.hasWon()) this.state = BattleShipsState.Won;
    }
  }

  private resetBattlefield() {
    this.targets = [];
    this.ships = [];
    this.createShips();
  }

  private draw(drawShips: boolean) {
    this.display.displayBattlefield(
      this.targets,
      this.allShipVectors(),
      drawShips
    );
  }

  public async run(debug = false) {
    this.display.displayTitle();
    this.state = BattleShipsState.Playing;
    while (this.state != BattleShipsState.Exit) {
      this.gameMode = await this.display.promptGameMode();
      this.resetBattlefield();
      this.draw(debug);
      await this.playLoop(debug);
      // Draw final battlefield to console
      this.draw(true);
      // Display if won or lose
      this.display.displayResult(this.state == BattleShipsState.Won);
      const playAgain = await this.display.promptPlayAgain();
      if (!playAgain) {
        this.state = BattleShipsState.Exit;
      }
    }
  }
}
