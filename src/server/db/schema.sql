CREATE TABLE Workspaces (
    id INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE Projects (
    id INT PRIMARY KEY,
    workspace_id INT,
    name VARCHAR(255),
    FOREIGN KEY (workspace_id) REFERENCES Workspaces(id)
);

CREATE TABLE Skills (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT
);

CREATE TABLE Agents (
    id INT PRIMARY KEY,
    project_id INT,
    name VARCHAR(255),
    status ENUM('Idle', 'Active'),
    x_position FLOAT,
    y_position FLOAT,
    FOREIGN KEY (project_id) REFERENCES Projects(id)
);

CREATE TABLE AgentSkills (
    agent_id INT,
    skill_id INT,
    PRIMARY KEY (agent_id, skill_id),
    FOREIGN KEY (agent_id) REFERENCES Agents(id),
    FOREIGN KEY (skill_id) REFERENCES Skills(id)
);

CREATE TABLE Crews (
    id INT PRIMARY KEY,
    project_id INT,
    name VARCHAR(255),
    type ENUM('Hierarchical', 'Sequential'),
    FOREIGN KEY (project_id) REFERENCES Projects(id)
);

CREATE TABLE CrewAgents (
    crew_id INT,
    agent_id INT,
    PRIMARY KEY (crew_id, agent_id),
    FOREIGN KEY (crew_id) REFERENCES Crews(id),
    FOREIGN KEY (agent_id) REFERENCES Agents(id)
);

CREATE TABLE UserStories (
    id INT PRIMARY KEY,
    project_id INT,
    crew_id INT,
    description TEXT,
    FOREIGN KEY (project_id) REFERENCES Projects(id),
    FOREIGN KEY (crew_id) REFERENCES Crews(id)
);

CREATE TABLE Tasks (
    id INT PRIMARY KEY,
    project_id INT,
    user_story_id INT NULL,
    agent_id INT NULL,
    description TEXT,
    status ENUM('Backlog', 'Todo', 'In Progress', 'Done', 'Failed', 'Blocked'),
    FOREIGN KEY (project_id) REFERENCES Projects(id),
    FOREIGN KEY (user_story_id) REFERENCES UserStories(id),
    FOREIGN KEY (agent_id) REFERENCES Agents(id)
);

CREATE TABLE TaskSkills (
    task_id INT,
    skill_id INT,
    PRIMARY KEY (task_id, skill_id),
    FOREIGN KEY (task_id) REFERENCES Tasks(id),
    FOREIGN KEY (skill_id) REFERENCES Skills(id)
);