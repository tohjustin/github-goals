 // Checks every 1 second
const INTERVAL = 1;

function helloWorld() {
  let x = 0;
  setInterval(() => {
    console.log(`hello world! (time elapsed: ${x += 1}s)`); // eslint-disable-line no-console
  }, INTERVAL * 1000);
}

helloWorld();
