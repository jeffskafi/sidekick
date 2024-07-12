# Synergy

Synergy is a powerful project management and AI agent collaboration platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- User authentication with Clerk
- Project creation and management
- AI agent canvas for visual collaboration
- Task and story management
- Subscription handling with Stripe integration
- Responsive design with dark mode support

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Drizzle ORM with PostgreSQL
- Clerk for authentication
- Stripe for payments
- Konva for canvas rendering

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables

4. Set up the database:
   ```
   pnpm db:push
   ```

5. Run the development server:
   ```
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `src/app`: Next.js app router pages
- `src/_components`: React components
- `src/server/db`: Database schema and configuration
- `src/styles`: Global styles and Tailwind configuration
- `src/lib`: Utility functions and hooks

## Database Schema

The project uses Drizzle ORM with PostgreSQL. The main entities are:

- Projects
- Agents
- Crews
- Stories
- Tasks
- Skills

## Authentication

Authentication is handled by Clerk. The middleware ensures that protected routes are only accessible to authenticated users

## Deployment

The project is configured for deployment on Vercel. Make sure to set up the required environment variables in your Vercel project settings.

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

[MIT License](LICENSE)
