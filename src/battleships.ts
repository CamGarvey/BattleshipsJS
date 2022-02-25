import { Ship } from './models/ship';
import { ShootResponse } from './models/shoot-response';
import { Vector } from './types';
import { allPositionsInMatrixShape, randomChoice } from './util';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';
import { GameMode } from './models/game-mode';
import { IDisplay } from './display';

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
    private numberOfTurns = 20
  ) {
    if (lengthOfShips > matrixShape[0] && lengthOfShips > matrixShape[1]) {
      throw new BattleShipsError('Ships too big');
    }
    this.state = BattleShipsState.Idle;
    this.ships = [];
    this.targets = [];
    this.positionsInMatrix = allPositionsInMatrixShape(matrixShape);
  }

  private createShips() {
    for (let _ = 0; _ < this.numberOfShips; _++) {
      const ship = this.createShip([], this.lengthOfShips, this.sinkInOneHit);
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
  private createShip(
    takenSpots: Vector[] = [],
    length = 2,
    sinkInOneHit = true
  ) {
    if (length <= 0) {
      throw new BattleShipsError('Ship must be at least 1 in length');
    }
    let tries = 0;
    while (
      tries <
      this.matrixShape[0] * this.matrixShape[1] - takenSpots.length
    ) {
      const head = this.pickShipHead(takenSpots);
      if (length == 1) {
        return new Ship([head], sinkInOneHit);
      }
      const potentialBodies: Vector[][] = this.findNeighbours(head, length - 1);
      // filter out bodies that have positions taken
      const validBodies = potentialBodies.filter((body) => {
        // make sure that bodies are not in take positions
        return !body.find((vector) =>
          takenSpots.find((x) => x[0] == vector[0] && x[1] == vector[1])
        );
      });
      if (validBodies.length != 0)
        return new Ship([head, ...randomChoice(validBodies)], sinkInOneHit);
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

  /**
   * This draws the battlefield to console
   * @param drawShips
   */
  public drawBattlefield(drawShips = false) {
    const allShipVectors = this.allShipVectors();
    const top = Array.from(
      { length: this.matrixShape[1] },
      (_, idx) => ` ${idx} `
    );
    console.log(' ' + top.join(''));
    for (let col = 0; col < this.matrixShape[1]; col++) {
      let rowToDraw = [col.toString()];
      for (let row = 0; row < this.matrixShape[0]; row++) {
        const pos: Vector = [row, col];
        if (allShipVectors.find((x) => x[0] == pos[0] && x[1] == pos[1])) {
          if (this.targets.find((x) => x[0] == pos[0] && x[1] == pos[1])) {
            rowToDraw.push(chalk.red.bgYellow(' X '));
            continue;
          }
          if (drawShips) rowToDraw.push(chalk.black.underline.bgYellow('   '));
          else rowToDraw.push(chalk.blue.bgBlue('   '));
        } else {
          if (this.targets.find((x) => x[0] == pos[0] && x[1] == pos[1]))
            rowToDraw.push(chalk.red.bgBlue(' X '));
          else rowToDraw.push(chalk.blue.bgBlue('   '));
        }
      }
      console.log(rowToDraw.join(''));
    }
  }

  /**
   * Checks if pos given is out of the matrix shape
   * @param vector
   */
  private isOutOfBounds(vector: Vector) {
    return (
      vector[0] < 0 ||
      vector[0] > this.matrixShape[0] - 1 ||
      vector[1] < 0 ||
      vector[1] > this.matrixShape[1] - 1
    );
  }

  /**
   * Prompt user for the target they wish to shoot
   */
  private async promptTarget(): Promise<Vector> {
    return inquirer
      .prompt([
        {
          type: 'input',
          name: 'target',
          message: 'SHOOT! (x,y) ',
          validate: (value: string) => {
            value = value.trim();
            const re = new RegExp('^(\\d+,\\d+)$');
            if (!re.test(value)) return 'Invalid input';
            const vector = value.split(',').map((x) => parseInt(x)) as Vector;
            if (this.isOutOfBounds(vector)) 'Out of bounds!';
            if (this.targets.includes(vector)) 'Already shot there!';
            return true;
          },
        },
      ])
      .then((value: { target: string }) => {
        return value.target.split(',').map((x) => parseInt(x)) as Vector;
      });
  }
  // def _prompt_target(self):
  //   """Prompt user for the target they wish to shoot"""
  //   try:
  //       ans = input('SHOOT! (x,y): ')
  //       # Just want the x,y
  //       pos = tuple([int(i) for i in ans.split(',')][:2])
  //       if self._is_out_of_bounds(pos):
  //           raise BattleShipsException('Out of bounds!')
  //       if pos in self._targets:
  //           raise BattleShipsException("You've already shot there..")
  //       return pos
  //   except BattleShipsException as error:
  //       print(error)
  //       return self._prompt_target()
  //   except Exception:
  //       print('invalid input')
  //       return self._prompt_target()

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

  // def _prompt_yes_no(self, msg):
  //   """Returns true if y, false if n"""
  //   try:
  //       ans = input(f'{msg} (y/n): ').strip()
  //       if ans not in ['y', 'n']:
  //           raise BattleShipsException('Please use y/n')
  //       return ans == 'y'
  //   except BattleShipsException as error:
  //       print(error)
  //       return self._prompt_yes_no(msg)
  //   except Exception:
  //       print('invalid input')
  //       return self._prompt_yes_no(msg)

  private async playLoop(debug = false) {
    let count = 0;
    while (this.state == BattleShipsState.Playing) {
      // Get Target
      const target = await this.promptTarget();
      // Add new target to previous targets
      this.targets.push(target);
      // Shoot at target
      const response = this.shoot(target);
      // Print out response message
      console.log(response.message());
      // Draw Battlefield to console
      this.drawBattlefield(debug);
      // Print Ships remaining
      // console.log(`${this.ships.length - l[s for s in self._ships if s.sunk])}/{len(self._ships)} ships remaining')
      count++;
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

  private async promptPlayAgain() {
    return inquirer
      .prompt([
        {
          name: 'playAgain',
          message: 'Play Again?',
          type: 'confirm',
        },
      ])
      .then((value) => {
        return value.message == 'Yes';
      });
  }

  private async promptGameMode(): Promise<GameMode> {
    return inquirer.prompt([
      {
        name: 'mode',
        type: 'list',
        message: 'Game Mode?',
        choices: [GameMode.Easy.toString(), GameMode.Hard.toString()],
      },
    ]);
  }

  public async run(debug = false) {
    this.state = BattleShipsState.Playing;
    while (this.state != BattleShipsState.Exit) {
      this.gameMode = await this.promptGameMode();
      this.resetBattlefield();
      this.drawBattlefield(debug);
      await this.playLoop(debug);
      // Draw final battlefield to console
      this.drawBattlefield(true);
      // Display if won or lose
      if (this.state == BattleShipsState.Won) console.log('You win!');
      else console.log('You loose!');
      this.drawBattlefield(true);
      const playAgain = await this.promptPlayAgain();
      if (!playAgain) {
        this.state = BattleShipsState.Exit;
      }
    }
  }
}
