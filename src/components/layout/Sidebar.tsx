import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Battery, Package, Users, BarChart2 } from 'lucide-react';

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900 bg-opacity-30 transition-opacity duration-200 lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-blue-800 shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between space-x-2 border-b border-blue-900 px-6">
          <div className="flex items-center space-x-2">
            <Battery className="h-7 w-7 text-white" />
            <span className="text-xl font-semibold text-white">Battery MS</span>
          </div>
          <button
            className="text-blue-200 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
        </div>

        {/* Sidebar content */}
        <div className="space-y-1 p-4">
          <SidebarLink
            to="/"
            icon={<BarChart2 className="h-5 w-5" />}
            label="Dashboard"
            active={location.pathname === '/'}
          />
          <SidebarLink
            to="/batteries"
            icon={<Battery className="h-5 w-5" />}
            label="Batteries"
            active={location.pathname.startsWith('/batteries')}
          />
          <SidebarLink
            to="/shipments"
            icon={<Package className="h-5 w-5" />}
            label="Shipments"
            active={location.pathname.startsWith('/shipments')}
          />
          {isAdmin() && (
            <SidebarLink
              to="/users"
              icon={<Users className="h-5 w-5" />}
              label="Users"
              active={location.pathname.startsWith('/users')}
            />
          )}
        </div>
      </div>
    </>
  );
};

type SidebarLinkProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
};

const SidebarLink = ({ to, icon, label, active }: SidebarLinkProps) => {
  return (
    <Link
      to={to}
      className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
        active
          ? 'bg-blue-900 text-white'
          : 'text-blue-100 hover:bg-blue-700 hover:text-white'
      }`}
    >
      <span className="mr-3 flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
};

export default Sidebar;