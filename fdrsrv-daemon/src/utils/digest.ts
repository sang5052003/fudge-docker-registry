import * as crypto from 'crypto';

export default function digest(content: crypto.BinaryLike, algorithm?: string) {
  const digestAlgorithm = algorithm || 'sha256';
  const hash = crypto.createHash(digestAlgorithm);
  return `${digestAlgorithm}:${hash.update(content).digest().toString('hex')}`;
}
