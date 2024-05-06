import React, { useState, useEffect} from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/NavbarManager';
import ExcessReport from '../components/ExcessReport';
import SalesReport from '../components/SalesReport';
import ProductUsage from '../components/ProductUsage';
import SellsTogether from '../components/SellsTogether';
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



const ReportButton = ({ reportName, onReportSelected, isActive }) => {
  const activeClasses = "bg-blue-500 hover:bg-blue-700 text-white";
  const inactiveClasses = "bg-white hover:bg-gray-100 text-gray-800";

  return (
    <button
      onClick={() => onReportSelected(reportName)}
      className={`px-4 py-2 rounded-md shadow-md font-medium text-sm transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {reportName}
    </button>
  );
};

/**
 * This page is the default page that connects to tables and graphs.
 * @returns Trends page
 */
const Trends = () => {
  const [activeReport, setActiveReport] = useState(null);

  console.log('Current active report:', activeReport);
  const handleReportChange = (reportType) => {
    setActiveReport(reportType);
  };

  const reports = [
    { key: 'salesReport', name: 'Sales Report' },
    { key: 'excessReport', name: 'Excess Report' },
    { key: 'productUsage', name: 'Product Usage' },
    { key: 'sellsTogether', name: 'What Sells Together' },
  ];

  return (
    <div className="flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-grow p-4">
          <div className="flex space-x-2 mb-4">
            {reports.map((report) => (
              <ReportButton
                key={report.key}
                reportName={report.name}
                onReportSelected={handleReportChange}
                isActive={activeReport === report.name}
              />
            ))}
          </div>
          
          <div>
            {activeReport === 'Sales Report' && <SalesReport />}
            {activeReport === 'Excess Report' && <ExcessReport />}
            {activeReport === 'Product Usage' && <ProductUsage />}
            {activeReport === 'What Sells Together' && <SellsTogether />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default withManagerAuthentication(Trends);