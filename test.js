import createPubChan from './src/lib';

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
