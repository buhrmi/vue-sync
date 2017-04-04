(function () {
  var vue;
  
  var noopStrategy = function(initOptions) {
    return function(keyOptions) {
      return function(vm, path) {
        
        // Set up incoming changes FROM remote
        
        vm.$watch(path, function(val1, val2) {
          // Send changes to remote
        });
        
        return function() {
          // Stop syncing, deconstruct, etc.
        }
      }
    }
  }
  
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
    
    var changeUrl, duringPopState, findParam, newValue, popHandler;
    changeUrl = function(paramName, paramValue) {
      var pattern, url;
      if (typeof(paramValue) == 'object') {
        paramValue = JSON.stringify(paramValue);
      }
      paramValue = encodeURIComponent(paramValue);
      url = window.location.toString();
      pattern = new RegExp('\\b(' + paramName + '=).*?(&|$)');
      if (url.search(pattern) >= 0) {
        console.log(paramValue)
        if (typeof paramValue == 'undefined') return url.replace(pattern, '');
        else return url.replace(pattern, '$1' + paramValue + '$2');
      } else {
        if (typeof paramValue == 'undefined') return url;
        else return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
      }
    };

    findParam = function(paramName) {
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
        return val;
      }
    };

    duringPopState = false;


    
    return function(param, noHistory) {
      return function(vm, path) {
        popHandler = function() {
          duringPopState = true;
          newValue = findParam(param);
          if (newValue) {
            vue.set(vm, path, newValue);
          }
          vm.$nextTick(function() {
            duringPopState = false;
          });
        };  

        window.addEventListener('popstate', popHandler);
        
        newValue = findParam(param);

        if (newValue) {
          vue.set(vm, path, newValue);
        }
        else {
          var newUrl = changeUrl(param, vm[path]);
          history.replaceState(null, '', newUrl);
        }

        vm.$watch(path, function(val1, val2) {
          var newUrl;
          if (duringPopState) {
            return;
          }
          newUrl = changeUrl(param, val1);
          
          if (noHistory) {
            history.replaceState(null, '', newUrl);
          }
          else {
            history.pushState(null, '', newUrl);  
          }
        }, {deep: true});
        return function() {
          // STOP syncing
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
    mounted: function() {
      var urlOptions = this.$options.url;
      var urlSync = locationStrategy()
      if (typeof urlOptions == 'function') urlOptions = urlOptions();
      if (urlOptions) {
        for (var key in urlOptions) {
          if (urlOptions.hasOwnProperty(key)) {
            var syncFn = urlSync(urlOptions[key])
            var stopFunc = syncFn(this, key);
          } 
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
