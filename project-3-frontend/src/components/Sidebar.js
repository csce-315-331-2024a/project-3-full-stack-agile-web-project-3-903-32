import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-48 h-screen mr-3" aria-label="Sidebar"> 
      {/* Inventory */}
      <div className={`mt-12`}>
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/manager/inventory"
              className={({ isActive }) =>
                `mb-6 overflow-y-auto py-4 px-4 bg-gray-50 rounded dark:bg-gray-800 block p-1 text-base font-normal text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-red-300 dark:bg-red-900' : ''
                }`
              }
            >
              Inventory
            </NavLink>
          </li>
        </ul>
      </div>
      {/* Menu */}
      <div> 
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/manager/menu"
              className={({ isActive }) =>
                `mb-6 overflow-y-auto py-4 px-4 bg-gray-50 rounded dark:bg-gray-800 block p-1 text-base font-normal text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-red-300 dark:bg-red-900' : ''
                }`
              }
            >
              Menu
            </NavLink>
          </li>
        </ul>
      </div>
      {/* Trends */}
      <div> 
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/manager/trends"
              className={({ isActive }) =>
                `mb-6 overflow-y-auto py-4 px-4 bg-gray-50 rounded dark:bg-gray-800 block p-1 text-base font-normal text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-red-300 dark:bg-red-900' : ''
                }`
              }
            >
              Trends
            </NavLink>
          </li>
        </ul>
      </div>
      {/* Orders */}
      <div> 
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/manager/orders"
              className={({ isActive }) =>
                `mb-6 overflow-y-auto py-4 px-4 bg-gray-50 rounded dark:bg-gray-800 block p-1 text-base font-normal text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isActive ? 'bg-red-300 dark:bg-red-900' : ''
                }`
              }
            >
              Orders
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;