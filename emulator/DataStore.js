const {observable, toJS, observe} = require('mobx');
const {forEach} = require('lodash');
const {nodes} = require('./NodeStore');
const {defaultUuid} = require('./Emulator');


const uuids = observable.map({});
const createDb = uuid => uuids.set(uuid, observable.map({}));
const retrieveDb = uuid => { 
  
    if(!uuids.has(uuid)) {
        createDb(uuid);
    };

    return uuids.get(uuid);

};


const respondSuccess = (uuid, request_id, ws) => {
    if (ws) {
        ws.send(JSON.stringify(
            {
                msg: 'setup complete',
                'response-to': request_id
            }
        ));
    } else {
        process.env.emulatorQuiet ||
            console.log(`******* SETUP: createDB ${uuid} *******`);
    }
};

const respondError = (uuid, request_id, ws) => {
    if (ws) {
        ws.send(JSON.stringify(
            {
                error: `Sorry, the uuid, ${uuid}, is already taken.`,
                'response-to': request_id
            }
        ));
    } else {
        process.env.emulatorQuiet ||
            console.log(`******* SETUP: ${uuid} in already in uuids ********`);
    }
};

module.exports = {

    uuids,

    read: ({'db-uuid':uuid, 'request-id': request_id, data:{key}}, ws) => {
        let data = retrieveDb(uuid);

        if(data.has(key)) {

            ws.send(JSON.stringify(
                {
                    cmd: 'update',
                    data:
                        {
                            key,
                            value: data.get(key)
                        },
                    'response-to': request_id
                }
            ));

        } else {

            ws.send(JSON.stringify(
                {
                    error: `Key "${key}" not in database.`,
                    'response-to': request_id
                }
            ));

        }
    },

    create: ({'db-uuid':uuid, 'request-id': request_id, data:{key, value}}, ws) => {

        let data = retrieveDb(uuid);


        if(data.has(key)) {

            ws.send(JSON.stringify(
                {
                    error: `Key '${key}' already in database.`,
                    'response-to': request_id
                }
            ));

            return;

        }

        data.set(key, value);

        ws.send(JSON.stringify(
            {
                'response-to': request_id
            }
        ));
    },

    update: ({'db-uuid':uuid, 'request-id': request_id, data:{key, value}}, ws) => {

        let data = retrieveDb(uuid);


        if(!data.has(key)) {

            ws.send(JSON.stringify(
                {
                    error: `Key '${key}' not in database.`,
                    'response-to': request_id
                }
            ));

            return;

        }

        data.set(key, value);

        ws.send(JSON.stringify(
            {
                'response-to': request_id
            }
        ));
    },

    has: ({'db-uuid':uuid, 'request-id': request_id, data:{key}}, ws) => {

        let data = retrieveDb(uuid);

        ws.send(JSON.stringify(
            {
                data:
                    {
                        'key-exists': data.has(key)
                    },
                'response-to': request_id
            }
        ));
    },

    'delete': ({'db-uuid':uuid, 'request-id': request_id, data:{key}}, ws) => {

        let data = retrieveDb(uuid);

        if(data.has(key)) {

            data.delete(key);

            ws.send(JSON.stringify(
                {
                    'response-to': request_id
                }
            ));

        } else {

            ws.send(JSON.stringify(
                {
                    error: `Key "${key}" not in database.`,
                    'response-to': request_id
                }
            ));

        }

    },

    keys: ({'db-uuid': uuid, 'request-id': request_id}, ws) => {
        let data = retrieveDb(uuid);

        ws.send(JSON.stringify(
            {
                data: {
                    value: data.keys()
                },
                'response-to': request_id
            }
        ));

    },

    getData: (uuid = defaultUuid) =>
        retrieveDb(uuid),

    setData: (uuid = defaultUuid, obj) => {
        let data = retrieveDb(uuid);
        data.clear();
        data.merge(obj);
    }
};
