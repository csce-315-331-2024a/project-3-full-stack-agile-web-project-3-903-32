import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

//This .js exist to prevent the same order to be hit more than once.
const CashierConfirm = () => {
    

    
    const navigate = useNavigate();

    
    useEffect(() => {
        setTimeout(() => {
            toCashier();
          }, 3000);
    });

    const toCashier = () => {
        navigate('/cashier');
    };

    return (
        <div className='flex h-screen bg-customMaroon justify-center items-center'>
            <div className='text-center'>
                <h1 className='text-8xl font-semibold text-white mb-4'> Thank You for your purchase!</h1>
                <div>
                    <h2 className='text-5xl font-semibold text-white mb-4'> Please give us a moment while we prepare you order</h2>
                </div>
            </div>

        </div>
    );
};

export default CashierConfirm;
