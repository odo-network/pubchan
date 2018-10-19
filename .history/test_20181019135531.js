import registry from './src/registry';

const chan = registry.get(Symbol.for('@test'));

process.nextTick(() => {
  console.log('Next Tick');
});

chan
  .subscribe({ async: true })
  .to('test')
  .do(() => {
    console.log('Test Received');
  });

chan.emit('test').send();
