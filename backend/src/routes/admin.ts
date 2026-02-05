import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

/**
 * Generate a URL-friendly slug from a person's name
 * Example: "John Doe" -> "john-doe"
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate a public URL slug with a counter to ensure uniqueness
 * Example: "john-doe-1945" if birth year is available, otherwise "john-doe"
 */
async function generatePublicUrl(
  app: App,
  fullName: string,
  birthDate?: Date | null
): Promise<string> {
  let baseSlug = generateSlug(fullName);

  // Add birth year if available
  if (birthDate) {
    const year = new Date(birthDate).getFullYear();
    baseSlug = `${baseSlug}-${year}`;
  }

  // Check if this slug already exists, if so add a counter
  let publicUrl = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const found = await app.db.query.memorials.findFirst({
      where: eq(schema.memorials.public_url, publicUrl),
    });

    if (!found) {
      exists = false;
    } else {
      counter++;
      publicUrl = baseSlug + (counter > 1 ? `-${counter}` : '');
    }
  }

  return publicUrl;
}

/**
 * Generate QR code URL
 */
function generateQRCodeUrl(publicUrl: string, baseUrl: string = 'https://memorials.fcpus.com'): string {
  const memorialUrl = `${baseUrl}/memorial/${publicUrl}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(memorialUrl)}`;
}

export function registerAdminRoutes(app: App, fastify: FastifyInstance) {
  const requireAuth = app.requireAuth();

  /**
   * GET /api/admin/memorial-requests
   * Get all memorial requests with filters
   */
  fastify.get<{
    Querystring: {
      status?: string;
      discount_requested?: string;
    };
  }>(
    '/api/admin/memorial-requests',
    {
      schema: {
        description: 'Get all memorial requests with filters',
        tags: ['admin'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            discount_requested: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { status, discount_requested } = request.query as {
        status?: string;
        discount_requested?: string;
      };

      app.logger.info(
        { status, discount_requested },
        'Fetching memorial requests for admin'
      );

      try {
        let requests = await app.db.query.memorial_requests.findMany();

        // Apply filters
        if (status) {
          requests = requests.filter(r => r.request_status === status);
        }
        if (discount_requested === 'true') {
          requests = requests.filter(r => r.discount_requested === true);
        } else if (discount_requested === 'false') {
          requests = requests.filter(r => r.discount_requested === false);
        }

        app.logger.info({ count: requests.length }, 'Memorial requests retrieved successfully');
        return requests;
      } catch (error) {
        app.logger.error({ err: error, status, discount_requested }, 'Failed to fetch memorial requests');
        throw error;
      }
    }
  );

  /**
   * PUT /api/admin/memorial-requests/:id
   * Update a memorial request status
   */
  fastify.put<{
    Params: { id: string };
    Body: {
      request_status: string;
      admin_notes?: string;
    };
  }>(
    '/api/admin/memorial-requests/:id',
    {
      schema: {
        description: 'Update a memorial request status',
        tags: ['admin'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          required: ['request_status'],
          properties: {
            request_status: {
              type: 'string',
              enum: ['submitted', 'under_review', 'approved', 'published', 'rejected'],
            },
            admin_notes: { type: 'string' },
          },
        },
        response: {
          200: { type: 'object' },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };
      const { request_status } = request.body as { request_status: string };

      app.logger.info(
        { requestId: id, newStatus: request_status },
        'Updating memorial request status'
      );

      try {
        const result = await app.db
          .update(schema.memorial_requests)
          .set({
            request_status,
            updated_at: new Date(),
          })
          .where(eq(schema.memorial_requests.id, id))
          .returning();

        if (result.length === 0) {
          app.logger.warn({ requestId: id }, 'Memorial request not found for update');
          return reply.status(404).send({ error: 'Memorial request not found' });
        }

        const updatedRequest = result[0];
        app.logger.info(
          { requestId: id, status: updatedRequest.request_status },
          'Memorial request status updated successfully'
        );

        return updatedRequest;
      } catch (error) {
        app.logger.error(
          { err: error, requestId: id, request_status },
          'Failed to update memorial request status'
        );
        throw error;
      }
    }
  );

  /**
   * POST /api/admin/memorials
   * Create and publish a memorial from an approved request
   */
  fastify.post<{
    Body: {
      request_id: string;
      full_name: string;
      birth_date?: string;
      death_date?: string;
      story_text: string;
      photos: string[];
      video_link?: string;
      audio_narration_link?: string;
      latitude?: string;
      longitude?: string;
      location_visibility: string;
      public_url?: string;
    };
  }>(
    '/api/admin/memorials',
    {
      schema: {
        description: 'Create and publish a memorial from an approved request',
        tags: ['admin'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['request_id', 'full_name', 'story_text', 'photos', 'location_visibility'],
          properties: {
            request_id: { type: 'string' },
            full_name: { type: 'string' },
            birth_date: { type: 'string' },
            death_date: { type: 'string' },
            story_text: { type: 'string' },
            photos: { type: 'array', items: { type: 'string' } },
            video_link: { type: 'string' },
            audio_narration_link: { type: 'string' },
            latitude: { type: 'string' },
            longitude: { type: 'string' },
            location_visibility: { type: 'string', enum: ['exact', 'approximate', 'hidden'] },
            public_url: { type: 'string' },
          },
        },
        response: {
          201: { type: 'object' },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const {
        request_id,
        full_name,
        birth_date,
        death_date,
        story_text,
        photos,
        video_link,
        audio_narration_link,
        latitude,
        longitude,
        location_visibility,
        public_url: providedPublicUrl,
      } = request.body as {
        request_id: string;
        full_name: string;
        birth_date?: string;
        death_date?: string;
        story_text: string;
        photos: string[];
        video_link?: string;
        audio_narration_link?: string;
        latitude?: string;
        longitude?: string;
        location_visibility: string;
        public_url?: string;
      };

      app.logger.info(
        { requestId: request_id, full_name, location_visibility },
        'Creating memorial from request'
      );

      try {
        // Convert dates - keep as strings for date columns
        const birthDate = birth_date ? birth_date : null;
        const deathDate = death_date ? death_date : null;

        // Generate public URL if not provided
        let publicUrl = providedPublicUrl;
        if (!publicUrl) {
          publicUrl = await generatePublicUrl(app, full_name, birthDate ? new Date(birthDate) : null);
        }

        // Generate QR code URL
        const qrCodeUrl = generateQRCodeUrl(publicUrl);

        // Create the memorial
        const result = await app.db
          .insert(schema.memorials)
          .values({
            full_name,
            birth_date: birthDate as any,
            death_date: deathDate as any,
            story_text,
            photos: photos as any,
            video_link: video_link || null,
            audio_narration_link: audio_narration_link || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            location_visibility,
            qr_code_url: qrCodeUrl,
            public_url: publicUrl,
            published_status: true,
          } as any)
          .returning();

        const createdMemorial = result[0];

        // Update the request status to published
        await app.db
          .update(schema.memorial_requests)
          .set({
            request_status: 'published',
            updated_at: new Date(),
          })
          .where(eq(schema.memorial_requests.id, request_id));

        app.logger.info(
          { memorialId: createdMemorial.id, publicUrl, requestId: request_id },
          'Memorial created and published successfully'
        );

        return reply.status(201).send(createdMemorial);
      } catch (error) {
        app.logger.error(
          { err: error, requestId: request_id, full_name },
          'Failed to create memorial'
        );
        throw error;
      }
    }
  );

  /**
   * PUT /api/admin/memorials/:id
   * Update an existing memorial
   */
  fastify.put<{
    Params: { id: string };
    Body: {
      full_name?: string;
      birth_date?: string;
      death_date?: string;
      story_text?: string;
      photos?: string[];
      video_link?: string;
      audio_narration_link?: string;
      latitude?: string;
      longitude?: string;
      location_visibility?: string;
      published_status?: boolean;
    };
  }>(
    '/api/admin/memorials/:id',
    {
      schema: {
        description: 'Update an existing memorial',
        tags: ['admin'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          properties: {
            full_name: { type: 'string' },
            birth_date: { type: 'string' },
            death_date: { type: 'string' },
            story_text: { type: 'string' },
            photos: { type: 'array', items: { type: 'string' } },
            video_link: { type: 'string' },
            audio_narration_link: { type: 'string' },
            latitude: { type: 'string' },
            longitude: { type: 'string' },
            location_visibility: { type: 'string', enum: ['exact', 'approximate', 'hidden'] },
            published_status: { type: 'boolean' },
          },
        },
        response: {
          200: { type: 'object' },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };
      const {
        full_name,
        birth_date,
        death_date,
        story_text,
        photos,
        video_link,
        audio_narration_link,
        latitude,
        longitude,
        location_visibility,
        published_status,
      } = request.body as {
        full_name?: string;
        birth_date?: string;
        death_date?: string;
        story_text?: string;
        photos?: string[];
        video_link?: string;
        audio_narration_link?: string;
        latitude?: string;
        longitude?: string;
        location_visibility?: string;
        published_status?: boolean;
      };

      app.logger.info({ memorialId: id }, 'Updating memorial');

      try {
        const updates: any = {};

        if (full_name !== undefined) updates.full_name = full_name;
        if (birth_date !== undefined) updates.birth_date = birth_date ? new Date(birth_date) : null;
        if (death_date !== undefined) updates.death_date = death_date ? new Date(death_date) : null;
        if (story_text !== undefined) updates.story_text = story_text;
        if (photos !== undefined) updates.photos = photos;
        if (video_link !== undefined) updates.video_link = video_link || null;
        if (audio_narration_link !== undefined) updates.audio_narration_link = audio_narration_link || null;
        if (latitude !== undefined) updates.latitude = latitude ? parseFloat(latitude) : null;
        if (longitude !== undefined) updates.longitude = longitude ? parseFloat(longitude) : null;
        if (location_visibility !== undefined) updates.location_visibility = location_visibility;
        if (published_status !== undefined) updates.published_status = published_status;

        const result = await app.db
          .update(schema.memorials)
          .set(updates)
          .where(eq(schema.memorials.id, id))
          .returning();

        if (result.length === 0) {
          app.logger.warn({ memorialId: id }, 'Memorial not found for update');
          return reply.status(404).send({ error: 'Memorial not found' });
        }

        const updatedMemorial = result[0];
        app.logger.info(
          { memorialId: id, published: updatedMemorial.published_status },
          'Memorial updated successfully'
        );

        return updatedMemorial;
      } catch (error) {
        app.logger.error({ err: error, memorialId: id }, 'Failed to update memorial');
        throw error;
      }
    }
  );

  /**
   * DELETE /api/admin/memorials/:id
   * Soft delete a memorial (set published_status to false)
   */
  fastify.delete(
    '/api/admin/memorials/:id',
    {
      schema: {
        description: 'Soft delete a memorial (set published_status to false)',
        tags: ['admin'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };

      app.logger.info({ memorialId: id }, 'Soft deleting memorial');

      try {
        const result = await app.db
          .update(schema.memorials)
          .set({ published_status: false })
          .where(eq(schema.memorials.id, id))
          .returning();

        if (result.length === 0) {
          app.logger.warn({ memorialId: id }, 'Memorial not found for deletion');
          return reply.status(404).send({ error: 'Memorial not found' });
        }

        app.logger.info({ memorialId: id }, 'Memorial soft deleted successfully');

        return { success: true };
      } catch (error) {
        app.logger.error({ err: error, memorialId: id }, 'Failed to delete memorial');
        throw error;
      }
    }
  );
}
