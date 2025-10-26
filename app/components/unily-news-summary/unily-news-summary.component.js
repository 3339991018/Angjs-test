(function () {
  'use strict';

  angular
    .module('unilyNewsApp.components.unilyNewsSummary', [])
    .component('unilyNewsSummary', {
      bindings: {
        siteUrl: '@',
        repositoryId: '@',
        webhookUrl: '@',
        pollInterval: '<?'
      },
      controller: UnilyNewsSummaryController,
      templateUrl: 'components/unily-news-summary/unily-news-summary.html'
    });

  UnilyNewsSummaryController.$inject = ['$log', 'NewsRepositoryService', 'SummarizerService', 'SlackWebhookService'];

  function UnilyNewsSummaryController($log, NewsRepositoryService, SummarizerService, SlackWebhookService) {
    var ctrl = this;

    ctrl.articles = [];
    ctrl.isLoading = true;
    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;
    ctrl.sendToSlack = sendToSlack;

    var disposePolling = angular.noop;

    function onInit() {
      if (!ctrl.siteUrl || !ctrl.repositoryId) {
        $log.error('[unilyNewsSummary] site-url and repository-id attributes are required.');
        ctrl.error = 'Configuration error: missing site URL or repository ID.';
        ctrl.isLoading = false;
        return;
      }

      disposePolling = NewsRepositoryService.pollRepository(
        {
          siteUrl: ctrl.siteUrl,
          repositoryId: ctrl.repositoryId,
          pollInterval: ctrl.pollInterval
        },
        function handleNewArticles(items) {
          $log.info('[unilyNewsSummary] Received %d new articles from UNILY.', items.length);

          var summaries = items.map(function (item) {
            var summary = SummarizerService.createSummary(item);
            return angular.extend({}, item, {
              summary: summary,
              slackStatus: null,
              isPosting: false
            });
          });

          Array.prototype.unshift.apply(ctrl.articles, summaries);
          ctrl.articles = ctrl.articles.slice(0, 25);
        }
      );

      ctrl.isLoading = false;
    }

    function onDestroy() {
      disposePolling();
    }

    function sendToSlack(article) {
      if (!ctrl.webhookUrl) {
        article.slackStatus = {
          state: 'error',
          message: 'Slack webhook URL is not configured.'
        };
        return;
      }

      article.isPosting = true;
      article.slackStatus = null;

      SlackWebhookService
        .sendSummary({
          webhookUrl: ctrl.webhookUrl,
          article: article,
          summary: article.summary
        })
        .then(function () {
          article.slackStatus = {
            state: 'success',
            message: 'Shared to Slack for 30,000 colleagues.'
          };
        })
        .catch(function (error) {
          article.slackStatus = {
            state: 'error',
            message: (error && error.message) || 'Unable to post to Slack.'
          };
        })
        .finally(function () {
          article.isPosting = false;
        });
    }
  }
})();
