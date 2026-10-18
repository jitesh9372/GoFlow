import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Train,
  MapPin,
  Clock,
  Send,
  Bookmark,
  Shield,
  LayoutDashboard,
  Radio,
  BarChart3,
  CheckSquare,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, role, signOut, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async (newRole: 'admin' | 'passenger') => {
    await loginAsDemo(newRole);
    setUserDropdownOpen(false);
    if (newRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/passenger');
    }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-teal-50 text-transit-teal font-semibold border border-teal-200/70 shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-transit-teal flex items-center justify-center text-white shadow-2xs group-hover:bg-transit-teal-hover transition-colors">
                <Train size={18} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-transit-navy tracking-tight">
                  GoFlow
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-teal-50 text-transit-teal border border-teal-200/80 tracking-wide">
                  Mumbai
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {role === 'admin' ? (
                <>
                  <NavLink to="/admin" end className={navItemClass}>
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink to="/admin/transport" className={navItemClass}>
                    <Train size={14} />
                    <span>Transport</span>
                  </NavLink>
                  <NavLink to="/admin/crowd" className={navItemClass}>
                    <Radio size={14} />
                    <span>Crowd Live</span>
                  </NavLink>
                  <NavLink to="/admin/analytics" className={navItemClass}>
                    <BarChart3 size={14} />
                    <span>Analytics</span>
                  </NavLink>
                  <NavLink to="/admin/reports" className={navItemClass}>
                    <CheckSquare size={14} />
                    <span>Reports</span>
                  </NavLink>
                  <NavLink to="/admin/notifications" className={navItemClass}>
                    <Bell size={14} />
                    <span>Alerts</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/routes" className={navItemClass}>
                    <Train size={14} />
                    <span>Route Planner</span>
                  </NavLink>
                  <NavLink to="/railradar" className={navItemClass}>
                    <Radio size={14} className="text-emerald-500 animate-pulse" />
                    <span>Live Radar</span>
                  </NavLink>
                  <NavLink to="/map" className={navItemClass}>
                    <MapPin size={14} />
                    <span>Crowd Map</span>
                  </NavLink>
                  <NavLink to="/timings" className={navItemClass}>
                    <Clock size={14} />
                    <span>Crowd Timings</span>
                  </NavLink>
                  <NavLink to="/report" className={navItemClass}>
                    <Send size={14} />
                    <span>Report Rush</span>
                  </NavLink>
                  {user && (
                    <NavLink to="/saved" className={navItemClass}>
                      <Bookmark size={14} />
                      <span>Saved</span>
                    </NavLink>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5">
            {/* Admin Console indicator for authorized admins */}
            {role === 'admin' && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-transit-navy text-white text-[11px] font-semibold shadow-2xs border border-slate-700">
                <Shield size={12} className="text-teal-400" />
                <span>Admin Console</span>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                {/* User Profile Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="h-8.5 flex items-center gap-2 pl-1.5 pr-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left shadow-2xs"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[11px] font-bold text-transit-teal">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block leading-tight">
                      <span className="block text-xs font-semibold text-transit-navy truncate max-w-[110px]">
                        {user.displayName}
                      </span>
                      <span className="block text-[9px] text-transit-muted capitalize">
                        {user.role} Portal
                      </span>
                    </div>
                    <ChevronDown
                      size={12}
                      className={`text-slate-400 transition-transform duration-150 ${
                        userDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-56 bg-white border border-transit-border rounded-lg shadow-elevated py-1.5 text-xs z-50 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2">
                        <p className="font-semibold text-transit-navy truncate">{user.displayName}</p>
                        <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded uppercase font-mono font-semibold bg-teal-50 text-transit-teal border border-teal-200">
                          Role: {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        {user.role === 'admin' ? (
                          <>
                            <Link
                              to="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                              <LayoutDashboard size={14} /> Admin Overview
                            </Link>
                            <Link
                              to="/admin/settings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                              <Shield size={14} /> Admin Settings
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/passenger"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                              <User size={14} /> Passenger Dashboard
                            </Link>
                            <Link
                              to="/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                              <User size={14} /> Profile & Saved Routes
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await signOut();
                            navigate('/signin');
                          }}
                          className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Logout Button - neatly aligned horizontally */}
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/signin');
                  }}
                  title="Sign out of GoFlow"
                  className="h-8.5 px-2.5 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="px-3.5 py-1.5 bg-transit-teal hover:bg-transit-teal-hover active:scale-[0.98] text-white text-xs font-semibold rounded-transit transition-all duration-150 shadow-xs hover:shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex px-3 py-1.5 border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-semibold rounded-transit transition-all duration-150"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded text-slate-600 hover:bg-slate-100 active:scale-95 transition-transform"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-sm shadow-card">
            {role === 'admin' ? (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/transport"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Transport Management
                </Link>
                <Link
                  to="/admin/crowd"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Crowd Monitoring
                </Link>
                <Link
                  to="/admin/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Hourly Analytics
                </Link>
                <Link
                  to="/admin/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Passenger Reports
                </Link>
                <Link
                  to="/admin/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Congestion Alerts
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/routes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Route Planner
                </Link>
                <Link
                  to="/railradar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-slate-700 font-medium"
                >
                  <Radio size={15} className="text-emerald-500 animate-pulse" />
                  <span>Live Train Radar</span>
                </Link>
                <Link
                  to="/map"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Crowd Map
                </Link>
                <Link
                  to="/timings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Crowd Timings
                </Link>
                <Link
                  to="/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Report Crowd Rush
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Saved Routes
                </Link>
              </>
            )}

            {user ? (
              <div className="pt-2 border-t">
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut();
                    navigate('/signin');
                  }}
                  className="w-full text-left py-2 text-rose-600 font-medium text-xs flex items-center gap-2"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t flex items-center gap-2">
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center bg-transit-teal text-white rounded font-medium text-xs shadow-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center border border-slate-200 text-slate-700 rounded font-medium text-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>
        )}
      </header>
    </>
  );
};
