(function () {
  'use strict';

  angular
    .module('unilyNewsApp.services.slackWebhook', [])
    .service('SlackWebhookService', SlackWebhookService);

  SlackWebhookService.$inject = ['$http', '$q', '$log'];

  function SlackWebhookService($http, $q, $log) {
    var service = this;

    service.sendSummary = sendSummary;

    /**
     * Sends the article summary to Slack using an incoming webhook.
     *
     * @param {Object} options
     * @param {string} options.webhookUrl - Slack incoming webhook URL.
     * @param {Object} options.article
     * @param {Object} options.summary
     * @returns {Promise<void>}
     */
    function sendSummary(options) {
      if (!options || !options.webhookUrl) {
        return $q.reject(new Error('A Slack webhook URL is required.'));
      }

      var payload = buildPayload(options.article, options.summary);

      return $http
        .post(options.webhookUrl, payload)
        .then(function () {
          $log.info('[SlackWebhookService] Summary posted to Slack.');
        })
        .catch(function (error) {
          $log.error('[SlackWebhookService] Failed to post summary to Slack', error);
          return $q.reject(error);
        });
    }

    function buildPayload(article, summary) {
      var title = (article && article.title) || 'New UNILY news article';
      var permalink = article && article.permalink;

      var text = ['*' + title + '*'];

      if (summary && summary.bullets && summary.bullets.length) {
        summary.bullets.forEach(function (bullet) {
          text.push('• ' + bullet);
        });
      }

      if (permalink) {
        text.push('\nRead more: ' + permalink);
      }

      return {
        text: text.join('\n'),
        unfurl_links: false,
        unfurl_media: false
      };
    }
  }
})();
