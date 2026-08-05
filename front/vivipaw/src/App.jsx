import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './home/context/AuthContext';
import { ChatProvider } from './home/context/ChatContext';
import { WishlistProvider } from './home/context/WishlistContext';
import { CartProvider } from './home/context/CartContext';
import { router } from './routes/router';

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <WishlistProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </WishlistProvider>
      </ChatProvider>
    </AuthProvider>
  );
}