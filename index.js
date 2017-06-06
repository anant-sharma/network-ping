'use strict';

const EventEmitter = require('events').EventEmitter;
const spawn = require('child_process').spawn;
const rl = require('readline');

const RE_SUCCESS_LINUX = /bytes from/i;
const RE_SUCCESS_WIN = /Reply from/i;

module.exports = (INTERVAL, IP) => {
    
    var args = ['-v', '-n', '-i', INTERVAL, IP];
    
    if (/^win/.test(process.platform)) {
        args.push('-t');
    }
    
    var proc = spawn('ping', args);
    var rli = rl.createInterface(proc.stdout, proc.stdin);
    var network = new EventEmitter();
    
    network.online = false;

    rli.on('line', function(str) {
        if (RE_SUCCESS_LINUX.test(str) || RE_SUCCESS_WIN.test(str)) {
            if (!network.online) {
                network.online = true;
                network.emit('online');
            }
        }
        else if (network.online) {
            network.online = false;
            network.emit('offline');
        }
    });
    
    return network;
    
};
