import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {

  const [cart, setCart] = useState<Product[]>(() => {
   const storagedCart = localStorage.getItem('@RocketShoes:cart');

     if(storagedCart) {
       return JSON.parse(storagedCart);
       }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
       const product = (await api.get<Product>(`/products/${productId}`)).data;
       const stock = (await api.get<Stock>(`/stock/${productId}`)).data;
      if (cart) {
        var isExist = cart.filter(x => x.id === productId).length>0;
        if(isExist) {
          let projectNew =  cart.find(x => x.id === productId)?.amount;
          if((projectNew === null ? 0 : 1) + 1 > stock.amount ){
            toast.error('Quantidade solicitada fora de estoque');
            return;
          }
          var newArray = cart.map(element  => {
            if(element.id === productId ){
              element.amount= element.amount + 1;
            }
            return element
          });
          setCart(newArray);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newArray));
        }else {
          const newProduct = product;
          newProduct.amount = 1;
          const newList = [...cart, newProduct];
          setCart(newList)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newList));
        }
      } else {
        const newProduct = product;
        newProduct.amount = 1;
        const newList = [...cart, newProduct];
        setCart(newList)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newList));
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      if (cart) {
        var isExist = cart.filter(x => x.id === productId).length>0;
        if(!isExist) {
          throw new Error('Produto não existe');
        }
        var newArray = cart.filter(element  => element.id !== productId);
        setCart(newArray);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newArray));
      } 
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount <= 0){
        throw new Error('Amount inválido');
      }
      let stock = await api.get<Stock>(`/stock/${productId}`);
      if (cart) {
        var isExist = cart.filter(x => x.id === productId).length>0;
        if(isExist) {
          let projectNew =  cart.find(x => x.id === productId)?.amount;
          if((projectNew === null ? 0 : 1) + amount > stock.data.amount){
            toast.error('Quantidade solicitada fora de estoque');
            return;
          }
          var newArray = cart.map(element  => {
            if(element.id === productId){
              element.amount = amount
            }
            return element
          });
          setCart(newArray);
        }
      } 
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
