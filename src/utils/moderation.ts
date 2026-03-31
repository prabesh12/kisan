const BANNED_KEYWORDS = [
  'marijuana', 'cannabis', 'hash', 'hashish', 'brown sugar', 'heroin', 'cocaine', 'meth', 'opium'
];

/**
 * Checks if the given text contains any banned or illegal keywords.
 * Returns the flagged keyword if found, otherwise null.
 */
export const checkModeration = (text: string): string | null => {
  const normalizedText = text.toLowerCase();
  
  // Create a regex to match banned keywords as separate words or parts of words depending on slang usage.
  // Using \b for exact word boundaries to avoid things like "pot" failing in "potato".
  for (const keyword of BANNED_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(normalizedText)) {
      return keyword;
    }
  }
  
  return null;
};

/**
 * Throws an error if moderation fails.
 */
export const validateContent = (name: string, description: string) => {
  const flaggedInName = checkModeration(name);
  if (flaggedInName) {
    throw new Error(`Content moderation alert: "${flaggedInName}" is a banned substance.`);
  }
  
  const flaggedInDesc = checkModeration(description);
  if (flaggedInDesc) {
    throw new Error(`Content moderation alert: "${flaggedInDesc}" is a banned substance.`);
  }
};
