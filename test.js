import registry from './src/registry';
import { SUBSCRIBE_ALL } from './src/lib';

const chan = registry.get(Symbol.for('@test'));

process.nextTick(() => {
  console.log('Next Tick');
});

chan
  .subscribe()
  .to(SUBSCRIBE_ALL)
  .do(() => console.log('All'));

const sub = chan
  .subscribe({ async: true })
  .to('test')
  .do(() => {
    console.log('Test Received');
    sub.cancel();
  });

chan
  .broadcast()
  .send()
  .then(() => {
    chan.broadcast('test').send();
  });
