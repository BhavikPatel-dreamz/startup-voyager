import React, { useState } from "react";

export default function ConnectWebsiteForm({ onSubmit }) {
  const [domain, setDomain] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (domain.trim()) {
      onSubmit({ domain, platform: "Shopify" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-black min-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Website Domain
        </label>
        <input
          type="text"
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200"
        />
        <p className="text-xs text-gray-500">
          Enter your website domain (without http:// or https://)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Platform
        </label>
        <input
          type="text"
          value="Shopify"
          readOnly
          className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm bg-gray-100"
        />
        <p className="text-xs text-gray-500">
          Currently optimized for Shopify stores
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => onSubmit(null)}
          className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Connect Site
        </button>
      </div>
    </form>
  );
}
