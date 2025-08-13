export default function handler(req, res) {
  if (req.method === 'POST') {
    const order = req.body;
    
    // Initialize analytics server-side if needed
    // Or store order data to track on client-side later
    
    console.log('WooCommerce order completed:', order.id);
    res.status(200).json({ received: true });
  }
}