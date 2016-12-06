$(document).ready(function() {

    // Если в проекте используются встроенные js-плагины от Foundation, разкомментировать
    // $(document).foundation();

    // Полифил для использования Promise (IE)
    if (!window.Promise) {
        window.Promise = Promise;
    }

});