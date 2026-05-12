export const dashboardStats = [
  { id: '1', title: 'Total Societies', value: '3', },
  { id: '2', title: 'Active Builders', value: '14',  },
  { id: '3', title: 'Revenue', value: '₹18.6L', change: '+8.4% growth' },
  { id: '4', title: 'Active Issues', value: '05', change: '2 critical alerts' },
];

export const quickActions = [
  { id: '1', title: 'Society Requests', subtitle: 'Approve onboarding', icon: 'business-outline', route: 'Societies' }, 

//     {
//   id: 'new-admin-requests',
//   title: 'New Admin Requests',
//   subtitle: 'Check  Admin approvals',
//   icon: '📩',
//   route: 'NewAdminRequest',
// }, 

{
  id: 'new-admin-requests',
  title: 'New Admin Requests',
  subtitle: 'Check Admin approvals',
  icon: 'person-add-outline',
  route: 'NewAdminRequest',
},
  { id: '2', title: 'Builder Oversight', subtitle: 'Monitor projects', icon: 'construct-outline', route: 'Builders' },
  { id: '3', title: 'Plans & Billing', subtitle: 'Manage subscriptions', icon: 'card-outline', route: 'SubscriptionPlans' },
  { id: '4', title: 'System Health', subtitle: 'Servers & logs', icon: 'pulse-outline', route: 'SystemHealth' },
  { id: '5', title: 'White Label', subtitle: 'Branding & domains', icon: 'color-palette-outline', route: 'WhiteLabel' },
  { id: '6', title: 'Analytics', subtitle: 'Platform KPIs', icon: 'stats-chart-outline', route: 'AnalyticsTab' },

];

export const societyRequests = [
  {
    id: 'SOC-101',
    societyName: 'Palm Grove Residency',
    city: 'Hyderabad',
    units: 280,
    plan: 'Premium',
    // status: 'Pending',
    adminName: 'Ramesh Kumar',
    documents: ['Registration Certificate', 'Address Proof', 'Committee Resolution'],
  },
  {
    id: 'SOC-102',
    societyName: 'Lakeview Heights',
    city: 'Bengaluru',
    units: 420,
    plan: 'Enterprise',
    // status: 'Approved',
    adminName: 'Sravani Rao',
    documents: ['Registration Certificate', 'PAN', 'Society Bylaws'],
  },
  {
    id: 'SOC-103',
    societyName: 'Emerald Towers',
    city: 'Pune',
    units: 190,
    plan: 'Standard',
    // status: 'Pending',
    adminName: 'Vikram Shah',
    documents: ['Registration Certificate', 'Utility Bill'],
  },
];

export const builders = [
  {
    id: 'BLD-01',
    name: 'Skyline Infra',
    city: 'Hyderabad',
    projects: 6,
    rera: 'Verified',
    status: 'Approved',
    collections: '₹4.2Cr',
    documents: ['RERA Certificate', 'GST Registration', 'Land Ownership Certificate'], // Ensure this is an array
  },
  {
    id: 'BLD-02',
    name: 'Dream Builders',
    city: 'Bangalore',
    projects: 3,
    rera: 'Verified',
    status: 'Pending',
    collections: '₹2.5Cr',
    documents: ['RERA Certificate'], // Ensure this is an array
  },
  {
    id: 'BLD-03',
    name: 'Ace Construction',
    city: 'Delhi',
    projects: 8,
    rera: 'Not Verified',
    status: 'Pending',
    collections: '₹3.1Cr',
    documents: [], // Empty documents array, but it's still defined
  },
];

export const analyticsCards = [
  { id: '1', title: 'Monthly Active Users', value: '24,860' },
  { id: '2', title: 'Subscription Revenue', value: '₹9.4L' },
  { id: '3', title: 'Vendor Commission', value: '₹2.1L' },
  { id: '4', title: 'Marketplace Revenue', value: '₹1.8L' },
];

export const activityFeed = [
  { id: '1', title: 'Palm Grove Residency submitted onboarding request', time: '10 mins ago' },
  { id: '2', title: 'Urban Nest Developers uploaded RERA documents', time: '42 mins ago' },
  { id: '3', title: 'Enterprise plan renewed for Lakeview Heights', time: '1 hour ago' },
  { id: '4', title: 'API latency alert triggered on payments service', time: '2 hours ago' },
];

export const plans = [
  {
    id: '1',
    name: 'Basic',
    price: '₹9,999 / year',
    features: ['Core society app', 'Residents', 'Visitors', 'Basic notices'],
  },
  {
    id: '2',
    name: 'Premium',
    price: '₹24,999 / year',
    features: ['All Basic', 'Billing', 'Amenities', 'Vendor workflows', 'Analytics'],
  },
  {
    id: '3',
    name: 'Enterprise',
    price: 'Custom',
    features: ['All Premium', 'White label', 'Subdomain', 'Advanced reports', 'Priority support'],
  },
];

export const systemHealth = [
  { id: '1', service: 'API Gateway', status: 'Healthy', detail: '99.98% uptime' },
  { id: '2', service: 'Payments Service', status: 'Warning', detail: 'Latency higher than normal' },
  { id: '3', service: 'Database Cluster', status: 'Healthy', detail: 'Replication OK' },
  { id: '4', service: 'Notification Queue', status: 'Critical', detail: 'Delivery backlog detected' },
];

export const whiteLabelItems = [
  { id: '1', title: 'Master Logo', value: 'goldenrich-logo.png' },
  { id: '2', title: 'Primary Domain', value: 'goldenrich.in' },
  { id: '3', title: 'Email Domain', value: 'mail.goldenrich.in' },
  { id: '4', title: 'Default Theme', value: 'Deep Navy + Premium Ash' },
];