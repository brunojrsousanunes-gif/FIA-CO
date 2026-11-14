import os from 'node:os';
import path from 'node:path';

function isWithin(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' ||
    (relative !== '..' &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative));
}

export function resolvePublicOutputPath(repoRoot, requestedPath, tempRoot = os.tmpdir()) {
  const root = path.resolve(repoRoot);
  const output = path.resolve(root, String(requestedPath || 'pages-public'));

  // Never allow the build to erase the repository itself or one of its parents.
  if (isWithin(output, root)) {
    throw new Error('UNSAFE_PUBLIC_OUTPUT_PATH');
  }

  const relativeToRepo = path.relative(root, output);
  const insideRepo = relativeToRepo !== '..' &&
    !relativeToRepo.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativeToRepo);

  if (insideRepo) {
    const allowedOutputs = new Set(['pages-public', '.pages-public-test']);
    if (!allowedOutputs.has(relativeToRepo)) {
      throw new Error('UNSAFE_PUBLIC_OUTPUT_PATH');
    }
    return output;
  }

  // External build destinations are permitted only inside the OS temp directory.
  const temp = path.resolve(tempRoot);
  if (output === temp || !isWithin(temp, output)) {
    throw new Error('UNSAFE_PUBLIC_OUTPUT_PATH');
  }

  return output;
}
