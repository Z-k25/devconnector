const express = require('express')
const router = express.Router()
const auth = require('./../../middleware/auth')
const Profile = require('./../../models/Profile')
const User = require('./../../models/User')
const { check, validationResult } = require('express-validator')

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user',
            ['name', 'avatar'])

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            })
        }

        res.send(profile)
    } catch (err) {
        res.status(500).send('Server error')
    }
})

router.post('/', [auth,
    [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills are required').not().isEmpty()
    ]
],
async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body

    const profileFields = {}
    profileFields.user = req.user.id
    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (githubusername) profileFields.githubusername = githubusername
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube
    if (facebook) profileFields.social.facebook = facebook
    if (twitter) profileFields.social.twitter = twitter
    if (instagram) profileFields.social.instagram = instagram
    if (linkedin) profileFields.social.linkedin = linkedin

    try {
        let profile = await Profile.findOne({ user: req.user.id })

        if (profile) {
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new: true}
            )

            return res.json(profile)
        }

        profile = new Profile(profileFields)
        await profile.save()
        res.json(profile)

    } catch (err) {
        console.log(err)
        res.status(500).send('Server error')
    }
}
)

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.send(profiles)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server error')
    }
})

// get profile by user id

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' })
        }

        res.send(profile)
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' })
        }
        res.status(500).send('Server error')
    }
})

//delete user and profile

router.delete('/', auth, async (req, res) => {
    try {
        await User.findOneAndRemove({ _id: req.user.id })
        await Profile.findOneAndRemove({ user: req.user.id })
        res.json({ msg: 'User deleted' })
    } catch (err) {
        res.send(500).send('Server error')
    }
})

//add experinces to profile

router.put('/experience', [
    auth, [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body

        const newExperience = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        
        try {
            const profile = await Profile.findOne({ user: req.user.id })

            if (!profile) {
                return res.status(400).json({ msg: 'No such user in database' })
            }

            profile.experience.unshift(newExperience)

            await profile.save()
            
            res.json(profile)
        } catch (err) {
            console.log(err)
            res.status(500).send('Server error')
        }
    }
])

// remove experience by id

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        if (!profile) {
            return res.status(400).json({ msg: 'No such user in database' })
        }

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
        if (removeIndex === -1) {
            return res.status(400).json({ msg: 'This experience does not exist' })
        }
        profile.experience.splice(removeIndex, 1)

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server error')
    }
})

//add education to profile

router.put('/education', [
    auth, [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
        check('from', 'From is required').not().isEmpty()

    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body

        const newEducation= {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
        
        try {
            const profile = await Profile.findOne({ user: req.user.id })

            if (!profile) {
                return res.status(400).json({ msg: 'No such user in database' })
            }

            profile.education.unshift(newEducation)

            await profile.save()
            
            res.json(profile)
        } catch (err) {
            console.log(err)
            res.status(500).send('Server error')
        }
    }
])

// remove education by id

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        if (!profile) {
            return res.status(400).json({ msg: 'No such user in database' })
        }

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)
        if (removeIndex === -1) {
            return res.status(400).json({ msg: 'This education does not exist' })
        }
        profile.education.splice(removeIndex, 1)

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server error')
    }
})

module.exports = router