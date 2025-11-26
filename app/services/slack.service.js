(function () {
  'use strict';

  angular.module('unilySummaryApp').service('SlackService', SlackService);

  function SlackService($http, $q, SLACK_API_URL) {
    var service = this;

    service.sendSummary = function sendSummary(options) {
      options = options || {};
      if (!options.token && !options.dryRun) {
        return $q.reject(new Error('Slack bot token is required when dry-run mode is disabled.'));
      }

      var summaryText = buildSummaryText(options);
      var payload = buildSlackPayload(options, summaryText);

      if (options.dryRun) {
        return $q.resolve({
          ok: true,
          dryRun: true,
          payload: payload
        });
      }

      var requestConfig = {
        method: 'POST',
        url: SLACK_API_URL,
        headers: {
          'Authorization': 'Bearer ' + options.token,
          'Content-Type': 'application/json; charset=utf-8'
        },
        data: payload
      };

      return $http(requestConfig).then(function (response) {
        if (!response.data || !response.data.ok) {
          return $q.reject(new Error(response.data && response.data.error || 'Unable to post to Slack.'));
        }

        return response.data;
      });
    };

    function buildSummaryText(options) {
      var title = options.title || 'Untitled';
      var contentType = options.contentType || 'update';
      var summary = options.summary || 'No summary generated yet.';
      var prompt = options.prompt || '';
      var link = options.link ? ('\nLink: ' + options.link) : '';

      return 'New ' + contentType + ' published: ' + title + '\n\nSummary: ' + summary + (prompt ? '\n\n' + prompt : '') + link;
    }

    function buildSlackPayload(options, summaryText) {
      var headerText = options.title ? options.title.trim() : 'New Unily update';
      var fields = [];

      fields.push({
        type: 'mrkdwn',
        text: '*Type*\n' + (options.contentType || 'Content')
      });

      if (options.channel) {
        fields.push({
          type: 'mrkdwn',
          text: '*Target channel*\n' + options.channel
        });
      }

      if (options.link) {
        fields.push({
          type: 'mrkdwn',
          text: '*Link*\n' + options.link
        });
      }

      var blocks = [
        {
          type: 'header',
          text: { type: 'plain_text', text: headerText, emoji: true }
        },
        {
          type: 'section',
          fields: fields
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Summary*\n' + (options.summary || 'No summary available yet.')
          }
        }
      ];

      if (options.prompt) {
        blocks.push({
          type: 'section',
          text: { type: 'mrkdwn', text: options.prompt }
        });
      }

      if (options.link) {
        blocks.push({
          type: 'actions',
          elements: [
            {
              type: 'button',
              style: 'primary',
              text: { type: 'plain_text', text: 'Open in Unily', emoji: true },
              url: options.link
            }
          ]
        });
      }

      return {
        channel: options.channel,
        text: summaryText,
        blocks: blocks
      };
    }
  }
})();
