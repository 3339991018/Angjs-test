(function () {
  'use strict';

  angular
    .module('unilyNewsApp', [
      'unilyNewsApp.services.newsRepository',
      'unilyNewsApp.services.summarizer',
      'unilyNewsApp.services.slackWebhook',
      'unilyNewsApp.components.unilyNewsSummary'
    ]);
})();
