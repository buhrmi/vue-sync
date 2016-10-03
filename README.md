# vue-sync

> Attach synchronization to vue data fields and synchronize the values using synchronization strategies.
> Currently there are four different synchronization strategies:
>
> 1. [x] Browser URL: Keep track of vue data in the browser URL and restore vue state when users share the URL or use the browser navigation buttons.
> 2. [X] Native Websockets (experimental): Sync vue data across multiple clients connected to the server.
> 3. [X] Browser local storage: Easily keep vue data in sync between between multiple browser tabs.
> 4. [ ] WebRTC (not yet implemented)

# Note: Only works with Vue 2.0

## Install

    $ npm install vue-sync
  
## Usage

General usage

    VueSync = require('vue-sync')
    Vue.use(VueSync)
    
    new Vue({
      data: {
        someKey: 'someValue'
      },
      sync: {
        someKey: syncStrategy
      }
    })

### Sync Strategies

#### Browser URL

Sync Vue state with parameters in the browser url. Makes for very easy bookmarking and sharing of vue state.

    sync = VueSync.locationStrategy()
    
    new Vue({
      data: {
        currentPage: 'users'
      },
      sync: {
        currentPage: sync('page')
      }
    })

`locationStrategy(parameterName, noHistory = false)`

* `parameterName`: (String) The parameter in the browser URL to use to sync with the Vue key. In the above example, the strategy will sync the value of `currentPage` with an URL that might look something like `http://somedomain.com/somesite/?page=users`
* `noHistory`: (Boolean) Whether or not a browser history entry should be created every time the value changes. This enables or prevents the user to change Vue state using the navigation buttons of the browser.


#### Websockets

Sync state with a websocket server. Still very experimental.

    serverSync = VueSync.websocketStrategy('ws://localhost:8000')
    
    new Vue({
      data: {
        currentPage: 'users',
        users: [{name: 'Stefan'}, {name: 'John'}]
      },
      sync: {
        users: serverSync()
      }
    })

The current implementation of `websocketStrategy` simply sends a JSON message of the format `[key, value]` to the server whenever the state changes. Similarily, when the client receives a message of the form `[key, value]` from the server, the state is updated in the client.

A very simple websocket server that synchronizes vue state accross all connected clients can be run like this:

    var server = require('vue-sync-server')(8000)
    
Check out the [vue-sync-server](http://github.com/buhrmi/vue-sync-server) project for more information.

#### Local Storage

Sync state with local storage. This will keep vue data in sync between multiple browser tabs and restore the data when reloading the page.

    var localSync = VueSync.localStrategy()
    
    new Vue({
      data: {
        draft: 'My important memo'
      },
      sync: {
        draft: localSync('app_data') // in this example, app_data is the namespace
      }
    })

#### WebRTC

Sync state with other browsers (WebRTC)

> Coming soon
