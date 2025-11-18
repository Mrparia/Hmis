import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bill, BillItem, InventoryItem, PaymentMethod, InventoryBatch, BillStatus, SalesReturnItem } from '../types';
import Button from './common/Button';
import Modal from './common/Modal';
import { fuzzySearch } from '../utils';

// Type for local state to manage items being added to the bill
type TempBillItem = Omit<BillItem, 'batchNumber' | 'expiryDate'> & {
    batchNumber?: string;
    expiryDate?: string;
    category: InventoryItem['category'];
};

const CreateBill: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { patients, inventory, currentUser } = state;
  
  const isPharmacist = currentUser?.role === 'Pharmacist';
  const isReceptionist = currentUser?.role === 'Receptionist';

  const [customerType, setCustomerType] = useState<'Registered' | 'Walk-in'>('Registered');
  const [walkinName, setWalkinName] = useState('');
  const [walkinContact, setWalkinContact] = useState('');

  const [patientSearch, setPatientSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [billItems, setBillItems] = useState<TempBillItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<string>('');
  const [selectedBatchNumber, setSelectedBatchNumber] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);

  const filteredPatients = useMemo(() => {
    if (!patientSearch) return patients;
    return patients.filter(p => fuzzySearch(patientSearch, `${p.name} ${p.id}`));
  }, [patients, patientSearch]);

  const availableInventory = useMemo(() => {
    let filtered = inventory;
    if(isPharmacist) filtered = inventory.filter(i => i.category === 'Medicine');
    if(isReceptionist) filtered = inventory.filter(i => ['General', 'Pathology', 'Radiology'].includes(i.category));

    return filtered
      .filter(item => item.batches.some(b => b.stock > 0))
      .filter(item => fuzzySearch(itemSearch, item.name));
  }, [inventory, isPharmacist, isReceptionist, itemSearch]);
  
  const selectedItem = useMemo(() => availableInventory.find(i => i.id === selectedInventoryItem), [availableInventory, selectedInventoryItem]);
  const selectedItemBatches = useMemo(() => selectedItem?.batches.filter(b => b.stock > 0) || [], [selectedItem]);

  useEffect(() => { setSelectedInventoryItem(availableInventory[0]?.id || '') }, [availableInventory]);
  useEffect(() => { setSelectedBatchNumber(selectedItemBatches[0]?.batchNumber || '') }, [selectedItemBatches]);
  useEffect(() => { setDiscount(0) }, [selectedInventoryItem]);

  const { subTotal, totalDiscount, totalGst, grandTotal } = useMemo(() => {
    let subTotal = 0;
    let totalDiscount = 0;
    let totalGst = 0;

    billItems.forEach(item => {
        const itemSubTotal = item.pricePerUnit * item.quantity;
        subTotal += itemSubTotal;
        totalDiscount += item.discountAmount;
        totalGst += item.gstAmount;
    });

    return { subTotal, totalDiscount, totalGst, grandTotal: subTotal - totalDiscount + totalGst };
  }, [billItems]);

  const handleAddItem = () => {
    if (!selectedItem || (isPharmacist && !selectedBatchNumber)) return;
    const batch = selectedItem.batches.find(b => b.batchNumber === selectedBatchNumber) || selectedItem.batches[0];
    if (!batch) return;

    if (quantity > batch.stock && selectedItem.category !== 'General') {
        alert(`Cannot add. Only ${batch.stock} available.`);
        return;
    }

    const itemSubTotal = selectedItem.price * quantity;
    const discountAmount = (selectedItem.category === 'Pathology' || selectedItem.category === 'Radiology') ? itemSubTotal * (discount / 100) : 0;
    const total = itemSubTotal - discountAmount;
    const gstAmount = total * (selectedItem.gstRate / 100);

    setBillItems([...billItems, {
      itemId: selectedItem.id, itemName: selectedItem.name, quantity, pricePerUnit: selectedItem.price,
      gstRate: selectedItem.gstRate, total, gstAmount, batchNumber: selectedBatchNumber || 'NA', expiryDate: batch.expiryDate,
      discountPercentage: discount, discountAmount, category: selectedItem.category,
    }]);

    setItemSearch(''); setQuantity(1); setDiscount(0);
  };
  
  const handleRemoveItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const handleCreateBill = () => {
    if (billItems.length === 0 || !currentUser) return;

    const requiresApproval = billItems.some(item => item.discountPercentage > 5);
    const status: BillStatus = requiresApproval ? 'Pending Approval' : 'Finalized';

    const newBill: Bill = {
      id: `B${Date.now()}`, customerType, billDate: new Date().toISOString(),
      items: billItems.map(item => ({...item, batchNumber: item.batchNumber || 'NA', expiryDate: item.expiryDate || ''})),
      subTotal, totalDiscount, totalGst, grandTotal, paymentMethod, 
      billType: isPharmacist ? 'Pharmacy' : 'Services', status, requestedById: currentUser.id,
    };
    
    if (customerType === 'Registered') {
        const patientDetails = patients.find(p => p.id === selectedPatient);
        if (!patientDetails) { alert('Please select a registered patient.'); return; }
        newBill.patientId = selectedPatient;
        newBill.patientName = patientDetails.name;
    } else {
        if (!walkinName.trim()) { alert('Please enter a name for the walk-in customer.'); return; }
        newBill.customerName = walkinName;
        newBill.customerContact = walkinContact;
    }
    
    dispatch({ type: 'ADD_BILL', payload: newBill });
    
    if (requiresApproval) {
        alert('Bill submitted for discount approval.');
    }

    setSelectedPatient(''); setPatientSearch(''); setBillItems([]); setPaymentMethod('Cash');
    setWalkinName(''); setWalkinContact('');
  };
  
  const isBillable = (customerType === 'Registered' && selectedPatient) || (customerType === 'Walk-in' && walkinName);
  const buttonText = billItems.some(i => i.discountPercentage > 5) ? 'Submit for Approval' : 'Generate & Print Bill';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-surface p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-primary mb-4">Create New Bill</h3>

        <div className="mb-4">
            <div className="flex items-center space-x-4 mb-2">
                <label className="flex items-center"><input type="radio" value="Registered" checked={customerType === 'Registered'} onChange={() => setCustomerType('Registered')} className="mr-2"/> Registered Patient</label>
                <label className="flex items-center"><input type="radio" value="Walk-in" checked={customerType === 'Walk-in'} onChange={() => setCustomerType('Walk-in')} className="mr-2"/> Walk-in Customer</label>
            </div>
            {customerType === 'Registered' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Search Patient by Name or ID..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} className="w-full px-3 py-2 border rounded-md"/>
                    <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="w-full px-3 py-2 border bg-white rounded-md">
                        <option value="">-- Select Patient --</option>
                        {filteredPatients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <input type="text" placeholder="Customer Name" value={walkinName} onChange={e => setWalkinName(e.target.value)} required className="w-full px-3 py-2 border rounded-md"/>
                    <input type="text" placeholder="Contact Number (Optional)" value={walkinContact} onChange={e => setWalkinContact(e.target.value)} className="w-full px-3 py-2 border rounded-md"/>
                </div>
            )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Add Item</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-3"><label className="text-xs">Search Item</label><input type="text" placeholder="Search..." value={itemSearch} onChange={e => setItemSearch(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md text-sm"/></div>
                <div className="md:col-span-4"><label className="text-xs">Select Item</label><select value={selectedInventoryItem} onChange={e => setSelectedInventoryItem(e.target.value)} className="mt-1 w-full px-3 py-2 border bg-white rounded-md text-sm"><option value="">-- Choose Item --</option>{availableInventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                {isPharmacist && <div className="md:col-span-2"><label className="text-xs">Batch</label><select value={selectedBatchNumber} onChange={e => setSelectedBatchNumber(e.target.value)} className="mt-1 w-full px-3 py-2 border bg-white rounded-md text-sm"><option value="">-- Batch --</option>{selectedItemBatches.map(b => <option key={b.batchNumber} value={b.batchNumber}>{b.batchNumber}</option>)}</select></div>}
                {(isReceptionist && (selectedItem?.category === 'Pathology' || selectedItem?.category === 'Radiology')) && <div className="md:col-span-2"><label className="text-xs">Discount %</label><select value={discount} onChange={e => setDiscount(Number(e.target.value))} className="mt-1 w-full px-3 py-2 border bg-white rounded-md text-sm"><option value={0}>0%</option><option value={5}>5%</option><option value={10}>10%</option><option value={15}>15%</option><option value={20}>20%</option></select></div>}
                <div className="md:col-span-1"><label className="text-xs">Qty</label><input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="mt-1 w-full px-3 py-2 border rounded-md text-sm"/></div>
                <div className="md:col-span-2"><Button onClick={handleAddItem} disabled={!selectedInventoryItem} className="w-full h-10">Add</Button></div>
            </div>
        </div>

        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="text-xs uppercase bg-gray-50"><tr>{['Item', 'Qty', 'Price', 'Discount', 'Total', ''].map(h=><th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr></thead>
          <tbody>{billItems.map((item, index) => <tr key={index} className="border-b"><td className="p-2 font-medium">{item.itemName}</td><td className="p-2">{item.quantity}</td><td className="p-2">₹{item.pricePerUnit.toFixed(2)}</td><td className="p-2">₹{item.discountAmount.toFixed(2)} ({item.discountPercentage}%)</td><td className="p-2">₹{(item.total + item.gstAmount).toFixed(2)}</td><td className="p-2 text-center"><button onClick={() => handleRemoveItem(index)} className="text-red-500">&times;</button></td></tr>)}</tbody>
        </table></div>
      </div>
      
      <div className="bg-surface p-6 rounded-xl shadow-lg self-start">
        <h3 className="text-xl font-bold text-primary mb-4 border-b pb-2">Bill Summary</h3>
        <div className="space-y-3"><div className="flex justify-between"><span>Subtotal:</span><span>₹{subTotal.toFixed(2)}</span></div><div className="flex justify-between text-red-600"><span>Discount:</span><span>- ₹{totalDiscount.toFixed(2)}</span></div><div className="flex justify-between"><span>GST:</span><span>+ ₹{totalGst.toFixed(2)}</span></div><div className="border-t my-2"></div><div className="flex justify-between text-lg font-bold"><span>Grand Total:</span><span>₹{grandTotal.toFixed(2)}</span></div><div className="pt-4"><label className="text-sm font-medium">Payment Method</label><select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 w-full p-2 border bg-white rounded-md"><option>Cash</option><option>Card</option><option>UPI</option><option>Insurance</option></select></div></div>
        <div className="mt-6"><Button onClick={handleCreateBill} disabled={!isBillable || billItems.length === 0} className="w-full">{buttonText}</Button></div>
      </div>
    </div>
  );
};

const SalesReturnModal: React.FC<{bill: Bill | null, onClose: () => void}> = ({ bill, onClose }) => {
    const { dispatch } = useAppContext();
    const [returnItems, setReturnItems] = useState<Record<string, { qty: number }>>({});

    useEffect(() => {
        if (bill) {
            const initialReturnState: Record<string, { qty: number }> = {};
            bill.items.forEach((item, index) => {
                const uniqueKey = `${item.itemId}-${item.batchNumber}-${index}`;
                initialReturnState[uniqueKey] = { qty: 0 };
            });
            setReturnItems(initialReturnState);
        }
    }, [bill]);

    if (!bill) return null;

    const handleQtyChange = (key: string, newQty: number, maxQty: number) => {
        const qty = Math.max(0, Math.min(newQty, maxQty));
        setReturnItems(prev => ({...prev, [key]: {...prev[key], qty}}));
    };

    const totalRefund = useMemo(() => {
        return bill.items.reduce((total, item, index) => {
            const key = `${item.itemId}-${item.batchNumber}-${index}`;
            const returnQty = returnItems[key]?.qty || 0;
            const pricePerUnitAfterDiscount = (item.total + item.gstAmount) / item.quantity;
            return total + (returnQty * pricePerUnitAfterDiscount);
        }, 0);
    }, [returnItems, bill.items]);

    const handleProcessReturn = () => {
        const itemsToReturn: SalesReturnItem[] = [];
        bill.items.forEach((item, index) => {
            const key = `${item.itemId}-${item.batchNumber}-${index}`;
            const returnQty = returnItems[key]?.qty || 0;
            if (returnQty > 0) {
                 const pricePerUnitAfterDiscountAndGst = (item.total + item.gstAmount) / item.quantity;
                 itemsToReturn.push({
                     itemId: item.itemId,
                     itemName: item.itemName,
                     batchNumber: item.batchNumber,
                     quantity: returnQty,
                     returnAmount: returnQty * pricePerUnitAfterDiscountAndGst,
                 });
            }
        });

        if(itemsToReturn.length === 0) {
            alert("Please enter a quantity to return for at least one item.");
            return;
        }

        dispatch({ type: 'SALES_RETURN', payload: { originalBillId: bill.id, itemsToReturn }});
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Sales Return for Bill ${bill.id}`}>
            <div className="space-y-4">
                <div className="max-h-80 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0"><tr><th className="p-2">Item</th><th className="p-2 text-center">Billed Qty</th><th className="p-2 text-center">Return Qty</th></tr></thead>
                        <tbody>{bill.items.map((item, index) => {
                            const key = `${item.itemId}-${item.batchNumber}-${index}`;
                            return (<tr key={key} className="border-b"><td className="p-2">{item.itemName}</td><td className="p-2 text-center">{item.quantity}</td><td className="p-2 text-center"><input type="number" value={returnItems[key]?.qty || 0} onChange={e => handleQtyChange(key, parseInt(e.target.value), item.quantity)} max={item.quantity} min="0" className="w-20 p-1 border rounded text-center"/></td></tr>)
                        })}</tbody>
                    </table>
                </div>
                <div className="text-right text-xl font-bold text-primary">Total Refund: ₹{totalRefund.toFixed(2)}</div>
                <div className="flex justify-end pt-4"><Button onClick={handleProcessReturn}>Process Return</Button></div>
            </div>
        </Modal>
    );
};

const BillHistory: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { bills, currentUser } = state;
    const [searchTerm, setSearchTerm] = useState('');
    const [billToFinalize, setBillToFinalize] = useState<Bill | null>(null);
    const [billToCancel, setBillToCancel] = useState<Bill | null>(null);
    const [billToReturn, setBillToReturn] = useState<Bill | null>(null);

    const isPharmacist = currentUser?.role === 'Pharmacist';
    const isAdmin = currentUser?.role === 'Admin';
    const isReceptionist = currentUser?.role === 'Receptionist';

    const filteredBills = useMemo(() => {
        const sortedBills = [...bills].sort((a,b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime());
        if (!searchTerm) return sortedBills;
        const term = searchTerm.toLowerCase();
        return sortedBills.filter(bill => {
            const customerName = bill.customerType === 'Registered' ? bill.patientName : bill.customerName;
            return fuzzySearch(term, `${customerName} ${bill.id}`);
        });
    }, [bills, searchTerm]);

    const handlePrintBill = (bill: Bill) => dispatch({ type: 'SET_DOCUMENT_TO_PRINT', payload: { type: 'BILL', data: bill } });
    
    const handleUpdateStatus = (billId: string, status: BillStatus) => {
        dispatch({ type: 'UPDATE_BILL_STATUS', payload: { billId, status } });
    };

    const handleFinalizeBill = (paymentMethod: PaymentMethod) => {
        if (!billToFinalize) return;
        dispatch({ type: 'FINALIZE_BILL', payload: { billId: billToFinalize.id, paymentMethod } });
        setBillToFinalize(null);
    };
    
    const handleConfirmCancel = () => {
        if (!billToCancel) return;
        dispatch({ type: 'CANCEL_BILL', payload: { billId: billToCancel.id }});
        setBillToCancel(null);
    };

    const getStatusChip = (status: BillStatus) => {
        const styles: Record<BillStatus, string> = {
            'Finalized': 'bg-green-100 text-green-800', 'Pending Approval': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-blue-100 text-blue-800', 'Rejected': 'bg-red-100 text-red-800',
            'Cancelled': 'bg-gray-200 text-gray-800 line-through', 'Returned': 'bg-orange-100 text-orange-800',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    }

    return (
        <div className="bg-surface p-6 rounded-xl shadow-lg">
            <div className="relative w-full md:w-1/2 lg:w-1/3 mb-6"><input type="text" placeholder="Search by Customer/Patient Name or Bill ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg"/></div>
            <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead className="text-xs uppercase bg-gray-50"><tr>{['Bill ID', 'Customer/Patient', 'Date', 'Amount', 'Status', 'Actions'].map(h=><th key={h} className="px-6 py-3 text-left">{h}</th>)}</tr></thead>
                <tbody>{filteredBills.map(bill => {
                    const customerName = bill.customerType === 'Registered' ? bill.patientName : bill.customerName;
                    return (
                    <tr key={bill.id} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium">{bill.id}</td><td className="px-6 py-4">{customerName}</td><td className="px-6 py-4">{new Date(bill.billDate).toLocaleDateString()}</td><td className="px-6 py-4 font-bold">₹{bill.grandTotal.toFixed(2)}</td><td className="px-6 py-4">{getStatusChip(bill.status)}</td>
                    <td className="px-6 py-4"><div className="flex gap-2">
                        {bill.status === 'Finalized' && <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => handlePrintBill(bill)}>Print</Button>}
                        {isAdmin && bill.status === 'Pending Approval' && (
                            <>
                                <Button onClick={() => handleUpdateStatus(bill.id, 'Approved')} className="px-2 py-1 text-xs">Approve</Button>
                                <Button onClick={() => handleUpdateStatus(bill.id, 'Rejected')} variant="danger" className="px-2 py-1 text-xs">Reject</Button>
                            </>
                        )}
                        {isReceptionist && bill.status === 'Approved' && <Button className="px-2 py-1 text-xs" onClick={() => setBillToFinalize(bill)}>Finalize & Pay</Button>}
                        {(isAdmin || isReceptionist) && ['Finalized', 'Approved'].includes(bill.status) && (
                            <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => setBillToCancel(bill)}>Cancel</Button>
                        )}
                        {(isAdmin || isPharmacist) && bill.status === 'Finalized' && bill.billType === 'Pharmacy' && (
                            <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => setBillToReturn(bill)}>Return</Button>
                        )}
                    </div></td>
                </tr>
                )})}</tbody>
            </table></div>
            {billToFinalize && (
                <Modal isOpen={true} onClose={() => setBillToFinalize(null)} title={`Finalize Bill ${billToFinalize.id}`}>
                    <div>
                        <h4 className="font-semibold mb-2">Select Payment Method</h4>
                        <select onChange={e => handleFinalizeBill(e.target.value as PaymentMethod)} defaultValue="" className="w-full p-2 border bg-white rounded-md">
                            <option value="" disabled>-- Choose Method --</option>
                            <option>Cash</option><option>Card</option><option>UPI</option><option>Insurance</option>
                        </select>
                    </div>
                </Modal>
            )}
             {billToCancel && (
                <Modal isOpen={true} onClose={() => setBillToCancel(null)} title={`Confirm Bill Cancellation`}>
                    <div className="text-center">
                        <p className="text-lg mb-4">Are you sure you want to cancel bill <strong>{billToCancel.id}</strong>? This action cannot be undone and stock will be reverted.</p>
                        <div className="flex justify-center gap-4">
                            <Button variant="secondary" onClick={() => setBillToCancel(null)}>Go Back</Button>
                            <Button variant="danger" onClick={handleConfirmCancel}>Yes, Cancel Bill</Button>
                        </div>
                    </div>
                </Modal>
            )}
            <SalesReturnModal bill={billToReturn} onClose={() => setBillToReturn(null)} />
        </div>
    );
};

const Billing: React.FC = () => {
    const [view, setView] = useState<'create' | 'history'>('create');
    return (
        <div>
            <div className="flex border-b mb-6"><button onClick={() => setView('create')} className={`px-4 py-2 font-medium text-lg ${view === 'create' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Create Bill</button><button onClick={() => setView('history')} className={`px-4 py-2 font-medium text-lg ${view === 'history' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Bill History</button></div>
            {view === 'create' ? <CreateBill /> : <BillHistory />}
        </div>
    );
};

export default Billing;