import { app } from './app.js';
import { ENV } from './config/env.js';

app.listen(ENV.PORT, () => {
  console.log(`
  🚀 NBRLY API Server running!
  📍 Port: ${ENV.PORT}
  🌍 Environment: ${ENV.NODE_ENV}
  🔗 URL: http://localhost:${ENV.PORT}
  `);
});
