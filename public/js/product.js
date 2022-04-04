$(document).ready(() => {
    var li_size = document.querySelectorAll('.list-size li')
    for (let i of li_size) {
        i.onclick = () => {
            document.querySelector('.warning-text').innerText = ''
            for (let j of li_size) {
                j.classList.remove('style-border');
            }
            i.classList.toggle('style-border');
        }
    }
    var radio_button = document.querySelectorAll('.radio-button')
    document.querySelector('#add-to-cart').onclick = (e) => {
        let cnt = 0;
        for (let i of radio_button) {
            if (i.checked) cnt++;
        }
        if (cnt == 0) {
            e.preventDefault()
            document.querySelector('.warning-text').innerText = 'Vui lòng chọn size!'
        }
    }
    var addFav = document.querySelector("#add-to-love")
    var sizeFav = document.querySelector("#size_to_fav")
    addFav.onclick = (e) => {
        let cnt = 0;
        for (let i of radio_button) {
            if (i.checked) { cnt++; sizeFav.value = i.value }
        }
        if (cnt == 0) {
            e.preventDefault()
            document.querySelector('.warning-text').innerText = 'Vui lòng chọn size!'
        }
    }
})