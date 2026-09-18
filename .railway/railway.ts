import { defineRailway, preserve, project, service } from "railway/iac";

// This repository manages only its own resources in the environment. Other
// repositories export their own partial name.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "rugradar";

export default defineRailway(() => {
  const rugradar = service("rugradar", {
    start: "npm run start",
    // ON_FAILURE is the platform default restart policy, so only the retry count is set.
    deploy: { restartPolicyMaxRetries: 3 },
    // Values live in Railway; this file only declares that they exist.
    env: {
      FARCASTER_HEADER: preserve(),
      FARCASTER_PAYLOAD: preserve(),
      FARCASTER_SIGNATURE: preserve(),
      NEXT_PUBLIC_APP_URL: preserve(),
    },
  });
  return project("rugradar", {
    resources: [rugradar],
  });
});
