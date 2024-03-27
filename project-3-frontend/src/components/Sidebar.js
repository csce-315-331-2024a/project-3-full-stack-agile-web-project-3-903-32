import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-80 h-screen" aria-label="Sidebar"> {/* Increased width to w-80 and height to h-screen */}
      <div className="overflow-y-auto py-4 px-3 bg-gray-50 rounded dark:bg-gray-800">
        <ul className="space-y-4"> {/* Increased spacing between buttons */}
          <li>
            <NavLink
              to="/manager/inventory"
              className={({ isActive }) =>
                `flex items-center p-3 text-lg font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
            >
              Inventory
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manager/menu"
              className={({ isActive }) =>
                `flex items-center p-3 text-lg font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
            >
              Menu
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manager/trends"
              className={({ isActive }) =>
                `flex items-center p-3 text-lg font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`
              }
            >
              Trends
            </NavLink>
          </li>
          {/* Add more links as needed */}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;