import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import '../../styles/dashboard-layout.scss';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
