import { useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col  } from 'react-bootstrap';
import Home from './Home';
import Video_Chat from './Video_chat';
import { HashRouter as Router, Route, Routes} from 'react-router-dom'

function App() {

  return (
    <Container>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video_chat" element={<Video_Chat />} />  
      </Routes>
    </Router>
    </Container>
  )
}

export default App
