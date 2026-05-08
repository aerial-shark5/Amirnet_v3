import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Flashcards from './pages/Flashcards'
import SentenceCompletion from './pages/SentenceCompletion'
import Restatements from './pages/Restatements'
import ReadingComp from './pages/ReadingComp'
import MockTest from './pages/MockTest'
import Progress from './pages/Progress'
import AITutor from './pages/AITutor'
import Nav from './components/Nav'
import './index.css'

function AppInner() {
  const location = useLocation()
  const showNav = location.pathname !== '/'

  return (
    <div className="app">
      {showNav && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/sentence" element={<SentenceCompletion />} />
        <Route path="/restatements" element={<Restatements />} />
        <Route path="/reading" element={<ReadingComp />} />
        <Route path="/mock" element={<MockTest />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/tutor" element={<AITutor />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
