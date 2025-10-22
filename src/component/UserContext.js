import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userid");
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const userRes = await fetch(
          `http://localhost:5000/auth/getUsers/${userId}`
        );
        const userData = await userRes.json();

        if (!userRes.ok) {
          console.error(userData.error || "Failed to fetch user");
          setLoading(false);
          return;
        }

        setUser(userData.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, emails, setEmails, loading }}>
      {children}
    </UserContext.Provider>
  );
};
