$('#select_status_filter').change(() => {
  $.ajax({
    url: "/fermeh/admin/orders/status-filter",
    method: "POST",
    data: { data: $('#select_status_filter').val() }
  })
    .done((res) => {
      console.log(res)
      if (res.done == false) return
      else {
        $('#contain_all_bill').empty()
        for (let i of res.data) {
          var tr
          if (i.HUY == true) {
            tr = $('#contain_all_bill').append(`<tr style="color:#ccc;"></tr>`)
          }
          else {
            tr = $('#contain_all_bill').append(`<tr></tr>`)
          }
          tr.append(`<td>#${i.MAHD}</td>`)
          if (i.MAKH == null || i.MAKH == '') {
            tr.append(`<td>${i.TEN}</td>`)
          } else {
            tr.append(`<td>${i.TENKH}</td>`)
          }
          tr.append(`
            <td title="${i.TONGTIEN}">${i.TONGTIEN.toLocaleString('vi', { style: 'currency', currency: 'VND' })}</td>
            <td>${new Date(i.NGAYLAP).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            <td>${i.PHUONGTHUC}</td>
          `)
          if (i.HUY == true) {
            tr.append(`<td>Đã hủy</td>`)
          } else {
            tr.append(`<td>Xác nhận</td>`)
          }
          tr.append(`
          <td>
          <div class="d-flex align-items-center gap-3 fs-6">
            <form action="/fermeh/admin/detail-orders" method="get">
              <input type="text" name="infor_detail_bill" id="infor_detail_bill" style="display: none;" value="${i.MAHD}">
              <button style="border:none;background: none;">
                <a href="" class="text-primary" data-bs-toggle="tooltip"  data-bs-original-title="Chi tiết" aria-label="Views" style="pointer-events: none;">
                  <i class="bi bi-eye-fill"></i>
                </a>
              </button>
            </form>
          </div>
         </td>
          `)
          $('#contain_all_bill').append(tr)
        }
      }
    })
    .fail(() => {
      alert('ajax fail!!')
    })
})