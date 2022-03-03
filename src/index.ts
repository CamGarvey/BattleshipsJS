import { Battleships } from './battleships';
import { ConsoleDisplay, ConsoleResolution } from './display';
import { Battlefield } from './models/battlefield';
import { Player } from './models/player';
import { PlayerManager } from './models/player-manager';

const player1 = new Player({
  id: 'Cam',
  battlefield: new Battlefield({
    id: 'helllo',
    matrixShape: [3, 3],
    ships: [
      {
        length: 1,
      },
    ],
  }),
  display: new ConsoleDisplay(),
});

const player2 = new Player({
  id: 'RIVAL',
  battlefield: new Battlefield({
    id: 'BITCH FIELD',
    matrixShape: [3, 3],
    ships: [
      {
        length: 1,
      },
    ],
  }),
  display: new ConsoleDisplay(),
});

const playerManager = new PlayerManager([player1, player2]);

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
