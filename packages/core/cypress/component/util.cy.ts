import { patchObject } from "$thispkg/util/datastructure";

describe('util', () => {
  it('patchObject simple', () => {
    const patchee = { hi: 4 };

    const patcher = { hi: 2 };

    const patched = patchObject(patchee, patcher);
    expect(patched).to.deep.eq({ hi: 2 })
  })

  it('patchObject nesting', () => {
    const patchee = {
      hi: 4,
      yes: {
        deep: {
          nesting: 'is cool',
          or: 'annoying',
        }
      },
    };

    const patcher = {
      hi: 2,
      yes: {
        deep: {
          nesting: 'is annoying'
        }
      }
    };

    const patched = patchObject(patchee, patcher);
    expect(patched).to.deep.eq({
      hi: 2,
      yes: {
        deep: {
          nesting: 'is annoying',
          or: 'annoying',
        }
      },
    })
  })
})
