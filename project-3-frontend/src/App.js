import React, { useState } from 'react';

function App() {
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
  ]

  // Function to handle login button click
  const handleLogin = () => {
    // You can implement your authentication logic here
    console.log("Username:", username);
    console.log("Password:", password);
    const passwordInt = parseInt(password);
    if (passwords[passwordInt] === username){
      console.log("Successful Login")
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
    </div>
  );
}

export default App;
