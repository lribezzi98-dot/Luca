
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, Event, Booking, Role } from '../types';
import { api } from '../services/api';

interface AppContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<User | null>;
    logout: () => void;
    register: (userData: Omit<User, 'id' | 'role'>) => Promise<User | null>;
    users: User[];
    events: Event[];
    bookings: Booking[];
    fetchData: () => Promise<void>;
    updateUserRole: (userId: string, role: Role) => Promise<void>;
    addEvent: (eventData: Omit<Event, 'id'>) => Promise<void>;
    editEvent: (event: Event) => Promise<void>;
    removeEvent: (eventId: string) => Promise<void>;
    addBooking: (bookingData: Omit<Booking, 'id'|'qrCode'|'isCheckedIn'>) => Promise<Booking | null>;
    editBooking: (booking: Booking) => Promise<void>;
    removeBooking: (bookingId: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersData, eventsData, bookingsData] = await Promise.all([
                api.getUsers(),
                api.getEvents(),
                api.getBookings(),
            ]);
            setUsers(usersData);
            setEvents(eventsData);
            setBookings(bookingsData);
            
            // Re-authenticate user from session storage
            const storedUser = sessionStorage.getItem('shuttle_user');
            if(storedUser) {
                const parsedUser = JSON.parse(storedUser);
                const fullUser = usersData.find(u => u.id === parsedUser.id);
                setCurrentUser(fullUser || null);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const login = async (email: string, pass: string): Promise<User | null> => {
        const user = users.find(u => u.email === email && u.password === pass);
        if (user) {
            setCurrentUser(user);
            sessionStorage.setItem('shuttle_user', JSON.stringify(user));
            return user;
        }
        alert("Invalid credentials");
        return null;
    };

    const register = async (userData: Omit<User, 'id' | 'role'>): Promise<User | null> => {
        if(users.some(u => u.email === userData.email)){
            alert("Email already registered.");
            return null;
        }
        const newUser: User = {
            ...userData,
            id: `user_${Date.now()}`,
            role: Role.USER,
        };
        const updatedUsers = [...users, newUser];
        // This is a hack for the mock API. In a real app, the API would handle this.
        localStorage.setItem('shuttle_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        setCurrentUser(newUser);
        sessionStorage.setItem('shuttle_user', JSON.stringify(newUser));
        return newUser;
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('shuttle_user');
    };

    const updateUserRole = async (userId: string, role: Role) => {
        const user = users.find(u => u.id === userId);
        if(user){
            await api.updateUser({ ...user, role });
            await fetchData();
        }
    };

    const addEvent = async (eventData: Omit<Event, 'id'>) => {
        await api.createEvent(eventData);
        await fetchData();
    };
    
    const editEvent = async (event: Event) => {
        await api.updateEvent(event);
        await fetchData();
    };

    const removeEvent = async (eventId: string) => {
        await api.deleteEvent(eventId);
        await fetchData();
    };

    const addBooking = async (bookingData: Omit<Booking, 'id'|'qrCode'|'isCheckedIn'>) => {
        const newBooking = await api.createBooking(bookingData);
        if(newBooking) await fetchData();
        return newBooking;
    };

    const editBooking = async (booking: Booking) => {
        await api.updateBooking(booking);
        await fetchData();
    };

    const removeBooking = async (bookingId: string) => {
        await api.deleteBooking(bookingId);
        await fetchData();
    };


    const value = {
        currentUser,
        loading,
        login,
        logout,
        register,
        users,
        events,
        bookings,
        fetchData,
        updateUserRole,
        addEvent,
        editEvent,
        removeEvent,
        addBooking,
        editBooking,
        removeBooking,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
