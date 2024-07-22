| Field Name | Type | Description |
|------------|------|-------------|
| task | string | The main task to be accomplished |
| description | string | Detailed description of the task |
| overall_goal | string | The broader objective of the task |
| estimated_total_time | string | Estimated total time to complete all steps |
| target_completion_date | string (date-time) | Target date and time for completing the entire task |
| knowledge_graph | object | Semantic representation of task relationships |
| ├─ nodes | array of objects | Nodes in the knowledge graph |
| └─ edges | array of objects | Edges in the knowledge graph |
| steps | array of objects | List of steps to complete the task |
| ├─ id | string | Unique identifier for the step |
| ├─ description | string | Description of the step |
| ├─ estimated_time | string | Estimated time to complete the step |
| ├─ priority | integer | Priority of the step (1 being highest) |
| ├─ dependencies | array of strings | IDs of steps that must be completed before this one |
| ├─ temporal_constraints | array of objects | Temporal relationships with other steps |
| ├─ causal_effects | array of objects | Potential effects of completing this step |
| ├─ success_criteria | string | Criteria for considering this step complete |
| ├─ subtasks | array of objects | List of smaller tasks within this step |
| ├─ resources | array of strings | Tools or information needed for this step |
| ├─ estimated_start_time | string (date-time) | Estimated start time for this step |
| ├─ estimated_end_time | string (date-time) | Estimated end time for this step |
| ├─ skills_required | array of strings | Skills needed to complete this step |
| ├─ automation_potential | string (enum) | Potential for automating this step |
| ├─ progress | integer | Percentage of step completed |
| ├─ needs_human_input | boolean | Indicates whether human input is required |
| ├─ input_parameters | array of objects | List of input parameters required |
| ├─ questions | array of strings | Questions to ask for human input |
| ├─ feedback | string | Feedback on the step for future improvement |
| └─ pddl_representation | string | PDDL representation of the step |
| execution_plan | object | Generated execution plan for the task |
| ├─ plan_id | string | Unique identifier for the plan |
| ├─ generated_at | string (date-time) | When the plan was generated |
| └─ steps | array of objects | Planned execution details for each step |