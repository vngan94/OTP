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
const cookieParser = require('cookie-parser');
const { prototype } = require('events');
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
    if ((req.cookies['loadProduct'] == 'false' || req.cookies['loadProduct'] == undefined) && taikhoan != 'Tài khoản' && sdt != '') {
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
    // else if (taikhoan === 'Tài khoản' && sdt === '') {
    //     for (let i in req.cookies) {
    //         res.clearCookie(i)
    //     }
    // }
    let sqlNewPro = "SELECT TOP 8 * FROM LOAISANPHAM ORDER BY NGAYRAMAT DESC"
    let sqlString = 'SELECT TOP 4 * FROM LOAISANPHAM'
    await pool.request().query(sqlNewPro, async (err, data1) => {
        newPro = data1.recordset;
        await pool.request().query(sqlString, (err, data) => {
            m_list = data.recordset;
            // res.cookie('name', 'Tan Ngoc')
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
            res.render('shop/category', { title: `San pham cho ${req.params.name}`, list: data.recordset, name: req.params.name, taikhoan: taikhoan })
        })
    }
))
//theo loai giay dep
app.get('/fermeh/collections/type/:name', CatchAsync(
    async (req, res) => {
        let pool = await conn;
        let sqlString = `SELECT * FROM LOAISANPHAM WHERE HANGSX='${req.params.name.toUpperCase()}'`
        await pool.request().query(sqlString, (err, data) => {
            res.render('shop/category', { title: `${req.params.name})`, list: data.recordset, taikhoan: taikhoan })
        })
    }))
//theo hang san xuat
app.get('/fermeh/collections/brand/:name', CatchAsync(
    async (req, res) => {
        let pool = await conn;
        let sqlString = `SELECT SP.* FROM LOAISANPHAM SP WHERE SP.HANGSX='${req.params.name.toLowerCase()}'`
        await pool.request().query(sqlString, (err, data) => {
            console.log(data.recordset)
            res.render('shop/category', { title: req.params.name, list: data.recordset, taikhoan: taikhoan })
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
                res.render("shop/login", { title: "Đăng nhập", message: "" })
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
                                cookie = req.cookies;
                                for (var prop in cookie) {
                                    // if (!cookie.hasOwnProperty(prop)) {
                                    //     continue;
                                    // }
                                    res.cookie(prop, '', { expires: new Date(0) });
                                }
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
                res.render('shop/product', { title: detail[0].TENSP, detail: detail, list: list, taikhoan: taikhoan })
            })
        })
    }
))
//
//--------------------------------------FAVOURITE
//
app.get("/fermeh/favourite", async (req, res) => {
    let pool = await conn
    if (taikhoan === 'Tài khoản' && sdt === '') {
        res.render("shop/login", { title: "Đăng nhập", message: "" })
    }
    else {
        let sqlString = `exec exe_renderFavourite @sdt='${sdt}'`
        pool.request().query(sqlString, async (err, data) => {
            let rel = data.recordset
            if (rel.length === 0) {
                res.render("shop/favourite", { title: "Yêu thích", fav: '', taikhoan: taikhoan })
            }
            else {
                res.render("shop/favourite", { title: "Yêu thích", fav: rel, taikhoan: taikhoan })
            }
        })
    }
})
app.post('/fermeh/add-to-fav/:id', async (req, res) => {
    let pool = await conn
    // console.log(req.params)
    // console.log(req.body)
    if (taikhoan === 'Tài khoản' && sdt === '') {
        res.render("shop/login", { title: "Đăng nhập", message: "" })
    }
    else {
        let sqlString = `exec exe_insertFav @sdt='${sdt}',@masp=${parseInt(req.params.id)},@size=${parseInt(req.body['size_choose'])}`
        pool.request().query(sqlString, (err, data) => {
            res.redirect(`/fermeh/detail/${req.params.id}`)
        })
    }
})
app.post('/fermeh/fav/add-to-cart', CatchAsync(async (req, res) => {
    let cnt = 0;
    let coo = req.cookies
    for (let i in coo) {
        if (i.trim() === `product_${req.body.masp}_${req.body.size}`) {
            await res.cookie(i.trim(), parseInt(coo[i]) + 1);
            cnt++;
        }
    }
    if (cnt === 0) {
        await res.cookie(`product_${req.body.masp}_${req.body.size}`, 1)
    }
    res.redirect(`/fermeh/favourite`)
}))
app.post('/fermeh/fav/del-product', CatchAsync(async (req, res) => {
    console.log(req.body)
    let pool = await conn
    let sqlString = `exec exe_delFavProduct @sdt='${sdt}',@masp=${parseInt(req.body.masp)},@size=${parseInt(req.body.size)}`
    pool.request().query(sqlString, (err, data) => {
    })
    res.redirect(`/fermeh/favourite`)
}))
//
//-------------------------------CART
//
app.post('/fermeh/add-to-cart/:id', CatchAsync(async (req, res) => {
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
}))
app.get("/fermeh/cart", async (req, res) => {
    let listProduct = req.cookies
    //console.log('list product', listProduct)
    let cnt = 0;
    let pool = await conn
    if (sdt != '' && taikhoan != 'Tài khoản') {
        let loadProduct = `exec exe_CTGH @sdt='${sdt}'`
        pool.request().query(loadProduct, (err, data) => {
            if (data.recordset.length > 0) {
                // console.log('data record', data.recordset)
                for (let i in listProduct) {
                    if (i === 'loadProduct') continue;
                    cnt = 0
                    let arr = i.split('_')
                    for (let j of data.recordset) {
                        if (j.MASP == parseInt(arr[1]) && j.SIZE == parseInt(arr[2])) {
                            let updateProduct = `exec exe_updateCTGH @sdt='${sdt}',@masp=${parseInt(arr[1])},@size=${parseInt(arr[2])} ,@soluong=${parseInt(listProduct[i])} `
                            pool.request().query(updateProduct, (err, data) => {
                                console.log("update product successful")
                            })
                            cnt++;
                        }
                    }
                    if (cnt === 0) {
                        let insertProduct = `exec exe_insertCTGH @sdt='${sdt}',@masp=${parseInt(arr[1])},@size=${parseInt(arr[2])},@soluong =${parseInt(listProduct[i])}`
                        pool.request().query(insertProduct, (err, data) => {
                            // console.log(arr)
                            // console.log(insertProduct)
                            console.log("insert product successful")
                        })
                    }
                }
            }
            else {
                for (let i in listProduct) {
                    if (i === 'loadProduct') continue;
                    let insertProduct = `exec exe_insertCTGH @sdt='${sdt}',@masp=${parseInt(i.split('_')[1])},@size=${parseInt(i.split('_')[2])} ,@soluong =${listProduct[i]})`
                    pool.request().query(insertProduct, (err, data) => {
                        console.log("insert product successful")
                    })
                }
            }
        })
        let renderCart = `exec exe_renderCart @sdt='${sdt}'`
        pool.request().query(renderCart, (err, data) => {
            //console.log(data.recordset)
            if (data.recordset.length > 0) {
                var tong = 0;
                for (let i of data.recordset) {
                    tong += i.GIA * i.SOLUONG
                }
                return res.render("shop/cart", { title: "Giỏ hàng", taikhoan: taikhoan, sdt: sdt, cart: data.recordset, tongtien: tong })
            }
            else {
                return res.render("shop/cart", { title: "Giỏ hàng", taikhoan: taikhoan, sdt: sdt, cart: '', tongtien: 0 })
            }
        })
    }
    else {
        let arr = req.cookies
        var cart = []; let j = Object.keys(arr).length
        var rel = []
        if (Object.getPrototypeOf(arr) != null) {
            for (let i in arr) {
                let sqlString = `select GIA,MINSIZE,MAXSIZE,TENSP,CTLOAI,IDHA from LOAISANPHAM where MASP=${i.split('_')[1]}`
                pool.request().query(sqlString, (err, data) => {
                    try {
                        cart.push(data.recordset[0]); j--; console.log(j)
                        if (j === 0) {
                            var tong = 0;
                            // for (let i of cart) {
                            //     tong += i.GIA
                            // }
                            let id = 0;
                            for (let k in arr) {
                                let oj = {}
                                oj['GIA'] = cart[id].GIA;
                                oj['MINSIZE'] = cart[id].MINSIZE
                                oj['MAXSIZE'] = cart[id].MAXSIZE
                                oj['TENSP'] = cart[id].TENSP
                                oj['CTLOAI'] = cart[id].CTLOAI
                                oj['IDHA'] = cart[id].IDHA
                                id++;
                                oj['SIZE'] = k.split('_')[2]
                                oj['MASP'] = k.split('_')[1]
                                oj['SOLUONG'] = arr[k]
                                tong += oj['GIA'] * oj['SOLUONG']
                                rel.push(oj)
                            }
                            console.log(rel)
                            return res.render("shop/cart", { title: "Giỏ hàng", taikhoan: taikhoan, sdt: sdt, cart: rel, tongtien: tong })
                        }
                    }
                    catch (e) {
                        return res.render("shop/cart", { title: "Giỏ hàng", taikhoan: taikhoan, sdt: sdt, cart: '' })
                    }
                })
            }
        }
        else {
            //console.log(arr)
            res.render("shop/cart", { title: "Giỏ hàng", taikhoan: taikhoan, sdt: sdt, cart: '' })
        }
    }
})
app.post('/fermeh/cart/del-product', CatchAsync(async (req, res) => {
    if (taikhoan != 'Tài khoản' && sdt != '') {
        console.log(req.body)
        let pool = await conn
        let sqlString = `exec exe_delCartProduct @sdt='${sdt}',@masp=${parseInt(req.body.masp)},@size=${parseInt(req.body.size)}`
        pool.request().query(sqlString, (err, data) => {
        })
        res.redirect(`/fermeh/cart`)
    }
    else {
        res.redirect(`/fermeh/cart`)
    }
}))
//DANG XUAT,CAI DAT,DON HANG
//
//
app.get("/fermeh/user/logout", (req, res) => {
    //xóa hết mấy cái cookie đi 
    for (let i in req.cookies) {
        res.clearCookie(i)
    }
    taikhoan = 'Tài khoản'
    sdt = ''
    res.redirect('/fermeh')
})
app.get("/fermeh/user/setting", async (req, res) => {
    let pool = await conn;
    let sqlString = `exec exe_renderSetting @sdt='${sdt}'`
    await pool.request().query(sqlString, (err, data) => {
        try {
            data.recordset[0].EMAIL.prototype
        }
        catch (e) {
            data.recordset[0].EMAIL = 'none'
        }
        if (data.recordset.length > 0) {
            console.log(data.recordset[0].EMAIL)
            res.render("user/setting", { title: 'Cài đặt', set: data.recordset, taikhoan: taikhoan, sdt: sdt })
        }
        else {
            res.render("user/setting", { title: 'Cài đặt', taikhoan: taikhoan, sdt: sdt })
        }
    })
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