const supertest = require('supertest')
const mongoose = require('mongoose')

const { app, server } = require('../index')
const Note = require('../models/Note')

const api = supertest(app)

const initialNote = [
  {
    content: 'Aprendiendo FullStack JS con midudev',
    important: true,
    date: new Date()
  },
  {
    content: 'Sígueme en https://midu.tube',
    important: true,
    date: new Date()
  }
]

beforeEach(async () => {
  await Note.deleteMany({})

  const note1 = new Note(initialNote[0])
  await note1.save()

  const note2 = new Note(initialNote[1])
  await note2.save()
})

test('note are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two notes', async () => {
  const response = await api.get('/api/notes')
  expect(response.body).toHaveLength(initialNote.length)
})

test('the first note is about midudev', async () => {
  const response = await api.get('/api/notes')
  const contents = response.body.map(note => note.content)
  expect(contents).toContain('Aprendiendo FullStack JS con midudev')
})

test('a valid note can be added', async () => {
  const newNote = {
    content: 'Proximamente async/await',
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-type', /application\/json/)

  const response = await api.get('/api/notes')
  const contents = response.body.map(note => note.content)
  expect(response.body).toHaveLength(initialNote.length + 1)
  expect(contents).toContain(newNote.content)
})

test('a note can be deleted', async () => {
  const response = await api.get('/api/notes')
  const noteToDelete = response.body[0]
  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)

  const response1 = await api.get('/api/notes')
  expect(response1.body).toHaveLength(initialNote.length - 1)
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
