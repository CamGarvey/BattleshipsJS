import { Battleships } from './battleships';
import { ConsoleDisplay, ConsoleResolution } from './display';

const battleships = new Battleships(
  {
    matrixShape: [5, 5],
    numberOfShips: 2,
    lengthOfShips: 2,
  },
  new ConsoleDisplay({ resolution: ConsoleResolution.Medium, gaps: false })
);

(async () => {
  battleships.run();
})();
