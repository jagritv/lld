// ==========================================
// 1. ENUMS & VALUE INTERFACES
// ==========================================
enum VehicleType {
  CAR = 'CAR',
  BIKE = 'BIKE',
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
  readonly floorNumber: number,
  readonly vehicleType: VehicleType;
  readonly entryTime: Date;
}

interface Receipt {
  readonly ticketId: string,
  readonly fee: number, 
  readonly durationHours: number,
}

// ==========================================
// 2. STRATEGY INTERFACE & IMPLEMENTATION
// ==========================================
interface PricingStrategy {
  calculate(ticket: Ticket, exitTime: Date): number;
}

class FlatHourlyPricingStrategy implements PricingStrategy {
  private rates: Record<VehicleType, number> = {
    [VehicleType.BIKE]: 10,
    [VehicleType.CAR]: 20,
    [VehicleType.TRUCK]: 50,
  };

  calculate(ticket: Ticket, exitTime: Date): number {
    const hours = Math.max(
      1,
      Math.ceil((exitTime.getTime() - ticket.entryTime.getTime()) / (1000 * 60 * 60))
    );
    return hours * this.rates[ticket.vehicleType];
  }
}

// ==========================================
// 3. DOMAIN ENTITY: PARKING SPOT
// ==========================================

class ParkingSpot {
  private occupiedVehicleType: VehicleType | null = null;

  constructor(
    public readonly id: string,
    public readonly allowedType: VehicleType
  ) {}

  public isAvailable(): boolean {
    return this.occupiedVehicleType === null;
  }

  public assign(type: VehicleType): void{
    if (!this.isAvailable()) {
        console.log(`Parking spot ${this.id} is not availbable.`);
    }

    if (this.allowedType !== type) {
        console.log(`Vehicle type is not allowed.`);
    } 
    this.occupiedVehicleType = type;
  }

  public vacate(): void {
    this.occupiedVehicleType = null;
  }
}

// ==========================================
// 4. ORCHESTRATOR / FACADE: PARKING LOT
// ==========================================
class ParkingLot {
  private spots: ParkingSpot[] = [];
  private activeTickets: Map<string, Ticket> = new Map();

  constructor(private pricingStrategy: PricingStrategy) {}

  public addSpot(spot: ParkingSpot): void {
    this.spots.push(spot);
  }

  public park(type: VehicleType): Ticket {
    const spot = this.spots.find((s) => s.isAvailable() && s.allowedType === type);
    if (!spot) {
      throw new Error(`Parking full for vehicle type: ${type}`);
    }

    spot.assign(type);

    const ticket: Ticket = {
      id: `TCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      spotId: spot.id,
      vehicleType: type,
      entryTime: new Date(),
    };

    this.activeTickets.set(ticket.id, ticket);
    return ticket;
  }

  public unpark(ticketId: string): { fee: number; spotId: string } {
    const ticket = this.activeTickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket not found or already paid: ${ticketId}`);
    }

    const spot = this.spots.find((s) => s.id === ticket.spotId);
    if (!spot) {
      throw new Error(`Corrupted state: Spot ${ticket.spotId} not found.`);
    }

    const exitTime = new Date();
    const fee = this.pricingStrategy.calculate(ticket, exitTime);

    spot.vacate();
    this.activeTickets.delete(ticketId);

    return { fee, spotId: spot.id };
  }
}

// ==========================================
// 5. DRIVER RUNNER (Proof of Execution)
// ==========================================
const lot = new ParkingLot(new FlatHourlyPricingStrategy());
lot.addSpot(new ParkingSpot('S-1', VehicleType.CAR));
lot.addSpot(new ParkingSpot('S-2', VehicleType.BIKE));

const ticket = lot.park(VehicleType.CAR);
console.log('Vehicle Parked:', ticket);

const invoice = lot.unpark(ticket.id);
console.log('Vehicle Unparked:', invoice);