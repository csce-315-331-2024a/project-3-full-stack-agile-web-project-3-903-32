import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/NavbarManager';
import { useNavigate } from 'react-router-dom';


const isAuthenticatedManager = () => {
  const isManager = localStorage.getItem("isManagerLoggedIn");
  console.log(isManager);
  return isManager;
};

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

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const[shortageItems, setShortageItems] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editInventoryObject, setEditInventoryObject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addModal, setAddModal] = useState(false);

  const handleDeleteMenu = (event) => {
    event.preventDefault();
    if (confirmDelete) {
      setEditModal(false);
      setConfirmDelete(false);
      deleteInventory(editInventoryObject.id);
    } else {
      setConfirmDelete(true);
    }
  }

  const handleOpenEditModal = (event, inventoryObject) => {
    event.preventDefault();
    setEditInventoryObject({...inventoryObject});
    handleCloseAddModal(event);
    setEditModal(true);
  }

  const handleCloseEditModal = (event) => {
    event.preventDefault();
    setEditModal(false);
  }

  const handleOpenAddModal = (event) => {
    event.preventDefault();
    setEditInventoryObject(null);
    handleCloseEditModal(event);
    setAddModal(true);
  }

  const handleCloseAddModal = (event) => {
    event.preventDefault();
    setAddModal(false);
  };

  const submitEditInvetory = (event) => {
    event.preventDefault();
    // console.log("Edit Inventory");
    const form = event.target;
    const name = form.elements['inventory_name'].value;
    if (name === '') {
      alert('Name cannot be empty');
      return;
    }
    const stock = form.elements['inventory_stock'].value;
    if(stock < 0) {
      alert('Stock cannot be negative');
      return;
    }
    const minimum = form.elements['inventory_minimum'].value;
    if(minimum < 0) {
      alert('Minimum cannot be negative');
      return;
    }
    const capacity = form.elements['inventory_capacity'].value;
    if(capacity < 0) {
      alert('Capacity cannot be negative');
      return;
    }
    const location = form.elements['inventory_location'].value;
    if(location === '') {
      alert('Location cannot be empty');
      return;
    }
    const supplier = form.elements['inventory_supplier'].value;
    if(supplier === '') {
      alert('Supplier cannot be empty');
      return;
    }
    putInventory({
      id : editInventoryObject.id,
      name: name,
      stock: stock,
      minimum: minimum,
      capacity: capacity,
      location: location,
      supplier: supplier
    });
    setEditInventoryObject({
      id : editInventoryObject.id,
      name: name,
      stock: stock,
      minimum: minimum,
      capacity: capacity,
      location: location,
      supplier: supplier
    });
  }

  const submitAddInventory = (event) => {
    event.preventDefault();
    // console.log("Edit Inventory");
    const form = event.target;
    const name = form.elements['inventory_name'].value;
    if (name === '') {
      alert('Name cannot be empty');
      return;
    }
    const stock = form.elements['inventory_stock'].value;
    if(stock < 0) {
      alert('Stock cannot be negative');
      return;
    }
    const minimum = form.elements['inventory_minimum'].value;
    if(minimum < 0) {
      alert('Minimum cannot be negative');
      return;
    }
    const capacity = form.elements['inventory_capacity'].value;
    if(capacity < 0) {
      alert('Capacity cannot be negative');
      return;
    }
    const location = form.elements['inventory_location'].value;
    if(location === '') {
      alert('Location cannot be empty');
      return;
    }
    const supplier = form.elements['inventory_supplier'].value;
    if(supplier === '') {
      alert('Supplier cannot be empty');
      return;
    }
    postInventory({
      name: name,
      stock: stock,
      minimum: minimum,
      capacity: capacity,
      location: location,
      supplier: supplier
    });
    handleCloseAddModal(event);
  }

  useEffect(() => {
    getInventory();
    getShortage();
  }, []);

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

  async function getInventory() {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/inventory", {
        method: "GET",
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      } else {
        console.error('Failed to fetch menu:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }

  async function putInventory({id, name, stock, minimum, capacity, location, supplier}) {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/inventory/" + id, {
        method: "PUT",
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "name": name,
          "stock": stock,
          "minimum": minimum,
          "capacity": capacity,
          "location": location,
          "supplier": supplier
        })
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        alert('Inventory item updated');
        getInventory();
      } else {
        console.error('Failed to post inventory:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error posting inventory:', error);
    }
  }

  async function postInventory({name, stock, minimum, capacity, location, supplier}) {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/inventory", {
        method: "POST",
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "name": name,
          "stock": stock,
          "minimum": minimum,
          "capacity": capacity,
          "location": location,
          "supplier": supplier
        })
      });
      if (response.ok) {
        // const data = await response.json();
        // console.log(data);
        alert('Inventory item added');
        getInventory();
      } else {
        console.error('Failed to post inventory:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error posting inventory:', error);
    }
  }

  async function deleteInventory(id) {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/inventory/" + id, {
        method: "DELETE",
        mode: 'cors'
      });
      if (response.ok) {
        alert('Inventory item deleted');
        getInventory();
      } else {
        console.error('Failed to delete inventory:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting inventory:', error);
    }
  }

  async function getShortage() {
    await fetch(process.env.REACT_APP_BACKEND_URL + "/api/inventory/shortage", {
        method: "GET",
        mode: 'cors',
    })
    .then((res) => res.json())
    .then((data) => {
        // console.log(data);
        setShortageItems(data);
    }).catch((err) => {
        console.log(err);
    });
  }

  async function restockInventory(event) {
    event.preventDefault();
    try {
        await fetch(process.env.REACT_APP_BACKEND_URL + "/api/inventory/" + document.querySelector('select[name=restock_selector]').value + "/add", {
            method: "PUT",
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "name": document.querySelector('select[name=restock_selector]').value,
                "add_stock": document.querySelector('input[name=restock_input]').value,
            })
        })
        .then((res) => res.json())
        .then((data) => {
            getInventory();
            getShortage();
            console.log(data['message']);
        }).catch((err) => {
            console.log(err);
        });
    } catch {
        console.log("Error");
    }
  }

  function handleShortage(event) {
    document.querySelector('select[name=restock_selector]').value = event.target.innerText.split('(')[0].slice(0, -1);
    console.log(document.querySelector('input[name=restock_input]').value = event.target.innerText.split('(')[1].split(' ')[2].slice(0, -1));
  }

  const EditMenuModal = () => (
    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 border-2 border-gray-600 bg-gray-50 flex flex-col p-4 rounded'>
      <div className='pb-4 px-4 flex flex-col gap-2'>
        <div className='flex justify-between'>
          <h1 className='font-bold text-xl'>
            Edit Inventory Item
          </h1>
          <button onClick={handleCloseEditModal}><img src={`${process.env.PUBLIC_URL}/x-solid.svg`} alt="Close" className='h-[20px]'/></button>
        </div>
        <form className='flex flex-col gap-2' onSubmit={submitEditInvetory}>
          <div className='flex justify-between'>
            <label htmlFor='inventory_name'>Inventory Name: </label>
            <input required type='text' name='inventory_name' aria-label='inventory_name' defaultValue={editInventoryObject.name}  className='border-2 border-gray-700 rounded px-2 py-1' />
          </div>
          <div className='flex justify-between'>
            <label htmlFor='inventory_stock'>Inventory Stock: </label>
            <input required type='number' name='inventory_stock' aria-label='inventory_stock' defaultValue={editInventoryObject.stock}  className='border-2 border-gray-700 rounded px-2 py-1' />
          </div>
          <div className='flex justify-between'>
            <label htmlFor='inventory_minimum'>Inventory Minimum: </label>
            <input required type='number' name='inventory_minimum' aria-label='inventory_minimum' defaultValue={editInventoryObject.minimum}  className='border-2 border-gray-700 rounded px-2 py-1' />
          </div>
          <div className='flex justify-between'>
            <label htmlFor='inventory_capacity'>Inventory Capacity: </label>
            <input required type='number' name='inventory_capacity' aria-label='inventory_capacity' defaultValue={editInventoryObject.capacity}  className='border-2 border-gray-700 rounded px-2 py-1' />
          </div>
          <div className='flex justify-between'>
            <label htmlFor='inventory_location'>Inventory Location: </label>
            <input required type='text' name='inventory_location' aria-label='inventory_location' defaultValue={editInventoryObject.location}  className='border-2 border-gray-700 rounded px-2 py-1' />
          </div>
          <div className='flex justify-between'>
            <label htmlFor='inventory_supplier'>Inventory Supplier: </label>
            <input required type='text' name='inventory_supplier' aria-label='inventory_supplier' defaultValue={editInventoryObject.supplier}  className='border-2 border-gray-700 rounded px-2 py-1' />
          </div>
          <div className='mt-4 flex justify-between'>
            <button className='rounded border-2 p-2 hover:bg-green-100 border-green-900 text-green-900' type='submit' id='button_save_menu' >Save Inventory Item</button>
            <button className='rounded border-2 p-2 hover:bg-red-100 border-red-700 text-red-700' onClick={handleDeleteMenu}>{confirmDelete ? "Confirm" : "Delete Inventory Item"}</button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddInventoryModal = () => (
    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 border-2 border-gray-600 bg-gray-50 flex flex-col p-4 rounded'>
    <div className='pb-4 px-4 flex flex-col gap-2'>
      <div className='flex justify-between'>
        <h1 className='font-bold text-xl'>
          Add Inventory Item
        </h1>
        <button onClick={handleCloseAddModal}><img src={`${process.env.PUBLIC_URL}/x-solid.svg`} alt="Close" className='h-[20px]'/></button>
      </div>
      <form className='flex flex-col gap-2' onSubmit={submitAddInventory}>
        <div className='flex justify-between'>
          <label htmlFor='inventory_name'>Inventory Name: </label>
          <input required type='text' name='inventory_name' aria-label='inventory_name'  className='border-2 border-gray-700 rounded px-2 py-1' />
        </div>
        <div className='flex justify-between'>
          <label htmlFor='inventory_stock'>Inventory Stock: </label>
          <input required type='number' name='inventory_stock' aria-label='inventory_stock' className='border-2 border-gray-700 rounded px-2 py-1' />
        </div>
        <div className='flex justify-between'>
          <label htmlFor='inventory_minimum'>Inventory Minimum: </label>
          <input required type='number' name='inventory_minimum' aria-label='inventory_minimum' className='border-2 border-gray-700 rounded px-2 py-1' />
        </div>
        <div className='flex justify-between'>
          <label htmlFor='inventory_capacity'>Inventory Capacity: </label>
          <input required type='number' name='inventory_capacity' aria-label='inventory_capacity' className='border-2 border-gray-700 rounded px-2 py-1' />
        </div>
        <div className='flex justify-between'>
          <label htmlFor='inventory_location'>Inventory Location: </label>
          <input required type='text' name='inventory_location' aria-label='inventory_location' className='border-2 border-gray-700 rounded px-2 py-1' />
        </div>
        <div className='flex justify-between'>
          <label htmlFor='inventory_supplier'>Inventory Supplier: </label>
          <input required type='text' name='inventory_supplier' aria-label='inventory_supplier' className='border-2 border-gray-700 rounded px-2 py-1' />
        </div>
        <div className='mt-4 flex justify-between'>
          <button className='rounded border-2 p-2 hover:bg-green-100 border-green-900 text-green-900' type='submit' id='button_save_menu' >Add New Inventory Item</button>
        </div>
      </form>
    </div>
  </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar /> 
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <div className="flex flex-col md:flex-row space-x-0 md:space-x-6">
            <div className="flex-1 bg-white border-b border-gray-200 mb-6"> {/* Inventory table container */}
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Minimum
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="border-b-2 p-4 text-center align-middle font-semibold text-gray-600 uppercase tracking-wider">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 text-center text-gray-700">{item.name}</td>
                      <td className="p-3 text-center text-gray-700">{item.stock}</td>
                      <td className="p-3 text-center text-gray-700">{item.minimum}</td>
                      <td className="p-3 text-center text-gray-700">{item.capacity}</td>
                      <td className="p-3 text-center text-gray-700">{item.location}</td>
                      <td className="p-3 text-center text-gray-700">{item.supplier}</td>
                      <td className="p-3 text-center text-blue-700">
                        <button onClick={(event) => handleOpenEditModal(event, item)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleOpenAddModal} className="w-full p-3 border border-dashed border-black ">+</button>
            </div>
            <div className="w-full md:w-1/3 space-y-6">
              <div className="bg-white p-6 border-b border-gray-200"> {/* Restock form container */}
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Restock Inventory</h2>
                <form onSubmit={restockInventory} className='space-y-2'>
                  <div>
                    <label htmlFor="restock_selector">Select Item</label>
                      <select required name='restock_selector' aria-label='restock_selector' className="w-full p-2 border border-gray-300 rounded">
                      {inventoryItems.map((item) => (
                        <option key={item.name} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="amount">Amount</label>
                    <input required type="number" placeholder='Amount' name='restock_input' aria-label='restock_selector' className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <button type="submit" className="w-full p-2 bg-blue-700 text-white rounded hover:bg-blue-600">Restock</button>
                </form>
              </div>
              <div className="bg-white p-6 border-b border-gray-200"> {/* Shortage items container */}
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Shortage Items</h2>
                <ul className="space-y-2">
                  {shortageItems.length > 0 ? (
                    shortageItems.map((item) => (
                      <li key={item.name} className="p-2 bg-red-100 border border-red-200 rounded">
                        <button className='w-full h-full text-left' onClick={handleShortage}>
                          {item.name} (Short by {item.minimum - item.stock})
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="p-2">No shortage items</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
      {
        editModal && (
          <EditMenuModal />
        )
      }
      {
        addModal && (
          <AddInventoryModal />
        )
      }
    </div>
  );
};

export default withManagerAuthentication(Inventory);
