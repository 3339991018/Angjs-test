(function () {
  'use strict';

  angular.module('unilySummaryApp').service('SummarizationService', SummarizationService);

  function SummarizationService(DEFAULT_SUMMARY_LENGTH) {
    var service = this;

    service.summarize = function summarize(payload) {
      payload = payload || {};
      var text = [payload.title, payload.body].filter(Boolean).join(' — ').trim();
      if (!text) {
        return '';
      }

      var cleaned = text.replace(/\s+/g, ' ').replace(/([.?!])(?=\w)/g, '$1 ');
      var targetLength = Number(payload.length) || DEFAULT_SUMMARY_LENGTH;
      var words = cleaned.split(/\s+/);

      if (words.length <= targetLength) {
        return cleaned;
      }

      var clipped = words.slice(0, targetLength).join(' ');
      return clipped + '…';
    };
  }
})();
