(function () {
  'use strict';

  angular
    .module('unilySummaryApp')
    .component('unilySummary', {
      templateUrl: 'app/components/unily-summary/unily-summary.template.html',
      controller: UnilySummaryController
    });

  function UnilySummaryController(SummarizationService, SlackService, DEFAULT_SUMMARY_LENGTH) {
    var vm = this;

    vm.$onInit = function onInit() {
      vm.formData = {
        contentType: 'News',
        title: '',
        body: '',
        link: '',
        channel: '#comms',
        token: '',
        prompt: 'Please review this Unily post and reply with questions or approvals.',
        length: DEFAULT_SUMMARY_LENGTH,
        dryRun: true
      };
      vm.summary = '';
      vm.status = null;
    };

    vm.generate = function generate() {
      vm.summary = SummarizationService.summarize({
        title: vm.formData.title,
        body: vm.formData.body,
        length: vm.formData.length
      });

      if (vm.formData.prompt && vm.summary) {
        vm.formData.prompt = vm.formData.prompt.trim();
      }
      vm.status = null;
    };

    vm.send = function send() {
      if (!vm.summary) {
        vm.generate();
      }

      vm.sending = true;
      vm.status = null;

      SlackService.sendSummary({
        title: vm.formData.title,
        contentType: vm.formData.contentType,
        summary: vm.summary,
        prompt: vm.formData.prompt,
        link: vm.formData.link,
        channel: vm.formData.channel,
        token: vm.formData.token,
        dryRun: vm.formData.dryRun
      }).then(function (response) {
        vm.status = {
          type: 'success',
          message: vm.formData.dryRun
            ? 'Dry run: review the Slack payload below before sending.'
            : 'Posted to Slack successfully.'
        };
        vm.lastPayload = response.payload || response;
      }).catch(function (error) {
        vm.status = {
          type: 'error',
          message: error.message || 'Unable to send message to Slack.'
        };
      }).finally(function () {
        vm.sending = false;
      });
    };
  }
})();
