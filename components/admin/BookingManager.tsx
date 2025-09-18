
import React, { useContext, useState, useMemo } from 'react';
import { Event, Booking, User } from '../../types';
import { AppContext } from '../../contexts/AppContext';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { saveAs } from 'file-saver';


declare const Papa: any; // From CDN

interface BookingManagerProps {
    event: Event;
}

const BookingManager: React.FC<BookingManagerProps> = ({ event }) => {
    const { bookings, users, removeBooking, addBooking, editBooking, loading } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({ userId: '', pickupPointId: '' });

    const eventBookings = useMemo(() => {
        return bookings
            .filter(b => b.eventId === event.id)
            .map(booking => {
                const user = users.find(u => u.id === booking.userId);
                const pickupPoint = event.pickupPoints.find(p => p.id === booking.pickupPointId);
                return { ...booking, user, pickupPoint };
            })
            .sort((a, b) => (a.user?.lastName || '').localeCompare(b.user?.lastName || ''));
    }, [bookings, users, event]);

    const handleOpenModal = (booking?: Booking) => {
        setCurrentBooking(booking || null);
        setFormData({
            userId: booking?.userId || '',
            pickupPointId: booking?.pickupPointId || '',
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentBooking(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.userId || !formData.pickupPointId) {
            alert("Please select a user and a pickup point.");
            return;
        }

        setIsSubmitting(true);
        if (currentBooking) {
            await editBooking({ ...currentBooking, ...formData });
        } else {
            await addBooking({ eventId: event.id, userId: formData.userId, pickupPointId: formData.pickupPointId });
        }
        setIsSubmitting(false);
        handleCloseModal();
    };
    
    const handleDelete = async (bookingId: string) => {
        if(window.confirm('Are you sure you want to cancel this booking?')) {
            await removeBooking(bookingId);
        }
    }
    
    const handleExport = () => {
        const dataToExport = eventBookings.map(b => ({
            "First Name": b.user?.firstName,
            "Last Name": b.user?.lastName,
            "Email": b.user?.email,
            "Phone": b.user?.phone,
            "Pickup Point": b.pickupPoint?.name,
            "Checked In": b.isCheckedIn ? 'Yes' : 'No',
            "Booking ID": b.id,
        }));
        
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `bookings_event_${event.date}.csv`);
    }

    if (loading) return <Spinner />;

    const availableUsers = users.filter(user => !eventBookings.some(b => b.userId === user.id));

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Bookings</h2>
                <div className="space-x-2">
                    <Button onClick={handleExport} variant="secondary">Export to CSV</Button>
                    <Button onClick={() => handleOpenModal()}>Add Booking Manually</Button>
                </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-300">User</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Contact</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Pickup Point</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Status</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventBookings.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-6 text-slate-400">No bookings for this event yet.</td></tr>
                            ) : (
                                eventBookings.map(({ id, user, pickupPoint, isCheckedIn }) => (
                                    <tr key={id} className="border-b border-slate-700 last:border-0">
                                        <td className="p-4 whitespace-nowrap">{user?.firstName} {user?.lastName}</td>
                                        <td className="p-4 text-slate-300 whitespace-nowrap">{user?.email}<br/>{user?.phone}</td>
                                        <td className="p-4 text-slate-300 whitespace-nowrap">{pickupPoint?.name}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isCheckedIn ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                {isCheckedIn ? 'Checked In' : 'Booked'}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Button onClick={() => handleDelete(id)} variant="danger" className="!p-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentBooking ? 'Edit Booking' : 'Add Manual Booking'}>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="user" className="block text-sm font-medium text-slate-300 mb-1">User</label>
                        <select 
                            id="user" 
                            value={formData.userId} 
                            onChange={e => setFormData(prev => ({...prev, userId: e.target.value}))}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={!!currentBooking}
                        >
                            <option value="">Select a user</option>
                            {availableUsers.map(user => <option key={user.id} value={user.id}>{user.firstName} {user.lastName} ({user.email})</option>)}
                            {currentBooking && <option value={currentBooking.userId}>{(users.find(u=>u.id===currentBooking.userId))?.firstName} {(users.find(u=>u.id===currentBooking.userId))?.lastName}</option>}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="pickupPoint" className="block text-sm font-medium text-slate-300 mb-1">Pickup Point</label>
                        <select 
                            id="pickupPoint" 
                            value={formData.pickupPointId}
                            onChange={e => setFormData(prev => ({...prev, pickupPointId: e.target.value}))}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select a pickup point</option>
                            {event.pickupPoints.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>{currentBooking ? 'Save Changes' : 'Create Booking'}</Button>
                    </div>
                 </form>
            </Modal>
        </div>
    );
};

export default BookingManager;
