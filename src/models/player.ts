interface IPlayer {
  id: string;
}

class Player implements IPlayer {
  id: string;
  private numberOfShips: number;

  private ships: Ship[];
  private targets: Vector[];

  constructor({ numberOfShips = 2 }: { numberOfShips: number }) {
    this.numberOfShips = numberOfShips;
  }

  public allShipVectors(): Vector[] {
    return this.ships.map((ship) => ship.allVectors()).flat();
  }

  public remainingShips() {
    return this.ships.filter((ship) => !ship.sunk);
  }

  private createShips() {
    for (let _ = 0; _ < this.numberOfShips; _++) {
      const ship = this.createShip();
      this.ships.push(ship);
    }
  }

  /**
   * Finds free place for a new ship and creates a new one at that position
   * @param takenSpots
   * @param length
   * @param sinkInOneHit
   * @returns
   */
  private createShip() {
    let tries = 0;
    const takenSpots = this.allShipVectors();
    while (
      tries <
      this.matrixShape[0] * this.matrixShape[1] - takenSpots.length
    ) {
      const head = this.pickShipHead(takenSpots);
      if (this.lengthOfShips == 1) {
        return new Ship({
          vectors: [head],
          sinkInOneHit: this.gameMode == GameMode.Easy,
        });
      }
      const potentialBodies: Vector[][] = MatrixHelper.findNeighbours(
        this.matrixShape,
        head,
        this.lengthOfShips - 1
      );
      // filter out bodies that have positions taken
      const validBodies = potentialBodies.filter((body) => {
        // make sure that bodies are not in take positions
        return !body.find((vector) =>
          takenSpots.find((x) => x[0] == vector[0] && x[1] == vector[1])
        );
      });

      if (validBodies.length != 0)
        return new Ship({
          vectors: [head, ...randomChoice(validBodies)],
          sinkInOneHit: this.gameMode == GameMode.Easy,
        });
      tries = tries + 1;
    }
    throw new BattleshipsError('Failed to create ship - no room');
  }

  /**
   * Picks a pos in the in battlefield that is not in the taken spots list
   * @param takenSpots
   */
  private pickShipHead(takenSpots: Vector[] = []): Vector {
    const availablePositions = this.positionsInMatrix.filter((vec) => {
      return !takenSpots.find((x) => x[0] == vec[0] && x[1] == vec[1]);
    });
    if (availablePositions.length == 0) {
      throw new BattleshipsError('Too many ships');
    }
    return randomChoice(availablePositions);
  }
}
