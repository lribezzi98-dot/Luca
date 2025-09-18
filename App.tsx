
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './contexts/AppContext';
import { Role } from './types';
import AuthPage from './components/auth/AuthPage';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import QRScanner from './components/admin/QRScanner';
import Header from './components/common/Header';

const App: React.FC = () => {
    return (
        <AppProvider>
            <HashRouter>
                <Main />
            </HashRouter>
        </AppProvider>
    );
};

const Main: React.FC = () => {
    const { currentUser } = useContext(AppContext);

    return (
        <div className="min-h-screen bg-slate-900">
            {currentUser && <Header />}
            <main className="p-4 sm:p-6 lg:p-8">
                <Routes>
                    <Route path="/login" element={!currentUser ? <AuthPage /> : <Navigate to="/" />} />
                    
                    <Route path="/admin/*" element={
                        <ProtectedRoute requiredRole={Role.ADMIN}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/scanner" element={
                        <ProtectedRoute requiredRole={Role.ADMIN}>
                            <QRScanner />
                        </ProtectedRoute>
                    } />

                    <Route path="/" element={
                        <ProtectedRoute>
                            {currentUser?.role === Role.ADMIN ? <Navigate to="/admin" /> : <UserDashboard />}
                        </ProtectedRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
                </Routes>
            </main>
        </div>
    );
};

interface ProtectedRouteProps {
    children: React.ReactElement;
    requiredRole?: Role;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { currentUser, loading } = useContext(AppContext);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && currentUser.role !== requiredRole) {
        return <Navigate to="/" />;
    }

    return children;
};

export default App;
