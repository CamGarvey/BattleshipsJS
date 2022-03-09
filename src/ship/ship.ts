import { Vector } from '../models/vector';
import { IShipPart } from './ship-parts.interface';
import { IShip } from './ship.interface';

export class Ship implements IShip {
  private sinkInOneHit: boolean;
  // lol private parts
  private _parts: IShipPart[];
  private _sunk: boolean;

  constructor({
    parts,
    sinkInOneHit = true,
  }: {
    parts: IShipPart[];
    sinkInOneHit: boolean;
  }) {
    this._parts = parts;
    this.sinkInOneHit = sinkInOneHit;
    this._sunk = false;
  }

  public get sunk(): boolean {
    return this._sunk;
  }

  public get parts(): IShipPart[] {
    return this._parts;
  }

  private hitParts() {
    return this._parts.filter((pos) => pos.hit);
  }

  public allVectors(): Vector[] {
    return this.parts.map((part) => part.vector);
  }

  /**
   * Checks if hit and returns distance
   * @param target
   * @returns
   */
  public checkHit(target: Vector) {
    let closest: number;
    this._parts.forEach((part) => {
      const distance =
        Math.abs(part.vector.col - target.col) +
        Math.abs(part.vector.row - target.row);
      if (distance == 0) {
        part.hit = true;
        if (this.sinkInOneHit || this.hitParts().length == this._parts.length) {
          this._sunk = true;
        }
        closest = distance;
        return;
      }
      if (closest == undefined || distance < closest) closest = distance;
    });
    return closest;
  }
}
