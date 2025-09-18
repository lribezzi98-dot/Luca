
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { Role } from '../../types';

const Header: React.FC = () => {
    const { currentUser, logout } = useContext(AppContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-slate-800 shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-indigo-400">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 h-8 w-8"><path d="M10 22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1.4a2 2 0 0 0 1.2-3.4L9 0l3 2.5a2 2 0 0 0 1.2.5H16a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1.4a2 2 0 0 0-1.2 3.4L15 24l-3-2.5a2 2 0 0 0-1.2-.5Z"/><path d="m21.6 11.2-1.4-2.4"/><path d="m11.2 21.6-2.4-1.4"/><path d="M12 12v.01"/></svg>
                           ShuttleGO
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {currentUser?.role === Role.ADMIN && (
                             <Link to="/scanner" className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-1"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="7" height="7" x="8.5" y="8.5" rx="1"/><path d="M8 12h8"/></svg>
                                Scan QR
                            </Link>
                        )}
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 bg-slate-700 p-2 rounded-full hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white">
                                <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                                    {currentUser?.firstName.charAt(0)}{currentUser?.lastName.charAt(0)}
                                </span>
                            </button>
                            {dropdownOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                        <p className="font-semibold">{currentUser?.firstName} {currentUser?.lastName}</p>
                                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                                    </div>
                                    <a href="#" onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Logout
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
