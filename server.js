const http = require('http');
const url = require('url');

let cart = [];
let phones = [
  { id: 1, price: 500, stock: 10 },
  { id: 2, price: 600, stock: 15 },
];

function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;
  const method = req.method;

  if (method === 'POST' && pathname === '/cart') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { phoneId, quantity } = JSON.parse(body);
      if (!phoneId || !quantity) return sendResponse(res, 400, { error: 'phoneId and quantity are required' });

      const phone = phones.find(p => p.id === phoneId);
      if (!phone) return sendResponse(res, 404, { error: 'Phone not found' });

      const cartItem = cart.find(item => item.phoneId === phoneId);
      if (cartItem) cartItem.quantity += quantity;
      else cart.push({ phoneId, quantity });

      phone.stock -= quantity;
      sendResponse(res, 200, cart);
    });

  } else if (method === 'GET' && pathname === '/cart') {
    const cartDetails = cart.map(item => {
      const phone = phones.find(p => p.id === item.phoneId);
      return {
        phoneId: item.phoneId,
        quantity: item.quantity,
        totalPrice: phone.price * item.quantity
      };
    });
    sendResponse(res, 200, cartDetails);

  } else if (method === 'DELETE' && pathname === '/cart') {
    const { phoneId } = query;
    if (!phoneId) return sendResponse(res, 400, { error: 'phoneId is required' });

    const index = cart.findIndex(item => item.phoneId === parseInt(phoneId));
    if (index === -1) return sendResponse(res, 404, { error: 'Phone not found in cart' });

    cart.splice(index, 1);
    sendResponse(res, 200, cart);

  } else if (method === 'POST' && pathname === '/checkout') {
    if (cart.length === 0) return sendResponse(res, 400, { error: 'Cart is empty' });

    const outOfStock = cart.some(item => {
      const phone = phones.find(p => p.id === item.phoneId);
      return phone.stock < item.quantity;
    });

    if (outOfStock) return sendResponse(res, 400, { error: 'Insufficient stock' });

    cart.forEach(item => {
      const phone = phones.find(p => p.id === item.phoneId);
      phone.stock -= item.quantity;
    });
    cart = [];
    sendResponse(res, 200, { message: 'Order placed successfully' });

  } else {
    sendResponse(res, 404, { error: 'Not Found' });
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});