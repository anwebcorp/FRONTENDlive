import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Accounts() {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            <div className="bg-white border-b border-neutral-200 py-3 px-4 shadow-sm relative z-10 flex items-center justify-start">
                <button
                    onClick={handleBack}
                    className="text-blue-600 text-lg font-normal flex items-center active:text-blue-700"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back
                </button>
                <h1 className="text-xl font-semibold text-neutral-900 text-center absolute left-1/2 -translate-x-1/2">
                    Accounts
                </h1>
            </div>
            
            <div className="p-4">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Accounts Management</h2>
                {/* Add your accounts management content here */}
            </div>
        </div>
    );
}
