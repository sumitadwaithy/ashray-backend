const { WebSocketServer, WebSocket } = require('ws');
const db = require('./database.cjs');

let wss = null;
let clientSocket = null;
let syncInterval = null;

/**
 * Ashray Real-Time Sync Service
 * Handles LAN synchronization between multiple machines.
 * Note: While FastAPI was considered, Node.js WebSockets provide 
 * better native integration with the Electron environment.
 */

function startMasterServer(port = 3001) {
  if (wss) return;

  wss = new WebSocketServer({ port });
  console.log(`[SYNC SERVER] Master server started on port ${port}`);

  wss.on('connection', (ws) => {
    console.log('[SYNC SERVER] New machine connected');

    ws.on('message', (message) => {
      try {
        const payload = JSON.parse(message);
        handleMasterMessage(ws, payload);
      } catch (e) {
        console.error('[SYNC SERVER] Invalid message received:', e);
      }
    });

    ws.on('close', () => {
      console.log('[SYNC SERVER] Machine disconnected');
    });
  });
}

function handleMasterMessage(ws, payload) {
  const { type, data, syncCode, machineId } = payload;
  const state = db.getInstallationState();

  // Validate Sync Code
  if (syncCode !== state.syncCode) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid Sync Code' }));
    ws.close();
    return;
  }

  switch (type) {
    case 'REGISTER':
      db.registerMachine({ machineId, ...data });
      ws.send(JSON.stringify({ 
        type: 'REGISTERED', 
        data: { ledgerId: state.ledgerId, machineId: state.machineId } 
      }));
      break;

    case 'PUSH_LOGS':
      // Client is sending its local logs
      if (Array.isArray(data)) {
        data.forEach(log => {
          db.applyRemoteOperation(log);
          // Broadcast to other connected clients
          broadcastToOthers(ws, { type: 'REMOTE_LOG', data: log });
        });
      }
      break;

    case 'FETCH_LOGS':
      // Client wants logs after a certain point
      const logs = db.getSyncLogs(data.afterId);
      ws.send(JSON.stringify({ type: 'LOG_BATCH', data: logs }));
      break;
  }
}

function broadcastToOthers(senderWs, payload) {
  if (!wss) return;
  const message = JSON.stringify(payload);
  wss.clients.forEach(client => {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function startClientSync(serverUrl) {
  if (clientSocket) return;

  const state = db.getInstallationState();
  const url = serverUrl || state.serverUrl || 'ws://localhost:3001';
  
  try {
    clientSocket = new WebSocket(url);

    clientSocket.on('open', () => {
      console.log(`[SYNC CLIENT] Connected to Master at ${url}`);
      // Register machine
      clientSocket.send(JSON.stringify({
        type: 'REGISTER',
        syncCode: state.syncCode,
        machineId: state.machineId,
        data: { name: 'Remote Machine', deviceType: 'Laptop' }
      }));

      // Start periodic sync
      startPeriodicSync();
    });

    clientSocket.on('message', (message) => {
      try {
        const payload = JSON.parse(message);
        handleClientMessage(payload);
      } catch (e) {
        console.error('[SYNC CLIENT] Error processing message:', e);
      }
    });

    clientSocket.on('close', () => {
      console.log('[SYNC CLIENT] Disconnected from Master. Retrying in 5s...');
      clientSocket = null;
      stopPeriodicSync();
      setTimeout(() => startClientSync(url), 5000);
    });

    clientSocket.on('error', (err) => {
      console.error('[SYNC CLIENT] Socket error:', err.message);
    });

  } catch (e) {
    console.error('[SYNC CLIENT] Failed to connect:', e);
    setTimeout(() => startClientSync(url), 10000);
  }
}

function handleClientMessage(payload) {
  const { type, data } = payload;

  switch (type) {
    case 'REMOTE_LOG':
      db.applyRemoteOperation(data);
      // Notify renderer via IPC (this will be handled in main.ts)
      break;
    case 'LOG_BATCH':
      if (Array.isArray(data)) {
        data.forEach(log => db.applyRemoteOperation(log));
      }
      break;
  }
}

function startPeriodicSync() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(() => {
    if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
      const state = db.getInstallationState();
      const logs = db.getSyncLogs(); // In production, filter unsynced logs
      if (logs.length > 0) {
        clientSocket.send(JSON.stringify({
          type: 'PUSH_LOGS',
          syncCode: state.syncCode,
          machineId: state.machineId,
          data: logs
        }));
      }
    }
  }, 2000);
}

function stopPeriodicSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

function stopMasterServer() {
  if (wss) {
    wss.close();
    wss = null;
    console.log('[SYNC SERVER] Master server stopped');
  }
}

function stopClientSync() {
  if (clientSocket) {
    clientSocket.close();
    clientSocket = null;
  }
  stopPeriodicSync();
  console.log('[SYNC CLIENT] Client sync stopped');
}

module.exports = {
  startMasterServer,
  startClientSync,
  stopMasterServer,
  stopClientSync
};
