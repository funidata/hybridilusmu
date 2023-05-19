const assert = require('assert');
const responses = require('../src/responses')

const registrations = [
  'AAAAAAAA001',
  'AAAAAAAA002',
  'AAAAAAAA003',
  'AAAAAAAA004'
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
]

const mockUserCache = {}

const initUserCache = () => {
  testUsers.forEach((user) => {
    console.log(user.user)
    mockUserCache[user.user.id] = {
      user: user.user,
      date: Date.now(),
    }
  })
}

const generatePlaintextString = (userId) => {
  if (!userId) {
      return '';
  }
  const u = mockUserCache[userId];
  if (!u) {
      // fall back to a mention string if user is not found
      return `<@${userId}>`;
  }
  return `${u.user.real_name || u.user.display_name}`;
};

const generateFullNameAndTag = (userId) => {
  return `${generatePlaintextString(userId)} (<@${userId}>)`
}

describe('responses: string generation', () => {
  before(() => {
    initUserCache()
  })

  it('registration list format', () => {
    const wantedResult = [
      'Ada Lovelace (<@AAAAAAAA003>)',
      'Alan Turing (<@AAAAAAAA004>)',
      'Barbara Liskov (<@AAAAAAAA001>)',
      'John McCarthy (<@AAAAAAAA002>)',
    ]
    const result = responses.formatRegistrationList(registrations, generateFullNameAndTag)
    assert.deepEqual(result, wantedResult);
  })
})