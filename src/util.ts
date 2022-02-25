import { Vector } from './types';

export function allPositionsInMatrixShape(matrixShape: Vector) {
  const positions: Vector[] = [];
  for (let col = 0; col < matrixShape[0]; col++) {
    for (let row = 0; row < matrixShape[1]; row++) {
      positions.push([col, row]);
    }
  }
  return positions;
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Checks if pos given is out of the matrix shape
 * @param vector
 */
export function isOutOfBounds(matrixShape: Vector, vector: Vector) {
  return (
    vector[0] < 0 ||
    vector[0] > matrixShape[0] - 1 ||
    vector[1] < 0 ||
    vector[1] > matrixShape[1] - 1
  );
}
