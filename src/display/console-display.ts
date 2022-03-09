import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import { GameMode } from '../models/game-mode';
import { Ship } from '../ship/ship';
import { ShootMessage } from '../models/shoot-message';
import { Vector } from '../models/vector';
import { MatrixHelper } from '../util';
import { IBattlefield } from '../battlefield/battlefield.interface';
import { IDisplay } from './display.interface';

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
    for (let col = 0; col < battlefield.matrixShape.row; col++) {
      let rowToDraw: any[] = [];
      for (let row = 0; row < battlefield.matrixShape.col; row++) {
        const pos: Vector = new Vector(row, col);
        if (allShipParts.find((x) => x.vector.equals(pos))) {
          if (battlefield.enemyCoordinates.find((x) => x.equals(pos))) {
            rowToDraw.push(this.createHitShip());
            continue;
          }
          if (drawUnHitShips) rowToDraw.push(this.createShip());
          else rowToDraw.push(this.createOcean());
        } else {
          if (battlefield.enemyCoordinates.find((x) => x.equals(pos)))
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
        lines.push(line.join(''));
      }
    });
    return lines;
  }

  public async promptBool(message: string) {
    const response = await inquirer.prompt([
      {
        name: 'confirm',
        message,
        type: 'confirm',
      },
    ]);
    return response.confirm;
  }

  public displayBattlefields(
    targetedBattlefield: IBattlefield,
    ownBattlefield: IBattlefield,
    drawAllShips = false
  ): void {
    // this.drawFieldTitle(battlefield);
    const ownBattlefieldRows = this.createBattlefield(ownBattlefield, true);
    const targetedBattlefieldRows = this.createBattlefield(
      targetedBattlefield,
      drawAllShips
    );

    const largerField =
      targetedBattlefieldRows.length >= ownBattlefieldRows.length
        ? targetedBattlefieldRows
        : ownBattlefieldRows;

    const smallerField =
      targetedBattlefield.matrixShape.col <= ownBattlefield.matrixShape.col
        ? targetedBattlefield
        : ownBattlefield;

    this.vPadding();

    const gap = this.gaps ? targetedBattlefield.matrixShape.col : 0;

    const lengthOfTargetedBattleField =
      targetedBattlefield.matrixShape.col * (this.resolution * 2) +
      targetedBattlefield.matrixShape.col +
      2 +
      gap;

    const lengthOfOwnBattleField =
      ownBattlefield.matrixShape.col * (this.resolution * 2) + 5 + gap;

    const spaceBetweenBattlefields = 10;
    const spaceBetweenBattlefieldsDrawn = this.hPadding(
      spaceBetweenBattlefields,
      { draw: false }
    );

    const targetBattlefieldHeading =
      this.hPadding(
        Math.ceil(
          lengthOfTargetedBattleField / 2 - targetedBattlefield.id.length / 2
        ),
        { draw: false }
      ) +
      targetedBattlefield.id +
      this.hPadding(
        Math.ceil(
          lengthOfTargetedBattleField / 2 - targetedBattlefield.id.length / 2
        ),
        { draw: false }
      );

    const ownBattlefieldHeading =
      this.hPadding(
        Math.ceil(lengthOfOwnBattleField / 2 - ownBattlefield.id.length / 2),
        { draw: false }
      ) +
      ownBattlefield.id +
      this.hPadding(
        Math.ceil(lengthOfOwnBattleField / 2 - ownBattlefield.id.length / 2),
        { draw: false }
      );

    console.log(
      `${targetBattlefieldHeading}${spaceBetweenBattlefieldsDrawn}${ownBattlefieldHeading}`
    );

    for (let index = 0; index < largerField.length; index++) {
      let targetRow = targetedBattlefieldRows[index];
      if (targetRow == undefined) {
        // This means there is no more rows on the left/target battlefield
        // Create an imaginary row out of spaces
        targetRow = this.hPadding(lengthOfTargetedBattleField, { draw: false });
      }
      const ownRow =
        ownBattlefieldRows[index] == undefined ? '' : ownBattlefieldRows[index];

      console.log(`${targetRow}${spaceBetweenBattlefieldsDrawn}${ownRow}`);
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

  /**
   * Prompt user for the target they wish to shoot
   */
  public async promptCoordinates(battlefield: IBattlefield): Promise<Vector> {
    const response = await inquirer.prompt([
      {
        type: 'input',
        name: 'coordinates',
        message: 'SHOOT! (e.g a2) ',
        validate: async (value: string) => {
          value = value.trim();

          // Test value is made up of a single letter and number(s)
          // e.g a2, b3, b10
          const re = new RegExp(/^([a-zA-Z]{1}\d+)$/);
          if (!re.test(value)) return 'Invalid input';

          const number = parseInt(value.slice(1));
          const letter = value[0];
          const letterIndex = this.alphabet.indexOf(letter);

          const vector = new Vector(letterIndex, number);

          // Check vector is within bounds of the battlefield matrix shape
          if (MatrixHelper.isOutOfBounds(battlefield.matrixShape, vector)) {
            return 'Out of bounds!';
          }

          // Check that the battlefield doesn't contain vector
          if (
            battlefield.enemyCoordinates.find((coordinate) =>
              coordinate.equals(vector)
            )
          ) {
            return 'Already shot there!';
          }
          return true;
        },
      },
    ]);
    const number = response.coordinates.slice(1);
    let vector: Vector = new Vector(
      this.alphabet.indexOf(response.coordinates[0]),
      parseInt(number)
    );
    return vector;
  }

  public displayMessage(message: string): void {
    console.log(message);
  }
}
