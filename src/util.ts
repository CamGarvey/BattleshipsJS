import { Vector } from './types';

export class Marray {
  public static randomChoice<T>(array: T[]): T {
    if (!array.length) throw new Error('Can not choose from an empty array');
    return array[Math.floor(Math.random() * array.length)];
  }
}

export class MatrixHelper {
  public static allPositionsInMatrixShape(matrixShape: Vector) {
    const positions: Vector[] = [];
    for (let col = 0; col < matrixShape[0]; col++) {
      for (let row = 0; row < matrixShape[1]; row++) {
        positions.push([col, row]);
      }
    }
    return positions;
  }

  public static findLeftNeighbours(vector: Vector, size = 1): Vector[] {
    const col = vector[0];
    const row = vector[1];
    let neighbours: Vector[] = [];
    if (col - size >= 0) {
      for (let index = col - 1; index >= col - size; index--) {
        neighbours.push([index, row]);
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
    const col = vector[0];
    const row = vector[1];
    let neighbours: Vector[] = [];
    if (col + size < matrixShape[0]) {
      for (let index = 1; index < size + 1; index++) {
        neighbours.push([col + index, row]);
      }
    } else {
      neighbours = [];
    }
    return neighbours;
  }

  public static findTopNeighbours(vector: Vector, size = 1): Vector[] {
    const col = vector[0];
    const row = vector[1];
    let neighbours: Vector[] = [];
    if (row - size >= 0) {
      for (let index = row - 1; index >= row - size; index--) {
        neighbours.push([col, index]);
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
    const col = vector[0];
    const row = vector[1];
    let neighbours: Vector[] = [];
    if (row + size < matrixShape[1]) {
      for (let index = 1; index < size + 1; index++) {
        neighbours.push([col, row + index]);
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
      vector[0] < 0 ||
      vector[0] > matrixShape[0] - 1 ||
      vector[1] < 0 ||
      vector[1] > matrixShape[1] - 1
    );
  }
}
