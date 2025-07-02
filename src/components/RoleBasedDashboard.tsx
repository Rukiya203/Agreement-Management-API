import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './Dashboard';
import CustomerDashboard from './CustomerDashboard';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <Dashboard />;
    case 'customer':
      return <CustomerDashboard />;
    default:
      return <Dashboard />; // Default to admin dashboard
  }
};

export default RoleBasedDashboard;
