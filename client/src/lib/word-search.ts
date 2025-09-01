export interface WordSearchCell {
  letter: string;
  x: number;
  y: number;
  isFound: boolean;
  isSelected: boolean;
  belongsToWord?: string;
}

export interface WordSearchGrid {
  cells: WordSearchCell[][];
  wordsToFind: string[];
  foundWords: string[];
  size: number;
}

export function generateWordSearch(words: string[], size: number): WordSearchGrid {
  const grid: WordSearchCell[][] = Array(size).fill(null).map((_, y) =>
    Array(size).fill(null).map((_, x) => ({
      letter: '',
      x,
      y,
      isFound: false,
      isSelected: false,
    }))
  );

  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [-1, 1],  // diagonal down-left
  ];

  const placed: Array<{ word: string; coords: Array<[number, number]> }> = [];

  // Place words in grid
  for (const word of words) {
    const upperWord = word.toUpperCase();
    const wordLength = upperWord.length;
    let placedOk = false;
    let attempts = 0;

    while (!placedOk && attempts < 100) {
      attempts++;
      const [dirX, dirY] = directions[Math.floor(Math.random() * directions.length)];
      
      // Calculate valid starting positions
      let startX, startY;
      if (dirX === 1) {
        startX = Math.floor(Math.random() * (size - wordLength + 1));
      } else if (dirX === -1) {
        startX = Math.floor(Math.random() * (size - wordLength + 1)) + wordLength - 1;
      } else {
        startX = Math.floor(Math.random() * size);
      }

      if (dirY === 1) {
        startY = Math.floor(Math.random() * (size - wordLength + 1));
      } else if (dirY === -1) {
        startY = Math.floor(Math.random() * (size - wordLength + 1)) + wordLength - 1;
      } else {
        startY = Math.floor(Math.random() * size);
      }

      // Check if word can be placed
      const coords: Array<[number, number]> = [];
      let canPlace = true;

      for (let i = 0; i < wordLength; i++) {
        const x = startX + dirX * i;
        const y = startY + dirY * i;
        
        if (x < 0 || x >= size || y < 0 || y >= size) {
          canPlace = false;
          break;
        }

        const existing = grid[y][x].letter;
        if (existing !== '' && existing !== upperWord[i]) {
          canPlace = false;
          break;
        }
        
        coords.push([x, y]);
      }

      if (canPlace) {
        // Place the word
        for (let i = 0; i < coords.length; i++) {
          const [x, y] = coords[i];
          grid[y][x].letter = upperWord[i];
          grid[y][x].belongsToWord = upperWord;
        }
        placed.push({ word: upperWord, coords });
        placedOk = true;
      }
    }

    if (!placedOk) {
      console.warn(`Could not place word: ${word}`);
    }
  }

  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x].letter === '') {
        grid[y][x].letter = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return {
    cells: grid,
    wordsToFind: words.map(w => w.toUpperCase()),
    foundWords: [],
    size,
  };
}

export function checkWordFound(
  grid: WordSearchGrid,
  startPos: [number, number],
  endPos: [number, number]
): string | null {
  const [startX, startY] = startPos;
  const [endX, endY] = endPos;
  
  // Calculate direction
  const dirX = endX === startX ? 0 : (endX > startX ? 1 : -1);
  const dirY = endY === startY ? 0 : (endY > startY ? 1 : -1);
  
  // Get word from grid
  let word = '';
  let x = startX;
  let y = startY;
  
  while (true) {
    if (x < 0 || x >= grid.size || y < 0 || y >= grid.size) break;
    word += grid.cells[y][x].letter;
    
    if (x === endX && y === endY) break;
    x += dirX;
    y += dirY;
  }
  
  // Check if word exists in words to find
  if (grid.wordsToFind.includes(word) && !grid.foundWords.includes(word)) {
    return word;
  }
  
  // Check reverse
  const reverseWord = word.split('').reverse().join('');
  if (grid.wordsToFind.includes(reverseWord) && !grid.foundWords.includes(reverseWord)) {
    return reverseWord;
  }
  
  return null;
}
