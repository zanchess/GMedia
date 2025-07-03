import { FastifyRequest, FastifyReply } from 'fastify';
import sanitizeHtml from 'sanitize-html';

type SanitizableValue = string | number | boolean | null | undefined;
type SanitizableObject = { [key: string]: SanitizableValue | SanitizableObject | SanitizableArray };
type SanitizableArray = Array<SanitizableValue | SanitizableObject | SanitizableArray>;
type SanitizableInput = SanitizableValue | SanitizableObject | SanitizableArray;

function sanitizeStringsDeep(obj: SanitizableInput): SanitizableInput {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeStringsDeep);
  } else if (obj && typeof obj === 'object') {
    const sanitized: SanitizableObject = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeStringsDeep(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
}

export function sanitizeInputBody(request: FastifyRequest, reply: FastifyReply, done: () => void) {
  if (request.body && typeof request.body === 'object') {
    request.body = sanitizeStringsDeep(request.body as SanitizableInput);
  }
  done();
}
