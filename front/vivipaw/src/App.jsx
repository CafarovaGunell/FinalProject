import React from 'react'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router/router'
import { AuthProvider } from "./home/context/AuthContext";
import { WishlistProvider } from "./home/context/WishlistContext"; // 1. Mütləq import edin

function App() {
  return (
    <AuthProvider>
      <WishlistProvider> {/* 2. Bura əlavə edildi */}
        <RouterProvider router={router}/>
      </WishlistProvider>
    </AuthProvider>
  )
}

export default App