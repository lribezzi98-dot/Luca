
export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface User {
    id: string;
    firstName: string;
    lastName:string;
    email: string;
    phone: string;
    password?: string; // Should not be stored in frontend state long-term
    role: Role;
}

export interface PickupPoint {
    id: string;
    name: string;
}

export interface Event {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    pickupPoints: PickupPoint[];
    capacity: number;
}

export interface Booking {
    id: string;
    userId: string;
    eventId: string;
    pickupPointId: string;
    qrCode: string; // This will hold the unique booking ID
    isCheckedIn: boolean;
}
