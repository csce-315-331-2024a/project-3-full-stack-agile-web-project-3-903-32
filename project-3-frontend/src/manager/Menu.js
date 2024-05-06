import React, { useState, useEffect } from 'react';
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


const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [menuModal, setMenuModal] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [menuId, setMenuId] = useState('');
  const [itemInventoryList, setItemInventoryList] = useState([]);
  const [itemOutsideInventoryList, setItemOutsideInventoryList] = useState([]);
  const [addMenuModal, setAddMenuModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getMenu();
    getCategory();
  }, []);

  useEffect(() => {
    if (addMenuModal) {
      validateAddMenu();
      const curr_name = document.getElementsByName('add_menu_name')[0];
      curr_name.addEventListener('input', validateAddMenu);
      const curr_price = document.getElementsByName('add_menu_price')[0];
      curr_price.addEventListener('input', validateAddMenu);
      const curr_category = document.getElementsByName('add_menu_category')[0];
      curr_category.addEventListener('input', validateAddMenu);
    }
  }, [addMenuModal]);

  useEffect(() => {
    if (confirmDelete) {
      const timeout_id = setTimeout(() => {
        if (confirmDelete) {
          setConfirmDelete(false);
        }
      }, 2500);

      return () => clearTimeout(timeout_id);
    }
  }, [confirmDelete]);

  const handleCloseModal = (event) => {
    event.preventDefault();
    setMenuModal(false);
    setAddMenuModal(false);
    setMenuId('');
    setMenuName('');
    setMenuPrice('');
    setMenuCategory('');
    setItemInventoryList([]);
    setItemOutsideInventoryList([]);
  }

  const handleSaveMenu = (event) => {
    event.preventDefault();
    setMenuModal(false);
    putMenu(menuId, document.getElementById('item_name').value, parseFloat(document.getElementById('item_price').value).toFixed(2), document.getElementById('item_category').value);
  }

  const handleDeleteMenu = (event) => {
    event.preventDefault();
    if (confirmDelete) {
      setMenuModal(false);
      setConfirmDelete(false);
      deleteMenu(menuId);
    } else {
      setConfirmDelete(true);
    }
  }

  const handleAddMenu = (event) => {
    event.preventDefault();
    const curr_name = document.getElementsByName('add_menu_name')[0].value;
    const curr_price = parseFloat(document.getElementsByName('add_menu_price')[0].value).toFixed(2);
    const curr_category = document.getElementsByName('add_menu_category')[0].value;
    postMenu(curr_name, curr_price, curr_category);
  }

  const validateAddMenu = () => {
    const curr_name = document.getElementsByName('add_menu_name')[0].value;
    const curr_price = document.getElementsByName('add_menu_price')[0].value;
    const add_button = document.getElementsByName('add_menu_button')[0];
    if (curr_name === '' || curr_price === '') {
      add_button.style.color = 'gray';
      add_button.disabled = true;
    } else {
      add_button.style.color = 'black';
      add_button.disabled = false;
    }
  }

  const handleAddItem = (event) => {
    event.preventDefault();
    if (document.getElementById('newItemAmount').value !== ''
      && document.getElementById('newItemSelect').value !== '') {
      document.getElementById('newItemAmount').value = parseFloat(document.getElementById('newItemAmount').value).toFixed(2);
      postMenuInventory(menuId);
    }
  }

  const handleDeleteItem = (event) => {
    event.preventDefault();
    deleteMenuInventory(menuId, event.target.id);
  }

  const handleEditItem = (event) => {
    event.preventDefault();
    setMenuId(menuItems[event.target.id].id);
    setMenuName(menuItems[event.target.id].itemName);
    setMenuPrice(menuItems[event.target.id].price);
    setMenuCategory(menuItems[event.target.id].category);
    getMenuInventory(menuItems[event.target.id].id);
    getOutsideMenuInventory(menuItems[event.target.id].id);
    setAddMenuModal(false);
    setMenuModal(true);
  }

  const handleChangeAmount = (index, event) => {
    // 13 is the keycode for enter
    if (event.keyCode === 13) {
      document.getElementsByName('editItemAmount')[index].value = parseFloat(document.getElementsByName('editItemAmount')[index].value).toFixed(2);
      itemInventoryList[index].itemAmount = document.getElementsByName('editItemAmount')[index].value;
      putMenuInventory(menuId, index);
    }
  }

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

  async function postMenu(menu_name, menu_price, menu_category) {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/menu", {
        method: "POST",
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "itemName": menu_name, "price": menu_price, "category": menu_category })
      });
      if (response.ok) {
        getMenu();
        alert('New menu item added successfully!');
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          alert(errorData.error); // Display error message for duplication
        } else {
          console.error('Failed to fetch menu:', response.status, response.statusText);
          alert('Failed to add the menu item. Please try again.'); // Generic error for other cases
        }
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  async function putMenu(menu_id, menu_name, menu_price, menu_category) {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/menu/" + menu_id, {
        method: "PUT",
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "itemName": menu_name, "price": menu_price, "category": menu_category })
      });
      if (response.ok) {
        getMenu();
        alert('Menu name: ' + menu_name + ', $' + menu_price + ' and ' + menu_category + ' updated successfully!');
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  async function deleteMenu(menu_id) {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/menu/" + menu_id, {
        method: "DELETE",
        mode: 'cors'
      });
      if (response.ok) {
        getMenu();
        alert('Menu item deleted successfully!');
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  async function getMenuInventory(menu_id) {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/mijunc/" + menu_id, {
        method: "GET",
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setItemInventoryList(data);
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  async function postMenuInventory(menu_id) {
    try {
      const selectedItemId = document.getElementById('newItemSelect').value;
      const selectedAmount = document.getElementById('newItemAmount').value;
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/mijunc/" + menu_id, {
        method: "POST",
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "itemID": selectedItemId, "itemAmount": selectedAmount })
      });
      if (response.ok) {
        getMenuInventory(menu_id);
        getOutsideMenuInventory(menu_id);
        // alert('New ingredient added to menu item successfully!');
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  async function deleteMenuInventory(menu_id, index) {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/mijunc/" + menu_id, {
        method: "DELETE",
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "itemID": itemInventoryList[index].itemID })
      });
      if (response.ok) {
        getMenuInventory(menu_id);
        getOutsideMenuInventory(menu_id);
        // alert('Ingredient removed from menu item successfully!');
      } else {
        console.error('Failed to delete menu inventory:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting menu inventory:', error);
    }
  }

  async function putMenuInventory(menu_id, index) {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/mijunc/" + menu_id, {
        method: "PUT",
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "itemID": itemInventoryList[index].itemID, "itemAmount": itemInventoryList[index].itemAmount })
      });
      if (response.ok) {
        getMenuInventory(menu_id);
        alert('Ingredient amount updated successfully!');
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  async function getOutsideMenuInventory(menu_id) {
    try {
      // console.log(menu_id);
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/mijunc/outside/" + menu_id, {
        method: "GET",
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setItemOutsideInventoryList(data);
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  async function getCategory() {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/menu/category", {
        method: "GET",
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setMenuCategory(data[0]); // Set default category if available
        }
      } else {
        console.error('Failed to fetch categories:', response.status);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const EditMenuModal = () => (
    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-600 bg-gray-50 flex flex-col p-4 rounded'>
      <div className='pb-4 px-4 flex flex-col relative'>
        <div>
          <label htmlFor='item_name'>Name:</label>
          <input className='my-2 px-2 mx-4 bg-gray-200 rounded' type='text' id='item_name' defaultValue={menuName} />
          <label htmlFor='item_price'>Price:</label>
          <input className='px-2 mx-4 bg-gray-200 rounded w-1/4' type='text' id='item_price' defaultValue={menuPrice} />
          <button onClick={handleCloseModal}><img src={`${process.env.PUBLIC_URL}/x-solid.svg`} alt="Close" className='h-[20px] absolute right-1 top-3'/></button>
        </div>
        <div>
          <label htmlFor='item_category'>Category:</label>
          <select className='px-2 mx-4 bg-gray-200 rounded' id='item_category' defaultValue={menuCategory}>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      <div className='mx-4 flex justify-between'>
        <button className='rounded border-2 p-2 hover:bg-green-100 border-green-900 text-green-900' id='button_save_menu' onClick={handleSaveMenu}>Save Menu Item</button>
        <button className='rounded border-2 p-2 hover:bg-red-100 border-red-700 text-red-700' onClick={handleDeleteMenu}>{confirmDelete ? "Confirm" : "Delete Menu Item"}</button>
      </div>
      <h1 className='text-center font-bold border-t-2 border-gray-500 mt-6 pt-6'>Menu Ingredients</h1>
      <table>
        <thead>
          <tr className='text-left'>
            <th>Inventory Name</th>
            <th>Amount</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {
            itemInventoryList.map((item, index) => (
              <tr key={index}>
                <td className='py-1'><label htmlFor={item.itemName}>{item.itemName}</label></td>
                <td><input className='px-2 bg-gray-200 rounded' id={item.itemName} type="number" name='editItemAmount' defaultValue={item.itemAmount} onKeyDown={e => handleChangeAmount(index, e)} /></td>
                <td><button id={index} onClick={handleDeleteItem} className='text-red-600'>Remove</button></td>
              </tr>
            ))
          }
          <tr className='border-t-2 border-gray-500'>
            <td className='py-2'>
              <select id='newItemSelect' className='px-2 bg-gray-200 rounded'>
                {
                  itemOutsideInventoryList.map((item, index) => (
                    <option key={index} value={item.itemID}>{item.itemName}</option>
                  ))
                }
              </select>
            </td>
            <td>
              <input className='px-2 bg-gray-200 rounded' type='number' id='newItemAmount' />
            </td>
            <td>
              <button onClick={handleAddItem}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const AddMenuModal = () => (
    <tr>
      <td className='p-4'><label htmlFor='add_menu_name'>Menu Name:</label>
        <input className='bg-gray-200 rounded px-2 ml-2' type='text' name='add_menu_name' />
      </td>
      <td className='p-4'><label htmlFor='add_menu_price'>Price: </label>
        <input className='bg-gray-200 rounded px-2 ml-2 w-3/5' type='number' name='add_menu_price' />
      </td>
      <td className='p-4'>
        <label htmlFor='add_menu_category'>Category:</label>
        <select className='bg-gray-200 rounded px-2 ml-2' name='add_menu_category'>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </td>
      <td className='p-4 pl-0'><button name='add_menu_button' onClick={handleAddMenu}>Add</button></td>
    </tr>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="border-b-2 p-4 text-left text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="border-b-2 p-4 text-left text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="border-b-2 p-4 text-left text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="border-b-2 p-4 pl-0 text-left text-base font-semibold text-gray-600 uppercase tracking-wider">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="p-4 text-base text-gray-700 w-5/12">{item.itemName}</td>
                  <td className="p-4 text-base text-gray-700 w-1/4">${item.price}</td>
                  <td className="p-4 text-base text-gray-700 w-1/3">{item.category}</td>
                  <td className="p-4 pl-0 text-base text-gray-700"><button id={index} className='text-blue-700 hover:text-blue-900' onClick={handleEditItem}>Edit</button></td>
                </tr>
              ))}
              {
                addMenuModal ?
                  <AddMenuModal /> :
                  <tr key={-1} className="bg-white border-b h-12 hover:cursor-pointer" onClick={() => setAddMenuModal(true)}>
                    <td className="border-gray-700 border-dotted border-2 border-r-0"></td>
                    <td className="text-center text-2xl border-gray-700 border-dotted border-2 border-x-0 text-gray-700">+</td>
                    <td className="border-gray-700 border-dotted border-2 border-x-0 text-gray-700"></td>
                    <td className="border-gray-700 border-dotted border-2 border-l-0"></td>
                  </tr>
              }
            </tbody>
          </table>
          {
            menuModal &&
            <EditMenuModal />
          }
        </main>
      </div>
    </div>
  );
};

export default withManagerAuthentication(Menu);