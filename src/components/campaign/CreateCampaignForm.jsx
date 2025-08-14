import React, { useState } from "react";

export default function CreateCampaignForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    site: "",
    name: "",
    threshold: "30 seconds",
    itemsDisplay: "Show 2 items + more",
    headline: "Wait! Don't leave your cart behind",
    description: "You have items in your cart. Complete your purchase to secure these products!",
    cta: "Complete Purchase",
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-6 text-black  min-w-5xl">
      {/* Left Form Section */}
      <div className="flex-1 space-y-4">
        {/* Connected Site */}
        <div>
          <label className="block text-sm font-medium">Connected Site</label>
          <select
            value={form.site}
            onChange={(e) => handleChange("site", e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select a site...</option>
            <option value="thunder-vapes">thunder-vapes-dev.myshopify.com</option>
            <option value="svotest">svogaretest.myshopify.com</option>
          </select>
        </div>

        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium">Campaign Name</label>
          <input
            type="text"
            placeholder="Enter campaign name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Threshold + Cart Items Display */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Inactivity Threshold</label>
            <select
              value={form.threshold}
              onChange={(e) => handleChange("threshold", e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option>30 seconds</option>
              <option>5 seconds</option>
              <option>1 minute</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Cart Items Display</label>
            <select
              value={form.itemsDisplay}
              onChange={(e) => handleChange("itemsDisplay", e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option>Show 2 items + more</option>
              <option>Show 1 item</option>
              <option>Show all items</option>
            </select>
          </div>
        </div>

        {/* Headline */}
        <div>
          <label className="block text-sm font-medium">Headline</label>
          <input
            type="text"
            value={form.headline}
            onChange={(e) => handleChange("headline", e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description (Subheadline)</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* CTA */}
        <div>
          <label className="block text-sm font-medium">Call-to-Action Button</label>
          <select
            value={form.cta}
            onChange={(e) => handleChange("cta", e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option>Complete Purchase</option>
            <option>Checkout Now</option>
            <option>Continue Shopping</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Create Campaign
          </button>
        </div>
      </div>

      {/* Right Preview Section */}
      <div className="w-80 bg-gray-50 rounded-lg p-4 border">
        <h3 className="text-sm font-medium mb-2">Live Preview</h3>
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-bold">{form.headline}</h4>
          <p className="text-xs text-gray-500">{form.description}</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <img src="https://via.placeholder.com/30" alt="" className="rounded" />
              <div>
                <p className="text-sm font-medium">Product Item 1</p>
                <p className="text-xs text-gray-500">$29.99</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img src="https://via.placeholder.com/30" alt="" className="rounded" />
              <div>
                <p className="text-sm font-medium">Product Item 2</p>
                <p className="text-xs text-gray-500">$24.99</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">+ 2 more items in your cart</p>
          </div>
          <button className="w-full mt-3 py-2 rounded-lg bg-blue-600 text-white text-sm">
            {form.cta}
          </button>
          <button className="w-full mt-1 py-1 text-xs text-gray-500">
            Continue Shopping
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Preview updates in real-time as you edit the form
        </p>
      </div>
    </form>
  );
}
