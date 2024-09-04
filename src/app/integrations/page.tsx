import React from "react";
import Link from "next/link";
import { getIntegrations } from "~/server/actions/integrations/integrationGlobalActions";

const INTEGRATIONS_CONFIG = [
  { name: "Google", provider: "oauth_google", url: "https://developers.google.com/docs" },
  { name: "GitHub", provider: "oauth_github", url: "https://docs.github.com/en" },
];

export default async function IntegrationsPage() {
  const connectedIntegrations = await getIntegrations();
  // const googleCalendarEvents = await getGoogleCalendarEvents();

  const integrationsList = INTEGRATIONS_CONFIG.map(({ name, provider, url }) => ({
    name,
    description: `View ${name} docs`,
    url,
    available: connectedIntegrations.some(integration => integration?.provider === provider),
  }));

  return (
    <div>
      <p className="mb-8 text-lg">
        Connect Sidekick with your favorite tools and services.
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrationsList.map((integration) => (
          <div key={integration.name}>
            <Link
            href={integration.url}
            key={integration.name}
            className="block rounded-lg border p-6 transition-shadow hover:shadow-md"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="mb-2 text-xl font-semibold">{integration.name}</h2>
            <p className="text-gray-600">{integration.description}</p>
              <p>{integration.available ? "Connected" : "Not connected"}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
