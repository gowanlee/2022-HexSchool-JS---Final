// 初始畫面
function init() {
    getOrdersList();
} 
init();

// 取得訂單列表 API
let ordersData = [];
function getOrdersList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers: {
            "Authorization": token
        }
    })
    .then((result) => {
        //console.log(result.data.orders);
        ordersData = result.data.orders;
        renderOrdersList();
        renderChart();
    })
    .catch((err) => {
        //console.log(err);  
    });
}

// 整理圖表陣列資料集並渲染訂單圖表
function renderChart() {
    // 組圖表陣列資料
    let chartData = [];

    // 篩選全部品項
    // let obj = {};
    // let title = "";
    // let total = 0;

    // ordersData.forEach(item => {
    //     item.products.forEach(product => {
    //         title = product.title;
    //         total = product.price * product.quantity;
    //         if (obj[title] == undefined){
    //             obj[title] = total;
    //         }else {
    //             obj[title] += total;
    //         }
    //     })
    // })
    // Object.keys(obj).forEach(item => {
    //     let value = obj[item];
    //     chartData.push([item,value]);
    // })

    // 篩選"Louvre 雙人床架／雙人加大","Antony 雙人床架／雙人加大","Jordan 雙人床架／雙人加大","其他"
    // let obj = {
    //     "Louvre 雙人床架／雙人加大": 0,
    //     "Antony 雙人床架／雙人加大": 0,
    //     "Jordan 雙人床架／雙人加大": 0,
    //     "其他": 0
    // }
    // ordersData.forEach(item => {
    //     item.products.forEach(productItem => {
    //         if(obj[productItem.title] === undefined){
    //             obj["其他"] += productItem.price * productItem.quantity;
    //         }else {
    //             obj[productItem.title] += productItem.price * productItem.quantity 
    //         }
    //     })
    // })
    // let keys = Object.keys(obj);
    // let values = Object.values(obj);
    // keys.forEach((item,index) => {
    //     let value = values[index];
    //     chartData.push([item,value]);
    // })

    // 篩選全品項消費最高前三名，之後的就算其他類別
    let obj = {};
    ordersData.forEach(item => {
        item.products.forEach(productsItem => {
            if (obj[productsItem.title] === undefined){
                obj[productsItem.title] = productsItem.price * productsItem.quantity;
            }else {
                obj[productsItem.title] += productsItem.price * productsItem.quantity;
            }
        })
    })
    // 將物件資料轉為C3陣列格式
    let key = Object.keys(obj);
    key.forEach(item => {
        let ary = [];
        ary.push(item,obj[item]);
        chartData.push(ary);
    })
    // 金額從高到低排名
    chartData.sort((a,b) => {
        return b[1] - a[1];
    })
    // 如果超過四筆就統整為其他
    if (chartData.length > 3) {
        // 加總前三名之後的金額
        let othersPrice = 0;
        chartData.forEach((item,index) => {
            if (index > 2){
                othersPrice += item[1];
            }
        })
        chartData.splice(3 , chartData.length-1); // 刪除第三筆開始之後的資料
        chartData.push(["其他",othersPrice]);
        // 再次排序其他類別
        chartData.sort((a,b) => {
            return b[1] - a[1];
        })
    }
    //取產品名稱編譯成c3要的顏色格式
    let colors = {};
    colors[chartData[0][0]] = "#DACBFF";
    colors[chartData[1][0]] = "#9D7FEA";
    colors[chartData[2][0]] = "#5434A7";
    if (chartData.length > 3) {
        colors[chartData[3][0]] = "#301E5F";
    }

    // 渲染訂單圖表
    c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: chartData,
            colors: colors
        }
    });
}

// 渲染訂單列表
const orderPageTableTbody = document.querySelector(".orderPage-table-tbody");
function renderOrdersList() {
    let str = "";
    ordersData.forEach(order => {
        // 組訂單產品字串
        let productsItem = "";
        order.products.forEach(products => {
            productsItem += `${products.title} * ${products.quantity}`+ "<br>";
        })

        // 組日期字串
        const millisecond = order.createdAt*1000; // 先轉成毫秒
        const date = new Date(millisecond);
        const newDate = `${date.getFullYear()} / ${date.getMonth()+1} / ${date.getDate()}`;

        // 判斷訂單狀態
        let orderStatus = "";
        if (order.paid === false){
            orderStatus = "未處理";
        }else{
            orderStatus = "已處理";
        }

        // 組訂單字串
        str += `
            <tr>
                <td>${order.id}</td>
                <td>
                    <p>${order.user.name}</p>
                    <p>${order.user.tel}</p>
                </td>
                <td>${order.user.address}</td>
                <td>${order.user.email}</td>
                <td>
                    <p>${productsItem}</p>
                </td>
                <td>${newDate}</td>
                <td>
                    <a href="#" class="orderStatus" data-id="${order.id}" data-status="${order.paid}">${orderStatus}</a>
                </td>
                <td>
                    <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${order.id}">
                </td>
            </tr>`
    })
    orderPageTableTbody.innerHTML = str;
}

// 刪除全部訂單 API
function deleteAllOrdersList() {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers: {
            "Authorization": token
        }
    })
    .then((result) => {
        //console.log(result.data);
        alert("已刪除全部訂單");
        init();
    })
    .catch((err) => {
        console.log(err);
    });
}

// 監聽清除全部訂單按鈕點擊事件
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",e => {
    e.preventDefault();
    let confirm = window.confirm("是否要刪除全部訂單？")
    if (!confirm){
        return;
    }else{
        deleteAllOrdersList();
    }
})

// 刪除特定訂單 API
function deleteOrdersItem(orderId) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,{
        headers: {
            "Authorization": token
        }
    })
    .then((result) => {
        //console.log(result.data);
        alert("已成功刪除此筆訂單");
        getOrdersList();
    })
    .catch((err) => {
        console.log(err.data);
    });
}

// 修改訂單狀態 API
function editOrdersStatus(orderId,orderStatus) {
    let newOrderStatus;
    if (orderStatus === "false"){
        newOrderStatus = true;
    }else if (orderStatus === "true"){
        newOrderStatus = false;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`,{
        "data": {
            "id": orderId,
            "paid": newOrderStatus
        }
    },{
        headers: {
            "Authorization": token
        }
    })
    .then((result) => {
        //console.log(result.data);
        getOrdersList();
        alert("已修改訂單狀態");
    })
    .catch((err) => {
        console.log(err);
    });
}

// 監聽訂單列表點擊事件
const orderPageTable = document.querySelector(".orderPage-table");
orderPageTable.addEventListener("click",e => {
    e.preventDefault();
    let id = e.target.dataset.id;

    // 點擊刪除特定訂單
    if (e.target.getAttribute("class") === ("delSingleOrder-Btn")) {
        let confirm = window.confirm("是否要將此筆訂單刪除？");
        if (!confirm) {
            return;
        }else {
            deleteOrdersItem(id);
        }
    }
    
    // 點擊修改訂單狀態
    if (e.target.getAttribute("class") === ("orderStatus")){
        let confirm = window.confirm("是否確認修改訂單狀態？");
        if (!confirm) {
            return;
        }else {
            let status = e.target.dataset.status;
            editOrdersStatus(id,status);
        }
    }
})