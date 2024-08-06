import type { TaskNode } from "~/server/db/schema";

export const generateSubtasksUserPrompt = (taskId: string, ancestralChain: TaskNode) => `Generate 3 to 5 new, non-overlapping subtasks for the following task:
        TASK ID: ${taskId}

        TASK HIERARCHY CONTEXT:
        ${JSON.stringify(ancestralChain, null, 2)}

        Rules:
        1. Analyze the task hierarchy to understand the context.
        2. Ensure each subtask is unique and doesn't repeat any existing tasks in the hierarchy.
        3. Make subtasks specific to the immediate parent task, not to higher-level ancestors.
        4. Balance the estimated times so they sum up close to the parent task's total estimated time, if available.
        5. If the parent task is a leaf node, focus on breaking it down into logical next steps.
        6. For tasks higher in the hierarchy, create subtasks that represent major components or phases.

        Provide your response as a valid JSON object adhering to the specified schema.`