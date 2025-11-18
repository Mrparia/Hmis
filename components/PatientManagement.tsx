import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Patient, PatientStatus, User } from '../types';
import Button from './common/Button';
import Modal from './common/Modal';
import { pincodeData } from '../pincodeData';
import { MOCK_WARDS_BEDS } from '../constants';
import PatientHistoryModal from './PatientHistoryModal';
import { fuzzySearch } from '../utils';
import Card from './common/Card';

const PatientForm: React.FC<{onClose: () => void, patient?: Patient | null}> = ({ onClose, patient }) => {
    const { state, dispatch } = useAppContext();
    const [name, setName] = useState(patient?.name || '');
    const [age, setAge] = useState(patient?.age.toString() || '');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(patient?.gender || 'Male');
    const [contact, setContact] = useState(patient?.contact || '');
    const [address, setAddress] = useState(patient?.address || '');
    const [pincode, setPincode] = useState(patient?.pincode || '');
    const [city, setCity] = useState(patient?.city || '');
    const [formState, setFormState] = useState(patient?.state || '');
    const [patientType, setPatientType] = useState<'OPD' | 'IPD'>(patient?.patientType || 'OPD');
    const [assignedDoctorId, setAssignedDoctorId] = useState(patient?.assignedDoctorId || state.doctors[0]?.id || '');
    const [ward, setWard] = useState(patient?.bedInfo?.ward || Object.keys(MOCK_WARDS_BEDS)[0]);
    const [bedNumber, setBedNumber] = useState(patient?.bedInfo?.bedNumber || MOCK_WARDS_BEDS[Object.keys(MOCK_WARDS_BEDS)[0]][0]);

    useEffect(() => {
        if (pincode.length === 6 && pincodeData[pincode]) {
            setCity(pincodeData[pincode].city);
            setFormState(pincodeData[pincode].state);
        } else {
            setCity('');
            setFormState('');
        }
    }, [pincode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (patient) {
            const updatedPatient: Patient = {
                ...patient,
                name,
                age: parseInt(age, 10),
                gender,
                contact,
                address,
                pincode,
                city,
                state: formState,
                patientType,
                assignedDoctorId,
            };
            if (patientType === 'IPD') {
                updatedPatient.bedInfo = { ward, bedNumber };
            } else {
                delete updatedPatient.bedInfo;
            }
            dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });
        } else {
            const newPatient: Patient = {
                id: `P${Date.now()}`,
                name,
                age: parseInt(age, 10),
                gender,
                contact,
                address,
                pincode,
                city,
                state: formState,
                patientType,
                assignedDoctorId,
                registeredDate: new Date().toISOString(),
            };
            if (patientType === 'IPD') {
                newPatient.bedInfo = { ward, bedNumber };
            }
            dispatch({ type: 'ADD_PATIENT', payload: newPatient });
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input type="tel" value={contact} onChange={e => setContact(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} maxLength={6} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" value={city} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input type="text" value={formState} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm" />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Assign Doctor</label>
                    <select value={assignedDoctorId} onChange={e => setAssignedDoctorId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        {state.doctors.map(d => {
                            const availabilityText = d.availability && Object.keys(d.availability).length > 0
                                ? `(${Object.keys(d.availability).map(day => day.substring(0,3)).join(', ')})`
                                : '';
                            return <option key={d.id} value={d.id}>{d.name} ({d.specialization}) {availabilityText}</option>
                        })}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Patient Type</label>
                    <div className="mt-2 flex space-x-4">
                         <label><input type="radio" value="OPD" checked={patientType === 'OPD'} onChange={() => setPatientType('OPD')} className="mr-1" /> OPD</label>
                         <label><input type="radio" value="IPD" checked={patientType === 'IPD'} onChange={() => setPatientType('IPD')} className="mr-1" /> IPD</label>
                    </div>
                </div>
            </div>
            {patientType === 'IPD' && (
                <div className="p-4 bg-blue-50 rounded-lg grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Ward</label>
                        <select value={ward} onChange={e => setWard(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            {Object.keys(MOCK_WARDS_BEDS).map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Number</label>
                         <select value={bedNumber} onChange={e => setBedNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            {MOCK_WARDS_BEDS[ward as keyof typeof MOCK_WARDS_BEDS].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
            )}
            <div className="flex justify-end pt-4">
                <Button type="submit">{patient ? 'Update Patient' : 'Register Patient'}</Button>
            </div>
        </form>
    );
};

const PatientRegistry: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { currentUser, patientVisits } = state;
    const canManagePatients = currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist';

    const filteredPatients = useMemo(() => {
        if (!searchTerm) {
            return state.patients;
        }
        return state.patients.filter(p => {
            const searchableText = [
                p.id,
                p.name,
                p.contact,
            ].join(' ');
            return fuzzySearch(searchTerm, searchableText);
        });
    }, [state.patients, searchTerm]);


    const viewHistory = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsHistoryOpen(true);
    };
    
    const handleCheckIn = (patient: Patient) => {
        dispatch({ type: 'CHECK_IN_PATIENT', payload: patient });
    };

    const openEditModal = (patient: Patient) => {
        setPatientToEdit(patient);
        setIsFormModalOpen(true);
    };

    const openNewModal = () => {
        setPatientToEdit(null);
        setIsFormModalOpen(true);
    };

    const closeModal = () => {
        setIsFormModalOpen(false);
        setPatientToEdit(null);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-1/2">
                    <input 
                        type="text" 
                        placeholder="Search by Patient ID, Name, or Contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                {canManagePatients && (
                    <Button onClick={openNewModal} leftIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>}>
                    New Patient
                    </Button>
                )}
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                        <th scope="col" className="px-6 py-3">Patient ID</th>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Contact</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Assigned Doctor</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map((patient: Patient) => {
                        const activeVisit = patientVisits.find(v => v.patientId === patient.id && v.status !== 'Completed');
                        return (
                        <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{patient.id}</td>
                            <td className="px-6 py-4">{patient.name}</td>
                            <td className="px-6 py-4">{patient.contact}</td>
                            <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.patientType === 'IPD' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {patient.patientType}
                            </span>
                            </td>
                            <td className="px-6 py-4">{state.doctors.find(d => d.id === patient.assignedDoctorId)?.name || 'N/A'}</td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => viewHistory(patient)} className="px-2 py-1 text-xs">
                                        History
                                    </Button>
                                    {canManagePatients && (
                                        <Button variant="secondary" onClick={() => openEditModal(patient)} className="px-2 py-1 text-xs">
                                            Edit
                                        </Button>
                                    )}
                                    {currentUser?.role === 'Receptionist' && (
                                        activeVisit 
                                            ? <span className="px-3 py-2 text-xs font-semibold text-green-800 bg-green-100 rounded-lg">Checked-In</span>
                                            : <Button onClick={() => handleCheckIn(patient)} className="px-2 py-1 text-xs">Check-In</Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                        )})}
                    </tbody>
                </table>
            </div>

            {canManagePatients && (
                <Modal isOpen={isFormModalOpen} onClose={closeModal} title={patientToEdit ? "Edit Patient Details" : "Register New Patient"}>
                    <PatientForm onClose={closeModal} patient={patientToEdit} />
                </Modal>
            )}

            <PatientHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} patient={selectedPatient} />
        </div>
    );
};

const LivePatientFlow: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { patientVisits, doctors } = state;
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Update every second for live timer
        return () => clearInterval(timer);
    }, []);

    const activeVisits = useMemo(() => 
        patientVisits.filter(v => v.status !== 'Completed'), 
    [patientVisits]);
    
    const completedVisitsToday = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return patientVisits
            .filter(v => v.status === 'Completed' && v.statusUpdateTime.startsWith(todayStr))
            .sort((a, b) => new Date(b.statusUpdateTime).getTime() - new Date(a.statusUpdateTime).getTime());
    }, [patientVisits]);

    const waitingCount = activeVisits.filter(v => v.status === 'Waiting for Doctor').length;
    const inConsultationCount = activeVisits.filter(v => v.status === 'In Consultation').length;
    const inPathologyCount = activeVisits.filter(v => v.status === 'In Pathology' || v.status === 'Waiting for Pharmacy').length;


    const formatWaitTime = (startTime: string) => {
        const diffMs = currentTime.getTime() - new Date(startTime).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        return `${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
    };
    
    const formatTotalVisitTime = (startTime: string, endTime: string) => {
        const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
        if (diffMs < 0) return '00h 00m';
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
    };
    
    const handleStatusChange = (visitId: string, newStatus: PatientStatus) => {
        dispatch({ type: 'UPDATE_PATIENT_STATUS', payload: { visitId, newStatus }});
    };
    
    const patientStatuses: PatientStatus[] = ['Waiting for Doctor', 'In Consultation', 'In Pathology', 'Test in Progress', 'Report Ready', 'Waiting for Billing', 'Waiting for Pharmacy', 'Completed'];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                 <Card title="Patients in Flow" value={activeVisits.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.282-.237-1.887M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653-.084-1.282-.237-1.887M12 15a4 4 0 100-8 4 4 0 000 8z" /></svg>} color="primary" />
                 <Card title="Waiting for Doctor" value={waitingCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="yellow" />
                 <Card title="In Consultation" value={inConsultationCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4 4m0 0l4-4m-4 4h14m-5 4v-4a2 2 0 00-2-2h-3a2 2 0 00-2 2v4m-4-7l4-4m0 0l4 4m-4-4v12" /></svg>} color="green" />
                 <Card title="In Labs/Pharmacy" value={inPathologyCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l.477-2.387a2 2 0 00.547-1.806z" /></svg>} color="secondary" />
                 <Card title="Completed Today" value={completedVisitsToday.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="accent" />
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border">
                <h3 className="text-xl font-bold text-primary mb-4">Current Patient Flow</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Patient Name</th>
                                <th className="px-6 py-3">Assigned Doctor</th>
                                <th className="px-6 py-3">Current Status</th>
                                <th className="px-6 py-3">Time in Status</th>
                                <th className="px-6 py-3">Update Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeVisits.map(visit => {
                                const doctor = doctors.find(d => d.id === visit.assignedDoctorId);
                                return (
                                    <tr key={visit.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{visit.patientName}</td>
                                        <td className="px-6 py-4">{doctor?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 font-semibold">{visit.status}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-lg text-red-600">{formatWaitTime(visit.statusUpdateTime)}</td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={visit.status}
                                                onChange={(e) => handleStatusChange(visit.id, e.target.value as PatientStatus)}
                                                className="w-full p-2 border bg-white rounded-md text-sm"
                                            >
                                                {patientStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                             {activeVisits.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No patients are currently checked in.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border">
                <h3 className="text-xl font-bold text-primary mb-4">Completed Patients (Today)</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Patient Name</th>
                                <th className="px-6 py-3">Check-in Time</th>
                                <th className="px-6 py-3">Completed Time</th>
                                <th className="px-6 py-3">Total Visit Time</th>
                            </tr>
                        </thead>
                        <tbody>
                           {completedVisitsToday.map(visit => (
                                <tr key={visit.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{visit.patientName}</td>
                                    <td className="px-6 py-4">{new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="px-6 py-4">{new Date(visit.statusUpdateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="px-6 py-4 font-semibold">{formatTotalVisitTime(visit.checkInTime, visit.statusUpdateTime)}</td>
                                </tr>
                           ))}
                             {completedVisitsToday.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No patients have completed their visit today.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AdminPatientDashboard: React.FC = () => {
    const { state } = useAppContext();
    const { dutyRoster, leaveRequests, users, patientVisits } = state;

    const today = useMemo(() => new Date(), []);
    const todayStr = today.toISOString().split('T')[0];
    
    const doctorsOnDuty = useMemo(() => {
        const onDutyUserIds = new Set(
            dutyRoster.filter(d => d.date === todayStr).map(d => d.userId)
        );
        return users.filter(u => u.role === 'Doctor' && onDutyUserIds.has(u.id));
    }, [dutyRoster, users, todayStr]);

    const doctorsOnLeave = useMemo(() => {
        const onLeaveUserIds = new Set(
            leaveRequests
                .filter(l => {
                    if (l.status !== 'Approved') return false;
                    const startDate = new Date(l.startDate);
                    const endDate = new Date(l.endDate);
                    startDate.setHours(0,0,0,0);
                    endDate.setHours(0,0,0,0);
                    return today >= startDate && today <= endDate;
                })
                .map(l => l.userId)
        );
        return users.filter(u => u.role === 'Doctor' && onLeaveUserIds.has(u.id));
    }, [leaveRequests, users, today]);

    const doctorStats = useMemo(() => {
        return doctorsOnDuty.map(doctor => {
            const myVisits = patientVisits.filter(v => v.assignedDoctorId === doctor.id);
            const waiting = myVisits.filter(v => v.status === 'Waiting for Doctor').length;
            const inConsultation = myVisits.filter(v => v.status === 'In Consultation').length;
            const completed = myVisits.filter(v => v.status === 'Completed' && v.statusUpdateTime.startsWith(todayStr)).length;
            return { doctor, waiting, inConsultation, completed };
        });
    }, [doctorsOnDuty, patientVisits, todayStr]);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-primary">Live Operations Dashboard</h2>
            
            <div className="bg-surface p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-primary mb-4">Doctor Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800">On Duty ({doctorsOnDuty.length})</h4>
                        <ul className="mt-2 text-sm text-green-700 space-y-1">
                            {doctorsOnDuty.map(d => <li key={d.id}>{d.name}</li>)}
                        </ul>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800">On Leave ({doctorsOnLeave.length})</h4>
                         <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                            {doctorsOnLeave.map(d => <li key={d.id}>{d.name}</li>)}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-xl shadow-lg">
                 <h3 className="text-xl font-bold text-primary mb-4">Live Doctor Status</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctorStats.map(stat => (
                        <div key={stat.doctor.id} className="p-4 border rounded-lg shadow-sm">
                            <h4 className="font-bold text-lg text-gray-800">{stat.doctor.name}</h4>
                            <div className="mt-2 space-y-1 text-sm">
                                <p className="flex justify-between"><span>Waiting Patients:</span> <span className="font-bold text-yellow-600">{stat.waiting}</span></p>
                                <p className="flex justify-between"><span>In Consultation:</span> <span className="font-bold text-green-600">{stat.inConsultation}</span></p>
                                <p className="flex justify-between"><span>Completed Today:</span> <span className="font-bold text-blue-600">{stat.completed}</span></p>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
            
            <LivePatientFlow />
        </div>
    );
}


const PatientManagement: React.FC = () => {
    const { state } = useAppContext();
    const { currentUser } = state;
    const [activeTab, setActiveTab] = useState<'flow' | 'registry'>('registry');

    if (currentUser?.role === 'Admin') {
        return <AdminPatientDashboard />;
    }

    if (currentUser?.role === 'Receptionist') {
        return (
            <div className="bg-surface p-6 rounded-xl shadow-lg">
                <div className="flex border-b mb-6">
                    <button onClick={() => setActiveTab('flow')} className={`px-4 py-2 font-medium text-lg ${activeTab === 'flow' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                        Live Patient Flow
                    </button>
                    <button onClick={() => setActiveTab('registry')} className={`px-4 py-2 font-medium text-lg ${activeTab === 'registry' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                        Patient Registry
                    </button>
                </div>
                {activeTab === 'flow' ? <LivePatientFlow /> : <PatientRegistry />}
            </div>
        );
    }
    
    // Default view for other roles (e.g., Doctor) is just the registry
    return (
        <div className="bg-surface p-6 rounded-xl shadow-lg">
            <PatientRegistry />
        </div>
    );
};

export default PatientManagement;