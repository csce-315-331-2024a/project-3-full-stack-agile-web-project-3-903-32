import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/NavbarCashier";


/**
 * Check if the credential are of a cashier.
 * @returns {boolean} If user is Cashier or not 
 */
const isAuthenticatedCashier = () => {
  const isCashier = localStorage.getItem("isCashierLoggedIn");
  console.log(isCashier);
  return isCashier;
};

/**
 * Returns the user back to the landing page with incorrect credentials
 * @param {any} WrappedComponent 
 * @returns user back to landing page when isAuthenticatedCashier is false
 */
const withCashierAuthentication = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const navigate = useNavigate();
    useEffect(() => {
      if (isAuthenticatedCashier() === "false") {
        navigate("/");
      }
    }, [navigate]);

    // Render the wrapped component if the user is authenticated as a cashier
    return isAuthenticatedCashier() ? <WrappedComponent {...props} /> : null;
  };

  return AuthenticatedComponent;
};

const Cashier = () => {
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemIds, setItemIds] = useState([]);
  const [order, setOrder] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const handlePaymentClick = () => {
    navigate("/cashier/payment", { state: { order, total, itemIds } });
  };

  useEffect(() => {
    getMenu();
    if (location.state) {
      const { orderBack, totalBack, itemIdsBack } = location.state;
      setOrder(orderBack);
      setTotal(totalBack);
      setItemIds(itemIdsBack);
    }
  }, [location.state]);

    /**
    * Fetches the menu data from the backend API and updates the component state.
    * 
    * @async
    * @function getMenu
    * @returns {void}
    */
  async function getMenu() {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "/api/menu/ordering",
        {
          method: "GET",
          mode: "cors",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setButtons(data);
        setLoading(false);
      } else {
        console.error(
          "Failed to fetch menu:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  }

    /**
     * Rounds the number up to a speific decimal place
     * @param {number} value - the number to round
     * @param {number} decimals - the number of places to round to
     * @returns The rounded number
     */
    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    /**
    * Adds to new item or add to an existing items quantity
    * @param {*} item - the menu item to add to the list or add another one
    * @returns a new order list 
    */
    const addToOrder = (item) => {
        const price = parseFloat(item.price);
        if (!isNaN(price)) { // Check if the price is a valid number after parsing
            setItemIds((itemIds) => [...itemIds, item.id]);
            setOrder((order) => {
                const existIndex = order.findIndex((orderItem) => orderItem.id === item.id);
                if (existIndex > -1) {
                    const existingItem = order[existIndex];
                    const newQuantity = existingItem.quantity < 99 ? existingItem.quantity + 1 : existingItem.quantity;
                    const newOrder = order.map((orderItem, idx) =>
                        idx === existIndex
                            ? { ...orderItem, quantity: newQuantity }
                            : orderItem
                    );
                    const newTotal = newOrder.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);
                    setTotal(round(newTotal, 2));
                    return newOrder;
                } else {
                    const newOrder = [...order, { ...item, price, quantity: 1 }];
                    const newTotal = newOrder.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);
                    setTotal(round(newTotal, 2));
                    return newOrder;
                }
            });
        } else {
            console.error('item.price is not a valid number', item);
        }
    };
    
    /**
     * Remove an item from the list if there is only 1 item in the list it is removed entirely.
     * @param {object} index - menu item to remove
     * @returns the updated order list.
     */
    const removeFromOrder = (index) => {
        if (index >= 0 && index < order.length) {
            const item = order[index];
            if (item) {
                const price = parseFloat(item.price);
                if (!isNaN(price)) {
                    setTotal((total) => round(total - price, 2));

          setOrder((order) => {
            if (item.quantity > 1) {
              return order.map((orderItem, idx) =>
                idx === index
                  ? { ...orderItem, quantity: orderItem.quantity - 1 }
                  : orderItem
              );
            } else {
              return order.filter((_, idx) => idx !== index);
            }
          });

          setItemIds((itemIds) => {
            const item = order[index];
            if (item) {
              const lastIndex = itemIds.lastIndexOf(item.id);
              if (lastIndex > -1) {
                const newItemIds = [...itemIds];
                newItemIds.splice(lastIndex, 1);
                return newItemIds;
              }
            }
            return itemIds;
          });
        } else {
          console.error("item.price is not a valid number", item);
        }
      } else {
        console.error("No item found at the given index", index);
      }
    } else {
      console.error("Invalid index", index);
    }
    return order;
  };

    /**
     * Changes the amount of the item in the order list based on newQuantity
     * @param {object} index - the item that being changed
     * @param {number} newQuantity the number to set the item quantity
     * @returns nothing
     */
    const changeOrder = (index, newQuantity) => {
        const parseQuantity = parseInt(newQuantity);
        
        if(isNaN(parseQuantity)) {
            return;
        }
        // Check if newQuantity is not a valid number or is less than or equal to 0
        if (parseQuantity <= 0) {
            // Handle invalid quantity input or when quantity is less than or equal to 0
            const item = order[index];
            const price = parseFloat(item.price);
            setTotal((total) => round(total - price * item.quantity, 2));
            setOrder((order) => order.filter((item, idx) => idx !== index));
            return;
        }
    
        // Limit the maximum quantity to 99
        const limitedQuantity = Math.min(parseQuantity, 99);
    
        const oldItem = order[index];
        const oldQuantity = oldItem.quantity;
        const price = parseFloat(oldItem.price);
        const diff = limitedQuantity - oldQuantity;
        const changeInTotal = price * diff;
        
        setTotal((total) => round(total + changeInTotal, 2));
        setOrder((order) =>
            order.map((item, idx) =>
                idx === index
                    ? { ...item, quantity: limitedQuantity }
                    : item
            )
        );
    };
    


  // Group buttons into arrays of 5 buttons each
  const buttonGroups = buttons.reduce((acc, button, index) => {
    const groupIndex = Math.floor(index / 4);
    if (!acc[groupIndex]) {
      acc[groupIndex] = [];
    }
    acc[groupIndex].push(button);
    return acc;
  }, []);

  const totalPages = Math.ceil(buttonGroups.length / 3);

    /**
     * Changes the next page of buttons stops at max
     */
    const nextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
    };
    /**
     * Changes the last page of buttons stops at 0
     */
    const prevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
    };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <Navbar />
      <div className="flex justify-center gap-20 py-10 w-screen h-screen overflow-x-hidden bg-customMaroon text-white">
        <div className="flex-col w-1/2">
          <h1 className="text-6xl font-semibold mb-4">Menu</h1>
          <div>
            <div className="w-[740px] h-[470px] p-4 bg-white rounded-lg overflow-auto text-black">
              {loading ? ( // Render loading state
                <p>Loading...</p>
              ) : (
                buttonGroups
                  .slice(currentPage * 3, currentPage * 3 + 3)
                  .map((group, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="w-full flex justify-start items-center text-center "
                    >
                      {group.map((button, index) => (
                        <div key={index} className="w-1/4">
                          <button
                            onClick={() => addToOrder(button)}
                            className="w-full"
                          >
                            <div className="h-[130px] flex flex-col justify-center p-2 border border-gray-300 bg-gray-200 hover:bg-gray-300 rounded m-2 font-semibold">
                              {button.itemName}
                              <span>${button.price}</span>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  ))
              )}
            </div>
            {buttonGroups.length > 3 && (
              <div className="mt-4 flex justify-center text-black font-semibold text-2xl">
                <button
                  onClick={prevPage}
                  className="mx-2 px-16 py-4 bg-gray-50 hover:bg-gray-300 rounded-lg"
                >
                  &#60;
                </button>
                <p className="mx-2 px-8 py-4 bg-gray-50 rounded-lg ">
                  {currentPage + 1}
                </p>
                <button
                  onClick={nextPage}
                  className="mx-2 px-16 py- bg-gray-50 hover:bg-gray-300 rounded-lg"
                >
                  &#62;
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="w-[30%]">
          <h2 className="font-semibold text-4xl mb-2">Order List</h2>
          <div className="p-4 h-[460px] w-full bg-white text-black rounded-lg">
            <div className="max-h-[430px] w-full overflow-y-auto">
              {order.length > 0 ? (
                <ul>
                  {order.map((item, index) => (
                    <li
                      key={item.id}
                      className={`mt-2 mb-2 font-semibold text-lg ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div>
                          {item.itemName} - ${item.price.toFixed(2)}
                        </div>
                        <div className="mr-2 flex items-center">
                          <button
                            onClick={() => removeFromOrder(index)}
                            style={{ height: 45, width: 30 }}
                            className=" bg-red-500 hover:bg-red-700 rounded-l text-2xl "
                          >
                            -
                          </button>
                          <input
                            style={{ outline: "none" }}
                            className="h-[45px] w-16 px-4 bg-customMaroon text-lg text-center text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              changeOrder(index, parseInt(e.target.value))
                            }
                          />
                          <button
                            onClick={() => addToOrder(item, item.quantity + 1)}
                            style={{ height: 45, width: 30 }}
                            className=" bg-green-500 hover:bg-green-700 rounded-r text-2xl"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 font-semibold text-xl">No items in order.</p>
              )}
            </div>
          </div>
          <div className="text-4xl font-semibold mt-4">
            <h3>
              Total: ${typeof total === "number" ? total.toFixed(2) : "0.00"}
            </h3>
            <button
              onClick={handlePaymentClick}
              className="w-full mt-2 overflow-y-auto py-4 px-8 bg-gray-50 hover:bg-gray-300 rounded-lg text-2xl text-black"
            >
              Go to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withCashierAuthentication(Cashier);
