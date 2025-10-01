// import { createContext, useState, useEffect } from "react";

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [emails, setEmails] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       const userId = localStorage.getItem("userid");
//       if (!userId) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const userRes = await fetch(
//           `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`
//         );
//         const userData = await userRes.json();

//         if (!userRes.ok) {
//           console.error(userData.error || "Failed to fetch user");
//           setLoading(false);
//           return;
//         }

//         setUser(userData.data);

//         const emailRes = await fetch(
//           `https://email-syncing-backend.vercel.app/mailhook/getAllEmails/${userId}`
//         );
//         const emailData = await emailRes.json();

//         if (!emailRes.ok) {
//           console.error(emailData.error || "Failed to fetch emails");
//           setLoading(false);
//           return;
//         }

//         const rawEmails = emailData.data || [];
//         const threads = [];

//         for (const mail of rawEmails) {
//           try {
//             const threadRes = await fetch(
//               `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${mail._id}`
//             );
//             const threadData = await threadRes.json();
//             if (threadRes.ok) {
//               threads.push(threadData.data);
//             }
//           } catch (err) {
//             console.error("Error fetching thread:", err);
//           }
//         }

//         setEmails(threads);
//       } catch (error) {
//         console.error("Error fetching user/emails:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
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
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("userid");
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const userRes = await fetch(
          `https://email-syncing-backend.vercel.app/auth/getUsers/${userId}`
        );
        const userData = await userRes.json();

        if (!userRes.ok) {
          console.error(userData.error || "Failed to fetch user");
          setLoading(false);
          return;
        }

        setUser(userData.data);

        const emailRes = await fetch(
          `https://email-syncing-backend.vercel.app/mailhook/getAllEmails/${userId}`
        );
        const emailData = await emailRes.json();

        if (!emailRes.ok) {
          console.error(emailData.error || "Failed to fetch emails");
          setLoading(false);
          return;
        }

        const rawEmails = emailData.data || [];

        const threadPromises = rawEmails.map(async (mail) => {
          try {
            const threadRes = await fetch(
              `https://email-syncing-backend.vercel.app/mailhook/getAllEmailsData/${mail._id}`
            );
            const threadData = await threadRes.json();
            if (threadRes.ok) {
              return threadData.data;
            }
          } catch (err) {
            console.error("Error fetching thread:", err);
          }
          return null;
        });

        const threads = (await Promise.all(threadPromises)).filter(Boolean);

        setEmails(threads);
      } catch (error) {
        console.error("Error fetching user/emails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, emails, setEmails, loading }}>
      {children}
    </UserContext.Provider>
  );
};
