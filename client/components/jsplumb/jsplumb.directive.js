angular.module('managerApp').directive('jsplumb', () => ({
  restrict: 'A',
  controller: 'jsplumbCtrl',
  scope: {
    options: '=jsplumb',
    instance: '=jsplumbInstance',
  },
  bindToController: true,
  link: {
    pre(iScope, iElement, iAttrs, $ctrl) {
      // create a jsplumb instance with given options and with directive element as container
      _.set($ctrl, 'instance', jsPlumb.getInstance(angular.extend($ctrl.options || {}, {
        Container: iElement,
      })));

      // avoid jsplumb to draw something when endpoints or connections are added to instance
      $ctrl.instance.setSuspendDrawing(true);

      // set a custom redraw method for jsplumb instance
      _.set($ctrl, 'instance.customRepaint', $ctrl.askForRepaint);

      // handle window resize
      const onResizePage = _.debounce(() => {
        if ($ctrl.instance) {
          $ctrl.instance.customRepaint();
        }
      }, 33);
      const windowElt = $(window);

      windowElt.on('resize', onResizePage);

      /**
       * window.on("resize") is not triggered when scrollbar appears and might cause a display bug.
       * We need to watch the window element to handle the scrollbar display. We also need to keep
       * the window.on("resize") binding because it will be triggered as soon as window is resized.
       */
      iScope.$watch(() => ({
        h: windowElt.height(),
        w: windowElt.width(),
      }), onResizePage, true);

      iScope.$on('$destroy', () => {
        if ($ctrl.instance) {
          windowElt.off('resize', onResizePage);
          $ctrl.instance.reset();
        }
        _.set($ctrl, 'instance', null);
      });
    },
  },
}));
