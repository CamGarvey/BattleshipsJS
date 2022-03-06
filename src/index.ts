import { Battleships } from './battleships';
import { ConsoleDisplay, ConsoleResolution } from './display';
import { AIPlayer } from './models/ai-player';
import { Battlefield } from './models/battlefield';
import { Player } from './models/player';
import { PlayerManager } from './models/player-manager';
import { MatrixHelper } from './util';

const neighbours = MatrixHelper.findNeighbours([8, 8], [3, 3], 2);

console.log(neighbours);

const player1 = new Player({
  id: 'Cam',
  battlefield: new Battlefield({
    id: "Cam's Field",
    matrixShape: [8, 8],
    ships: [
      {
        length: 4,
      },
    ],
  }),
  display: new ConsoleDisplay({
    gaps: true,
    resolution: ConsoleResolution.Medium,
  }),
});

// const player2 = new Player({
//   id: 'RIVAL',
//   battlefield: new Battlefield({
//     id: "RIVAL's FIELD",
//     matrixShape: [3, 3],
//     ships: [
//       {
//         length: 2,
//       },
//       {
//         length: 2,
//       },
//     ],
//   }),
//   display: new ConsoleDisplay({ gaps: true }),
// });

const ai = new AIPlayer({
  id: 'RIVAL',
  battlefield: new Battlefield({
    id: "RIVAL's FIELD",
    matrixShape: [8, 8],
    ships: [
      {
        length: 4,
      },
    ],
  }),
});

const playerManager = new PlayerManager([player1, ai]);

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
