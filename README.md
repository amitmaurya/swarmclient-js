# JS setup documentation

1. Install [NodeJS](https://nodejs.org/en/download/package-manager/) - provides desktop JavaScript capabilities and comes bundled with the *Node Package Manager* (npm).

1b. If NodeJS is installed, ensure you are running the latest version.

2. Get our client code (https://github.com/bluzelle/swarmclient-js)

## Installing the Client

```
1. cd swarmclient-js
2. npm install
```

## Building the CRUD app

```
1. cd crud/desktop
2. npm install
3. npm run start
```

## Running the local web app

```
1. cd crud/web
2. npm install
3. npm run dev-compile
```

> Note: any directory containing a `package.json` file is considered an *npm module*. We run `npm install` from that directory to install relevant dependencies.


## Using `bluzelle` in a JS project

```
1. mkdir myProject; cd myProject
2. npm init -f
3. npm install bluzelle
4. vim index.js

> const bluzelle = require('bluzelle');
> ...
> ...

5. node index.js
```


## Starting the emulator

```
cd swarmclient-js
npm install
cd emulator
node Emulator
```


## Running `bluzelle` client end-to-end tests with emulator

```
1. cd swarmclient-js
2. npm install
3. cd bluzelle-js
4. npm install
5. npm run test
```


## Running `bluzelle` client end-to-end tests with daemon

Todo: 
- Add flag specifying WS port
- Find some way to restart the daemon between tests
