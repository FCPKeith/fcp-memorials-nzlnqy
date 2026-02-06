import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { sendMemorialRequestNotification } from '../services/emailService.js';

// Tier pricing (in cents for consistency with Stripe)
const TIER_PRICES: Record<string, number> = {
  tier_1_marked: 7500,      // $75
  tier_2_remembered: 12500,  // $125
  tier_3_enduring: 20000,    // $200
};

// Preservation add-on pricing (in cents)
const PRESERVATION_MONTHLY = 200;   // $2/month
const PRESERVATION_YEARLY = 1200;   // $12/year

const DISCOUNT_PERCENTAGE = 0.15; // 15% discount

export function registerMemorialRequestRoutes(app: App, fastify: FastifyInstance) {
  /**
   * POST /api/memorial-requests
   * Create a new memorial request
   */
  fastify.post<{
    Body: {
      requester_name: string;
      requester_email: string;
      loved_one_name: string;
      birth_date?: string;
      death_date?: string;
      story_notes: string;
      media_uploads?: string[];
      location_info?: string;
      latitude?: string;
      longitude?: string;
      tier_selected: string;
      preservation_addon?: boolean;
      preservation_billing_cycle?: string;
      discount_requested?: boolean;
      discount_type?: string;
      documentation_upload?: string;
      country?: string;
    };
  }>(
    '/api/memorial-requests',
    {
      schema: {
        description: 'Create a new memorial request',
        tags: ['memorial-requests'],
        body: {
          type: 'object',
          required: [
            'requester_name',
            'requester_email',
            'loved_one_name',
            'story_notes',
            'tier_selected',
          ],
          properties: {
            requester_name: { type: 'string' },
            requester_email: { type: 'string' },
            loved_one_name: { type: 'string' },
            birth_date: { type: 'string' },
            death_date: { type: 'string' },
            story_notes: { type: 'string' },
            media_uploads: { type: 'array', items: { type: 'string' } },
            location_info: { type: 'string' },
            latitude: { type: 'string' },
            longitude: { type: 'string' },
            tier_selected: { type: 'string', enum: ['tier_1_marked', 'tier_2_remembered', 'tier_3_enduring'] },
            preservation_addon: { type: 'boolean' },
            preservation_billing_cycle: { type: 'string', enum: ['monthly', 'yearly'] },
            discount_requested: { type: 'boolean' },
            discount_type: { type: 'string', enum: ['military', 'first_responder'] },
            documentation_upload: { type: 'string' },
            country: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              payment_amount: { type: 'number' },
              request_status: { type: 'string' },
              created_at: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const {
        requester_name,
        requester_email,
        loved_one_name,
        birth_date,
        death_date,
        story_notes,
        media_uploads = [],
        location_info,
        latitude,
        longitude,
        tier_selected,
        preservation_addon = false,
        preservation_billing_cycle,
        discount_requested = false,
        discount_type,
        documentation_upload,
        country,
      } = request.body as {
        requester_name: string;
        requester_email: string;
        loved_one_name: string;
        birth_date?: string;
        death_date?: string;
        story_notes: string;
        media_uploads?: string[];
        location_info?: string;
        latitude?: string;
        longitude?: string;
        tier_selected: string;
        preservation_addon?: boolean;
        preservation_billing_cycle?: string;
        discount_requested?: boolean;
        discount_type?: string;
        documentation_upload?: string;
        country?: string;
      };

      app.logger.info(
        {
          requester_email,
          loved_one_name,
          tier_selected,
          preservation_addon,
          preservation_billing_cycle,
          discount_requested,
        },
        'Creating memorial request'
      );

      try {
        // Calculate payment amount
        let payment_amount = TIER_PRICES[tier_selected] || 0;

        // Add preservation add-on if selected
        if (preservation_addon) {
          const preservationCost =
            preservation_billing_cycle === 'monthly' ? PRESERVATION_MONTHLY : PRESERVATION_YEARLY;
          payment_amount += preservationCost;
        }

        // Apply 15% discount if requested
        if (discount_requested) {
          payment_amount = Math.round(payment_amount * (1 - DISCOUNT_PERCENTAGE));
        }

        // Convert string dates to Date objects or keep as null
        const birthDate = birth_date ? birth_date : null;
        const deathDate = death_date ? death_date : null;

        const result = await app.db
          .insert(schema.memorial_requests)
          .values({
            requester_name,
            requester_email,
            loved_one_name,
            birth_date: birthDate as any,
            death_date: deathDate as any,
            story_notes,
            media_uploads: media_uploads as any,
            location_info: location_info || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            tier_selected,
            preservation_addon,
            preservation_billing_cycle: preservation_addon ? preservation_billing_cycle || null : null,
            discount_requested,
            discount_type: discount_type || null,
            documentation_upload: documentation_upload || null,
            payment_amount: payment_amount as any,
            request_status: 'submitted',
            payment_status: 'pending',
            country: country || null,
          } as any)
          .returning();

        const createdRequest = result[0];

        app.logger.info(
          { requestId: createdRequest.id, payment_amount },
          'Memorial request created successfully'
        );

        // Send email notification asynchronously (non-blocking)
        sendMemorialRequestNotification(
          {
            id: createdRequest.id,
            requester_name: createdRequest.requester_name,
            requester_email: createdRequest.requester_email,
            loved_one_name: createdRequest.loved_one_name,
            birth_date: createdRequest.birth_date ? createdRequest.birth_date.toString() : null,
            death_date: createdRequest.death_date ? createdRequest.death_date.toString() : null,
            story_notes: createdRequest.story_notes,
            media_uploads: createdRequest.media_uploads as string[],
            location_info: createdRequest.location_info,
            latitude: createdRequest.latitude ? createdRequest.latitude.toString() : null,
            longitude: createdRequest.longitude ? createdRequest.longitude.toString() : null,
            tier_selected: createdRequest.tier_selected,
            preservation_addon: createdRequest.preservation_addon,
            preservation_billing_cycle: createdRequest.preservation_billing_cycle,
            discount_requested: createdRequest.discount_requested,
            discount_type: createdRequest.discount_type,
            payment_amount: parseFloat(createdRequest.payment_amount),
            created_at: createdRequest.created_at,
            country: createdRequest.country,
          },
          app.logger
        ).catch((error) => {
          app.logger.error(
            { err: error, requestId: createdRequest.id },
            'Error sending memorial request notification (non-blocking, continuing anyway)'
          );
        });

        return reply.status(201).send({
          id: createdRequest.id,
          payment_amount: parseFloat(createdRequest.payment_amount),
          request_status: createdRequest.request_status,
          created_at: createdRequest.created_at,
        });
      } catch (error) {
        app.logger.error(
          { err: error, requester_email, loved_one_name },
          'Failed to create memorial request'
        );
        throw error;
      }
    }
  );

  /**
   * POST /api/memorial-requests/:id/payment
   * Process Stripe payment for a memorial request
   */
  fastify.post<{
    Params: { id: string };
    Body: {
      stripe_payment_id: string;
      payment_status: string;
    };
  }>(
    '/api/memorial-requests/:id/payment',
    {
      schema: {
        description: 'Process Stripe payment for a memorial request',
        tags: ['memorial-requests'],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          required: ['stripe_payment_id', 'payment_status'],
          properties: {
            stripe_payment_id: { type: 'string' },
            payment_status: { type: 'string', enum: ['completed', 'failed'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              request_status: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const { stripe_payment_id, payment_status } = request.body as {
        stripe_payment_id: string;
        payment_status: string;
      };

      app.logger.info(
        { requestId: id, payment_status, stripe_payment_id },
        'Processing memorial request payment'
      );

      try {
        // Update the memorial request with payment info
        const result = await app.db
          .update(schema.memorial_requests)
          .set({
            stripe_payment_id,
            payment_status: payment_status,
            request_status: payment_status === 'completed' ? 'under_review' : 'submitted',
            updated_at: new Date(),
          })
          .where(eq(schema.memorial_requests.id, id))
          .returning();

        if (result.length === 0) {
          app.logger.warn({ requestId: id }, 'Memorial request not found for payment update');
          return reply.status(404).send({ error: 'Memorial request not found' });
        }

        const updatedRequest = result[0];

        app.logger.info(
          { requestId: id, payment_status, newStatus: updatedRequest.request_status },
          'Memorial request payment processed successfully'
        );

        return {
          success: true,
          request_status: updatedRequest.request_status,
        };
      } catch (error) {
        app.logger.error(
          { err: error, requestId: id, stripe_payment_id },
          'Failed to process memorial request payment'
        );
        throw error;
      }
    }
  );
}
