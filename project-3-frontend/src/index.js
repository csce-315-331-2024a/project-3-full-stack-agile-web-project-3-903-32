import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Cashier from './cashier/Cashier';
import Manager from './managers/Manager';
import Inventory from './managers/Inventory';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [],
  },
  // {
  //   path: '/about',
  //   element: <About name="Hello" />
  // },
  {
    path: '/cashier',
    element: <Cashier name="Hello"/>
  },
  {
    path: 'manager',
    element: <Manager/>,
    children: [
      {
        path: 'inventory',
        element: <Inventory/>
      },
      // {
      //   path: '/employees',
      //   element: <Employees/>
      // },
      // {
      //   path: '/trends',
      //   element: <Trends/>
      // },
      // {
      //   path: '/menu',
      //   element: <Menu/>
      // }
    ]
  },
  {
    path: '/inventory',
    element: <Inventory/>
  },

]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
