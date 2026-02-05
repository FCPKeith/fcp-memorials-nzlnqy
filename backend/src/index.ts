import { createApplication } from "@specific-dev/framework";
import * as schema from './db/schema.js';
import { registerMemorialRoutes } from './routes/memorials.js';
import { registerMemorialRequestRoutes } from './routes/memorial-requests.js';
import { registerUploadRoutes } from './routes/upload.js';
import { registerAdminRoutes } from './routes/admin.js';

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable storage for file uploads
app.withStorage();

// Enable authentication for admin endpoints
app.withAuth();

// Register route modules
// IMPORTANT: Always use registration functions to avoid circular dependency issues
registerMemorialRoutes(app, app.fastify);
registerMemorialRequestRoutes(app, app.fastify);
registerUploadRoutes(app, app.fastify);
registerAdminRoutes(app, app.fastify);

await app.run();
app.logger.info('Application running');
