(function () {
  'use strict';

  angular
    .module('unilyNewsApp.services.newsRepository', [])
    .constant('UNILY_NEWS_DEFAULT_PAGE_SIZE', 10)
    .service('NewsRepositoryService', NewsRepositoryService);

  NewsRepositoryService.$inject = ['$http', '$q', '$log', '$timeout', 'UNILY_NEWS_DEFAULT_PAGE_SIZE'];

  function NewsRepositoryService($http, $q, $log, $timeout, defaultPageSize) {
    var service = this;

    service.fetchLatest = fetchLatest;
    service.pollRepository = pollRepository;

    /**
     * Fetches the latest entries from a UNILY news repository.
     *
     * @param {Object} options
     * @param {string} options.siteUrl - Base URL of the UNILY tenant.
     * @param {string} options.repositoryId - Identifier of the news repository.
     * @param {number} [options.pageSize] - Number of entries to retrieve.
     * @param {string} [options.sinceToken] - Optional token to fetch entries after.
     * @returns {Promise<{items: Array, continuationToken: string|null}>}
     */
    function fetchLatest(options) {
      if (!options || !options.siteUrl || !options.repositoryId) {
        return $q.reject(new Error('siteUrl and repositoryId are required.'));
      }

      var pageSize = options.pageSize || defaultPageSize;
      var endpoint = [
        options.siteUrl.replace(/\/$/, ''),
        'api',
        'news',
        options.repositoryId
      ].join('/');

      var params = {
        pageSize: pageSize
      };

      if (options.sinceToken) {
        params.since = options.sinceToken;
      }

      return $http
        .get(endpoint, { params: params })
        .then(function (response) {
          if (!response.data || !angular.isArray(response.data.items)) {
            throw new Error('Unexpected response shape from UNILY repository endpoint.');
          }

          return {
            items: response.data.items,
            continuationToken: response.data.continuationToken || null
          };
        })
        .catch(function (error) {
          $log.error('[NewsRepositoryService] Failed to load news entries', error);
          return $q.reject(error);
        });
    }

    /**
     * Polls the UNILY news repository at a defined cadence and emits new content through a callback.
     *
     * @param {Object} options
     * @param {string} options.siteUrl
     * @param {string} options.repositoryId
     * @param {number} [options.pollInterval]
     * @param {Function} onNewsAvailable
     * @returns {Function} dispose function to stop polling.
     */
    function pollRepository(options, onNewsAvailable) {
      var disposed = false;
      var continuationToken = null;
      var pollInterval = Math.max(Number(options.pollInterval) || 60000, 15000);

      function tick() {
        if (disposed) {
          return;
        }

        fetchLatest({
          siteUrl: options.siteUrl,
          repositoryId: options.repositoryId,
          pageSize: options.pageSize,
          sinceToken: continuationToken
        })
          .then(function (result) {
            if (disposed) {
              return;
            }

            if (angular.isArray(result.items) && result.items.length > 0) {
              continuationToken = result.continuationToken || result.items[0].id;
              onNewsAvailable(result.items);
            }
          })
          .catch(function (error) {
            $log.warn('[NewsRepositoryService] Polling error', error);
          })
          .finally(function () {
            if (!disposed) {
              $timeout(tick, pollInterval, false);
            }
          });
      }

      tick();

      return function dispose() {
        disposed = true;
      };
    }
  }
})();
