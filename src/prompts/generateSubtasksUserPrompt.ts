import type { TaskNode } from "~/server/db/schema";

export const generateSubtasksUserPrompt = (taskId: string, taskDescription: string, ancestralChain: TaskNode) => {
        return `
        TASK ID: ${taskId}
        TASK DESCRIPTION: ${taskDescription}

        TASK HIERARCHY CONTEXT:
        ${JSON.stringify(ancestralChain, null, 2)}
`}