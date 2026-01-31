import { useState, useEffect } from "react";
import { Link, Navigate, Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Menu,
  Moon,
  Sun,
  Maximize,
  Minimize,
  User,
  X,
} from "lucide-react";

// Theme Settings Drawer Component
const ThemeSettings = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  sidebarTheme,
  setSidebarTheme,
  width,
  setWidth,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[300px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 bg-[#727cf5] text-white">
          <h5 className="font-semibold text-lg">Theme Settings</h5>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-60px)]">
          {/* Color Scheme */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 mb-3 uppercase">
              Color Scheme
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  className="hidden peer"
                  checked={theme === "light"}
                  onChange={() => setTheme("light")}
                />
                <div className="border-2 border-transparent peer-checked:border-[#727cf5] rounded overflow-hidden relative">
                  <div className="h-12 bg-gray-100 flex items-center justify-center text-gray-800 text-xs shadow-inner">
                    Light
                  </div>
                </div>
                <div className="text-center text-xs mt-1 text-gray-600">
                  Light
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  className="hidden peer"
                  checked={theme === "dark"}
                  onChange={() => setTheme("dark")}
                />
                <div className="border-2 border-transparent peer-checked:border-[#727cf5] rounded overflow-hidden relative">
                  <div className="h-12 bg-[#313a46] flex items-center justify-center text-white text-xs shadow-inner">
                    Dark
                  </div>
                </div>
                <div className="text-center text-xs mt-1 text-gray-600">
                  Dark
                </div>
              </label>
            </div>
          </div>

          {/* Sidebar Color */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 mb-3 uppercase">
              Sidebar Color
            </h5>
            <div className="grid grid-cols-3 gap-3">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="sidebar"
                  className="hidden peer"
                  checked={sidebarTheme === "light"}
                  onChange={() => setSidebarTheme("light")}
                />
                <div className="h-8 bg-white border border-gray-200 rounded peer-checked:ring-2 ring-[#727cf5]"></div>
                <div className="text-center text-xs mt-1">Light</div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="sidebar"
                  className="hidden peer"
                  checked={sidebarTheme === "dark"}
                  onChange={() => setSidebarTheme("dark")}
                />
                <div className="h-8 bg-[#313a46] border border-gray-600 rounded peer-checked:ring-2 ring-[#727cf5]"></div>
                <div className="text-center text-xs mt-1">Dark</div>
              </label>
            </div>
          </div>

          {/* Layout Width */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 mb-3 uppercase">
              Layout Width
            </h5>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="width"
                  value="fluid"
                  checked={width === "fluid"}
                  onChange={() => setWidth("fluid")}
                  className="text-[#727cf5] focus:ring-[#727cf5]"
                />
                <span className="ml-2 text-sm text-gray-700">Fluid</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="width"
                  value="boxed"
                  checked={width === "boxed"}
                  onChange={() => setWidth("boxed")}
                  className="text-[#727cf5] focus:ring-[#727cf5]"
                />
                <span className="ml-2 text-sm text-gray-700">Boxed</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AdminLayout = () => {
  const { isAuthenticated, logout, user } = useAuth();

  // States matching legacy functionality
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [theme, setTheme] = useState("light"); // light | dark
  const [sidebarTheme, setSidebarTheme] = useState("dark"); // light | dark
  const [layoutWidth, setLayoutWidth] = useState("fluid"); // fluid | boxed
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Apply Theme effects
  useEffect(() => {
    // Logic to toggle dark mode on body/html
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin_panel/login" />;
  }

  // Sidebar styles based on theme
  const sidebarBg =
    sidebarTheme === "dark"
      ? "bg-[#313a46]"
      : "bg-white border-r border-gray-200";
  const sidebarText =
    sidebarTheme === "dark" ? "text-[#8391a2]" : "text-gray-600";
  const sidebarTextActive =
    sidebarTheme === "dark" ? "text-white" : "text-[#727cf5]";
  const sidebarHover =
    sidebarTheme === "dark" ? "hover:text-white" : "hover:text-[#727cf5]";

  return (
    <div
      className={`flex h-screen bg-[#fafbfe] ${theme === "dark" ? "bg-gray-900" : ""} overflow-hidden`}
    >
      {/* Sidebar */}
      <div
        className={`${isSidebarCollapsed ? "w-[70px]" : "w-[260px]"} ${sidebarBg} flex flex-col shadow-lg z-20 shrink-0 transition-all duration-300`}
      >
        {/* Logo Box */}
        <div
          className={`h-[70px] flex items-center justify-center sticky top-0 ${sidebarBg} z-10 transition-colors`}
        >
          <Link
            to="/admin_panel/dashboard"
            className="flex items-center justify-center"
          >
            {isSidebarCollapsed ? (
              <img
                src="/assets/images/logo-sm.png"
                alt="logo"
                className="h-6"
              />
            ) : // Assuming logo logic based on sidebar theme
            sidebarTheme === "dark" ? (
              <img src="/assets/images/logo.png" alt="logo" className="h-10" />
            ) : (
              <img
                src="/assets/images/logo-dark.png"
                alt="logo"
                className="h-10"
              />
            )}
          </Link>
        </div>

        {/* Sidenav */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {/* Navigation Title */}
          {!isSidebarCollapsed && (
            <div className="px-6 mb-3 text-xs font-bold uppercase tracking-widest opacity-75 text-gray-400">
              Navigation
            </div>
          )}

          <nav className="space-y-1">
            {[
              {
                path: "/admin_panel/dashboard",
                icon: LayoutDashboard,
                label: "Dashboard",
              },
              {
                path: "/admin_panel/products",
                icon: Package,
                label: "Products",
              },
              {
                path: "/admin_panel/settings",
                icon: Settings,
                label: "Settings",
              },
            ].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-[15px] transition-colors relative group ${
                    isActive
                      ? `${sidebarTextActive} font-medium`
                      : `${sidebarText} ${sidebarHover}`
                  }`
                }
                title={isSidebarCollapsed ? item.label : ""}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-[18px] h-[18px] ${isSidebarCollapsed ? "mx-auto" : "mr-3"}`}
                    />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#727cf5]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className={`h-[70px] ${theme === "dark" ? "bg-[#313a46] border-gray-700" : "bg-white"} shadow-sm flex items-center justify-between px-6 z-10 w-full shrink-0 transition-colors`}
        >
          {/* Left: Sidebar Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1 rounded-md ${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Menu size={20} />
            </button>
            <h2
              className={`font-semibold text-lg hidden md:block ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
            >
              Admin Console
            </h2>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Settings Toggle */}
            <button
              onClick={() => setShowThemeSettings(true)}
              className={`p-2 rounded-full hidden sm:block ${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}
              title="Theme Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`p-2 rounded-full hidden sm:block ${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}
              title="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-full hidden md:block ${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}
              title="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src="/assets/images/users/avatar-1.jpg"
                  alt="user"
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                  onError={(e) => {
                    e.target.src = "https://ui-avatars.com/api/?name=Admin";
                  }}
                />
                <div className="hidden md:block text-left">
                  <span
                    className={`block text-sm font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    {user?.name || "Admin User"}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${theme === "dark" ? "bg-[#313a46] border border-gray-600" : "bg-white"}`}
                >
                  <div
                    className={`px-4 py-2 border-b ${theme === "dark" ? "border-gray-600" : "border-gray-100"}`}
                  >
                    <p
                      className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Welcome !
                    </p>
                  </div>

                  {/* My Account - As requested */}
                  <Link
                    to="#"
                    className={`block px-4 py-2 text-sm flex items-center gap-2 ${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <User size={16} />
                    <span>My Account</span>
                  </Link>

                  <div
                    className={`border-t ${theme === "dark" ? "border-gray-600" : "border-gray-100"}`}
                  ></div>

                  <button
                    onClick={logout}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${theme === "dark" ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Backdrop for mobile sidebar/dropdown */}
        {showUserDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserDropdown(false)}
          ></div>
        )}

        {/* Page Content */}
        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${layoutWidth === "boxed" ? "container mx-auto shadow-2xl bg-white min-h-0 my-4" : ""} ${theme === "dark" ? "text-gray-200" : ""}`}
        >
          <Outlet />
        </main>

        {/* Theme Settings Drawer */}
        <ThemeSettings
          isOpen={showThemeSettings}
          onClose={() => setShowThemeSettings(false)}
          theme={theme}
          setTheme={setTheme}
          sidebarTheme={sidebarTheme}
          setSidebarTheme={setSidebarTheme}
          width={layoutWidth}
          setWidth={setLayoutWidth}
        />
      </div>
    </div>
  );
};

export default AdminLayout;
