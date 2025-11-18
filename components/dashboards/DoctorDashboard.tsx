import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PatientVisit } from '../../types';
import Button from '../common/Button';
import { DoctorCheckinWorkflow } from '../DoctorCheckinWorkflow';
import DoctorCalendarView from './DoctorCalendarView';

const PatientFlowView: React.FC = () => {
    const { state } = useAppContext();
    const { currentUser, patientVisits } = state;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [workflowVisit, setWorkflowVisit] = useState<PatientVisit | null>(null);

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    
    const doctorId = currentUser?.id;

    const waitingPatients = useMemo(() => {
        return patientVisits.filter(v => v.assignedDoctorId === doctorId && v.status === 'Waiting for Doctor');
    }, [patientVisits, doctorId]);

    const inConsultationPatients = useMemo(() => {
        return patientVisits.filter(v => v.assignedDoctorId === doctorId && v.status === 'In Consultation');
    }, [patientVisits, doctorId]);

    const handleCheckIn = (visit: PatientVisit) => {
        setWorkflowVisit(visit);
    };

    const formatWaitTime = (startTime: string) => {
        const diffMs = currentTime.getTime() - new Date(startTime).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        return `${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-primary mb-4">Waiting Queue ({waitingPatients.length})</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {waitingPatients.map(visit => (
                            <div key={visit.id} className="p-4 border rounded-lg flex justify-between items-center bg-yellow-50">
                                <div>
                                    <p className="font-bold text-gray-800">{visit.patientName}</p>
                                    <p className="text-sm text-gray-600">Waiting for: <span className="font-mono font-bold text-red-600">{formatWaitTime(visit.statusUpdateTime)}</span></p>
                                </div>
                                <Button onClick={() => handleCheckIn(visit)} className="px-3 py-1 text-sm">Start Consultation</Button>
                            </div>
                        ))}
                        {waitingPatients.length === 0 && <p className="text-center text-gray-500 py-4">No patients are waiting.</p>}
                    </div>
                </div>
                 <div className="bg-surface rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-primary mb-4">Currently in Consultation ({inConsultationPatients.length})</h3>
                     <div className="space-y-3 max-h-96 overflow-y-auto">
                        {inConsultationPatients.map(visit => (
                            <div key={visit.id} className="p-4 border rounded-lg flex justify-between items-center bg-green-50">
                                <div>
                                    <p className="font-bold text-gray-800">{visit.patientName}</p>
                                     <p className="text-sm text-gray-600">In consultation for: <span className="font-mono font-bold text-green-700">{formatWaitTime(visit.statusUpdateTime)}</span></p>
                                </div>
                                <Button onClick={() => handleCheckIn(visit)} variant="secondary" className="px-3 py-1 text-sm">Resume</Button>
                            </div>
                        ))}
                        {inConsultationPatients.length === 0 && <p className="text-center text-gray-500 py-4">No patients in consultation.</p>}
                    </div>
                </div>
            </div>
            {workflowVisit && (
               <DoctorCheckinWorkflow visit={workflowVisit} onClose={() => setWorkflowVisit(null)} />
            )}
        </div>
    );
};

const DoctorDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'flow' | 'calendar'>('flow');

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-primary">Doctor's Dashboard</h2>
            <div className="flex border-b">
                <button 
                    onClick={() => setActiveTab('flow')} 
                    className={`px-4 py-2 font-medium text-lg ${activeTab === 'flow' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                >
                    Live Patient Flow
                </button>
                <button 
                    onClick={() => setActiveTab('calendar')} 
                    className={`px-4 py-2 font-medium text-lg ${activeTab === 'calendar' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                >
                    My Calendar
                </button>
            </div>
            
            {activeTab === 'flow' ? <PatientFlowView /> : <DoctorCalendarView />}
        </div>
    );
};
export default DoctorDashboard;
