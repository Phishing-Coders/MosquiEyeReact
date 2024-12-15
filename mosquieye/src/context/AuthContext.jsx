// import { createContext, useContext, useEffect } from 'react';
// import { useAuth as useClerkAuth } from "@clerk/clerk-react";
// import axios from 'axios';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const { isLoaded, userId, sessionId, getToken, user } = useClerkAuth();
  
//   const isAuthenticated = !!userId;

//     useEffect(() => {
//     const saveUserToDb = async () => {
//       if (user) {
//         try {
//           const userDetails = {
//             userId: user.id,
//             email: user.primaryEmailAddress?.emailAddress,
//             firstName: user.firstName,
//             lastName: user.lastName
//           };
  
//           console.log('Attempting to save user:', userDetails);
//           const response = await axios.post('http://localhost:5000/api/users/saveUser', userDetails);
//           console.log('Server response:', response.data);
//         } catch (error) {
//           console.error('Error saving user:', error.response?.data || error.message);
//         }
//       }
//     };
  
//     if (isAuthenticated && user) {
//       saveUserToDb();
//     }
//   }, [isAuthenticated, user]);

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, isLoaded, userId }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext } from 'react';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isLoaded, userId, sessionId, getToken, user } = useClerkAuth();
  const isAuthenticated = !!userId;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoaded, userId, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);