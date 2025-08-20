import React, { useState } from "react";

export default function ConnectWebsiteForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    domain: "",
    platform: "Shopify",
    project: "",
    owner: "",
    clientId: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const generateClientId = () => {
  //   const domain = formData.domain.replace(/[^a-zA-Z0-9]/g, '');
  //   const timestamp = Date.now().toString(36);
  //   const random = Math.random().toString(12).substring(2, 8);
  //   const clientId = `${domain}_${timestamp}_${random}`;
  //   setFormData(prev => ({ ...prev, clientId }));
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.domain.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-black min-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Website Domain *
        </label>
        <input
          type="text"
          name="domain"
          placeholder="example.com"
          value={formData.domain}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200"
          required
        />
        <p className="text-xs text-gray-500">
          Enter your website domain (without http:// or https://)
        </p>
      </div>

 <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Name *
        </label>
        <input
          type="text"
          name="project"
          placeholder="My Project"
          value={formData.project}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200"
          required
        />
        <p className="text-xs text-gray-500">
          Enter your project name
        </p>
      </div>


      <div>
        <label className="block text-sm font-medium text-gray-700">
          Platform
        </label>
        <select
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200"
        >
          <option value="Shopify">Shopify</option>
          <option value="WooCommerce">WooCommerce</option>
          <option value="Custom">Custom</option>
          <option value="Other">Other</option>
        </select>
        <p className="text-xs text-gray-500">
          Select your website platform
        </p>
      </div>

      {/* <div>
        <label className="block text-sm font-medium text-gray-700">
          Owner Email *
        </label>
        <input
          type="email"
          name="owner"
          placeholder="owner@example.com"
          value={formData.owner}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200"
          required
        />
        <p className="text-xs text-gray-500">
          Email address of the site owner
        </p>
      </div> */}

      {/* <div>
        <label className="block text-sm font-medium text-gray-700">
          Client ID *
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            name="clientId"
            placeholder="Click Generate to create unique ID"
            value={formData.clientId}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200"
            required
          />
          <button
            type="button"
            onClick={generateClientId}
            className="mt-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            Generate
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Unique identifier for your site (auto-generated)
        </p>
      </div> */}

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
