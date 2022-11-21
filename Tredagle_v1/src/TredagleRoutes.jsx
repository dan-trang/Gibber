import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/home.jsx'
import Chatroom from './pages/chatroom.jsx'

export default function TredagleRoutes() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/chatroom" element={<Chatroom/>} />
      </Routes>
    </BrowserRouter>
  )
}