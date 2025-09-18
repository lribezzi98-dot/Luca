
import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Booking, User, Event, PickupPoint } from '../../types';
import Button from '../common/Button';

// Type for the Html5Qrcode library from CDN
declare const Html5Qrcode: any;

interface FoundBooking {
    booking: Booking;
    user: User | undefined;
    event: Event | undefined;
    pickupPoint: PickupPoint | undefined;
}

const QRScanner: React.FC = () => {
    const { bookings, users, events, editBooking } = useContext(AppContext);
    const [scanResult, setScanResult] = useState<FoundBooking | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        if (!isScanning) return;

        const qrScanner = new Html5Qrcode("reader");
        const qrCodeSuccessCallback = (decodedText: string) => {
            handleScanSuccess(decodedText);
            qrScanner.stop().catch((err: any) => console.error("Failed to stop scanner", err));
            setIsScanning(false);
        };
        const qrCodeErrorCallback = (error: any) => {
            // console.warn(error);
        };
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        Html5Qrcode.getCameras().then((devices: any[]) => {
            if (devices && devices.length) {
                const cameraId = devices.find(d => d.label.toLowerCase().includes('back'))?.id || devices[0].id;
                qrScanner.start({ deviceId: { exact: cameraId } }, config, qrCodeSuccessCallback, qrCodeErrorCallback)
                    .catch((err: any) => {
                        setErrorMessage("Failed to start scanner. Please grant camera permissions.");
                        console.error(err);
                    });
            } else {
                 setErrorMessage("No camera found.");
            }
        }).catch((err: any) => {
            setErrorMessage("Could not get camera devices.");
            console.error(err);
        });
        
        return () => {
             qrScanner.stop().catch((err: any) => {
                // Ignore "Scanner is not running" error
                if(!err.message.includes("not running")){
                    console.error("Failed to stop scanner on cleanup", err)
                }
             });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScanning]);

    const handleScanSuccess = (decodedText: string) => {
        const booking = bookings.find(b => b.qrCode === decodedText);
        if (booking) {
            const user = users.find(u => u.id === booking.userId);
            const event = events.find(e => e.id === booking.eventId);
            const pickupPoint = event?.pickupPoints.find(p => p.id === booking.pickupPointId);
            setScanResult({ booking, user, event, pickupPoint });
            setErrorMessage(null);
        } else {
            setScanResult(null);
            setErrorMessage("Invalid QR Code: Booking not found.");
        }
    };
    
    const handleCheckIn = async () => {
        if(!scanResult) return;
        setIsCheckingIn(true);
        await editBooking({ ...scanResult.booking, isCheckedIn: true });
        setScanResult(prev => prev ? { ...prev, booking: { ...prev.booking, isCheckedIn: true } } : null);
        setIsCheckingIn(false);
    }
    
    const resetScanner = () => {
        setScanResult(null);
        setErrorMessage(null);
        setIsScanning(true);
    };

    return (
        <div className="container mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-indigo-400">QR Code Scanner</h1>
            
            <div className="bg-slate-800 rounded-lg shadow-xl p-6">
                {isScanning && (
                    <>
                        <div id="reader" className="w-full"></div>
                        {errorMessage && <p className="text-red-400 text-center mt-4">{errorMessage}</p>}
                    </>
                )}

                {!isScanning && (
                     <div className="text-center">
                        {errorMessage && (
                            <div className="bg-red-500/20 text-red-300 p-4 rounded-md">
                                <h3 className="font-bold text-lg">Error</h3>
                                <p>{errorMessage}</p>
                            </div>
                        )}
                        {scanResult && (
                             <div className={`p-4 rounded-md ${scanResult.booking.isCheckedIn ? 'bg-green-500/20 text-green-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                                <h3 className="font-bold text-lg mb-2">Booking Found</h3>
                                <p className="text-2xl font-semibold text-white">{scanResult.user?.firstName} {scanResult.user?.lastName}</p>
                                <p className="text-slate-300">{scanResult.user?.email}</p>
                                <hr className="border-slate-600 my-3" />
                                <p><strong>Event Date:</strong> {new Date(scanResult.event?.date || '').toLocaleDateString()}</p>
                                <p><strong>Pickup:</strong> {scanResult.pickupPoint?.name}</p>
                                <p className="mt-2 text-xl font-bold">
                                    Status: {scanResult.booking.isCheckedIn ? 'ALREADY CHECKED-IN' : 'VALID'}
                                </p>
                                {!scanResult.booking.isCheckedIn && (
                                    <Button onClick={handleCheckIn} isLoading={isCheckingIn} className="mt-4">
                                        Check In
                                    </Button>
                                )}
                            </div>
                        )}
                        <Button onClick={resetScanner} variant="secondary" className="mt-6">
                            Scan Another Ticket
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRScanner;
