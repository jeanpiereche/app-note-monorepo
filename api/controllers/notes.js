const notesRouter = require('express').Router()
const Note = require('../models/Note')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')

notesRouter.get('/', async (req, res) => {
  // With asyn await
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  res.json(notes)

  // With Promisse
  // Note.find({}).then(notes => {
  //   res.json(notes)
  // })
})
notesRouter.get('/:id', (req, res, next) => {
  const { id } = req.params

  Note.findById(id).then(note => {
    if (note) {
      res.json(note)
    } else {
      res.status(404).end()
    }
  }).catch(err => {
    next(err)
  })
})
notesRouter.post('/', userExtractor, async (req, res, next) => {
  const {
    content,
    important = false,
    userId
  } = req.body

  // get user form userExtractor
  // const { userId } = req
  const user = await User.findById(userId)

  if (!content) {
    return res.status(400).json({
      error: 'required "content" field is missing'
    })
  }
  const newNote = new Note({
    content,
    date: new Date(),
    important,
    user: user._id
  })

  // newNote.save().then(savedNote => {
  //   res.status(201).json(savedNote)
  // })
  try {
    const savedNote = await newNote.save()

    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    res.status(201).json(savedNote)
  } catch (error) {
    next(error)
  }
})
notesRouter.put('/:id', userExtractor, (req, res, next) => {
  const { id } = req.params
  const note = req.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => {
      res.json(result)
      res.status(200).end()
    })
})
notesRouter.delete('/api/notes/:id', userExtractor, async (req, res, next) => {
  // const { id } = req.params

  // Note.findByIdAndDelete(id).then(() => {
  //   res.status(204).end()
  // }).catch(error => next(error))
  // res.status(204).end()
  const { id } = req.params
  await Note.findOneAndDelete(id)
  res.status(204).end()
})

module.exports = notesRouter
