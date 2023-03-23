import { rx } from '$thispkg';
import { attempt } from '../../../support/helpers';

export const testIfElese = () => attempt(() => {
  const s = new rx.State(0);

  let value = 'initial';
  let value2: string | undefined = 'initial';
  s.derive(s => s === 2)
    .ifelse({ if: 'yes', else: 'no' })
    .subscribe(v => value = v);

  s.derive(s => s === 2)
    .if('hi')
    .subscribe(v => value2 = v);

  expect(value).to.be.eq('no');
  expect(value2).to.be.eq(undefined);

  s.next(1); expect(value).to.be.eq('no'); expect(value2).to.be.eq(undefined);
  s.next(2); expect(value).to.be.eq('yes'); expect(value2).to.be.eq('hi');
  s.next(2); expect(value).to.be.eq('yes'); expect(value2).to.be.eq('hi');
  s.next(3); expect(value).to.be.eq('no'); expect(value2).to.be.eq(undefined);
});

