import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Button from './common/Button';
import Modal from './common/Modal';
import { PurchaseOrder, GoodsReceiptNote, PurchaseOrderItem, Vendor, GRNItem } from '../types';

const VendorForm: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { dispatch } = useAppContext();
    const [formData, setFormData] = useState({
        name: '', gstNumber: '', drugLicenseNumber: '', contactPerson: '', phone: '', address: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newVendor: Vendor = { id: `V${Date.now()}`, ...formData };
        dispatch({ type: 'ADD_VENDOR', payload: newVendor });
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Vendor Name" required className="w-full px-3 py-2 border rounded-md"/>
                <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Contact Person" required className="w-full px-3 py-2 border rounded-md"/>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required className="w-full px-3 py-2 border rounded-md"/>
                <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="GST Number" required className="w-full px-3 py-2 border rounded-md"/>
                <input name="drugLicenseNumber" value={formData.drugLicenseNumber} onChange={handleChange} placeholder="Drug License Number (Optional)" className="w-full px-3 py-2 border rounded-md"/>
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" required className="md:col-span-2 w-full px-3 py-2 border rounded-md"/>
            </div>
            <div className="flex justify-end pt-4"><Button type="submit">Add Vendor</Button></div>
        </form>
    );
};

const POForm: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { state, dispatch } = useAppContext();
    const [vendorId, setVendorId] = useState('');
    const [items, setItems] = useState<PurchaseOrderItem[]>([]);
    
    const initialItemState = { productCode: '', itemName: '', quantity: 1, costPrice: 0, discountPercentage: 0, gstRate: 5 as (5|12|18|28), category: 'Medicine' as ('Medicine'|'Consumable'|'General') };
    const [currentItem, setCurrentItem] = useState(initialItemState);

    const orderTotals = useMemo(() => {
        const subTotal = items.reduce((acc, item) => acc + item.costPrice * item.quantity, 0);
        const totalDiscount = items.reduce((acc, item) => acc + (item.costPrice * item.quantity * item.discountPercentage / 100), 0);
        const totalGst = items.reduce((acc, item) => {
            const itemTotalAfterDiscount = (item.costPrice * item.quantity) * (1 - item.discountPercentage / 100);
            return acc + (itemTotalAfterDiscount * item.gstRate / 100);
        }, 0);
        const grandTotal = subTotal - totalDiscount + totalGst;
        return { subTotal, totalDiscount, totalGst, grandTotal };
    }, [items]);

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({...prev, [name]: name === 'quantity' || name === 'costPrice' || name === 'discountPercentage' ? parseFloat(value) || 0 : value}));
    };
    
    const handleAddItem = () => {
        if (!currentItem.itemName || !currentItem.productCode || currentItem.quantity <= 0 || currentItem.costPrice <= 0) {
            alert("Please fill all item details correctly.");
            return;
        }
        setItems([...items, currentItem]);
        setCurrentItem(initialItemState);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const vendor = state.vendors.find(v => v.id === vendorId);
        if(!vendor || items.length === 0) {
            alert("Please select a vendor and add items to the order.");
            return;
        }
        const newPO: PurchaseOrder = {
            id: `PO${Date.now()}`,
            vendorId,
            vendorName: vendor.name,
            items,
            orderDate: new Date().toISOString(),
            status: 'Pending',
            ...orderTotals
        };
        dispatch({type: 'ADD_PO', payload: newPO});
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Select Vendor</label>
                <select value={vendorId} onChange={e => setVendorId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md">
                    <option value="" disabled>-- Choose a Vendor --</option>
                    {state.vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
            </div>

            <div className="border p-4 rounded-lg space-y-3 bg-gray-50">
                <h4 className="font-semibold text-gray-800">Add Item to Order</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input name="productCode" value={currentItem.productCode} onChange={handleItemChange} placeholder="Item Code" className="w-full px-3 py-2 border rounded-md"/>
                    <input name="itemName" value={currentItem.itemName} onChange={handleItemChange} placeholder="Item Name" className="w-full px-3 py-2 border rounded-md"/>
                    <input name="quantity" type="number" value={currentItem.quantity} onChange={handleItemChange} placeholder="Quantity" min="1" className="w-full px-3 py-2 border rounded-md"/>
                    <input name="costPrice" type="number" value={currentItem.costPrice} onChange={handleItemChange} placeholder="Cost Price" min="0" step="0.01" className="w-full px-3 py-2 border rounded-md"/>
                    <input name="discountPercentage" type="number" value={currentItem.discountPercentage} onChange={handleItemChange} placeholder="Discount %" min="0" max="100" className="w-full px-3 py-2 border rounded-md"/>
                    <select name="gstRate" value={currentItem.gstRate} onChange={handleItemChange} className="w-full px-3 py-2 border rounded-md"><option value={5}>GST 5%</option><option value={12}>GST 12%</option><option value={18}>GST 18%</option><option value={28}>GST 28%</option></select>
                    <select name="category" value={currentItem.category} onChange={handleItemChange} className="w-full px-3 py-2 border rounded-md"><option>Medicine</option><option>Consumable</option><option>General</option></select>
                    <Button type="button" variant="secondary" onClick={handleAddItem} className="h-full">Add</Button>
                </div>
            </div>

            {items.length > 0 && (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-left"><tr>{['Item', 'Qty', 'Price', 'Disc %', 'Total'].map(h => <th key={h} className="p-2 font-medium">{h}</th>)}<th></th></tr></thead>
                        <tbody>{items.map((item, index) => (
                            <tr key={index} className="border-b"><td className="p-2">{item.itemName}</td><td className="p-2">{item.quantity}</td><td className="p-2">{item.costPrice.toFixed(2)}</td><td className="p-2">{item.discountPercentage}</td><td className="p-2">{(item.quantity * item.costPrice).toFixed(2)}</td><td className="p-2 text-center"><button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500">&times;</button></td></tr>
                        ))}</tbody>
                    </table>
                </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-bold text-lg text-primary">Order Summary</h4>
                <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-medium">₹{orderTotals.subTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="font-medium text-green-600">- ₹{orderTotals.totalDiscount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">GST:</span><span className="font-medium">+ ₹{orderTotals.totalGst.toFixed(2)}</span></div>
                <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2"><span className="text-primary">Grand Total:</span><span>₹{orderTotals.grandTotal.toFixed(2)}</span></div>
            </div>

            <div className="flex justify-end pt-4"><Button type="submit">Create Purchase Order</Button></div>
        </form>
    )
}

const GRNForm: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { state, dispatch } = useAppContext();
    const [poId, setPoId] = useState('');
    const [grnItems, setGrnItems] = useState<GRNItem[]>([]);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const pendingPOs = state.purchaseOrders.filter(po => po.status === 'Pending');
    
    useEffect(() => {
        const po = state.purchaseOrders.find(p => p.id === poId);
        if (po) {
            // FIX: The `mrp` property, which is required by `GRNItem`, was missing.
            // It has been added with a default value of 0.
            const itemsFromPO: GRNItem[] = po.items.map(item => ({
                productCode: item.productCode,
                itemName: item.itemName,
                orderedQuantity: item.quantity,
                receivedQuantity: item.quantity,
                costPrice: item.costPrice,
                gstRate: item.gstRate,
                category: item.category,
                batchNumber: '',
                expiryDate: '',
                mrp: 0,
            }));
            setGrnItems(itemsFromPO);
        } else {
            setGrnItems([]);
        }
    }, [poId, state.purchaseOrders]);
    
    const handleItemChange = (index: number, field: keyof GRNItem, value: string | number) => {
        const updatedItems = [...grnItems];
        (updatedItems[index] as any)[field] = value;
        setGrnItems(updatedItems);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setInvoiceFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const poDetails = state.purchaseOrders.find(po => po.id === poId);
        if(!poDetails) return;

        if (grnItems.some(item => !item.batchNumber || !item.expiryDate)) {
            alert("Please provide Batch Number and Expiry Date for all received items.");
            return;
        }
        
        const newGRN: GoodsReceiptNote = {
            id: `GRN${Date.now()}`,
            poId,
            vendorId: poDetails.vendorId,
            vendorName: poDetails.vendorName,
            receivedDate: new Date().toISOString(),
            items: grnItems,
            invoiceFileName: invoiceFile?.name,
        };
        dispatch({type: 'ADD_GRN', payload: newGRN});
        onClose();
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Purchase Order</label>
                    <select value={poId} onChange={e => setPoId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border bg-white rounded-md">
                        <option value="" disabled>-- Choose a PO --</option>
                        {pendingPOs.map(po => <option key={po.id} value={po.id}>{po.id} - {po.vendorName}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Invoice</label>
                    <input type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
                </div>
            </div>

            {grnItems.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-semibold">Receive Items</h4>
                    {grnItems.map((item, index) => (
                        <div key={item.productCode} className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 p-3 border rounded-lg bg-gray-50 items-end">
                            <div className="col-span-full font-medium text-primary">{item.itemName} (Ordered: {item.orderedQuantity})</div>
                            <div>
                                <label className="text-xs">Received Qty</label>
                                <input type="number" value={item.receivedQuantity} onChange={e => handleItemChange(index, 'receivedQuantity', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border rounded-md text-sm"/>
                            </div>
                             <div>
                                <label className="text-xs">Batch No.</label>
                                <input type="text" value={item.batchNumber} onChange={e => handleItemChange(index, 'batchNumber', e.target.value)} required className="w-full px-2 py-1 border rounded-md text-sm"/>
                            </div>
                             <div>
                                <label className="text-xs">Expiry Date</label>
                                <input type="date" value={item.expiryDate} onChange={e => handleItemChange(index, 'expiryDate', e.target.value)} required className="w-full px-2 py-1 border rounded-md text-sm"/>
                            </div>
                            {/* FIX: Added a required input field for MRP, which was missing. */}
                            <div>
                                <label className="text-xs">MRP</label>
                                <input type="number" value={item.mrp} onChange={e => handleItemChange(index, 'mrp', parseFloat(e.target.value) || 0)} required min="0" step="0.01" className="w-full px-2 py-1 border rounded-md text-sm"/>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-end pt-4"><Button type="submit" disabled={!poId}>Create Goods Receipt Note</Button></div>
        </form>
    );
}

const Procurement: React.FC = () => {
    const { state } = useAppContext();
    const [activeTab, setActiveTab] = useState<'po' | 'grn' | 'vendors'>('po');
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);
    const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

    const getStatusChip = (status: 'Pending' | 'Completed' | 'Cancelled') => {
        const styles = { Pending: 'bg-yellow-100 text-yellow-800', Completed: 'bg-green-100 text-green-800', Cancelled: 'bg-red-100 text-red-800' };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    }
  
    return (
        <div className="bg-surface p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex border-b">
                    <button onClick={() => setActiveTab('po')} className={`px-4 py-2 font-medium ${activeTab === 'po' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Purchase Orders</button>
                    <button onClick={() => setActiveTab('grn')} className={`px-4 py-2 font-medium ${activeTab === 'grn' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Goods Receipt Notes</button>
                    <button onClick={() => setActiveTab('vendors')} className={`px-4 py-2 font-medium ${activeTab === 'vendors' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Vendors</button>
                </div>
                <div>
                    {activeTab === 'po' && <Button onClick={() => setIsPOModalOpen(true)}>New PO</Button>}
                    {activeTab === 'grn' && <Button onClick={() => setIsGRNModalOpen(true)}>New GRN</Button>}
                    {activeTab === 'vendors' && <Button onClick={() => setIsVendorModalOpen(true)}>New Vendor</Button>}
                </div>
            </div>

            <div className="overflow-x-auto">
                {activeTab === 'po' && (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">PO ID</th><th className="px-6 py-3">Vendor</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Total</th><th className="px-6 py-3">Status</th></tr></thead>
                        <tbody>{state.purchaseOrders.map(po => (<tr key={po.id} className="bg-white border-b"><td className="px-6 py-4">{po.id}</td><td className="px-6 py-4">{po.vendorName}</td><td className="px-6 py-4">{new Date(po.orderDate).toLocaleDateString()}</td><td className="px-6 py-4">₹{po.grandTotal.toFixed(2)}</td><td className="px-6 py-4">{getStatusChip(po.status)}</td></tr>))}</tbody>
                    </table>
                )}
                {activeTab === 'grn' && (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">GRN ID</th><th className="px-6 py-3">PO ID</th><th className="px-6 py-3">Vendor</th><th className="px-6 py-3">Received Date</th><th className="px-6 py-3">Invoice</th></tr></thead>
                        <tbody>{state.goodsReceiptNotes.map(grn => (<tr key={grn.id} className="bg-white border-b"><td className="px-6 py-4">{grn.id}</td><td className="px-6 py-4">{grn.poId}</td><td className="px-6 py-4">{grn.vendorName}</td><td className="px-6 py-4">{new Date(grn.receivedDate).toLocaleDateString()}</td><td className="px-6 py-4">{grn.invoiceFileName ? <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => alert(`Viewing invoice: ${grn.invoiceFileName}`)}>View Invoice</Button> : 'N/A'}</td></tr>))}</tbody>
                    </table>
                )}
                {activeTab === 'vendors' && (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">GST No.</th><th className="px-6 py-3">Drug License No.</th><th className="px-6 py-3">Contact</th></tr></thead>
                        <tbody>{state.vendors.map(v => (<tr key={v.id} className="bg-white border-b"><td className="px-6 py-4">{v.name}</td><td className="px-6 py-4">{v.gstNumber}</td><td className="px-6 py-4">{v.drugLicenseNumber || 'N/A'}</td><td className="px-6 py-4">{v.contactPerson} ({v.phone})</td></tr>))}</tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isPOModalOpen} onClose={() => setIsPOModalOpen(false)} title="Create Purchase Order"><POForm onClose={() => setIsPOModalOpen(false)} /></Modal>
            <Modal isOpen={isGRNModalOpen} onClose={() => setIsGRNModalOpen(false)} title="Create Goods Receipt Note"><GRNForm onClose={() => setIsGRNModalOpen(false)} /></Modal>
            <Modal isOpen={isVendorModalOpen} onClose={() => setIsVendorModalOpen(false)} title="Add New Vendor"><VendorForm onClose={() => setIsVendorModalOpen(false)} /></Modal>
        </div>
    );
};

export default Procurement;