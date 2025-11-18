// import { createContext, useState, useEffect } from "react";

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [emails, setEmails] = useState([]); 
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUser = async () => {
//       const userId = localStorage.getItem("userid");
//       if (!userId) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const userRes = await fetch(
//           `http://localhost:5000/auth/getUsers/${userId}`
//         );
//         const userData = await userRes.json();

//         if (!userRes.ok) {
//           console.error(userData.error || "Failed to fetch user");
//           setLoading(false);
//           return;
//         }

//         setUser(userData.data);
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, setUser, emails, setEmails, loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// };
import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userid");
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/auth/getUsers/${userId}`
        );
        const data = await res.json();

        if (!res.ok || !data.data) throw new Error("Failed to fetch user");

        setUser(data.data);
        if (data.data.organization) {
          setOrganization(data.data.organization);
        } else {
          // if not nested, fetch organization manually
          const orgRes = await fetch(
            `http://localhost:5000/organization/${userId}`
          );
          const orgData = await orgRes.json();
          setOrganization(orgData.data);
        }
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const updateUser = (updatedUser) => setUser(updatedUser);
  const updateOrganization = (updatedOrg) => setOrganization(updatedOrg);

  return (
    <UserContext.Provider
      value={{
        user,
        organization,
        setUser,
        updateUser,
        updateOrganization,
        emails,
        setEmails,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
