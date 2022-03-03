import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import { Battlefield, IBattlefield } from './models/battlefield';
import { GameMode } from './models/game-mode';
import { Ship } from './models/ship';
import { ShootMessage } from './models/shoot-message';
import { Vector } from './types';
import { MatrixHelper } from './util';

export interface IDisplay {
  displayBattlefields: (
    targetedBattlefield: IBattlefield,
    ownBattlefield: IBattlefield
  ) => void;
  displayTitle: () => void;
  promptPlayAgain: () => Promise<boolean>;
  promptGameMode: () => Promise<GameMode>;
  promptCoordinates: (battlefield: IBattlefield) => Promise<Vector>;
  displayShootMessage: (message: ShootMessage) => void;
  displayResult: (hasWon: boolean) => void;
  displayRemaining: (
    ships: Ship[],
    turnsHad: number,
    turnsAllowed: number
  ) => void;
  displayMessage(message: string): void;
}

export enum ConsoleResolution {
  Small = 1,
  Medium = 3,
  Large = 5,
  XLarge = 7,
}

export class ConsoleDisplay implements IDisplay {
  _xRes: number;
  protected resolution: ConsoleResolution;
  protected gaps: boolean;
  protected alphabet = 'abcdefghijklmnopqrstuvwxyz';

  constructor(
    {
      resolution = ConsoleResolution.Medium,
      gaps = false,
    }: {
      resolution?: ConsoleResolution;
      gaps?: boolean;
    } = { resolution: ConsoleResolution.Medium, gaps: false }
  ) {
    this.resolution = resolution;
    this.gaps = gaps;
  }

  private createBattlefield(
    battlefield: IBattlefield,
    drawUnHitShips: boolean
  ) {
    const allShipParts = battlefield.ships.map((ship) => ship.parts).flat();
    const rows: any[][] = [];
    for (let col = 0; col < battlefield.matrixShape[1]; col++) {
      let rowToDraw: any[] = [];
      for (let row = 0; row < battlefield.matrixShape[0]; row++) {
        const pos: Vector = [row, col];
        if (
          allShipParts.find(
            (x) => x.vector[0] == pos[0] && x.vector[1] == pos[1]
          )
        ) {
          if (
            battlefield.enemyCoordinates.find(
              (x) => x[0] == pos[0] && x[1] == pos[1]
            )
          ) {
            rowToDraw.push(this.createHitShip());
            continue;
          }
          if (drawUnHitShips) rowToDraw.push(this.createShip());
          else rowToDraw.push(this.createOcean());
        } else {
          if (
            battlefield.enemyCoordinates.find(
              (x) => x[0] == pos[0] && x[1] == pos[1]
            )
          )
            rowToDraw.push(this.createHitOcean());
          else rowToDraw.push(this.createOcean());
        }
      }
      rows.push(rowToDraw);
    }
    return this.doTheThing(rows);
  }

  private doTheThing(rows: string[][]): string[] {
    const numberColGap = this.hPadding(2, { draw: false });
    const lines = [`${numberColGap + this.createTop(rows[0].length)}`];
    rows.forEach((row, idx) => {
      if (this.gaps) lines.push(...this.vPadding(1, { draw: false }));

      for (let index = 0; index < this.resolution; index++) {
        const line = [];
        if (index == Math.floor(this.resolution / 2)) {
          line.push(idx + this.hPadding(1, { draw: false }));
        } else {
          line.push(this.hPadding(2, { draw: false }));
        }
        row.forEach((col) => {
          for (let index = 0; index < this.xRes; index++) {
            line.push(col);
          }
          if (this.gaps) line.push(this.hPadding(1, { draw: false }));
        });
        // if (this.gaps) line.push(this.hPadding(1, { draw: false }));
        lines.push(line.join(''));
      }
    });
    return lines;
  }

  public displayBattlefields(
    targetedBattlefield: IBattlefield,
    ownBattlefield: IBattlefield
  ): void {
    // this.drawFieldTitle(battlefield);
    const ownBattlefieldRows = this.createBattlefield(ownBattlefield, true);
    const targetedBattlefieldRows = this.createBattlefield(
      targetedBattlefield,
      false
    );

    const largerField =
      targetedBattlefieldRows.length >= ownBattlefieldRows.length
        ? targetedBattlefieldRows
        : ownBattlefieldRows;

    const smallerField =
      targetedBattlefield.matrixShape[0] <= ownBattlefield.matrixShape[0]
        ? targetedBattlefield
        : ownBattlefield;

    this.vPadding();
    for (let index = 0; index < largerField.length; index++) {
      let targetRow = targetedBattlefieldRows[index];
      if (targetRow == undefined) {
        targetRow = targetedBattlefieldRows[2]
          .replace('[34m', ' ')
          .replace('[44m', ' ')
          .replace('[39m', ' ')
          .replace('[49m', ' ');
      }
      const ownRow =
        ownBattlefieldRows[index] == undefined ? '' : ownBattlefieldRows[index];
      console.log(`${targetRow}    ${ownRow}`);
    }
    this.vPadding();
  }

  protected createHitShip() {
    return chalk.red.bgYellow('X');
  }

  protected createShip() {
    return chalk.black.bgYellow(' ');
  }

  protected createOcean() {
    return chalk.blue.bgBlue(' ');
  }

  protected createHitOcean() {
    return chalk.red.bgBlue('X');
  }

  protected drawFieldTitle(battlefield: any) {
    console.log(`\n\n    ${battlefield.id} field`);
  }

  private createTop(topLength: number): string {
    const spaces = Array.from(
      { length: Math.floor(this.xRes / 2) },
      () => ' '
    ).join('');

    const alph = Array.from(
      { length: topLength },
      (_, idx) => spaces + this.alphabet[idx] + spaces
    );
    return alph.join(this.gaps ? ' ' : '');
  }

  private get xRes() {
    if (this._xRes) return this._xRes;
    if (this.resolution == 1) {
      this._xRes = 1;
      return this._xRes;
    }
    let res = Math.ceil(this.resolution * 2);
    res += res % 2 == 0 ? 1 : 0;
    this._xRes = res;
    return this._xRes;
  }

  private vPadding(n = 1, { draw }: { draw: boolean } = { draw: true }) {
    const lines = [];
    for (let _ = 0; _ < n; _++) {
      if (draw) {
        console.log();
      } else {
        lines.push('');
      }
    }
    return lines;
  }

  private hPadding(n = 1, { draw }: { draw: boolean } = { draw: true }) {
    const pad = Array.from({ length: n }, () => ' ').join('');
    if (draw) console.log(pad);
    return pad;
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
    const response = await inquirer.prompt([
      {
        name: 'mode',
        type: 'list',
        message: 'Game Mode?',
        choices: [GameMode.Easy, GameMode.Hard],
      },
    ]);
    return response['mode'];
  }

  /**
   * Prompt user for the target they wish to shoot
   */
  public async promptCoordinates(battlefield: IBattlefield): Promise<Vector> {
    const response = await inquirer.prompt([
      {
        type: 'input',
        name: 'coordinates',
        message: 'SHOOT! (x,y) ',
        validate: async (value: string) => {
          value = value.trim();
          const re = new RegExp(/^([a-zA-Z]{1},\d+)$/);
          if (!re.test(value)) return 'Invalid input';
          const split = value.split(',');
          let vector: Vector = [0, 0];
          vector[0] = this.alphabet.indexOf(split[0]);
          vector[1] = parseInt(split[1]);
          console.log(vector);

          if (MatrixHelper.isOutOfBounds(battlefield.matrixShape, vector))
            return 'Out of bounds!';
          if (
            battlefield.enemyCoordinates.find(
              (coordinate) =>
                coordinate[0] == vector[0] && coordinate[1] == vector[1]
            )
          )
            return 'Already shot there!';
          return true;
        },
      },
    ]);
    const split = response.coordinates.split(',');
    let vector: Vector = [0, 0];
    vector[0] = this.alphabet.indexOf(split[0]);
    vector[1] = parseInt(split[1]);
    return vector as Vector;
  }

  public displayMessage(message: string): void {
    console.log(message);
  }

  public displayShootMessage(message: ShootMessage): void {
    console.log(message);
  }

  public displayResult(hasWon: boolean): void {
    if (hasWon) console.log('You win!');
    else console.log('You lose!');
  }

  public displayTitle(): void {
    console.log(chalk.cyanBright('BattleshipsJS\n'));
  }

  public displayRemaining(
    ships: Ship[],
    turnsHad: number,
    turnsAllowed: number
  ): void {
    const remaining = ships.filter((ship) => !ship.sunk).length;
    console.log(`Ships remaining: ${remaining}/${ships.length}`);
    console.log(`Turns remaining: ${turnsAllowed - turnsHad}/${turnsAllowed}`);
  }
}
