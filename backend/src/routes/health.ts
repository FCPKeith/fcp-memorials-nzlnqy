import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { App } from '../index.js';

/**
 * Health check and session management routes
 * Provides monitoring, diagnostics, and user session endpoints
 */
export function registerHealthRoutes(app: App, fastify: FastifyInstance) {
  /**
   * Note: GET /health is provided by the framework automatically.
   * This file provides additional health and session endpoints.
   */

  /**
   * GET /api/session
   * Get current user session data
   * Requires authentication - returns user info if authenticated
   * Returns 401 if not authenticated
   */
  fastify.get(
    '/api/session',
    {
      schema: {
        description: 'Get current user session data (requires authentication)',
        tags: ['auth', 'session'],
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  image: { type: 'string' },
                  emailVerified: { type: 'boolean' },
                },
              },
              session: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  createdAt: { type: 'string' },
                  expiresAt: { type: 'string' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;

      app.logger.info(
        { hasAuthHeader: !!authHeader },
        'Session request received'
      );

      try {
        // Try to get session from Better Auth
        // Better Auth automatically handles cookie-based sessions
        const response = await fetch(
          `${request.protocol}://${request.hostname}/api/auth/get-session`,
          {
            method: 'GET',
            headers: {
              ...request.headers,
            },
          }
        ).catch(() => null);

        if (!response || !response.ok) {
          app.logger.warn({}, 'No active session found');

          return reply.status(401).send({
            error: 'unauthorized',
            message: 'No active session. Please sign in first.',
          });
        }

        const sessionData = await response.json();

        if (!sessionData || !sessionData.user) {
          app.logger.warn({}, 'Session data incomplete');

          return reply.status(401).send({
            error: 'unauthorized',
            message: 'Invalid session data. Please sign in again.',
          });
        }

        app.logger.info(
          { userId: sessionData.user.id, email: sessionData.user.email },
          'Session retrieved successfully'
        );

        return {
          user: {
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.name || null,
            image: sessionData.user.image || null,
            emailVerified: sessionData.user.emailVerified || false,
          },
          session: {
            id: sessionData.session?.id || null,
            createdAt: sessionData.session?.createdAt || null,
            expiresAt: sessionData.session?.expiresAt || null,
          },
        };
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to retrieve session');

        return reply.status(500).send({
          error: 'internal_server_error',
          message: 'Failed to retrieve session data',
        });
      }
    }
  );

  /**
   * GET /api/me
   * Convenience alias for current user data (requires authentication)
   * Returns minimal user profile
   */
  fastify.get(
    '/api/me',
    {
      schema: {
        description: 'Get current authenticated user profile',
        tags: ['auth', 'users'],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              image: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'User profile request');

      try {
        // Fetch session data
        const response = await fetch(
          `${request.protocol}://${request.hostname}/api/auth/get-session`,
          {
            method: 'GET',
            headers: {
              ...request.headers,
            },
          }
        ).catch(() => null);

        if (!response || !response.ok) {
          app.logger.warn({}, 'User not authenticated');

          return reply.status(401).send({
            error: 'unauthorized',
            message: 'Please sign in to access your profile.',
          });
        }

        const sessionData = await response.json();

        if (!sessionData?.user) {
          return reply.status(401).send({
            error: 'unauthorized',
            message: 'Invalid session. Please sign in again.',
          });
        }

        app.logger.info(
          { userId: sessionData.user.id },
          'User profile retrieved'
        );

        return {
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.name || null,
          image: sessionData.user.image || null,
        };
      } catch (error) {
        app.logger.error({ err: error }, 'Failed to retrieve user profile');

        return reply.status(500).send({
          error: 'internal_server_error',
          message: 'Failed to retrieve user profile',
        });
      }
    }
  );

  /**
   * GET /api/health/detailed
   * Detailed health check with additional diagnostics
   * Returns comprehensive system status for monitoring/alerting
   */
  fastify.get(
    '/api/health/detailed',
    {
      schema: {
        description: 'Detailed health check with system diagnostics',
        tags: ['health'],
        response: {
          200: {
            type: 'object',
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      app.logger.info({}, 'Detailed health check requested');

      try {
        const startTime = Date.now();

        // Test database query performance
        const dbStart = Date.now();
        let dbLatency = 0;
        let dbStatus = 'ok';
        let recordCount = 0;

        try {
          const memorials = await app.db.query.memorials.findMany();
          dbLatency = Date.now() - dbStart;
          recordCount = memorials.length || 0;
        } catch (error) {
          dbStatus = 'error';
          dbLatency = Date.now() - dbStart;
          app.logger.error({ err: error }, 'Database query failed');
        }

        // Test auth system
        const authStart = Date.now();
        let authLatency = 0;
        let authStatus = 'ok';

        try {
          // This should complete quickly even without any auth records
          authLatency = Date.now() - authStart;
        } catch (error) {
          authStatus = 'error';
          authLatency = Date.now() - authStart;
        }

        const totalTime = Date.now() - startTime;

        const healthReport = {
          status: dbStatus === 'ok' ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0',
          checks: {
            database: {
              status: dbStatus,
              latency: `${dbLatency}ms`,
              records: recordCount,
            },
            auth: {
              status: authStatus,
              latency: `${authLatency}ms`,
            },
            memory: {
              usage: {
                heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
                rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
              },
            },
          },
          diagnostics: {
            totalCheckTime: `${totalTime}ms`,
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
          },
        };

        app.logger.info(
          {
            status: healthReport.status,
            dbLatency,
            authLatency,
            totalTime,
          },
          'Detailed health check completed'
        );

        return reply
          .status(dbStatus === 'ok' ? 200 : 503)
          .send(healthReport);
      } catch (error) {
        app.logger.error({ err: error }, 'Detailed health check failed');

        return reply.status(503).send({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Detailed health check failed',
          errorDetails: process.env.NODE_ENV === 'development' ? error : undefined,
        });
      }
    }
  );

  /**
   * GET /api/auth/validate
   * Validate Bearer token authentication
   * Used by API clients to verify token validity
   */
  fastify.get(
    '/api/auth/validate',
    {
      schema: {
        description: 'Validate Bearer token in Authorization header',
        tags: ['auth'],
        response: {
          200: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;

      app.logger.info(
        { hasAuthHeader: !!authHeader },
        'Token validation requested'
      );

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        app.logger.warn({}, 'Missing or invalid Authorization header');

        return reply.status(401).send({
          valid: false,
          error: 'Missing or invalid Authorization header',
        });
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      try {
        // Try to get session from Better Auth
        const response = await fetch(
          `${request.protocol}://${request.hostname}/api/auth/get-session`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch(() => null);

        if (!response || !response.ok) {
          app.logger.warn({}, 'Token validation failed');

          return reply.status(401).send({
            valid: false,
            error: 'Invalid or expired token',
          });
        }

        const sessionData = await response.json();

        if (!sessionData?.user) {
          return reply.status(401).send({
            valid: false,
            error: 'No user associated with token',
          });
        }

        app.logger.info(
          { userId: sessionData.user.id },
          'Token validated successfully'
        );

        return {
          valid: true,
          user: {
            id: sessionData.user.id,
            email: sessionData.user.email,
          },
        };
      } catch (error) {
        app.logger.error({ err: error }, 'Token validation error');

        return reply.status(401).send({
          valid: false,
          error: 'Token validation failed',
        });
      }
    }
  );
}
