// ==========================================
// 1. ENUMS & VALUE INTERFACES
// ==========================================
enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  IDLE = 'IDLE',
}

enum ElevatorStatus {
  MOVING = 'MOVING',
  STOPPED = 'STOPPED',
}

interface HallRequest {
  readonly floor: number;
  readonly direction: Direction.UP | Direction.DOWN;
}

// ==========================================
// 2. DOMAIN ENTITY: ELEVATOR CAR
// ==========================================
class ElevatorCar {
  public currentFloor: number = 0;
  public direction: Direction = Direction.IDLE;
  public status: ElevatorStatus = ElevatorStatus.STOPPED;

  // LOOK Algorithm: separate sets for upward and downward destination stops
  private upStops: Set<number> = new Set();
  private downStops: Set<number> = new Set();

  constructor(public readonly id: number) {}

  public addDestination(floor: number): void {
    if (floor === this.currentFloor) return;

    if (floor > this.currentFloor) {
      this.upStops.add(floor);
      if (this.direction === Direction.IDLE) this.direction = Direction.UP;
    } else {
      this.downStops.add(floor);
      if (this.direction === Direction.IDLE) this.direction = Direction.DOWN;
    }
    this.status = ElevatorStatus.MOVING;
  }

  // Simulates elevator motion by 1 tick/step
  public step(): void {
    if (this.direction === Direction.IDLE) {
      this.status = ElevatorStatus.STOPPED;
      return;
    }

    if (this.direction === Direction.UP) {
      this.currentFloor++;
      if (this.upStops.has(this.currentFloor)) {
        this.stopAtFloor(this.upStops);
      }
      // Re-evaluate direction when upward stops are completed
      if (this.upStops.size === 0) {
        this.direction = this.downStops.size > 0 ? Direction.DOWN : Direction.IDLE;
      }
    } else if (this.direction === Direction.DOWN) {
      this.currentFloor--;
      if (this.downStops.has(this.currentFloor)) {
        this.stopAtFloor(this.downStops);
      }
      // Re-evaluate direction when downward stops are completed
      if (this.downStops.size === 0) {
        this.direction = this.upStops.size > 0 ? Direction.UP : Direction.IDLE;
      }
    }
  }

  private stopAtFloor(stopSet: Set<number>): void {
    stopSet.delete(this.currentFloor);
    this.status = ElevatorStatus.STOPPED;
    console.log(`[Car ${this.id}] Doors opened at Floor ${this.currentFloor}`);
  }

  public getPendingStopCount(): number {
    return this.upStops.size + this.downStops.size;
  }
}

// ==========================================
// 3. STRATEGY PATTERN: ELEVATOR DISPATCHER
// ==========================================
interface DispatchStrategy {
  selectCar(cars: ElevatorCar[], request: HallRequest): ElevatorCar;
}

class OptimalProximityStrategy implements DispatchStrategy {
  selectCar(cars: ElevatorCar[], request: HallRequest): ElevatorCar {
    const firstCar = cars[0];
    if (!firstCar) throw new Error('No elevator cars available');

    let bestCar: ElevatorCar = firstCar;
    let minCost = Infinity;

    for (const car of cars) {
      const cost = this.calculateCost(car, request);
      if (cost < minCost) {
        minCost = cost;
        bestCar = car;
      }
    }
    return bestCar;
  }

  private calculateCost(car: ElevatorCar, req: HallRequest): number {
    const distance = Math.abs(car.currentFloor - req.floor);

    // 1. Car is idle -> cost is straight distance
    if (car.direction === Direction.IDLE) {
      return distance;
    }

    // 2. Car is moving towards the floor in the same direction -> optimal pick-up
    const isMovingTowards =
      (car.direction === Direction.UP && req.floor >= car.currentFloor) ||
      (car.direction === Direction.DOWN && req.floor <= car.currentFloor);

    if (isMovingTowards && car.direction === req.direction) {
      return distance;
    }

    // 3. Car is moving away or in reverse direction -> apply heavy turn-around penalty
    return distance + 15 + car.getPendingStopCount() * 2;
  }
}

// ==========================================
// 4. ORCHESTRATOR / CONTROLLER: ELEVATOR SYSTEM
// ==========================================
class ElevatorSystem {
  private cars: ElevatorCar[] = [];

  constructor(
    carCount: number,
    private strategy: DispatchStrategy = new OptimalProximityStrategy()
  ) {
    for (let i = 1; i <= carCount; i++) {
      this.cars.push(new ElevatorCar(i));
    }
  }

  // Hall call: Outside user presses UP/DOWN
  public requestElevator(req: HallRequest): void {
    const bestCar = this.strategy.selectCar(this.cars, req);
    console.log(`[System] Hall call at floor ${req.floor} (${req.direction}) -> Assigned Car ${bestCar.id}`);
    bestCar.addDestination(req.floor);
  }

  // Car call: Inside passenger presses floor button
  public selectFloor(carId: number, destinationFloor: number): void {
    const car = this.cars.find((c) => c.id === carId);
    if (!car) throw new Error(`Elevator Car ${carId} not found`);
    car.addDestination(destinationFloor);
  }

  // Progress the entire system by 1 unit of time
  public step(): void {
    this.cars.forEach((car) => car.step());
  }

  public printStatus(): void {
    console.log('--- Elevator Status ---');
    for (const car of this.cars) {
      console.log(
        `Car ${car.id} | Floor: ${car.currentFloor} | Dir: ${car.direction} | State: ${car.status} | Stops Left: ${car.getPendingStopCount()}`
      );
    }
  }
}

// ==========================================
// 5. DRIVER RUNNER (Proof of Execution)
// ==========================================
const system = new ElevatorSystem(2); // 2 cars

// Passenger at Floor 3 presses UP
system.requestElevator({ floor: 3, direction: Direction.UP });

// Step time: Car moves closer
system.step();
system.printStatus();

system.step();
system.printStatus();

system.step(); // Car reaches Floor 3
system.printStatus();

// Inside Car 1, passenger selects Floor 7
system.selectFloor(1, 7);
system.step();
system.printStatus();