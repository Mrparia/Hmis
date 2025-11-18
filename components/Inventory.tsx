import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { InventoryItem, InventoryBatch } from '../types';
import { fuzzySearch } from '../utils';
import Modal from './common/Modal';
import Button from './common/Button';

const InventoryEditForm: React.FC<{ item: InventoryItem; onClose: () => void }> = ({ item, onClose }) => {
    const { dispatch } = useAppContext();
    const [formData, setFormData] = useState<InventoryItem>(() => JSON.parse(JSON.stringify(item)));

    // State for inline batch editing
    const [editingBatchIndex, setEditingBatchIndex] = useState<number | null>(null);
    const [editingBatchData, setEditingBatchData] = useState<InventoryBatch | null>(null);

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: ['price', 'reorderLevel', 'gstRate'].includes(name) ? Number(value) : value }));
    };

    const addBatch = () => {
        if (editingBatchIndex !== null) return; // Don't add while editing
        setFormData(prev => ({
            ...prev,
            batches: [...prev.batches, { batchNumber: '', stock: 0, expiryDate: '', costPrice: 0, mrp: 0 }]
        }));
    };

    const removeBatch = (index: number) => {
        if (editingBatchIndex !== null) return;
        setFormData(prev => ({
            ...prev,
            batches: prev.batches.filter((_, i) => i !== index)
        }));
    };
    
    // Handlers for inline batch editing
    const handleEditBatch = (index: number) => {
        setEditingBatchIndex(index);
        setEditingBatchData({ ...formData.batches[index] });
    };

    const handleCancelBatchEdit = () => {
        setEditingBatchIndex(null);
        setEditingBatchData(null);
    };

    const handleSaveBatch = () => {
        if (editingBatchIndex === null || !editingBatchData) return;
        
        const newBatches = [...formData.batches];
        newBatches[editingBatchIndex] = editingBatchData;
        setFormData(prev => ({ ...prev, batches: newBatches }));

        handleCancelBatchEdit();
    };

    const handleEditingBatchChange = (field: keyof InventoryBatch, value: string | number) => {
        if (!editingBatchData) return;
        setEditingBatchData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBatchIndex !== null) {
            alert("Please save or cancel the batch you are currently editing before saving the item.");
            return;
        }
        dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: formData });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="grid grid-cols-2 md:grid-cols-4 gap-4 border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Item Details</legend>
                <div className="md:col-span-2">
                    <label className="text-sm">Item Name</label>
                    <input name="name" value={formData.name} onChange={handleItemChange} required className="mt-1 w-full p-2 border rounded"/>
                </div>
                <div>
                    <label className="text-sm">Category</label>
                    <select name="category" value={formData.category} onChange={handleItemChange} className="mt-1 w-full p-2 border bg-white rounded">
                        <option>Medicine</option><option>Consumable</option><option>General</option><option>Pathology</option><option>Radiology</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm">Reorder Level</label>
                    <input name="reorderLevel" type="number" value={formData.reorderLevel} onChange={handleItemChange} required className="mt-1 w-full p-2 border rounded"/>
                </div>
                <div>
                    <label className="text-sm">Selling Price (₹)</label>
                    <input name="price" type="number" value={formData.price} onChange={handleItemChange} required className="mt-1 w-full p-2 border rounded"/>
                </div>
                <div>
                    <label className="text-sm">GST Rate (%)</label>
                    <select name="gstRate" value={formData.gstRate} onChange={handleItemChange} className="mt-1 w-full p-2 border bg-white rounded">
                        <option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option><option value={28}>28%</option>
                    </select>
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Batch Details</legend>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {formData.batches.map((batch, index) => {
                        const isEditingThisBatch = editingBatchIndex === index;
                        
                        return isEditingThisBatch && editingBatchData ? (
                            // EDITING VIEW
                            <div key={index} className="grid grid-cols-2 md:grid-cols-7 gap-2 items-center p-2 border-2 border-primary rounded bg-blue-50">
                                <input value={editingBatchData.batchNumber} onChange={e => handleEditingBatchChange('batchNumber', e.target.value)} placeholder="Batch No." className="md:col-span-2 p-1 border rounded text-sm" />
                                <input type="number" value={editingBatchData.stock} onChange={e => handleEditingBatchChange('stock', Number(e.target.value))} placeholder="Stock" className="p-1 border rounded text-sm" />
                                <input type="date" value={(editingBatchData.expiryDate || '').split('T')[0]} onChange={e => handleEditingBatchChange('expiryDate', e.target.value)} placeholder="Expiry" className="p-1 border rounded text-sm" />
                                <input type="number" value={editingBatchData.costPrice} onChange={e => handleEditingBatchChange('costPrice', Number(e.target.value))} placeholder="Cost" className="p-1 border rounded text-sm" />
                                <input type="number" value={editingBatchData.mrp || ''} onChange={e => handleEditingBatchChange('mrp', Number(e.target.value))} placeholder="MRP" className="p-1 border rounded text-sm" />
                                <div className="flex gap-1">
                                    <Button type="button" onClick={handleSaveBatch} className="p-1 text-xs">Save</Button>
                                    <Button type="button" variant="secondary" onClick={handleCancelBatchEdit} className="p-1 text-xs">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            // READONLY VIEW
                            <div key={index} className="grid grid-cols-2 md:grid-cols-7 gap-2 items-center p-2 border rounded bg-gray-50">
                                <div className="md:col-span-2"><strong className="text-gray-500 text-xs">Batch:</strong> {batch.batchNumber}</div>
                                <div><strong className="text-gray-500 text-xs">Stock:</strong> {batch.stock}</div>
                                <div><strong className="text-gray-500 text-xs">Expiry:</strong> {new Date(batch.expiryDate).toLocaleDateString()}</div>
                                <div><strong className="text-gray-500 text-xs">Cost:</strong> ₹{batch.costPrice.toFixed(2)}</div>
                                <div><strong className="text-gray-500 text-xs">MRP:</strong> ₹{(batch.mrp || 0).toFixed(2)}</div>
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="secondary" onClick={() => handleEditBatch(index)} disabled={editingBatchIndex !== null} className="p-1 text-xs">Edit</Button>
                                    <Button type="button" variant="danger" onClick={() => removeBatch(index)} disabled={editingBatchIndex !== null} className="px-2 py-1 text-xs">&times;</Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Button type="button" variant="secondary" onClick={addBatch} className="mt-3 text-xs px-2 py-1" disabled={editingBatchIndex !== null}>Add Batch</Button>
            </fieldset>
            
            <div className="flex justify-end pt-4"><Button type="submit">Save All Changes</Button></div>
        </form>
    );
};

const Inventory: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentUser } = state;
  const [filter, setFilter] = useState<'all' | 'low' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const isMasterIT = currentUser?.role === 'Master IT';

  const processedInventory = useMemo(() => {
    const today = new Date();
    const expiryThreshold = new Date();
    expiryThreshold.setDate(today.getDate() + 30); // 30 days from now

    return state.inventory.map(item => {
      const totalStock = item.batches.reduce((sum, batch) => sum + batch.stock, 0);
      const batchesWithStock = item.batches.filter(b => b.stock > 0);
      const nextExpiry = batchesWithStock.length > 0
        ? batchesWithStock.reduce((earliest, current) => 
            new Date(earliest.expiryDate) < new Date(current.expiryDate) ? earliest : current
          ).expiryDate
        : null;
      
      const isExpired = nextExpiry ? new Date(nextExpiry) < today : false;
      const isNearingExpiry = nextExpiry ? !isExpired && new Date(nextExpiry) < expiryThreshold : false;
      
      return { ...item, totalStock, nextExpiry, isExpired, isNearingExpiry };
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [state.inventory]);

  const filteredInventory = processedInventory.filter(item => {
    const matchesSearch = fuzzySearch(searchTerm, item.name);
    if (!matchesSearch) return false;

    switch (filter) {
      case 'low':
        return item.totalStock > 0 && item.totalStock <= item.reorderLevel;
      case 'expired':
        return item.isExpired;
      default:
        return true;
    }
  });
  
  const handleConfirmDelete = () => {
    if (itemToDelete) {
        dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: { itemId: itemToDelete.id } });
        setItemToDelete(null);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
            <input 
                type="text" 
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setFilter('all')} className={`px-4 py-1 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-primary text-white' : 'text-gray-600'}`}>All Items</button>
            <button onClick={() => setFilter('low')} className={`px-4 py-1 rounded-md text-sm font-medium ${filter === 'low' ? 'bg-primary text-white' : 'text-gray-600'}`}>Low Stock</button>
            <button onClick={() => setFilter('expired')} className={`px-4 py-1 rounded-md text-sm font-medium ${filter === 'expired' ? 'bg-primary text-white' : 'text-gray-600'}`}>Expired</button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Item ID</th>
              <th scope="col" className="px-6 py-3">Item Name</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Total Stock</th>
              <th scope="col" className="px-6 py-3">Reorder Level</th>
              <th scope="col" className="px-6 py-3">Unit Price</th>
              <th scope="col" className="px-6 py-3">Next Expiry</th>
              <th scope="col" className="px-6 py-3">Status</th>
              {isMasterIT && <th scope="col" className="px-6 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => {
              const isLowStock = item.totalStock > 0 && item.totalStock <= item.reorderLevel;
              let rowClass = 'bg-white border-b hover:bg-gray-50';
              if (item.isExpired) {
                  rowClass = 'bg-red-100 border-b hover:bg-red-200';
              } else if (item.isNearingExpiry) {
                  rowClass = 'bg-orange-100 border-b hover:bg-orange-200';
              } else if (isLowStock) {
                  rowClass = 'bg-yellow-100 border-b hover:bg-yellow-200';
              }

              return (
                <tr key={item.id} className={rowClass}>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4 font-bold">{item.totalStock}</td>
                  <td className="px-6 py-4">{item.reorderLevel}</td>
                  <td className="px-6 py-4">₹{item.price.toFixed(2)}</td>
                  <td className="px-6 py-4">{item.nextExpiry ? new Date(item.nextExpiry).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4">
                    {item.isExpired ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Expired</span>
                     : item.isNearingExpiry ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Nearing Expiry</span>
                     : isLowStock ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
                     : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>}
                  </td>
                  {isMasterIT && (
                    <td className="px-6 py-4">
                        <div className="flex gap-2">
                            <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => setItemToEdit(item)}>Edit</Button>
                            <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => setItemToDelete(item)}>Delete</Button>
                        </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {itemToEdit && (
        <Modal isOpen={!!itemToEdit} onClose={() => setItemToEdit(null)} title={`Edit Inventory Item - ${itemToEdit.name}`}>
            <InventoryEditForm item={itemToEdit} onClose={() => setItemToEdit(null)} />
        </Modal>
      )}

       {itemToDelete && (
        <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Confirm Deletion">
            <div className="text-center">
                <p className="text-lg mb-4">Are you sure you want to delete <strong>{itemToDelete.name}</strong>? This action is irreversible.</p>
                <div className="flex justify-center gap-4">
                    <Button variant="secondary" onClick={() => setItemToDelete(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Confirm Delete</Button>
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default Inventory;