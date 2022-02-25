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
