import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from "@react-oauth/google"
import { gapi } from 'gapi-script';
import { jwtDecode } from "jwt-decode";

const clientId = "417248299016-d2tdli4igl731cienis995uaaeetb4vt.apps.googleusercontent.com";



function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    function start(){
      gapi.client.init({
        clientId: clientId,
        scope: ""
      }).then(() => {
        console.log("Google API initialized successfully");
      }).catch((error) => {
        console.error("Error initializing Google API:", error);
      });
    };
  
    gapi.load('client:auth2', start);
  }, []);

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

  const handleLogin = () => {
    const passwordInt = parseInt(password);
    if (passwords[passwordInt] === username){
      console.log("Successful Login");
      if(passwordInt == 0 || passwordInt == 2){
        navigate('/manager');
      } else {
        navigate('/cashier')
      }
    } else {
      console.log("Login Failed!");
    }
  };

  const loginManager = () => {
    navigate('/manager');
  }

  const loginCashier = () => {
    navigate('/cashier');
  }

  const loginMenu = () => {
    navigate('/customer/StaticMenu');
  }



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
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          const decoded = jwtDecode(credentialResponse?.credential);
          console.log(decoded.email);
          if (decoded.email == "csce315manager@gmail.com"){
            loginManager();
          } else if (decoded.email == "csce315cashier@gmail.com"){
            loginCashier();
          } else {
            loginMenu();
          }
        }}
        onError={(error) => {
          console.error("Google login failed:", error);
        }}
      />
    </div>
  );
}

export default App;
