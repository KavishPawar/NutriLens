import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation  } from 'react-router-dom'
import {
  LayoutDashboard,
  History,
  Bookmark,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import '../../styles/sidebar.scss';
import { useAuthHook } from '../auth/hooks/useAuthHook';

// ─── Constants ───────────────────────────────────────────────────────────────
const SIDEBAR_OPEN_WIDTH  = 220; // px — default open width
const SIDEBAR_CLOSED_WIDTH = 72; // px — collapsed (icon-only) width
const MIN_WIDTH = 160;           // px — minimum draggable width
const MAX_WIDTH = 340;           // px — maximum draggable width

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',   active: true, path: '/'},
  { icon: History,         label: 'Scan History',active: false, path: '/product-history' },
  { icon: Settings,        label: 'Settings',    active: false, path: '/profile' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const { user } = useAuthHook();
  const [isOpen,  setIsOpen]  = useState(true);
  const [width,   setWidth]   = useState(SIDEBAR_OPEN_WIDTH);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const isDragging             = useRef(false);
  const startX                 = useRef(0);
  const startWidth             = useRef(0);
  const sidebarRef             = useRef(null);

  // ── Toggle open / closed ──────────────────────────────────────────────────
  const toggleSidebar = () => {
    if (isMobile) return;
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      // Restore to last dragged width (or default) when re-opening
      if (width <= SIDEBAR_CLOSED_WIDTH) setWidth(SIDEBAR_OPEN_WIDTH);
    }
  };

  // ── Drag-to-resize ────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    startX.current     = e.clientX;
    startWidth.current = sidebarRef.current?.offsetWidth ?? width;
    document.body.style.cursor    = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta    = e.clientX - startX.current;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
      setWidth(newWidth);
      // Auto-close if dragged far left
      if (newWidth <= MIN_WIDTH + 10) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current            = false;
      document.body.style.cursor    = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const currentWidth = isOpen ? width : SIDEBAR_CLOSED_WIDTH;
  const showLabels = isMobile || isOpen;
  const location = useLocation();
  return (
    <>
      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}
        style={isMobile ? undefined : { width: currentWidth }}
      >
        {/* Header */}
        <div
          className="sidebar__header"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={toggleSidebar}
        >
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon">
              <img src="/LOGO.png" alt="NutriLens logo" />
            </div>
            {showLabels && (
              <div className="sidebar__logo-text">
                <span className="sidebar__logo-name">NutriLens</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <a
              key={label}
              href={path}
              className={`sidebar__nav-item ${
                location.pathname === path ? "sidebar__nav-item--active" : ""
              }`}
            >
              <Icon size={20} className="sidebar__nav-icon" />
              {showLabels && <span>{label}</span>}
            </a>
          ))}
          {/* Admin-only link */}
          {user?.role === 'admin' && (
            <a
              href="/admin"
              className={`sidebar__nav-item ${
                location.pathname === '/admin' ? 'sidebar__nav-item--active' : ''
              }`}
            >
              <ShieldCheck size={20} className="sidebar__nav-icon" />
              {showLabels && <span>Admin Panel</span>}
            </a>
          )}
        </nav>

        {/* Footer — user profile */}
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {user
                ? (user.username || user.name || 'U')
                    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                : '??'}
            </div>
            {showLabels && (
              <div className="sidebar__user-info">
                <p className="sidebar__user-name">
                  {user?.username || user?.name || 'Guest'}
                </p>
                <p className="sidebar__user-role">
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'pro' ? 'Pro Member' : 'Free Member'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Drag handle */}
        {!isMobile && (
          <div
            className="sidebar__resize-handle"
            onMouseDown={onMouseDown}
            title="Drag to resize"
          />
        )}
      </aside>
    </>
  );
};

export default Sidebar;
