
import { User, Event, Booking, Role } from '../types';

const USERS_KEY = 'shuttle_users';
const EVENTS_KEY = 'shuttle_events';
const BOOKINGS_KEY = 'shuttle_bookings';

const getFromStorage = <T,>(key: string): T[] => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return [];
    }
};

const saveToStorage = <T,>(key: string, data: T[]): void => {
    localStorage.setItem(key, JSON.stringify(data));
};

// --- Mock Data Initialization ---
const initMockData = () => {
    if (!localStorage.getItem(USERS_KEY)) {
        const adminUser: User = { id: 'admin1', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', password: 'password', phone: '1234567890', role: Role.ADMIN };
        const regularUser: User = { id: 'user1', firstName: 'Regular', lastName: 'User', email: 'user@example.com', password: 'password', phone: '0987654321', role: Role.USER };
        saveToStorage<User>(USERS_KEY, [adminUser, regularUser]);
    }

    if (!localStorage.getItem(EVENTS_KEY)) {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 7);
        const yyyy = futureDate.getFullYear();
        const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
        const dd = String(futureDate.getDate()).padStart(2, '0');

        const mockEvent: Event = {
            id: 'event1',
            date: `${yyyy}-${mm}-${dd}`,
            time: '22:00',
            capacity: 50,
            pickupPoints: [
                { id: 'p1', name: 'Piazza Centrale' },
                { id: 'p2', name: 'Stazione Ferroviaria' },
                { id: 'p3', name: 'Parco Cittadino' },
            ],
        };
        saveToStorage<Event>(EVENTS_KEY, [mockEvent]);
    }

     if (!localStorage.getItem(BOOKINGS_KEY)) {
        const mockBooking: Booking = {
            id: 'booking1',
            userId: 'user1',
            eventId: 'event1',
            pickupPointId: 'p1',
            qrCode: 'booking1',
            isCheckedIn: false,
        };
        saveToStorage<Booking>(BOOKINGS_KEY, [mockBooking]);
    }
};

// Initialize on load
initMockData();


// --- API Functions ---

// A helper to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
    // User Management
    getUsers: async (): Promise<User[]> => {
        await delay(300);
        return getFromStorage<User>(USERS_KEY);
    },
    updateUser: async (updatedUser: User): Promise<User> => {
        await delay(300);
        let users = getFromStorage<User>(USERS_KEY);
        users = users.map(user => user.id === updatedUser.id ? updatedUser : user);
        saveToStorage<User>(USERS_KEY, users);
        return updatedUser;
    },

    // Event Management
    getEvents: async (): Promise<Event[]> => {
        await delay(500);
        return getFromStorage<Event>(EVENTS_KEY);
    },
    createEvent: async (eventData: Omit<Event, 'id'>): Promise<Event> => {
        await delay(500);
        const events = getFromStorage<Event>(EVENTS_KEY);
        const newEvent: Event = { ...eventData, id: `event_${Date.now()}` };
        saveToStorage<Event>(EVENTS_KEY, [...events, newEvent]);
        return newEvent;
    },
    updateEvent: async (updatedEvent: Event): Promise<Event> => {
        await delay(500);
        let events = getFromStorage<Event>(EVENTS_KEY);
        events = events.map(event => event.id === updatedEvent.id ? updatedEvent : event);
        saveToStorage<Event>(EVENTS_KEY, events);
        return updatedEvent;
    },
    deleteEvent: async (eventId: string): Promise<void> => {
        await delay(500);
        let events = getFromStorage<Event>(EVENTS_KEY);
        saveToStorage<Event>(EVENTS_KEY, events.filter(e => e.id !== eventId));
        // Also delete associated bookings
        let bookings = getFromStorage<Booking>(BOOKINGS_KEY);
        saveToStorage<Booking>(BOOKINGS_KEY, bookings.filter(b => b.eventId !== eventId));
    },

    // Booking Management
    getBookings: async (): Promise<Booking[]> => {
        await delay(400);
        return getFromStorage<Booking>(BOOKINGS_KEY);
    },
    createBooking: async (bookingData: Omit<Booking, 'id' | 'qrCode' | 'isCheckedIn'>): Promise<Booking | null> => {
        await delay(500);
        const bookings = getFromStorage<Booking>(BOOKINGS_KEY);
        const events = getFromStorage<Event>(EVENTS_KEY);
        const event = events.find(e => e.id === bookingData.eventId);
        if (!event) throw new Error("Event not found");

        const bookingsForEvent = bookings.filter(b => b.eventId === bookingData.eventId);
        if (bookingsForEvent.length >= event.capacity) {
            alert("Shuttle is full!");
            return null;
        }

        const newBookingId = `booking_${Date.now()}`;
        const newBooking: Booking = {
            ...bookingData,
            id: newBookingId,
            qrCode: newBookingId,
            isCheckedIn: false,
        };
        saveToStorage<Booking>(BOOKINGS_KEY, [...bookings, newBooking]);
        return newBooking;
    },
    updateBooking: async (updatedBooking: Booking): Promise<Booking> => {
        await delay(300);
        let bookings = getFromStorage<Booking>(BOOKINGS_KEY);
        bookings = bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
        saveToStorage<Booking>(BOOKINGS_KEY, bookings);
        return updatedBooking;
    },
    deleteBooking: async (bookingId: string): Promise<void> => {
        await delay(500);
        let bookings = getFromStorage<Booking>(BOOKINGS_KEY);
        saveToStorage<Booking>(BOOKINGS_KEY, bookings.filter(b => b.id !== bookingId));
    },
};
