import { Vector } from '../types';
import { Marray, MatrixHelper } from '../util';
import { IBattlefield } from './battlefield';
import { IPlayer } from './player';
import { ShootResponse } from './shoot-response';

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

  promptCoordinates(battlefield: IBattlefield): Promise<Vector> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.shots.length == 0) {
          const coord = Marray.randomChoice(
            battlefield.allPositionsInMatrixShape.filter(
              (n) =>
                !this.previousCoordinates.find(
                  (pc) => pc[0] == n[0] && pc[1] == n[1]
                )
            )
          );
          this.previousCoordinates.push(coord);
          resolve(coord);
        } else {
          // Work out a good coord to shoot at
          this.shots.sort((a, b) => a.distance - b.distance);

          if (this.shots.length > 1) {
            // check if last two were hits
            if (this.shots[0].distance == 0 && this.shots[1].distance == 0) {
              // Last two shots were hit, that means we know it's angle
              const testShot = this.shots[0];

              // check if rows are the same, if they are then it's horizontal
              const isHorizontal =
                this.shots[0].coordinate[1] == this.shots[1].coordinate[1];
              if (isHorizontal) {
                const allShotsOnTheRow = this.shots
                  .filter(
                    (shot) =>
                      shot.coordinate[1] == testShot.coordinate[1] &&
                      shot.distance == 0
                  )
                  .sort((a, b) => a.coordinate[0] - b.coordinate[0]);
                const potentialCoords = [];
                const left = allShotsOnTheRow[0].coordinate[0] - 1;
                const right =
                  allShotsOnTheRow[allShotsOnTheRow.length - 1].coordinate[0] +
                  1;
                if (left >= 0) {
                  potentialCoords.push([left, testShot.coordinate[1]]);
                }
                if (right < battlefield.matrixShape[0]) {
                  potentialCoords.push([right, testShot.coordinate[1]]);
                }
                console.log({
                  allShotsOnTheRow: allShotsOnTheRow.map((x) => x.coordinate),
                  potentialCoords,
                });
                const coord = Marray.randomChoice(potentialCoords);
                this.previousCoordinates.push(coord);
                resolve(coord);
              } else {
                const allShotsOnTheCol = this.shots
                  .filter(
                    (shot) =>
                      shot.coordinate[0] == testShot.coordinate[0] &&
                      shot.distance == 0
                  )
                  .sort((a, b) => a.coordinate[1] - b.coordinate[1]);
                const potentialCoords = [];
                const top = allShotsOnTheCol[0].coordinate[1] - 1;
                const bottom =
                  allShotsOnTheCol[allShotsOnTheCol.length - 1].coordinate[1] +
                  1;
                if (top >= 0) {
                  potentialCoords.push([testShot.coordinate[0], top]);
                }
                if (bottom < battlefield.matrixShape[1]) {
                  potentialCoords.push([testShot.coordinate[1], bottom]);
                }
                console.log({ allShotsOnTheCol, potentialCoords });
                const coord = Marray.randomChoice(potentialCoords);
                this.previousCoordinates.push(coord);
                resolve(coord);
              }
            }
          }
          const neighbours = MatrixHelper.findNeighbours(
            battlefield.matrixShape,
            this.shots[0].coordinate,
            this.shots[0].distance == 0 ? 1 : this.shots[0].distance
          );
          const furthestNeighbour = neighbours.map((x) => x[x.length - 1]);

          const validNeighbours = furthestNeighbour.filter(
            (n) =>
              !this.previousCoordinates.find(
                (pc) => pc[0] == n[0] && pc[1] == n[1]
              )
          );
          const coord = Marray.randomChoice(validNeighbours);
          this.previousCoordinates.push(coord);
          resolve(coord);
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
