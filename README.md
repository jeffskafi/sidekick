# Sidekick

Sidekick is a comprehensive project management platform that combines traditional task management with AI-powered mind mapping and collaboration tools. Built with Next.js, TypeScript, and Tailwind CSS, Sidekick aims to enhance productivity by bridging the gap between idea generation and execution.

## Features

- **User Authentication with Clerk**
  - Secure user accounts and session management.

- **Project Creation and Management**
  - Organize your work into projects for better structure.

- **AI-Powered Mind Mapping**
  - Generate related concepts and ideas using AI to expand your mind maps.
  - Visualize relationships between ideas with an interactive force-directed graph.

- **Task and Subtask Management**
  - Create tasks and break them down into actionable subtasks.
  - Use AI to automatically generate subtasks based on task descriptions.
  - Hierarchical task organization with unlimited nesting.

- **Responsive Design with Dark Mode Support**
  - Enjoy a seamless experience across devices with support for light and dark themes.

- **Subscription Handling with Stripe Integration**
  - Manage premium features and billing through Stripe.

- **Real-Time Collaboration (Planned Feature)**
  - Collaborate with team members in real-time on mind maps and tasks.

## Tech Stack

- **Next.js 14**
  - Server-side rendering and static site generation.

- **TypeScript**
  - Static typing for improved code quality.

- **Tailwind CSS**
  - Utility-first CSS framework for rapid UI development.

- **Drizzle ORM with PostgreSQL**
  - Type-safe database interactions with PostgreSQL.

- **Clerk for Authentication**
  - User authentication and management.

- **Stripe for Payments**
  - Secure and reliable payment processing.

- **OpenAI API Integration**
  - AI functionalities powered by OpenAI's GPT models.

- **React Force Graph**
  - Interactive force-directed graph visualization for mind maps.

## Getting Started

1. **Clone the Repository**

   ```bash
   git clone https://github.com/jeffskafi/sidekick.git
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**

   - Copy `.env.example` to `.env.local`:

     ```bash
     cp .env.example .env.local
     ```

   - Fill in the required environment variables in `.env.local`.

4. **Set Up the Database**

   - Push the database schema:

     ```bash
     pnpm db:push
     ```

5. **Run the Development Server**

   ```bash
   pnpm dev
   ```

6. **Open in Browser**

   - Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

- `src/app`: Next.js application router pages.
- `src/_components`: Reusable React components.
- `src/server/db`: Database schema and configuration.
- `src/styles`: Global styles and Tailwind configuration.
- `src/lib`: Utility functions, hooks, and API integrations.
- `src/prompts`: AI prompt templates for OpenAI API.

## Database Schema

The project uses Drizzle ORM with PostgreSQL. The main entities are:

- **Users**
  - User profiles and authentication data.

- **Projects**
  - Containers for organizing mind maps and tasks.

- **Mind Maps**
  - Nodes and links representing ideas and their relationships.

- **Tasks**
  - Task management with support for subtasks, priorities, and statuses.

- **Subscriptions**
  - Stripe subscription data for managing premium features.

## Authentication

Authentication is handled by Clerk. The middleware ensures that protected routes are only accessible to authenticated users.

## AI Integration

Sidekick leverages OpenAI's GPT models to enhance user productivity:

- **Mind Map Expansion**
  - Automatically generate related concepts based on user input.

- **Subtask Generation**
  - Break down complex tasks into manageable subtasks with AI assistance.

## Deployment

The project is configured for deployment on Vercel. Ensure that you have all required environment variables set in your Vercel project settings.

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**

2. **Create a New Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes and Commit**

   ```bash
   git commit -m 'Add some feature'
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Submit a Pull Request**

## License

This project is licensed under the [MIT License](LICENSE).
