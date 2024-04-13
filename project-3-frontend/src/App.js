import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginButton from "./components/login.js";
import LogoutButton from "./components/logout.js";
import { gapi } from 'gapi-script';

const clientId = "417248299016-d2tdli4igl731cienis995uaaeetb4vt.apps.googleusercontent.com";

function App() {

  useEffect(() => {
    function start(){
    gapi.client.init({
      clientId: clientId,
      scope: ""
    })
  };
  
  gapi.load('client:auth2',start);
  })


  const navigate = useNavigate();
  
  // Initialize state variables to store input values
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handler functions to update state when input values change
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const passwords = [
    "ozpass",
    "nolanpass",
    "jimothypass",
    "rebeccapass",
    "georgepass",
    "kyliepass"
  ];

  // Function to handle login button click
  const handleLogin = () => {
    // You can implement your authentication logic here
    console.log("Username:", username);
    console.log("Password:", password);
    const passwordInt = parseInt(password);
    if (passwords[passwordInt] === username){
      console.log("Successful Login");
      // Redirect to inventory page
      if(passwordInt === 0 || passwordInt === 2){
        navigate('/manager');
      } else {
        navigate('/cashier')
      }
    } else {
      console.log("Login Failed!");
    }
  };

  return (
    
    <div className="flex flex-col items-center">
      <h1 className="bg-red-900 text-white p-10 text-center text-9xl mb-8">Rev's American Grill</h1>
      <div className="bg-gray-200 p-4 rounded-lg mb-4">
        <input 
          className="bg-white border border-gray-300 rounded px-4 py-2 mb-2" 
          type="text" 
          placeholder="Enter your username" 
          value={username} 
          onChange={handleUsernameChange} 
        />
        <input 
          className="bg-white border border-gray-300 rounded px-4 py-2" 
          type="password" 
          placeholder="Enter your password" 
          value={password} 
          onChange={handlePasswordChange} 
        />
      </div>
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleLogin}
      >
        Login
      </button>
      <LoginButton />
    </div>
  );
}

export default App;
