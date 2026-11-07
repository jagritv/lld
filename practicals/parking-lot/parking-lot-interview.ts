enum VehicleType {
    CAR = "CAR",
    TRUCK = "TRUCK",
    BIKE = "BIKE"
}

interface Ticket{
    readonly id: string;
    readonly vehcileNumber: string;
    readonly vehicleType: VehicleType;
    readonly entryTime: Date;
}

interface PricingStrategy {
    calculate(ticket: Ticket, exitTime: Date): number; 
}

class FlatHourlyStrategy implements PricingStrategy {
    private rates: Record<VehicleType, number> {
        [VehicleType.BIKE]: 10,
        [VehicleType.CAR]: 20,
        [VehicleType.TRUCK]: 50,
    };

    calculate(ticket: Ticket, exitTime: Date): number{
        const hours = Math.max(1, 
            Math.ceil((exitTime.getTime() - ticket.entryTime.getTime()))/1000*60*60;
        );

        return hours * this.rates[ticket.vehicleType];
    }
}

class parkingSpot{
    private occupiedVehicleType: VehicleType | null = null;

    constructor{
        public readonly id: string,
        public readonly allowedType: VehicleType 
    } {}
}