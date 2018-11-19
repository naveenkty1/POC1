(function () {
  'use strict';
  //define first module of application and give name of app : myApp with required import modules  
  angular.module("myApp", ["ui.router", 'ngSanitize'])

    //setting up configuration
    .config(function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');
      $stateProvider
        .state('layout.home', {
          url: '/',
          templateUrl: '../views/dashboard.html',
          controller: 'dashboard',
          controllerAs: 'vm',
        })
        .state('layout.cart', {
          url: '/cart',
          templateUrl: '../views/cart.html',
          resolve: {
            auththenticate: ['$q', 'Authorization', function ($q, Authorization) {
              if (Authorization.authorized != true) {
                return $q.reject("AUTH_REQUIRED");
              } else $q.resolve();
            }]
          }
        })
        .state('layout.men', {
          url: '/product/men',
          templateUrl: '../views/product/product.list.html',
          controller: 'ProductCtrl',
          controllerAs: 'vm'
        })
        .state('layout.women', {
          url: '/product/women',
          templateUrl: '../views/product/product.list.html',
          controller: 'ProductCtrl',
          controllerAs: 'vm'
        })
        .state('layout.kids', {
          url: '/product/kids',
          templateUrl: '../views/product/product.list.html',
          controller: 'ProductCtrl',
          controllerAs: 'vm'
        })
        .state('login', {
          url: '/login',
          templateUrl: '../views/login.html',
          resolve: {
            auththenticate: ['$q', 'Authorization', function ($q, Authorization) {
              if (Authorization.authorized == true) {
                return $q.reject("AUTHORIZED");
              }
            }]
          }
        })
        .state('register', {
          url: '/signup',
          templateUrl: '../views/register.html',
          resolve: {
            auththenticate: ['$q', 'Authorization', function ($q, Authorization) {
              if (Authorization.authorized == true) {
                return $q.reject("AUTHORIZED");
              }
            }]
          }
        })
        .state('layout', {
          url: '',
          templateUrl: '../views/main.html',
          controller: 'main',
          redirectTo: 'layout.home',
        })
        .state('auth', {
          url: 'auth',
          controller: function ($scope, $state, Authorization) {
            Authorization.go('layout.home');
          },
        })
        .state('logout', {
          url: 'logout',
          controller: function ($scope, $state, Authorization) {
            Authorization.clear();
            $state.go('layout.home');
          },
        })
    })

    .run(function ($rootScope, $state, $transitions, Authorization) {
      $transitions.onError({}, function (transition) {
        if (transition.$to().name === 'layout.cart' && transition.error().detail === 'AUTH_REQUIRED') {
          $state.go('login');
        }
        if (transition.$to().name === 'login' && transition.error().detail === 'AUTHORIZED') {
          $state.go('layout.home');
        }
        if (transition.$to().name === 'register' && transition.error().detail === 'AUTHORIZED') {
          $state.go('layout.home');
        }
      });

    })

    .service('Authorization', function ($state) {

      this.authorized = false;
      localStorage["Authentication"] = false;
      this.memorizedState = null;

      var
        clear = function () {
          this.authorized = false;
          localStorage["Authentication"] = this.authorized;
          this.memorizedState = null;
        },

        go = function (fallback) {
          this.authorized = true;
          localStorage["Authentication"] = this.authorized;
          var targetState = this.memorizedState ? this.memorizedState : fallback;
          $state.go(targetState);
        };

      return {
        authorized: this.authorized,
        memorizedState: this.memorizedState,
        clear: clear,
        go: go
      };
    });

})();

(function () {
  'use strict';
  //defining service in myapp module: dashboard service with required packages called http
  angular.module('myApp')
    .service('dashboardService', function ($http) {
      var dashboardService = this;
      //set http requrest header 
      $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

      //service method 
      dashboardService.getProductList = () => {
        //http get call.return type promise.
        return $http.get('../../data/ListData.json');
      }

    });
})();


(function () {
  'use strict';
  //defining controler in myApp module with service import
  angular.module("myApp")
    .controller('main', function ($scope) {
      $scope.isAuthentication = localStorage["Authentication"];
    })
})();

(function () {
  'use strict';
  //defining controller in myApp module with service import
  angular.module("myApp")
    .controller('dashboard', function (dashboardService, $filter) {
      var vm = this;

      //defined two-way binding  variable
      vm.ListData = [];
      vm.colorData = ["Red", "Black", "White", "Blue", "Green", "Purple", "Yellow"];
      vm.sizeData = ["3Y", "4Y", "5Y", "6Y", "7Y", "5W", "6W", "7W", "10M", "11M", "12M", "13M"];
      vm.styleData = ["Casual", "Sports"];
      vm.color = "";
      vm.size = "";
      vm.style = "";
      //defined controller method 
      vm.getProduct = () => {
        //calling service method
        dashboardService.getProductList().then((res) => {
          vm.ListData = res.data.objects;

        }).catch((err) => {
          console.error(err);
        })
      }
      vm.getFilterProduct = () => {

        dashboardService.getProductList().then((res) => {
          vm.ListData = res.data.objects;
          if (vm.color != '') {
            vm.ListData = $filter('filter')(vm.ListData, {
              metadata: {
                color: vm.color
              }
            });
          }
          if (vm.size != '') {
            vm.ListData = $filter('filter')(vm.ListData, {
              metadata: {
                case_size: vm.size
              }
            });
          }
          if (vm.style != '') {
            vm.ListData = $filter('filter')(vm.ListData, {
              category: vm.style
            });
          }
        }).catch((err) => {
          console.error(err);
        })
      }
    })
})();

$(window).scroll(function () {
  if ($(this).scrollTop() >= 50) { // If page is scrolled more than 50px
    $('#return-to-top').fadeIn(200); // Fade in the arrow
  } else {
    $('#return-to-top').fadeOut(200); // Else fade out the arrow
  }
});

$('body').on("click", "#return-to-top", function () { // When arrow is clicked
  $('body,html').animate({
    scrollTop: 0 // Scroll to top of body
  }, 500);
});