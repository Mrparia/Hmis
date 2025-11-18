/**
 * Calculates the Levenshtein distance between two strings.
 * This is a measure of the difference between two sequences.
 * @param s1 The first string.
 * @param s2 The second string.
 * @returns The Levenshtein distance.
 */
export const levenshteinDistance = (s1: string, s2: string): number => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
};

/**
 * Performs a fuzzy search to check if a search term matches a text string, allowing for typos.
 * @param searchTerm The string to search for.
 * @param textToSearch The string to search within.
 * @returns True if a fuzzy match is found, otherwise false.
 */
export const fuzzySearch = (searchTerm: string, textToSearch: string): boolean => {
    if (!searchTerm) return true;
    if (!textToSearch) return false;

    const searchTermLower = searchTerm.toLowerCase();
    const textToSearchLower = textToSearch.toLowerCase();

    // Prioritize direct substring match for performance and accuracy with partials.
    if (textToSearchLower.includes(searchTermLower)) {
        return true;
    }

    // Don't perform fuzzy search on very short terms where it's unreliable.
    if (searchTerm.length < 3) return false;

    const searchWords = searchTermLower.split(' ').filter(w => w.length > 0);
    const textWords = textToSearchLower.split(' ');

    // Check if every word in the search term has a "close enough" match in the target text.
    return searchWords.every(searchWord => {
        // Define a dynamic threshold - e.g., 1 mistake for words of length 4-7, 2 for 8+
        const threshold = searchWord.length > 7 ? 2 : 1;
        return textWords.some(textWord => levenshteinDistance(searchWord, textWord) <= threshold);
    });
};