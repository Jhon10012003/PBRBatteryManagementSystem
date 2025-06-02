import { Bell, Menu, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type HeaderProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="mr-4 text-gray-500 hover:text-gray-600 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Battery Shipment Monitoring & Control
            </h1>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-600">
              <span className="sr-only">Notifications</span>
              <Bell className="h-5 w-5" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 rounded-full bg-gray-100 p-1 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                  <User className="h-5 w-5" />
                </div>
                <span className="hidden text-sm font-medium md:block">{user?.name}</span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="truncate text-xs text-gray-500">{user?.email}</p>
                    <p className="mt-1 text-xs font-medium text-blue-600 capitalize">{user?.role}</p>
                  </div>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;