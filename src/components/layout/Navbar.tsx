import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useRequests, DEMO_USERS } from '../../context/RequestContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Plus, Menu, X, Users, LogIn, LogOut, User as UserIcon, Mail, Sparkles, HeartHandshake, MessageSquare, Star } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [inboxDropdownOpen, setInboxDropdownOpen] = useState(false);
  const { currentUser, switchUser } = useRequests();
  const { token, logout } = useAuth();
  const { unreadCount, recentNotifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const inboxRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { path: '/explore', label: 'Explore' },
    { path: '/#how-it-works', label: 'How it works' },
    { path: '/activity', label: 'Activity' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inboxRef.current && !inboxRef.current.contains(event.target as Node)) {
        setInboxDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const handleNotificationSelect = async (notifId: string, requestId?: string | null) => {
    await markAsRead(notifId);
    setInboxDropdownOpen(false);
    if (requestId) {
      navigate(`/request/${requestId}`);
    } else {
      navigate('/inbox');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-nbrly-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-heading font-extrabold text-2xl tracking-tighter text-charcoal group-hover:text-black transition-colors">
              NBRLY
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-lime border border-charcoal/20 group-hover:scale-125 transition-transform" />
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-charcoal relative py-1 ${
                    isActive
                      ? 'text-charcoal font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-lime'
                      : 'text-muted-gray'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Actions, Inbox & Account Switcher */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* ─── INBOX LINK & DROPDOWN ─── */}
            <div className="relative" ref={inboxRef}>
              <button
                onClick={() => setInboxDropdownOpen(!inboxDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-button border border-nbrly-border bg-white/80 hover:bg-white text-xs font-semibold font-heading text-charcoal transition-all shadow-subtle"
                title="Notifications & Smart Matches"
              >
                <Mail className="w-3.5 h-3.5 text-charcoal" />
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-lime text-charcoal text-[10px] font-extrabold rounded-full border border-charcoal/20 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Compact Inbox Dropdown */}
              {inboxDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-nbrly-border rounded-panel p-2 shadow-lifted z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-nbrly-border">
                    <span className="text-xs font-bold font-heading text-charcoal flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> INBOX
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-lime px-1.5 rounded-full font-bold text-charcoal">
                          {unreadCount} new
                        </span>
                      )}
                    </span>
                    <Link
                      to="/inbox"
                      onClick={() => setInboxDropdownOpen(false)}
                      className="text-[11px] font-semibold text-muted-gray hover:text-charcoal transition-colors"
                    >
                      View all →
                    </Link>
                  </div>

                  <div className="py-1 max-h-72 overflow-y-auto space-y-1 divide-y divide-nbrly-border/40">
                    {recentNotifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-gray">
                        No notifications yet.
                      </div>
                    ) : (
                      recentNotifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationSelect(n.id, n.requestId)}
                          className={`w-full text-left p-2 rounded-button transition-colors flex items-start gap-2.5 ${
                            !n.read ? 'bg-lime/15 hover:bg-lime/25' : 'hover:bg-paper'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === 'MATCH' ? (
                              <Sparkles className="w-3.5 h-3.5 text-charcoal" />
                            ) : n.type === 'REQUEST_ACCEPTED' ? (
                              <HeartHandshake className="w-3.5 h-3.5 text-charcoal" />
                            ) : n.type === 'NEW_MESSAGE' ? (
                              <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
                            ) : n.type === 'REVIEW_AVAILABLE' ? (
                              <Star className="w-3.5 h-3.5 fill-charcoal text-charcoal" />
                            ) : (
                              <Mail className="w-3.5 h-3.5 text-charcoal" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-charcoal truncate">{n.title}</p>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-lime border border-charcoal/30 shrink-0" />}
                            </div>
                            <p className="text-[11px] text-muted-gray font-sans truncate">{n.message}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-nbrly-border text-center">
                    <Link
                      to="/inbox"
                      onClick={() => setInboxDropdownOpen(false)}
                      className="block py-1 text-xs font-bold text-charcoal hover:underline font-heading"
                    >
                      Open Full Inbox →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/create">
              <Button variant="lime" size="sm">
                <Plus className="w-4 h-4 stroke-[3]" />
                NEED HELP
              </Button>
            </Link>

            {/* User Dropdown / Switcher */}
            <div className="relative border-l border-nbrly-border pl-3">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity focus:outline-none"
                title="Account & Persona"
              >
                <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
                <div className="text-left text-xs font-sans">
                  <div className="flex items-center gap-1 font-semibold text-charcoal leading-tight">
                    <span>{currentUser.name.split(' ')[0]}</span>
                    {token ? (
                      <span className="text-[9px] bg-success-green/20 text-success-green border border-success-green/30 px-1 rounded font-mono uppercase">AUTH</span>
                    ) : (
                      <span className="text-[9px] bg-lime/80 text-charcoal px-1.5 rounded font-mono uppercase">DEMO</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-gray truncate max-w-[90px]">{currentUser.neighborhood}</p>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-nbrly-border rounded-panel p-2 shadow-lifted z-50">
                  
                  {/* Active Account Info */}
                  <div className="px-2 py-2 border-b border-nbrly-border">
                    <p className="text-xs font-bold text-charcoal">{currentUser.name}</p>
                    <p className="text-[11px] text-muted-gray">{currentUser.email || `${currentUser.neighborhood} Member`}</p>
                  </div>

                  {/* Switch Demo Persona */}
                  <div className="px-2 py-1.5 border-b border-nbrly-border text-[10px] font-bold uppercase tracking-wider text-muted-gray flex items-center gap-1 mt-1">
                    <Users className="w-3.5 h-3.5" /> Switch Demo Persona
                  </div>
                  <div className="py-1 max-h-36 overflow-y-auto">
                    {DEMO_USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-button transition-colors text-left ${
                          currentUser.id === user.id
                            ? 'bg-lime/30 text-charcoal font-bold border border-lime'
                            : 'hover:bg-paper text-charcoal'
                        }`}
                      >
                        <Avatar src={user.avatar} name={user.name} size="sm" />
                        <div>
                          <p className="font-semibold text-charcoal leading-tight">{user.name}</p>
                          <p className="text-[10px] text-muted-gray">{user.neighborhood}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Links & Auth Actions */}
                  <div className="pt-1.5 border-t border-nbrly-border space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-charcoal hover:bg-paper rounded-button transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5" /> View My Profile
                    </Link>

                    {token ? (
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-urgent-red hover:bg-red-50 rounded-button transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Log Out
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-charcoal hover:bg-paper rounded-button transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Login / Register
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/create">
              <Button variant="lime" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-button text-charcoal hover:bg-white border border-nbrly-border"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-nbrly-border bg-white px-4 pt-3 pb-6 space-y-3 shadow-lifted">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                    isActive ? 'bg-paper text-charcoal font-semibold' : 'text-muted-gray hover:text-charcoal'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/inbox"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium rounded-button text-charcoal hover:bg-paper flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-charcoal" /> Inbox
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-lime text-charcoal text-xs font-bold rounded-full border border-charcoal/20">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium rounded-button text-charcoal hover:bg-paper flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4 text-charcoal" /> My Profile
            </Link>
          </nav>
          
          <div className="pt-3 border-t border-nbrly-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-gray">Persona</p>
              {token ? (
                <button onClick={handleLogout} className="text-[11px] text-urgent-red font-semibold">
                  Log Out
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-[11px] text-charcoal font-semibold hover:underline">
                  Log In
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-button text-xs text-left ${
                    currentUser.id === user.id ? 'bg-lime text-charcoal font-bold' : 'bg-paper text-charcoal'
                  }`}
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <span>{user.name} ({user.neighborhood})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
