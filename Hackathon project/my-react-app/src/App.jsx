import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  ResponsiveContainer,
} from 'recharts';

// Replaced react-icons with inline SVG components to resolve compilation errors.
const DashboardIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path>
  </svg>
);

const LayersIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 6l10 4 10-4-10-4zM2 14l10 4 10-4-10-4-10 4zM2 22l10-4 10 4-10 4-10-4z"></path>
  </svg>
);

const SettingsIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.09-.76-1.71-1l-.38-2.5c-.05-.27-.24-.48-.5-.5H9.4c-.26.02-.45.23-.5.5l-.38 2.5c-.62.24-1.19.6-1.71 1l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.09.76 1.71 1l.38 2.5c.05.27.24.48.5.5h4.99c.26-.02.45-.23.5-.5l.38-2.5c.62-.24 1.19-.6 1.71-1l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path>
  </svg>
);

const EditIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
  </svg>
);

const DeleteIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
  </svg>
);

const PersonIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
  </svg>
);

const CloudIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"></path>
  </svg>
);

const FlagIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-7.6z"></path>
  </svg>
);

const PeopleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05.54.54.97 1.23 1.19 2.05.28.9.41 1.88.41 2.9h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path>
  </svg>
);

// Sample data for the daily chart
const dailyData = [
  { name: 'Mon', 'SOAP Server Hits': 100, 'REST Server Hits': 250 },
  { name: 'Tue', 'SOAP Server Hits': 80, 'REST Server Hits': 300 },
  { name: 'Wed', 'SOAP Server Hits': 60, 'REST Server Hits': 400 },
  { name: 'Thu', 'SOAP Server Hits': 40, 'REST Server Hits': 500 },
  { name: 'Fri', 'SOAP Server Hits': 50, 'REST Server Hits': 600 },
  { name: 'Sat', 'SOAP Server Hits': 30, 'REST Server Hits': 650 },
  { name: 'Sun', 'SOAP Server Hits': 20, 'REST Server Hits': 700 },
];

// Sample data for the monthly chart
const monthlyData = [
  { name: 'Jan', 'SOAP Server Hits': 4000, 'REST Server Hits': 12000 },
  { name: 'Feb', 'SOAP Server Hits': 4500, 'REST Server Hits': 13500 },
  { name: 'Mar', 'SOAP Server Hits': 3800, 'REST Server Hits': 11000 },
  { name: 'Apr', 'SOAP Server Hits': 5200, 'REST Server Hits': 15000 },
  { name: 'May', 'SOAP Server Hits': 4800, 'REST Server Hits': 14200 },
  { name: 'Jun', 'SOAP Server Hits': 6100, 'REST Server Hits': 16800 },
];

// Data for the KPI cards
const kpiCards = [
  {
    id: 1,
    title: 'Active SOAP Endpoint Mapping',
    value: 34,
    icon: <PeopleIcon className="text-white text-xl" />,
    bgColor: 'bg-indigo-500',
  },
  {
    id: 2,
    title: 'Active REST Endpoint Mapping',
    value: 20,
    icon: <CloudIcon className="text-white text-xl" />,
    bgColor: 'bg-green-500',
  },
  {
    id: 3,
    title: 'Mapping Failures',
    value: 1,
    icon: <FlagIcon className="text-white text-xl" />,
    bgColor: 'bg-red-500',
  },
];

// Data for the mappings table
const mappingsData = [
  {
    id: 1,
    operation: 'GetCustomers',
    version: 2,
    status: 'Enabled',
    lastModified: '07/16/2025 02:28 PM',
  },
  {
    id: 2,
    operation: 'CreateCustomers',
    version: 2,
    status: 'Enabled',
    lastModified: '07/16/2025 02:28 PM',
  },
  {
    id: 3,
    operation: 'UpdateCustomers',
    version: 2,
    status: 'Enabled',
    lastModified: '07/16/2025 02:28 PM',
  },
  {
    id: 4,
    operation: 'DeleteCustomers',
    version: 2,
    status: 'Disabled',
    lastModified: '07/16/2025 02:28 PM',
  },
  {
    id: 5,
    operation: 'GetAccounts',
    version: 1,
    status: 'Ready for Review',
    lastModified: '07/16/2025 02:28 PM',
  },
  {
    id: 6,
    operation: 'GetTransactions',
    version: 2,
    status: 'Disabled',
    lastModified: '07/16/2025 02:28 PM',
  },
];

// Reusable Status Badge component for the mappings table
const StatusBadge = ({ status }) => {
  let colorClass;
  switch (status) {
    case 'Enabled':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'Disabled':
      colorClass = 'bg-red-100 text-red-800';
      break;
    case 'Ready for Review':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

// Edit Mapping Modal Component to handle editing a mapping
const EditMappingModal = ({ mapping, onClose, onSave }) => {
  // Local state to manage the form data for the modal.
  // It's pre-populated with data from the mapping prop.
  const [formData, setFormData] = useState({
    soapEndpoint: '',
    restEndpoint: '',
    soapHeaders: '',
    restHeaders: '',
    soapRequestPayload: '',
    restRequestPayload: '',
    soapResponsePayload: '', // Added this field
    restResponsePayload: '', // Added this field
    ...mapping
  });

  // Handle changes to form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission, passing the updated data to the onSave handler
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative p-8 bg-white w-full max-w-2xl mx-auto rounded-lg shadow-lg">
        <div className="flex justify-between items-center pb-3">
          <h3 className="text-xl font-bold">Edit Mapping</h3>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Two-column layout for endpoints and headers */}
          <div className="grid grid-cols-2 gap-4 my-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">SOAP Endpoint</label>
              <input
                type="text"
                name="soapEndpoint"
                value={formData.soapEndpoint}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">REST Endpoint</label>
              <input
                type="text"
                name="restEndpoint"
                value={formData.restEndpoint}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">SOAP Headers</label>
              <input
                type="text"
                name="soapHeaders"
                value={formData.soapHeaders}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">REST Headers</label>
              <input
                type="text"
                name="restHeaders"
                value={formData.restHeaders}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            {/* Full-width textareas for payloads */}
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">SOAP Request Payload</label>
              <textarea
                name="soapRequestPayload"
                value={formData.soapRequestPayload}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
              ></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">REST Request Payload</label>
              <textarea
                name="restRequestPayload"
                value={formData.restRequestPayload}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
              ></textarea>
            </div>
            {/* Added new fields for response payloads to match the image */}
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">SOAP Response Payload</label>
              <textarea
                name="soapResponsePayload"
                value={formData.soapResponsePayload}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
              ></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">REST Response Payload</label>
              <textarea
                name="restResponsePayload"
                value={formData.restResponsePayload}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            {/* Regenerate with AI button (currently a placeholder) */}
            <button
              type="button"
              className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
            >
              Regenerate with AI
            </button>
            {/* Save Mapping button */}
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Save Mapping
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sidebar component for navigation
const Sidebar = ({ activePage, onPageChange }) => (
  <div className="bg-gray-800 text-white w-64 min-h-screen p-4 flex flex-col rounded-tr-xl rounded-br-xl">
    <div className="text-2xl font-bold mb-8">IntelliRoute Studio</div>
    <nav className="space-y-2">
      <button
        onClick={() => onPageChange('dashboard')}
        className={`w-full text-left flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
          activePage === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'
        }`}
      >
        <DashboardIcon className="mr-3 text-base" />
        Dashboard
      </button>
      <button
        onClick={() => onPageChange('mappings')}
        className={`w-full text-left flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
          activePage === 'mappings' ? 'bg-gray-700' : 'hover:bg-gray-700'
        }`}
      >
        <LayersIcon className="mr-3 text-base" />
        Mappings
      </button>
      <button
        onClick={() => onPageChange('settings')}
        className={`w-full text-left flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
          activePage === 'settings' ? 'bg-gray-700' : 'hover:bg-gray-700'
        }`}
      >
        <SettingsIcon className="mr-3 text-base" />
        Settings
      </button>
    </nav>
  </div>
);

// Header component with a user dropdown
const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="flex justify-end items-center p-4 bg-white shadow-md rounded-t-xl">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <span className="text-gray-700 font-medium">Frank</span>
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
            <PersonIcon className="text-lg" />
          </div>
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

// KPI card component to display key metrics
const KpiCard = ({ title, value, icon, bgColor }) => (
  <div className={`p-6 rounded-lg shadow-md flex items-center space-x-4 ${bgColor} transition-transform duration-300 hover:scale-105 hover:shadow-xl`}>
    <div className="flex-shrink-0 p-3 rounded-full bg-white bg-opacity-20">
      {icon}
    </div>
    <div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  </div>
);

// Dashboard content with chart and KPI cards
const DashboardContent = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const data = timeframe === 'weekly' ? dailyData : monthlyData;
  const dataKey = timeframe === 'weekly' ? 'name' : 'name';

  return (
    <div className="p-8 space-y-8">
      {/* Traffic Distribution Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Traffic Distribution</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                timeframe === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                timeframe === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        {/* Responsive chart container */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSoap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="SOAP Server Hits"
              stroke="#4F46E5"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="REST Server Hits"
              stroke="#F97316"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Brush dataKey={dataKey} height={30} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiCards.map((card) => (
          <KpiCard key={card.id} {...card} />
        ))}
      </div>
    </div>
  );
};

// Mappings table content
const MappingsContent = ({ data, onEdit }) => (
  <div className="p-8 space-y-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Mappings</h2>
      <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
        Create New
      </button>
    </div>
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              OPERATION
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              VERSION
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              STATUS
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              LAST MODIFIED
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((mapping) => (
            <tr key={mapping.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {mapping.operation}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {mapping.version}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={mapping.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span>{mapping.lastModified}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(mapping)} className="text-indigo-600 hover:text-indigo-900 mr-2">
                  <EditIcon className="inline text-base" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <DeleteIcon className="inline text-base" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Main App component that manages state and renders different pages
const App = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [editingMapping, setEditingMapping] = useState(null);

  const handleSaveMapping = (updatedMapping) => {
    // In a real app, this would be an API call to the backend
    console.log('Saving mapping:', updatedMapping);
    setEditingMapping(null);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    // Close the modal if we switch pages
    setEditingMapping(null);
  }

  return (
    <div className="flex bg-gray-100 min-h-screen font-sans antialiased">
      <Sidebar activePage={activePage} onPageChange={handlePageChange} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {/* Conditional rendering of the main content based on activePage state */}
          {activePage === 'dashboard' && <DashboardContent />}
          {activePage === 'mappings' && (
            <MappingsContent
              data={mappingsData}
              onEdit={(mapping) => setEditingMapping(mapping)}
            />
          )}
          {activePage === 'settings' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="mt-4 text-gray-600">Settings page content goes here...</p>
            </div>
          )}
        </main>
      </div>
      {/* Render the modal if a mapping is being edited */}
      {editingMapping && (
        <EditMappingModal
          mapping={editingMapping}
          onClose={() => setEditingMapping(null)}
          onSave={handleSaveMapping}
        />
      )}
    </div>
  );
};

export default App;
