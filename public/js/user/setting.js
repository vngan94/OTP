var rewritePass = document.querySelector("#eyeRewritePass")
var newPass = document.querySelector("#eyeNewPass")
var settingItem = document.querySelectorAll(".setting-item")

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

