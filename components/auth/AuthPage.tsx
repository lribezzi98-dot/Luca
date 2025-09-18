
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import Input from '../common/Input';
import Button from '../common/Button';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const { login, register } = useContext(AppContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (mode === 'login') {
            const user = await login(formData.email, formData.password);
            if (user) navigate('/');
        } else {
            const { email, password, firstName, lastName, phone } = formData;
            if (email && password && firstName && lastName && phone) {
                 const user = await register({ email, password, firstName, lastName, phone });
                 if(user) navigate('/');
            } else {
                alert("Please fill all fields for registration.");
            }
        }
        setIsLoading(false);
    };
    
    // Simulated Google Login
    const handleGoogleLogin = () => {
        alert("Google login is not implemented in this demo. Please use the mock user accounts (e.g., user@example.com / password).");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
                    </h2>
                </div>

                <div className="bg-slate-800 p-8 rounded-lg shadow-xl">
                    <div className="flex border-b border-slate-700 mb-6">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2 text-sm font-medium ${mode === 'login' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2 text-sm font-medium ${mode === 'register' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}
                        >
                            Register
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                         {mode === 'register' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="First Name" id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} />
                                    <Input label="Last Name" id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} />
                                </div>
                                <Input label="Phone Number" id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} />
                            </>
                        )}
                        <Input label="Email address" id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} />
                        <Input label="Password" id="password" name="password" type="password" autoComplete="current-password" required value={formData.password} onChange={handleChange}/>

                        <div>
                            <Button type="submit" className="w-full" isLoading={isLoading}>
                               {mode === 'login' ? 'Sign in' : 'Register'}
                            </Button>
                        </div>
                    </form>
                    
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Button onClick={handleGoogleLogin} variant="secondary" className="w-full">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0020 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                                </svg>
                                Google
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

