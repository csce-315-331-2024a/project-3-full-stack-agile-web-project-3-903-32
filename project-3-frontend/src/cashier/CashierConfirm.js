import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CashierConfirm.css'; // Import CSS file for animation

const isAuthenticatedCashier = () => {
    const isCashier = localStorage.getItem("isCashierLoggedIn");
    console.log(isCashier);
    return isCashier;
  };
  
  const withCashierAuthentication = (WrappedComponent) => {
    const AuthenticatedComponent = (props) => {
      const navigate = useNavigate();
      useEffect(() => {
        if (isAuthenticatedCashier() == 'false') {
          navigate('/'); 
        }
      }, [navigate]);
  
      // Render the wrapped component if the user is authenticated as a cashier
      return isAuthenticatedCashier() ? <WrappedComponent {...props} /> : null;
    };
  
    return AuthenticatedComponent;
  };
  


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

export default withCashierAuthentication(CashierConfirm);
