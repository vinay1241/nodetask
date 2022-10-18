const pool = require('./db');
const jwt =require("jsonwebtoken");

// ----------------------------------------------------------- USER -----------------------------------------------------------

// Function to Check if user Exist Using Email
const checkUserExits = (req, res, next) => {
    const { token } = req.body;
    if(!token){
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: 'No Email Found !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT * from users WHERE email=?'
            conn.query(qry, [email], (err, result) => {
                conn.release();
                if (err) throw err;

                if (result?.length > 0) {
                    req.checkUserExist = true;
                } else {
                    req.checkUserExist = false;
                }
                next();
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })}else{
        const { token } = req.body;
        if (!token) return res.json({ success: false, message: 'No Token Found !!!' })
        //console.log(token);
        // Verifying token
        let verifyToken = null;
        try {
            verifyToken = jwt.verify(token, "viney_secret")
        } catch (error) {
            return res.json({ success: false, message: 'Session Expired !!!' })
        }
    console.log(verifyToken);
        pool.getConnection((err, conn) => {
            if (err) throw err;
    
            try {
                const qry = 'SELECT * from users WHERE email=?'
                conn.query(qry, [verifyToken.email], (err, result) => {
                    conn.release();
                    if (err) throw err;
                    //console.log(result);
   
                    if (result?.length > 0) {
                        req.checkUserExist = { exist: true, email: verifyToken.email };
                        
                    } else {
                        req.checkUserExist = { exist: false };
                    }
                    next();
                })
            } catch (err) {
                console.error(err.message);
                res.end();
            }
        })
    }
}

const getUserDataUsingID = (req, res, next) => {
    const { id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT * from users WHERE id=?'
            conn.query(qry, [id], (err, result) => {
                conn.release();
                if (err) throw err;

                if (result?.length > 0) {
                    req.userData = result[0];
                    next();
                } else {
                    return res.json({ success: false, message: 'Server Error, Try Again !!!' });
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
}


module.exports = {
    checkUserExits,getUserDataUsingID

}