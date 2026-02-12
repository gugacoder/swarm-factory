import { EventEmitter } from 'node:events';

export interface SSEEvent {
  id: number;
  type: string;
  data: Record<string, unknown>;
}

type SSEClient = {
  id: number;
  send: (event: SSEEvent) => void;
  close: () => void;
};

class EventService extends EventEmitter {
  private clients: Map<number, SSEClient> = new Map();
  private nextClientId = 1;
  private nextEventId = 1;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
    this.setMaxListeners(100);
  }

  start() {
    // Heartbeat a cada 30 segundos
    this.heartbeatInterval = setInterval(() => {
      for (const client of this.clients.values()) {
        client.send({ id: 0, type: 'heartbeat', data: {} });
      }
    }, 30_000);
  }

  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    for (const client of this.clients.values()) {
      client.close();
    }
    this.clients.clear();
  }

  addClient(send: (event: SSEEvent) => void, close: () => void): number {
    const id = this.nextClientId++;
    this.clients.set(id, { id, send, close });
    return id;
  }

  removeClient(id: number) {
    this.clients.delete(id);
  }

  getClientCount(): number {
    return this.clients.size;
  }

  broadcast(type: string, data: Record<string, unknown>) {
    const event: SSEEvent = {
      id: this.nextEventId++,
      type,
      data,
    };
    for (const client of this.clients.values()) {
      client.send(event);
    }
    this.emit(type, data);
  }
}

export const eventService = new EventService();
