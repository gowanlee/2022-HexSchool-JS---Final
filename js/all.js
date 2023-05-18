// 網頁初始畫面
function init() { 
    getProductsList();
    getCartsList();
}
init();

// 取得產品列表 API
let productsData = [];
function getProductsList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then((result) => {
        //console.log(result.data.products);
        productsData = result.data.products;
        renderProductsList(productsData);
    })
    .catch((err) => {
        console.log(err);
    });
}

// 篩選產品列表
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", e => {
    const category = e.target.value;
    let selectData = [];
    if (category === "全部") {
        renderProductsList(productsData);
        return;
    }
    productsData.forEach(item => {
        if (category === item.category) {
            selectData.push(item);
        }
    })
    renderProductsList(selectData);
})

// 渲染產品列表畫面
const productWrap = document.querySelector(".productWrap");
function renderProductsList(dataState) { 
    let str = "";
    dataState.forEach(item => {
        str += `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="${item.title}">
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${thousands(item.origin_price)}</del>
        <p class="nowPrice">NT$${thousands(item.price)}</p>
    </li>`
    })
    productWrap.innerHTML = str;
}

// 取得購物車列表 API
let cartsData = [];
let cartsTotal = 0;
function getCartsList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((result) => {
        //console.log(result.data.carts);
        cartsData = result.data.carts;
        cartsTotal = result.data.finalTotal;
        renderCartsList ();
    })
    .catch((err) => {
       console.log(err); 
    });
}

// 渲染購物車列表畫面
const cartSum = document.querySelector(".cartSum");
const shoppingCartTableTbody = document.querySelector(".shoppingCart-table-tbody");
const discardAllBtn = document.querySelector(".discardAllBtn");
function renderCartsList () {
    let str = "";
    cartsData.forEach(item => {
        // 如果購物車數量小於1 則將disabled加入
        let disabled = "";
        if (item.quantity <= 1) {
            disabled = "disabled";
        }
        str += 
        `<tr>
            <td>
                <div class="cardItem-title" data-id="${item.product.id}">
                    <img src="${item.product.images}" alt="${item.product.title}">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${thousands(item.product.price)}</td>
            <td><input class="quantityBtn" type="button" value="－" data-id="${item.id}" ${disabled}> ${item.quantity} <input class="quantityBtn" type="button" value="＋" data-id="${item.id}"></td>
            <td>NT$${thousands(item.product.price * item.quantity)}</td>
            <td class="discardBtn"">
                <a href="#" class="material-icons" data-id="${item.product.id}">
                    clear
                </a>
            </td>
        </tr>`
    })

    if (cartsData.length === 0) {
        shoppingCartTableTbody.innerHTML = `<td><p>目前購物車沒有商品</p></td>`;
        discardAllBtn.setAttribute("aria-disabled","true");
    }else if (cartsData.length !== 0) {
        shoppingCartTableTbody.innerHTML = str;
        discardAllBtn.setAttribute("aria-disabled","false");
    }

    cartSum.textContent = `$${thousands(cartsTotal)}`;
}

// 加入購物車 API
function addCartsItem(productId,quantity) { 
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": productId,
            "quantity": quantity
        }
    })
    .then((result) => {
        //console.log(result.data);
        getCartsList();
        alert("已新增至購物車");
    })
    .catch((err) => {
        console.log(err);
    });
}

// 監聽產品列表點擊事件
const shoppingCartTable = document.querySelector(".shoppingCart-table");
productWrap.addEventListener("click",e => {
    e.preventDefault();
    // 點擊加入購物車按鈕
    if (e.target.getAttribute("class") === "addCardBtn"){
        //console.log(e.target.dataset.id);
        let productId = e.target.dataset.id;
        let quantity = 1;
        cartsData.forEach(item => {
            if (item.product.id === productId){
                quantity = item.quantity+=1;
            }
        })
        addCartsItem(productId,quantity);
    }
})

// 清空購物車 API
function deleteAllCartsList() {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((result) => {
        //console.log(result.data.carts);
        getCartsList();
        alert("已刪除購物車所有品項");
    })
    .catch((err) => {
        console.log(err);
    });
}

// 刪除購物車特定品項 API
function deleteCartsItem(cartId) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then((result) => {
        //console.log(result.data);
        getCartsList();
        alert("刪除成功");
    })
    .catch((err) => {
        console.log(err);
    });
}

// 修改購物車商品數量 API
function editCartsItemQuantity(cartId,quantity) {
    axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "id": cartId,
            "quantity": quantity
        }
    })
    .then((result) => {
        //console.log(result.data.carts);
        getCartsList();
        alert("修改數量成功");
    })
    .catch((err) => {
        console.log(err);
    });
}

// 監聽購物車列表點擊事件
shoppingCartTable.addEventListener("click",e => { 
    e.preventDefault();
    // 刪除所有品項
    if (e.target.getAttribute("class") === "discardAllBtn") {
        let confirm = window.confirm("確定刪除購物車所有品項嗎？");
        if (confirm){
            deleteAllCartsList();
        }
    }

    // 刪除特定品項
    if (e.target.getAttribute("class") === "material-icons") {
        let productId = e.target.dataset.id;
        let cartId = "";
        let confirm = false;
        cartsData.forEach(item => {
            if (productId === item.product.id){
                cartId = item.id;
                confirm = window.confirm(`確定要將 ${item.product.title} 從購物車刪除嗎？`);
            } 
        })
        if (confirm){
            deleteCartsItem(cartId);
        }else{
            e.target.removeAttr
        }
    }

    // 修改品項數量
    if (e.target.value === "－") {
        let cartId = e.target.dataset.id;
        let quantity = Number(e.target.nextSibling);
        cartsData.forEach(item => {
            if (item.id === cartId) {
                quantity = item.quantity - 1;
            }
        })
        editCartsItemQuantity(cartId,quantity);
    }
    if (e.target.value === "＋") {
        let cartId = e.target.dataset.id;
        let quantity = Number(e.target.nextSibling);
        cartsData.forEach(item => {
            if (item.id === cartId) {
                quantity = item.quantity + 1;
            }
        })
        editCartsItemQuantity(cartId,quantity);
    }
})

// 送出訂單 API
function submitOrders(name,tel,email,address,payment) {
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
            "user": {
                "name": name,
                "tel": tel,
                "email": email,
                "address": address,
                "payment": payment
            }
        }
    })
    .then((result) => {
        //console.log(result.data);
        getCartsList();
        if (result.data.status === true){
            orderInfoForm.reset();
            alert("已成功送出訂單");
        }
    })
    .catch((err) => {
        console.log(err.data);    
    });
}

const orderInfoForm = document.querySelector(".orderInfo-form");
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const inputs = document.querySelectorAll("input[name]");

// Validate 表單驗證規則
const constraints = {
    "姓名": {
        presence: {
            message: "必填"
        }
    },
    "電話": {
        presence: {
            message: "必填"
        },
        numericality: {
            onlyInteger: true,
            message: "須為數字"
        }
    },
    "Email": {
        presence: {
            message: "必填"
        },
        email: {
            message: "格式錯誤"
        }
    },
    "寄送地址": {
        presence: {
            message: "必填"
        }
    }
}

// 監聽預定資料表單點擊事件
orderInfoForm.addEventListener("click",e => {
    e.preventDefault();
    if (e.target.getAttribute("class") === "orderInfo-btn" && cartsData.length < 1) {
        alert("購物車目前沒有商品");
        return;
    }
    if (e.target.getAttribute("class") === "orderInfo-btn" && cartsData.length > 0) {  if (customerName.value == "" || customerPhone.value == "" || customerEmail.value == "" || customerAddress.value == ""){
        alert("請確實填寫訂單資料");
        return;
        }
    }
    if (cartsData.length > 0) {
        // Validate 表單驗證
        inputs.forEach(item => {
            item.addEventListener("change",() => {
                let errors = validate(orderInfoForm, constraints);
                item.nextElementSibling.textContent = "";
                if (errors) {
                    Object.keys(errors).forEach(keys => {
                        return document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
                    })
                }
            })
        })
    }
    if (e.target.getAttribute("class") === "orderInfo-btn" && validate(orderInfoForm, constraints) === undefined) {
        submitOrders(customerName.value,customerPhone.value,customerEmail.value,customerAddress.value,tradeWay.value);
    }
})


// 價錢千分位
function thousands (price) {
    if (price) {
      price += "";
      let arr = price.split(".");
      const regx = /(\d{1,3})(?=(\d{3})+$)/g;
  
      return arr[0].replace(regx, "$1,") + (arr.length == 2 ? "." + arr[1] : "");
    } 
    else {
      return "";
    }
}