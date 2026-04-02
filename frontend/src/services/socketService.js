import io from 'socket.io-client';

let socket = null;
let listeners = {};
let listeningTo = {};
let initPromise = null;

export const initializeSocket = () => {
  if (socket) {
    console.log('✅ Socket already initialized');
    return socket;
  }

  // Prevent race conditions with multiple initialization attempts
  if (initPromise) {
    console.log('⏳ Socket initialization in progress, waiting...');
    return initPromise;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ No token found, socket will not authenticate');
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Initializing Socket.IO connection (Token length:', token?.length || 0, ')');
  } else {
    console.log('🔧 Initializing Socket.IO connection...');
  }
  socket = io('http://localhost:5001', {
    auth: {
      token: token || '',
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  initPromise = new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('✅ Connected to NestJS WebSocket', socket.id);
      resolve(socket);
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from WebSocket');
  });

  socket.on('auth_error', (data) => {
    console.error('🔐 Authentication Error:', data);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error);
  });

  // Register all stored listeners
  Object.keys(listeners).forEach((event) => {
    listeners[event].forEach((callback) => {
      socket.on(event, callback);
      console.log(`📡 Registered listener for event: ${event}`);
    });
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    listeners = {};
  }
};

export const getSocket = () => {
  return socket || initializeSocket();
};

// Subscribe to new review notifications (Global - broadcasts to all users)
// These events are emitted by the backend to ALL connected clients
export const onNewReview = (callback) => {
  const sock = getSocket();
  console.log('👂 Listening for review:new events (GLOBAL BROADCAST)');
  
  // Attach the listener only once per event type
  if (!listeningTo['review:new']) {
    sock.on('review:new', (data) => {
      console.log('🔔 Received review:new event (GLOBAL):', data);
      // Call all registered callbacks
      if (listeners['review:new']) {
        listeners['review:new'].forEach(cb => cb(data));
      }
    });
    listeningTo['review:new'] = true;
  }
  
  if (!listeners['review:new']) {
    listeners['review:new'] = [];
  }
  listeners['review:new'].push(callback);

  // Return unsubscribe function
  return () => {
    if (listeners['review:new']) {
      listeners['review:new'] = listeners['review:new'].filter(cb => cb !== callback);
    }
  };
};

// Subscribe to new reply notifications (Global - broadcasts to all users)
// These events are emitted by the backend to ALL connected clients
export const onNewReply = (callback) => {
  const sock = getSocket();
  console.log('👂 Listening for review:new-reply events (GLOBAL BROADCAST)');
  
  // Attach the listener only once per event type
  if (!listeningTo['review:new-reply']) {
    sock.on('review:new-reply', (data) => {
      console.log('💬 Received review:new-reply event (GLOBAL):', data);
      // Call all registered callbacks
      if (listeners['review:new-reply']) {
        listeners['review:new-reply'].forEach(cb => cb(data));
      }
    });
    listeningTo['review:new-reply'] = true;
  }

  if (!listeners['review:new-reply']) {
    listeners['review:new-reply'] = [];
  }
  listeners['review:new-reply'].push(callback);

  return () => {
    if (listeners['review:new-reply']) {
      listeners['review:new-reply'] = listeners['review:new-reply'].filter(cb => cb !== callback);
    }
  };
};

// Subscribe to review flagged notifications
export const onReviewFlagged = (callback) => {
  const sock = getSocket();
  sock.on('review:flagged', callback);

  if (!listeners['review:flagged']) {
    listeners['review:flagged'] = [];
  }
  listeners['review:flagged'].push(callback);

  return () => {
    sock.off('review:flagged', callback);
  };
};

// Subscribe to product update notifications
export const onProductUpdate = (callback) => {
  const sock = getSocket();
  sock.on('product:update', callback);

  if (!listeners['product:update']) {
    listeners['product:update'] = [];
  }
  listeners['product:update'].push(callback);

  return () => {
    sock.off('product:update', callback);
  };
};

// Generic event listener
export const onSocketEvent = (event, callback) => {
  const sock = getSocket();
  sock.on(event, callback);

  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(callback);

  return () => {
    sock.off(event, callback);
  };
};

// Send custom event to server
export const emitSocketEvent = (event, data) => {
  const sock = getSocket();
  if (sock) {
    sock.emit(event, data);
  }
};
