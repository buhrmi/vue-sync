# vue-sync

Sync Vue state with params in the browser url or store with local storage

# Note: Only works with Vue 2.0

## Install

    $ npm install vue-sync
  
### Sync Methods

#### Browser URL

Sync Vue state with parameters in the browser url. Makes for very easy bookmarking and sharing of vue state.

    new Vue({
      data: {
        currentPage: 'users'
      },
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


#### Local Storage

Sync state with local storage. This will keep vue data in sync between multiple browser tabs and restore the data when reloading the page.
    
    new Vue({
      data: {
        draft: 'My important memo'
      },
      local: {
        draft: 'app_data' // in this example, app_data is the namespace
      }
    })
