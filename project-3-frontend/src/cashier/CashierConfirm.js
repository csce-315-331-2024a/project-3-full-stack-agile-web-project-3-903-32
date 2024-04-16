import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CashierConfirm.css'; // Import CSS file for animation

const CashierConfirm = () => {
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            toCashier();
        }, 3000);
    }, []);

    const toCashier = () => {
        navigate('/cashier');
    };

    return (
        <div className='flex h-screen bg-customMaroon justify-center items-center'>
            <div className='text-center'>
                <h1 className='text-8xl font-bold text-white mb-4 bounce-once'>Order has been Submitted!</h1>
                <div>
                    <h2 className='text-5xl font-semibold text-white mb-4 bounce-once'>Please give us a moment</h2>
                </div>
            </div>
        </div>
    );
};

export default CashierConfirm;
