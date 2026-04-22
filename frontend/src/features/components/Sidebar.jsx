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
} from 'lucide-react';
import '../../styles/sidebar.scss';

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
  { icon: HelpCircle,      label: 'Support',     active: false },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const [isOpen,  setIsOpen]  = useState(true);
  const [width,   setWidth]   = useState(SIDEBAR_OPEN_WIDTH);
  const isDragging             = useRef(false);
  const startX                 = useRef(0);
  const startWidth             = useRef(0);
  const sidebarRef             = useRef(null);

  // ── Toggle open / closed ──────────────────────────────────────────────────
  const toggleSidebar = () => {
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

  const currentWidth = isOpen ? width : SIDEBAR_CLOSED_WIDTH;
  const location = useLocation();
  return (
    <>
      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}
        style={{ width: currentWidth }}
      >
        {/* Header */}
        <div
          className="sidebar__header"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={toggleSidebar}
        >
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12C2 12 5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            {isOpen && (
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
              {isOpen && <span>{label}</span>}
            </a>
          ))}
        </nav>

        {/* Footer — user profile */}
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">JV</div>
            {isOpen && (
              <div className="sidebar__user-info">
                <p className="sidebar__user-name">Julian V.</p>
                <p className="sidebar__user-role">Pro Member</p>
              </div>
            )}
          </div>
        </div>

        {/* Drag handle */}
        <div
          className="sidebar__resize-handle"
          onMouseDown={onMouseDown}
          title="Drag to resize"
        />
      </aside>
    </>
  );
};

export default Sidebar;
