import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerConfirm.css'; // Import CSS file for animation

/**
 * Returns confirmation page for the customer.
 * @returns The Customer confirmation page
 */
const CustomerConfirm = () => {
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            toCustomer();
        }, 3000);
    }, []);

    const toCustomer = () => {
        navigate('/customer');
    };

    return (
        <div className='flex h-screen bg-customMaroon justify-center items-center'>
            <div className='text-center'>
                <h1 className='text-8xl font-bold text-white mb-4 bounce-once'>Thank you!</h1>
                <div>
                    <h2 className='text-5xl font-semibold text-white mb-4 bounce-once'>Your order has been placed</h2>
                </div>
            </div>
        </div>
    );
};

export default CustomerConfirm;