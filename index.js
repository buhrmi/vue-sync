(function () {
  var locationStrategy = function() {
    
    var changeUrl, duringPopState, findParam, newValue, popHandler;
    changeUrl = function(paramName, paramValue) {
      var pattern, url;
      url = window.location.toString();
      pattern = new RegExp('\\b(' + paramName + '=).*?(&|$)');
      if (url.search(pattern) >= 0) {
        return url.replace(pattern, '$1' + paramValue + '$2');
      } else {
        return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
      }
    };

    findParam = function(paramName) {
      var pattern, result, url;
      url = window.location.toString();
      pattern = new RegExp('\\b' + paramName + '=(.*?)(&|$)');
      result = pattern.exec(url);
      if ((result != null ? result.length : void 0) >= 1) {
        var val = decodeURIComponent(result[1]);
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
            vm.$set(path, newValue);
          }
          vm.$nextTick(function() {
            duringPopState = false;
          });
        };  

        window.addEventListener('popstate', popHandler);
        
        newValue = findParam(param);

        if (newValue) {
          vm.$set(path, newValue);
        }
        else {
          var newUrl = changeUrl(param, vm.$get(path));
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
        });
        return function() {
          // STOP syncing
        }
      }
    }
  }
  


  var vue // lazy bind

  var sync = {
    created: function () {
      if (!vue) {
        console.warn('[vue-sync] not installed!')
        return
      }
    },
    compiled: function() {
      var syncOptions = this.$options.sync;
      if (typeof syncOptions == 'function') syncOptions = syncOptions();
      if (syncOptions) {
        for (var key in syncOptions) {
          if (syncOptions.hasOwnProperty(key)) {
            var syncFn = syncOptions[key]
            var stopFunc = syncFn(this, key);
          } 
        }   
      }
    }
  }

  var api = {
    locationStrategy: locationStrategy,
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
