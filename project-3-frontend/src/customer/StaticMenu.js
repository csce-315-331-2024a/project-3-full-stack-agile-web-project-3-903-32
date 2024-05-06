import React, { useState, useEffect } from 'react';

const imageMapping = {
  'Bacon Cheeseburger': '../baconCheeseburger.png',
  'shakeImg': '../shake.png',
  'Cheeseburger': '../cheeseburger.png',
  'Black Bean Burger': '../blackBeanBurger.png',
  'Chicken Caesar Salad': '../caesarSalad.png',
  'Aggie Chicken Club': '../chickenClub.png',
  'chickenWrap': '../chickenWrap.png',
  'cookieIceCream': '../cookieIceCream.png',
  'Corn Dog Value Meal': '../corndog.png',
  'fishSandwich': '../fishSandwich.png',
  'fountainDrink': '../fountainDrink.png',
  'fries': '../fries.png',
  'Revs Grilled Chicken Sandwich': '../grilledChickenSandwich.png',
  'Classic Hamburger': '../hamburger.png',
  '2 Hot Dog Value Meal': '../hotdog.png',
  'iceCreamScoop': '../iceCreamScoop.png',
  'Gig Em Patty Melt': '../pattymelt.png',
  'rootBeerFloat': '../rootBeerFloat.png',
  'Spicy Chicken Sandwich': '../spicyChickenSandwich.png',
  'Tender Entree': '../tenders.png',
  'tunaMelt': '../tunaMelt.png',
  'waterBottle': '../waterBottle.png',
  'tamuLogo': '../tamu-logo.png' 
};

const StaticMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [maxItemsPerCategory, setMaxItemsPerCategory] = useState(0);
  const [columnHeight, setColumnHeight] = useState('auto');

  useEffect(() => {
    getMenu();
  }, []);

  async function getMenu() {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/menu", {
        method: "GET",
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        const filteredItems = data.filter(item =>
          item.category === 'Sandwiches' ||
          item.category === 'Burgers' ||
          item.category === 'Value Meals'
        );
        const groupedItems = groupByCategory(filteredItems);
        const maxItems = Math.max(...Object.values(groupedItems).map(category => category.length));
        setMaxItemsPerCategory(maxItems);
        setColumnHeight(`${maxItems * 200}px`); 
        setMenuItems(groupedItems);
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  function groupByCategory(items) {
    return items.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }

  return (
    <div className='h-screen bg-gray-200 relative'>
      <div className="container mx-auto px-2 py-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {Object.entries(menuItems).map(([category, categoryItems], index) => (
            <div key={index} className={category === 'Burgers' ? 'md:col-span-2' : ''}>
              <h2 className={`text-2xl font-semibold mb-2 underline ${category === 'Burgers' ? 'text-white' : 'text-black'}`}>{category}</h2>
              <div className={`grid grid-cols-1 ${category === 'Burgers' ? 'md:grid-cols-2' : ''} gap-4`}>
                {categoryItems.map((item, itemIndex) => (
                  <div key={itemIndex} className="p-2 flex">
                    <img 
                      src={imageMapping[item.itemName] || imageMapping['tamuLogo']} 
                      alt={item.itemName} 
                      className="w-40 h-40 mr-4 object-cover" 
                    />
                    <div>
                      <h3 className={`text-xl font-semibold mb-1 ${category === 'Burgers' ? 'text-white' : 'text-black'}`}>{item.itemName}</h3>
                      <p className={`text-xl font-bold ${category === 'Burgers' ? 'text-white' : 'text-black'}`}>${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed top-0 right-0 h-full w-1/2 bg-red-900 z-0"></div> 
      <div className="fixed top-0 left-0 h-full w-1/2 bg-white z-0"></div>
      <div className="absolute top-0 left-0 h-full w-1/2 z-0">
        <img src={imageMapping['tamuLogo']} alt="TAMU Logo" className="w-full h-full object-cover opacity-80" style={{ opacity: 0.2 }} />
      </div>
    </div>
  );
};

export default StaticMenu;
