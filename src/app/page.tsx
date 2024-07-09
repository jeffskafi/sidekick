import Link from "next/link";
import dummyData from "../server/db/dummyData.json";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Command Center Dashboard</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Projects</h2>
          <ul className="space-y-2">
            {dummyData.projects.map((project) => (
              <li key={project.id} className="bg-purple-900 p-4 rounded-lg">
                <h3 className="text-xl font-medium">{project.name}</h3>
                <p className="text-sm text-gray-300">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Agents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dummyData.agents.map((agent) => (
              <li key={agent.id} className="bg-purple-900 p-4 rounded-lg">
                <h3 className="text-xl font-medium">{agent.name}</h3>
                <p className="text-sm text-gray-300">Status: {agent.status}</p>
                <p className="text-sm text-gray-300">Project ID: {agent.projectId}</p>
              </li>
            ))}
          </ul>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Crews</h2>
          <ul className="space-y-2">
            {dummyData.crews.map((crew) => (
              <li key={crew.id} className="bg-purple-900 p-4 rounded-lg">
                <h3 className="text-xl font-medium">{crew.name}</h3>
                <p className="text-sm text-gray-300">Type: {crew.type}</p>
                <p className="text-sm text-gray-300">Project ID: {crew.projectId}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}