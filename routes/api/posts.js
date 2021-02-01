const express = require('express')
const router = express.Router()
const auth = require('./../../middleware/auth')
const Post = require('./../../models/Post')
const User = require('./../../models/User')
const {
    check,
    validationResult
} = require('express-validator')

//@route   POST api/posts
//@desc    Create apost
//@access  Private
router.post('/', [
        auth,
        [
            check('text', 'Text is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                errors: errors.array()
            })
        }

        try {
            const user = await User.findById(req.user.id).select('-password')
            if (!user) {
                return res.status(400).json({
                    msg: "Can't create post for non-existent user"
                })
            }

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            })

            await newPost.save()
            res.send(newPost)

        } catch (err) {
            console.log(err)
            res.status(500).send('Server error')
        }
    })

//@route   GET api/posts
//@desc    Get all posts
//@access  Private

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        })

        if (!posts) {
            return res.status(400).json({
                msg: 'No posts for this user'
            })
        }

        res.send(posts)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server error')
    }
})

//@route   GET api/posts/:id
//@desc    Get post by id
//@access  Private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({
                msg: 'No post with this id'
            })
        }

        res.send(post)
    } catch (err) {
        console.log(err)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({
                msg: 'Incorrect post id'
            })
        }
        res.status(500).send('Server error')
    }
})

//@route   DELETE api/posts/:id
//@desc    Delete post by id
//@access  Private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(400).json({
                msg: "Can't remove non-existing post"
            })
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            })
        }
        await post.remove()

        res.json({
            msg: 'Post removed'
        })
    } catch (err) {
        console.log(err)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({
                msg: 'Incorrect post id'
            })
        }
        res.status(500).send('Server error')
    }
})

//@route   PUT api/posts/like/:id
//@desc    Like post
//@access  Private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: 'Post is already liked'
            })
        }

        post.likes.unshift({
            user: req.user.id
        })

        await post.save()

        return res.json(post.likes)
    } catch (err) {
        console.log(err)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({
                msg: 'Incorrect post id'
            })
        }
        res.status(500).send('Server error')
    }
})

//@route   PUT api/posts/unlike/:id
//@desc    Unlike post
//@access  Private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: 'Post has not been liked'
            })
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)
        post.likes.splice(removeIndex, 1)

        await post.save()

        return res.json(post.likes)
    } catch (err) {
        console.log(err)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({
                msg: 'Incorrect post id'
            })
        }
        res.status(500).send('Server error')
    }
})

//@route   POST api/posts/comment/:id
//@desc    Create comment to post
//@access  Private
router.post('/comment/:id', [
        auth,
        [
            check('text', 'Text is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({
                errors: errors.array()
            })
        }

        try {
            const user = await User.findById(req.user.id).select('-password')
            const post = await Post.findById(req.params.id)

            if (!post) {
                return res.status(400).json({
                    msg: "Can't comment non-existent post"
                })
            }

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }

            post.comments.unshift(newComment)

            await post.save()

            res.json(post.comments)

        } catch (err) {
            console.log(err)
            if (err.kind == 'ObjectId') {
                return res.status(400).json({
                    msg: 'Incorrect post id'
                })
            }
            res.status(500).send('Server error')
        }
    })

//@route   POST api/posts/comment/:post_id/:comment_id
//@desc    Create comment to post
//@access  Private

router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id)

        if(!post) {
            return res.status(404).json({ msg: 'Post does not exist' })
        }

        const comment = post.comments.find(comment => comment.id.toString() === req.params.comment_id)
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' })
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to delete this comment' })
        }

        const removeIndex = post.comments.map(comment => comment.id.toString()).indexOf(req.params.comment_id)
        post.comments.splice(removeIndex, 1)
        await post.save()

        return res.json(post.comments)

    } catch (err) {
        console.log(err)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({
                msg: 'Incorrect id'
            })
        }
        res.status(500).send('Server error')
    }
})



module.exports = router