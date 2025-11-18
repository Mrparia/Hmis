import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Login: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { users } = state;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
            setError('Invalid username or password');
        }
    };
    
    const demoCredentials = [
        { role: 'Admin', user: 'admin' },
        { role: 'Master IT', user: 'masterit'},
        { role: 'HR', user: 'hr' },
        { role: 'Doctor', user: 'doctor' },
        { role: 'Doctor (New)', user: 'doctor1' },
        { role: 'Receptionist', user: 'reception' },
        { role: 'Pharmacist', user: 'pharma' },
        { role: 'Store Incharge', user: 'store' },
    ];

    const imageUrl = "https://storage.googleapis.com/fpl-assets/prod/images/1722026130985-modern-healthcare.png";

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${imageUrl})`,
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)', // Prevents blurred edges from showing
                }}
            ></div>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            <div className="relative flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    <div className="bg-surface/90 backdrop-blur-sm rounded-xl shadow-2xl p-8">
                        <div className="flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-accent" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            <h1 className="text-3xl font-bold ml-2 text-primary">HIMS Pro</h1>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-on-surface">Login</h2>
                        <p className="text-center text-gray-500 mb-6">Welcome back! Please enter your details.</p>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="relative mt-1">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" />
                                                <path d="M10 17a9.953 9.953 0 01-4.522-1.074l1.473-1.473a3.987 3.987 0 005.098-5.098l1.473-1.473A9.953 9.953 0 0110 17z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <div className="text-right mt-1">
                                    <button
                                        type="button"
                                        onClick={() => alert('Password reset functionality is not yet implemented.')}
                                        className="text-sm font-medium text-primary hover:text-primary-dark focus:outline-none focus:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div>
                                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                    Sign in
                                </button>
                            </div>
                        </form>
                    </div>
                     <div className="mt-4 bg-blue-50/90 backdrop-blur-sm border border-blue-200 text-blue-800 text-sm rounded-lg p-4">
                        <h4 className="font-bold mb-2">Demo Credentials:</h4>
                        <p className="mb-2">Use <strong className="font-mono">password</strong> for all accounts.</p>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {demoCredentials.map(cred => (
                                 <li key={cred.role}><strong>{cred.role}:</strong> <span className="font-mono">{cred.user}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;