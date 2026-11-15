declare module 'ws' {
  import { EventEmitter } from 'events';
  import { IncomingMessage, Server as HttpServer } from 'http';

  export class WebSocket extends EventEmitter {
    static readonly CONNECTING: 0;
    static readonly OPEN: 1;
    static readonly CLOSING: 2;
    static readonly CLOSED: 3;

    readyState: number;

    send(data: string | Buffer, cb?: (err?: Error) => void): void;
    close(code?: number, data?: string): void;
    terminate(): void;
    ping(data?: unknown): void;
    pong(data?: unknown): void;

    on(event: 'message', listener: (data: Buffer | string, isBinary: boolean) => void): this;
    on(event: 'close', listener: (code: number, reason: Buffer) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  }

  export interface ServerOptions {
    server?: HttpServer;
    port?: number;
    path?: string;
    noServer?: boolean;
    clientTracking?: boolean;
  }

  export class WebSocketServer extends EventEmitter {
    clients: Set<WebSocket>;

    constructor(options?: ServerOptions);

    on(event: 'connection', listener: (socket: WebSocket, request: IncomingMessage) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;

    close(cb?: (err?: Error) => void): void;
  }

  export default WebSocket;
}
