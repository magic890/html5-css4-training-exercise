(function(){

'use strict';

angular.module('H5C4Controllers')
    .controller('TodoCtrl', ['$scope', function($scope) {
        console.log("TodoCtrl loaded");

        $scope.todoList = [
            {
                id: 1,
                label: "Farina",
                checked: false
            },
            {
                id: 2,
                label: "Grano",
                checked: false
            },
            {
                id: 3,
                label: "Pasta",
                checked: false
            },
            {
                id: 4,
                label: "Mozzarella",
                checked: false
            }
        ];

        $scope.addTodo = function(){
            $scope.todoList.push(
                {
                    id: Math.max.apply(
                        null,
                        $scope.todoList.map(function(e){
                            return e.id;
                        })
                    ) + 1,
                    label: $scope.newTodoValue,
                    checked: false
                }
            );
        }

    }]);

})();
