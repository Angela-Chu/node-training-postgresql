const express = require('express')
const bcrypt = require('bcrypt')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')

const saltRounds = 10

function isUndefined (value) {
  return value === undefined
}

function isNotValidSting (value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

// �s�W�ϥΪ�
router.post('/signup', async (req, res, next) => {
  try {
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
    const { name, email, password } = req.body
    // ���ҥ������
    if (isUndefined(name) || isNotValidSting(name) || isUndefined(email) || isNotValidSting(email) || isUndefined(password) || isNotValidSting(password)) {
      logger.warn('��쥼��g���T')
      res.status(400).json({
        status: 'failed',
        message: '��쥼��g���T'
      })
      return
    }
    if (!passwordPattern.test(password)) {
      logger.warn('�إߨϥΪ̿��~: �K�X���ŦX�W�h�A�ݭn�]�t�^��Ʀr�j�p�g�A�̵u8�Ӧr�A�̪�16�Ӧr')
      res.status(400).json({
        status: 'failed',
        message: '�K�X���ŦX�W�h�A�ݭn�]�t�^��Ʀr�j�p�g�A�̵u8�Ӧr�A�̪�16�Ӧr'
      })
      return
    }
    const userRepository = dataSource.getRepository('User')
    // �ˬd email �O�_�w�s�b
    const existingUser = await userRepository.findOne({
      where: { email }
    })

    if (existingUser) {
      logger.warn('�إߨϥΪ̿��~: Email �w�Q�ϥ�')
      res.status(409).json({
        status: 'failed',
        message: 'Email �w�Q�ϥ�'
      })
      return
    }

    // �إ߷s�ϥΪ�
    const hashPassword = await bcrypt.hash(password, saltRounds)
    const newUser = userRepository.create({
      name,
      email,
      role: 'USER',
      password: hashPassword
    })

    const savedUser = await userRepository.save(newUser)
    logger.info('�s�إߪ��ϥΪ�ID:', savedUser.id)

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: savedUser.id,
          name: savedUser.name
        }
      }
    })
  } catch (error) {
    logger.error('�إߨϥΪ̿��~:', error)
    next(error)
  }
})

module.exports = router