import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/NavbarManager';
import { useNavigate } from 'react-router-dom';

/**
 * This will return to a boolean on the position of the user, returns true if the user is a manager, false otherwise.
 * @returns a boolean, on whether the user is a manager or not.
 */
const isAuthenticatedManager = () => {
  const isManager = localStorage.getItem("isManagerLoggedIn");
  console.log(isManager);
  return isManager;
};

/**
 * This function will determind if a user is a manager. If the user is not a manager they will be sent back to the landing page.
 * @param {object} WrappedComponent 
 * @returns to the landing page if the user is not a manager
 */
const withManagerAuthentication = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const navigate = useNavigate();
    useEffect(() => {
      console.log("HERE");
      if (isAuthenticatedManager() === 'false') {
        navigate('/'); 
      }
    }, [navigate]);

    // Render the wrapped component if the user is authenticated as a manager
    return isAuthenticatedManager() ? <WrappedComponent {...props} /> : null;
  };

  return AuthenticatedComponent;
};
/**
 * This function return the page where manager start from.
 * @returns the Manager Home pages.
 */
const ManagerHome = () => {
  return (
    <div classname='speech'>
      <div className="flex flex-col h-screen bg-gray-100">
        <Navbar /> 
        <div className="flex flex-1 overflow-hidden">
          <Sidebar /> 
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome, Manager!</h2>
              <p className="text-gray-700">
                This is your dashboard where you can find an overview of your managerial tasks and updates.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Wrap ManagerHome with the authentication HOC
export default withManagerAuthentication(ManagerHome);
