const express = require("express")
const app = express()

const session = require('express-session')
const cookieParser = require('cookie-parser')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "product/images/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
})
const upload = multer({ storage: storage })

const cors = require('cors')
const db = require('./dbConfig')
const userCollection = require('./Modals/userModal')
const productCollection = require('./Modals/productModal')
db()

app.use(cors())
app.use(cookieParser())
app.use(session({
    secret: 'ABCDEFGH',
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 100 * 24 * 60 * 60
    }
}))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    console.log(req.session.user)
    productCollection.find().then((products) => {
        if (products.length !== 0) {
            res.status(200).json(products).end()
        }
        else {
            res.statusMessage = 'No products found'
            res.status(204).end()
        }
    }).catch((err) => {
        console.log(err);
        res.status(409).end()
    })
})

app.post('/login', (req, res) => {

    const { username, password } = req.body
    userCollection.findOne({ name: username, password: password }).then((user) => {
        if (user) {
            req.session.user = user
            console.log(req.session)
            res.status(200).json(user._id).end()
        }
        else {
            res.statusMessage = 'Login failed'
            res.sendStatus(201).end()
        }
    }).catch((err) => {
        console.log(err)
        res.status(500).end()
    })
})

app.post('/signup', (req, res) => {
    console.log(req.body)
    const { username, password, role } = req.body
    userCollection.findOne({ name: username }).then((user) => {
        if (user) {
            res.statusMessage = 'User already exists'
            res.sendStatus(204).end()
        }
        else {
            const user = new userCollection({
                name: username,
                password: password,
                role: role,
            })
            user.save().then((user) => {
                req.session.user = user
                console.log(user)
                res.statusMessage = 'User Created Successfuly'
                res.status(201).end()
            }).catch((error) => {
                console.log(error)
                res.status(500).end()
            })
        }
    }).catch((error) => {
        console.log(error)
        res.status(500).end()
    })
})

app.post('/addToCart', (req, res) => {
    const { product } = req.body
    if (req.session.user) {
        userCollection.findOne({ name: req.session.user.name, password: req.session.user.password, role: "customer" }).then((usr) => {
            if (usr) {
                let cart = usr.cart
                cart.push(product)
                userCollection.updateOne({ name: usr.name }, { cart: cart }).then(() => {
                    console.log('Added to cart successfully')
                    res.status(201).end()
                }).catch((err) => {
                    console.log(err)
                    res.status(500).end()
                })
            }
        }).catch((err) => {
            console.log(err)
            res.status(500).end()
        })
    }
    else {
        res.status(401).end()
    }
})

app.post('/addproduct', (req, res) => {

    console.log(req.session)
    const { name, description, price } = req.body
    if (req.session.user) {
        const obj = new productCollection({
            name: name,
            description: description,
            price: price,
            publishedBy: req.session.user,
            publishedDate: new Date()
        })
        obj.save().then(() => {
            console.log('Product Saved')
            res.status(200).end()
        }).catch((err) => {
            console.log(err)
            res.status(500).end()
        })
    }
    else {
        res.status(401).end()
    }
})

app.get('/user', (req, res) => {
    if (req.session.user) {
        res.status(200).send(user).end()
    }
    else {
        res.status(204).end()
    }
})

app.post('/deleteProduct', (req, res) => {
    const { name } = req.body
    productCollection.findOneAndDelete({ name: name }).then((resp) => {
        console.log('Product deleted Successfuly')
        res.status(200).end()
    }).catch((err) => {
        console.log(err)
        res.status(500).end()
    })
})

app.post('/addToDraft', (req, res) => {
    const { name, description, price } = req.body
    if (req.session.user) {
        const obj = new productCollection({
            name: name,
            description: description,
            price: price,
            publishedBy: 'dfjkdsnf',
            publishedDate: new Date()
        })
        userCollection.findOne({ name: req.session.user.name, role: 'vendor' }).then((usr) => {
            if (usr) {
                let arr = usr.drafted
                arr.push(obj)
                userCollection.updateOne((x) => {
                    console.log('Product added to draft')
                    res.status(200).end()
                }).catch((err) => {
                    console.log(err)
                    res.status(500).end()
                })
            }
            else {
                res.status(409).end()
            }
        }).catch((err) => {
            console.log(err)
            res.status(500).end()
        })
    }
    else {
        res.status(401).end()
    }

})

app.post('/publish', (req, res) => {
    const { name } = req.body
    if (req.session.user) {
        userCollection.findOne({ name: req.session.user.name }).then((usr) => {
            if (usr) {
                let product = usr.drafted
                let publish=usr.published
                product.forEach((pr) => {
                    if (pr.name === name) {
                        publish.push(pr)
                        const obj=productCollection(pr)
                        obj.save()
                    }
                })
                product=product.filter((pr)=>pr.name!==name)
                userCollection.updateOne({name:req.session.user.name},{drafted:drafted,published:publish}).then(()=>{
                    console.log('Update Success')
                    res.status(200).end()
                }).catch((err)=>{
                    console.log(err)
                    res.status(500).end()
                })
            }
        }).catch((err)=>{
            console.log(err)
        })
    }
    else {
        res.status(401).end()
    }
})

app.get('/logout',(req,res)=>{
    req.session.destroy()
    res.status(200).end()
})

app.listen(8000, (err) => {
    (!err) && console.log('Server Started Successfully...')
})