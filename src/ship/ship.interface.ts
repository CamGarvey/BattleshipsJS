import { Vector } from '../models/vector';
import { IShipPart } from './ship-parts.interface';

export interface IShip {
  sunk: boolean;
  parts: IShipPart[];
  checkHit: (vector: Vector) => number;
  allVectors: () => Vector[];
}
