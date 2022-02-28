import { Vector } from '../types';

export interface BattleshipsOptions {
  matrixShape: Vector;
  numberOfShips: number;
  lengthOfShips: number;
  numberOfTurns?: number;
}
