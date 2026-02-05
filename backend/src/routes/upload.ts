import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { App } from '../index.js';

export function registerUploadRoutes(app: App, fastify: FastifyInstance) {
  /**
   * POST /api/upload/media
   * Upload media file (image, audio, video)
   */
  fastify.post<{ Reply: { url: string; filename: string } }>(
    '/api/upload/media',
    {
      schema: {
        description: 'Upload media file for memorial requests',
        tags: ['upload'],
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              filename: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'Processing media file upload');

      try {
        const data = await request.file();

        if (!data) {
          app.logger.warn({}, 'No file provided in upload request');
          return reply.status(400).send({ error: 'No file provided' });
        }

        const buffer = await data.toBuffer();
        const filename = data.filename;
        const timestamp = Date.now();
        const storageKey = `uploads/memorials/${timestamp}-${filename}`;

        app.logger.info(
          { filename, size: buffer.length, storageKey },
          'Uploading file to storage'
        );

        // Upload to storage and get the signed URL
        const uploadedKey = await app.storage.upload(storageKey, buffer);
        const { url } = await app.storage.getSignedUrl(uploadedKey);

        app.logger.info(
          { filename, storageKey: uploadedKey },
          'File uploaded successfully'
        );

        return {
          url,
          filename,
        };
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to upload media file');
        throw error;
      }
    }
  );
}
