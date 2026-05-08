import React, { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { MoreVertical, Plus, Search, Filter } from 'lucide-react';

const ManagePayments = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const payments = [
    ["TXN001", "John Doe", "฿12.99", "2026-05-01", "Completed"],
    ["TXN002", "Jane Smith", "฿12.99", "2026-05-02", "Pending"],
    ["TXN003", "Bob Wilson", "฿25.00", "2026-05-03", "Completed"],
  ];

  const handleEdit = (id) => {
    setSelectedId(id);
    setIsEditOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedId(id);
    setIsDeleteOpen(true);
  };

  return (
    <Layout pageTitle="Manage Payments" pageDescription="Transaction history and billing status.">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter size={18} />
            </button>
          </div>
          <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-figma-blue text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={18} />
            Add Payment
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((pay, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-medium cursor-pointer hover:text-figma-blue" onClick={() => handleEdit(idx)}>{pay[0]}</td>
                  <td className="px-6 py-4 text-gray-600">{pay[1]}</td>
                  <td className="px-6 py-4 text-gray-600">{pay[2]}</td>
                  <td className="px-6 py-4 text-gray-600">{pay[3]}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${pay[4] === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {pay[4]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative group">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-8 w-32 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-10 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                        <button onClick={() => handleEdit(idx)} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-figma-blue transition-colors">Edit</button>
                        <button onClick={() => handleDelete(idx)} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Payment">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Customer Name</label>
            <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter customer name..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="e.g. ฿12.99" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Payment Date</label>
            <input type="date" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">Save Payment</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Payment Detail">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <input type="text" defaultValue={payments[selectedId]?.[2]} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm">
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">Update Payment</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => { console.log("Deleted Payment:", selectedId); setIsDeleteOpen(false); }} title="Delete Payment" message="Are you sure you want to delete this transaction? This cannot be undone." />
    </Layout>
  );
};

export default ManagePayments;
