import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

interface CartFormatted extends Product {
  priceFormatted: string;
  subTotal: string;
}

const Cart = (): JSX.Element => {
   const { cart, removeProduct, updateProductAmount } = useCart();

   const cartFormatted = cart.map(product => {
     return {id: product.id, 
      title: product.title,
      amount: product.amount,
      price: product.price,
      image: product.image,
      subTotal: formatPrice(product.price * product.amount),
      priceFormatted: formatPrice(product.price)
    }
   }) as CartFormatted[];

   const total =
     formatPrice(
       cart.reduce((sumTotal, product) => {
         return sumTotal + product.price
       }, 0)
     )

  function handleProductIncrement(product: Product) {
    let update : UpdateProductAmount
    update = { productId: product.id, amount: (product.amount+1)}
    updateProductAmount(update);
  }

  function handleProductDecrement(product: Product) {
    let update : UpdateProductAmount
    update = { productId: product.id, amount: (product.amount-1)}
    updateProductAmount(update);
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>

        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
        {cartFormatted.map(cart=>(
          <tr key={cart.id}  data-testid="product">
            <td>
              <img src={cart.image} alt={cart.title}/>
            </td>
            <td>
              <strong>{cart.title}</strong>
              <span>{cart.priceFormatted}</span>
            </td>
            <td>
              <div>
                <button
                  type="button"
                  data-testid="decrement-product"
                 disabled={cart.amount <= 1}
                 onClick={() => handleProductDecrement(cart)}
                >
                  <MdRemoveCircleOutline size={20} />
                </button>
                <input
                  type="text"
                  data-testid="product-amount"
                  readOnly
                  value={cart.amount}
                />
                <button
                  type="button"
                  data-testid="increment-product"
                  onClick={() => handleProductIncrement(cart)}
                >
                  <MdAddCircleOutline size={20} />
                </button>
              </div>
            </td>
            <td>
              <strong>{cart.subTotal}</strong>
            </td>
            <td>
              <button
                type="button"
                data-testid="remove-product"
                onClick={() => handleRemoveProduct(cart.id)}
              >
                <MdDelete size={20} />
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
