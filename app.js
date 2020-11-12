
// variables
const productsDOM = document.querySelector(".products-container");
const cartItems = document.querySelector(".cart-count");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector('.cart-details');
const orderTotal = document.querySelector('.order-total');
const cartTotalDiscount = document.querySelector('.cart-discount');

let cart = [];

// products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map(item => { 
        const  id   = item.id;
        const {actual, display} = item.price;
        const discount = item.discount;
        const name = item.name;
        const image = item.image;
        return { id, actual, display, discount, name, image };
      });
      console.log(products);

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// ui
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      
      var actualPrice = Number(product.actual);
      var discoutValue = Number(product.discount)/100;
      var afterDiscount = actualPrice - (actualPrice * discoutValue);
      var totalPrice = afterDiscount.toFixed(2);
      result += `
      <div class="item">
      <span class="item__offer-tag">${product.discount}%</span>
      <img class="item__img" src="${product.image}">
      <div class="item__desc">
          <h3 class="item__title">${product.name}</h3>
          <span class="item__actualPrice strike-out">$${product.actual}</span>
          <span class="item__totalPrice"><strong> $${totalPrice}</strong></span>
          <button class="btn item__button" data-id=${product.id}>Add to cart</button>
      </div>
  </div>
  `;
});
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".btn")];
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      } else {
        button.addEventListener("click", event => {
          // disable button
          event.target.innerText = "In Bag";
          event.target.disabled = true;
          // add to cart
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          this.setCartValues(cart);
          this.addCartItem(cartItem);
        });
      }
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    let discountPrice = 0;
    let productTotal = 0;
    
    cart.map(item => {
      let afterDiscount= parseFloat((item.actual - ( item.actual*item.discount/100 ))).toFixed(2);
      let price = Number(afterDiscount);
      tempTotal += item.actual * item.amount;
      console.log(tempTotal)
      itemsTotal += item.amount;
      productTotal += price * item.amount;
      discountPrice = (tempTotal - price).toFixed(2);
    });
    
    cartTotal.innerText = "$" + parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    cartTotalDiscount.innerText = "$" + discountPrice;
    orderTotal.innerText = "$" + productTotal;
    
  }

  addCartItem(item) {
    const div = document.createElement("div");
    let afterDiscount=(item.actual - ( item.actual*item.discount/100 )).toFixed(2);
    console.log(afterDiscount);
    div.classList.add("cart-items");
    div.innerHTML = `<!-- cart item -->
            <!-- item image -->
            <div class="cart-items-details">
                <img class="cart-items-details__img" src="${item.image}" width="100" height="100">
                <span class="cart-items_details__title">${item.name}</span>
                <button class="cart-items-details__button remove-item" data-id=${item.id}>X</button>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">
                ${item.amount}
              </p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
            <span class="cart-price cart-column">$${afterDiscount}</span>
            <!-- item functionality -->
        
          <!-- cart item -->
    `;
    cartContent.appendChild(div);
    console.log(cartContent);
  }
  cartLogic() {
    
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cart = cart.filter(item => item.id !== id);
        console.log(cart);

        this.setCartValues(cart);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttons.forEach(button => {
          if (parseInt(button.dataset.id) === id) {
            button.disabled = false;
            button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to cart`;
          }
        });
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cart = cart.filter(item => item.id !== id);
          // console.log(cart);

          this.setCartValues(cart);
          Storage.saveCart(cart);
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          const buttons = [...document.querySelectorAll(".btn")];
          buttons.forEach(button => {
            if (parseInt(button.dataset.id) === id) {
              button.disabled = false;
              button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to cart`;
            }
          });
        }
      }
    });
  }
  removeItem(id) {
    cart = cart.filter( item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id)
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to cart`;  
  }
  getSingleButton(id){
    return buttonsDOM.find(button => button.dataset.id === id ); 
  }
}



class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  

  // get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
