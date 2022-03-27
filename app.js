const express = require('express');
const app = express();
const methodOverride = require("method-override")
const { conn, sql } = require('./model/sqlserver')
const path = require('path');
const res = require('express/lib/response');
const ejsMate = require('ejs-mate')
const ExpressError = require('./model/error/ExpressError')
const CatchAsync = require('./model/error/CatchAsync');
const req = require('express/lib/request');
const axios = require('axios');
const { json } = require('express/lib/response');
const cookieParser = require('cookie-parser')
app.use(cookieParser())
/* */
app.use(express.static('public'))
app.use("/public", express.static("public"))
app.use("/public", express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate)
/**/
//
//
//
var taikhoan = 'Tài khoản';
var sdt = '';
//
//----------------ALL FUNCTION---------------------------
async function loadProduct() {
    let pool = await conn;
    let loadProduct = `exec exe_CTGH @sdt='${sdt}'`
    pool.request().query(loadProduct, (err, data) => {
        if (data.recordset.length > 0) {
            for (let i of data.recordset) {
                res.cookie(`product_${i.MASP.trim()}_${i.SIZE}`, `${i.SOLUONG}`)
            }
            res.cookie("loadProduct", "true")
        }
        else res.cookie("loadProduct,false")
    })
}
//-----------------ALL FUNCTION------------------------------------
//
//
app.get("/", (req, res) => {
    res.send("WELCOME TO 3000 PORT")
})
app.get("/fermeh", CatchAsync(async (req, res) => {
    let pool = await conn; var m_list = {}; var newPro = {};
    let loadProduct = `exec exe_CTGH @sdt='${sdt}'`
    if (req.cookies['loadProduct'] == 'false' || req.cookies['loadProduct'] == undefined) {
        pool.request().query(loadProduct, (err, data) => {
            if (data.recordset.length > 0) {
                for (let i of data.recordset) {
                    res.cookie(`product_${i.MASP}_${i.SIZE}`, `${i.SOLUONG}`)
                }
                res.cookie("loadProduct", "true")
            }
            else res.cookie("loadProduct", "false")
        })
    }
    let sqlNewPro = "SELECT TOP 8 * FROM LOAISANPHAM ORDER BY NGAYRAMAT DESC"
    let sqlString = 'SELECT TOP 4 * FROM LOAISANPHAM'
    await pool.request().query(sqlNewPro, async (err, data1) => {
        newPro = data1.recordset;
        await pool.request().query(sqlString, (err, data) => {
            m_list = data.recordset;
            res.cookie('name', 'Tan Ngoc')
            res.render('shop/home', { title: "FERMEH", list: m_list, newList: newPro, taikhoan: taikhoan })
        })
    })
}))
// MAN CHILD WM
app.get('/fermeh/collections/:name', CatchAsync(
    async (req, res) => {
        let pool = await conn;
        let sqlString = `SELECT * FROM LOAISANPHAM WHERE DANHMUC='${req.params.name.toUpperCase()}'`
        await pool.request().query(sqlString, (err, data) => {
            res.render('shop/category', { title: `San pham cho ${req.params.name}`, list: data.recordset, name: req.params.name })
        })
    }
))
//theo loai giay dep
app.get('/fermeh/collections/type/:name', CatchAsync(
    async (req, res) => {
        let pool = await conn;
        let sqlString = `SELECT * FROM LOAISANPHAM WHERE HANGSX='${req.params.name.toUpperCase()}'`
        await pool.request().query(sqlString, (err, data) => {
            res.render('shop/category', { title: `${req.params.name})`, list: data.recordset })
        })
    }))
//theo hang san xuat
app.get('/fermeh/collections/brand/:name', CatchAsync(
    async (req, res) => {
        let pool = await conn;
        let sqlString = `SELECT SP.* FROM LOAISANPHAM SP WHERE SP.HANGSX='${req.params.name.toLowerCase()}'`
        await pool.request().query(sqlString, (err, data) => {
            console.log(data.recordset)
            res.render('shop/category', { title: req.params.name, list: data.recordset })
        })
    }
))
/*----------------- */
//
//
//
//
app.post('/fermeh/signup', CatchAsync(async (req, res) => {
    let name = req.body.name
    let phoneNum = req.body.phoneNumber
    let phoneNumber = phoneNum
    let pass = req.body.password
    let cipherPass
    await axios({
        method: 'GET',
        url: 'https://api.hashify.net/hash/md5/hex?value=' + pass,
        data: null
    }).then((res) => { cipherPass = res.data.Digest })
        .catch((err) => { console.log("errrrr", err) })
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (vnf_regex.test(phoneNum)) {
        let pool = await conn;
        let sqlString = `exec exe_checkSDT @sdt='${phoneNum}'`
        await pool.request().query(sqlString, async (err, data) => {
            if (data.recordset.length === 0) {
                let sqlString = `exec exe_insertKH @tenkh,@matkhau,@sdt`
                await pool.request()
                    .input('tenkh', sql.NVarChar, name)
                    .input('matkhau', sql.NVarChar, cipherPass)
                    .input('sdt', sql.NVarChar, phoneNumber.trim())
                    .query(sqlString, (err, data) => {
                        //console.log('insert thanh cong')
                        //console.log(phoneNumber)
                    })
                res.render("shop/login", { title: "Đăng nhập" })
            }
            else {
                res.render('shop/signup', { title: "Đăng ký", message: 'Số điện thoại đã tồn tại!' })
            }
            //console.log(data.recordset)
        })
    }
    else {
        res.render('shop/signup', { title: "Đăng ký", message: 'Số điện thoại không đúng!' })
    }
}))
app.get('/fermeh/signup', async (req, res) => {

    res.render("shop/signup", { title: "Đăng ký", message: "" })

})
//
//
//
//
//
app.post('/fermeh/login', CatchAsync(async (req, res) => {
    let phoneNum = req.body.phoneNumber
    let pass = req.body.password
    let cipherPass
    await axios({
        method: 'GET',
        url: 'https://api.hashify.net/hash/md5/hex?value=' + pass,
        data: null
    }).then((res) => { cipherPass = res.data.Digest })
        .catch((err) => { console.log("errrrr", err) })
    // console.log(cipherPass)
    // console.log(phoneNum)
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (vnf_regex.test(phoneNum)) {
        let pool = await conn; var l_data = []
        let sqlString = `exec exe_checkSDT @sdt='${phoneNum}'`
        await pool.request().query(sqlString, async (err, data) => {
            l_data = data.recordset
            //console.log('data', data.recordset)
            if (data.recordset.length === 0) {
                res.render('shop/login', { title: "Đăng nhập", message: 'Số điện thoại hoặc mật khẩu không đúng!' })
            }
            else {
                let sqlString1 = `exec exe_findKH @sdt='${phoneNum.trim()}',@matkhau='${cipherPass.trim()}'`
                try {
                    return await pool.request()
                        .query(sqlString1, async (err, data1) => {
                            //console.log('select thanh cong')
                            //console.log(phoneNum, cipherPass)
                            //console.log(sqlString1)
                            if (data1.recordset.length === 0) {
                                //console.log(data1.recordset)
                                res.render('shop/login', { title: "Đăng nhập", message: 'Số điện thoại hoặc mật khẩu không đúng!' })
                            }
                            else {
                                sdt = l_data[0].SDT
                                taikhoan = `${l_data[0].TENKH}`
                                res.redirect("/fermeh")
                            }
                        })
                }
                catch (e) {
                    res.render('shop/login', { title: "Đăng nhập", message: 'Số điện thoại hoặc mật khẩu không đúng!' })
                }
            }
        })
    }
    else {
        res.render('shop/login', { title: "Đăng nhập", message: 'Số điện thoại không đúng!' })
    }

}))
app.get('/fermeh/login', (req, res) => {
    res.render("shop/login", { title: "Đăng nhập", message: "" })
})
app.get('/fermeh/product', (req, res) => {
    res.render('shop/product', { title: "Product" })
})

app.get('/fermeh/category', (req, res) => {
    res.render('shop/category', { title: "Nam" })
})

app.get('/shoes', async (req, res) => {
    let pool = await conn;
    let sqlString = "SELECT * FROM SANPHAM";
    return await pool.request().query(sqlString, (err, data) => {
        let dataType = data.recordset
        res.send(dataType)
    })
})

app.get('/fermeh/detail/:id', CatchAsync(
    async (req, res) => {
        var id = req.params.id; var detail = [];
        let pool = await conn;
        let sqlString = 'SELECT * FROM LOAISANPHAM WHERE MASP = ' + id
        await pool.request().query(sqlString, async (err, data1) => {
            detail = await data1.recordset;
            let sqlSecond = `SELECT TOP 4 * FROM LOAISANPHAM WHERE LOAI = '${detail[0].LOAI}' AND CTLOAI ='${detail[0].CTLOAI}' AND DANHMUC = '${detail[0].DANHMUC}'`
            await pool.request().query(sqlSecond, (err, data) => {
                let list = data.recordset;
                // console.log(list)
                res.render('shop/product', { title: detail[0].TENSP, detail: detail, list: list })
            })
        })
    }
))


app.post('/fermeh/add-to-cart/:id', CatchAsync(async (req, res) => {
    if (sdt === '' && taikhoan === 'Tài khoản') {
        let cnt = 0;
        let coo = req.cookies
        for (let i in coo) {
            if (i.trim() === `product_${req.params.id}_${req.body.size_choose}`) {
                await res.cookie(i.trim(), parseInt(coo[i]) + 1);
                cnt++;
            }
        }
        if (cnt === 0) {
            await res.cookie(`product_${req.params.id}_${req.body.size_choose}`, 1)
        }
        res.redirect(`/fermeh/detail/${req.params.id}`)
    }
    else {
        let pool = await conn
        let sqlString = ''
    }
    // console.log(req.body)

}))
app.get("/fermeh/cart", async (req, res) => {
    let listProduct = req.cookies
    let cnt = 0;
    let pool = await conn
    if (sdt != '' && taikhoan != 'Tài khoản') {
        let loadProduct = `exec exe_CTGH @sdt='${sdt}'`
        pool.request().query(loadProduct, (err, data) => {
            if (data.recordset.length > 0) {
                for (let i of listProduct) {
                    cnt = 0
                    for (let j in data.recordset) {
                        if (j.MASP == parseInt(i.split('_')[1].trim()) && j.SIZE == parseInt(i.split('_')[2].trim())) {
                            let updateProduct = `exec exe_updateCTGH @sdt='${sdt}',@masp=${parseInt(i.split('_')[1].trim())},@size=${parseInt(i.split('_')[2].trim())} ,@soluong=
                            ${parseInt(listProduct[i])} `
                            pool.request().query(updateProduct, (err, data) => {
                                console.log("update product successful")
                            })
                            cnt++;
                        }
                    }
                    if (cnt === 0) {
                        let insertProduct = `exe_insertCTGH @sdt='${sdt}',@masp=${parseInt(i.split('_')[1].trim())},@size=${parseInt(i.split('_')[2].trim())} ,@soluong =${listProduct[i]})`
                        pool.request().query(insertProduct, (err, data) => {
                            console.log("insert product successful")
                        })
                    }
                }
            }
            else {
                for (let i of listProduct) {
                    let insertProduct = `exe_insertCTGH @sdt='${sdt}',@masp=${parseInt(i.split('_')[1].trim())},@size=${parseInt(i.split('_')[2].trim())} ,@soluong =${listProduct[i]})`
                    pool.request().query(insertProduct, (err, data) => {
                        console.log("insert product successful")
                    })
                }
            }
        })
    }
    res.render("shop/cart", { title: "Giỏ hàng" })
})
//DANG XUAT,CAI DAT,DON HANG
//
//
app.get("/fermeh/logout", (req, res) => {
    //xóa hết mấy cái cookie đi 
    taikhoan = 'Tài khoản'
    sdt = ''
    res.redirect('/fermeh')
})
//
//

//
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})
app.use((err, req, res, next) => {
    const { message = 'wrong number', status = 500 } = err;
    res.status(status).render('error/error', { message })
})

app.listen(3000, () => {
    console.log("THIS IS PORT 3000")
})