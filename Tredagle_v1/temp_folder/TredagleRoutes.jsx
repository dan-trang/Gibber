import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container} from 'react-bootstrap';
import { HashRouter as Router, Route, Routes} from 'react-router-dom'

import './pages/styles/App.css'
import Home from './pages/home.jsx';
import Chatroom from './pages/chatroom.jsx';

function TredagleRoutes() {

  return (
    <Container>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chatroom" element={<Chatroom />} />  
      </Routes>
    </Router>
    </Container>
  )
}

export default TredagleRoutes
