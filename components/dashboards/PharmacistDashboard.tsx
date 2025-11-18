import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const PharmacistDashboard: React.FC = () => {
    const { state } = useAppContext();
    const { prescriptions, doctors } = state;
    
    // Simple logic: show prescriptions from today that are not yet billed
    const newPrescriptions = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        // In a real app, you'd check if a bill for this prescription exists.
        // For this demo, we'll just show all of today's prescriptions.
        return prescriptions.filter(p => p.date.startsWith(todayStr));
    }, [prescriptions]);
    
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-primary">Pharmacy Dashboard</h2>
            <div className="bg-surface rounded-xl shadow-lg p-6">
                 <h3 className="text-xl font-bold text-primary mb-4">New Prescriptions to Dispense ({newPrescriptions.length})</h3>
                 <div className="overflow-x-auto max-h-96">
                     <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gray-50 sticky top-0"><tr><th className="p-2">Patient ID</th><th className="p-2">Prescribed By</th><th className="p-2">Medicines</th><th className="p-2">Date</th></tr></thead>
                        <tbody>
                            {newPrescriptions.map(p => (
                                <tr key={p.id} className="border-b">
                                    <td className="p-2 font-medium">{p.patientId}</td>
                                    <td className="p-2">{doctors.find(d => d.id === p.doctorId)?.name}</td>
                                    <td className="p-2">{p.items.map(i => i.medicineName).join(', ')}</td>
                                    <td className="p-2">{new Date(p.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default PharmacistDashboard;
