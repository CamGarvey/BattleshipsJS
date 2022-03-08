import { Vector } from '../models/vector';
import { IShipMeta } from '../ship/ship-meta.interface';
import { IShip } from '../ship/ship.interface';

export interface IShipGenerator {
  createShip(
    matrixShape: Vector,
    availableVectors: Vector[],
    shipMeta: IShipMeta
  ): IShip;
}
