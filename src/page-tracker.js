import Vue from 'vue';

import { getRouter, getOptions } from "./install";
import { warn } from "./util";
import pageview from "./api/pageview";
import screenview from "./api/screenview";
import {getTitle} from '@app/utils/title-mixin';

export const trackPage = (to, from, title) => {
  if (to.path === from.path) {
    return;
  }

  const {
    pageTrackerTemplate,
    pageTrackerScreenviewEnabled,
    appName
  } = getOptions();

  let template;
  const customTemplate = pageTrackerTemplate(to, from);

  if (customTemplate) {
    template = customTemplate;
  } else if (pageTrackerScreenviewEnabled) {
    template = {
      app_name: appName,
      screen_name: to.name
    };
  } else {
    template = {
      page_title: title,
      page_path: to.path,
      page_location: window.location.href
    };
  }

  if (pageTrackerScreenviewEnabled && !template.app_name) {
    warn("To use the screenview, add the appName to the plugin options");
    return;
  }

  if (pageTrackerScreenviewEnabled && !template.screen_name) {
    warn("To use the screenview, name your routes");
    return;
  }

  if (pageTrackerScreenviewEnabled) {
    screenview(template);
    return;
  }

  pageview(template);
};

export const init = Router => {
  const { onBeforeTrack, onAfterTrack } = getOptions();

  let isFirstTime = true;

  Vue.mixin({
    mounted() {
      if (!this.$options.title) {
        return;
      }

      if (isFirstTime) {
        isFirstTime = false;
        return;
      }

      const title = getTitle(this);
      const to = Router.currentRoute;
      const from = {
        path: null,
      };

      onBeforeTrack(to, from);
      trackPage(to, from, title);
      onAfterTrack(to, from);
    },
  });
};

export default () => {
  const Router = getRouter();

  if (!Router) {
    return;
  }

  init(Router);
};
