/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-console */
// Packages
import type { Socket } from 'net';
import getPort from 'get-port';
import serve from 'micro/lib';
import getModule from 'micro/lib/handler';
// Utilities
import type { Flags } from '../bin/micro-dev';
import listening from './listening';
import log from './log';

// Ensure that the loaded files and packages have the correct env
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

type Serve = (
  file: string,
  flags: object,
  restarting?: boolean
) => unknown;

export const serve: Serve = async (file: string, flags: Flags, restarting: boolean) => {
  if (restarting) {
    process.emit('SIGUSR2');
  }

  const handler: unknown = await getModule(file);

  // And then load the files
  const module: unknown = flags.silent ? handler : log(handler, flags.limit);
  const server = serve(module);

  const { isNaN } = Number;
  let port = Number(flags.port);

  if (isNaN(port) || (!isNaN(port) && (port < 1 || port >= 2 ** 16))) {
    console.error(`Port option must be a number. Supplied: ${flags.port}`);
    process.exit(1);
  }

  // Check if the specified port is already in use (if none
  // is specified, the default one will be checked)
  const open: number = await getPort(port);
  const old = port;

  // Define if the port is already in use
  let inUse = open !== port;

  // Only overwrite the port when restarting
  if (inUse && !restarting) {
    port = open;
    inUse = { old, open };
  }

  const sockets: Socket[] = [];

  server.listen(port, flags.host, (err: Error | null) => {
    if (err) {
      console.error('micro:', err.stack);
      process.exit(1);
    }

    if (restarting) {
      flags.restarted = true;
    }

    flags._[0] = file;
    return listening(server, inUse, flags, sockets);
  });

  server.on('connection', (socket: Socket) => {
    const index = sockets.push(socket);
    socket.once('close', () => sockets.splice(index, 1));
  });
};
