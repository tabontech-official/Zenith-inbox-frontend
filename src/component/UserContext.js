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
import { normalizeTimeZone, systemTimeZone } from "../utils/timezone";

export const UserContext = createContext();

/*
 * The account's timezone, resolved once here so every screen formats
 * timestamps the same way.
 *
 * The organisation's setting wins over the individual user's: a run log
 * is a record of the business's automation, and two colleagues looking
 * at the same run should see the same clock time.
 */
const resolveAccountTimeZone = (user, organization) =>
  normalizeTimeZone(
    organization?.TimeZone || user?.TimeZone || systemTimeZone()
  );

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
   * Starts at the browser's zone so the very first render is already
   * local, then settles to whatever the account says once it loads.
   */
  const [timeZone, setTimeZoneState] = useState(systemTimeZone);

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

  /*
   * Keep the resolved zone in step with whatever is loaded, and adopt
   * the browser's zone for an account that has never chosen one.
   *
   * TimeZoneAuto marks a setting that is still automatic. It goes false
   * the moment someone picks a zone in settings, after which this never
   * touches it again — otherwise a deliberate choice would be silently
   * undone every time the user travelled.
   */
  useEffect(() => {
    if (!user && !organization) return;

    const stored = organization?.TimeZone || user?.TimeZone || "";
    const stillAutomatic =
      (organization?.TimeZoneAuto ?? user?.TimeZoneAuto ?? true) !== false;
    const detected = systemTimeZone();

    if (stillAutomatic && detected && normalizeTimeZone(stored) !== detected) {
      setTimeZoneState(detected);
      persistTimeZone(detected, { auto: true });
      return;
    }

    setTimeZoneState(resolveAccountTimeZone(user, organization));
  }, [user, organization]);

  /*
   * Write the zone back to the account. `auto` records whether this was
   * a detection or a deliberate choice.
   */
  const persistTimeZone = async (zone, { auto = false } = {}) => {
    const userId = localStorage.getItem("userid");
    if (!userId || !zone) return;

    try {
      const token = localStorage.getItem("usertoken");

      await apiFetch(
        `https://email-syncing-backend.vercel.app/auth/updateUserAndOrganization/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            TimeZone: zone,
            TimeZoneAuto: auto,
          }),
        },
      );

      setOrganization((prev) =>
        prev ? { ...prev, TimeZone: zone, TimeZoneAuto: auto } : prev,
      );
      setUser((prev) =>
        prev ? { ...prev, TimeZone: zone, TimeZoneAuto: auto } : prev,
      );
    } catch (err) {
      /*
       * A failed write is not worth interrupting anyone for: the zone is
       * already applied in memory, and the next load re-detects it.
       */
      console.error("Could not save the timezone:", err);
    }
  };

  /* Called by the settings form — a deliberate choice, never automatic. */
  const setTimeZone = (zone) => {
    const resolved = normalizeTimeZone(zone);
    setTimeZoneState(resolved);
    persistTimeZone(resolved, { auto: false });
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
        timeZone,
        setTimeZone,
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
