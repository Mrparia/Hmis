import React from 'react';
import { Bill } from '../types';
import { useAppContext } from '../context/AppContext';

interface PrintableBillProps {
  bill: Bill;
}

const PrintableBill: React.FC<PrintableBillProps> = ({ bill }) => {
  const { state } = useAppContext();
  const patient = state.patients.find(p => p.id === bill.patientId);
  const doctor = patient ? state.doctors.find(d => d.id === patient.assignedDoctorId) : null;
  const settledBy = state.users.find(u => u.id === bill.settledById);

  return (
    <div className="printable-content">
      <div className="p-8 font-sans text-sm">
        <header className="flex justify-between items-start pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-primary">HIMS Professional</h1>
            <p>123 Health St, Wellness City, 560001</p>
            <p>Contact: +91 80 1234 5678</p>
            <p>GSTIN: 29AAAAA0000A1Z5</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mt-2">INVOICE</h2>
        </header>

        <section className="grid grid-cols-2 gap-8 my-6">
          <div>
            <h3 className="font-bold mb-1">Bill To:</h3>
            <p>{patient?.name}</p>
            <p><strong>Patient ID:</strong> {patient?.id}</p>
            <p>{patient?.address}</p>
            <p>{patient?.city}, {patient?.state} - {patient?.pincode}</p>
          </div>
          <div>
             <div className="text-right">
                <p><strong>Invoice #:</strong> {bill.id}</p>
                <p><strong>Date:</strong> {new Date(bill.billDate).toLocaleDateString()}</p>
              </div>
              {doctor && (
                <div className="text-right mt-4 border-t pt-2">
                    <h3 className="font-bold mb-1">Consulting Doctor:</h3>
                    <p>{doctor.name}</p>
                    <p>{doctor.qualification}</p>
                    {doctor.registrationNumber && <p>Reg. No: {doctor.registrationNumber}</p>}
                </div>
              )}
          </div>
        </section>

        <section>
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Item Description</th>
                <th className="p-2">Batch No.</th>
                <th className="p-2">Expiry</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right">Unit Price</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map(item => (
                <tr key={`${item.itemId}-${item.batchNumber}`} className="border-b">
                  <td className="p-2">{item.itemName}</td>
                  {item.category === 'Medicine' ? (
                    <>
                      <td className="p-2">{item.batchNumber}</td>
                      <td className="p-2">{new Date(item.expiryDate).toLocaleDateString('en-CA')}</td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">-</td>
                      <td className="p-2">-</td>
                    </>
                  )}
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right">₹{item.pricePerUnit.toFixed(2)}</td>
                  <td className="p-2 text-right">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="flex justify-between mt-6">
          <div className="text-sm">
            <p><strong>Payment Method:</strong> {bill.paymentMethod}</p>
            {settledBy && <p><strong>Settled By:</strong> {settledBy.name} ({settledBy.id})</p>}
          </div>
          <div className="w-1/3 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{bill.subTotal.toFixed(2)}</span>
            </div>
             <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>- ₹{bill.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total GST:</span>
              <span>₹{bill.totalGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Grand Total:</span>
              <span>₹{bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>
        
        <footer className="text-center text-xs text-gray-500 mt-12 pt-4 border-t">
            <p>Thank you for choosing HIMS Professional. Please contact support for any questions regarding this invoice.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrintableBill;