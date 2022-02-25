import { Vector } from '../types';

class ShipPart {
  public hit: boolean;
  constructor(public vector: Vector) {}
}

interface IShip {
  checkHit: (vector: Vector) => number;
  allVectors: () => Vector[];
}

export class Ship implements IShip {
  // lol private parts
  private _parts: ShipPart[];
  private _sunk: boolean = false;

  constructor(private vectors: Vector[], private sinkInOneHit: boolean) {
    this._parts = vectors.map((x) => new ShipPart(x));
  }

  public get sunk(): boolean {
    return this._sunk;
  }

  public get parts(): ShipPart[] {
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
        Math.abs(part.vector[0] - target[0]) +
        Math.abs(part.vector[1] - target[1]);
      if (distance == 0) {
        part.hit = true;
        if (this.sinkInOneHit || this.hitParts().length == this._parts.length) {
          this._sunk = true;
        }
        closest = distance;
      }
      if (closest == undefined || distance < closest) closest = distance;
    });
    return closest;
  }
}
