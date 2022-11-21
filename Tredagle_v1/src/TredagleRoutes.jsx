import { useState } from 'react'
import {Link, Router, Routes, Route} from 'react-router-dom';
import Home from './pages/home.jsx';

export default function TredagleRoutes() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  )
}