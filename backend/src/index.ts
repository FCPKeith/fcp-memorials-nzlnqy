import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import { registerMemorialRoutes } from './routes/memorials.js';
import { registerMemorialRequestRoutes } from './routes/memorial-requests.js';
import { registerUploadRoutes } from './routes/upload.js';
import { registerAdminRoutes } from './routes/admin.js';
import { registerOAuthDebugRoutes } from './routes/oauth-debug.js';
import { registerHealthRoutes } from './routes/health.js';

// Combine schemas for full database type support
const schema = { ...appSchema, ...authSchema };

// Create application with combined schema
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable storage for file uploads
app.withStorage();

// Enable authentication with Apple OAuth support
// Better Auth handles the full OAuth flow automatically with proper error handling
app.withAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:8081",
    "exp://**",  // Expo development URLs
    "https://fcpmemorials.com",
    "https://*.fcpmemorials.com",
  ],
});

// Register route modules
// IMPORTANT: Always use registration functions to avoid circular dependency issues
registerHealthRoutes(app, app.fastify);
registerMemorialRoutes(app, app.fastify);
registerMemorialRequestRoutes(app, app.fastify);
registerUploadRoutes(app, app.fastify);
registerAdminRoutes(app, app.fastify);
registerOAuthDebugRoutes(app, app.fastify);

await app.run();
app.logger.info('Application running with Apple Sign-In OAuth support');
