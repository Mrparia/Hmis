import React, { useState } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { Patient, Prescription, PrescriptionItem, DosageRoute } from '../types';
import { useAppContext } from '../context/AppContext';

interface AddPrescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

const AddPrescriptionModal: React.FC<AddPrescriptionModalProps> = ({ isOpen, onClose, patient }) => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [items, setItems] = useState<Partial<PrescriptionItem>[]>([{}]);
    const [notes, setNotes] = useState('');

    const medicines = state.inventory.filter(i => i.category === 'Medicine');
    const dosageRoutes: DosageRoute[] = ['Oral', 'Topical', 'Injection', 'IV', 'Other'];

    const handleItemChange = <K extends keyof PrescriptionItem>(index: number, field: K, value: PrescriptionItem[K]) => {
        const newItems = [...items];
        newItems[index][field] = value;
        
        if (field === 'medicineId') {
            const selectedMedicine = medicines.find(m => m.id === value);
            newItems[index].medicineName = selectedMedicine?.name;
        }

        setItems(newItems);
    };

    const addItemRow = () => {
        setItems([...items, {}]);
    };

    const removeItemRow = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!patient || !currentUser) return;

        const newPrescription: Prescription = {
            id: `RX${Date.now()}`,
            patientId: patient.id,
            doctorId: currentUser.id,
            date: new Date().toISOString(),
            presentingProblem: '', 
            diagnosis: '',
            items: items.filter(item => item.medicineId).map(item => item as PrescriptionItem),
            otherDirections: notes,
        };

        dispatch({ type: 'ADD_PRESCRIPTION', payload: newPrescription });
        setItems([{}]);
        setNotes('');
        onClose();
    };
    
    if (!patient) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`New Prescription for ${patient.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-2 border rounded-lg items-center bg-gray-50">
                       <div className="col-span-3">
                            <label className="text-xs font-medium text-gray-600">Medicine</label>
                            <select value={item.medicineId} onChange={e => handleItemChange(index, 'medicineId', e.target.value)} required className="mt-1 block w-full px-2 py-1 border rounded-md text-sm"><option value="">Select Medicine</option>{medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                        </div>
                         <div className="col-span-1"><label className="text-xs">Qty</label><input type="text" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="mt-1 w-full p-1 border rounded text-sm"/></div>
                         <div className="col-span-2"><label className="text-xs">Duration</label><input type="text" value={item.duration} onChange={e => handleItemChange(index, 'duration', e.target.value)} className="mt-1 w-full p-1 border rounded text-sm"/></div>
                         <div className="col-span-2"><label className="text-xs">Interval</label><input type="text" value={item.interval} onChange={e => handleItemChange(index, 'interval', e.target.value)} className="mt-1 w-full p-1 border rounded text-sm"/></div>
                         <div className="col-span-1"><label className="text-xs">Route</label><select value={item.route} onChange={e => handleItemChange(index, 'route', e.target.value as DosageRoute)} className="mt-1 w-full p-1 border rounded text-sm">{dosageRoutes.map(r=><option key={r}>{r}</option>)}</select></div>
                         <div className="col-span-2"><label className="text-xs">Directions</label><input type="text" value={item.directions} onChange={e => handleItemChange(index, 'directions', e.target.value)} className="mt-1 w-full p-1 border rounded text-sm"/></div>
                         
                         {items.length > 1 && (
                            <button type="button" onClick={() => removeItemRow(index)} className="text-red-500 hover:text-red-700">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                            </button>
                        )}
                    </div>
                ))}
                 <Button type="button" variant="secondary" onClick={addItemRow}>Add Medicine</Button>

                 <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor's Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit">Save Prescription</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddPrescriptionModal;
