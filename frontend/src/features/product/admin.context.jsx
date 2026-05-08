import { createContext, useState } from "react";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <AdminContext.Provider
      value={{
        products,
        setProducts,
        users,
        setUsers,
        requests,
        setRequests,
        loading,
        setLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
