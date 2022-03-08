import { Vector } from '../models/vector';
import { IShip } from '../ship/ship.interface';

export interface IBattlefield {
  id: string;
  ships: IShip[];
  matrixShape: Vector;
  allPositionsInMatrixShape: Vector[];
  enemyCoordinates: Vector[];
  createShips: () => void;
  remainingShips: () => IShip[];
}
