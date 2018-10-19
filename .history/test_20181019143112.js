import registry from './src/registry';
import { ALL } from './src/lib';

const chan = registry.get(Symbol.for('@test'));

process.nextTick(() => {
  console.log('Next Tick');
});

chan
  .subscribe()
  .to(ALL)
  .do(() => console.log('All'));

chan
  .subscribe({ async: true })
  .to('test')
  .do(() => {
    console.log('Test Received');
  });

chan.emit('test').send();
