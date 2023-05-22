const assert = require('assert');
const responses = require('../src/responses')

const registrations = [
  'AAAAAAAA001',
  'AAAAAAAA002',
  'AAAAAAAA003',
  'AAAAAAAA004',
  'AAAAAAAA005',
  'AAAAAAAA006',
]

const testUsers = [
  {
    user: {
      id: 'AAAAAAAA001',
      real_name: 'Barbara Liskov',
      display_name: 'Barbara'
    },
    date: Date.now()
  },
  {
    user: {
      id: 'AAAAAAAA002',
      real_name: 'John McCarthy',
      display_name: 'John'
    },
    date: Date.now()
  },
  {
    user: {
      id: 'AAAAAAAA003',
      real_name: 'Ada Lovelace',
      display_name: 'Ada'
    },
    date: Date.now()
  },
  {
    user: {
      id: 'AAAAAAAA004',
      real_name: 'Alan Turing',
      display_name: 'Alan'
    },
    date: Date.now()
  },
  {
    user: {
      id: 'AAAAAAAA005',
      real_name: 'Olgierd von Everec',
      display_name: 'Olgierd'
    },
    date: Date.now()
  },
  {
    user: {
      id: 'AAAAAAAA006',
      real_name: '',
      display_name: 'Ciri'
    },
    date: Date.now()
  },
  
]

const mockUserCache = {}

const initUserCache = () => {
  testUsers.forEach((user) => {
    mockUserCache[user.user.id] = {
      user: user.user,
      date: Date.now(),
    }
  })
}

// This is identical to the function found in ../userCache.js
const generatePlaintextString = (userId) => {
  if (!userId) {
      return '';
  }
  const u = mockUserCache[userId];
  if (!u) {
      // fall back to a mention string if user is not found
      return `<@${userId}>`;
  }
  return `${u.user.real_name || u.user.display_name} (<@${userId}>)`;
};

describe('responses: string generation', () => {
  before(() => {
    initUserCache()
  })

  it('registration list format', () => {
    const wantedResult = [
      'Ada Lovelace (<@AAAAAAAA003>)',
      'Alan Turing (<@AAAAAAAA004>)',
      'Barbara Liskov (<@AAAAAAAA001>)',
      'Ciri (<@AAAAAAAA006>)',
      'John McCarthy (<@AAAAAAAA002>)',
      'Olgierd von Everec (<@AAAAAAAA005>)'
    ]
    const result = responses.formatRegistrationList(registrations, generatePlaintextString)
    assert.deepEqual(result, wantedResult);
  })
})