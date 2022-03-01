import { Vector } from './types';

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
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
    const col = vector[0];
    const row = vector[1];

    let top: Vector[] = [];
    let bottom: Vector[] = [];
    let left: Vector[] = [];
    let right: Vector[] = [];

    // Find top neighbours
    if (row - size >= 0) {
      for (let index = row - size; index < row; index++) {
        top.push([col, index]);
      }
    } else {
      top = [];
    }
    // Find bottom neighbours
    if (row + size < matrixShape[1]) {
      for (let index = 1; index < size + 1; index++) {
        bottom.push([col, row + index]);
      }
    } else {
      bottom = [];
    }

    // Find left neighbours
    if (col - size >= 0) {
      for (let index = col - size; index < col; index++) {
        left.push([index, row]);
      }
    } else {
      left = [];
    }

    // Find right neighbours
    if (col + size < matrixShape[0]) {
      for (let index = 1; index < size + 1; index++) {
        right.push([col + index, row]);
      }
    } else {
      right = [];
    }
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
