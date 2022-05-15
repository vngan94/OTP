$('#btn_close_view').click((e) => {
    e.preventDefault()
    $('#contain_detail_product').empty()
    $('#view_list_product').hide()
})

var view = document.querySelectorAll('.link_view_product')
for (let i of view) {
    i.onclick = () => {
        $.ajax({
            url: "http://localhost:3000/fermeh/admin/product-category/detail",
            method: "POST",
            data: { masp: i.parentElement.parentElement.parentElement.children[0].innerText.split("#")[1] }
        })
            .done((res) => {
                if (res.sp.length > 0) {
                    for (let i of res.sp) {
                        $('#contain_detail_product').append(`
                        <tr>
                            <td>${i.MASP}</td>
                            <td>${i.SIZE}</td>
                            <td>${i.SL}</td>
                      </tr>
                        `)
                    }
                }
            })
            .fail(() => {
                alert('fail')
            })
        $('#view_list_product').show()
    }
}