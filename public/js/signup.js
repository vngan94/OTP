

function validate() {
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    var regex_password = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    var phone = $('#phone').val()
    var username = $('#username').val()
    var password = $('#password').val()
    if (vnf_regex.test(phone)) {
        $('#phone').removeClass('warning')
        $('#warning').text('')
    } else {
        $('#phone').addClass('warning')
        $('#warning').text('Số điện thoại không đúng!')
        return false
    }
    if (regex_password.test(password)) {
        $('#password').removeClass('warning')
        $('#warning').text('')
    }
    else {
        $('#password').addClass('warning')
        $('#warning').text('Mật khẩu phải có ít nhất 8 kí tự!')
        return false
    }
    $.ajax({
        url: "/fermeh/signup",
        method: "POST",
        data: { name: username, phoneNumber: phone, password: password }
    })
        .done((res) => {
            console.log(res)
            if (res.done == true) {
                alert('Đăng ký thành công!')
                window.location.href = "http://localhost:3000/fermeh/login"
            } else {
                $('#warning').text(res.message)
            }
        })
        .fail(() => {
            alert('ajax fail!')
        })
    return false
}