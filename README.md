# vue-sync

Sync Vue Component state with:

* **URL Parameters**:
  Makes for easy bookmarking and sharing of vue state using the browser URL
* (TODO) **Local Storage**:
  Easily syncs vue state across multiple browser tabs
* (TODO) **Global State**:
  Simple shared state without the Vuex jazz.

## Install

    $ npm install vue-sync
  
### Sync Methods

#### Browser URL

Sync Vue state with parameters in the browser url. Makes for very easy bookmarking and sharing of vue state.

The below example will sync the value of `currentPage` with the URL parameter value `page`.

    new Vue({
      data: {
        currentPage: 'users'
      },
      // sync with URL `http://example.com/?page=amazing-title`
      url: {
        currentPage: 'page'
      }
    })


If you don't want to add a browser history entry when the value changes, use the `noHistory` option.
  
    new Vue({
      data: {
        currentPage: 'users'
      },
      url: {
        currentPage: {
          param: 'page',
          noHistory: true
        }
      }
    })



#### Local Storage (TODO)

Sync state with local storage. This will keep vue data in sync between multiple browser tabs and restore the data when reloading the page.
    
    new Vue({
      data: {
        draft: 'My important memo'
      },
      local: {
        draft: 'app_data' // in this example, app_data is the namespace
      }
    })
    
#### Global State (TODO)

Sync the value of `username` property of this compenent with the global `username` property. 

    new Vue({
      global: {
        username: 'username'
      }
    })
