import { Battleships } from './battleships';
import { ConsoleDisplay, ConsoleResolution } from './display/console-display';
import { AIPlayer } from './player/ai-player';
import { Battlefield } from './battlefield/battlefield';
import { Player } from './player/player';
import { PlayerManager } from './player-manager/player-manager';
import { Vector } from './models/vector';
import { StandardMissileLauncher } from './missile-launcher/standard-missile-launcher';

const player1 = new Player({
  id: 'Cam',
  battlefield: new Battlefield({
    id: "Cam's Field",
    matrixShape: new Vector(4, 4),
    ships: [
      {
        length: 2,
        sinkInOne: false,
      },
      // {
      //   length: 3,
      //   sinkInOne: false,
      // },
      // {
      //   length: 4,
      //   sinkInOne: false,
      // },
    ],
  }),
  missileLauncher: new StandardMissileLauncher(),
  display: new ConsoleDisplay({
    gaps: false,
    resolution: ConsoleResolution.Small,
  }),
});

const ai = new AIPlayer({
  id: 'RIVAL',
  battlefield: new Battlefield({
    id: "RIVAL's FIELD",
    matrixShape: new Vector(8, 8),
    ships: [
      {
        length: 2,
        sinkInOne: false,
      },
      {
        length: 3,
        sinkInOne: false,
      },
      {
        length: 4,
        sinkInOne: false,
      },
    ],
  }),
  missileLauncher: new StandardMissileLauncher(),
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
