import { apiFetch } from "../utils/apiClient";

// import { createContext, useState, useEffect } from "react";

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [organization, setOrganization] = useState(null);
//   const [emails, setEmails] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const userId = localStorage.getItem("userid");
//       if (!userId) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await apiFetch(
//           `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`
//         );
//         const data = await res.json();

//         if (!res.ok || !data.data) throw new Error("Failed to fetch user");

//         setUser(data.data);
//         if (data.data.organization) {
//           setOrganization(data.data.organization);
//         } else {
//           // if not nested, fetch organization manually
//           const orgRes = await apiFetch(
//             `https://email-syncing-backend.vercel.app/organization/${userId}`
//           );
//           const orgData = await orgRes.json();
//           setOrganization(orgData.data);
//         }
//       } catch (err) {
//         console.error("Error loading user:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   const updateUser = (updatedUser) => setUser(updatedUser);
//   const updateOrganization = (updatedOrg) => setOrganization(updatedOrg);

//   return (
//     <UserContext.Provider
//       value={{
//         user,
//         organization,
//         setUser,
//         updateUser,
//         updateOrganization,
//         emails,
//         setEmails,
//         loading,
//       }}
//     >
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

  const refreshUser = async () => {
    const userId = localStorage.getItem("userid");
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("usertoken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await apiFetch(
        `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`,
        { headers }
      );
      const data = await res.json();

      if (!res.ok || !data.data) {
        throw new Error("Failed to fetch user");
      }

      setUser(data.data);

      if (data.data.organization) {
        setOrganization(data.data.organization);
      } else {
        try {
          const orgRes = await apiFetch(
            `https://email-syncing-backend.vercel.app/auth/organization/get/${userId}`,
            { headers }
          );
          const orgData = await orgRes.json();
          if (orgData?.data) {
            setOrganization(orgData.data);
          }
        } catch (orgErr) {
          console.error("Error fetching org:", orgErr);
        }
      }
    } catch (err) {
      console.error("Error refreshing user:", err);
    } finally {
      setLoading(false);
    }
  };
const updateUser = (updatedUser) => {
  setUser(updatedUser);
};

const updateOrganization = (updatedOrg) => {
  setOrganization(updatedOrg);
};

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        organization,
        emails,
        setEmails,
        loading,
updateUser,
    updateOrganization,
        setUser,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
