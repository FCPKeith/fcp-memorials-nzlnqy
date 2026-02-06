import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { App } from '../index.js';

/**
 * OAuth debugging and error handling route
 * This route provides better error handling and logging for OAuth callbacks
 * Especially useful for Apple Sign-In debugging
 */
export function registerOAuthDebugRoutes(app: App, fastify: FastifyInstance) {
  /**
   * GET /api/oauth/apple/callback-debug
   * Debug endpoint for Apple OAuth callback errors
   * Logs detailed information about the OAuth flow
   */
  fastify.get<{
    Querystring: {
      code?: string;
      state?: string;
      error?: string;
      error_description?: string;
      redirect_to?: string;
      expo_client?: string;
      user?: string;
    };
  }>(
    '/api/oauth/apple/callback-debug',
    {
      schema: {
        description: 'Debug endpoint for Apple OAuth callback flow',
        tags: ['oauth'],
        querystring: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            state: { type: 'string' },
            error: { type: 'string' },
            error_description: { type: 'string' },
            redirect_to: { type: 'string' },
            expo_client: { type: 'string' },
            user: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const {
        code,
        state,
        error,
        error_description,
        redirect_to,
        expo_client,
        user,
      } = request.query as {
        code?: string;
        state?: string;
        error?: string;
        error_description?: string;
        redirect_to?: string;
        expo_client?: string;
        user?: string;
      };

      const debugInfo = {
        timestamp: new Date().toISOString(),
        method: 'Apple OAuth Callback Debug',
        hasCode: !!code,
        hasState: !!state,
        hasError: !!error,
        errorMessage: error_description || null,
        redirectTo: redirect_to || null,
        isExpoClient: expo_client === 'true',
        userInfo: user ? JSON.parse(decodeURIComponent(user)) : null,
        allParams: {
          code: code ? `${code.substring(0, 20)}...` : null,
          state: state ? `${state.substring(0, 20)}...` : null,
          error,
          error_description,
          redirect_to,
          expo_client,
        },
      };

      app.logger.info(debugInfo, 'Apple OAuth callback debug information');

      if (error) {
        app.logger.error(
          { error, error_description, debugInfo },
          'Apple OAuth error received'
        );

        return reply.status(400).send({
          success: false,
          error: error,
          description: error_description,
          debugInfo:
            process.env.NODE_ENV === 'development' ? debugInfo : undefined,
        });
      }

      if (!code) {
        app.logger.warn(
          { debugInfo },
          'Apple OAuth callback missing authorization code'
        );

        return reply.status(400).send({
          success: false,
          error: 'missing_code',
          message:
            'Missing authorization code in callback. The OAuth flow may have been cancelled.',
          debugInfo:
            process.env.NODE_ENV === 'development' ? debugInfo : undefined,
        });
      }

      app.logger.info(
        { redirect_to, isExpoClient: expo_client === 'true' },
        'Apple OAuth callback received valid code'
      );

      return reply.status(200).send({
        success: true,
        message: 'Authorization code received. Redirecting to Better Auth...',
        debugInfo:
          process.env.NODE_ENV === 'development' ? debugInfo : undefined,
      });
    }
  );

  /**
   * GET /api/oauth/status
   * Check OAuth configuration status
   */
  fastify.get(
    '/api/oauth/status',
    {
      schema: {
        description: 'Check OAuth configuration and status',
        tags: ['oauth'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              environment: { type: 'string' },
              trustedOrigins: { type: 'array', items: { type: 'string' } },
              appleOAuthConfigured: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const hasAppleConfig =
        !!process.env.APPLE_CLIENT_ID && !!process.env.APPLE_TEAM_ID;

      app.logger.info(
        {
          environment: process.env.NODE_ENV,
          appleConfigured: hasAppleConfig,
        },
        'OAuth status check'
      );

      return {
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        trustedOrigins: [
          'http://localhost:3000',
          'http://localhost:8081',
          'exp://**',
          'https://fcpmemorials.com',
        ],
        appleOAuthConfigured: hasAppleConfig,
        details: {
          message: hasAppleConfig
            ? 'Apple OAuth is configured'
            : 'Apple OAuth is NOT configured. Check APPLE_CLIENT_ID and APPLE_TEAM_ID environment variables.',
        },
      };
    }
  );

  /**
   * POST /api/oauth/validate-token
   * Validate and debug OAuth tokens
   */
  fastify.post<{
    Body: {
      token?: string;
      code?: string;
    };
  }>(
    '/api/oauth/validate-token',
    {
      schema: {
        description: 'Validate OAuth tokens for debugging',
        tags: ['oauth'],
        body: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { token, code } = request.body as {
        token?: string;
        code?: string;
      };

      app.logger.info(
        { hasToken: !!token, hasCode: !!code },
        'Token validation request'
      );

      if (!token && !code) {
        return reply.status(400).send({
          success: false,
          error: 'missing_token_or_code',
          message: 'Please provide either a token or code for validation',
        });
      }

      return reply.status(200).send({
        success: true,
        message: 'Token validation endpoint available',
        note: 'Actual token validation is handled by Better Auth internally',
      });
    }
  );
}
