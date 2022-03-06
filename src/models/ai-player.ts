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
  dead: boolean;
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
          console.log(this.shots);

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
          if (validNeighbours.length == 0) console.error('oh shit');
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
}
