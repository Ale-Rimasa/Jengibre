import { Router, Request, Response } from 'express';
import { verifyToken, requireAuth } from '../middleware/auth';
import upload from '../middleware/upload';
import cloudinary from '../config/cloudinary';

const router = Router();

// POST /api/upload — admin only, single image
router.post(
  '/',
  verifyToken,
  requireAuth,
  upload.single('image'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No se recibió ningún archivo.' });
        return;
      }

      // Upload buffer to Cloudinary
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'jengibre',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as { secure_url: string });
          }
        );
        stream.end(req.file!.buffer);
      });

      res.json({ url: result.secure_url });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir imagen';
      res.status(500).json({ error: message });
    }
  }
);

export default router;
