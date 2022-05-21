var cancel = document.querySelectorAll('.cancel_bill_btn')


for (let i of cancel) {
    i.onclick = () => {
        var rel = confirm('Xác nhận hủy đơn hàng?')
        if (rel) {
            var id = i.parentElement.children[0].value
            $.ajax({
                url: "/fermeh/user/order/cancel-order",
                method: "POST",
                data: { mahd: id }
            })
                .done((res) => {
                    if (res.done == true) {
                        alert('Hủy hóa đơn thành công!!')
                        location.reload()
                    }
                })
                .fail(() => {
                    alert('ajax fail!!')
                })
        }
    }
}