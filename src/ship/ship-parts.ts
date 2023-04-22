import { Vector } from '../models/vector';
import { IShipPart } from './ship-parts.interface';

export class ShipPart implements IShipPart {
  public hit: boolean;
  constructor(public vector: Vector) {}
}
