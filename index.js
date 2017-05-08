(function () {
  var vue;
  var getUrlWithParamValue, duringPopState, getParamValue, newValue, popHandler;
  var pophandlers = [];
  var scheduled = false;
  
  var startLocalSync = function(storageName) {
    return function(vm, path) {
      
      var currentlyUpdating = false;
      window.addEventListener('storage', function(event) {
        if (event.key == storageName + path && !currentlyUpdating) vue.set(vm, event.key.replace(storageName, ''), JSON.parse(event.newValue));
        currentlyUpdating = true
        vm.$nextTick(function() { currentlyUpdating = false; })
      })
      
      var existingValue = localStorage.getItem(storageName+path);
      if (existingValue) vue.set(vm, path, JSON.parse(existingValue));
      
      vm.$watch(path, function(newVal, oldVal) {
        if (currentlyUpdating) return;
        currentlyUpdating = true;
        localStorage.setItem(storageName + path, JSON.stringify(newVal));
        vm.$nextTick(function() { currentlyUpdating = false; })
      },
      {
        deep: true,
        immidiate: true
      });
      
      return function() {
        // Stop syncing, deconstruct, etc.
      }
    }
  }

  
  
  
  getUrlWithParamValue = function(paramName, paramValue) {
    var pattern, url;
    if (paramValue && typeof(paramValue) == 'object') {
      paramValue = JSON.stringify(paramValue);
    }
    url = window.location.toString();
    pattern = new RegExp('\\b(' + paramName + '=).*?(&|$)');
    if (url.search(pattern) >= 0) {
      if (!paramValue) return url.replace(pattern, '').replace('&&','&').replace('?&','?');
      else return url.replace(pattern, '$1' + encodeURIComponent(paramValue) + '$2');
    } else {
      if (!paramValue) return url;
      else return (url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + encodeURIComponent(paramValue)).replace('&&','&').replace('?&','?');
    }
  };

  getParamValue = function(paramName) {
    var pattern, result, url;
    url = window.location.toString();
    pattern = new RegExp('\\b' + paramName + '=(.*?)(&|$)');
    result = pattern.exec(url);
    if ((result != null ? result.length : void 0) >= 1) {
      var val = decodeURIComponent(result[1]);
      try {
        val = JSON.parse(val);
      }
      catch (e) {
        // Wasnt json. Do nothing.
      }
      if (val == 'false') return false;
      if (typeof val == 'undefined') return null;
      return val;
    }
  };


  var getUrlSyncFn = function(param, noHistory) {
    if (typeof param == 'object') {
      noHistory = param.noHistory,
      param = param.param
    } 
    return function(vm, path) {
      initialUrlValue = getParamValue(param);
      if (initialUrlValue) {
        vue.set(vm, path, initialUrlValue);
      }
      else {
        var newUrl = getUrlWithParamValue(param, vm[path]);
        history.replaceState(null, '', newUrl);
      }

      vm.$watch(path, function(val1, val2) {
        var newUrl;

        if (duringPopState) {
          return;
        }
        newUrl = getUrlWithParamValue(param, val1);
        
        if (noHistory) {
          history.replaceState(null, '', newUrl);
        }
        else {
          history.pushState(null, '', newUrl);  
        }
        
        pophandlers.map(function(handler) { 
          handler() 
        })
      }, {deep: true, sync: true});
      
      var handler = function() {
        // if (duringPopState) return;
        duringPopState = true;
        newValue = getParamValue(param);
        vue.set(vm, path, newValue);
        vm.$nextTick(function() {
          duringPopState = false;
        });
      };
      pophandlers.push(handler)  
      
      
      return function() {
      
      }
    }
  }
  


  var sync = {
    destroyed: function() {
      this._stopSyncFuncs.map(function(fn) {fn()});
    },
    asyncData: function() {},
    created: function() {
      if (!vue) {
        console.warn('[vue-sync] not installed!')
        return
      }
      var vm = this;
      vm._stopSyncFuncs = []
      
      // handle `url` options
      var urlOptions = this.$options.url;
      if (typeof urlOptions == 'function') urlOptions = urlOptions();
      if (urlOptions) {
        // On the server-side, check if we have a $route, and init the data from there.
        if (typeof window == 'undefined' && typeof vm.$route !== 'undefined') {
          Object.keys(urlOptions).map(function(key) {
            if (!urlOptions.hasOwnProperty(key)) return;
            var val = decodeURIComponent(vm.$route.query[key]);
            try {
              val = JSON.parse(val);
            }
            catch (e) {
              // Wasnt json. Do nothing.
            }
            vue.set(vm, key, val)
          })
        }
        else if (typeof window !== 'undefined') {
          window.addEventListener('popstate', function() {
            pophandlers.map(function(h) { h() });
          });
          Object.keys(urlOptions).map(function(key) {
            if (urlOptions.hasOwnProperty(key)) {
              var syncFn = getUrlSyncFn(urlOptions[key])
              vm._stopSyncFuncs.push(syncFn(vm, key));
            } 
          })
        }
        else {
          console.log('[vue-sync] If you run this server-side, please make available a global `context` object with the request query params.')
        }
      }
    }
  }

  var api = {
    mixin: sync,
    install: function (Vue, options) {
      vue = Vue
      Vue.options = Vue.util.mergeOptions(Vue.options, sync)
    }
  }

  if(typeof exports === 'object' && typeof module === 'object') {
    module.exports = api
  } else if(typeof define === 'function' && define.amd) {
    define(function () { return api })
  } else if (typeof window !== 'undefined') {
    window.VueSync = api
  }
})()
