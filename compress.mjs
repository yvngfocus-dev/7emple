import sharp from 'sharp';
import { readdirSync, renameSync, unlinkSync } from 'fs';
import { join } from 'path';

const dir = './images';
const files = readdirSync(dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

for (const file of files) {
  const input = join(dir, file);
  const tmp   = join(dir, '_tmp_' + file);
  await sharp(input)
    .resize(2000, null, { withoutEnlargement: true })
    .jpeg({ quality: 78, progressive: true })
    .toFile(tmp);
  unlinkSync(input);
  renameSync(tmp, input);
  console.log(`✓ ${file}`);
}
