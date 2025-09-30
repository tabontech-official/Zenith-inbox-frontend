import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userid"); 
      if (!userId) return;

      try {
        const response = await fetch(
          `http://localhost:5000/auth/getUsers/${userId}`
        );
        const data = await response.json();
        if (response.ok) {
          setUser(data.data);
        } else {
          console.error(data.error || "Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
