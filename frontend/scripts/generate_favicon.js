const sharp = require('sharp');
const fs = require('fs');

async function createRoundFavicon() {
  try {
    const inputPath = './public/log.avif';
    const outputPath = './public/favicon-round.png'; // PNG for wider favicon compatibility

    // Create a circular SVG mask
    const width = 512;
    const height = 512;
    const circleSvg = Buffer.from(
      `<svg width="${width}" height="${height}">
        <circle cx="${width / 2}" cy="${height / 2}" r="${width / 2}" fill="white" />
      </svg>`
    );

    await sharp(inputPath)
      .resize(width, height, { fit: 'cover' })
      .composite([{
        input: circleSvg,
        blend: 'dest-in'
      }])
      .png()
      .toFile(outputPath);

    console.log('Successfully created round favicon at:', outputPath);
  } catch (error) {
    console.error('Error creating round favicon:', error);
  }
}

createRoundFavicon();
