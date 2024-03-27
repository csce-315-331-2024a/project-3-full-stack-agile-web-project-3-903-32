import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const blockStyle = `mb-6 overflow-y-auto py-4 px-4 bg-gray-50 rounded dark:bg-gray-800`; 

  return (
    <aside className="w-48 h-screen mr-3" aria-label="Sidebar"> 
      {/* Block 1 */}
      <div className={`${blockStyle} mt-12`}>
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/manager/inventory"
              className={({ isActive }) =>
                `block p-1 text-base font-normal text-gray-900 rounded dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
            >
              Inventory
            </NavLink>
          </li>
        </ul>
      </div>
      {/* Block 2 */}
      <div className={blockStyle}> 
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/manager/menu"
              className={({ isActive }) =>
                `block p-1 text-base font-normal text-gray-900 rounded dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
            >
              Menu
            </NavLink>
          </li>
        </ul>
      </div>
      {/* Block 3 */}
      <div className={blockStyle}> 
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/manager/trends"
              className={({ isActive }) =>
                `block p-1 text-base font-normal text-gray-900 rounded dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
            >
              Trends
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;