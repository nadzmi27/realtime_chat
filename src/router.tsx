"use client"
import { createBrowserRouter, Outlet } from "react-router-dom";
import App from "./App";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Dashboard from "./components/Dashboard";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import NewRoomPage from "./components/newRoom";
import RoomPage from "./components/RoomPage";
import { Toaster } from "sonner";


function RootLayout() {
  return (
    <>
      <Navigation />
      <Outlet />
      <Toaster />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/signup", element: <Signup /> },
      { path: "/signin", element: <Signin /> },

      // Protected Route
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          {
            path: "/rooms/new",
            element: <NewRoomPage />,
          },
          {
            path: "/rooms/:roomId", element: <RoomPage />
          }
        ],
      },
    ],
  },
]);
