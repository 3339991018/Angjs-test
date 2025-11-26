(function () {
  'use strict';

  angular
    .module('unilySummaryApp', [])
    .constant('DEFAULT_SUMMARY_LENGTH', 90)
    .constant('SLACK_API_URL', 'https://slack.com/api/chat.postMessage');
})();
