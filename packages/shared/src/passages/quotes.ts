export interface QuoteItem {
  id: string;
  text: string;
  author: string;
  source?: string;
  lengthCategory: 'short' | 'medium' | 'long';
}

export const FAMOUS_QUOTES: QuoteItem[] = [
  {
    id: 'quote-1',
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    lengthCategory: 'short',
  },
  {
    id: 'quote-2',
    text: 'In the middle of difficulty lies opportunity.',
    author: 'Albert Einstein',
    lengthCategory: 'short',
  },
  {
    id: 'quote-3',
    text: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
    lengthCategory: 'short',
  },
  {
    id: 'quote-4',
    text: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
    lengthCategory: 'short',
  },
  {
    id: 'quote-5',
    text: 'Knowledge is power, but enthusiasm pulls the switch.',
    author: 'Ivern Ball',
    lengthCategory: 'short',
  },
  {
    id: 'quote-6',
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
    lengthCategory: 'short',
  },
  {
    id: 'quote-7',
    text: 'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson',
    source: 'Structure and Interpretation of Computer Programs',
    lengthCategory: 'medium',
  },
  {
    id: 'quote-8',
    text: 'Sometimes it is the people no one can imagine anything of who do the things no one can imagine.',
    author: 'Alan Turing',
    lengthCategory: 'medium',
  },
  {
    id: 'quote-9',
    text: 'The function of good software is to make the complex appear to be simple and natural.',
    author: 'Grady Booch',
    lengthCategory: 'medium',
  },
  {
    id: 'quote-10',
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
    source: 'The Story of Philosophy',
    lengthCategory: 'medium',
  },
  {
    id: 'quote-11',
    text: 'Somewhere, something incredible is waiting to be known. Look up at the stars and not down at your feet.',
    author: 'Carl Sagan',
    lengthCategory: 'medium',
  },
  {
    id: 'quote-12',
    text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
    lengthCategory: 'medium',
  },
  {
    id: 'quote-13',
    text: 'The most dangerous phrase in the language is, We have always done it this way. Innovation begins when we question assumptions.',
    author: 'Grace Hopper',
    lengthCategory: 'long',
  },
  {
    id: 'quote-14',
    text: 'The question of whether machines can think is about as relevant as the question of whether submarines can swim.',
    author: 'Edsger W. Dijkstra',
    lengthCategory: 'long',
  },
  {
    id: 'quote-15',
    text: 'Talk is cheap. Show me the code. When you build something tangible and clean, the results speak louder than any words.',
    author: 'Linus Torvalds',
    lengthCategory: 'long',
  },
  {
    id: 'quote-16',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts in every difficult journey.',
    author: 'Winston Churchill',
    lengthCategory: 'long',
  },
];

export function getRandomQuote(lengthCategory?: 'short' | 'medium' | 'long'): QuoteItem {
  const filtered = lengthCategory
    ? FAMOUS_QUOTES.filter((q) => q.lengthCategory === lengthCategory)
    : FAMOUS_QUOTES;
  const pool = filtered.length > 0 ? filtered : FAMOUS_QUOTES;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
