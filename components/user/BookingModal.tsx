
import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Event, Booking } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface BookingModalProps {
    event: Event;
    isOpen: boolean;
    onClose: () => void;
    onBookingSuccess: (booking: Booking) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ event, isOpen, onClose, onBookingSuccess }) => {
    const { currentUser, addBooking } = useContext(AppContext);
    const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPickupPoint) {
            setError('Please select a pickup point.');
            return;
        }
        if (!currentUser) {
             setError('You must be logged in to book.');
             return;
        }

        setIsSubmitting(true);
        setError('');

        const newBooking = await addBooking({
            userId: currentUser.id,
            eventId: event.id,
            pickupPointId: selectedPickupPoint,
        });

        if (newBooking) {
            onBookingSuccess(newBooking);
            onClose();
        } else {
             setError('Failed to create booking. The shuttle might be full.');
        }

        setIsSubmitting(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Book Shuttle for ${new Date(event.date).toLocaleDateString()}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <h4 className="text-lg font-semibold text-white">Select Your Pickup Point</h4>
                    <div className="mt-2 space-y-2">
                        {event.pickupPoints.map(point => (
                            <label key={point.id} className="flex items-center p-3 rounded-lg bg-slate-700 hover:bg-slate-600 cursor-pointer">
                                <input
                                    type="radio"
                                    name="pickupPoint"
                                    value={point.id}
                                    checked={selectedPickupPoint === point.id}
                                    onChange={(e) => setSelectedPickupPoint(e.target.value)}
                                    className="h-4 w-4 text-indigo-600 border-slate-500 focus:ring-indigo-500"
                                />
                                <span className="ml-3 text-white">{point.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Confirm Booking</Button>
                </div>
            </form>
        </Modal>
    );
};

export default BookingModal;
