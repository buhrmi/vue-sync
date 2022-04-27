# vue-sync

> NOTE: Check out [nuxt-url-sync](https://github.com/buhrmi/nuxt-url-sync) to for a version optimized for nuxt

Sync Vue Component state with browser URL params

Makes for easy bookmarking and sharing of vue state using the browser URL, also works server-side when using vue-router.

## Install

### With NPM

    $ npm install --save vue-sync

```js
VueSync = require('vue-sync')
Vue.use(VueSync)
```

## Usage

Sync Vue state with parameters in the browser url. Makes for very easy bookmarking and sharing of vue state.

The below example will sync the value of `currentPage` with the URL parameter value `page`.

```js
new Vue({
  data: function() {
    return {
      currentPage: this.currentPage || 'users' // initialize this component data with the url param or set 'users' as a default
    }
  },
  // sync with URL `http://example.com/?page=amazing-title`
  url: {
    currentPage: 'page'
  }
})
```

If you don't want to add a browser history entry when the value changes, use the `noHistory` option.
  
```js
new Vue({
  data: function() {
    return {
      currentPage: this.currentPage || 'users'
    }
  },
  url: {
    currentPage: {
      param: 'page',
      noHistory: true
    }
  }
})
```
