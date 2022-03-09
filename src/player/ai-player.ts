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

  private find0DistancePath(battlefield: IBattlefield): Vector[] {
    const distance0Shots = this.shots
      .filter((shot) => shot.distance == 0)
      .sort((a, b) => a.distance - b.distance);

    if (distance0Shots.length < 2) {
      return [];
    }
    const isHorizontal =
      this.shots[0].coordinate.col == this.shots[1].coordinate.col;

    const potentialCoords: Vector[] = [];
    if (isHorizontal) {
      const allShotsOnRow = distance0Shots.sort(
        (a, b) => a.coordinate.col - b.coordinate.col
      );
      const left = allShotsOnRow[0].coordinate.col - 1;
      const right = allShotsOnRow[allShotsOnRow.length - 1].coordinate.col + 1;

      if (left >= 0) {
        potentialCoords.push(
          new Vector(left, distance0Shots[0].coordinate.row)
        );
      }
      if (right < battlefield.matrixShape.col) {
        potentialCoords.push(
          new Vector(right, distance0Shots[0].coordinate.row)
        );
      }
    } else {
      const allShotsOnCol = distance0Shots.sort(
        (a, b) => a.coordinate.row - b.coordinate.row
      );
      const top = allShotsOnCol[0].coordinate.row - 1;
      const bottom = allShotsOnCol[allShotsOnCol.length - 1].coordinate.row + 1;

      if (top >= 0) {
        potentialCoords.push(new Vector(distance0Shots[0].coordinate.col, top));
      }
      if (bottom < battlefield.matrixShape.row) {
        potentialCoords.push(
          new Vector(distance0Shots[0].coordinate.col, bottom)
        );
      }
    }
    return potentialCoords.filter(
      (c) => !this.shots.find((shot) => shot.coordinate.equals(c))
    );
  }

  promptCoordinates(battlefield: IBattlefield): Promise<Vector> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.shots.length == 0) {
          const coord = Marray.randomChoice(
            battlefield.allPositionsInMatrixShape.filter(
              (n) => !this.previousCoordinates.find((pc) => pc.equals(n))
            )
          );
          this.previousCoordinates.push(coord);
          resolve(coord);
        } else {
          // Work out a good coord to shoot at
          const distance0Path = this.find0DistancePath(battlefield);
          console.log(distance0Path);

          if (distance0Path?.length != 0) {
            const coord = Marray.randomChoice(distance0Path);
            this.previousCoordinates.push(coord);
            resolve(coord);
          } else {
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
            const coord = Marray.randomChoice(validNeighbours);
            this.previousCoordinates.push(coord);
            resolve(coord);
          }
        }
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
