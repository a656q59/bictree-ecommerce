import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { createApp } from "./app";

// Process entrypoint: validate env (via the env import), connect to MongoDB,
// then listen. A failed connection exits so the process does not accept
// traffic it cannot persist.
async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
