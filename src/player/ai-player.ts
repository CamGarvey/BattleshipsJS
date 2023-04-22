import { Marray, MatrixHelper } from '../util';
import { ShootResponse } from '../models/shoot-response';
import { Vector } from '../models/vector';
import { IBattlefield } from '../battlefield/battlefield.interface';
import { IPlayer } from './player.interface';
import { ShootMessage } from '../models/shoot-message';
import { IMissileLauncher } from '../missile-launcher/missile-launcher.interface';

interface AIPlayerOptions {
  id: string;
  numberOfShips?: number;
  battlefield: IBattlefield;
  missileLauncher: IMissileLauncher;
}

class Shot {
  constructor(public coordinate: Vector, public distance: number) {}
}

export class AIPlayer implements IPlayer {
  private _id: string;
  private _isDead: boolean;
  private _battlefield: IBattlefield;
  private _missileLauncher: IMissileLauncher;
  private previousCoordinates: Vector[];
  private shots: Shot[];

  constructor({ id, battlefield, missileLauncher }: AIPlayerOptions) {
    this._id = id;
    this._battlefield = battlefield;
    this._missileLauncher = missileLauncher;
    this.shots = [];
    this.previousCoordinates = [];
  }

  public reset(): void {
    this.battlefield.reset();
    this.shots = [];
    this.previousCoordinates = [];
    this._isDead = false;
  }

  public get id() {
    return this._id;
  }

  public get isDead() {
    return this._isDead;
  }

  public get battlefield() {
    return this._battlefield;
  }

  public get missileLauncher() {
    return this._missileLauncher;
  }

  /**
   * Find the next target vector in a row of hit vectors
   * @param battlefield
   * @returns
   */
  private findHitPath(battlefield: IBattlefield): Vector[] {
    // Find all shots that have distance 0 aka hit
    const hits = this.shots.filter((shot) => shot.distance == 0);

    // Can only get the hit path if there 2 or more hits
    if (hits.length < 2) {
      return [];
    }

    // Wrk out if the path is vertical or horizontal by seeing if the rows are the same
    const isHorizontal = hits[0].coordinate.row == hits[1].coordinate.row;

    const potentialCoords: Vector[] = [];
    if (isHorizontal) {
      // Sort the hit by col
      const hitsOnRow = hits.sort(
        (a, b) => a.coordinate.col - b.coordinate.col
      );
      const left = hitsOnRow[0].coordinate.col - 1;
      const right = hitsOnRow[hitsOnRow.length - 1].coordinate.col + 1;

      if (left >= 0) {
        potentialCoords.push(new Vector(left, hits[0].coordinate.row));
      }
      if (right < battlefield.matrixShape.col) {
        potentialCoords.push(new Vector(right, hits[0].coordinate.row));
      }
    } else {
      // Sort the hit by row
      const allHitsOnCol = hits.sort(
        (a, b) => a.coordinate.row - b.coordinate.row
      );
      const top = allHitsOnCol[0].coordinate.row - 1;
      const bottom = allHitsOnCol[allHitsOnCol.length - 1].coordinate.row + 1;

      if (top >= 0) {
        potentialCoords.push(new Vector(hits[0].coordinate.col, top));
      }
      if (bottom < battlefield.matrixShape.row) {
        potentialCoords.push(new Vector(hits[0].coordinate.col, bottom));
      }
    }
    console.log(potentialCoords);

    return potentialCoords.filter(
      (c) => !this.shots.find((shot) => shot.coordinate.equals(c))
    );
  }

  promptCoordinates(battlefield: IBattlefield): Promise<Vector> {
    return new Promise((resolve, reject) => {
      const pickCoordinates = () => {
        // If shots is 0 then it's the beginning of the game or they have just sunk a ship
        if (this.shots.length == 0) {
          // Pick a random coordinate that hasn't been hit
          const coord = Marray.randomChoice(
            battlefield.allPositionsInMatrixShape.filter(
              (n) =>
                !this.battlefield.enemyCoordinates.find((pc) => pc.equals(n))
            )
          );
          this.previousCoordinates.push(coord);
          resolve(coord);
        } else {
          // Work out a good coord to shoot at
          const hitPath = this.findHitPath(battlefield);

          if (hitPath.length != 0) {
            const coord = Marray.randomChoice(hitPath);
            this.previousCoordinates.push(coord);
            resolve(coord);
          } else {

            // Sort shots bby distance so the first index is the closest
            this.shots.sort((a, b) => a.distance - b.distance);
            const neighbours = MatrixHelper.findNeighbours(
              battlefield.matrixShape,
              this.shots[0].coordinate,
              this.shots[0].distance == 0 ? 1 : this.shots[0].distance
            );
            const furthestNeighbour = neighbours.map((x) => x[x.length - 1]);

            const validNeighbours = furthestNeighbour.filter(
              (n) => !this.previousCoordinates.find((pc) => pc.equals(n))
            );
            console.log({ furthestNeighbour, validNeighbours });
            const coord = Marray.randomChoice(validNeighbours);
            this.previousCoordinates.push(coord);
            resolve(coord);
          }
        }
      };
      // Wrap in a timeout to make it feel more human
      setTimeout(() => {
        pickCoordinates();
      }, 500);
    });
  }

  handleTargetedResponse(response: ShootResponse): void {
    if (response.message() == ShootMessage.Hit) {
      this._isDead = this.battlefield.remainingShips().length == 0;
    }
  }

  handleShooterResponse(response: ShootResponse): void {
    if (response.sunk) {
      this.shots = [];
    } else {
      this.shots.push(
        new Shot(
          this.previousCoordinates[this.previousCoordinates.length - 1],
          response.distance
        )
      );
    }
  }

  displayMessage(_message: string): void {
    return;
  }

  displayBattlefields(
    _targetedBattlefield: IBattlefield,
    _ownBattlefield: IBattlefield
  ): void {
    return;
  }

  promptPlayAgain(): Promise<boolean> {
    // AI will never reject a game of Battleships!
    return new Promise((res) => res(true));
  }
}
