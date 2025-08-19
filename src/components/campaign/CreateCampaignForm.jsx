import React, { useState, useEffect } from "react";

export default function CreateCampaignForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    connectedSite: initialData?.connectedSite || "",
    name: initialData?.name || "",
    inactivityThreshold: initialData?.inactivityThreshold ?? 30,
    cartItemsDisplay: initialData?.cartItemsDisplay || "show_2_plus",
    headline: initialData?.headline || "Wait! Don't leave your cart behind",
    description: initialData?.description || "You have items in your cart. Complete your purchase to secure these products!",
    cta: initialData?.cta || "complete_purchase",
    buttonColor: initialData?.buttonColor || "#2563eb",
    cartUrl: initialData?.cartUrl || "",
  });

  const [sites, setSites] = useState([]);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await fetch('/api/connected-sites');
        if (res.ok) {
          const data = await res.json();
          setSites(data?.data || []);
        }
      } catch (e) {
        // ignore
      }
    };
    loadSites();
  }, []);

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
      <div className="w-[56%] space-y-4">
        {/* Connected Site */}
        <div>
          <label className="block text-sm font-medium">Connected Site</label>
          <select
            value={form.connectedSite}
            onChange={(e) => handleChange("connectedSite", e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-3 text-sm"
          >
            <option value="">Select a site...</option>
            {sites.map((s) => (
              <option key={s._id || s.clientId || s.domain} value={s._id || s.clientId}>
                {s.domain || s.clientId}
              </option>
            ))}
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
            className="mt-1 w-full border rounded-lg px-3 py-3 text-sm"
          />
        </div>

        {/* Threshold + Cart Items Display */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Inactivity Threshold</label>
            <select
              value={form.inactivityThreshold}
              onChange={(e) => handleChange("inactivityThreshold", Number(e.target.value))}
              className="mt-1 w-full border rounded-lg px-3 py-3 text-sm"
            >
              <option value={5}>5 seconds</option>
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={45}>45 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}> seconds</option>
              
              
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Cart Items Display</label>
            <select
              value={form.cartItemsDisplay}
              onChange={(e) => handleChange("cartItemsDisplay", e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-3 text-sm"
            >
              <option value="show_2_plus">Show 2 items + more</option>
              <option value="show_3_plus">Show 3 items + more</option>
              <option value="show_all">Show all items</option>
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
            className="mt-1 w-full border rounded-lg px-3 py-3 text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description (Subheadline)</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-3 text-sm"
          />
        </div>

        {/* Button color + Cart URL */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Button Color</label>
            <input
              type="color"
              value={form.buttonColor}
              onChange={(e) => handleChange("buttonColor", e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-3 text-sm h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Cart URL</label>
            <input
              type="url"
              placeholder="https://yourstore.com/cart"
              value={form.cartUrl}
              onChange={(e) => handleChange("cartUrl", e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-3 text-sm"
            />
          </div>
        </div>

        {/* CTA */}
        <div>
          <label className="block text-sm font-medium">Call-to-Action Button</label>
          <select
            value={form.cta}
            onChange={(e) => handleChange("cta", e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-3 text-sm"
          >
            <option value="complete_purchase">Complete Purchase</option>
            <option value="go_to_checkout">Go to Checkout</option>
            <option value="view_cart">View Cart</option>
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
            {initialData?._id ? 'Update Campaign' : 'Create Campaign'}
          </button>
        </div>
      </div>

      {/* Right Preview Section */}
      <div className="w-[44%] bg-gray-50 rounded-lg p-6 border">
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
            {form.cartItemsDisplay === 'show_2_plus' && (
              <p className="text-xs text-gray-400">+ 2 more items in your cart</p>
            )}
            {form.cartItemsDisplay === 'show_3_plus' && (
              <p className="text-xs text-gray-400">+ 3 more items in your cart</p>
            )}
            {form.cartItemsDisplay === 'show_all' && (
              <p className="text-xs text-gray-400">Showing all items</p>
            )}
          </div>
          <a
            href={form.cartUrl || '#'}
            className="w-full mt-3 py-2 rounded-lg text-white text-sm inline-flex justify-center"
            style={{ backgroundColor: form.buttonColor }}
          >
            {form.cta === 'complete_purchase' && 'Complete Purchase'}
            {form.cta === 'go_to_checkout' && 'Go to Checkout'}
            {form.cta === 'view_cart' && 'View Cart'}
          </a>
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
