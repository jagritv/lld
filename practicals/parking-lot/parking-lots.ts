// ==========================================
// 1. DOMAIN ENUMS & VALUE OBJECTS
// ==========================================
enum SpotType {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  TRUCK = 'TRUCK',
}

interface Ticket {
  readonly ticketId: string;
  readonly spotId: string;
  readonly vehicleLicense: string;
  readonly vehicleType: VehicleType;
  readonly entryTime: Date;
}

interface Receipt {
  readonly ticketId: string;
  readonly exitTime: Date;
  readonly durationMinutes: number;
  readonly fee: number;
}

// ==========================================
// 2. VEHICLE CLASS HIERARCHY
// ==========================================
abstract class Vehicle {
  constructor(
    public readonly licenseNumber: string,
    public readonly type: VehicleType
  ) {}

  public abstract canFitInSpot(spotType: SpotType): boolean;
}

class Motorcycle extends Vehicle {
  constructor(licenseNumber: string) {
    super(licenseNumber, VehicleType.MOTORCYCLE);
  }

  public canFitInSpot(spotType: SpotType): boolean {
    return (
      spotType === SpotType.SMALL ||
      spotType === SpotType.MEDIUM ||
      spotType === SpotType.LARGE
    );
  }
}

class Car extends Vehicle {
  constructor(licenseNumber: string) {
    super(licenseNumber, VehicleType.CAR);
  }

  public canFitInSpot(spotType: SpotType): boolean {
    return spotType === SpotType.MEDIUM || spotType === SpotType.LARGE;
  }
}

class Truck extends Vehicle {
  constructor(licenseNumber: string) {
    super(licenseNumber, VehicleType.TRUCK);
  }

  public canFitInSpot(spotType: SpotType): boolean {
    return spotType === SpotType.LARGE;
  }
}

// ==========================================
// 3. PARKING SPOT & FLOOR ENTITIES
// ==========================================
class ParkingSpot {
  private currentVehicle: Vehicle | null = null;

  constructor(
    public readonly id: string,
    public readonly floorNumber: number,
    public readonly spotType: SpotType
  ) {}

  public isAvailable(): boolean {
    return this.currentVehicle === null;
  }

  public canFitVehicle(vehicle: Vehicle): boolean {
    return this.isAvailable() && vehicle.canFitInSpot(this.spotType);
  }

  public assignVehicle(vehicle: Vehicle): void {
    if (!this.canFitVehicle(vehicle)) {
      throw new Error(`Spot ${this.id} (${this.spotType}) cannot accommodate vehicle ${vehicle.licenseNumber}.`);
    }
    this.currentVehicle = vehicle;
  }

  public vacate(): void {
    this.currentVehicle = null;
  }

  public getOccupyingVehicle(): Vehicle | null {
    return this.currentVehicle;
  }
}

class ParkingFloor {
  private spots: Map<string, ParkingSpot> = new Map();

  constructor(public readonly floorNumber: number) {}

  public addSpot(spot: ParkingSpot): void {
    this.spots.set(spot.id, spot);
  }

  public getSpots(): ParkingSpot[] {
    return Array.from(this.spots.values());
  }

  public getAvailableSpots(): ParkingSpot[] {
    return this.getSpots().filter((spot) => spot.isAvailable());
  }
}

// ==========================================
// 4. STRATEGY PATTERN: ALLOCATION & PRICING
// ==========================================
interface ParkingAssignmentStrategy {
  findSpot(floors: ParkingFloor[], vehicle: Vehicle): ParkingSpot | null;
}

class LowestFloorFirstStrategy implements ParkingAssignmentStrategy {
  public findSpot(floors: ParkingFloor[], vehicle: Vehicle): ParkingSpot | null {
    // Sort floors by ascending floor number
    const sortedFloors = [...floors].sort((a, b) => a.floorNumber - b.floorNumber);

    for (const floor of sortedFloors) {
      for (const spot of floor.getAvailableSpots()) {
        if (spot.canFitVehicle(vehicle)) {
          return spot;
        }
      }
    }
    return null;
  }
}

interface PricingStrategy {
  calculateFee(ticket: Ticket, exitTime: Date): number;
}

class DynamicHourlyPricingStrategy implements PricingStrategy {
  private readonly rates: Record<VehicleType, { baseRate: number; hourlyRate: number }> = {
    [VehicleType.MOTORCYCLE]: { baseRate: 10, hourlyRate: 15 },
    [VehicleType.CAR]: { baseRate: 20, hourlyRate: 30 },
    [VehicleType.TRUCK]: { baseRate: 50, hourlyRate: 70 },
  };

  public calculateFee(ticket: Ticket, exitTime: Date): number {
    const durationMs = exitTime.getTime() - ticket.entryTime.getTime();
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    const { baseRate, hourlyRate } = this.rates[ticket.vehicleType];

    return baseRate + (durationHours - 1) * hourlyRate;
  }
}

// ==========================================
// 5. ORCHESTRATOR / FACADE: PARKING LOT SERVICE
// ==========================================
class ParkingLotService {
  private static instance: ParkingLotService | null = null;

  private floors: Map<number, ParkingFloor> = new Map();
  private activeTickets: Map<string, Ticket> = new Map();

  // Injected strategies
  private assignmentStrategy: ParkingAssignmentStrategy;
  private pricingStrategy: PricingStrategy;

  private constructor(
    assignmentStrategy: ParkingAssignmentStrategy,
    pricingStrategy: PricingStrategy
  ) {
    this.assignmentStrategy = assignmentStrategy;
    this.pricingStrategy = pricingStrategy;
  }

  // Singleton accessor
  public static getInstance(
    assignmentStrategy?: ParkingAssignmentStrategy,
    pricingStrategy?: PricingStrategy
  ): ParkingLotService {
    if (!ParkingLotService.instance) {
      if (!assignmentStrategy || !pricingStrategy) {
        throw new Error('Initial instantiation requires assignment and pricing strategies.');
      }
      ParkingLotService.instance = new ParkingLotService(assignmentStrategy, pricingStrategy);
    }
    return ParkingLotService.instance;
  }

  public addFloor(floor: ParkingFloor): void {
    this.floors.set(floor.floorNumber, floor);
  }

  public setAssignmentStrategy(strategy: ParkingAssignmentStrategy): void {
    this.assignmentStrategy = strategy;
  }

  public setPricingStrategy(strategy: PricingStrategy): void {
    this.pricingStrategy = strategy;
  }

  public checkIn(vehicle: Vehicle): Ticket {
    const allFloors = Array.from(this.floors.values());
    const spot = this.assignmentStrategy.findSpot(allFloors, vehicle);

    if (!spot) {
      throw new Error(`Parking full: No suitable spot found for ${vehicle.type}.`);
    }

    spot.assignVehicle(vehicle);

    const ticket: Ticket = {
      ticketId: `TICK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      spotId: spot.id,
      vehicleLicense: vehicle.licenseNumber,
      vehicleType: vehicle.type,
      entryTime: new Date(),
    };

    this.activeTickets.set(ticket.ticketId, ticket);
    return ticket;
  }

  public checkOut(ticketId: string): Receipt {
    const ticket = this.activeTickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Invalid ticket: ${ticketId} does not exist or was already paid.`);
    }

    // Locate spot across floors
    let foundSpot: ParkingSpot | null = null;
    for (const floor of this.floors.values()) {
      const match = floor.getSpots().find((s) => s.id === ticket.spotId);
      if (match) {
        foundSpot = match;
        break;
      }
    }

    if (!foundSpot) {
      throw new Error(`State error: Spot ${ticket.spotId} could not be resolved.`);
    }

    const exitTime = new Date();
    const fee = this.pricingStrategy.calculateFee(ticket, exitTime);
    const durationMinutes = Math.round((exitTime.getTime() - ticket.entryTime.getTime()) / (1000 * 60));

    // Release resource
    foundSpot.vacate();
    this.activeTickets.delete(ticketId);

    return {
      ticketId: ticket.ticketId,
      exitTime,
      durationMinutes,
      fee,
    };
  }
}

// ==========================================
// 6. RUNNABLE DRIVER SCRIPT
// ==========================================
const service = ParkingLotService.getInstance(
  new LowestFloorFirstStrategy(),
  new DynamicHourlyPricingStrategy()
);

// Setup Floor 1
const floor1 = new ParkingFloor(1);
floor1.addSpot(new ParkingSpot('F1-S1', 1, SpotType.SMALL));
floor1.addSpot(new ParkingSpot('F1-M1', 1, SpotType.MEDIUM));
floor1.addSpot(new ParkingSpot('F1-L1', 1, SpotType.LARGE));
service.addFloor(floor1);

// Setup Floor 2
const floor2 = new ParkingFloor(2);
floor2.addSpot(new ParkingSpot('F2-M1', 2, SpotType.MEDIUM));
service.addFloor(floor2);

// Park a car
const car = new Car('MH-12-AB-1234');
const carTicket = service.checkIn(car);
console.log('Vehicle checked in:', carTicket);

// Park a motorcycle
const bike = new Motorcycle('KA-01-XY-9999');
const bikeTicket = service.checkIn(bike);
console.log('Motorcycle checked in:', bikeTicket);

// Check out
const receipt = service.checkOut(carTicket.ticketId);
console.log('Vehicle checked out successfully:', receipt);