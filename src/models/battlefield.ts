import { Vector } from '../types';
import { Marray, MatrixHelper } from '../util';
import { BattleshipsError } from './errors';
import { IShip, Ship } from './ship';

export interface IBattlefield {
  id: string;
  ships: IShip[];
  matrixShape: Vector;
  enemyCoordinates: Vector[];
  createShips: () => void;
  remainingShips: () => IShip[];
}

interface IShipMeta {
  length: number;
}

interface IBattlefieldOptions {
  id: string;
  matrixShape: Vector;
  ships: IShipMeta[];
}

export class Battlefield implements IBattlefield {
  public id: string;
  public ships: IShip[];
  public matrixShape: Vector;
  private allPositionsInMatrixShape: Vector[];
  private shipMeta: IShipMeta[];
  enemyCoordinates: Vector[] = [];

  constructor({ id, matrixShape, ships }: IBattlefieldOptions) {
    this.id = id;
    this.matrixShape = matrixShape;
    this.shipMeta = ships;
    this.allPositionsInMatrixShape = MatrixHelper.allPositionsInMatrixShape(
      this.matrixShape
    );
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
      return !takenSpots.find((x) => x[0] == vec[0] && x[1] == vec[1]);
    });
    if (availablePositions.length == 0) {
      throw new BattleshipsError('Too many ships');
    }
    return Marray.randomChoice(availablePositions);
  }

  public createShips() {
    this.ships = [];
    this.shipMeta.forEach((option) => {
      this.createShip(option.length);
    });
  }

  /**
   * Finds free place for a new ship and creates a new one at that position
   * @param takenSpots
   * @param length
   * @param sinkInOneHit
   * @returns
   */
  private createShip(lengthOfShip: number) {
    let tries = 0;
    const takenSpots = this.allShipVectors();
    while (
      tries <
      this.matrixShape[0] * this.matrixShape[1] - takenSpots.length
    ) {
      const head = this.pickShipHead(
        this.allPositionsInMatrixShape,
        takenSpots
      );
      if (lengthOfShip == 1) {
        return new Ship({
          vectors: [head],
          sinkInOneHit: true,
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
        return !body.find((vector) =>
          takenSpots.find((x) => x[0] == vector[0] && x[1] == vector[1])
        );
      });

      if (validBodies.length != 0)
        return new Ship({
          vectors: [head, ...Marray.randomChoice(validBodies)],
          sinkInOneHit: true,
        });
      tries = tries + 1;
    }
    throw new BattleshipsError('Failed to create ship - no room');
  }
}
