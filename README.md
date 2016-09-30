# vue-sync

> Allows you to synchronize state of your vue components with other places.
> Currently there are plans for different synchronization strategies:
>
> 1. [x] Browser URL 
> 2. [ ] Browser local storage
> 3. [ ] Server API
> 4. [ ] WebRTC

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

Sync state with browser URL

    locationStrategy = VueSync.locationStrategy()
    new Vue({
      data: {
        currentPage: 'users'
      },
      sync: {
        currentPage: locationStrategy('page')
      }
    })
    
`locationStrategy(parameterName, noHistory = false)`

* `parameterName`: (String) The parameter in the browser to sync with the key. For example, `page` will store the state in an URL that looks something like `http://somedomain.com/somesite/?page=users`
* `noHistory`: (Boolean) Whether or not a browser history entry should be created every time the value changes. This enables or prevents the user to change Vue state using the navigation buttons of the browser.


#### Local Storage

Sync state with local storage

> Coming soon

#### Server API

Sync state with a backend API

> Coming soon

#### WebRTC

Sync state with other browsers (WebRTC)

> Coming soon
