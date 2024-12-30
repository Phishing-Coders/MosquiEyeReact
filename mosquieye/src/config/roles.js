export const ROLES = {
  IT_ADMIN: 'org:admin',
  HEALTH_ADMIN: 'org:health_office',
  OPERATION_TEAM: 'org:operations_team'
};

export const ROLE_PERMISSIONS = {
  'org:admin': ['dashboard', 'team', 'profile', 'maps', 'scan', 'analysis', 'settings', 'contacts', 'qrscan', 
    'calendar', 'geography', 'faq', 'bar', 'form', 'line', 'pie', 'invoices', 'analysisHistory'],
  'org:health_office': ['dashboard', 'maps', 'scan', 'analysis', 'profile'],
  'org:operations_team': ['scan', 'analysis', 'profile']
};