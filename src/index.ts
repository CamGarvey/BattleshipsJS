import { Battleships } from './battleships';
import { ConsoleDisplay, ConsoleResolution } from './display';
import { Battlefield } from './models/battlefield';
import { Player } from './models/player';
import { PlayerManager } from './models/player-manager';

const player = new Player({
  id: 'Cam',
  battlefield: new Battlefield({
    matrixShape: [3, 3],
    ships: [
      {
        length: 1,
      },
    ],
  }),
  display: new ConsoleDisplay(),
});

const playerManager = new PlayerManager([player]);

const battleships = new Battleships(
  {
    matrixShape: [5, 5],
    numberOfShips: 2,
    lengthOfShips: 2,
  },
  playerManager
);

(async () => {
  battleships.run();
})();
