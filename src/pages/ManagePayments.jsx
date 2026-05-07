import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { Eye, Search, Filter, Receipt } from 'lucide-react';

const ManagePayments = () => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    if (statusParam) {
      setSearchTerm(statusParam);
    }
  }, [location]);

  const payments = [
    { id: "TXN001", customer: "John Doe", amount: "$12.99", date: "2026-05-01", status: "Completed", completed_at: "2026-05-01 14:30:00" },
    { id: "TXN002", customer: "Jane Smith", amount: "$12.99", date: "2026-05-02", status: "Pending", completed_at: "-" },
    { id: "TXN003", customer: "Bob Wilson", amount: "$25.00", date: "2026-05-03", status: "Completed", completed_at: "2026-05-03 09:15:22" },
  ];

  const handleView = (idx) => {
    setSelectedId(idx);
    setIsViewOpen(true);
  };

  const selectedPayment = selectedId !== null ? payments[selectedId] : null;

  const filteredPayments = payments.filter(p => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout pageTitle="Manage Payments" pageDescription="Transaction history and billing status.">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" 
              />
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter size={18} />
            </button>
          </div>
          {/* Add Payment removed as requested */}
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
              {filteredPayments.map((pay, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-medium">{pay.id}</td>
                  <td className="px-6 py-4 text-gray-600">{pay.customer}</td>
                  <td className="px-6 py-4 text-gray-600">{pay.amount}</td>
                  <td className="px-6 py-4 text-gray-600">{pay.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${pay.status === 'Completed' ? 'bg-green-100 text-green-600' : pay.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleView(idx)} className="p-2 text-figma-blue bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 font-medium">
                        <Eye size={16} /> View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Payment Proof Detail">
        {selectedPayment && (
          <div className="space-y-6">
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-center">
                <Receipt size={48} className="mx-auto mb-3 text-figma-blue opacity-50" />
                <h3 className="text-2xl font-bold text-gray-800">{selectedPayment.amount}</h3>
                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedPayment.status === 'Completed' ? 'bg-green-100 text-green-600' : selectedPayment.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                  {selectedPayment.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Transaction ID</span>
                <span className="text-sm font-medium text-gray-800">{selectedPayment.id}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Customer Name</span>
                <span className="text-sm font-medium text-gray-800">{selectedPayment.customer}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Created Date</span>
                <span className="text-sm font-medium text-gray-800">{selectedPayment.date}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Completed Timestamp</span>
                <span className="text-sm font-medium text-gray-800">{selectedPayment.completed_at}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="button" onClick={() => setIsViewOpen(false)} className="px-6 py-2 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all active:scale-95 shadow-lg">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ManagePayments;
