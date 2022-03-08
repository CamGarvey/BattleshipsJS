import { Marray, MatrixHelper } from '../util';
import { BattleshipsError } from '../models/errors';
import { Vector } from '../models/vector';
import { IBattlefield } from './battlefield.interface';
import { Ship } from '../ship/ship';
import { IShip } from '../ship/ship.interface';
import { IShipMeta } from '../ship/ship-meta.interface';
import { IShipGenerator } from '../ship/ship-generator/ship-generator.interface';

interface BattlefieldOptions {
  id: string;
  matrixShape: Vector;
  ships: IShipMeta[];
  shipGenerator: IShipGenerator;
}

export class Battlefield implements IBattlefield {
  public id: string;
  public ships: IShip[];
  public matrixShape: Vector;
  private _allPositionsInMatrixShape: Vector[];
  private shipMeta: IShipMeta[];
  enemyCoordinates: Vector[] = [];
  private shipGenerator: IShipGenerator;

  constructor({ id, matrixShape, ships, shipGenerator }: BattlefieldOptions) {
    this.id = id;
    this.matrixShape = matrixShape;
    this.shipMeta = ships;
    this.shipGenerator = shipGenerator;
  }

  public get allPositionsInMatrixShape() {
    if (this._allPositionsInMatrixShape == undefined) {
      this._allPositionsInMatrixShape = MatrixHelper.allPositionsInMatrixShape(
        this.matrixShape
      );
    }
    return this._allPositionsInMatrixShape;
  }

  public allShipVectors(): Vector[] {
    return this.ships.map((ship) => ship.allVectors()).flat();
  }

  public remainingShips() {
    return this.ships.filter((ship) => !ship.sunk);
  }

  /**
   * Picks a pos in the in battlefield that is not in the taken spots list
   * @param takenSpots
   */
  private pickShipHead(
    allPositionsInMatrixShape: Vector[],
    takenSpots: Vector[] = []
  ): Vector {
    const availablePositions = allPositionsInMatrixShape.filter((vec) => {
      return !takenSpots.find((x) => x.equals(vec));
    });
    if (availablePositions.length == 0) {
      throw new BattleshipsError('Too many ships');
    }
    return Marray.randomChoice(availablePositions);
  }

  public createShips() {
    this.ships = [];
    this.shipMeta.forEach((option) => {
      const sinkInOne = option.sinkInOne == undefined ? true : option.sinkInOne;
      this.ships.push(this.createShip(option.length, sinkInOne));
    });
  }

  /**
   * Finds free place for a new ship and creates a new one at that position
   * @param takenSpots
   * @param length
   * @param sinkInOneHit
   * @returns
   */
  private createShip(lengthOfShip: number, sinkInOne: boolean) {
    let tries = 0;
    const takenSpots = this.allShipVectors();
    while (
      tries <
      this.matrixShape.col * this.matrixShape.row - takenSpots.length
    ) {
      const head = this.pickShipHead(
        this.allPositionsInMatrixShape,
        takenSpots
      );
      if (lengthOfShip == 1) {
        return new Ship({
          vectors: [head],
          sinkInOneHit: sinkInOne,
        });
      }
      const potentialBodies: Vector[][] = MatrixHelper.findNeighbours(
        this.matrixShape,
        head,
        lengthOfShip - 1
      );
      // filter out bodies that have positions taken
      const validBodies = potentialBodies.filter((body) => {
        // make sure that bodies are not in take positions
        return !body.find((vector) => takenSpots.find((x) => x.equals(vector)));
      });

      if (validBodies.length != 0)
        return new Ship({
          vectors: [head, ...Marray.randomChoice(validBodies)],
          sinkInOneHit: sinkInOne,
        });
      tries = tries + 1;
    }
    throw new BattleshipsError('Failed to create ship - no room');
  }
}
