import { Marray, MatrixHelper } from '../util';
import { IBattlefield } from './battlefield';
import { IPlayer } from './player';
import { ShootResponse } from './shoot-response';
import { Vector } from './vector';

interface AIPlayerOptions {
  id: string;
  numberOfShips?: number;
  battlefield: IBattlefield;
}

class Shot {
  constructor(public coordinate: Vector, public distance: number) {}
}

export class AIPlayer implements IPlayer {
  id: string;
  isDead: boolean;
  battlefield: IBattlefield;
  previousCoordinates: Vector[];
  shots: Shot[];

  constructor({ id, battlefield }: AIPlayerOptions) {
    this.id = id;
    this.battlefield = battlefield;
    this.shots = [];
    this.previousCoordinates = [];
  }

  private find0DistancePath(battlefield: IBattlefield) {
    const distance0Shots = this.shots
      .filter((shot) => shot.distance == 0)
      .sort((a, b) => a.distance - b.distance);

    if (distance0Shots.length < 2) {
      return;
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

          if (distance0Path) {
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
    return;
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
