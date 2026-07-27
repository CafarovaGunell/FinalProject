import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './home/context/AuthContext';
import { WishlistProvider } from './home/context/WishlistContext';
import { CartProvider } from './home/context/CartContext';
import { router } from './routes/router';

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}