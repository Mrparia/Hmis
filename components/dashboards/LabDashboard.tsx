import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const LabDashboard: React.FC = () => {
    const { state } = useAppContext();
    const { labRequests, doctors } = state;

    const newRequests = useMemo(() => 
        labRequests.filter(r => r.status === 'Advised'), 
    [labRequests]);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-primary">Lab Dashboard</h2>
            <div className="bg-surface rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-4">New Lab Requests ({newRequests.length})</h3>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gray-50 sticky top-0"><tr><th className="p-2">Patient ID</th><th className="p-2">Advised By</th><th className="p-2">Tests</th><th className="p-2">Date</th></tr></thead>
                        <tbody>
                            {newRequests.map(req => (
                                <tr key={req.id} className="border-b">
                                    <td className="p-2 font-medium">{req.patientId}</td>
                                    <td className="p-2">{doctors.find(d => d.id === req.doctorId)?.name}</td>
                                    <td className="p-2">{req.tests.map(t => t.testName).join(', ')}</td>
                                    <td className="p-2">{new Date(req.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default LabDashboard;
