export const BLOG_CONFIG = {
  comments: {
    maxCommentsPerLevel: 3, // Maximum number of comments per level (top level or replies to a specific comment)
    maxCommentLength: 1000, // Maximum length of a comment in characters
    editTimeWindow: 15, // Time window in minutes during which a comment can be edited
  },
} as const;
