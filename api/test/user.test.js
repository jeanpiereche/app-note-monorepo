const User = require('../models/User')
const bcryp = require('bcrypt')
const supertest = require('supertest')

const { app, server } = require('../index')
const { mongoose } = require('mongoose')
const api = supertest(app)

describe.only('creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcryp.hash('pass', 10)
    const user = new User({ username: 'jeanroot', name: 'JeanRoot', passwordHash })

    await user.save()
  })

  test('works as expected creating a fresh username', async () => {
    const usersDB = await User.find({})
    const usersAtStart = usersDB.map(user => user.toJSON())

    const newUser = {
      username: 'jeanpiereche',
      name: 'Jeanpierre',
      password: 'j34n'
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-type', /application\/json/)

    const usersAtAfter = await User.find({})
    const usersAtEnd = usersAtAfter.map(user => user.toJSON())
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username is already taken', async () => {
    const usersDB = await User.find({})
    const usersAtStart = usersDB.map(user => user.toJSON())

    const newUser = {
      username: 'jeanroot',
      name: 'JeanRoot',
      password: 'passwordTest'
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-type', /application\/json/)

    expect(result.body.error.errors.username.message).toContain('`username` to be unique')

    const usersDBAfter = await User.find({})
    const userAtEnd = usersDBAfter.map(user => user.toJSON())
    expect(userAtEnd).toHaveLength(usersAtStart.length)
  })

  afterAll(() => {
    mongoose.connection.close()
    server.close()
  })
})
