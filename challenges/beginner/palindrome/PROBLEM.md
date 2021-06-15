# Challenge: Palindrome Checker

**Difficulty:** Beginner
**Medium difficulty:** Easy
**Language:** JavaScript

## Problem

Write a function `isPalindrome(text)` that returns `true` if a string reads the same forwards and backwards.

### Rules

- Ignore case (`"Racecar"` is a palindrome)
- Ignore spaces and punctuation (`"A man, a plan, a canal: Panama"` is a palindrome)
- Only letters and digits matter
- Empty strings count as palindromes

## Examples

```
isPalindrome("racecar")              // true
isPalindrome("Racecar")              // true
isPalindrome("hello")                // false
isPalindrome("A man, a plan, a canal: Panama")  // true
isPalindrome("No 'x' in Nixon")      // true
```

## Constraints

- Do NOT use `.split('').reverse().join('')` — implement the comparison manually with two pointers
- The function must handle strings up to 100,000 characters

## Stretch Goal

Return the actual clean string (letters/digits only, lowercased) alongside the boolean, so callers can see what was compared.
