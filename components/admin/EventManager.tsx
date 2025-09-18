
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Event, PickupPoint } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';

interface EventManagerProps {
    onManageBookings: (event: Event) => void;
}

const EventManager: React.FC<EventManagerProps> = ({ onManageBookings }) => {
    const { events, addEvent, editEvent, removeEvent, loading, bookings } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        capacity: 50,
        pickupPoints: [{ id: `new_${Date.now()}`, name: '' }]
    });

    useEffect(() => {
        if (currentEvent) {
            setFormData({
                date: currentEvent.date,
                time: currentEvent.time,
                capacity: currentEvent.capacity,
                pickupPoints: currentEvent.pickupPoints.length > 0 ? currentEvent.pickupPoints : [{ id: `new_${Date.now()}`, name: '' }],
            });
        } else {
             setFormData({ date: '', time: '', capacity: 50, pickupPoints: [{ id: `new_${Date.now()}`, name: '' }] });
        }
    }, [currentEvent]);

    const handleOpenModal = (event?: Event) => {
        setCurrentEvent(event || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentEvent(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'capacity' ? parseInt(value) : value }));
    };

    const handlePickupPointChange = (index: number, value: string) => {
        const newPickupPoints = [...formData.pickupPoints];
        newPickupPoints[index] = { ...newPickupPoints[index], name: value };
        setFormData(prev => ({ ...prev, pickupPoints: newPickupPoints }));
    };

    const addPickupPoint = () => {
        setFormData(prev => ({
            ...prev,
            pickupPoints: [...prev.pickupPoints, { id: `new_${Date.now()}`, name: '' }]
        }));
    };
    
    const removePickupPoint = (index: number) => {
        const newPickupPoints = formData.pickupPoints.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, pickupPoints: newPickupPoints }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const finalPickupPoints = formData.pickupPoints.filter(p => p.name.trim() !== '');
        if(finalPickupPoints.length === 0){
            alert("Please add at least one valid pickup point.");
            setIsSubmitting(false);
            return;
        }

        const eventData = { ...formData, pickupPoints: finalPickupPoints };
        
        if (currentEvent) {
            await editEvent({ ...currentEvent, ...eventData });
        } else {
            await addEvent(eventData);
        }
        setIsSubmitting(false);
        handleCloseModal();
    };

    const handleDelete = async (eventId: string) => {
        if (window.confirm('Are you sure you want to delete this event and all its bookings?')) {
            await removeEvent(eventId);
        }
    };

    const getBookingCount = (eventId: string) => {
        return bookings.filter(b => b.eventId === eventId).length;
    };

    if (loading) return <Spinner />;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Events</h2>
                <Button onClick={() => handleOpenModal()}>Add New Event</Button>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-10 bg-slate-800 rounded-lg">
                    <p className="text-slate-400">No events found. Add one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => {
                        const bookingCount = getBookingCount(event.id);
                        const isFull = bookingCount >= event.capacity;
                        return (
                            <div key={event.id} className="bg-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-indigo-400">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                                    <p className="text-slate-300 text-lg">{event.time}</p>
                                    <div className="my-3">
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${isFull ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                            {bookingCount} / {event.capacity} Seats Booked
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-400 mt-2">
                                        <p className="font-semibold">Pickup Points:</p>
                                        <ul className="list-disc list-inside">
                                            {event.pickupPoints.map(p => <li key={p.id}>{p.name}</li>)}
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex space-x-2 mt-4">
                                    <Button onClick={() => onManageBookings(event)} variant="secondary" className="flex-1">Manage Bookings</Button>
                                    <Button onClick={() => handleOpenModal(event)} variant="secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </Button>
                                    <Button onClick={() => handleDelete(event.id)} variant="danger">
                                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentEvent ? 'Edit Event' : 'Add New Event'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                        <Input label="Time" name="time" type="time" value={formData.time} onChange={handleChange} required />
                    </div>
                    <Input label="Capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleChange} required />
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Pickup Points</label>
                        {formData.pickupPoints.map((point, index) => (
                            <div key={point.id} className="flex items-center space-x-2 mb-2">
                                <input
                                    type="text"
                                    placeholder={`Pickup Point ${index + 1}`}
                                    value={point.name}
                                    onChange={(e) => handlePickupPointChange(index, e.target.value)}
                                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {formData.pickupPoints.length > 1 && (
                                     <Button type="button" variant="danger" onClick={() => removePickupPoint(index)} className="!p-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="secondary" onClick={addPickupPoint}>Add Pickup Point</Button>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>{currentEvent ? 'Save Changes' : 'Create Event'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default EventManager;
