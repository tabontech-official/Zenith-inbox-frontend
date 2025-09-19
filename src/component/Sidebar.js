import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Sidebar = () => {
  const [activeLink, setActiveLink] = useState('organization');
  const [activeTab, setActiveTab] = useState('ai_at_make');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderNavLink = (name, label, iconSvg, to) => (
    <Link
      to={to} // Link to the respective route
      onClick={() => setActiveLink(name)}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
        activeLink === name
          ? 'bg-[#7a469f] text-white font-semibold'
          : 'text-gray-200 hover:bg-[#7a469f] hover:text-white'
      }`}
    >
      {iconSvg}
      <span>{label}</span>
    </Link>
  );

  const iconClasses = 'w-5 h-5';
  
  return (
    <div>
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-[#B35CCC] via-[#B35CCC] to-[#8753c4] text-white flex flex-col p-6 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center space-x-2 mb-8">
          <img
            src="https://placehold.co/40x40/5B21B6/white?text=A"
            alt="Logo"
            className="rounded-full"
          />
          <h1 className="text-xl font-semibold">My Organization</h1>
        </div>

        <div className="flex-1 space-y-2 text-sm">
          {renderNavLink(
            'organization',
            'Organization',
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={iconClasses}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>,
            '/organization' // Set the route here
          )}

          <div className="text-xs text-gray-200 uppercase font-medium mb-2 mt-4">
            My Team
          </div>

          {/* {renderNavLink(
            'team',
            'Team',
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={iconClasses}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>,
            '/team' // Set the route here
          )} */}

          {renderNavLink(
            'scenarios',
            'Scenarios',
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={iconClasses}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2.5l-2.4 2.4" />
              <path d="M11 15.5l1.5 1.5l1.5-1.5l1.5 1.5l1.5-1.5l1.5 1.5V18l-1.5-1.5l-1.5 1.5l-1.5-1.5l-1.5 1.5l-1.5-1.5V15.5z" />
              <path d="M16.5 10.5l1.5 1.5l1.5-1.5l1.5 1.5l1.5-1.5v1.5l-1.5-1.5l-1.5 1.5l-1.5-1.5l-1.5 1.5l-1.5-1.5V12z" />
              <path d="M12.5 6.5l-1.5-1.5l-1.5 1.5l-1.5-1.5l-1.5 1.5l-1.5-1.5v-1.5l1.5 1.5l1.5-1.5l1.5 1.5l1.5-1.5l1.5 1.5z" />
              <path d="M9.5 19.5l-1.5-1.5l-1.5 1.5l-1.5-1.5v1.5l1.5 1.5l1.5-1.5l1.5 1.5z" />
              <path d="M5.5 14.5l1.5 1.5l1.5-1.5l1.5 1.5l1.5-1.5v1.5l-1.5-1.5l-1.5 1.5l-1.5-1.5z" />
              <path d="M9.5 2.5l1.5 1.5l1.5-1.5l1.5 1.5z" />
              <path d="M1.5 10.5l-1.5-1.5l-1.5 1.5l-1.5-1.5z" />
            </svg>,
            '/scenarios' // Set the route here
          )}

          {renderNavLink(
            'templates',
            'Templates',
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={iconClasses}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 20h-7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" />
              <path d="M10 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" />
            </svg>,
            '/templates' 
          )}

          {renderNavLink(
            'connections',
            'Connections',
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={iconClasses}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v19" />
              <path d="M12 21a2 2 0 0 0-2-2" />
              <path d="M12 19a2 2 0 0 0 2 2" />
            </svg>,
            '/connection' // Set the route here
          )}

          {/* {renderNavLink(
            'more',
            'More',
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={iconClasses}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>,
            '/more' // Set the route here
          )} */}
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
