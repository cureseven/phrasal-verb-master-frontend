import { handle } from '@/server/http';
import { updateReadOnly } from '@/server/readOnly';

export const POST = handle<{ id: string }>(async (req, { params }) => updateReadOnly(req, params, true));
