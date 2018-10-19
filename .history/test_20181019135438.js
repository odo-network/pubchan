import createPubChan from './src/registry';

const chan = createPubChan();

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
