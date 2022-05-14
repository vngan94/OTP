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
const adminRoutes = require('./routes/admin')
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
app.get("/", async (req, res) => {
    let pool = await conn
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
        let sqlString = `SELECT * FROM LOAISANPHAM WHERE CTLOAI='${req.params.name.toUpperCase()}'`
        await pool.request().query(sqlString, (err, data) => {
            res.render('shop/category', { title: `${req.params.name}`, list: data.recordset, taikhoan: taikhoan, name: 'nam' })
        })
    }))
//theo hang san xuat
app.get('/fermeh/collections/brand/:name', CatchAsync(
    async (req, res) => {
        let name = req.params.name
        console.log(name)
        let pool = await conn;
        let sqlString = `exec exe_renderBrand '${name.toUpperCase()}'`
        await pool.request().query(sqlString, (err, data) => {
            console.log(data.recordset)
            res.render('shop/category', { title: req.params.name, list: data.recordset, taikhoan: taikhoan, name: 'nam' })
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
    var regex_password = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (vnf_regex.test(phoneNum)) {
        let pool = await conn;
        let sqlString = `exec exe_checkSDT @sdt='${phoneNum}'`
        await pool.request().query(sqlString, async (err, data) => {
            if (data.recordset.length === 0) {
                if (regex_password.test(pass)) {
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
                    res.render('shop/signup', {
                        title: "Đăng ký", message: 'Mật khẩu phải có ít nhất 8 kí tự và phải có ít nhất cả chữ và số!'
                        , username: req.body.name, phone: req.body.phoneNumber
                    })
                }
            }
            else {
                res.render('shop/signup', {
                    title: "Đăng ký", message: 'Số điện thoại đã tồn tại!'
                    , pass: req.body.password, username: req.body.name
                })
            }
        })
    }
    else {
        res.render('shop/signup', {
            title: "Đăng ký", message: 'Số điện thoại không đúng!'
            , pass: req.body.password, username: req.body.name
        })
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
    var regex_password = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (regex_password.test(pass)) {
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
    }
    else {
        res.render('shop/login', { title: "Đăng nhập", message: 'Số điện thoại hoặc mật khẩu không đúng!' })
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
//-------------------------------CART MODAL----------------------------------------------------
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
                    //console.log('arr=', arr)
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
                            //console.log(arr)
                            // console.log(insertProduct)
                            console.log("insert product successful")
                        })

                    }
                }
            }
            else {
                for (let i in listProduct) {
                    if (i === 'loadProduct') continue;
                    let insertProduct = `exec exe_insertCTGH @sdt='${sdt}',@masp=${parseInt(i.split('_')[1])},@size=${parseInt(i.split('_')[2])} ,@soluong =${parseInt(listProduct[i])}`
                    pool.request().query(insertProduct, (err, data) => {
                        // console.log('i bằng', i)
                        // console.log(`exec exe_insertCTGH @sdt='${sdt}',@masp=${parseInt(i.split('_')[1])},@size=${parseInt(i.split('_')[2])} ,@soluong =${parseInt(listProduct[i])})`)
                        // console.log('list i bằng', listProduct[i])
                        console.log("insert product successful")
                    })

                }
            }
        })
        setTimeout(() => {
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
        }, 200);
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
//---------------------FORM THANH TOAN
//
app.post("/fermeh/pay-success", async (req, res) => {
    res.render('shop/paysuccess', { title: "Thanh toán thành công", taikhoan: taikhoan, sdt: sdt })
})
// -------------------------------------THANH TOAN XU LY
app.post("/fermeh/payment", async (req, res) => {
    let way = req.body.radio_method_dilivery
    let ten = req.body.ten
    let email = req.body.email
    let phone = req.body.sdt
    let diachi = req.body.diachi
    try {
        diachi.replace('\n', '')
    } catch (e) { }
    let kq = ''
    for (let i of diachi.split(' ')) {
        if (i != '') kq += i.trim() + " "
    }
    diachi = kq.trim()
    let method = req.body.method
    let arr = req.body.sp
    let tong = req.body.tongtien
    let pool = await conn
    console.log('arr', arr)
    console.log(ten, email, phone, diachi, method, tong)
    let sqlHD = `exec exe_insertHOADON '${sdt}',${parseInt(tong)},N'${diachi.trim()}','${method}'`
    if (sdt != '') {
        await
            pool.request().query(sqlHD, async (err, data) => {
                var mahd = parseInt(data.recordset[0].MAHD)
                console.log('tạo hóa đơn thành công!')
                console.log(arr)
                for (let i of arr) {
                    let sqldel = `exec exe_delCartProduct '${sdt}',${parseInt(i.MASP)},${parseInt(i.SIZE)}`
                    await pool.request().query(sqldel, (err, data) => { console.log('xoa thanh cong!') })
                    try {
                        res.clearCookie(`product_${parseInt(i.MASP)}_${parseInt(i.SIZE)}`)
                        document.cookie = `product_${parseInt(i.MASP)}_${parseInt(i.SIZE)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                    } catch (e) { }
                    for (let j = 0; j < parseInt(i.SOLUONG); j++) {
                        let sql = `exec exe_createCTHD ${mahd},${parseInt(i.MASP)},${parseInt(i.SIZE)}`
                        pool.request().query(sql, (err, data) => {
                            console.log('tao cthd thanh cong')
                        })
                    }
                }
            })
    } else {
        console.log(parseInt(tong), diachi, ten, email, phone)
        let sqlCreateHD = `insert into HOADON(TONGTIEN,DIACHI,TEN,EMAIL,SDT) VALUES(${parseInt(tong)},N'${diachi}',N'${ten}','${email}','${phone}') 
                            select top 1 MAHD from HOADON order by MAHD desc`
        await setTimeout(() => {
            pool.request().query(sqlCreateHD, (err, data) => {
                console.log('tạo hóa đơn thành công!')
                let mahd = parseInt(data.recordset[0].MAHD)
                for (let i of arr) {
                    for (let j = 0; j < parseInt(i.SOLUONG); j++) {
                        let sql = `exec exe_createCTHD ${mahd},${parseInt(i.MASP)},${parseInt(i.SIZE)}`
                        pool.request().query(sql, (err, data) => {
                        })
                    }
                }
            })
        }, 100);
        let coo = req.cookies
        for (let i of arr) {
            for (let j in coo) {
                if (i.MASP == j.split(' ')[1] && i.SIZE == j.split(' ')[2]) {
                    console.log('bang nhau')
                    try {
                        res.clearCookie(j)
                        document.cookie = `product_${j.split(' ')[1]}_${j.split(' ')[2]}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                    } catch (e) { }
                }
            }
        }
    }
})
//------------------------------GET FORM THANH TOAN-------------------
app.get("/fermeh/payment", async (req, res) => {
    let listProduct = req.cookies
    let cnt = 0;
    let pool = await conn
    if (sdt != '') {
        let loadProduct = `exec exe_CTGH @sdt='${sdt}'`
        pool.request().query(loadProduct, (err, data) => {
        })
        setTimeout(() => {
            let renderCart = `exec exe_renderCart @sdt='${sdt}'`
            pool.request().query(renderCart, async (err, data) => {
                if (data.recordset.length > 0) {
                    var cart = data.recordset
                    let sqlrenderPayment = `exec exe_renderPayment '${sdt}'`
                    await pool.request().query(sqlrenderPayment, async (err, data) => {
                        if (data.recordset.length > 0) {
                            let payment = data.recordset
                            var tong = 0;
                            for (let i of payment) {
                                tong += i.GIA * i.SOLUONG
                            }
                            let renderLocate = `exec exe_renderLocatePayment '${sdt}'`
                            await pool.request().query(renderLocate, async (err, data) => {
                                if (data.recordset.length > 0) {
                                    return res.render("shop/payment", { title: "Thanh toán", taikhoan: taikhoan, sdt: sdt, cart: cart, tongtien: tong, locate: data.recordset, payment: payment })
                                } else {
                                    let renderTinh = `exec exe_requestTinh`
                                    await pool.request().query(renderTinh, async (err, data) => {
                                        return res.render("shop/payment", { title: "Thanh toán", taikhoan: taikhoan, sdt: sdt, cart: cart, tongtien: tong, locate: "", tinh: data.recordset, payment: payment })
                                    })

                                }
                            })
                        }
                        else {
                            let renderLocate = `exec exe_renderLocatePayment '${sdt}'`
                            await pool.request().query(renderLocate, async (err, data) => {
                                if (data.recordset.length > 0) {
                                    return res.render("shop/payment", { title: "Thanh toán", taikhoan: taikhoan, sdt: sdt, cart: cart, tongtien: 0, locate: data.recordset, payment: [] })
                                } else {
                                    let renderTinh = `exec exe_requestTinh`
                                    await pool.request().query(renderTinh, async (err, data) => {
                                        return res.render("shop/payment", { title: "Thanh toán", taikhoan: taikhoan, sdt: sdt, cart: cart, tongtien: 0, locate: "", tinh: data.recordset, payment: [] })
                                    })

                                }
                            })
                        }
                    })
                }
            })
        }, 300);
    }
    else {
        let arr = req.cookies
        var cart = []; let j = Object.keys(arr).length
        var rel = []; var payment = []
        if (Object.getPrototypeOf(arr) != null) {
            for (let i in arr) {
                let sqlString = `select MASP,GIA,MINSIZE,MAXSIZE,TENSP,CTLOAI,IDHA from LOAISANPHAM where MASP=${i.split('_')[1]} order by MASP`
                pool.request().query(sqlString, async (err, data) => {
                    try {
                        cart.push(data.recordset[0]); j--;
                        if (j === 0) {
                            // for (let i of cart) {
                            //     tong += i.GIA
                            // }
                            let id = 0;
                            for (let k in arr) {
                                for (let i of cart) {
                                    if (i.MASP == k.split('_')[1]) {
                                        let oj = {}
                                        oj['GIA'] = i.GIA;
                                        oj['MINSIZE'] = i.MINSIZE
                                        oj['MAXSIZE'] = i.MAXSIZE
                                        oj['TENSP'] = i.TENSP
                                        oj['CTLOAI'] = i.CTLOAI
                                        oj['IDHA'] = i.IDHA
                                        oj['SIZE'] = k.split('_')[2]
                                        oj['MASP'] = k.split('_')[1]
                                        oj['SOLUONG'] = arr[k]
                                        rel.push(oj)
                                    }
                                }
                            }
                            // console.log(rel)
                            let renderTinh = `exec exe_requestTinh`
                            await pool.request().query(renderTinh, async (err, data) => {
                                var tinh = data.recordset
                                let sqlBangTam = `create table ##paymentContain(MASP int,SIZE int,GIA money)`
                                await pool.request().query(sqlBangTam, async (err, data) => {
                                    for (let i of rel) {
                                        //đếm số sản phẩm có trong kho
                                        let sqlCountPr = `select SL = count(*) from SANPHAM where MASP=${parseInt(i.MASP)} and SANPHAM.SIZE=${i.SIZE} and SANPHAM.SOLD=0`
                                        await pool.request().query(sqlCountPr, async (err, data) => {
                                            if (data.recordset.length > 0) {
                                                //insert vao bang tam
                                                let sqlInsert = `insert into ##paymentContain select MASP,SIZE,GIA=(select GIA from LOAISANPHAM where 
                                                    MASP=${parseInt(i.MASP)}) from SANPHAM where MASP=${parseInt(i.MASP)} and SANPHAM.SIZE=${i.SIZE} and SANPHAM.SOLD=0`
                                                await pool.request().query(sqlInsert, async (err, data) => {
                                                })
                                            }
                                        })
                                    }
                                })
                                setTimeout(() => {
                                    pool.request().query('select * from ##paymentContain', async (err, data) => {
                                        if (data.recordset.length > 0) {
                                            payment = data.recordset
                                        }
                                        else {
                                            payment = []
                                        }
                                        var tong = 0;
                                        let coo = req.cookies
                                        // console.log(coo)
                                        for (let i of payment) {
                                            for (let j in coo) {
                                                if (parseInt(i.SIZE) == parseInt(j.split('_')[2]) && parseInt(i.MASP) == parseInt(j.split('_')[1])) {
                                                    tong += parseInt(coo[j]) * i.GIA;
                                                    continue
                                                }
                                            }
                                        }
                                        await pool.request().query('drop table ##paymentContain', (err, data) => {
                                            return res.render("shop/payment", { title: "Thanh toán", taikhoan: taikhoan, sdt: sdt, cart: rel, tongtien: tong, tinh: tinh, payment: payment })
                                        })
                                    })
                                }, 100);
                            })
                        }
                    }
                    catch (e) {
                        return res.render("shop/payment", { title: "Thanh toán", taikhoan: taikhoan, sdt: sdt, cart: '' })
                    }
                })
            }
        }
        else {
            //console.log(arr)
            res.render("shop/payment", { title: "Thanh toán", taikhoan: taikhoan, sdt: sdt, cart: '' })
        }
    }
})
//
//---------------------FORM THANH TOAN
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
            let set = data.recordset
            let sqlLocate = `exec exe_renderLocate '${sdt}'`
            pool.request().query(sqlLocate, (err, data) => {
                if (data.recordset.length > 0) {
                    res.render("user/setting", { title: 'Cài đặt', set: set, taikhoan: taikhoan, sdt: sdt, diachi: data.recordset })
                }
                else {
                    res.render("user/setting", { title: 'Cài đặt', set: set, taikhoan: taikhoan, sdt: sdt, diachi: 0 })
                }
            })
        }
        else {
            res.render("user/setting", { title: 'Cài đặt', taikhoan: taikhoan, sdt: sdt })
        }
    })
})
app.post('/fermeh/user/changeUsername', async (req, res) => {
    res.redirect("/fermeh/user/setting");
})
//
app.get('/fermeh/user/order', async (req, res) => {
    let pool = await conn
    await pool.request().query(`exec exe_renderBill '${sdt}'`, async (err, data) => {
        var bill = data.recordset
        console.log(bill)
        var arr = []
        while (bill.length > 0) {
            var tmp = []
            let j = bill.shift()
            tmp.push(j)
            let i = 0;
            while (i < bill.length) {
                if (bill[i].MAHD == j.MAHD) {
                    let tg = bill.splice(i, 1)
                    tmp.push(tg[0])
                }
                else {
                    i++;
                }
            }
            arr.push(tmp)
        }
        console.log(arr)
        // console.log(arr[0][0].NGAYLAP)
        res.render('user/order', { title: 'Đơn hàng đã mua', taikhoan: taikhoan, sdt: sdt, arr: arr })
    })
})
//---------------------------SEARCH FORM--------------------------------
//
app.get('/fermeh/search', CatchAsync(async (req, res) => {
    let pool = await conn
    let name = req.query.name
    name = name.toLowerCase();
    name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    name = name.replace(/đ/g, "d");
    await pool.request().query(`exec exe_searchProduct '${name}'`, async (err, data) => {
        if (data.recordset.length > 0) {
            res.render('shop/category', { taikhoan: taikhoan, title: `Kết quả tìm kiếm cho "${req.query.name}"-fermeh`, name: 'nam', list: data.recordset })
        }
        else {
            res.render('shop/category', { taikhoan: taikhoan, title: `Kết quả tìm kiếm cho "${req.query.name}"-fermeh`, name: 'nam', list: [] })
        }
    })
}))
//
//---------------------------SEARCH FORM--------------------------------
//-----------------------------------AJAX-------------------------------
app.post('/fermeh/ajax/update-quantity-product', async (req, res) => {
    if (sdt != '') {
        let pool = await conn;
        let sqlString = `exec exe_updateCTGH '${sdt}',${parseInt(req.body.MASP)},${parseInt(req.body.SIZE)},${parseInt(req.body.SOLUONG)}`
        await pool.request().query(sqlString, (err, data) => {
        })
        let sqlString1 = `select GIA from LOAISANPHAM where MASP=${parseInt(req.body.MASP)}`
        await pool.request().query(sqlString1, (err, data) => {
            console.log(data.recordset)
            console.log('quantity-ajax')
            res.send({ error: 0, GIA: data.recordset[0].GIA })
        })
    }
    else {
        let pool = await conn;
        let sqlString = `select GIA from LOAISANPHAM where MASP=${parseInt(req.body.MASP)}`
        await pool.request().query(sqlString, (err, data) => {
            console.log(data.recordset)
            console.log('quantity-ajax')
            res.send({ error: 0, GIA: data.recordset[0].GIA })
        })
    }
})
app.post('/fermeh/ajax/update-size-product', async (req, res) => {
    let coo = req.cookies
    if (sdt != '') {
        let newSize = req.body.SIZE
        let pool = await conn;
        let sqlCart = `exec exe_renderCart '${sdt}'`
        let sqlString = `exec exe_updateSizeCTGH '${sdt}',${parseInt(req.body.MASP)},${parseInt(req.body.SIZE)},${parseInt(req.body.OLDSIZE)}`
        await pool.request().query(sqlCart, (err, data) => {
            let chk = false
            if (data.recordset.length > 0) {
                for (let obj of data.recordset) {
                    if (obj.SIZE == parseInt(newSize) && obj.MASP == parseInt(req.body.MASP)) {
                        chk = true
                        res.send({ error: 1 })
                    }
                }
                if (chk === false) {
                    pool.request().query(sqlString, (err, data) => {
                        console.log('update success')
                        res.send({ error: 0 })
                    })
                }
            }
            else {
                console.log('khong dc')
            }
        })
    }
    else {
        console.log(req.cookies)
        let cnt = 0;
        for (let item in coo) {
            if (item == 'loadProduct') continue
            let arr = item.split('_')
            if (arr[1].trim() == req.body.MASP && arr[2].trim() == req.body.SIZE) {
                cnt++;
            }
        }
        if (cnt === 1) res.send({ error: 1 })
        else {
            for (let item in coo) {
                let arr = item.split('_')
                if (arr[1].trim() == req.body.MASP.trim() && arr[2].trim() == req.body.OLDSIZE) {
                    console.log('arr', arr)
                    console.log('req', req.body.OLDSIZE, req.body.MASP, req.body.SIZE)
                    console.log(item)
                }
            }
            // res.cookie(`product_${req.body.MASP.trim()}_${req.body.SIZE}`, parseInt(req.body.SOLUONG))
            res.send({ error: 0 })
        }
        console.log(req.cookies)
        console.log('req body', JSON.stringify(req.body))
    }
})
//
//
app.post('/fermeh/ajax/request-locate-tinh', CatchAsync(async (req, res) => {
    let pool = await conn
    let sqlString = `exec exe_requestTinh`
    await pool.request().query(sqlString, (err, data) => {
        if (data.recordset.length > 0) {
            res.send({ tinh: data.recordset })
        }
    })
}))
//
//
app.post('/fermeh/ajax/request-locate-huyen', CatchAsync(async (req, res) => {
    let matinh = req.body.matinh
    let pool = await conn
    let sqlString = `exec exe_requestHuyen '${matinh}'`
    await pool.request().query(sqlString, (err, data) => {
        if (data.recordset.length > 0) {
            res.send({ huyen: data.recordset })
        }
    })

}))
//
//
app.post('/fermeh/ajax/request-locate-xa', CatchAsync(async (req, res) => {
    let mahuyen = req.body.mahuyen
    let pool = await conn
    let sqlString = `exec exe_requestXa '${mahuyen}'`
    await pool.request().query(sqlString, (err, data) => {
        if (data.recordset.length > 0) {
            res.send({ xa: data.recordset })
        }
    })

}))
app.post('/fermeh/ajax/validate-new-form-locate', CatchAsync(async (req, res) => {
    let pool = await conn;
    let sqlChkLocate = `exec exe_chkLocate '${sdt}'`
    let sqlUpdateDefault = `update DIACHI set MACDINH=0 where MACDINH=1 and MAKH=(select MAKH from KHACHHANG where SDT='${sdt}')`
    let name = req.body.name
    let phone = req.body.phone
    let locate = req.body.locate
    let tinh = req.body.tinh
    let huyen = req.body.huyen
    let xa = req.body.xa
    let chkbox = req.body.chkbox
    let radioHome = req.body.radioHome
    let radioOffice = req.body.radioOffice
    let kind; let defaultlc;
    if (req.body.add === 'true') console.log('add time')
    if (req.body.edit === 'true') console.log('edit time')
    if (radioHome === 'true') {
        kind = 'home'
    }
    else if (radioOffice === 'true') {
        kind = 'office'
    }
    if (chkbox === 'true') defaultlc = 1
    else defaultlc = 0
    let sqlAddLocate = `exec exe_addNewLocate '${sdt}',N'${locate}','${kind}','${xa}',${defaultlc},'${phone}',N'${name}'`
    var regexName = /^[a-zA-Z ]{2,30}$/g;
    var regexPhone = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (name === '' || name === null || name === undefined) {
        res.send({ name: false, phone: phone, locate: locate, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
        return
    }
    else {
        name = name.toLowerCase();
        name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        name = name.replace(/đ/g, "d");
        if (regexName.test(name)) {
            if (phone === '' || phone === null || phone === undefined) {
                res.send({ name: true, phone: false, locate: locate, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
                return
            }
            else {
                if (regexPhone.test(phone)) {
                    if (locate === '' || locate === null || locate === undefined) {
                        res.send({ name: true, phone: true, locate: false, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
                        return
                    } else {
                        if (tinh === '' || tinh === null || tinh === undefined || tinh === 'tinh') {
                            res.send({ name: true, phone: true, locate: true, tinh: false, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
                            return
                        } else {
                            if (huyen === '' || huyen === null || huyen === undefined || huyen === 'huyen') {
                                res.send({ name: true, phone: true, locate: true, tinh: true, huyen: false, xa: xa, chkbox: chkbox, radio: false })
                                return
                            } else {
                                if (xa === '' || xa === null || xa === undefined || xa === 'xa') {
                                    res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: false, chkbox: chkbox, radio: false })
                                    return
                                } else {
                                    if (radioHome === 'false' && radioOffice === 'false') {
                                        console.log('radio saiiii')
                                        res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: true, chkbox: chkbox, radio: false })
                                        return
                                    }
                                    else {
                                        if (req.body.add === 'true') {
                                            if (chkbox === 'true') {
                                                pool.request().query(sqlChkLocate, (err, data) => {
                                                    if (data.recordset.length > 0) {
                                                        pool.request().query(sqlUpdateDefault, async (err, data) => {
                                                            await pool.request().query(sqlAddLocate, (err, data) => {
                                                                console.log('add')
                                                                return
                                                            })
                                                        })
                                                        res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: true, chkbox: chkbox, radio: true })
                                                        return
                                                    }
                                                    else {
                                                        pool.request().query(sqlAddLocate, (err, data) => {
                                                            return
                                                        })
                                                        res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: true, chkbox: chkbox, radio: true })
                                                        return
                                                    }
                                                })
                                            }
                                            else {
                                                pool.request().query(sqlAddLocate, (err, data) => {
                                                    return
                                                })
                                                res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: true, chkbox: chkbox, radio: true })
                                                return
                                            }
                                        }
                                        else if (req.body.edit === 'true') {
                                            console.log('edit')
                                            let IDDC = req.body.IDDC
                                            let sqlEditLocate = `exec exe_editNewLocate '${sdt}',N'${locate}','${kind}','${xa}',${defaultlc},'${phone}',N'${name}',${parseInt(IDDC)}`
                                            pool.request().query(sqlEditLocate, (err, data) => {
                                                res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: true, chkbox: chkbox, radio: true })
                                                return
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    res.send({ name: true, phone: false, locate: locate, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
                    return
                }
            }
        } else {
            res.send({ name: false, phone: phone, locate: locate, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
            return
        }
    }
}))
//
//
app.post('/fermeh/ajax/request-delete-locate', CatchAsync(async (req, res) => {
    let iddc = parseInt(req.body.iddc)
    let pool = await conn
    let sqlString = `exec exe_deleteLocate '${sdt}',${iddc}`
    await pool.request().query(sqlString, (err, data) => {

    })
}))
//
//
app.post('/fermeh/ajax/set-default-locate-btn', CatchAsync(async (req, res) => {
    let pool = await conn
    let ID = parseInt(req.body.IDDC)
    let sql = `exec exe_updateDefaultLocate '${sdt}',${ID}`
    pool.request().query(sql, (err, data) => {
        res.send({ error: true })
    })
}))
//
//
app.post('/fermeh/ajax/setting/change-username', CatchAsync(async (req, res) => {
    let text = req.body.name.trim()
    let name = text.toLowerCase()
    let regexName = /^[a-zA-Z ]{2,30}$/g;
    name = name.toLowerCase();
    name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    name = name.replace(/đ/g, "d");
    if (regexName.test(name)) {
        let sql = `exec exe_updateTenKH '${sdt}',N'${text}'`
        let pool = await conn
        pool.request().query(sql, (err, data) => {
            taikhoan = text
            res.send({ error: true })
        })
    }
    else {
        res.send({ error: false })
    }
    console.log(text)
}))
// thay doi so dien thoai
app.post('/fermeh/ajax/setting/change-phonenumber', CatchAsync(async (req, res) => {
    var phone = req.body.phone
    var regexSDT = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (regexSDT.test(phone)) {
        let pool = await conn
        let sql = `exec exe_checkSDT '${phone.trim()}'`
        pool.request().query(sql, (err, data) => {
            if (data.recordset.length === 0) {
                let nsql = `exec exe_updateSDTKH @sdt='${sdt}',@nsdt='${phone.trim()}'`
                pool.request().query(nsql, (err, data) => {
                    sdt = phone
                    res.send({ error: true })
                })
            }
            else {
                res.send({ error: false })
            }
        })
    }
    else {
        res.send({ error: false })
    }
}))
// thay doi so dien thoai

//thay doi email
app.post('/fermeh/ajax/setting/change-email', CatchAsync(async (req, res) => {
    let regexMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let mail = req.body.email
    if (regexMail.test(mail)) {
        let sql = `exec exe_updateMailKH '${sdt}','${mail}'`
        let pool = await conn
        pool.request().query(sql, (err, data) => {
            res.send({ error: true, email: mail })
        })
    } else {
        res.send({ error: false })
    }
}))
//thay doi email

//thay doi mat khau
app.post('/fermeh/ajax/setting/change-password', CatchAsync(async (req, res) => {
    let cpass = req.body.currentpass
    let npass = req.body.newpass
    let regex_password = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (regex_password.test(cpass) && regex_password.test(npass)) {
        let cipherPass;
        let newPass;
        await axios({
            method: 'GET',
            url: 'https://api.hashify.net/hash/md5/hex?value=' + cpass,
            data: null
        }).then((res) => { cipherPass = res.data.Digest })
            .catch((err) => { console.log("errrrr", err) })
        // api mk moi
        await axios({
            method: 'GET',
            url: 'https://api.hashify.net/hash/md5/hex?value=' + npass,
            data: null
        }).then((res) => { newPass = res.data.Digest })
            .catch((err) => { console.log("errrrr", err) })
        let pool = await conn
        let sqlChk = `exec exe_findKH '${sdt}','${cipherPass}'`
        pool.request().query(sqlChk, async (err, data) => {
            if (data.recordset.length > 0) {
                let nsql = `exec exe_updatePassKH '${sdt}','${newPass}'`
                await pool.request().query(nsql, (err, data) => {
                    res.send({ error: true })
                })
            }
            else {
                res.send({ error: false })
            }
        })
    }
    else {
        res.send({ error: false })
    }
}))
//thay doi mat khau
//-----------------------------------AJAX-------------------------------
app.use(adminRoutes)
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