import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import Modal from './Modal';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmLabel = "Delete",
  confirmColor = "red",   // "red" | "green" | "blue"
}) => {
  if (!isOpen) return null;

  const colorMap = {
    red:   { btn: 'bg-red-500 hover:bg-red-600 shadow-red-200',   icon: 'bg-red-100 text-red-600',   IconComp: AlertTriangle },
    green: { btn: 'bg-green-500 hover:bg-green-600 shadow-green-200', icon: 'bg-green-100 text-green-600', IconComp: CheckCircle },
    blue:  { btn: 'bg-figma-blue hover:bg-blue-700 shadow-blue-200', icon: 'bg-blue-100 text-figma-blue', IconComp: CheckCircle },
  };
  const { btn, icon, IconComp } = colorMap[confirmColor] ?? colorMap.red;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${icon}`}>
          <IconComp size={32} />
        </div>
        <p className="text-gray-600">{message}</p>
        <div className="pt-6 flex justify-center gap-3 w-full">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg ${btn}`}>{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  );
};
export default ConfirmModal;
