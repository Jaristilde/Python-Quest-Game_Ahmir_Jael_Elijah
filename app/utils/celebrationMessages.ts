// Fun celebration messages to keep kids engaged
// Rotates through different messages so it doesn't get boring

export interface CelebrationMessage {
  message: string;
  subMessage: string;
}

const celebrationMessages: CelebrationMessage[] = [
  {
    message: "Fantastic job!",
    subMessage: "You're becoming a coding superstar!"
  },
  {
    message: "Awesome work!",
    subMessage: "Robo-1 is so proud of you!"
  },
  {
    message: "You nailed it!",
    subMessage: "Your coding skills are leveling up!"
  },
  {
    message: "Perfect!",
    subMessage: "You're on fire today!"
  },
  {
    message: "Incredible!",
    subMessage: "You make coding look easy!"
  },
  {
    message: "Way to go!",
    subMessage: "Keep up the amazing work!"
  },
  {
    message: "You rock!",
    subMessage: "That was some impressive coding!"
  },
  {
    message: "Brilliant!",
    subMessage: "Your brain is working like a supercomputer!"
  },
  {
    message: "Woohoo!",
    subMessage: "Another challenge conquered!"
  },
  {
    message: "Amazing!",
    subMessage: "You're becoming a Python pro!"
  }
];

// Track which messages have been shown to avoid repetition
let shownIndices: number[] = [];

export function getRandomCelebration(): CelebrationMessage {
  // Reset if we've shown all messages
  if (shownIndices.length >= celebrationMessages.length) {
    shownIndices = [];
  }

  // Find an index we haven't shown yet
  let randomIndex: number;
  do {
    randomIndex = Math.floor(Math.random() * celebrationMessages.length);
  } while (shownIndices.includes(randomIndex));

  shownIndices.push(randomIndex);
  return celebrationMessages[randomIndex];
}

// Special messages for milestone achievements
export function getMilestoneCelebration(type: 'lesson_complete' | 'level_complete' | 'streak' | 'first_code'): CelebrationMessage {
  switch (type) {
    case 'first_code':
      return {
        message: "You did it!",
        subMessage: "You just wrote your first Python code!"
      };
    case 'lesson_complete':
      return {
        message: "Lesson Complete!",
        subMessage: "You've mastered this lesson! On to the next!"
      };
    case 'level_complete':
      return {
        message: "LEVEL UP!",
        subMessage: "You've completed the entire level! You're unstoppable!"
      };
    case 'streak':
      return {
        message: "On a roll!",
        subMessage: "3 correct answers in a row! Keep it going!"
      };
    default:
      return getRandomCelebration();
  }
}

// Reset the shown indices (useful for testing or new sessions)
export function resetCelebrationHistory(): void {
  shownIndices = [];
}
