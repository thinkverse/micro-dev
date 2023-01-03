/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-console */

// Packages
import chalk from 'chalk';

type LogError = (message: string, errorCode: string) => void

export const logError: LogError = (message: string, errorCode: string): void => {
  const repo = errorCode === 'watch-flags' ? 'micro-dev' : 'micro';
  const { red, blue } = chalk;

  console.error(`${red('Error:')} ${message}`);
  console.error(
    `${blue('How to Fix It:')} https://err.sh/${repo}/${errorCode}`,
  );
};
