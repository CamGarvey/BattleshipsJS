import { ShipPart } from '../models/ship-part';
import { Vector } from '../models/vector';

export interface IShip {
  sunk: boolean;
  parts: ShipPart[];
  checkHit: (vector: Vector) => number;
  allVectors: () => Vector[];
}
