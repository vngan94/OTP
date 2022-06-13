function validate() {
    let regexMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var mail = $('#emailUser').val()

    if (regexMail.test(mail)) {
        $('#emailUser').removeClass('warning')
        $('#warning').text('')
    }
    else {
        $('#emailUser').addClass('warning')
        $('#warning').text('Địa chỉ email không hợp lệ!')
        return false
    }
    $.ajax({
        url: "/fermeh/fogot-password",
        method: "POST",
        data: { mail: mail }
    })
        .done((res) => {
            console.log(res)
            if (res.done == true) {
                alert('Tạo mật khẩu mới thành công!')
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