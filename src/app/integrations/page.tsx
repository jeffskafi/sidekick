import React from "react";
import Link from "next/link";
import { getIntegrations } from "~/server/actions/integrations/integrationGlobalActions";

const INTEGRATIONS_CONFIG = [
  { name: "Google", provider: "oauth_google", url: "https://developers.google.com/docs" },
  { name: "Apple", provider: "oauth_apple", url: "https://developer.apple.com/documentation/" },
  { name: "GitHub", provider: "oauth_github", url: "https://docs.github.com/en" },
  { name: "X / Twitter v2", provider: "oauth_twitter", url: "https://developer.twitter.com/en/docs/twitter-api" },
  { name: "Microsoft", provider: "oauth_microsoft", url: "https://docs.microsoft.com/en-us/" },
  { name: "LinkedIn", provider: "oauth_linkedin", url: "https://developer.linkedin.com/docs" },
  { name: "Discord", provider: "oauth_discord", url: "https://discord.com/developers/docs" },
  { name: "TikTok", provider: "oauth_tiktok", url: "https://developers.tiktok.com/doc/" },
  { name: "GitLab", provider: "oauth_gitlab", url: "https://docs.gitlab.com/" },
  { name: "Slack", provider: "oauth_slack", url: "https://api.slack.com/" },
  { name: "Atlassian", provider: "oauth_atlassian", url: "https://developer.atlassian.com/" },
  { name: "Bitbucket", provider: "oauth_bitbucket", url: "https://developer.atlassian.com/bitbucket/" },
  { name: "HubSpot", provider: "oauth_hubspot", url: "https://developers.hubspot.com/docs/api/overview" },
  { name: "Notion", provider: "oauth_notion", url: "https://developers.notion.com/" },
];

export default async function IntegrationsPage() {
  const connectedIntegrations = await getIntegrations();
  console.log("connectedIntegrations", connectedIntegrations)

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
        ))}
      </div>
    </div>
  );
}
