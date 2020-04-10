import * as crypto from 'crypto';

export default function digest(content: crypto.BinaryLike, algorithm?: string) {
  if (!algorithm) {
    algorithm = 'sha256';
  }
  const hash = crypto.createHash(algorithm);
  return algorithm + ':' + hash.update(content).digest().toString('hex');
}
