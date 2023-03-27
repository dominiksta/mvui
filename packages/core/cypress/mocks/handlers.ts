import { sleep } from '$thispkg/util/time';
import { rest } from 'msw';

export const handlers = [

  rest.get('/test', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([1, 2, 3]),
    )
  }),

  rest.get('/first-takes-longer', (() => {
    let isFirst = true;
    return async (_req, res, ctx) => {
      if (isFirst) {
        isFirst = false;
        await sleep(1000);
      }
      return res(
        ctx.status(200),
        ctx.json([1, 2, 3]),
      )
    }
  })()),

]
