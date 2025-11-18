import React, { useState, useEffect, useMemo } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { Patient, PatientVisit, Prescription, PrescriptionItem, LabRequest, LabRequestItem, DosageRoute, MedicalHistory, Doctor } from '../types';
import { useAppContext } from '../context/AppContext';

interface DoctorCheckinWorkflowProps {
    visit: PatientVisit | null;
    onClose: () => void;
}

type WorkflowStep = 'vitals' | 'diagnosis' | 'preview';

export const DoctorCheckinWorkflow: React.FC<DoctorCheckinWorkflowProps> = ({ visit, onClose }) => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [activeStep, setActiveStep] = useState<WorkflowStep>('vitals');
    
    const patient = useMemo(() => state.patients.find(p => p.id === visit?.patientId), [state.patients, visit]);

    // State for all form data
    const [vitals, setVitals] = useState({ bp: '', oxygenSaturation: 98, heartRate: 72, height: 0, weight: 0, bmi: 0 });
    const [history, setHistory] = useState<MedicalHistory>({});
    const [diagnosis, setDiagnosis] = useState({ presentingProblem: '', diagnosis: '' });
    const [pharmacyItems, setPharmacyItems] = useState<Partial<PrescriptionItem>[]>([{}]);
    const [labItems, setLabItems] = useState<Partial<LabRequestItem>[]>([{}]);
    const [otherDirections, setOtherDirections] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [isFinalizing, setIsFinalizing] = useState(false);

    useEffect(() => {
        if (visit && patient) {
            dispatch({ type: 'UPDATE_PATIENT_STATUS', payload: { visitId: visit.id, newStatus: 'In Consultation' } });
            // Pre-fill with existing data if available
            setVitals(patient.vitals || { bp: '', oxygenSaturation: 98, heartRate: 72, height: 0, weight: 0, bmi: 0 });
            setHistory(patient.medicalHistory || {});
        }
    }, [visit, patient, dispatch]);

    // Auto-calculate BMI
    useEffect(() => {
        if (vitals.height > 0 && vitals.weight > 0) {
            const heightInMeters = vitals.height / 100;
            const bmiValue = vitals.weight / (heightInMeters * heightInMeters);
            setVitals(v => ({ ...v, bmi: parseFloat(bmiValue.toFixed(2)) }));
        } else {
            setVitals(v => ({...v, bmi: 0}));
        }
    }, [vitals.height, vitals.weight]);
    
    if (!visit || !patient) return null;

    const handleFinalize = () => {
        if (!currentUser) return;
        setIsFinalizing(true);
        const finalPharmacyItems = pharmacyItems
            .filter(i => i.medicineName && i.medicineName.trim() !== "")
            .map(i => ({
                medicineId: i.medicineId || `MANUAL-${Date.now()}`,
                medicineName: i.medicineName || '',
                quantity: i.quantity || '',
                duration: i.duration || '',
                interval: i.interval || '',
                route: i.route || 'Oral',
                directions: i.directions || '',
            } as PrescriptionItem));

        const finalPrescription: Prescription = {
            id: `RX${Date.now()}`,
            patientId: patient.id,
            doctorId: currentUser.id,
            date: new Date().toISOString(),
            presentingProblem: diagnosis.presentingProblem,
            diagnosis: diagnosis.diagnosis,
            items: finalPharmacyItems,
            otherDirections,
            followUpDate,
        };

        const finalLabRequest: LabRequest | null = labItems.some(i => i.testId)
            ? {
                id: `LAB${Date.now()}`,
                patientId: patient.id,
                doctorId: currentUser.id,
                date: new Date().toISOString(),
                tests: labItems.filter(i => i.testId).map(i => i as LabRequestItem),
                status: 'Advised',
            } : null;

        dispatch({
            type: 'FINALIZE_DOCTOR_VISIT',
            payload: {
                visit,
                vitals,
                medicalHistory: history,
                prescription: finalPrescription,
                labRequest: finalLabRequest,
            }
        });
        
        setTimeout(() => {
            onClose();
        }, 1000); // Wait for animation
    };
    
    const renderStep = () => {
        switch (activeStep) {
            case 'vitals': return <VitalsAndHistoryStep vitals={vitals} setVitals={setVitals} history={history} setHistory={setHistory} />;
            case 'diagnosis': return <DiagnosisAndAdviceStep diagnosis={diagnosis} setDiagnosis={setDiagnosis} pharmacyItems={pharmacyItems} setPharmacyItems={setPharmacyItems} labItems={labItems} setLabItems={setLabItems} otherDirections={otherDirections} setOtherDirections={setOtherDirections} followUpDate={followUpDate} setFollowUpDate={setFollowUpDate} />;
            case 'preview': return <PreviewStep patient={patient} doctor={state.doctors.find(d => d.id === currentUser?.id)} data={{ vitals, history, diagnosis, pharmacyItems, labItems, otherDirections, followUpDate }} setPharmacyItems={setPharmacyItems} />;
        }
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={`Consultation: ${patient.name}`}>
            <div className="space-y-6">
                <div className="flex justify-center border-b pb-2">
                    { (['vitals', 'diagnosis', 'preview'] as WorkflowStep[]).map((step, index) => (
                        <React.Fragment key={step}>
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${activeStep === step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {index + 1}
                                </div>
                                <span className={`ml-2 mr-4 font-semibold ${activeStep === step ? 'text-primary' : 'text-gray-500'}`}>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                            </div>
                            {index < 2 && <div className="w-16 border-t-2 border-gray-200 self-center"></div>}
                        </React.Fragment>
                    ))}
                </div>
                
                <div className="min-h-[60vh] max-h-[60vh] overflow-y-auto p-1 pr-4">
                    {renderStep()}
                </div>

                <div className="flex justify-between pt-4 border-t">
                    <Button variant="secondary" onClick={() => activeStep === 'diagnosis' ? setActiveStep('vitals') : activeStep === 'preview' ? setActiveStep('diagnosis') : onClose()} disabled={activeStep === 'vitals'}>Back</Button>
                    {activeStep !== 'preview' ? (
                         <Button onClick={() => activeStep === 'vitals' ? setActiveStep('diagnosis') : setActiveStep('preview')}>Next</Button>
                    ) : (
                         <Button onClick={handleFinalize} disabled={isFinalizing}>
                            {isFinalizing ? (
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animation: 'check-in 0.5s forwards' }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    Finalized
                                </span>
                            ) : (
                                'Finalize Consultation'
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

// Sub-components for each step
const VitalsAndHistoryStep: React.FC<any> = ({ vitals, setVitals, history, setHistory }) => {
    const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVitals((prev: any) => ({ ...prev, [e.target.name]: e.target.valueAsNumber || e.target.value }));
    };
    const handleHistoryChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setHistory((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="space-y-6">
            <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Vitals & Measurements</legend>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div><label className="text-sm">BP (Systolic/Diastolic)</label><input name="bp" value={vitals.bp} onChange={handleVitalsChange} placeholder="e.g., 120/80" className="mt-1 w-full p-2 border rounded"/></div>
                    <div><label className="text-sm">O2 Saturation (%)</label><input name="oxygenSaturation" type="number" value={vitals.oxygenSaturation} onChange={handleVitalsChange} className="mt-1 w-full p-2 border rounded"/></div>
                    <div><label className="text-sm">Heart Rate (bpm)</label><input name="heartRate" type="number" value={vitals.heartRate} onChange={handleVitalsChange} className="mt-1 w-full p-2 border rounded"/></div>
                    <div><label className="text-sm">Height (cm)</label><input name="height" type="number" value={vitals.height} onChange={handleVitalsChange} className="mt-1 w-full p-2 border rounded"/></div>
                    <div><label className="text-sm">Weight (kg)</label><input name="weight" type="number" value={vitals.weight} onChange={handleVitalsChange} className="mt-1 w-full p-2 border rounded"/></div>
                </div>
                {vitals.bmi > 0 && <div className="mt-4 text-center font-bold text-lg text-primary bg-blue-50 p-2 rounded">BMI: {vitals.bmi}</div>}
            </fieldset>
            <fieldset className="border p-4 rounded-lg">
                 <legend className="px-2 font-semibold">Medical History</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium">Past Blood Sugar</label><input name="pastBloodSugar" value={history.pastBloodSugar || ''} onChange={handleHistoryChange} placeholder="e.g., Fasting 110, PP 140" className="mt-1 w-full p-2 border rounded"/></div>
                    <div><label className="text-sm font-medium">Thyroid History</label><input name="thyroidHistory" value={history.thyroidHistory || ''} onChange={handleHistoryChange} placeholder="e.g., Hypothyroidism since 2018" className="mt-1 w-full p-2 border rounded"/></div>
                    <div><label className="text-sm font-medium">Past Surgeries / Illnesses</label><textarea name="pastSurgeries" value={history.pastSurgeries || ''} onChange={handleHistoryChange} placeholder="e.g., Appendectomy (2010)" rows={2} className="w-full p-2 border rounded mt-1"/></div>
                    <div><label className="text-sm font-medium">Drug Allergies</label><textarea name="drugAllergies" value={history.drugAllergies || ''} onChange={handleHistoryChange} placeholder="e.g., Penicillin (causes rash)" rows={2} className="w-full p-2 border rounded mt-1"/></div>
                    <div className="md:col-span-2"><label className="text-sm font-medium">Family Medical History</label><textarea name="familyMedicalHistory" value={history.familyMedicalHistory || ''} onChange={handleHistoryChange} placeholder="e.g., Father - Diabetes, Mother - Hypertension" rows={2} className="w-full p-2 border rounded mt-1"/></div>
                 </div>
            </fieldset>
        </div>
    );
};

const DiagnosisAndAdviceStep: React.FC<any> = ({ diagnosis, setDiagnosis, pharmacyItems, setPharmacyItems, labItems, setLabItems, otherDirections, setOtherDirections, followUpDate, setFollowUpDate }) => {
    const { state } = useAppContext();
    const medicines = useMemo(() => state.inventory.filter(i => i.category === 'Medicine'), [state.inventory]);
    const labTests = useMemo(() => state.inventory.filter(i => i.category === 'Pathology' || i.category === 'Radiology'), [state.inventory]);

    const handlePharmacyChange = <K extends keyof PrescriptionItem>(index: number, field: K, value: PrescriptionItem[K]) => {
        const newItems = [...pharmacyItems];
        const currentItem = newItems[index] || {};
        currentItem[field] = value;
        if (field === 'medicineId') {
            const med = medicines.find(m => m.id === value);
            currentItem.medicineName = med?.name;
        }
        newItems[index] = currentItem;
        setPharmacyItems(newItems);
    };
    const addPharmacyRow = () => setPharmacyItems([...pharmacyItems, {}]);
    const removePharmacyRow = (index: number) => setPharmacyItems(pharmacyItems.filter((_:any, i:number) => i !== index));

    const handleLabChange = (index: number, field: keyof LabRequestItem, value: string) => {
        const newItems = [...labItems];
        newItems[index][field] = value;
        if(field === 'testId') newItems[index].testName = labTests.find(t => t.id === value)?.name;
        setLabItems(newItems);
    };
    const addLabRow = () => setLabItems([...labItems, {}]);
    const removeLabRow = (index: number) => setLabItems(labItems.filter((_:any, i:number) => i !== index));

    const dosageRoutes: DosageRoute[] = ['Oral', 'Topical', 'Injection', 'IV', 'Other'];

    return (
        <div className="space-y-6">
             <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Diagnosis</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea value={diagnosis.presentingProblem} onChange={e => setDiagnosis({...diagnosis, presentingProblem: e.target.value})} placeholder="Patient's Presenting Problem" rows={3} className="w-full p-2 border rounded"/>
                    <textarea value={diagnosis.diagnosis} onChange={e => setDiagnosis({...diagnosis, diagnosis: e.target.value})} placeholder="Diagnosis" rows={3} className="w-full p-2 border rounded"/>
                </div>
            </fieldset>
             <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Pharmacy Advice</legend>
                <div className="space-y-2">
                    {pharmacyItems.map((item: PrescriptionItem, index: number) => (
                        <div key={index} className="grid grid-cols-12 gap-2 p-2 border rounded bg-gray-50 items-center">
                            <select value={item.medicineId} onChange={e => handlePharmacyChange(index, 'medicineId', e.target.value)} className="col-span-3 p-1 border bg-white rounded text-sm"><option value="">-- Select Medicine --</option>{medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                            <input value={item.quantity || ''} onChange={e => handlePharmacyChange(index, 'quantity', e.target.value)} placeholder="Qty" className="col-span-1 p-1 border rounded text-sm"/>
                            <input value={item.duration || ''} onChange={e => handlePharmacyChange(index, 'duration', e.target.value)} placeholder="Duration" className="col-span-2 p-1 border rounded text-sm"/>
                            <input value={item.interval || ''} onChange={e => handlePharmacyChange(index, 'interval', e.target.value)} placeholder="Interval" className="col-span-2 p-1 border rounded text-sm"/>
                            <select value={item.route || 'Oral'} onChange={e => handlePharmacyChange(index, 'route', e.target.value as DosageRoute)} className="col-span-1 p-1 border bg-white rounded text-sm">{dosageRoutes.map(r => <option key={r}>{r}</option>)}</select>
                            <input value={item.directions || ''} onChange={e => handlePharmacyChange(index, 'directions', e.target.value)} placeholder="Directions" className="col-span-2 p-1 border rounded text-sm"/>
                            <button type="button" onClick={() => removePharmacyRow(index)} className="text-red-500 font-bold">&times;</button>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="secondary" onClick={addPharmacyRow} className="mt-2 text-xs px-2 py-1">Add Medicine</Button>
            </fieldset>
            <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Lab Advice</legend>
                <div className="space-y-2">
                     {labItems.map((item: LabRequestItem, index: number) => (
                        <div key={index} className="flex gap-2 items-center">
                            <select value={item.testId} onChange={e => handleLabChange(index, 'testId', e.target.value)} className="flex-grow p-1 border bg-white rounded text-sm"><option value="">-- Select Lab Test --</option>{labTests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                            <button type="button" onClick={() => removeLabRow(index)} className="text-red-500 font-bold">&times;</button>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="secondary" onClick={addLabRow} className="mt-2 text-xs px-2 py-1">Add Test</Button>
            </fieldset>
             <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Follow-up & Other Directions</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2"><textarea value={otherDirections} onChange={e => setOtherDirections(e.target.value)} placeholder="Other Directions..." rows={2} className="w-full p-2 border rounded"/></div>
                    <div><label className="text-sm">Next Follow-up</label><input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="mt-1 w-full p-2 border rounded"/></div>
                </div>
            </fieldset>
        </div>
    );
};

const PreviewStep: React.FC<{
    patient: Patient;
    doctor: Doctor | undefined;
    data: any;
    setPharmacyItems: React.Dispatch<React.SetStateAction<Partial<PrescriptionItem>[]>>;
}> = ({ patient, doctor, data, setPharmacyItems }) => {

    const handleItemChange = <K extends keyof PrescriptionItem>(index: number, field: K, value: PrescriptionItem[K]) => {
        setPharmacyItems(prevItems => {
            const newItems: Partial<PrescriptionItem>[] = JSON.parse(JSON.stringify(prevItems));
            if (newItems[index]) {
                (newItems[index] as any)[field] = value;
            }
            return newItems;
        });
    };

    const dosageRoutes: DosageRoute[] = ['Oral', 'Topical', 'Injection', 'IV', 'Other'];

    return (
        <div className="p-4 border rounded-lg bg-white font-serif text-sm">
            <header className="text-center pb-2 border-b-2 border-black">
                <h1 className="text-3xl font-bold text-primary">HIMS Professional</h1>
                <p>123 Health St, Wellness City, 560001</p>
            </header>
            
            <section className="flex justify-between py-2 border-b">
                <div><strong>Patient:</strong> {patient.name} ({patient.gender}, {patient.age}y)</div>
                <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
            </section>
            
            <section className="my-4">
                <p><strong>Diagnosis:</strong> {data.diagnosis.diagnosis || 'N/A'}</p>
            </section>
            
            <section className="my-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Rx_symbol.svg/1200px-Rx_symbol.svg.png" alt="Rx" className="w-10 h-10 mb-2" />
                
                <div className="space-y-2">
                    {data.pharmacyItems.filter((i:any) => i.medicineId || i.medicineName).map((item: PrescriptionItem, index: number) => (
                        <div key={index} className="grid grid-cols-12 gap-2 p-2 border rounded bg-gray-50 items-center">
                            <input 
                                value={item.medicineName || ''} 
                                onChange={e => handleItemChange(index, 'medicineName', e.target.value)} 
                                placeholder="Medicine Name" 
                                className="col-span-3 p-1 border rounded text-sm font-bold"
                            />
                            <input 
                                value={item.quantity || ''} 
                                onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                                placeholder="Qty" 
                                className="col-span-1 p-1 border rounded text-sm"
                            />
                            <input 
                                value={item.duration || ''} 
                                onChange={e => handleItemChange(index, 'duration', e.target.value)} 
                                placeholder="Duration" 
                                className="col-span-2 p-1 border rounded text-sm"
                            />
                            <input 
                                value={item.interval || ''} 
                                onChange={e => handleItemChange(index, 'interval', e.target.value)} 
                                placeholder="Interval" 
                                className="col-span-2 p-1 border rounded text-sm"
                            />
                             <select 
                                value={item.route || 'Oral'} 
                                onChange={e => handleItemChange(index, 'route', e.target.value as DosageRoute)}
                                className="col-span-1 p-1 border bg-white rounded text-sm"
                             >
                                {dosageRoutes.map(r => <option key={r} value={r}>{r}</option>)}
                             </select>
                            <input 
                                value={item.directions || ''} 
                                onChange={e => handleItemChange(index, 'directions', e.target.value)} 
                                placeholder="Directions" 
                                className="col-span-2 p-1 border rounded text-sm"
                            />
                        </div>
                    ))}
                </div>
                 {data.pharmacyItems.filter((i:any) => i.medicineId || i.medicineName).length === 0 && (
                     <p className="text-gray-500">No medications prescribed.</p>
                 )}
            </section>
            
            {data.labItems.filter((i:any) => i.testId).length > 0 && (
                <section className="my-4"><h4 className="font-bold">Lab Tests Advised:</h4><ul className="list-disc pl-5">{data.labItems.filter((i:any) => i.testId).map((item: LabRequestItem, index: number) => <li key={index}>{item.testName}</li>)}</ul></section>
            )}
            <section className="my-4">
                <h4 className="font-bold">Other Directions:</h4>
                <p>{data.otherDirections || 'N/A'}</p>
            </section>
            {data.followUpDate && <section className="my-4"><h4 className="font-bold">Follow-up:</h4><p>Please visit for a follow-up on {new Date(data.followUpDate).toLocaleDateString()}.</p></section>}

            <footer className="flex justify-end items-end pt-16 mt-8">
                <div className="text-center">
                    {doctor?.signatureUrl && <img src={doctor.signatureUrl} alt="Doctor's Signature" className="mx-auto h-12" />}
                    <p className="border-t-2 border-black pt-2 mt-2 font-semibold">Dr. {doctor?.name}</p>
                    <p className="text-xs">{doctor?.qualification}</p>
                    {doctor?.registrationNumber && <p className="text-xs">Reg. No: {doctor.registrationNumber}</p>}
                </div>
            </footer>
        </div>
    );
}