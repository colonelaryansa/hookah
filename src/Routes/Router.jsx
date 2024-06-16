import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Root from "../Components/Root/Root";
import Create from '../Components/Location/Create'
import NeighbourIndex from '../Components/Neighbour/Index'
import Edit from '../Components/Location/Edit'
import Show from '../Components/Location/Show'
import Explore from '../Components/Explore/Explore'
import Home from "../Components/Home/Home";
import Index from "../Components/Location/Index";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "/list",
                element: <Index />,
            },
            {

                path: "/location/create",
                element: <Create />,
            },
            {
                path: "/location/:locationId/edit",
                element: <Edit />,
            },
            {
                path: "/location/:locationId",
                element: <Show />,
            },
            {
                path: "/explore",
                element: <Explore />,
            },
            {
                path: "/neighbour",
                element: <NeighbourIndex />,
            },
        ],
    },
]);

export default function Router() {
    return <RouterProvider router={router} />
}
