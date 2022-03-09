export class Vector {
  constructor(public col: number, public row: number) {}
  toString() {
    return {
      col: this.col,
      row: this.row,
    };
  }

  equals(other: Vector) {
    return this.row == other.row && this.col == other.col;
  }
}
