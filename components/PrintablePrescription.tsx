import React from 'react';
import { Prescription } from '../types';
import { useAppContext } from '../context/AppContext';

interface PrintablePrescriptionProps {
  prescription: Prescription;
}

const PrintablePrescription: React.FC<PrintablePrescriptionProps> = ({ prescription }) => {
  const { state } = useAppContext();
  const patient = state.patients.find(p => p.id === prescription.patientId);
  const doctor = state.doctors.find(d => d.id === prescription.doctorId);

  return (
    <div className="printable-content">
      <div className="p-8 font-serif text-base">
        <header className="flex justify-between items-start pb-4 border-b-2 border-black">
          <div>
            <h2 className="text-2xl font-bold">{doctor?.name}</h2>
            <p>{doctor?.qualification}</p>
            <p>{doctor?.specialization}</p>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-primary">HIMS Professional</h1>
            <p className="text-right">123 Health St, Wellness City</p>
          </div>
        </header>

        <section className="flex justify-between py-4 border-b">
            <div><strong>Patient:</strong> {patient?.name}</div>
            <div><strong>Age:</strong> {patient?.age}</div>
            <div><strong>Gender:</strong> {patient?.gender}</div>
            <div><strong>Date:</strong> {new Date(prescription.date).toLocaleDateString()}</div>
        </section>

         <section className="my-4 text-sm">
            {prescription.presentingProblem && <p><strong>Presenting Problem:</strong> {prescription.presentingProblem}</p>}
            {prescription.diagnosis && <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>}
        </section>

        <section className="my-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Rx_symbol.svg/1200px-Rx_symbol.svg.png" alt="Rx" className="w-12 h-12 mb-4" />
            <table className="w-full">
                <tbody>
                    {prescription.items.map((item, index) => (
                        <tr key={index}>
                            <td className="py-3 align-top font-semibold pr-4">{index + 1}.</td>
                            <td className="py-3">
                                <p className="font-bold text-lg">{item.medicineName}</p>
                                <p className="text-gray-700 italic">{item.route} - {item.directions}</p>
                            </td>
                            <td className="py-3 text-right">
                                <p>{item.interval}</p>
                                <p>{item.duration}</p>
                                <p>Qty: {item.quantity}</p>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {prescription.otherDirections && (
            <section className="my-8">
                <h4 className="font-bold">Directions:</h4>
                <p>{prescription.otherDirections}</p>
            </section>
        )}

        {prescription.followUpDate && (
             <section className="my-8">
                <h4 className="font-bold">Follow-up:</h4>
                <p>Please schedule a follow-up appointment on or around {new Date(prescription.followUpDate).toLocaleDateString()}.</p>
            </section>
        )}

        <footer className="flex justify-end items-end pt-16">
            <div className="text-center">
                {doctor?.signatureUrl && <img src={doctor.signatureUrl} alt="Doctor's Signature" className="mx-auto" />}
                <p className="border-t-2 border-black pt-2 mt-2">Dr. {doctor?.name}</p>
            </div>
        </footer>

      </div>
    </div>
  );
};

export default PrintablePrescription;