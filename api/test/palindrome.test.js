const { palindrome } = require('../utils/for_testing')

test.skip('palindrome of lol', () => {
  const result = palindrome('lol')

  expect(result).toBe('lol')
})

test.skip('palindrome of empty string', () => {
  const result = palindrome('')

  expect(result).toBe('')
})
