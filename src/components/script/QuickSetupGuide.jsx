import React from "react";

export default function QuickSetupGuide() {
  const steps = [
    { step: 1, title: "Connect Site", desc: "Add your website domain to get started" },
    { step: 2, title: "Generate Script", desc: "Get your unique tracking script for the site" },
    { step: 3, title: "Install Script", desc: "Add the script before closing </body> tag" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg text-black font-semibold mb-4">Quick Setup Guide</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map(({ step, title, desc }) => (
          <div key={step} className="text-center">
            <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
              {step}
            </div>
            <h3 className="mt-2 text-black font-medium">{title}</h3>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
