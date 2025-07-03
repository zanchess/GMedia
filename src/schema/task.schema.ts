export const TaskSchema = {
  type: 'object',
  required: ['title', 'dueDate'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', minLength: 1, maxLength: 500 },
    dueDate: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
  },
};

export const UpdateTaskSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', minLength: 1, maxLength: 500 },
    status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
  },
};

export const IdParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
  },
  required: ['id'],
};

export const StatusQuerySchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
  },
};
