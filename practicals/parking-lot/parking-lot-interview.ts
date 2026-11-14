// ==========================================
// 1. ENUMS & IMMUTABLE VALUE OBJECTS
// ==========================================
enum VehicleType {
  BIKE = 'BIKE',
  CAR = 'CAR',
  TRUCK = 'TRUCK',
}

enum SpotType {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

interface Ticket {
  readonly id: string;
  readonly spotId: string;
  readonly floorNumber: number;
  readonly vehicleType: VehicleType;
  readonly entryTime: Date;
}

interface Receipt {
  readonly ticketId: string;
  readonly fee: number;
  readonly durationHours: number;
}

// ==========================================
// 2. DOMAIN ENTITIES: SPOT & FLOOR
// ==========================================
class ParkingSpot {
  private currentVehicle: VehicleType | null = null;

  constructor(
    public readonly id: string,
    public readonly floorNumber: number,
    public readonly spotType: SpotType
  ) {}

  public isAvailable(): boolean {
    return this.currentVehicle === null;
  }

  public canFit(vehicle: VehicleType): boolean {
    if (!this.isAvailable()) return false;
    if (vehicle === VehicleType.BIKE) return true;
    if (vehicle === VehicleType.CAR) return this.spotType !== SpotType.SMALL;
    return this.spotType === SpotType.LARGE;
  }

  public assign(vehicle: VehicleType): void {
    if (!this.canFit(vehicle)) {
      throw new Error(`Spot ${this.id} cannot accommodate ${vehicle}`);
    }
    this.currentVehicle = vehicle;
  }

  public vacate(): void {
    this.currentVehicle = null;
  }
}

class ParkingFloor {
  private spots: ParkingSpot[] = [];

  constructor(public readonly floorNumber: number) {}

  public addSpot(spot: ParkingSpot): void {
    this.spots.push(spot);
  }

  public getAvailableSpots(): ParkingSpot[] {
    return this.spots.filter((s) => s.isAvailable());
  }

  public getSpotById(spotId: string): ParkingSpot | undefined {
    return this.spots.find((s) => s.id === spotId);
  }
}

// ==========================================
// 3. STRATEGY INTERFACES & IMPLEMENTATIONS
// ==========================================
interface SpotAssignmentStrategy {
  findSpot(floors: ParkingFloor[], vehicle: VehicleType): ParkingSpot | null;
}

class LowestFloorFirstStrategy implements SpotAssignmentStrategy {
  findSpot(floors: ParkingFloor[], vehicle: VehicleType): ParkingSpot | null {
    const sorted = [...floors].sort((a, b) => a.floorNumber - b.floorNumber);
    for (const floor of sorted) {
      const match = floor.getAvailableSpots().find((s) => s.canFit(vehicle));
      if (match) return match;
    }
    return null;
  }
}

interface PricingStrategy {
  calculateFee(ticket: Ticket, exitTime: Date): number;
}

class HourlyPricingStrategy implements PricingStrategy {
  private readonly hourlyRates: Record<VehicleType, number> = {
    [VehicleType.BIKE]: 10,
    [VehicleType.CAR]: 20,
    [VehicleType.TRUCK]: 50,
  };

  calculateFee(ticket: Ticket, exitTime: Date): number {
    const diffMs = exitTime.getTime() - ticket.entryTime.getTime();
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    return hours * this.hourlyRates[ticket.vehicleType];
  }
}

// ==========================================
// 4. ORCHESTRATOR / FACADE: PARKING LOT
// ==========================================
class ParkingLot {
  private floors: Map<number, ParkingFloor> = new Map();
  private activeTickets: Map<string, Ticket> = new Map();

  constructor(
    private assignmentStrategy: SpotAssignmentStrategy,
    private pricingStrategy: PricingStrategy
  ) {}

  public addFloor(floor: ParkingFloor): void {
    this.floors.set(floor.floorNumber, floor);
  }

  public park(vehicle: VehicleType): Ticket {
    const spot = this.assignmentStrategy.findSpot(Array.from(this.floors.values()), vehicle);
    if (!spot) {
      throw new Error(`Parking Full: No spot available for ${vehicle}`);
    }

    spot.assign(vehicle);

    const ticket: Ticket = {
      id: `TCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      spotId: spot.id,
      floorNumber: spot.floorNumber,
      vehicleType: vehicle,
      entryTime: new Date(),
    };

    this.activeTickets.set(ticket.id, ticket);
    return ticket;
  }

  public unpark(ticketId: string): Receipt {
    const ticket = this.activeTickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Invalid or already settled ticket: ${ticketId}`);
    }

    const floor = this.floors.get(ticket.floorNumber);
    const spot = floor?.getSpotById(ticket.spotId);
    if (!spot) {
      throw new Error(`Corrupted state: Spot ${ticket.spotId} not found`);
    }

    const exitTime = new Date();
    const fee = this.pricingStrategy.calculateFee(ticket, exitTime);
    const durationHours = Math.max(
      1,
      Math.ceil((exitTime.getTime() - ticket.entryTime.getTime()) / (1000 * 60 * 60))
    );

    spot.vacate();
    this.activeTickets.delete(ticketId);

    return { ticketId: ticket.id, fee, durationHours };
  }
}

// ==========================================
// 5. DRIVER EXECUTION
// ==========================================
const lot = new ParkingLot(new LowestFloorFirstStrategy(), new HourlyPricingStrategy());

const f1 = new ParkingFloor(1);
f1.addSpot(new ParkingSpot('F1-S1', 1, SpotType.SMALL));
f1.addSpot(new ParkingSpot('F1-M1', 1, SpotType.MEDIUM));
lot.addFloor(f1);

const f2 = new ParkingFloor(2);
f2.addSpot(new ParkingSpot('F2-L1', 2, SpotType.LARGE));
lot.addFloor(f2);

const carTicket = lot.park(VehicleType.CAR);
console.log('Checked In:', carTicket);

const receipt = lot.unpark(carTicket.id);
console.log('Checked Out:', receipt);