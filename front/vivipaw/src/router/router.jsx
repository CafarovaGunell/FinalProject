import { createBrowserRouter } from "react-router";
import Layout from "../home/layout/layout";
import Home from "../home/pages/home";
import Adopt from "../home/pages/adopt";
import PetCare from "../home/pages/petcare";
import About from "../home/pages/about";
import Wishlist from "../home/pages/wishlist";



export const router=createBrowserRouter([
     {
        element:<Layout/>,
        path:"/",
        children:[
            {
                element:<Home/>,
                index:true
            },
            {
                element:<Adopt/>,
                path:"adopt"
            },
            {
                element:<PetCare/>,
                path:"petcare"
            },
            {
                element:<About/>,
                path:"about"
            },
            {
                element:<Wishlist/>,
                path:"wishlist"
            }                
            
        ]
     }
])