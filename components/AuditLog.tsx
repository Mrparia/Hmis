import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { fuzzySearch } from '../utils';

const AuditLog: React.FC = () => {
  const { state } = useAppContext();
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return state.auditLogs.filter(log => {
      const logDate = log.timestamp.split('T')[0];
      const matchesDate = !selectedDate || logDate === selectedDate;
      
      const matchesSearch = !searchTerm || 
        fuzzySearch(searchTerm, `${log.userName} ${log.action} ${log.details}`);
        
      return matchesDate && matchesSearch;
    });
  }, [state.auditLogs, selectedDate, searchTerm]);

  return (
    <div className="bg-surface p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
            <label htmlFor="log-date" className="font-medium text-gray-700">Filter by Date:</label>
            <input 
                type="date" 
                id="log-date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
             {selectedDate && <button onClick={() => setSelectedDate('')} className="text-sm text-primary hover:underline">Clear</button>}
        </div>
        <div className="relative w-full md:w-1/3">
            <input 
                type="text" 
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Timestamp</th>
              <th scope="col" className="px-6 py-3">User</th>
              <th scope="col" className="px-6 py-3">Action</th>
              <th scope="col" className="px-6 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{log.userName} ({log.userId})</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{log.details}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500">
                        No audit logs found matching your criteria.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;