var rewritePass = document.querySelector("#eyeRewritePass")
var newPass = document.querySelector("#eyeNewPass")
var settingItem = document.querySelectorAll(".setting-item")
var editLocate = document.querySelectorAll('.btn-edit-locate')

rewritePass.onclick = () => {
    if (document.querySelector("#rewritePass").type === 'password') {
        document.querySelector("#rewritePass").type = 'text'
    }
    else {
        document.querySelector("#rewritePass").type = 'password'
    }
}
newPass.onclick = () => {
    if (document.querySelector("#newPass").type === 'password') {
        document.querySelector("#newPass").type = 'text'
    }
    else {
        document.querySelector("#newPass").type = 'password'
    }
}
function chkDisplay() {
    for (let i of settingItem) {
        if (i.children[3].style.display === 'block') {
            i.children[0].classList.remove('width-100')
            i.children[1].style.display = 'block'
            i.children[2].style.display = 'block'
            i.children[3].style.display = 'none'
            i.style.backgroundColor = '#fff'
        }
    }
}
for (let i of settingItem) {
    i.children[2].onclick = () => {
        chkDisplay();
        i.children[0].classList.add('width-100')
        i.children[1].style.display = 'none'
        i.children[2].style.display = 'none'
        i.children[3].style.display = 'block'
        i.style.backgroundColor = '#ccc'
    }
    i.children[3].children[3].onclick = () => {
        i.children[0].classList.remove('width-100')
        i.children[1].style.display = 'block'
        i.children[2].style.display = 'block'
        i.children[3].style.display = 'none'
        i.style.backgroundColor = '#fff'
    }
}

$('#btnEditLocateBack').click(() => {
    $('#edit_locate_form_contain').removeClass('display-block')
    $('body').removeClass('prevent-scrolling')
})
$('.btn-edit-locate').click(() => {
    document.querySelector('#formEditLocate').action = "http://localhost:3000/fermeh/user/setting/update-locate"
    $.ajax({
        url: "http://localhost:3000/fermeh/ajax/request-locate-tinh",
        method: "POST"
    })
        .fail(() => {
            console.log('ajax tỉnh fail')
        })
        .done((res) => {
            for (let obj of res.tinh) {
                $('#selectEditLocateTinh').append(`<option value="${obj.MATP}">${obj.TEN}</option>`)
            }
        })
    $('#edit_locate_form_contain').addClass('display-block')
    $('body').addClass('prevent-scrolling')
    $('#selectEditLocateHuyen').prop('disabled', true)
    $('#selectEditLocateXa').prop('disabled', true)
})
for (let i of editLocate) {
    if (i.parentElement.parentElement.parentElement.children[3].value == 'true') {
        i.parentElement.parentElement.parentElement.children[0].children[0].children[2].classList.add('display-block')
    }
    i.onclick = () => {
        let name = i.parentElement.parentElement.parentElement.children[0].children[0].children[1].innerText
        let phone = i.parentElement.parentElement.parentElement.children[0].children[1].children[1].innerText
        let locate = i.parentElement.parentElement.parentElement.children[0].children[2].children[1].innerText
        let kind = i.parentElement.parentElement.parentElement.children[2]
        let defaultLocate = i.parentElement.parentElement.parentElement.children[3]
        document.querySelector('#inputEditLocateName').value = name
        document.querySelector('#inputEditLocatePhone').value = phone
        document.querySelector('#inputEditLocateDetail').value = locate
        if (kind.value == 'home') {
            $('#radioEditLocateHome').prop('checked', true);
        }
        else {
            $('#radioEditLocateOffice').prop('checked', true);
        }
        if (defaultLocate.value == 'true') {
            $('#checkboxEditLocate').prop('checked', true);
            $('#checkboxEditLocate').prop('disabled', true);
        }
    }
}
$('#selectEditLocateTinh').change(() => {
    console.log('change tinh')
    let va = document.querySelector('#selectEditLocateTinh').value
    if (va != 'tinh') {
        $('#selectEditLocateHuyen').prop('disabled', false)
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/request-locate-huyen",
            method: "POST",
            data: { matinh: va.trim() }
        })
            .fail(() => { console.log('request huyện fail') })
            .done((res) => {
                for (let obj of res.huyen) {
                    $('#selectEditLocateHuyen').append(`<option value="${obj.MAQH}">${obj.TEN}</option>`)
                }
            })

    }
    else {
        $('#selectEditLocateHuyen').prop('disabled', true)
        $('#selectEditLocateXa').prop('disabled', true)
    }
})

$('#selectEditLocateHuyen').change(() => {
    console.log('change huyen')
    let va = document.querySelector('#selectEditLocateHuyen').value
    if (va != 'huyen') {
        $('#selectEditLocateXa').prop('disabled', false)
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/request-locate-xa",
            method: "POST",
            data: { mahuyen: va.trim() }
        })
            .fail(() => { console.log('request xã fail') })
            .done((res) => {
                for (let obj of res.xa) {
                    $('#selectEditLocateXa').append(`<option value="${obj.MAXA}">${obj.TEN}</option>`)
                }
            })
    }
    else {
        $('#selectEditLocateXa').prop('disabled', true)
    }
})
function resetEditLocateForm() {
    document.querySelector('#inputEditLocateName').value = ""
    document.querySelector('#inputEditLocatePhone').value = ""
    document.querySelector('#inputEditLocateDetail').value = ""
    $('#selectEditLocateTinh').empty()
    $('#selectEditLocateTinh').append(`<option selected value="tinh">Tỉnh/Thành phố</option>`)
    $('#selectEditLocateHuyen').empty()
    $('#selectEditLocateHuyen').append(`<option selected value="huyen">Quận/Huyện</option>`)
    $('#selectEditLocateXa').empty()
    $('#selectEditLocateXa').append(`<option selected value="xa">Phường/Xã</option>`)
    $('#checkboxEditLocate').removeAttr('checked');
    $('#radioEditLocateHome').prop('checked', false);
    $('#radioEditLocateOffice').prop('checked', false);
    $('#checkboxEditLocate').prop('checked', false);
    $('#checkboxEditLocate').prop('disabled', false);
    // $('.spanDefaultLocateLabel').removeClass('display-block')

}
$('#btnEditAddLocate').click(() => {
    document.querySelector('#formEditLocate').action = "http://localhost:3000/fermeh/user/setting/new-locate"
    resetEditLocateForm()
    $.ajax({
        url: "http://localhost:3000/fermeh/ajax/request-locate-tinh",
        method: "POST"
    })
        .fail(() => {
            console.log('ajax tỉnh fail')
        })
        .done((res) => {
            for (let obj of res.tinh) {
                $('#selectEditLocateTinh').append(`<option value="${obj.MATP}">${obj.TEN}</option>`)
            }
        })
    $('#edit_locate_form_contain').addClass('display-block')
    $('body').addClass('prevent-scrolling')
    $('#selectEditLocateHuyen').prop('disabled', true)
    $('#selectEditLocateXa').prop('disabled', true)
})
// submit them dia chi moi validate
function validateForm() {
    let name = $('#inputEditLocateName').val()
    let phone = $('#inputEditLocatePhone').val()
    let locate = $('#inputEditLocateDetail').val()
    let tinh = $('#selectEditLocateTinh').val()
    let huyen = $('#selectEditLocateHuyen').val()
    let xa = $('#selectEditLocateXa').val()
    let chkbox = $('#checkboxEditLocate').attr('checked')
    let radioHome = $('#radioEditLocateHome').val('checked')
    let radioOffice = $('#radioEditLocateOffice').attr('checked')
    console.log(name)
    if (name === '' || name === null || name === undefined) {
        $('#spanWarningLocateForm').text('Họ và tên không hợp lệ!')
        $('#inputEditLocateName').addClass('input-border-warning')
        return false
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
        var regexName = /^[a-zA-Z ]{2,}$/g;
        if (regexName.test(name)) {
            $('#spanWarningLocateForm').text('')
            $('#inputEditLocateName').removeClass('input-border-warning')
        } else {
            $('#spanWarningLocateForm').text('Họ và tên không hợp lệ!')
            $('#inputEditLocateName').addClass('input-border-warning')
            return false
        }
    }
}
$('#btnEditLocateSubmit').click((e) => {
    // e.preventDefault();
    let chk = validateForm()
    if (chk === false) e.preventDefault()
})