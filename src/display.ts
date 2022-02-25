import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import { GameMode } from './models/game-mode';
import { Ship } from './models/ship';
import { ShootMessage } from './models/shoot-message';
import { Vector } from './types';
import { isOutOfBounds } from './util';
export interface IDisplay {
  displayBattlefield: (
    targets: Vector[],
    allShipVectors: Vector[],
    drawShips: boolean
  ) => void;
  displayTitle: () => void;
  promptPlayAgain: () => Promise<boolean>;
  promptGameMode: () => Promise<GameMode>;
  promptTarget: (targets: Vector[]) => Promise<Vector>;
  displayShootMessage: (message: ShootMessage) => void;
  displayResult: (hasWon: boolean) => void;
  displayRemaining: (
    ships: Ship[],
    turnsHad: number,
    turnsAllowed: number
  ) => void;
}

abstract class Display implements IDisplay {
  constructor(protected matrixShape: Vector) {}
  public abstract promptPlayAgain(): Promise<boolean>;
  public abstract promptGameMode(): Promise<GameMode>;
  public abstract promptTarget(vector: Vector[]): Promise<Vector>;
  public abstract displayBattlefield(
    targets: Vector[],
    allShipVectors: Vector[],
    drawShips: boolean
  ): void;
  public abstract displayShootMessage(message: ShootMessage): void;
  public abstract displayResult(hasWon: boolean): void;
  public abstract displayTitle(): void;
  public abstract displayRemaining(
    ships: Ship[],
    turnsHad: number,
    turnsAllowed: number
  ): void;
}

export class ConsoleDisplay extends Display {
  public displayBattlefield(
    targets: Vector[],
    allShipVectors: Vector[],
    drawShips = false
  ) {
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
          if (targets.find((x) => x[0] == pos[0] && x[1] == pos[1])) {
            rowToDraw.push(chalk.red.bgYellow(' X '));
            continue;
          }
          if (drawShips) rowToDraw.push(chalk.black.underline.bgYellow('   '));
          else rowToDraw.push(chalk.blue.bgBlue('   '));
        } else {
          if (targets.find((x) => x[0] == pos[0] && x[1] == pos[1]))
            rowToDraw.push(chalk.red.bgBlue(' X '));
          else rowToDraw.push(chalk.blue.bgBlue('   '));
        }
      }
      console.log(rowToDraw.join(''));
    }
  }

  async promptPlayAgain() {
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

  async promptGameMode(): Promise<GameMode> {
    return inquirer.prompt([
      {
        name: 'mode',
        type: 'list',
        message: 'Game Mode?',
        choices: [GameMode.Easy.toString(), GameMode.Hard.toString()],
      },
    ]);
  }

  /**
   * Prompt user for the target they wish to shoot
   */
  public async promptTarget(targets: Vector[]): Promise<Vector> {
    const response = await inquirer.prompt([
      {
        type: 'input',
        name: 'target',
        message: 'SHOOT! (x,y) ',
        validate: async (value: string) => {
          value = value.trim();
          const re = new RegExp('^(\\d+,\\d+)$');
          if (!re.test(value)) return 'Invalid input';
          const vector = value.split(',').map((x) => parseInt(x)) as Vector;
          if (isOutOfBounds(this.matrixShape, vector)) return 'Out of bounds!';
          if (
            targets.find(
              (target) => target[0] == vector[0] && target[1] == vector[1]
            )
          )
            return 'Already shot there!';
          return true;
        },
      },
    ]);
    return response.target.split(',').map((x: string) => parseInt(x)) as Vector;
  }

  public displayShootMessage(message: ShootMessage): void {
    console.log(message);
  }

  public displayResult(hasWon: boolean): void {
    if (hasWon) console.log('You win!');
    else console.log('You lose!');
  }

  public displayTitle(): void {
    console.log('BattleshipsJS');
  }

  public displayRemaining(
    ships: Ship[],
    turnsHad: number,
    turnsAllowed: number
  ): void {
    console.log(
      `Ships remaining: ${ships.map((ship) => !ship.sunk).length}/${
        ships.length
      }`
    );
    console.log(`Turns remaining: ${turnsAllowed - turnsHad}/${turnsAllowed}`);
  }
}
