const { genSalt } = require('bcryptjs')
const express = require('express')
const router = express.Router()
const User = require('../../models/user')
const bcrypt = require('bcryptjs')
const passport = require('passport')

//set routers of register page
router.get('/register', ((req, res) => {
  res.render('register')
}))

router.post('/register', ((req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const err_msgs = []
  if (!email || !password || !confirmPassword) {
    err_msgs.push({ message: '所有欄位為必填!' })
  }
  if (password !== confirmPassword) {
    err_msgs.push({ message: '密碼與確認密碼不相符!' })
  }
  if (err_msgs.length) {
    return res.render('register', {
      err_msgs, name, email, password, confirmPassword
    })
  }
  User.findOne({ email })
    .then(user => {
      if (user) {
        err_msgs.push({ message: '此email已註冊過' })
        return res.render('register', { err_msgs, name, email, password, confirmPassword })
      } else {
        return bcrypt
          .genSalt(10)
          .then(salt => bcrypt.hash(password, salt))
          .then(hash => User.create({ name, email, password: hash }))
          .then(() => res.redirect('/'))
          .catch(error => console.log(error))
      }
    })
}))

//set routers of login page
router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}))

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', '你已經成功登出。')
  res.redirect('/users/login')
})

module.exports = router