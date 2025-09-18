
import React, { useState } from 'react';
import EventManager from './EventManager';
import UserManager from './UserManager';
import BookingManager from './BookingManager';
import { Event } from '../../types';

type AdminView = 'events' | 'users' | 'bookings';

const AdminDashboard: React.FC = () => {
    const [view, setView] = useState<AdminView>('events');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const handleManageBookings = (event: Event) => {
        setSelectedEvent(event);
        setView('bookings');
    };
    
    const renderView = () => {
        switch(view) {
            case 'users':
                return <UserManager />;
            case 'bookings':
                 if (!selectedEvent) {
                    setView('events'); // Should not happen, but as a fallback
                    return null;
                }
                return <BookingManager event={selectedEvent} />;
            case 'events':
            default:
                return <EventManager onManageBookings={handleManageBookings}/>;
        }
    }

    const getTabClass = (tabName: AdminView) => 
        `px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 ${
            view === tabName ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
        }`;

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-indigo-400">Admin Dashboard</h1>
            <div className="flex space-x-2 border-b border-slate-700 mb-6">
                <button onClick={() => setView('events')} className={getTabClass('events')}>
                    Manage Events
                </button>
                <button onClick={() => setView('users')} className={getTabClass('users')}>
                    Manage Users
                </button>
                 {view === 'bookings' && selectedEvent && (
                    <button onClick={() => setView('bookings')} className={getTabClass('bookings')}>
                        Bookings for "{new Date(selectedEvent.date).toLocaleDateString()}"
                    </button>
                )}
            </div>
            <div>{renderView()}</div>
        </div>
    );
};

export default AdminDashboard;
