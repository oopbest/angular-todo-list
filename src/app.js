import angular from "angular";
import "bootstrap/dist/css/bootstrap.min.css";
import todoModule from "./todo/todo.module";
import "./style.less";

angular.module("todoApp", [todoModule]);
