// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET

// const auth = (req, res) => {
//     const token = req.headers.authorization



//     if(!token){
//         return res.status(401).json( { message: 'Acesso negado'})
//     }

//     try {
//         const decoded = jwt.verify(token.replace('Bearer ', '').trim(), JWT_SECRET);
//         // const decoded = jwt.verify(token.replace('Bearer', '').trim(), JWT_SECRET, auth)
        
//         req.userId = decoded.id 
//     } catch (error) {
//         return res.status(401).json( { message: 'Token invalido' })
//     }
//     next()
// }


// export default auth;





import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {  // ✅ Agora com "next"

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', '').trim(), JWT_SECRET);

        req.userId = decoded.id;  // Salva o id do user no request
        next();  // ✅ Continua para a rota
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

export default auth;
