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
import CashierPayment from './cashier/CashierPayment';
import ManagerHome from './manager/ManagerHome';
import Trends from './manager/Trends';
import Inventory from './manager/Inventory';
import Menu from './manager/Menu';

import { GoogleOAuthProvider } from '@react-oauth/google';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [],
  },
  {
    path: '/cashier',
    element: <Cashier />
  },
  {
    path: '/cashier/payment',
    element: <CashierPayment />
  },
  {
    path: '/manager',
    element: <ManagerHome />,
    children: [],
  },
  {
    path: '/manager/trends',
    element: <Trends />,
    children: [],
  },
  {
    path: '/manager/inventory',
    element: <Inventory />,
    children: [],
  },
  {
    path: '/manager/menu',
    element: <Menu />,
    children: [],
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId = "417248299016-d2tdli4igl731cienis995uaaeetb4vt.apps.googleusercontent.com">
    <RouterProvider router={router}/>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();