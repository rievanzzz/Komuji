// QR Code Generator Utility (using Canvas)
export const generateQRCode = (data: string, size: number = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = size;
      canvas.height = size;

      // Simple QR-like pattern (for demo - in production use proper QR library)
      const cellSize = size / 25;

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Generate pattern based on data hash
      const hash = simpleHash(data);
      ctx.fillStyle = '#000000';

      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          const shouldFill = (hash + i * j) % 3 === 0;
          if (shouldFill) {
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          }
        }
      }

      // Corner markers
      drawCornerMarker(ctx, 0, 0, cellSize);
      drawCornerMarker(ctx, 18 * cellSize, 0, cellSize);
      drawCornerMarker(ctx, 0, 18 * cellSize, cellSize);

      // Convert to base64
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);

    } catch (error) {
      reject(error);
    }
  });
};

// Simple hash function for demo
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Draw corner marker
const drawCornerMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number) => {
  // Outer square
  ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize);

  // Inner white square
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);

  // Inner black square
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
};

// Validate QR data
export const parseQRData = (qrData: string): { token: string; eventId: number; userId: number; timestamp: string } | null => {
  try {
    const parsed = JSON.parse(qrData);

    if (parsed.token && parsed.eventId && parsed.userId && parsed.timestamp) {
      return {
        token: parsed.token,
        eventId: parseInt(parsed.eventId),
        userId: parseInt(parsed.userId),
        timestamp: parsed.timestamp
      };
    }

    return null;
  } catch {
    return null;
  }
};
