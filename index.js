import express from 'express';
import publicRoutes from './routes/public.js'
import privateRoutes from './routes/private.js'
import path from 'path';
import { fileURLToPath } from 'url';

import auth from './middlewares/auth.js'

const app = express();
app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




app.use('/', publicRoutes)
app.use('/', auth, privateRoutes)

app.listen(3000, () => console.log("server init"))