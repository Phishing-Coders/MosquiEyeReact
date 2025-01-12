import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const ProtectedRoute = ({ element, permission }) => {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const userRole = user?.organizationMemberships?.[0]?.role;

  // Define role permissions
  const rolePermissions = {
    'org:admin': ['dashboard', 'team', 'profile', 'maps', 'scan', 'analysis', 'settings', 'contacts', 'qrscan', 
                  'calendar', 'geography', 'faq', 'bar', 'form', 'line', 'pie', 'ovitrap', 'analysisHistory'],
    'org:operations_team': ['dashboard', 'team', 'profile', 'maps', 'scan', 'analysis', 'settings', 'contacts', 'qrscan', 
      'calendar', 'geography', 'faq', 'bar', 'form', 'line', 'pie', 'ovitrap', 'analysisHistory']
  };

  const userPermissions = rolePermissions[userRole] || [];

  // Check if user has required permission
  if (permission && !userPermissions.includes(permission)) {
    console.log(`Access denied: User with role ${userRole} attempted to access ${permission}`);
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

export default ProtectedRoute;