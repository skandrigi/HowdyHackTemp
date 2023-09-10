import React, { useEffect, useState } from "react";
import axios from "axios";
import SimpleCard from "./components/SimpleCard.jsx";
// Import SignupCard from its correct path
import SignupCard from "./components/SignupCard.jsx";

function App() {
  const [data, setData] = useState(null);

  const registerUser = (email, password) => {
    // Your registration logic here.
    console.log("User registered with", email, password);
  };

  const [showSignup, setShowSignup] = useState(false);

  return (
    <>
      {showSignup ? (
        <SignupCard
          switchToLogin={() => setShowSignup(false)}
          onRegister={registerUser}
        />
      ) : (
        <SimpleCard switchToSignup={() => setShowSignup(true)} />
      )}
    </>
  );
}

export default App;
