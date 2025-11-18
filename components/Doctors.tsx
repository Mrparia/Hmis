
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Doctor } from '../types';
import Button from './common/Button';
import Modal from './common/Modal';
import { fuzzySearch } from '../utils';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorForm: React.FC<{ onClose: () => void; doctorToEdit?: Doctor | null }> = ({ onClose, doctorToEdit }) => {
    const { dispatch } = useAppContext();
    const [name, setName] = useState(doctorToEdit?.name || '');
    const [qualification, setQualification] = useState(doctorToEdit?.qualification || '');
    const [specialization, setSpecialization] = useState(doctorToEdit?.specialization || '');
    const [availability, setAvailability] = useState<Record<string, string[]>>(doctorToEdit?.availability || {});

    const handleDayToggle = (day: string) => {
        setAvailability(prev => {
            const newAvail = { ...prev };
            if (newAvail[day]) {
                delete newAvail[day];
            } else {
                newAvail[day] = ['09:00-17:00']; // Default slot
            }
            return newAvail;
        });
    };

    const handleTimeChange = (day: string, index: number, value: string) => {
        setAvailability(prev => {
            const newAvail = { ...prev };
            if (newAvail[day]) {
                const updatedTimes = [...newAvail[day]];
                updatedTimes[index] = value;
                newAvail[day] = updatedTimes;
            }
            return newAvail;
        });
    };
    
    const addTimeSlot = (day: string) => {
        setAvailability(prev => {
            const newAvail = { ...prev };
            if (newAvail[day]) {
                newAvail[day] = [...newAvail[day], ''];
            }
            return newAvail;
        });
    };
    
    const removeTimeSlot = (day: string, index: number) => {
        setAvailability(prev => {
            const daySlots = prev[day];
            if (!Array.isArray(daySlots)) {
                return prev; 
            }
    
            const updatedDaySlots = daySlots.filter((_, i) => i !== index);
    
            if (updatedDaySlots.length === 0) {
                const newAvail = { ...prev };
                delete newAvail[day];
                return newAvail;
            }
    
            return {
                ...prev,
                [day]: updatedDaySlots,
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanedAvailability = Object.entries(availability || {}).reduce((acc, [day, times]) => {
            if (Array.isArray(times)) {
                const validTimes = times.filter(time => time && typeof time === 'string' && time.match(/^\d{2}:\d{2}-\d{2}:\d{2}$/));
                if (validTimes.length > 0) {
                    acc[day] = validTimes;
                }
            }
            return acc;
        }, {} as Record<string, string[]>);


        if (doctorToEdit) {
            const updatedDoctor: Doctor = {
                ...doctorToEdit,
                name,
                qualification,
                specialization,
                availability: cleanedAvailability,
            };
            dispatch({ type: 'UPDATE_DOCTOR', payload: updatedDoctor });
        } else {
            const newDoctor: Doctor = {
                id: `D${Date.now()}`,
                name,
                qualification,
                specialization,
                availability: cleanedAvailability,
            };
            dispatch({ type: 'ADD_DOCTOR', payload: newDoctor });
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Qualification</label>
                <input type="text" value={qualification} onChange={e => setQualification(e.target.value)} required placeholder="e.g., MBBS, MD" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <input type="text" value={specialization} onChange={e => setSpecialization(e.target.value)} required placeholder="e.g., Cardiology" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
             <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Weekly Availability</legend>
                <div className="space-y-4 max-h-[20rem] overflow-y-auto pr-2">
                    {daysOfWeek.map(day => (
                        <div key={day} className="p-3 border rounded-md bg-gray-50/50">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700">{day}</span>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={!!availability[day]} onChange={() => handleDayToggle(day)} className="sr-only peer" />
                                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-light peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900">{availability[day] ? 'Available' : 'Unavailable'}</span>
                                </label>
                            </div>
                            {availability[day] && (
                                <div className="mt-3 pt-3 border-t space-y-2">
                                    {availability[day].map((slot, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                value={slot} 
                                                onChange={e => handleTimeChange(day, index, e.target.value)} 
                                                placeholder="e.g., 09:00-13:00" 
                                                pattern="\d{2}:\d{2}-\d{2}:\d{2}"
                                                title="Please use HH:MM-HH:MM format" 
                                                className="w-full px-2 py-1 border rounded-md text-sm shadow-sm"
                                            />
                                            <Button type="button" variant="danger" onClick={() => removeTimeSlot(day, index)} className="px-2 py-2 shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </Button>
                                        </div>
                                    ))}
                                    <Button 
                                        type="button" 
                                        variant="secondary" 
                                        onClick={() => addTimeSlot(day)} 
                                        className="text-xs px-2 py-1 mt-2"
                                        leftIcon={
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                            </svg>
                                        }
                                    >
                                        Add Slot
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </fieldset>
            <div className="flex justify-end pt-4">
                <Button type="submit">{doctorToEdit ? 'Update Doctor' : 'Add Doctor'}</Button>
            </div>
        </form>
    );
};


const Doctors: React.FC = () => {
    const { state } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDoctors = state.doctors.filter(d =>
        fuzzySearch(searchTerm, `${d.name} ${d.specialization}`)
    );
    
    const openEditModal = (doctor: Doctor) => {
        setDoctorToEdit(doctor);
        setIsModalOpen(true);
    };

    const openNewModal = () => {
        setDoctorToEdit(null);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setDoctorToEdit(null);
    };

    const formatAvailability = (availability?: Doctor['availability']) => {
        if (!availability || Object.keys(availability).length === 0) return 'Not Set';
        return Object.keys(availability).map(day => day.substring(0, 3)).join(', ');
    };

    return (
        <div className="bg-surface p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-1/3">
                    <input
                        type="text"
                        placeholder="Search by name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <Button onClick={openNewModal} leftIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>}>
                    Add Doctor
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Doctor ID</th>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Qualification</th>
                            <th scope="col" className="px-6 py-3">Specialization</th>
                            <th scope="col" className="px-6 py-3">Available Days</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDoctors.map((doctor: Doctor) => (
                            <tr key={doctor.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{doctor.id}</td>
                                <td className="px-6 py-4">{doctor.name}</td>
                                <td className="px-6 py-4">{doctor.qualification}</td>
                                <td className="px-6 py-4">{doctor.specialization}</td>
                                <td className="px-6 py-4">{formatAvailability(doctor.availability)}</td>
                                <td className="px-6 py-4">
                                    <Button variant="secondary" onClick={() => openEditModal(doctor)} className="px-2 py-1 text-xs">
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={doctorToEdit ? "Edit Doctor Details" : "Add New Doctor"}>
                <DoctorForm onClose={closeModal} doctorToEdit={doctorToEdit} />
            </Modal>
        </div>
    );
};

export default Doctors;
