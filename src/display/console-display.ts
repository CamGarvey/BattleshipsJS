import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import { Vector } from '../models/vector';
import { MatrixHelper } from '../util';
import { IBattlefield } from '../battlefield/battlefield.interface';
import { IDisplay } from './display.interface';

export enum ConsoleResolution {
  Tiny = 1,
  Small = 2,
  Medium = 3,
  Large = 5,
  XLarge = 7,
}

export class ConsoleDisplay implements IDisplay {
  _xResolution: number;
  protected vResolution: ConsoleResolution;
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
    this.vResolution = resolution;
    this.gaps = gaps;
  }

  /**
   *
   * @param battlefield
   * @param drawUnHitShips Set true to draw unhit ships
   * @returns
   */
  private createBattlefield(
    battlefield: IBattlefield,
    drawUnHitShips: boolean
  ) {
    // Get all ship parts
    const allShipParts = battlefield.ships.map((ship) => ship.parts).flat();
    const rows: any[][] = [];

    // Loop over all of the vectors in the matrix
    for (let col = 0; col < battlefield.matrixShape.row; col++) {
      let rowToDraw: any[] = [];
      for (let row = 0; row < battlefield.matrixShape.col; row++) {
        const currentVector = new Vector(row, col);

        // Check if the current vector is a ship
        const isShipVector = allShipParts.find((x) =>
          x.vector.equals(currentVector)
        );
        if (isShipVector) {
          // The Vector is a ship
          // Check if the vector in the list of enemyCoordinate / is it a "hit" ship
          const isHitShipVector = battlefield.enemyCoordinates.find((x) =>
            x.equals(currentVector)
          );

          if (isHitShipVector) {
            rowToDraw.push(this.createHitShip());
            continue;
          }

          if (drawUnHitShips) {
            rowToDraw.push(this.createShip());
          } else {
            // The vector is an unhit ship but going to draw it as a ocean
            rowToDraw.push(this.createOcean());
          }
        } else {
          const isEnemyVector = battlefield.enemyCoordinates.find((x) =>
            x.equals(currentVector)
          );

          if (isEnemyVector) {
            // The vector is a hit ocean
            rowToDraw.push(this.createHitOcean());
          } else {
            // The vector is an unhit oecean
            rowToDraw.push(this.createOcean());
          }
        }
      }
      rows.push(rowToDraw);
    }
    return this.translateToConsole(rows);
  }

  private translateToConsole(rows: string[][]): string[] {
    // Gap between the number col and battlefield
    const numberColGap = this.hPadding(2, { draw: false });

    const lines = [];

    // Create the top row which contains the letters
    const topRow = `${numberColGap + this.createTop(rows[0].length)}`;
    lines.push(topRow);

    rows.forEach((row, idx) => {
      if (this.gaps) {
        // Add vertical space/padding between row
        // _
        // X
        // X
        // X
        lines.push(...this.vPadding(1, { draw: false }));
      }

      // Executing the following for vResolution to gain vertical size
      // e.g a vResolution of 3
      //
      // X -> X
      //      X
      //      X
      //
      for (let index = 0; index < this.vResolution; index++) {
        const currentLine = [];

        const isCenterOfResolution = index == Math.floor(this.vResolution / 2);
        if (isCenterOfResolution) {
          // Draw the row number
          currentLine.push(idx + this.hPadding(1, { draw: false }));
        } else {
          // Add horizontal padding to push the battlefield out far enough
          // to accommodate for the row numbers that get added above
          currentLine.push(this.hPadding(2, { draw: false }));
        }

        // Loop over each col in row
        row.forEach((col) => {
          // Adding the col for xRes to gain horizontal size
          // e.g a Resolution of 3
          //
          // X -> XXX
          //
          // Combining both X & Y resolutions and you get
          //
          // X -> XXX
          //      XXX
          //      XXX
          //
          for (let index = 0; index < this.xResolution; index++) {
            currentLine.push(col);
          }

          if (this.gaps) {
            // After adding all of the cols
            // add a gap
            //
            // XXX|
            currentLine.push(this.hPadding(1, { draw: false }));
          }
        });
        lines.push(currentLine.join(''));
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

    const gap = this.gaps ? targetedBattlefield.matrixShape.col : 0;

    const lengthOfTargetedBattleField =
      targetedBattlefield.matrixShape.col * (this.vResolution * 2) +
      targetedBattlefield.matrixShape.col +
      2 +
      gap;

    const lengthOfOwnBattleField =
      ownBattlefield.matrixShape.col * (this.vResolution * 2) + 5 + gap;

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

    this.vPadding();

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
      { length: Math.floor(this.xResolution / 2) },
      () => ' '
    ).join('');

    const alph = Array.from(
      { length: topLength },
      (_, idx) => spaces + this.alphabet[idx] + spaces
    );
    return alph.join(this.gaps ? ' ' : '');
  }

  private get xResolution() {
    if (this._xResolution) return this._xResolution;
    // if (this.vResolution == 1) {
    //   this._xResolution = 1;
    //   return this._xResolution;
    // }
    let res = Math.ceil(this.vResolution * 2);
    res += res % 2 == 0 ? 1 : 0;
    this._xResolution = res;
    return this._xResolution;
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
