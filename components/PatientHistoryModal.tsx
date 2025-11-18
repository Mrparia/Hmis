import React, { useState } from 'react';
import Modal from './common/Modal';
import { Patient, Bill, Prescription, PatientVisit } from '../types';
import { useAppContext } from '../context/AppContext';
import AddPrescriptionModal from './AddPrescriptionModal';
import Button from './common/Button';

interface PatientHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({ isOpen, onClose, patient }) => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [activeTab, setActiveTab] = useState<'details' | 'visits' | 'billing' | 'prescriptions'>('details');
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

    const patientBills = state.bills.filter(b => b.patientId === patient?.id);
    const patientPrescriptions = state.prescriptions.filter(p => p.patientId === patient?.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const patientVisits = state.patientVisits.filter(v => v.patientId === patient?.id).sort((a,b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
    const doctor = state.doctors.find(d => d.id === patient?.assignedDoctorId);

    if (!patient) return null;

    const handlePrintPrescription = (prescription: Prescription) => {
        dispatch({ type: 'SET_DOCUMENT_TO_PRINT', payload: { type: 'PRESCRIPTION', data: prescription } });
    };
    
    const getStatusChip = (status: PatientVisit['status']) => {
        const styles: Record<PatientVisit['status'], string> = {
            'Waiting for Doctor': 'bg-yellow-100 text-yellow-800',
            'In Consultation': 'bg-blue-100 text-blue-800',
            'In Pathology': 'bg-purple-100 text-purple-800',
            'Test in Progress': 'bg-indigo-100 text-indigo-800',
            'Report Ready': 'bg-cyan-100 text-cyan-800',
            'Waiting for Billing': 'bg-orange-100 text-orange-800',
            'Waiting for Pharmacy': 'bg-pink-100 text-pink-800',
            'Completed': 'bg-green-100 text-green-800',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'details': {
                const medicalHistoryItems = patient.medicalHistory ? Object.entries(patient.medicalHistory).filter(([, value]) => value) : [];

                return (
                    <div className="space-y-6 text-sm">
                        <div>
                            <h4 className="font-bold text-base text-primary mb-2">General Details</h4>
                            <div className="p-4 border rounded-lg bg-gray-50 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                <div><strong>Patient ID:</strong> {patient.id}</div>
                                <div><strong>Age:</strong> {patient.age}</div>
                                <div><strong>Gender:</strong> {patient.gender}</div>
                                <div><strong>Contact:</strong> {patient.contact}</div>
                                <div className="md:col-span-2"><strong>Address:</strong> {`${patient.address}, ${patient.city}, ${patient.state} - ${patient.pincode}`}</div>
                                <div><strong>Registered On:</strong> {new Date(patient.registeredDate).toLocaleDateString()}</div>
                                <div><strong>Patient Type:</strong> <span className={`font-semibold ${patient.patientType === 'IPD' ? 'text-red-600' : 'text-green-600'}`}>{patient.patientType}</span></div>
                                <div><strong>Assigned Doctor:</strong> {doctor?.name || 'N/A'}</div>
                                {patient.patientType === 'IPD' && patient.bedInfo && (
                                     <div><strong>Bed Info:</strong> {`${patient.bedInfo.ward} / ${patient.bedInfo.bedNumber}`}</div>
                                )}
                            </div>
                        </div>

                        {patient.vitals && (
                        <div>
                            <h4 className="font-bold text-base text-primary mb-2">Latest Vitals</h4>
                            <div className="p-4 border rounded-lg bg-gray-50 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                <div><strong>BP:</strong> <span className="font-semibold">{patient.vitals.bp || 'N/A'}</span></div>
                                <div><strong>O2 Saturation:</strong> <span className="font-semibold">{patient.vitals.oxygenSaturation || 'N/A'}%</span></div>
                                <div><strong>Heart Rate:</strong> <span className="font-semibold">{patient.vitals.heartRate || 'N/A'} bpm</span></div>
                                <div><strong>Height:</strong> <span className="font-semibold">{patient.vitals.height || 'N/A'} cm</span></div>
                                <div><strong>Weight:</strong> <span className="font-semibold">{patient.vitals.weight || 'N/A'} kg</span></div>
                                <div><strong>BMI:</strong> <span className="font-semibold">{patient.vitals.bmi || 'N/A'}</span></div>
                            </div>
                        </div>
                        )}

                        {medicalHistoryItems.length > 0 && (
                        <div>
                            <h4 className="font-bold text-base text-primary mb-2">Medical History</h4>
                            <div className="p-4 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                {medicalHistoryItems.map(([key, value]) => {
                                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    return <div key={key}><strong>{label}:</strong> {value}</div>;
                                })}
                            </div>
                        </div>
                        )}
                    </div>
                );
            }
            case 'visits':
                 return (
                     <div className="overflow-y-auto max-h-96 border rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Visit ID</th>
                                    <th scope="col" className="px-6 py-3">Check-in Time</th>
                                    <th scope="col" className="px-6 py-3">Doctor</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                             <tbody>
                                {patientVisits.length > 0 ? patientVisits.map((visit) => {
                                    const visitDoctor = state.doctors.find(d => d.id === visit.assignedDoctorId);
                                    return (
                                    <tr key={visit.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{visit.id}</td>
                                        <td className="px-6 py-4">{new Date(visit.checkInTime).toLocaleString()}</td>
                                        <td className="px-6 py-4">{visitDoctor?.name || 'N/A'}</td>
                                        <td className="px-6 py-4">{getStatusChip(visit.status)}</td>
                                    </tr>
                                );}) : (
                                    <tr><td colSpan={4} className="text-center py-6 text-gray-500">No visit history found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            case 'billing':
                return (
                     <div className="overflow-y-auto max-h-96 border rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Bill ID</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientBills.length > 0 ? patientBills.map((bill: Bill) => (
                                    <tr key={bill.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{bill.id}</td>
                                        <td className="px-6 py-4">{new Date(bill.billDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right font-semibold">₹{bill.grandTotal.toFixed(2)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-6 text-gray-500">No billing history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            case 'prescriptions':
                return (
                    <div>
                        {currentUser?.role === 'Doctor' &&
                            <div className="flex justify-end mb-4">
                                <Button onClick={() => setIsPrescriptionModalOpen(true)}>Add New Prescription</Button>
                            </div>
                        }
                         <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                            {patientPrescriptions.length > 0 ? patientPrescriptions.map((rx: Prescription) => {
                                const rxDoctor = state.doctors.find(d => d.id === rx.doctorId);
                                return (
                                    <div key={rx.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                                        <div className="flex justify-between items-start mb-3 pb-3 border-b">
                                            <div>
                                                <p className="font-bold text-primary">{rx.id}</p>
                                                <p className="text-sm">Dr. {rxDoctor?.name || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{new Date(rx.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {currentUser?.role === 'Receptionist' && (
                                                    <button onClick={() => handlePrintPrescription(rx)} title="Print Prescription" className="text-gray-500 hover:text-primary p-1 rounded-full hover:bg-gray-200">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs mb-3">
                                                <thead className="font-semibold text-gray-600">
                                                    <tr>
                                                        <th className="p-1 text-left">Medicine</th>
                                                        <th className="p-1 text-left">Dosage</th>
                                                        <th className="p-1 text-left">Duration</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rx.items.map((item, index) => (
                                                        <tr key={index} className="border-t">
                                                            <td className="p-1 font-semibold">{item.medicineName}</td>
                                                            <td className="p-1">{`${item.interval}, ${item.route}`} {item.directions && `(${item.directions})`}</td>
                                                            <td className="p-1">{item.duration} (Qty: {item.quantity})</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        {rx.otherDirections && (
                                            <div className="mt-2 pt-2 border-t">
                                                <p className="text-xs font-semibold">Notes:</p>
                                                <p className="text-xs italic text-gray-700">{rx.otherDirections}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            }) : (
                                <p className="text-center py-6 text-gray-500">No prescriptions found.</p>
                            )}
                        </div>
                    </div>
                );
        }
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={`Patient History - ${patient.name}`}>
                <div className="space-y-6">
                    <div className="flex border-b">
                        <button onClick={() => setActiveTab('details')} className={`px-4 py-2 font-medium ${activeTab === 'details' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Details</button>
                        <button onClick={() => setActiveTab('visits')} className={`px-4 py-2 font-medium ${activeTab === 'visits' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Visit History</button>
                        <button onClick={() => setActiveTab('billing')} className={`px-4 py-2 font-medium ${activeTab === 'billing' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Billing History</button>
                        <button onClick={() => setActiveTab('prescriptions')} className={`px-4 py-2 font-medium ${activeTab === 'prescriptions' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Prescriptions</button>
                    </div>
                    {renderContent()}
                </div>
            </Modal>
            {currentUser?.role === 'Doctor' && 
                <AddPrescriptionModal 
                    isOpen={isPrescriptionModalOpen} 
                    onClose={() => setIsPrescriptionModalOpen(false)} 
                    patient={patient}
                />
            }
        </>
    );
};

export default PatientHistoryModal;