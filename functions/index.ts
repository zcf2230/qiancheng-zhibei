import { createSiteContext, createDatabaseClient, requireUser, BackendError, errorResponse } from './_qoder/backend.mjs';
import { createFavorites } from './favorites.mjs';

const handle = createFavorites({ db: createDatabaseClient(), requireUser, BackendError });

Deno.serve(async request => {
  let context;
  try {
    context = createSiteContext(request);
    return await handle(context);
  } catch (error) {
    return errorResponse(error, context?.requestId);
  }
});
