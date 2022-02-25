import { Battleships } from './battleships';

const battleships = new Battleships([8, 8], 6, 2);

(async () => {
  battleships.run(true);
})();
