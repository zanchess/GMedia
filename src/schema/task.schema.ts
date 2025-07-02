export const TaskSchema = {
  type: 'object',
  required: ['title', 'status'],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
  },
};

export const UpdateTaskSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
  },
};

export const IdParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 24, maxLength: 24 },
  },
  required: ['id'],
};

export const StatusQuerySchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['pending', 'in_progress', 'done'] },
  },
};
