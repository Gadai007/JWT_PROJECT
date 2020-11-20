const route = require('express').Router()
const User = require('../models/Users')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const handleErrors = (err) => {
   // console.log(err.message, err.code)
    const errors = {
        email: '',
        password: ''
    }
    //error code
    if(err.code === 11000){
        errors.email = 'This email is already exists'
        return errors
    }

    //invalid login email
    if(err.message === "email doesn't exists"){
        errors.email = "email doesn't exists"
    }

    //login password wrong
    if(err.message === "Wrong password"){
        errors.password = "Wrong password"
    }

    //validation error
    if(err.message.includes('user validation failed')){
        // console.log(err.errors)
        Object.values(err.errors).map(({properties}) => {
            //console.log(properties.message, properties.path )
            errors[properties.path] = properties.message
        })
    }
    return errors
}

const maxAge = 3 * 24 * 60 * 60

const createCookie = (id) => {
    return jwt.sign({ id }, process.env.mySecret, { expiresIn: maxAge })
}

route.get('/signup', (req, res) => {
    res.render('signup')
})
route.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body

        const newUser = new User({
            email,
            password
        })

        const user = await newUser.save()
        const token =createCookie(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000})
        res.status(200).json({ user: user._id})
    } catch (error) {
        const errors = handleErrors(error)
        res.status(400).json({ errors })
    }

})
route.get('/login', (req, res) => {
    res.render('login')
})

route.post('/login', async (req, res) => {

    const { email, password} = req.body

    try {
        const user = await User.login(email, password)
        const token = createCookie(user._id)
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
        res.status(200).json({ user: user._id})
    } catch (error) {
        const errors = handleErrors(error)
        res.status(400).json({ errors })
    }
})

route.get('/logout', (req, res) => {
    res.cookie('jwt', '', {maxAge: 1})
    res.redirect('/')
})


module.exports = route