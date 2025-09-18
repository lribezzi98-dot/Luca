
import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Event, Booking } from '../../types';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import BookingModal from './BookingModal';

declare const QRCode: any; // From CDN via script tag

const UserDashboard: React.FC = () => {
    const { currentUser, events, bookings, loading } = useContext(AppContext);
    const [bookingModalEvent, setBookingModalEvent] = useState<Event | null>(null);
    const [viewBookingQR, setViewBookingQR] = useState<Booking | null>(null);

    const userBookings = useMemo(() => {
        return bookings
            .filter(b => b.userId === currentUser?.id)
            .map(booking => ({
                ...booking,
                event: events.find(e => e.id === booking.eventId)
            }))
            .filter(b => b.event) // Filter out bookings with no associated event
            .sort((a,b) => new Date(a.event!.date).getTime() - new Date(b.event!.date).getTime())
    }, [bookings, events, currentUser]);
    
    const availableEvents = useMemo(() => {
        const bookedEventIds = new Set(userBookings.map(b => b.eventId));
        return events
            .filter(e => !bookedEventIds.has(e.id))
            .filter(e => new Date(e.date) >= new Date(new Date().toDateString())) // Only show future events
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events, userBookings]);

    const getBookingCount = (eventId: string) => bookings.filter(b => b.eventId === eventId).length;

    if (loading) return <Spinner />;

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-indigo-400">Welcome, {currentUser?.firstName}!</h1>
            
            {/* My Bookings Section */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 border-b-2 border-slate-700 pb-2">My Bookings</h2>
                {userBookings.length === 0 ? (
                    <p className="text-slate-400">You have no upcoming bookings.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userBookings.map(booking => {
                            const pickupPoint = booking.event!.pickupPoints.find(p => p.id === booking.pickupPointId);
                            return (
                                <div key={booking.id} className="bg-slate-800 rounded-lg shadow-lg p-5">
                                    <h3 className="text-xl font-bold text-indigo-400">{new Date(booking.event!.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                                    <p className="text-slate-300">Time: {booking.event!.time}</p>
                                    <p className="text-slate-300">Pickup: <strong>{pickupPoint?.name}</strong></p>
                                    <div className="mt-3">
                                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.isCheckedIn ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                            {booking.isCheckedIn ? 'Checked In' : 'Booked'}
                                        </span>
                                    </div>
                                    <Button onClick={() => setViewBookingQR(booking)} className="w-full mt-4">View QR Code</Button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Available Events Section */}
            <div>
                 <h2 className="text-2xl font-semibold mb-4 border-b-2 border-slate-700 pb-2">Available Events</h2>
                {availableEvents.length === 0 ? (
                     <p className="text-slate-400">No new events available for booking right now.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {availableEvents.map(event => {
                             const bookingCount = getBookingCount(event.id);
                             const isFull = bookingCount >= event.capacity;
                             return (
                                <div key={event.id} className="bg-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-indigo-400">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                                        <p className="text-slate-300">Time: {event.time}</p>
                                        <p className="text-slate-400 text-sm mt-2">Available Seats: {event.capacity - bookingCount}</p>
                                    </div>
                                    <Button onClick={() => setBookingModalEvent(event)} disabled={isFull} className="w-full mt-4">
                                        {isFull ? 'Shuttle Full' : 'Book Now'}
                                    </Button>
                                </div>
                             )
                         })}
                    </div>
                )}
            </div>

            {bookingModalEvent && (
                <BookingModal
                    event={bookingModalEvent}
                    isOpen={!!bookingModalEvent}
                    onClose={() => setBookingModalEvent(null)}
                    onBookingSuccess={(booking) => setViewBookingQR(booking)}
                />
            )}
            
            {viewBookingQR && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center" onClick={() => setViewBookingQR(null)}>
                    <div className="bg-white p-8 rounded-lg text-center" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Your QR Code</h3>
                        <p className="text-slate-600 mb-4">Present this to the shuttle manager for check-in.</p>
                        <div className="bg-white p-4 inline-block">
                             <QRCode value={viewBookingQR.qrCode} size={256} />
                        </div>
                         <Button onClick={() => setViewBookingQR(null)} className="mt-6">Close</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
