const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')

function isUndefined (value) {
  return value === undefined
}

function isNotValidSting (value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidInteger (value) {
  return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

router.post('/coaches/courses', async (req, res, next) => {
  try {
    const {
      user_id: userId, skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
      max_participants: maxParticipants, meeting_url: meetingUrl
    } = req.body
    if (isUndefined(userId) || isNotValidSting(userId) ||
      isUndefined(skillId) || isNotValidSting(skillId) ||
      isUndefined(name) || isNotValidSting(name) ||
      isUndefined(description) || isNotValidSting(description) ||
      isUndefined(startAt) || isNotValidSting(startAt) ||
      isUndefined(endAt) || isNotValidSting(endAt) ||
      isUndefined(maxParticipants) || isNotValidInteger(maxParticipants) ||
      isUndefined(meetingUrl) || isNotValidSting(meetingUrl) || !meetingUrl.startsWith('https')) {
      logger.warn('��쥼��g���T')
      res.status(400).json({
        status: 'failed',
        message: '��쥼��g���T'
      })
      return
    }
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({
      select: ['id', 'name', 'role'],
      where: { id: userId }
    })
    if (!existingUser) {
      logger.warn('�ϥΪ̤��s�b')
      res.status(400).json({
        status: 'failed',
        message: '�ϥΪ̤��s�b'
      })
      return
    } else if (existingUser.role !== 'COACH') {
      logger.warn('�ϥΪ̩|�������нm')
      res.status(400).json({
        status: 'failed',
        message: '�ϥΪ̩|�������нm'
      })
      return
    }
    const courseRepo = dataSource.getRepository('Course')
    const newCourse = courseRepo.create({
      user_id: userId,
      skill_id: skillId,
      name,
      description,
      start_at: startAt,
      end_at: endAt,
      max_participants: maxParticipants,
      meeting_url: meetingUrl
    })
    const savedCourse = await courseRepo.save(newCourse)
    const course = await courseRepo.findOne({
      where: { id: savedCourse.id }
    })
    res.status(201).json({
      status: 'success',
      data: {
        course
      }
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
})

router.put('/coaches/courses/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params
    const {
      skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
      max_participants: maxParticipants, meeting_url: meetingUrl
    } = req.body
    if (isNotValidSting(courseId) ||
      isUndefined(skillId) || isNotValidSting(skillId) ||
      isUndefined(name) || isNotValidSting(name) ||
      isUndefined(description) || isNotValidSting(description) ||
      isUndefined(startAt) || isNotValidSting(startAt) ||
      isUndefined(endAt) || isNotValidSting(endAt) ||
      isUndefined(maxParticipants) || isNotValidInteger(maxParticipants) ||
      isUndefined(meetingUrl) || isNotValidSting(meetingUrl) || !meetingUrl.startsWith('https')) {
      logger.warn('��쥼��g���T')
      res.status(400).json({
        status: 'failed',
        message: '��쥼��g���T'
      })
      return
    }
    const courseRepo = dataSource.getRepository('Course')
    const existingCourse = await courseRepo.findOne({
      where: { id: courseId }
    })
    if (!existingCourse) {
      logger.warn('�ҵ{���s�b')
      res.status(400).json({
        status: 'failed',
        message: '�ҵ{���s�b'
      })
      return
    }
    const updateCourse = await courseRepo.update({
      id: courseId
    }, {
      skill_id: skillId,
      name,
      description,
      start_at: startAt,
      end_at: endAt,
      max_participants: maxParticipants,
      meeting_url: meetingUrl
    })
    if (updateCourse.affected === 0) {
      logger.warn('��s�ҵ{����')
      res.status(400).json({
        status: 'failed',
        message: '��s�ҵ{����'
      })
      return
    }
    const savedCourse = await courseRepo.findOne({
      where: { id: courseId }
    })
    res.status(200).json({
      status: 'success',
      data: {
        course: savedCourse
      }
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
})

router.post('/coaches/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params
    const { experience_years: experienceYears, description, profile_image_url: profileImageUrl = null } = req.body
    if (isUndefined(experienceYears) || isNotValidInteger(experienceYears) || isUndefined(description) || isNotValidSting(description)) {
      logger.warn('��쥼��g���T')
      res.status(400).json({
        status: 'failed',
        message: '��쥼��g���T'
      })
      return
    }
    if (profileImageUrl && !isNotValidSting(profileImageUrl) && !profileImageUrl.startsWith('https')) {
      logger.warn('�j�Y�K���}���~')
      res.status(400).json({
        status: 'failed',
        message: '��쥼��g���T'
      })
      return
    }
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({
      select: ['id', 'name', 'role'],
      where: { id: userId }
    })
    if (!existingUser) {
      logger.warn('�ϥΪ̤��s�b')
      res.status(400).json({
        status: 'failed',
        message: '�ϥΪ̤��s�b'
      })
      return
    } else if (existingUser.role === 'COACH') {
      logger.warn('�ϥΪ̤w�g�O�нm')
      res.status(409).json({
        status: 'failed',
        message: '�ϥΪ̤w�g�O�нm'
      })
      return
    }
    const coachRepo = dataSource.getRepository('Coach')
    const newCoach = coachRepo.create({
      user_id: userId,
      experience_years: experienceYears,
      description,
      profile_image_url: profileImageUrl
    })
    const updatedUser = await userRepository.update({
      id: userId,
      role: 'USER'
    }, {
      role: 'COACH'
    })
    if (updatedUser.affected === 0) {
      logger.warn('��s�ϥΪ̥���')
      res.status(400).json({
        status: 'failed',
        message: '��s�ϥΪ̥���'
      })
      return
    }
    const savedCoach = await coachRepo.save(newCoach)
    const savedUser = await userRepository.findOne({
      select: ['name', 'role'],
      where: { id: userId }
    })
    res.status(201).json({
      status: 'success',
      data: {
        user: savedUser,
        coach: savedCoach
      }
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
})

module.exports = router