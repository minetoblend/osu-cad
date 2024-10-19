import crypto from 'node:crypto';

export function getHash(content: string): string {
  return crypto.createHash('sha1')
    .update(content, 'utf8')
    .digest('hex');
}
