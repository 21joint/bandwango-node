const pm2 = require('pm2');
const pkg = require('./package');

let instances = process.env.WEB_CONCURRENCY || -1;
let maxMemory = process.env.WEB_MEMORY || 512;

console.log(`Starting server with ${instances} instances.`);
console.log(`You should see ${instances} random numbers logged.`);

const options = {
    name: pkg.name,
    script: pkg.main,
    exec_mode: 'cluster',
    instances: instances,
    max_memory_restart : `${maxMemory}M`,
};

pm2.connect((err) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    pm2.start(options, (err) => {
        if (err) return console.error('Error while launching applications', err.stack || err);
        console.log('PM2 and application has been succesfully started');

        // Display logs in standard output
        pm2.launchBus((err, bus) => {
            console.log('[PM2] Log streaming started');

            bus.on('log:out', function(packet) {
                console.log('[App:%s] %s', packet.process.name, packet.data);
            });

            bus.on('log:err', function(packet) {
                console.error('[App:%s][Err] %s', packet.process.name, packet.data);
            });
        });
    });
});