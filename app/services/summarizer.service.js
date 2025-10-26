(function () {
  'use strict';

  angular
    .module('unilyNewsApp.services.summarizer', [])
    .service('SummarizerService', SummarizerService);

  function SummarizerService() {
    var service = this;

    service.createSummary = createSummary;

    /**
     * Creates a bite-sized summary by extracting the most informative sentences
     * and limiting the total word count.
     *
     * @param {Object} article - Article payload coming from UNILY.
     * @param {string} article.title
     * @param {string} article.body
     * @param {string[]} [article.tags]
     * @returns {{headline: string, bullets: string[], wordCount: number}}
     */
    function createSummary(article) {
      if (!article) {
        return {
          headline: '',
          bullets: [],
          wordCount: 0
        };
      }

      var sanitizedBody = stripHtml(article.body || '');
      var sentences = splitIntoSentences(sanitizedBody);
      var headline = article.title || (sentences[0] || '').slice(0, 140);

      var bullets = scoreSentences(sentences)
        .slice(0, 3)
        .map(function (sentence) {
          return truncateWords(sentence, 28);
        });

      if (article.tags && article.tags.length) {
        bullets.push('Tags: #' + article.tags.slice(0, 5).join(' #'));
      }

      var totalWordCount = bullets
        .join(' ')
        .split(/\s+/)
        .filter(Boolean).length;

      return {
        headline: headline,
        bullets: bullets,
        wordCount: totalWordCount
      };
    }

    function stripHtml(value) {
      return value
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function splitIntoSentences(text) {
      if (!text) {
        return [];
      }

      return text
        .replace(/([.!?])\s+(?=[A-Z])/g, '$1|')
        .split('|')
        .map(function (sentence) {
          return sentence.trim();
        })
        .filter(Boolean);
    }

    function scoreSentences(sentences) {
      if (!sentences || !sentences.length) {
        return [];
      }

      var keywords = buildKeywordFrequency(sentences);

      return sentences
        .map(function (sentence) {
          var words = sentence
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);

          var score = words.reduce(function (total, word) {
            return total + (keywords[word] || 0);
          }, 0);

          return {
            sentence: sentence,
            score: score / Math.max(words.length, 1)
          };
        })
        .sort(function (a, b) {
          return b.score - a.score;
        })
        .map(function (entry) {
          return entry.sentence;
        });
    }

    function buildKeywordFrequency(sentences) {
      var stopwords = [
        'the', 'is', 'and', 'or', 'to', 'in', 'of', 'for', 'on', 'at', 'a',
        'an', 'by', 'with', 'from', 'that', 'this', 'it', 'as', 'be', 'are',
        'was', 'were', 'about', 'into', 'we', 'our', 'your', 'their', 'has'
      ];

      var frequencies = Object.create(null);

      sentences.forEach(function (sentence) {
        sentence
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(function (word) {
            return word && stopwords.indexOf(word) === -1 && word.length > 2;
          })
          .forEach(function (word) {
            frequencies[word] = (frequencies[word] || 0) + 1;
          });
      });

      return frequencies;
    }

    function truncateWords(sentence, maxWords) {
      var words = sentence.split(/\s+/).filter(Boolean);

      if (words.length <= maxWords) {
        return sentence;
      }

      return words.slice(0, maxWords).join(' ') + '…';
    }
  }
})();
