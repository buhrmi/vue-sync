(function () {
  var vue;

  
  var localStrategy = function() {
    return function(storageName) {
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
          // console.log('adasd', storageName + path, JSON.stringify(newVal));
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
  }
  
  
  var locationStrategy = function() {
    
    var getUrlWithParamValue, duringPopState, getParamValue, newValue, popHandler;
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

    duringPopState = false;

    return function(param, noHistory) {
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
          // manually trigger a popstate event to allow other components pick up the change.
          dispatchEvent(new PopStateEvent('popstate', { state: null }));
        }, {deep: true, sync: true});
        
        popHandler = function() {
          duringPopState = true;
          newValue = getParamValue(param);
          vue.set(vm, path, newValue);
          vm.$nextTick(function() {
            duringPopState = false;
          });
        };  
        
        window.addEventListener('popstate', popHandler);
        return function() {
          window.removeEventListener('popstate', popHandler)
        }
      }
    }
  }
  

  var sync = {
    created: function () {
      if (!vue) {
        console.warn('[vue-sync] not installed!')
        return
      }
    },
    destroyed: function() {
      this._stopSyncFuncs.map(function(fn) {fn()});
    },
    created: function() {
      var urlOptions = this.$options.url;
      var urlSync = locationStrategy()
      var vm = this;
      vm._stopSyncFuncs = []
      if (typeof urlOptions == 'function') urlOptions = urlOptions();
      if (urlOptions) {
        Object.keys(urlOptions).map(function(key) {
          if (urlOptions.hasOwnProperty(key)) {
            var syncFn = urlSync(urlOptions[key])
            vm._stopSyncFuncs.push(syncFn(vm, key));
          } 
        })
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
