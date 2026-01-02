// Error detection patterns for common kid mistakes in Python
export interface KidFriendlyError {
  title: string;
  explanation: string;
  tip: string;
  emoji: string;
}

export function detectKidFriendlyError(code: string, errorMessage: string): KidFriendlyError {
  const lowerError = errorMessage.toLowerCase();
  const trimmedCode = code.trim();

  // Pattern 1: Apostrophe inside string (most common for kids!)
  // Detects: print("I don't like") or print("it's cold")
  if (
    lowerError.includes('unterminated string') ||
    lowerError.includes('eol while scanning') ||
    lowerError.includes('syntaxerror')
  ) {
    // Check if there's an apostrophe that might be breaking the string
    if (trimmedCode.match(/print\s*\(\s*"[^"]*'/) || trimmedCode.match(/print\s*\(\s*'[^']*'/)) {
      return {
        title: "Oops! Robo-1 got confused by an apostrophe!",
        explanation: "You used a word like \"doesn't\" or \"I'm\" inside your message. Python saw the apostrophe (') and thought your sentence was ending early!",
        tip: "Try using double quotes \" \" around your whole message. Like this: print(\"I'm happy!\")",
        emoji: "'"
      };
    }
  }

  // Pattern 2: Missing closing parenthesis
  if (lowerError.includes('unexpected eof') || lowerError.includes('expected )')) {
    const openParens = (trimmedCode.match(/\(/g) || []).length;
    const closeParens = (trimmedCode.match(/\)/g) || []).length;

    if (openParens > closeParens) {
      return {
        title: "Oops! You forgot to close the parentheses!",
        explanation: "Every opening parenthesis ( needs a closing one ). It's like closing a door after you open it!",
        tip: `Count your parentheses: you have ${openParens} opening ( but only ${closeParens} closing ). Add a ) at the end!`,
        emoji: ")"
      };
    }
  }

  // Pattern 3: Extra closing parenthesis
  if (lowerError.includes('invalid syntax')) {
    const openParens = (trimmedCode.match(/\(/g) || []).length;
    const closeParens = (trimmedCode.match(/\)/g) || []).length;

    if (closeParens > openParens) {
      return {
        title: "Oops! Extra closing parenthesis!",
        explanation: "You have more ) than (. Every closing ) needs an opening ( first!",
        tip: "Check if you accidentally typed an extra ) somewhere.",
        emoji: "("
      };
    }
  }

  // Pattern 4: Missing quotes around string
  if (lowerError.includes('name') && lowerError.includes('not defined')) {
    return {
      title: "Oops! Robo-1 thinks that's a variable name!",
      explanation: "When you want Robo-1 to say words, you need to wrap them in quotes \" \" so Python knows it's text, not a command.",
      tip: "Add quotes around your message: print(\"Hello\") not print(Hello)",
      emoji: "\""
    };
  }

  // Pattern 5: Using Print instead of print (capital P)
  if (trimmedCode.includes('Print(') && !trimmedCode.includes('print(')) {
    return {
      title: "Oops! Python doesn't know 'Print' with a capital P!",
      explanation: "Python is very picky about capital letters. The command is 'print' with a lowercase 'p'.",
      tip: "Change Print to print (lowercase p)",
      emoji: "p"
    };
  }

  // Pattern 6: Missing colon after if/for/while/def
  if (
    lowerError.includes('expected :') ||
    (lowerError.includes('invalid syntax') &&
      (trimmedCode.includes('if ') || trimmedCode.includes('for ') || trimmedCode.includes('while ') || trimmedCode.includes('def ')))
  ) {
    return {
      title: "Oops! You forgot the colon!",
      explanation: "After 'if', 'for', 'while', or 'def', Python needs a colon : at the end of that line.",
      tip: "Add a : at the end. Like: if score > 10:",
      emoji: ":"
    };
  }

  // Pattern 7: Indentation error
  if (lowerError.includes('indent') || lowerError.includes('unexpected indent')) {
    return {
      title: "Oops! The spaces are mixed up!",
      explanation: "Python uses spaces at the beginning of lines to know which code belongs together. Your spaces might be uneven.",
      tip: "Make sure all lines that belong together have the same number of spaces at the start. Use 4 spaces or press Tab once.",
      emoji: " "
    };
  }

  // Pattern 8: Wrong quote matching
  if (lowerError.includes('unterminated') || lowerError.includes('string literal')) {
    const doubleQuotes = (trimmedCode.match(/"/g) || []).length;
    const singleQuotes = (trimmedCode.match(/'/g) || []).length;

    if (doubleQuotes % 2 !== 0 || singleQuotes % 2 !== 0) {
      return {
        title: "Oops! Your quotes don't match!",
        explanation: "Quotes need to come in pairs. If you start with \" you need to end with \". Same for ' quotes.",
        tip: "Check that every opening quote has a closing quote that matches.",
        emoji: "\""
      };
    }
  }

  // Pattern 9: Common typos
  if (trimmedCode.includes('pirnt') || trimmedCode.includes('prnt') || trimmedCode.includes('prit')) {
    return {
      title: "Oops! There's a typo in 'print'!",
      explanation: "It looks like you typed 'print' wrong. Don't worry, typos happen to everyone!",
      tip: "The correct spelling is: print (p-r-i-n-t)",
      emoji: "?"
    };
  }

  // Pattern 10: Missing parentheses entirely
  if (trimmedCode.startsWith('print') && !trimmedCode.includes('(')) {
    return {
      title: "Oops! You need parentheses after print!",
      explanation: "The print command needs parentheses () to hold your message, like hands holding a gift!",
      tip: "Write it like this: print(\"your message\")",
      emoji: "()"
    };
  }

  // Pattern 11: Missing quotes entirely
  if (trimmedCode.match(/print\s*\([^"']*\)/) && !trimmedCode.includes('"') && !trimmedCode.includes("'")) {
    return {
      title: "Oops! Put your message inside quotes!",
      explanation: "Python needs quotes around text so it knows you're writing a message, not a command.",
      tip: "Wrap your message in quotes: print(\"Hello!\") not print(Hello!)",
      emoji: "\"\""
    };
  }

  // Default fallback - still kid-friendly
  return {
    title: "Hmm, something's not quite right!",
    explanation: "Robo-1 found a small mistake in your code. Don't worry, even expert coders make mistakes!",
    tip: "Check for: lowercase 'print', parentheses ( ), and quotes \" \" around your message.",
    emoji: "?"
  };
}

// Simple error check for the code editor (returns error type for styling)
export function getErrorType(output: string): 'error' | 'success' | 'hint' {
  if (output.includes('Oops') || output.includes('Almost') || output.includes('Error')) {
    return 'error';
  }
  if (output.includes('Hint') || output.includes('Type')) {
    return 'hint';
  }
  return 'success';
}
