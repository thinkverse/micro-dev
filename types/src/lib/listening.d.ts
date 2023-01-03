import type { Socket } from 'net';
import type { Server } from 'http';
import type { FSWatcher } from 'chokidar';
export declare const copyToClipboard: (text: string) => Promise<boolean>;
export declare const restartServer: (file: string, flags: object, watcher: FSWatcher) => void;
export declare const listening: (server: Server, inUse: object, flags: object, sockets: Socket[]) => Promise<void>;
//# sourceMappingURL=listening.d.ts.map