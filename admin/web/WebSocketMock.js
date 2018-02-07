const _ = require('lodash');
const fp = require('lodash/fp');
const {Maybe} = require('monet');

const DELAY = 500;
let sockets = [];
let nodes = [];
let maxNodes = 10;
let minNodes = 8;
let baseAddress = 0;


module.exports = SocketBase => class Socket extends SocketBase {

    websocket(wss) {
        wss.on('connection', (ws, req) => {
            sockets.push(ws);

            ws.on('message', req => {
                req = JSON.parse(req);
                setTimeout(() =>
                        commandProcessors[req.cmd](req.data)
                    , DELAY);
            });

            ws.on('close', () => {
                _.remove(sockets, ws);
            })
        })
    }
};


const createNodes = () => {
    let i = 0;
    while (nodes.length < maxNodes) {
        const node = {
            address: `0x${_.padStart((baseAddress++).toString(16), 2, '0')}`,
            available: 1000,
            used: 512,
        };
        node.updateStorageUsed = updateStorageUsed(node);

        nodes.push(node);
        setTimeout(() => {
            sendToClients('updateNodes', [node]);
        }, (i++) * 600)
        log(`node ${node.address} has connected`);
    }
};



const updateStorageUsed = (node) => {
    let direction = 10;
    return () => {
        direction = node.used < 400 ? 10 : direction;
        direction = node.used > 700 ? -10 : direction;
        node.used += direction;
        return node;
    }
};

const sendToClients = (cmd, data) => sockets.forEach(socket => socket.send(JSON.stringify({cmd: cmd, data: data})));

const updateMessages = () => {
    if (nodes.length) {
        sendToClients('messages', _.times(10, () => (
            {
                srcAddr: getRandomNode().address,
                dstAddr: getRandomNode().address,
                timestamp: new Date().toISOString(),
                body: {something: `sent - ${_.uniqueId()}`}
            }
        )));
    }
};

const log = (message) => {
    sendToClients('log', [{
        timer_no: 1,
        entry_no: _.uniqueId(),
        timestamp: new Date().toISOString(),
        message: message
    }]);
};

const getRandomNode = () => nodes[Math.floor(Math.random() * nodes.length)];

const killANode = () => {
    if (nodes.length) {
        const node = getRandomNode();
        _.remove(nodes, node);
        sendToClients('removeNodes', [node.address]);
        log(`node ${node.address} has died`);
    }
};


const chooseNewLeader = () => {
    Maybe.fromNull(nodes.find(n => n.isLeader))
        .flatMap(node => {
            node.isLeader = false;
            sendToClients('updateNodes', [node]);
        });

    setTimeout(() => Maybe.fromNull(getRandomNode())
        .flatMap(node => {
            node.isLeader = true;
            sendToClients('updateNodes', [node]);
        }), 1000);
};

setInterval(updateMessages, 1000);
setInterval(killANode, 6137);
setInterval(createNodes, 10285);
setInterval(chooseNewLeader, 10000);
setInterval(() => sendToClients('updateNodes', nodes.map(node => node.updateStorageUsed())), 10000);




const commandProcessors = {
    getAllNodes: () => sendToClients('updateNodes', nodes),
    getMaxNodes: () => sendToClients('setMaxNodes', maxNodes),
    getMinNodes: () => sendToClients('setMinNodes', minNodes),
    setMaxNodes: (num) => {
        maxNodes = num;
        sendToClients('setMaxNodes', num);
        log(`Changed max nodes to ${num}`)
    },
    setMinNodes: (num) => {
        minNodes = num;
        sendToClients('setMinNodes', num);
        log(`changed min nodes to ${num}`);
    }
};