import { Vector } from './models/vector';

export class Marray {
  public static randomChoice<T>(array: T[]): T {
    if (!array.length) throw new Error('Can not choose from an empty array');
    return array[Math.floor(Math.random() * array.length)];
  }
}

export class MatrixHelper {
  public static allPositionsInMatrixShape(matrixShape: Vector) {
    const positions: Vector[] = [];
    for (let col = 0; col < matrixShape.col; col++) {
      for (let row = 0; row < matrixShape.row; row++) {
        positions.push(new Vector(col, row));
      }
    }
    return positions;
  }

  public static findLeftNeighbours(vector: Vector, size = 1): Vector[] {
    let neighbours: Vector[] = [];
    if (vector.col - size >= 0) {
      for (let index = vector.col - 1; index >= vector.col - size; index--) {
        neighbours.push(new Vector(index, vector.row));
      }
    } else {
      neighbours = [];
    }

    return neighbours;
  }

  public static findRightNeighbours(
    matrixShape: Vector,
    vector: Vector,
    size = 1
  ): Vector[] {
    let neighbours: Vector[] = [];
    if (vector.col + size < matrixShape.col) {
      for (let index = 1; index < size + 1; index++) {
        neighbours.push(new Vector(vector.col + index, vector.row));
      }
    } else {
      neighbours = [];
    }
    return neighbours;
  }

  public static findTopNeighbours(vector: Vector, size = 1): Vector[] {
    let neighbours: Vector[] = [];
    if (vector.row - size >= 0) {
      for (let index = vector.row - 1; index >= vector.row - size; index--) {
        neighbours.push(new Vector(vector.col, index));
      }
    } else {
      neighbours = [];
    }
    return neighbours;
  }

  public static findBottomNeighbours(
    matrixShape: Vector,
    vector: Vector,
    size = 1
  ): Vector[] {
    let neighbours: Vector[] = [];
    if (vector.row + size < matrixShape.row) {
      for (let index = 1; index < size + 1; index++) {
        neighbours.push(new Vector(vector.col, vector.row + index));
      }
    } else {
      neighbours = [];
    }
    return neighbours;
  }

  /**
   * Finds the neighbours of the given position
   * @param vector
   * @param size
   * @returns array of neighbour vectors
   */
  public static findNeighbours(
    matrixShape: Vector,
    vector: Vector,
    size = 1
  ): Vector[][] {
    console.log({ matrixShape, vector, size });

    let top: Vector[] = this.findTopNeighbours(vector, size);
    let bottom: Vector[] = this.findBottomNeighbours(matrixShape, vector, size);
    let left: Vector[] = this.findLeftNeighbours(vector, size);
    let right: Vector[] = this.findRightNeighbours(matrixShape, vector, size);
    // filter out empty arrays and return list
    return [top, bottom, left, right].filter((x) => x.length !== 0);
  }

  /**
   * Checks if pos given is out of the matrix shape
   * @param vector
   */
  public static isOutOfBounds(matrixShape: Vector, vector: Vector) {
    return (
      vector.col < 0 ||
      vector.col > matrixShape.col - 1 ||
      vector.row < 0 ||
      vector.row > matrixShape.row - 1
    );
  }
}
