const pool = require('./db');
const express = require('express');
const user = express.Router();
const jwt =require("jsonwebtoken");
const { checkUserExits , getUserDataUsingID} = require('./exportFunctions');

const getUserData = (req, res) => {
    const {token}=req.body;
    if(!token){
        var  { email }  = req.body;
 
}else{
    var  email  = req.checkUserExist.email;
}
//console.log(email);
    if (!email) return res.json({ success: false, message: 'No Email Found !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT * from users WHERE email=?'
            conn.query(qry, [email], (err, result) => {
                conn.release();
                if (err) throw err;

                return res.json({ success: true, data: [{ ...result[0], password: null }] })
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
}


user.post('/signup', checkUserExits, (req, res, next) => {
    if (req.checkUserExist) return res.json({ success: false, message: 'User Already Exists !!!' });

    const { first_name, last_name, phone_no, email, password,role } = req.body;
    
    if (!first_name || !last_name || !phone_no || !email || !password) return res.json({ success: false, message: 'Please fill all the details !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;

        const encryptedPassword = password;
        try {
            const qry = `INSERT INTO users (first_name, last_name, phone_no, email, password,role) 
                VALUES(?, ?, ?, ?, ?,?)`
            const addedData = [first_name, last_name, phone_no, email, encryptedPassword,role]

            conn.query(qry, addedData, (err, result) => {
                conn.release();
                if (err) throw err;
                next();
            })

        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
}, getUserData) // After adding gets User data


//-----------------------------------------------------------------------------------------------------------------------------

user.post('/signin', checkUserExits, (req, res, next) => {
    // Checks If User Exists
    
    if (!req.checkUserExist) return res.json({ success: false, message: 'No User Found !!!' });
    const {token}=req.body;
    if(!token){
    var { email, password } = req.body;
}else{
    var email=req.checkUserExist.email;
   // console.log(email);

}

    pool.getConnection((err, conn) => {
        if (err) throw err;
    
        try {
            const qry = 'SELECT email, password from users WHERE email=?'
           
            conn.query(qry, [email], (err, result) => {
                
                conn.release();
                if (err) throw err;
                if(!token){
                if (result[0].email === email && result[0].password === password) {
                    const token=jwt.sign({"email":email},"viney_secret",{expiresIn: "60s"});

                    addedData=[token,email];
                    const qry = `
                    UPDATE users 
                    SET token=?  WHERE email=?
                `
                conn.query(qry, addedData, (err, result) => {
                    conn.release();
                    if (err) throw err;

                })    
                    console.log('login Successfull');

                    next();
                } else {
                    return res.json({ success: false, message: 'Invalid Credentials !!!' })
                }
            }else{
                if (result[0].email === email) {

                    console.log('login Successfull');

                    next();}

            }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
}, getUserData)

//-----------------------------------------------------------------------------------------------------------------------------


user.post('/getalluser',getUserDataUsingID, (req, res, next) => {
    const { id } = req.body;
//    console.log(req.userData);

      pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            if (req.userData.role === "admin") {

                
            const qry = `SELECT * from users;`

            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;

                res.json({ success: true, data: result });
            })
        }else{
            res.json({ success: false, data: "user is not an admin" });
        } }catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

module.exports=user;