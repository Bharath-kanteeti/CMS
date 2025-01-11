// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const User = require('./models/user');
// const Post = require('./models/Post');
// const bcrypt = require('bcryptjs');
// const app = express();
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// const multer = require('multer');
// const uploadMiddleware = multer({ dest: 'uploads/' });
// const fs = require('fs');


// const salt = bcrypt.genSaltSync(10);
// const secret = 'asdfe45we45w345wegw345werjktjwertkj';


// app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
// app.use(express.json());
// app.use(cookieParser());
// app.use('/uploads', express.static(__dirname + '/uploads'));

// mongoose.connect('mongodb+srv://bhanutejaindla:teja@cluster0.updzxqm.mongodb.net/?retryWrites=true&w=majority')

// app.post('/register', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const userDoc = await User.create({
//             username,
//             password: bcrypt.hashSync(password, salt),
//         });
//         res.json(userDoc);
//     }
//     catch (e) {
//         res.status(400).json(e);
//     }

// });
// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     const userDoc = await User.findOne({ username });
//     const passOk = bcrypt.compareSync(password, userDoc?.password);

//     if (passOk) {
//         jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
//             if (err) throw err;
//             res.cookie('token', token).json({
//                 id: userDoc._id,
//                 username,
//             });
//         });
//     }
//     else {
//         res.status(400).json('wrong credentials');
//     }
// });
// app.get('/profile', (req, res) => {
//     const { token } = req.cookies;
//     jwt.verify(token, secret, {}, (err, info) => {
//         if (err) throw err;
//         res.json(info);
//     });
//     res.json(req.cookies);
// });
// app.post('/logout', (req, res) => {
//     res.cookie('token', '').json('ok');
// });
// app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
//     const { originalname, path } = req.file;
//     //console.log(req.file);
//     const parts = originalname.split('.');
//     const ext = parts[parts.length - 1];
//     const newPath = path + '.' + ext;
//     fs.renameSync(path, newPath);


//     const { token } = req.cookies;
//     jwt.verify(token, secret, {}, async (err, info) => {
//         if (err) throw err;
//         const { title, summary, content } = req.body;
//         const postDoc = await Post.create({
//             title,
//             summary,
//             content,
//             cover: newPath,
//             author: info.id,
//         })
//         res.json(postDoc);
//     });

// });

// app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
//     let newPath = null;
//     if (req.file) {
//         const { originalname, path } = req.file;
//         const parts = originalname.split('.');
//         const ext = parts[parts.length - 1];
//         newPath = path + '.' + ext;
//         fs.renameSync(path, newPath);
//     }
//     const { token } = req.cookies;
//     jwt.verify(token, secret, {}, async (err, info) => {
//         if (err) throw err;
//         const { id, title, summary, content } = req.body;
//         const postDoc = await Post.findById(id);
//         const isAutor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
//         if (!isAutor) {
//             return res.status(400).json('you are not the author');
//         }
//         await postDoc.update({
//             title,
//             summary,
//             content,
//             cover: newPath ? newPath : postDoc.cover,
//         });
//         res.json(postDoc);
//     });
// });
// app.get('/post', async (req, res) => {
//     res.json(await Post.find()
//         .populate('author', ['username'])
//         .sort({ createdAt: -1 })
//         .limit(20)
//     );
// });
// app.get('/post/:id', async (req, res) => {
//     const { id } = req.params
//     const postDoc = await Post.findById(id).populate('author', ['username']);
//     res.json(postDoc);
// })
// app.listen(4000, () => {
//     console.log("running on port 4000")
// });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/user');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);

const secret = process.env.JWT_SECRET_KEY

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

// Env variables
const PORT = process.env.PORT||4000
const DATA_BASE_URL = process.env.DATA_BASE_URL
mongoose.connect(DATA_BASE_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('DataBase connected successfully'))
.catch(err => console.error('Connection error: ', err))

//mongoose.connect('mongodb+srv://bhanutejaindla:teja@cluster0.updzxqm.mongodb.net/?retryWrites=true&w=majority');
//mongoose.connect('mongodb+srv://bharathkanteeti:bharath@cluster0.rqp6y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        // logged in
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            });
        });
    } else {
        res.status(400).json('wrong credentials');
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info);
    });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const { title, summary, content } = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
        });
        res.json(postDoc);
    });
});

// app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
//     let newPath = null;
//     if (req.file) {
//         const { originalname, path } = req.file;
//         const parts = originalname.split('.');
//         const ext = parts[parts.length - 1];
//         newPath = path + '.' + ext;
//         fs.renameSync(path, newPath);
//     }

//     const { token } = req.cookies;
//     jwt.verify(token, secret, {}, async (err, info) => {
//         if (err) throw err;
//         const { id, title, summary, content } = req.body;
//         const postDoc = await Post.findById(id);
//         const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
//         if (!isAuthor) {
//             return res.status(400).json('you are not the author');
//         }
//          await postDoc.update({
//             title,
//             summary,
//             content,
//             cover: newPath ? newPath : postDoc.cover,
//         });

//         res.json(postDoc);
//     });

// });
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;
    console.log(req.file);
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);

        if (!postDoc) {
            return res.status(404).json('Post not found');
        }

        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

        if (!isAuthor) {
            return res.status(400).json('You are not the author');
        }

        postDoc.title = title;
        postDoc.summary = summary;
        postDoc.content = content;

        if (newPath) {
            postDoc.cover = newPath;
        }

        await postDoc.save();

        res.json(postDoc);
    });
});

app.get('/post', async (req, res) => {
    res.json(
        await Post.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(20)
    );
});

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
//