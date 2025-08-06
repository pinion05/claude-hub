import { Server } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import type { WebSocketMessage, RealtimeEvent, AuthenticatedUser } from '@/lib/api/types';

// WebSocket 클라이언트 인터페이스
interface WebSocketClient {
  id: string;
  ws: any;
  user?: AuthenticatedUser;
  channels: string[];
  lastPing: number;
}

// WebSocket 서버 클래스
export class WebSocketServer {
  private server: Server;
  private clients: Map<string, WebSocketClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private pingInterval: NodeJS.Timeout;

  constructor(port: number = 3001) {
    this.server = new Server({ 
      port,
      perMessageDeflate: {
        zlibDeflateOptions: {
          level: 3,
          chunkSize: 1024
        },
        threshold: 1024,
        concurrencyLimit: 10,
      }
    });

    this.setupEventHandlers();
    this.startPingInterval();
    
    console.log(`WebSocket server listening on port ${port}`);
  }

  private setupEventHandlers() {
    this.server.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      const user = this.authenticateConnection(req);
      
      const client: WebSocketClient = {
        id: clientId,
        ws,
        user,
        channels: [],
        lastPing: Date.now(),
      };

      this.clients.set(clientId, client);
      
      // 연결 성공 메시지
      this.sendToClient(client, {
        type: 'connection',
        payload: {
          clientId,
          user: user ? { id: user.id, role: user.role } : null,
          timestamp: new Date().toISOString(),
        },
      });

      // 메시지 핸들러
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(client, message);
        } catch (error) {
          console.error('WebSocket 메시지 파싱 실패:', error);
          this.sendError(client, 'Invalid message format');
        }
      });

      // 연결 종료 핸들러
      ws.on('close', () => {
        this.handleClientDisconnect(client);
      });

      // 에러 핸들러
      ws.on('error', (error) => {
        console.error('WebSocket 에러:', error);
        this.handleClientDisconnect(client);
      });

      // Pong 핸들러
      ws.on('pong', () => {
        client.lastPing = Date.now();
      });
    });
  }

  private authenticateConnection(req: IncomingMessage): AuthenticatedUser | undefined {
    try {
      const url = new URL(req.url || '', 'http://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) return undefined;

      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const payload = jwt.verify(token, secret) as any;
      
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role || 'user',
        permissions: payload.permissions || [],
      };
    } catch (error) {
      console.error('WebSocket 인증 실패:', error);
      return undefined;
    }
  }

  private handleClientMessage(client: WebSocketClient, message: any) {
    const { type, payload } = message;

    switch (type) {
      case 'subscribe':
        this.handleSubscribe(client, payload.channels);
        break;
        
      case 'unsubscribe':
        this.handleUnsubscribe(client, payload.channels);
        break;
        
      case 'ping':
        client.lastPing = Date.now();
        this.sendToClient(client, { type: 'pong', payload: { timestamp: Date.now() } });
        break;
        
      case 'user_activity':
        if (client.user) {
          this.broadcastToChannel('user_activity', {
            type: 'user_activity',
            payload: {
              userId: client.user.id,
              activity: payload.activity,
              timestamp: new Date().toISOString(),
            },
          });
        }
        break;
        
      default:
        this.sendError(client, `Unknown message type: ${type}`);
    }
  }

  private handleSubscribe(client: WebSocketClient, channels: string[]) {
    const validChannels = ['extensions', 'stats', 'user_activity', 'system'];
    const channelsToAdd = channels.filter(channel => 
      validChannels.includes(channel) && !client.channels.includes(channel)
    );

    channelsToAdd.forEach(channel => {
      client.channels.push(channel);
      
      if (!this.channels.has(channel)) {
        this.channels.set(channel, new Set());
      }
      
      this.channels.get(channel)!.add(client.id);
    });

    this.sendToClient(client, {
      type: 'subscribed',
      payload: {
        channels: channelsToAdd,
        totalSubscriptions: client.channels.length,
      },
    });
  }

  private handleUnsubscribe(client: WebSocketClient, channels: string[]) {
    const channelsToRemove = channels.filter(channel => 
      client.channels.includes(channel)
    );

    channelsToRemove.forEach(channel => {
      const index = client.channels.indexOf(channel);
      if (index > -1) {
        client.channels.splice(index, 1);
      }
      
      const channelClients = this.channels.get(channel);
      if (channelClients) {
        channelClients.delete(client.id);
        
        // 채널에 클라이언트가 없으면 채널 삭제
        if (channelClients.size === 0) {
          this.channels.delete(channel);
        }
      }
    });

    this.sendToClient(client, {
      type: 'unsubscribed',
      payload: {
        channels: channelsToRemove,
        totalSubscriptions: client.channels.length,
      },
    });
  }

  private handleClientDisconnect(client: WebSocketClient) {
    // 모든 채널에서 클라이언트 제거
    client.channels.forEach(channel => {
      const channelClients = this.channels.get(channel);
      if (channelClients) {
        channelClients.delete(client.id);
        
        if (channelClients.size === 0) {
          this.channels.delete(channel);
        }
      }
    });

    // 클라이언트 제거
    this.clients.delete(client.id);
    
    console.log(`클라이언트 연결 해제: ${client.id}`);
  }

  private sendToClient(client: WebSocketClient, message: any) {
    if (client.ws.readyState === 1) { // WebSocket.OPEN
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('메시지 전송 실패:', error);
        this.handleClientDisconnect(client);
      }
    }
  }

  private sendError(client: WebSocketClient, message: string) {
    this.sendToClient(client, {
      type: 'error',
      payload: {
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 1분 타임아웃

      this.clients.forEach((client, clientId) => {
        // 타임아웃된 클라이언트 제거
        if (now - client.lastPing > timeout) {
          console.log(`클라이언트 타임아웃: ${clientId}`);
          this.handleClientDisconnect(client);
          return;
        }

        // Ping 전송
        if (client.ws.readyState === 1) {
          client.ws.ping();
        }
      });
    }, 30000); // 30초마다 ping
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 공개 메소드들
  public broadcastToChannel(channel: string, message: any) {
    const channelClients = this.channels.get(channel);
    if (!channelClients) return;

    const fullMessage = {
      ...message,
      channel,
      timestamp: new Date().toISOString(),
    };

    channelClients.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client) {
        this.sendToClient(client, fullMessage);
      }
    });
  }

  public broadcastToUser(userId: string, message: any) {
    this.clients.forEach(client => {
      if (client.user?.id === userId) {
        this.sendToClient(client, {
          ...message,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  public broadcastToAll(message: any) {
    const fullMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    this.clients.forEach(client => {
      this.sendToClient(client, fullMessage);
    });
  }

  public getStats() {
    return {
      totalClients: this.clients.size,
      channels: Array.from(this.channels.keys()),
      channelStats: Object.fromEntries(
        Array.from(this.channels.entries()).map(([channel, clients]) => [
          channel,
          clients.size
        ])
      ),
    };
  }

  public close() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.server.close();
  }
}

// 글로벌 WebSocket 서버 인스턴스
let wsServer: WebSocketServer | null = null;

export function getWebSocketServer(): WebSocketServer {
  if (!wsServer) {
    wsServer = new WebSocketServer();
  }
  return wsServer;
}

export function closeWebSocketServer() {
  if (wsServer) {
    wsServer.close();
    wsServer = null;
  }
}