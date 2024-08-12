import type { TaskNode } from "~/server/db/schema";

export const generateSubtasksUserPrompt = (taskId: string, taskDescription: string, ancestralChain: TaskNode) => {
        return `Generate 3 to 5 new, non-overlapping subtasks for the following task:
        TASK ID: ${taskId}
        TASK DESCRIPTION: ${taskDescription}

        TASK HIERARCHY CONTEXT:
        ${JSON.stringify(ancestralChain, null, 2)}
`}