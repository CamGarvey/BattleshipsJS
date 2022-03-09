import { IBattlefield } from '../battlefield/battlefield.interface';
import { ShootResponse } from '../models/shoot-response';
import { Vector } from '../models/vector';

export interface IMissileLauncher {
  shootAt(battlefield: IBattlefield, coordinates: Vector): ShootResponse;
}
