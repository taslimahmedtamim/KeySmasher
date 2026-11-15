import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { RoomManager } from './roomManager';
import { WsMessage } from '@keysmasher/shared';

const PORT = parseInt(process.env.PORT || process.env.SOCKET_PORT || '3001', 10);

interface ClientMetadata {
  participantId: string;
  username: string;
  roomCode?: string;
  isAlive: boolean;
}

const roomManager = new RoomManager();
const clientMeta = new Map<WebSocket, ClientMetadata>();

// 1. Create HTTP Server for Health Checks & Monitoring
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'KeySmasher Real-Time Race Server',
        version: '0.1.0',
        activeRooms: roomManager.getActiveRoomCount(),
        connectedClients: clientMeta.size,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// 2. Attach WebSocket Server
const wss = new WebSocketServer({ server });

/**
 * Sends a typed JSON message to a specific WebSocket client.
 */
function sendJson(ws: WebSocket, type: string, payload: any, requestId?: string) {
  if (ws.readyState === WebSocket.OPEN) {
    const message: WsMessage = {
      type,
      payload,
      requestId,
      timestamp: Date.now(),
    };
    ws.send(JSON.stringify(message));
  }
}

/**
 * Broadcasts a typed message to all clients currently connected to the specified room.
 */
function broadcastToRoom(roomCode: string, type: string, payload: any) {
  const normalizedCode = roomCode.toUpperCase();
  clientMeta.forEach((meta, ws) => {
    if (meta.roomCode === normalizedCode && ws.readyState === WebSocket.OPEN) {
      sendJson(ws, type, payload);
    }
  });
}

// 3. Handle WebSocket Connections
wss.on('connection', (ws: WebSocket) => {
  const participantId = `client-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  clientMeta.set(ws, {
    participantId,
    username: 'Guest Typist',
    isAlive: true,
  });

  // Heartbeat pong listener
  ws.on('pong', () => {
    const meta = clientMeta.get(ws);
    if (meta) meta.isAlive = true;
  });

  ws.on('message', (raw) => {
    try {
      const data: WsMessage<any> = JSON.parse(raw.toString());
      const meta = clientMeta.get(ws);
      if (!meta) return;

      const { type, requestId } = data;
      const payload = (data.payload || {}) as any;

      switch (type) {
        case 'room:create': {
          const { config, username, userId } = payload || {};
          if (username) meta.username = username;

          const room = roomManager.createRoom(
            { id: meta.participantId, username: meta.username, userId },
            config
          );
          meta.roomCode = room.code;

          sendJson(ws, 'room:state_update', room, requestId);
          break;
        }

        case 'room:join': {
          const { roomCode, username, userId } = payload || {};
          if (!roomCode) {
            sendJson(ws, 'room:error', { message: 'Room code is required.' }, requestId);
            return;
          }
          if (username) meta.username = username;

          const result = roomManager.joinRoom(roomCode, {
            id: meta.participantId,
            username: meta.username,
            userId,
          });

          if (!result.success || !result.room) {
            sendJson(ws, 'room:error', { message: result.error || 'Failed to join room.' }, requestId);
            return;
          }

          meta.roomCode = result.room.code;
          sendJson(ws, 'room:state_update', result.room, requestId);
          broadcastToRoom(result.room.code, 'room:state_update', result.room);
          break;
        }

        case 'room:leave': {
          if (meta.roomCode) {
            const { room, deleted } = roomManager.leaveRoom(meta.roomCode, meta.participantId);
            if (!deleted && room) {
              broadcastToRoom(room.code, 'room:state_update', room);
            }
            meta.roomCode = undefined;
          }
          break;
        }

        case 'room:ready': {
          if (!meta.roomCode) return;
          const { isReady } = payload || {};
          const room = roomManager.toggleReady(meta.roomCode, meta.participantId, isReady);
          if (room) {
            broadcastToRoom(room.code, 'room:state_update', room);
          }
          break;
        }

        case 'room:update_config': {
          if (!meta.roomCode) return;
          const room = roomManager.updateConfig(meta.roomCode, meta.participantId, payload.config);
          if (room) {
            broadcastToRoom(room.code, 'room:state_update', room);
          }
          break;
        }

        case 'room:add_bot': {
          if (!meta.roomCode) return;
          const room = roomManager.addBot(meta.roomCode, meta.participantId, payload.difficulty);
          if (room) {
            broadcastToRoom(room.code, 'room:state_update', room);
          }
          break;
        }

        case 'room:kick_bot': {
          if (!meta.roomCode) return;
          const room = roomManager.removeBot(meta.roomCode, meta.participantId, payload.botId);
          if (room) {
            broadcastToRoom(room.code, 'room:state_update', room);
          }
          break;
        }

        case 'race:start': {
          if (!meta.roomCode) return;
          roomManager.startRace(meta.roomCode, meta.participantId, broadcastToRoom);
          break;
        }

        case 'race:progress': {
          if (!meta.roomCode) return;
          const { progress, currentWpm, accuracy } = payload || {};
          const room = roomManager.handleProgress(
            meta.roomCode,
            meta.participantId,
            progress,
            currentWpm,
            accuracy
          );
          if (room) {
            broadcastToRoom(meta.roomCode, 'race:player_progress', {
              participantId: meta.participantId,
              progress,
              currentWpm,
              accuracy,
            });
          }
          break;
        }

        case 'race:finish': {
          if (!meta.roomCode) return;
          roomManager.handleFinish(
            meta.roomCode,
            {
              roomCode: meta.roomCode,
              participantId: meta.participantId,
              finalWpm: payload.finalWpm,
              accuracy: payload.accuracy,
              durationSeconds: payload.durationSeconds,
              totalCharacters: payload.totalCharacters,
              correctCharacters: payload.correctCharacters,
              incorrectCharacters: payload.incorrectCharacters,
            },
            broadcastToRoom
          );
          break;
        }

        case 'room:rematch': {
          if (!meta.roomCode) return;
          const room = roomManager.rematch(meta.roomCode, meta.participantId);
          if (room) {
            broadcastToRoom(room.code, 'room:state_update', room);
          }
          break;
        }

        case 'room:chat': {
          if (!meta.roomCode || !payload.text) return;
          broadcastToRoom(meta.roomCode, 'room:chat_message', {
            id: `msg-${Date.now()}-${Math.random()}`,
            senderId: meta.participantId,
            senderName: meta.username,
            text: String(payload.text).slice(0, 150),
            timestamp: Date.now(),
          });
          break;
        }

        default:
          sendJson(ws, 'room:error', { message: `Unknown message type: ${type}` });
      }
    } catch (err: any) {
      sendJson(ws, 'room:error', { message: err?.message || 'Invalid JSON format.' });
    }
  });

  ws.on('close', () => {
    const meta = clientMeta.get(ws);
    if (meta && meta.roomCode) {
      const { room, deleted } = roomManager.leaveRoom(meta.roomCode, meta.participantId);
      if (!deleted && room) {
        broadcastToRoom(room.code, 'room:state_update', room);
      }
    }
    clientMeta.delete(ws);
  });
});

// 4. Ping/Pong Heartbeat to detect severed connections
const heartbeatInterval = setInterval(() => {
  clientMeta.forEach((meta, ws) => {
    if (!meta.isAlive) {
      ws.terminate();
      clientMeta.delete(ws);
      return;
    }
    meta.isAlive = false;
    ws.ping();
  });
}, 30000);

// 5. Start Server
server.listen(PORT, () => {
  console.log(`[KeySmasher Real-Time Service] Listening on http://localhost:${PORT}`);
});

// 6. Graceful Shutdown
function handleShutdown() {
  console.log('[KeySmasher Real-Time Service] Shutting down...');
  clearInterval(heartbeatInterval);
  roomManager.destroy();
  wss.close(() => {
    server.close(() => {
      console.log('[KeySmasher Real-Time Service] Closed cleanly.');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
