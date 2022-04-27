var list_delete_btn = document.querySelectorAll(".delete_btn")
let size_choice = document.querySelectorAll(".size-choice")
let quantity_choice = document.querySelectorAll(".quantity-choice")
let size_detail = document.querySelectorAll(".size-detail")
let quantity_detail = document.querySelectorAll(".quantity-detail")
for (let i = 0; i < size_choice.length; i++) {
    size_choice[i].onclick = () => {
        for (let j = 0; j < quantity_choice.length; j++) {
            if ($(quantity_detail[j]).is(":visible")) {
                quantity_detail[j].classList.remove("display-class")
            }
        }
        for (let k = 0; k < size_choice.length; k++) {
            if (k != i && $(size_detail[k]).is(":visible")) {
                size_detail[k].classList.remove("display-class")
            }
        }
        size_detail[i].classList.toggle("display-class")
        for (let a of size_detail[i].children[0].children) {
            a.onclick = () => {
                // console.log('id sp', a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id)
                let arr = a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id.split('_')
                a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id
                    = 'product_' + arr[1] + '_' + a.textContent.trim()
                let old_size = arr[2]
                let m_id = a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id
                let arraf = m_id.split('_')
                a.parentElement.parentElement.parentElement.children[0].children[0].innerHTML = `<span style="margin-right: 3px;">${a.textContent.trim()}</span>`
                a.parentElement.parentElement.classList.remove('display-class')
                $.ajax({
                    url: "http://localhost:3000/fermeh/ajax/update-size-product",
                    method: "POST",
                    data: { MASP: arraf[1], SIZE: parseInt(arraf[2]), SOLUONG: parseInt(quantity_choice[i].children[0].textContent.trim()), OLDSIZE: parseInt(old_size.trim()) }
                })
                    .fail(() => { })
                    .done((res) => {
                        if (res.error === 0) {
                            document.cookie = `product_${arraf[1].trim()}_${old_size.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                            document.cookie = `product_${arraf[1].trim()}_${arraf[2].trim()}` + "=" + parseInt(quantity_choice[i].children[0].textContent.trim()) + ';path=/';
                            console.log('success')
                        }
                        else if (res.error === 1) {
                            location.reload()
                            alert('Không được chọn hai sản phẩm cùng size trong giỏ hàng!')
                        }
                    })
            }
        }
    }
}
for (let i = 0; i < quantity_choice.length; i++) {
    quantity_choice[i].onclick = () => {
        for (let j = 0; j < quantity_choice.length; j++) {
            if (j != i && $(quantity_detail[j]).is(":visible")) {
                quantity_detail[j].classList.remove("display-class")
            }
        }
        for (let k = 0; k < size_choice.length; k++) {
            if ($(size_detail[k]).is(":visible")) {
                size_detail[k].classList.remove("display-class")
            }
        }
        quantity_detail[i].classList.toggle("display-class")
        for (let a of quantity_detail[i].children[0].children) {
            a.onclick = () => {
                // console.log('id sp', a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id)
                let arr = a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id.split('_')
                let OLDSOLUONG = parseInt(a.parentElement.parentElement.parentElement.children[2].children[0].textContent)
                a.parentElement.parentElement.parentElement.children[2].children[0].innerHTML = `<span style="margin-right: 3px;">${a.textContent.trim()}</span>`
                a.parentElement.parentElement.classList.remove('display-class')
                $.ajax({
                    url: "http://localhost:3000/fermeh/ajax/update-quantity-product",
                    method: "POST",
                    data: { MASP: arr[1], SIZE: parseInt(arr[2].trim()), SOLUONG: parseInt(a.textContent.trim()) }
                })
                    .fail(() => { })
                    .done((res) => {
                        if (res.error === 0) {
                            document.cookie = `product_${arr[1].trim()}_${arr[2].trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                            document.cookie = `product_${arr[1].trim()}_${arr[2].trim()}= ${parseInt(a.textContent.trim())};path=/`;
                            quantity_choice[i].parentElement.parentElement.parentElement.parentElement.children[1].children[0].innerText = ((res.GIA * parseInt(a.textContent.trim())).toLocaleString('vi', {
                                style: 'currency', currency
                                    : 'VND'
                            }))
                            document.querySelector('#price_before').title = parseInt(document.querySelector('#price_before').title) + (parseInt(a.textContent.trim()) - OLDSOLUONG) * res.GIA
                            document.querySelector('#price_before').textContent = (parseInt(document.querySelector('#price_before').title).toLocaleString('vi', {
                                style: 'currency', currency
                                    : 'VND'
                            }))
                            document.querySelector('#price_total').title = parseInt(document.querySelector('#price_before').title) + 30000
                            document.querySelector('#price_total').textContent = (parseInt(document.querySelector('#price_total').title).toLocaleString('vi', {
                                style: 'currency', currency
                                    : 'VND'
                            }))
                            document.querySelector()
                            console.log('success')
                        }
                    })
            }
        }
    }
}
for (let i of list_delete_btn) {
    i.addEventListener("click", () => {
        document.cookie = `product_${i.value}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.querySelector(`#product_${i.value}`).style.display = "none"
        let money = parseInt(document.querySelector(`#price_${i.value}`).title)
        let bf = document.querySelector("#price_before")
        let tt = document.querySelector("#price_total")
        let value_bf = (parseInt(bf.title) - money)
        let value_tt = (parseInt(tt.title) - money)
        bf.innerText = value_bf.toLocaleString('vi', {
            style: 'currency',
            currency: 'VND'
        })
        tt.innerText = value_tt.toLocaleString('vi', {
            style: 'currency',
            currency: 'VND'
        })
        bf.title = value_bf
        tt.title = value_tt
        if (parseInt(value_bf) === 0) {
            document.querySelector(".non-product").style.display = "block"
        }
    })
}
// $('body').click(() => {
//     var k = false;
//     console.log('body click')
//     function q_count() {
//         let k = 0
//         for (let i of quantity_choice) {
//             i.onclick = () => {
//                 if (k == 0) k = 1;
//                 console.log('quan')
//                 return 0;
//             }
//         }
//     }
//     function s_count() {

//         for (let i of size_choice) {
//             i.onclick = () => {
//                 console.log('size')
//                 k = true
//                 return k;
//             }
//         }
//         return k;
//     }
//     console.log(q_count())
//     console.log(k)
//     console.log(s_count())
//     if (q_count() != 0 && s_count() != 0) {
//         for (let j = 0; j < quantity_choice.length; j++) {
//             if ($(quantity_detail[j]).is(":visible")) {
//                 quantity_detail[j].classList.remove("display-class")
//             }
//         }
//         for (let k = 0; k < size_choice.length; k++) {
//             if ($(size_detail[k]).is(":visible")) {
//                 size_detail[k].classList.remove("display-class")
//             }
//         }
//     }
// })
