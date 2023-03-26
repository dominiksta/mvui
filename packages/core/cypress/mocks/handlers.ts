import { rest } from 'msw';

export const handlers = [

  rest.get('/test', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([1, 2, 3]),
    )
  }),

]
