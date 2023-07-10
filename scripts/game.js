const numRow = 3 //DEBUG
const numCol = 3 //DEBUG
const dataArray = shuffleArray(Array.from({length: 16}, (_, i) => i))



function shuffleArray(array) {
    array.sort(() => Math.random() - 0.5);
  }