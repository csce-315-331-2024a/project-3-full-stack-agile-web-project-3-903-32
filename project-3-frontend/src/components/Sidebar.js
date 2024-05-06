import React from 'react';
import { NavLink } from 'react-router-dom';
/**
 * 
 * @param {*} props inputs for the linke and text
 * @returns The button to navigate to the sidebar
 */
const NavComponent = ( props ) => {
  return (
    <div className='px-2 mt-12'>
      <NavLink
        to={props.to}
          className={({ isActive }) =>
            `mb-6 overflow-y-auto py-4 px-4 bg-gray-50 rounded dark:bg-gray-800 block p-1 text-base font-normal text-gray-900 dark:text-white hover:bg-opacity-70 ${
              isActive ? 'bg-red-300 dark:bg-red-900' : ''
            }`
          }
        >
          {props.text}
      </NavLink>
    </div>
  )
}
/**
 * This element will contain buttions to navigate to the Inventory, Menu, Trends and Orders
 * @returns the sidebar for manager pages to navigate
 */
const Sidebar = () => {
  return (
    <aside className="w-48 h-screen mr-3" aria-label="Sidebar"> 
      {/* Inventory */}
      <NavComponent to="/manager/inventory" text='Inventory' />
      
      {/* Menu */}
      <NavComponent to="/manager/menu" text='Menu' />
      
      {/* Trends */}
      <NavComponent to="/manager/trends" text='Trends' />

      {/* Orders */}
      <NavComponent to="/manager/orders" text='Orders'/>

      {/* Users */}
      <NavComponent to="/manager/users" text='Users'/>
    </aside>
  );
};

export default Sidebar;