import { useState } from 'react'
import './App.css'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import Hero from './components/Hero'
import VideoSection from './components/VideoSection'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Hero></Hero>
      <VideoSection></VideoSection>
      <Footer></Footer>
    </>
  )
}

export default App
