import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 py-10">
        <div className="bg-white rounded-lg shadow-lg max-w-[70%] w-full">
          <div className="flex justify-between items-center border-b px-4 py-2">
            <h2 className="text-lg font-semibold text-black">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
  );
}
