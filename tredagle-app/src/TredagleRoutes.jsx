import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/home.jsx'
import Chatroom from './pages/chatroom.jsx'
import { io } from 'socket.io-client'

const socket = io(`https://tredagle.herokuapp.com/`)
//const socket = io(`http://${window.location.hostname}:3007`)

export default function TredagleRoutes() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home  socket={socket}/> } />
        <Route path="/chatroom" element={<Chatroom  socket={socket}/> } />
      </Routes>
    </BrowserRouter>
  )
}