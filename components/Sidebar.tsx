import React from 'react';
import { View, UserRole } from '../types';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
}

interface NavItemProps {
  view: View;
  label: string;
  icon: React.ReactNode;
  activeView: View;
  onClick: (view: View) => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ view, label, icon, activeView, onClick, isCollapsed }) => {
  const isActive = activeView === view;
  return (
    <li
      title={isCollapsed ? label : undefined}
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
        isActive ? 'bg-secondary text-white shadow-lg' : 'text-gray-300 hover:bg-primary-light hover:text-white'
      } ${isCollapsed ? 'justify-center' : ''}`}
      onClick={() => onClick(view)}
    >
      {icon}
      {!isCollapsed && <span className="ml-4 font-medium whitespace-nowrap">{label}</span>}
    </li>
  );
};

const allNavItems = [
    { view: 'DASHBOARD', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { view: 'PATIENTS', label: 'Patients', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-5.197" /></svg> },
    { view: 'DOCTORS', label: 'Doctors', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4 4m0 0l4-4m-4 4h14m-5 4v-4a2 2 0 00-2-2h-3a2 2 0 00-2 2v4m-4-7l4-4m0 0l4 4m-4-4v12" /></svg> },
    { view: 'EMPLOYEES', label: 'Employee Hub', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.282-.237-1.887M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.282.237-1.887M12 15a4 4 0 100-8 4 4 0 000 8z" /></svg> },
    { view: 'BILLING', label: 'Billing', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { view: 'INVENTORY', label: 'Inventory', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
    { view: 'PROCUREMENT', label: 'Procurement', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 10h10M3 13h4" /></svg> },
    { view: 'REPORTS', label: 'Reports', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { view: 'AUDIT_LOG', label: 'Audit Log', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { view: 'SETTINGS', label: 'System Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
] as const;

const viewPermissions: Record<UserRole, View[]> = {
    'Admin': ['DASHBOARD', 'PATIENTS', 'DOCTORS', 'EMPLOYEES', 'BILLING', 'INVENTORY', 'PROCUREMENT', 'REPORTS', 'AUDIT_LOG', 'SETTINGS'],
    'Master IT': ['SETTINGS'],
    'HR': ['DASHBOARD', 'EMPLOYEES'],
    'Doctor': ['DASHBOARD', 'PATIENTS', 'EMPLOYEES'],
    'Receptionist': ['DASHBOARD', 'PATIENTS', 'BILLING', 'EMPLOYEES'],
    'Pharmacist': ['DASHBOARD', 'BILLING', 'INVENTORY', 'EMPLOYEES'],
    'Nurse': ['DASHBOARD', 'PATIENTS', 'EMPLOYEES'],
    'Paramedical': ['DASHBOARD', 'PATIENTS', 'EMPLOYEES'],
    'Store Incharge': ['DASHBOARD', 'INVENTORY', 'PROCUREMENT', 'EMPLOYEES'],
    'Housekeeping': ['DASHBOARD', 'EMPLOYEES'],
};

const getNavItemsForRole = (role: UserRole | undefined) => {
    if (!role) return [];
    const accessibleViews = viewPermissions[role];
    return allNavItems.filter(item => accessibleViews.includes(item.view));
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed }) => {
    const { state } = useAppContext();
    const { currentUser } = state;

    const navItems = getNavItemsForRole(currentUser?.role);
    
  return (
    <aside className={`bg-primary text-white flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-center p-6 border-b border-primary-light h-[73px] overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
        {!isCollapsed && <h1 className="text-2xl font-bold ml-2 whitespace-nowrap">HIMS Pro</h1>}
      </div>
      <nav className="flex-1 px-4 py-4">
        <ul>
          {navItems.map(item => (
            <NavItem
                key={item.view}
                view={item.view}
                label={item.label}
                icon={item.icon}
                activeView={activeView}
                onClick={setActiveView}
                isCollapsed={isCollapsed}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;