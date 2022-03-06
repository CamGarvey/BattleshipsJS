import { Battleships } from './battleships';
import { ConsoleDisplay, ConsoleResolution } from './display';
import { AIPlayer } from './models/ai-player';
import { Battlefield } from './models/battlefield';
import { Player } from './models/player';
import { PlayerManager } from './models/player-manager';

const player1 = new Player({
  id: 'Cam',
  battlefield: new Battlefield({
    id: "Cam's Field",
    matrixShape: [6, 6],
    ships: [
      {
        length: 6,
        sinkInOne: false,
      },
    ],
  }),
  display: new ConsoleDisplay({
    gaps: false,
    resolution: ConsoleResolution.Medium,
  }),
});

const ai = new AIPlayer({
  id: 'RIVAL',
  battlefield: new Battlefield({
    id: "RIVAL's FIELD",
    matrixShape: [6, 6],
    ships: [
      {
        length: 6,
        sinkInOne: false,
      },
    ],
  }),
});

// PLAYER vs PLAYER
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

const playerManager = new PlayerManager({
  players: [player1, ai],
  numberOfTurns: 20,
});

const battleships = new Battleships(playerManager);

(async () => {
  battleships.run();
})();
