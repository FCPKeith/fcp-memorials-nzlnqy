import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

export function registerMemorialRoutes(app: App, fastify: FastifyInstance) {
  /**
   * GET /api/memorials/resolve/:slug
   * Get a memorial by its public URL slug (used for universal QR code resolution)
   * This endpoint works with the universal landing URL: /go?m={slug}
   * Returns full memorial data or 404 if not found
   */
  fastify.get(
    '/api/memorials/resolve/:slug',
    {
      schema: {
        description: 'Get a memorial by its public URL slug for universal QR code resolution',
        tags: ['memorials'],
        params: {
          type: 'object',
          properties: { slug: { type: 'string' } },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              full_name: { type: 'string' },
              birth_date: { type: 'string' },
              death_date: { type: 'string' },
              story_text: { type: 'string' },
              photos: { type: 'array' },
              video_link: { type: 'string' },
              audio_narration_link: { type: 'string' },
              latitude: { type: 'string' },
              longitude: { type: 'string' },
              location_visibility: { type: 'string' },
              qr_code_url: { type: 'string' },
              public_url: { type: 'string' },
              created_at: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { slug } = request.params as { slug: string };
      app.logger.info({ slug }, 'Resolving memorial by slug');

      try {
        const memorial = await app.db.query.memorials.findFirst({
          where: and(
            eq(schema.memorials.public_url, slug),
            eq(schema.memorials.published_status, true)
          ),
        });

        if (!memorial) {
          app.logger.warn({ slug }, 'Memorial not found by slug or not published');
          return reply.status(404).send({ error: 'Memorial not found' });
        }

        app.logger.info({ memorialId: memorial.id, slug }, 'Memorial resolved by slug successfully');
        return memorial;
      } catch (error) {
        app.logger.error({ err: error, slug }, 'Failed to resolve memorial by slug');
        throw error;
      }
    }
  );

  /**
   * GET /api/memorials/:id
   * Get a single memorial by ID
   */
  fastify.get(
    '/api/memorials/:id',
    {
      schema: {
        description: 'Get a single memorial by ID',
        tags: ['memorials'],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              full_name: { type: 'string' },
              birth_date: { type: 'string' },
              death_date: { type: 'string' },
              story_text: { type: 'string' },
              photos: { type: 'array' },
              video_link: { type: 'string' },
              audio_narration_link: { type: 'string' },
              latitude: { type: 'string' },
              longitude: { type: 'string' },
              location_visibility: { type: 'string' },
              qr_code_url: { type: 'string' },
              public_url: { type: 'string' },
              created_at: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      app.logger.info({ id }, 'Fetching memorial by ID');

      try {
        const memorial = await app.db.query.memorials.findFirst({
          where: and(
            eq(schema.memorials.id, id),
            eq(schema.memorials.published_status, true)
          ),
        });

        if (!memorial) {
          app.logger.warn({ id }, 'Memorial not found or not published');
          return reply.status(404).send({ error: 'Memorial not found' });
        }

        app.logger.info({ memorialId: memorial.id }, 'Memorial retrieved successfully');
        return memorial;
      } catch (error) {
        app.logger.error({ err: error, id }, 'Failed to fetch memorial');
        throw error;
      }
    }
  );

  /**
   * GET /api/memorials/by-url/:publicUrl
   * Get a memorial by its public URL slug
   */
  fastify.get(
    '/api/memorials/by-url/:publicUrl',
    {
      schema: {
        description: 'Get a memorial by its public URL slug',
        tags: ['memorials'],
        params: {
          type: 'object',
          properties: { publicUrl: { type: 'string' } },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              full_name: { type: 'string' },
              birth_date: { type: 'string' },
              death_date: { type: 'string' },
              story_text: { type: 'string' },
              photos: { type: 'array' },
              video_link: { type: 'string' },
              audio_narration_link: { type: 'string' },
              latitude: { type: 'string' },
              longitude: { type: 'string' },
              location_visibility: { type: 'string' },
              qr_code_url: { type: 'string' },
              public_url: { type: 'string' },
              created_at: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { publicUrl } = request.params as { publicUrl: string };
      app.logger.info({ publicUrl }, 'Fetching memorial by URL');

      try {
        const memorial = await app.db.query.memorials.findFirst({
          where: and(
            eq(schema.memorials.public_url, publicUrl),
            eq(schema.memorials.published_status, true)
          ),
        });

        if (!memorial) {
          app.logger.warn({ publicUrl }, 'Memorial not found by URL or not published');
          return reply.status(404).send({ error: 'Memorial not found' });
        }

        app.logger.info({ memorialId: memorial.id, publicUrl }, 'Memorial retrieved by URL successfully');
        return memorial;
      } catch (error) {
        app.logger.error({ err: error, publicUrl }, 'Failed to fetch memorial by URL');
        throw error;
      }
    }
  );

  /**
   * GET /api/memorials/map
   * Get all published memorials for map display
   */
  fastify.get(
    '/api/memorials/map',
    {
      schema: {
        description: 'Get all published memorials for map display',
        tags: ['memorials'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                full_name: { type: 'string' },
                latitude: { type: 'string' },
                longitude: { type: 'string' },
                location_visibility: { type: 'string' },
                public_url: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'Fetching memorials for map display');

      try {
        const memorials = await app.db.query.memorials.findMany({
          where: and(
            eq(schema.memorials.published_status, true),
            // Only include memorials with exact or approximate location visibility
            // We'll filter this in JavaScript since complex conditions might need OR logic
          ),
        });

        // Filter for exact or approximate visibility
        const mapData = memorials
          .filter(m => m.location_visibility === 'exact' || m.location_visibility === 'approximate')
          .map(m => ({
            id: m.id,
            full_name: m.full_name,
            latitude: m.latitude,
            longitude: m.longitude,
            location_visibility: m.location_visibility,
            public_url: m.public_url,
          }));

        app.logger.info({ count: mapData.length }, 'Map memorials retrieved successfully');
        return mapData;
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to fetch memorials for map');
        throw error;
      }
    }
  );
}
