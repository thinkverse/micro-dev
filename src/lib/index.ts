/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-console */
// Packages
import type { Socket } from 'net';
import ip from 'ip';
import chalk from 'chalk';
import boxen from 'boxen';
import serve from 'micro/lib';
// Utilities
import type { Flags } from '../bin/micro-dev';
import { log } from './log';

// Ensure that the loaded files and packages have the correct env
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * micro-dev for programmatic usage
 *
 * Usage:
 *
 * require('micro-dev')({ silent: false, limit: '1mb', host: '::', port: PORT })(handler)
 */
module.exports = (flags: Flags) => (handler: unknown): void => {
  const module = flags.silent ? handler : log(handler, flags.limit);
  const server = serve(module);

  const sockets: Socket[] = [];

  server.on('connection', (socket: Socket) => {
    const index = sockets.push(socket);
    socket.once('close', () => sockets.splice(index, 1));
  });

  server.listen(flags.port, flags.host, (err: Error | null) => {
    if (err) {
      console.error('micro:', err.stack);
      process.exit(1);
    }

    // message
    const details = server.address();
    const ipAddress = ip.address();
    const url = `http://${ipAddress}:${details.port}`;
    let message = chalk.green('Micro is running programmatically!');
    message += '\n\n';

    const host = flags.host === '::' ? 'localhost' : flags.host;
    const localURL = `http://${host}:${details.port}`;

    message += `• ${chalk.bold('Local:           ')} ${localURL}\n`;
    message += `• ${chalk.bold('On Your Network: ')} ${url}\n\n`;

    const box = boxen(message, {
      padding: 1,
      borderColor: 'green',
      margin: 1,
    });

    // Print out the message
    console.log(box);
  });
};
