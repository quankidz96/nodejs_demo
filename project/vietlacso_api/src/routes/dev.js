import { Router } from 'express'

const router = Router()
const ControllerUpload = require('../controllers/UploadController')
const uploadMulter = require('../models/ModelMulter') // khai báo middleware multer ở đây
import { sendEmail } from '../services/mailService'
import * as UserService from '../models/mongo/user.service'
import { asyncMiddleware } from '../middlewares/asyncMiddleware'
import AclService from '../models/mongo/acl.service'

router.get('/', (req, res) => {
  // Define roles, resources and permissions
  AclService.allow([
    {
      roles: ['user'],
      allows: [
        {
          resources: ['/api/events', '/api/categories'],
          permissions: ['get', 'post', 'put', 'delete'],
        },
      ],
    },
    {
      roles: ['admin'],
      allows: [
        {
          resources: ['/api/v1/user/*'],
          permissions: ['get', 'post', 'put', 'delete'],
        },
        { resources: '/secret', permissions: 'create' },
        { resources: '/topsecret', permissions: '*' },
      ],
    },
    {
      roles: 'guest',
      allows: [],
    },
  ])
    .then((data) => {
      console.log('Assigned permissions to role', data)
    })
    .catch((err) => {
      console.log('Error while assigning permissions', err)
    })

  // Inherit roles
  //  Every user is allowed to do what guests do
  //  Every admin is allowed to do what users do
  AclService.addRoleParents('user', 'guest')
  AclService.addRoleParents('admin', 'user')

  // UserService.getAll()
  //   .then((users) => {
  //     users.forEach(async (user) => {
  //       const result = await AclService.addUserRoles(user._id.toString(), 'admin')
  //       console.log(`${user.username} assign role: ${result}`)
  //     })
  //   })
  //   .catch((e) => {
  //     console.error(e)
  //   })

  // AclService.addUserRoles('5e88472a555bdb21609e68a7', 'user')

  res.json({ message: 'API DEV v1.0' })
})

router.get(
  '/testAsync',
  asyncMiddleware(async (req, res, next) => {
    throw new Error('PES2020')
  })
)

router.post('/post-user', async (req, res) => {
  try {
    const result = await UserService.create(req.body)
    res.json({ success: true, data: result })
  } catch (e) {
    res.json({ success: false, message: e.message, error: e })
  }
})

router.get('/find-user', async (req, res) => {
  UserService.filterByName(req.query)
    .then((data) => {
      res.json({ data })
    })
    .catch((e) => {
      res.status(500).json({ message: e.message, error: e })
    })
})

// upload nhiều files ví dụ như hình ảnh của sản phẩm
router.post(
  '/uploadMultiple',
  uploadMulter.any(),
  ControllerUpload.uploadMultipleFiles
)

// upload single ví dụ như avatar...
router.post(
  '/uploadSingle',
  uploadMulter.single('name'),
  ControllerUpload.uploadSingleFile
)

router.post('/send-email', async (req, res) => {
  try {
    let content = `
        <div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">
                <h4 style="color: #0085ff">Gửi mail với nodemailer và express</h4>
                <span style="color: black">Đây là mail test</span>
            </div>
        </div>`
    const mainOptions = {
      // thiết lập đối tượng, nội dung gửi mail
      from: `"Dev Ghost 👻" <${process.env.GMAIL_USER}>`, // sender address
      to: req.body.mail, // list of receivers
      subject: 'Test Nodemailer',
      html: content, // Nội dung html mình đã tạo trên kia :))
    }
    let info = await sendEmail(mainOptions)
    res.json({ message: info })
  } catch (err) {
    res.json({ message: 'FAIL: ' + err })
  }
})

module.exports = router
