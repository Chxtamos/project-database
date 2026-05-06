import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed? This action cannot be undone." }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
          <AlertTriangle size={32} />
        </div>
        <p className="text-gray-600">{message}</p>
        <div className="pt-6 flex justify-center gap-3 w-full">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200">Delete</button>
        </div>
      </div>
    </Modal>
  );
};
export default ConfirmModal;
