import React, { useState, useEffect } from 'react';

const StaticMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [columnWidth, setColumnWidth] = useState('auto');
  const [maxNumColumns, setMaxNumColumns] = useState(4); // Maximum number of columns

  useEffect(() => {
    getMenu();
    handleResize(); // Initialize column width
    window.addEventListener('resize', handleResize); // Listen for window resize
    return () => window.removeEventListener('resize', handleResize); // Clean up event listener
  }, []);

  useEffect(() => {
    calculateColumns(); // Calculate the number of columns on component mount
  }, [menuItems]);

  async function getMenu() {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/menu", {
        method: "GET",
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  function calculateColumns() {
    const screenWidth = window.innerWidth;
    const minColumnWidth = 300; // Minimum width for each column
    const maxColumns = Math.floor(screenWidth / minColumnWidth); // Maximum number of columns
    setMaxNumColumns(maxColumns);
    const calculatedColumnWidth = Math.floor(screenWidth / maxColumns); // Calculate column width
    setColumnWidth(calculatedColumnWidth + 'px');
  }

  function handleResize() {
    calculateColumns(); // Recalculate column width on window resize
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }} className='h-screen overflow-auto bg-red-900 text-white'>
      <div className="container mx-auto px-4 py-8 bg-maroon">
        <h1 className="text-2xl font-semibold mb-4 text-white">Menu</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
          {menuItems.map((item, index) => (
            <div key={index} className="relative">
              <div className="p-4 rounded text-white mb-4" style={{ width: columnWidth, backgroundColor: 'transparent' }}>
                <h2 className="text-lg font-semibold mb-2 ">{item.itemName}</h2>
                <p className="text-black absolute bottom-0 right-0 mr-4">${item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaticMenu;